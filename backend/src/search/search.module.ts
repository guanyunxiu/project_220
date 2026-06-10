import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Work } from '../entities/work.entity';
import { Chapter } from '../entities/chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Work, Chapter])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
