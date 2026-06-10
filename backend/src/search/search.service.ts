import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, Like } from 'typeorm';
import { Work, WorkStatus, WorkType } from '../entities/work.entity';
import { Chapter, ChapterStatus } from '../entities/chapter.entity';
import {
  SearchQueryDto,
  SearchIndexType,
  SearchResult,
} from './dto/search.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {
    this.logger.log('SearchService initialized (database-backed)');
  }

  async search(query: SearchQueryDto): Promise<SearchResult<any>> {
    const { q, type, page, pageSize, workType, category, tag } = query;
    const startTime = Date.now();

    try {
      const results: SearchResult<any> = {
        hits: [],
        totalHits: 0,
        totalPages: 0,
        page,
        pageSize,
        processingTimeMs: 0,
      };

      if (!q || q.trim().length === 0) {
        results.processingTimeMs = Date.now() - startTime;
        return results;
      }

      const searchKeyword = `%${q}%`;

      if (!type || type === SearchIndexType.WORKS) {
        const workQueryBuilder = this.workRepository
          .createQueryBuilder('work')
          .leftJoinAndSelect('work.author', 'author')
          .where('work.status = :status', { status: WorkStatus.PUBLISHED })
          .andWhere(
            new Brackets((qb) => {
              qb.where('work.title LIKE :keyword', { keyword: searchKeyword })
                .orWhere('work.description LIKE :keyword', { keyword: searchKeyword })
                .orWhere('work.tags LIKE :keyword', { keyword: searchKeyword })
                .orWhere('work.categories LIKE :keyword', { keyword: searchKeyword })
                .orWhere('author.nickname LIKE :keyword', { keyword: searchKeyword });
            }),
          );

        if (workType) {
          workQueryBuilder.andWhere('work.type = :workType', { workType });
        }

        if (category) {
          workQueryBuilder.andWhere('work.categories LIKE :category', {
            category: `%${category}%`,
          });
        }

        if (tag) {
          workQueryBuilder.andWhere('work.tags LIKE :tag', { tag: `%${tag}%` });
        }

        const [works, workTotal] = await workQueryBuilder
          .skip((page - 1) * pageSize)
          .take(pageSize)
          .orderBy('work.hotScore', 'DESC')
          .addOrderBy('work.totalViews', 'DESC')
          .getManyAndCount();

        results.hits.push(
          ...works.map((w) => ({
            ...w,
            _type: 'work',
            authorName: w.author?.nickname || w.author?.username || '',
          })),
        );
        results.totalHits += workTotal;
      }

      if (type === SearchIndexType.CHAPTERS) {
        const chapterQueryBuilder = this.chapterRepository
          .createQueryBuilder('chapter')
          .leftJoinAndSelect('chapter.work', 'work')
          .where('chapter.status = :status', { status: ChapterStatus.PUBLISHED })
          .andWhere(
            new Brackets((qb) => {
              qb.where('chapter.title LIKE :keyword', { keyword: searchKeyword })
                .orWhere('chapter.summary LIKE :keyword', { keyword: searchKeyword })
                .orWhere('chapter.content LIKE :keyword', { keyword: searchKeyword });
            }),
          );

        const [chapters, chapterTotal] = await chapterQueryBuilder
          .skip((page - 1) * pageSize)
          .take(pageSize)
          .orderBy('chapter.views', 'DESC')
          .addOrderBy('chapter.publishedAt', 'DESC')
          .getManyAndCount();

        results.hits.push(
          ...chapters.map((c) => ({
            ...c,
            _type: 'chapter',
            workTitle: c.work?.title || '',
          })),
        );
        results.totalHits += chapterTotal;
      }

      results.totalPages = Math.ceil(results.totalHits / pageSize) || 1;
      results.processingTimeMs = Date.now() - startTime;

      return results;
    } catch (error) {
      this.logger.error('Search failed', error);
      throw new BadRequestException('搜索服务暂时不可用');
    }
  }

  async reindexWorks(): Promise<void> {
    this.logger.log('Reindex works - no-op for database-backed search');
  }

  async reindexChapters(): Promise<void> {
    this.logger.log('Reindex chapters - no-op for database-backed search');
  }

  async reindexAll(): Promise<void> {
    this.logger.log('Reindex all - no-op for database-backed search');
  }

  async indexWork(workId: string): Promise<void> {
    this.logger.debug(`Index work ${workId} - no-op for database-backed search`);
  }

  async indexChapter(chapterId: string): Promise<void> {
    this.logger.debug(`Index chapter ${chapterId} - no-op for database-backed search`);
  }
}
