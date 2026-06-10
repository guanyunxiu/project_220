import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, Brackets } from 'typeorm';
import { ReadingHistory } from '../entities/reading-history.entity';
import { Work } from '../entities/work.entity';
import { Chapter } from '../entities/chapter.entity';
import {
  CreateReadingHistoryDto,
  UpdateReadingHistoryDto,
  QueryReadingHistoryDto,
} from './dto/reading-history.dto';
import {
  PaginationResultDto,
  createPaginationResult,
} from '../common/dto/pagination.dto';

@Injectable()
export class ReadingHistoryService {
  constructor(
    @InjectRepository(ReadingHistory)
    private readonly readingHistoryRepository: Repository<ReadingHistory>,
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}

  async create(
    userId: string,
    createDto: CreateReadingHistoryDto,
    ipAddress: string,
    userAgent: string,
    device?: string,
  ): Promise<ReadingHistory> {
    const { workId, chapterId } = createDto;

    const work = await this.workRepository.findOne({ where: { id: workId } });
    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
    });
    if (!chapter || chapter.workId !== workId) {
      throw new BadRequestException('章节不存在或不属于该作品');
    }

    const existing = await this.readingHistoryRepository.findOne({
      where: { userId, workId, chapterId },
    });

    if (existing) {
      return this.update(userId, existing.id, createDto);
    }

    const history = this.readingHistoryRepository.create({
      userId,
      workId,
      chapterId,
      page: createDto.page || 0,
      totalPages: createDto.totalPages || 0,
      scrollPosition: createDto.scrollPosition || 0,
      readPercent: createDto.readPercent || 0,
      secondsSpent: createDto.secondsSpent || 0,
      isCompleted: createDto.isCompleted || false,
      startedAt: new Date(),
      ipAddress,
      userAgent,
      device: device || null,
    });

    const saved = await this.readingHistoryRepository.save(history);
    await this.workRepository.increment({ id: workId }, 'totalViews', 1);
    await this.chapterRepository.increment({ id: chapterId }, 'views', 1);
    return this.findById(saved.id);
  }

  async update(
    userId: string,
    id: string,
    updateDto: UpdateReadingHistoryDto,
  ): Promise<ReadingHistory> {
    const history = await this.findById(id);

    if (history.userId !== userId) {
      throw new NotFoundException('阅读记录不存在');
    }

    const wasCompleted = history.isCompleted;

    await this.readingHistoryRepository.update(id, {
      ...updateDto,
      finishedAt: updateDto.isCompleted && !wasCompleted ? new Date() : history.finishedAt,
    });

    return this.findById(id);
  }

  async findAll(
    userId: string,
    queryDto: QueryReadingHistoryDto,
  ): Promise<PaginationResultDto<ReadingHistory>> {
    const { page, pageSize, sortBy, sortOrder, workId, chapterId } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.readingHistoryRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.work', 'work')
      .leftJoinAndSelect('history.chapter', 'chapter')
      .where('history.userId = :userId', { userId });

    if (workId) {
      queryBuilder.andWhere('history.workId = :workId', { workId });
    }

    if (chapterId) {
      queryBuilder.andWhere('history.chapterId = :chapterId', { chapterId });
    }

    const validSortFields = ['createdAt', 'updatedAt', 'readPercent', 'secondsSpent'];
    const sortField = validSortFields.includes(sortBy)
      ? `history.${sortBy}`
      : 'history.updatedAt';
    queryBuilder.orderBy(sortField, sortOrder);

    queryBuilder.skip(skip).take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return createPaginationResult(items, total, page, pageSize);
  }

  async findById(id: string): Promise<ReadingHistory> {
    const history = await this.readingHistoryRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.work', 'work')
      .leftJoinAndSelect('history.chapter', 'chapter')
      .where('history.id = :id', { id })
      .getOne();

    if (!history) {
      throw new NotFoundException('阅读记录不存在');
    }
    return history;
  }

  async remove(userId: string, id: string): Promise<void> {
    const history = await this.findById(id);

    if (history.userId !== userId) {
      throw new NotFoundException('阅读记录不存在');
    }

    await this.readingHistoryRepository.delete(id);
  }

  async clear(userId: string, workId?: string): Promise<void> {
    const queryBuilder = this.readingHistoryRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId });

    if (workId) {
      queryBuilder.andWhere('workId = :workId', { workId });
    }

    await queryBuilder.execute();
  }

  async getContinueReading(
    userId: string,
    limit: number = 10,
  ): Promise<ReadingHistory[]> {
    return this.readingHistoryRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.work', 'work')
      .leftJoinAndSelect('history.chapter', 'chapter')
      .where('history.userId = :userId', { userId })
      .andWhere('history.isCompleted = :isCompleted', { isCompleted: false })
      .orderBy('history.updatedAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getLastRead(
    userId: string,
    workId: string,
  ): Promise<ReadingHistory | null> {
    return this.readingHistoryRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.chapter', 'chapter')
      .where('history.userId = :userId', { userId })
      .andWhere('history.workId = :workId', { workId })
      .orderBy('history.updatedAt', 'DESC')
      .getOne();
  }

  async getReadChapters(userId: string, workId: string): Promise<string[]> {
    const histories = await this.readingHistoryRepository
      .createQueryBuilder('history')
      .select('history.chapterId')
      .where('history.userId = :userId', { userId })
      .andWhere('history.workId = :workId', { workId })
      .andWhere('history.isCompleted = :isCompleted', { isCompleted: true })
      .getMany();

    return histories.map((h) => h.chapterId);
  }
}
