import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionType,
} from '../entities/subscription.entity';
import { Work } from '../entities/work.entity';
import { User } from '../entities/user.entity';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  QuerySubscriptionsDto,
} from './dto/subscriptions.dto';
import {
  PaginationResultDto,
  createPaginationResult,
} from '../common/dto/pagination.dto';

export interface UnreadUpdate {
  workId: string;
  hasUnread: boolean;
  lastUpdateAt: Date | null;
}

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async subscribe(
    userId: string,
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const { workId, type, amount, emailNotification } = createSubscriptionDto;

    const work = await this.workRepository.findOne({ where: { id: workId } });
    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    const existing = await this.subscriptionRepository.findOne({
      where: { userId, workId },
    });
    if (existing) {
      throw new ConflictException('已经订阅过该作品');
    }

    const subscription = this.subscriptionRepository.create({
      userId,
      workId,
      type: type || SubscriptionType.FREE,
      amount: amount || 0,
      status: SubscriptionStatus.ACTIVE,
      emailNotification: emailNotification !== undefined ? emailNotification : true,
      startDate: new Date(),
    });

    const saved = await this.subscriptionRepository.save(subscription);

    await this.workRepository.increment({ id: workId }, 'totalSubscriptions', 1);

    await this.userRepository.increment({ id: userId }, 'totalFollowing', 1);
    await this.userRepository.increment({ id: work.authorId }, 'totalFollowers', 1);

    return this.findById(saved.id);
  }

  async unsubscribe(userId: string, workId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, workId },
    });
    if (!subscription) {
      throw new NotFoundException('未订阅该作品');
    }

    const work = subscription.work;
    const authorId = work?.authorId;

    await this.subscriptionRepository.update(subscription.id, {
      status: SubscriptionStatus.CANCELLED,
      endDate: new Date(),
    });

    await this.workRepository.decrement({ id: workId }, 'totalSubscriptions', 1);

    await this.userRepository.decrement({ id: userId }, 'totalFollowing', 1);
    if (authorId) {
      await this.userRepository.decrement({ id: authorId }, 'totalFollowers', 1);
    }
  }

  async findAll(
    userId: string,
    querySubscriptionsDto: QuerySubscriptionsDto,
  ): Promise<PaginationResultDto<Subscription>> {
    const { page, pageSize, sortBy, sortOrder, keyword, workId, type, status } =
      querySubscriptionsDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.work', 'work')
      .leftJoinAndSelect('work.author', 'author')
      .where('subscription.userId = :userId', { userId });

    if (workId) {
      queryBuilder.andWhere('subscription.workId = :workId', { workId });
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('work.title LIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    if (type) {
      queryBuilder.andWhere('subscription.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('subscription.status = :status', { status });
    } else {
      queryBuilder.andWhere('subscription.status = :status', {
        status: SubscriptionStatus.ACTIVE,
      });
    }

    const validSortFields = ['createdAt', 'updatedAt', 'startDate', 'endDate'];
    const sortField = validSortFields.includes(sortBy)
      ? `subscription.${sortBy}`
      : 'subscription.createdAt';
    queryBuilder.orderBy(sortField, sortOrder);

    queryBuilder.skip(skip).take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return createPaginationResult(items, total, page, pageSize);
  }

  async findById(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.work', 'work')
      .leftJoinAndSelect('work.author', 'author')
      .where('subscription.id = :id', { id })
      .getOne();

    if (!subscription) {
      throw new NotFoundException('订阅不存在');
    }
    return subscription;
  }

  async checkSubscription(userId: string, workId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        userId,
        workId,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }

  async getUnreadUpdates(userId: string): Promise<UnreadUpdate[]> {
    const subscriptions = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.work', 'work')
      .where('subscription.userId = :userId', { userId })
      .andWhere('subscription.status = :status', {
        status: SubscriptionStatus.ACTIVE,
      })
      .getMany();

    const result: UnreadUpdate[] = [];

    for (const sub of subscriptions) {
      const lastUpdateAt = sub.work?.lastUpdatedAt || sub.work?.updatedAt;
      const hasUnread = lastUpdateAt
        ? lastUpdateAt > sub.updatedAt
        : false;

      result.push({
        workId: sub.workId,
        hasUnread,
        lastUpdateAt,
      });
    }

    return result;
  }

  async getSubscriberCount(workId: string): Promise<number> {
    return this.subscriptionRepository.count({
      where: {
        workId,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.findById(id);

    if (subscription.userId !== userId) {
      throw new BadRequestException('没有权限修改此订阅');
    }

    await this.subscriptionRepository.update(id, updateSubscriptionDto);
    return this.findById(id);
  }
}
