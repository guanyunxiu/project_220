import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from '../entities/notification.entity';
import {
  CreateNotificationDto,
  QueryNotificationsDto,
  MarkReadDto,
  UnreadCount,
} from './dto/notifications.dto';
import {
  PaginationResultDto,
  createPaginationResult,
} from '../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectQueue('novel-queue')
    private readonly queue: Queue,
  ) {}

  async create(
    createDto: CreateNotificationDto,
  ): Promise<Notification[]> {
    const {
      userIds,
      senderId,
      type,
      priority,
      title,
      content,
      imageUrl,
      linkUrl,
      relatedId,
      relatedType,
      pushNow,
    } = createDto;

    const notifications: Notification[] = [];

    for (const userId of userIds) {
      const notification = this.notificationRepository.create({
        userId,
        senderId: senderId || null,
        type: type || NotificationType.SYSTEM,
        priority: priority || NotificationPriority.NORMAL,
        title,
        content: content || null,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        relatedId: relatedId || null,
        relatedType: relatedType || null,
        isRead: false,
        isDeleted: false,
        isPinned: false,
      });

      notifications.push(notification);
    }

    const saved = await this.notificationRepository.save(notifications);

    if (pushNow) {
      for (const notification of saved) {
        await this.queue.add('send-notification', {
          notificationId: notification.id,
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          content: notification.content,
          priority: notification.priority,
        });
      }
    }

    return saved;
  }

  async findAll(
    userId: string,
    queryDto: QueryNotificationsDto,
  ): Promise<PaginationResultDto<Notification>> {
    const { page, pageSize, sortBy, sortOrder, keyword, type, isRead, priority } =
      queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.isDeleted = :isDeleted', { isDeleted: false });

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('notification.title LIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('notification.content LIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
    }

    if (priority) {
      queryBuilder.andWhere('notification.priority = :priority', { priority });
    }

    const validSortFields = ['createdAt', 'isRead', 'priority'];
    const sortField = validSortFields.includes(sortBy)
      ? `notification.${sortBy}`
      : 'notification.isPinned';
    queryBuilder.orderBy(sortField, sortOrder);
    queryBuilder.addOrderBy('notification.createdAt', 'DESC');

    queryBuilder.skip(skip).take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return createPaginationResult(items, total, page, pageSize);
  }

  async findById(userId: string, id: string): Promise<Notification> {
    const notification = await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.id = :id', { id })
      .getOne();

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('没有权限查看此通知');
    }

    if (!notification.isRead) {
      await this.notificationRepository.update(id, {
        isRead: true,
        readAt: new Date(),
      });
      notification.isRead = true;
      notification.readAt = new Date();
    }

    return notification;
  }

  async markRead(
    userId: string,
    markReadDto: MarkReadDto,
  ): Promise<void> {
    const { ids } = markReadDto;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true, readAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false });

    if (ids && ids.length > 0) {
      queryBuilder.andWhere('id IN (:...ids)', { ids });
    }

    await queryBuilder.execute();
  }

  async remove(userId: string, id: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('没有权限删除此通知');
    }

    await this.notificationRepository.update(id, { isDeleted: true });
  }

  async clearAll(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isDeleted: true })
      .where('userId = :userId', { userId })
      .execute();
  }

  async getUnreadCount(userId: string): Promise<UnreadCount> {
    const unread = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.isRead = :isRead', { isRead: false })
      .andWhere('notification.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy('notification.type')
      .getRawMany();

    const byType: Record<string, number> = {};
    let total = 0;

    for (const item of unread) {
      const count = parseInt(item.count, 10);
      byType[item.type] = count;
      total += count;
    }

    return { total, byType };
  }

  async queueNotification(notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });
    if (!notification) return;

    await this.queue.add('send-notification', {
      notificationId: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      priority: notification.priority,
    });
  }
}
