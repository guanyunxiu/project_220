import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingHistoryService } from './reading-history.service';
import { ReadingHistoryController } from './reading-history.controller';
import { ReadingHistory } from '../entities/reading-history.entity';
import { Work } from '../entities/work.entity';
import { Chapter } from '../entities/chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReadingHistory, Work, Chapter])],
  controllers: [ReadingHistoryController],
  providers: [ReadingHistoryService],
  exports: [ReadingHistoryService],
})
export class ReadingHistoryModule {}
