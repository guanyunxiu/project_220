import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { Chapter } from '../entities/chapter.entity';
import { Work } from '../entities/work.entity';
import { Volume } from '../entities/volume.entity';
import { User } from '../entities/user.entity';
import { Subscription } from '../entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chapter, Work, Volume, User, Subscription]),
    ScheduleModule.forRoot(),
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService],
  exports: [ChaptersService],
})
export class ChaptersModule {}
