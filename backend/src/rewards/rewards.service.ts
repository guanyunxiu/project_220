import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, Brackets } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Reward, RewardStatus } from '../entities/reward.entity';
import { Work } from '../entities/work.entity';
import { User } from '../entities/user.entity';
import { Chapter, ChapterAccess } from '../entities/chapter.entity';
import {
  CreateRewardDto,
  QueryRewardsDto,
  RewardRankQueryDto,
  RewardRankItem,
  RewardRankType,
} from './dto/rewards.dto';
import {
  PaginationResultDto,
  createPaginationResult,
} from '../common/dto/pagination.dto';
import { SortOrder } from '../common/dto/pagination.dto';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectQueue('novel-queue')
    private readonly queue: Queue,
  ) {}

  async create(
    userId: string,
    createRewardDto: CreateRewardDto,
    ipAddress: string,
  ): Promise<Reward> {
    const { workId, chapterId, amount, giftType, giftQuantity, isAnonymous, message } =
      createRewardDto;

    const work = await this.workRepository.findOne({ where: { id: workId } });
    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    if (chapterId) {
      const chapter = await this.chapterRepository.findOne({
        where: { id: chapterId },
      });
      if (!chapter || chapter.workId !== workId) {
        throw new BadRequestException('章节不存在或不属于该作品');
      }
    }

    const reward = this.rewardRepository.create({
      userId,
      workId,
      chapterId: chapterId || null,
      amount,
      currency: createRewardDto.currency || 'CNY',
      giftType: giftType || null,
      giftQuantity: giftQuantity || 1,
      isAnonymous: isAnonymous || false,
      message: message || null,
      status: RewardStatus.PENDING,
      ipAddress,
    });

    const savedReward = await this.rewardRepository.save(reward);

    await this.queue.add('process-reward', {
      rewardId: savedReward.id,
      userId,
      workId,
      chapterId,
      amount,
      authorId: work.authorId,
    });

    return this.findById(savedReward.id);
  }

  async completeReward(rewardId: string): Promise<void> {
    const reward = await this.rewardRepository.findOne({
      where: { id: rewardId },
    });
    if (!reward || reward.status === RewardStatus.COMPLETED) {
      return;
    }

    await this.rewardRepository.update(rewardId, {
      status: RewardStatus.COMPLETED,
      paidAt: new Date(),
    });

    await this.workRepository
      .createQueryBuilder()
      .update(Work)
      .set({
        totalRewards: () => 'totalRewards + 1',
        totalRewardAmount: () => `totalRewardAmount + ${reward.amount}`,
      })
      .where('id = :id', { id: reward.workId })
      .execute();

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ balance: () => `balance + ${reward.amount * 0.7}` })
      .where('id = :id', { id: reward.workId })
      .execute();
  }

  async findAll(
    queryRewardsDto: QueryRewardsDto,
  ): Promise<PaginationResultDto<Reward>> {
    const { page, pageSize, sortBy, sortOrder, userId, workId, chapterId, status } =
      queryRewardsDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.rewardRepository
      .createQueryBuilder('reward')
      .leftJoinAndSelect('reward.user', 'user')
      .leftJoinAndSelect('reward.work', 'work');

    if (userId) {
      queryBuilder.andWhere('reward.userId = :userId', { userId });
    }

    if (workId) {
      queryBuilder.andWhere('reward.workId = :workId', { workId });
    }

    if (chapterId) {
      queryBuilder.andWhere('reward.chapterId = :chapterId', { chapterId });
    }

    if (status) {
      queryBuilder.andWhere('reward.status = :status', { status });
    }

    const validSortFields = ['createdAt', 'amount'];
    const sortField = validSortFields.includes(sortBy)
      ? `reward.${sortBy}`
      : 'reward.createdAt';
    queryBuilder.orderBy(sortField, sortOrder);

    queryBuilder.skip(skip).take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return createPaginationResult(items, total, page, pageSize);
  }

  async findById(id: string): Promise<Reward> {
    const reward = await this.rewardRepository
      .createQueryBuilder('reward')
      .leftJoinAndSelect('reward.user', 'user')
      .leftJoinAndSelect('reward.work', 'work')
      .where('reward.id = :id', { id })
      .getOne();

    if (!reward) {
      throw new NotFoundException('打赏记录不存在');
    }
    return reward;
  }

  async getRank(rankQuery: RewardRankQueryDto): Promise<RewardRankItem[]> {
    const { type, workId, limit } = rankQuery;

    let startDate: Date;
    const now = new Date();

    switch (type) {
      case RewardRankType.DAILY:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case RewardRankType.WEEKLY:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case RewardRankType.ALL:
      default:
        startDate = new Date(0);
    }

    const queryBuilder = this.rewardRepository
      .createQueryBuilder('reward')
      .leftJoin(User, 'user', 'user.id = reward.userId')
      .select([
        'reward.userId as userId',
        'user.username as username',
        'user.nickname as nickname',
        'user.avatar as avatar',
        'SUM(reward.amount) as totalAmount',
      ])
      .where('reward.status = :status', { status: RewardStatus.COMPLETED })
      .andWhere('reward.createdAt >= :startDate', { startDate })
      .groupBy('reward.userId')
      .addOrderBy('totalAmount', 'DESC')
      .limit(limit);

    if (workId) {
      queryBuilder.andWhere('reward.workId = :workId', { workId });
    }

    const results = await queryBuilder.getRawMany();

    return results.map((item, index) => ({
      userId: item.userid,
      username: item.username,
      nickname: item.nickname,
      avatar: item.avatar,
      totalAmount: parseFloat(item.totalamount || 0),
      rank: index + 1,
    }));
  }

  async getMyRewards(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationResultDto<Reward>> {
    return this.findAll({
      page,
      pageSize,
      userId,
      sortBy: 'createdAt',
      sortOrder: SortOrder.DESC,
    });
  }

  async getWorkRewards(
    workId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationResultDto<Reward>> {
    return this.findAll({
      page,
      pageSize,
      workId,
      sortBy: 'createdAt',
      sortOrder: SortOrder.DESC,
    });
  }

  async checkUnlockedChapters(
    userId: string,
    workId: string,
  ): Promise<string[]> {
    const rewards = await this.rewardRepository
      .createQueryBuilder('reward')
      .where('reward.userId = :userId', { userId })
      .andWhere('reward.workId = :workId', { workId })
      .andWhere('reward.chapterId IS NOT NULL')
      .andWhere('reward.status = :status', { status: RewardStatus.COMPLETED })
      .getMany();

    return rewards.map((r) => r.chapterId!).filter(Boolean);
  }
}
