import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { Reward } from '../entities/reward.entity';
import { Work } from '../entities/work.entity';
import { User } from '../entities/user.entity';
import { Chapter } from '../entities/chapter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reward, Work, User, Chapter]),
    BullModule.registerQueue({ name: 'novel-queue' }),
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
