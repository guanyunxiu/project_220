import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueProcessorService } from './queue-processor.service';
import { RewardsService } from '../rewards/rewards.service';
import { RewardsModule } from '../rewards/rewards.module';
import { Notification } from '../entities/notification.entity';
import { Reward } from '../entities/reward.entity';
import { Work } from '../entities/work.entity';
import { User } from '../entities/user.entity';
import { Chapter } from '../entities/chapter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Reward, Work, User, Chapter]),
    BullModule.registerQueue({ name: 'novel-queue' }),
    RewardsModule,
  ],
  providers: [QueueProcessorService, RewardsService],
  exports: [QueueProcessorService],
})
export class QueueModule {}
