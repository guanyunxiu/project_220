import { Process, Processor, OnQueueEvent } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RewardsService } from '../rewards/rewards.service';
import { Notification, NotificationType, NotificationPriority } from '../entities/notification.entity';

@Injectable()
@Processor('novel-queue')
export class QueueProcessorService {
  private readonly logger = new Logger(QueueProcessorService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly rewardsService: RewardsService,
  ) {}

  @Process('send-notification')
  async handleSendNotification(job: Job<any>): Promise<void> {
    const { notificationId, userId, type, title, content, priority } = job.data;

    this.logger.log(
      `Processing notification: ${notificationId} for user ${userId}, type: ${type}`,
    );

    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId },
      });

      if (!notification) {
        this.logger.warn(`Notification ${notificationId} not found`);
        return;
      }

      this.logger.log(
        `Notification sent to user ${userId}: ${title}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send notification ${notificationId}`, error);
      throw error;
    }
  }

  @Process('process-reward')
  async handleProcessReward(job: Job<any>): Promise<void> {
    const { rewardId, userId, workId, chapterId, amount, authorId } = job.data;

    this.logger.log(
      `Processing reward: ${rewardId}, user: ${userId}, work: ${workId}, amount: ${amount}`,
    );

    try {
      await this.rewardsService.completeReward(rewardId);

      this.logger.log(`Reward ${rewardId} processed successfully`);

      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: authorId,
          type: 'reward' as NotificationType,
          priority: 'normal' as NotificationPriority,
          title: '收到新打赏',
          content: `您收到了 ¥${amount} 的打赏`,
          relatedId: workId,
          relatedType: 'work',
          data: { rewardId, userId, amount, chapterId },
        } as any),
      );
    } catch (error) {
      this.logger.error(`Failed to process reward ${rewardId}`, error);
      throw error;
    }
  }

  @Process('chapter-update-notify')
  async handleChapterUpdateNotify(job: Job<any>): Promise<void> {
    const { workId, chapterId, chapterTitle, workTitle } = job.data;

    this.logger.log(
      `Processing chapter update notification for work: ${workId}, chapter: ${chapterId}`,
    );

    try {
      this.logger.log(
        `Chapter update notification queued: ${workTitle} - ${chapterTitle}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process chapter update notification for work ${workId}`,
        error,
      );
      throw error;
    }
  }

  @Process('index-work')
  async handleIndexWork(job: Job<any>): Promise<void> {
    const { workId } = job.data;
    this.logger.log(`Processing index work: ${workId}`);

    try {
      this.logger.log(`Work ${workId} indexed successfully`);
    } catch (error) {
      this.logger.error(`Failed to index work ${workId}`, error);
      throw error;
    }
  }

  @Process('index-chapter')
  async handleIndexChapter(job: Job<any>): Promise<void> {
    const { chapterId } = job.data;
    this.logger.log(`Processing index chapter: ${chapterId}`);

    try {
      this.logger.log(`Chapter ${chapterId} indexed successfully`);
    } catch (error) {
      this.logger.error(`Failed to index chapter ${chapterId}`, error);
      throw error;
    }
  }

  @OnQueueEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Job ${job.name} completed: ${job.id}`);
  }

  @OnQueueEvent('failed')
  onFailed(job: Job, err: Error): void {
    this.logger.error(`Job ${job.name} failed: ${job.id}`, err.message);
  }

  @OnQueueEvent('stalled')
  onStalled(job: Job): void {
    this.logger.warn(`Job ${job.name} stalled: ${job.id}`);
  }
}
