import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, MoreThan, LessThan, In, IsNull, QueryFailedError } from 'typeorm';
import { SchedulerRegistry, Cron } from '@nestjs/schedule';
import { Chapter, ChapterStatus, ChapterAccess } from '../entities/chapter.entity';
import { Work } from '../entities/work.entity';
import { Volume } from '../entities/volume.entity';
import { User, UserRole } from '../entities/user.entity';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import {
  CreateChapterDto,
  UpdateChapterDto,
  UpdateChapterStatusDto,
  QueryChaptersDto,
} from './dto/chapters.dto';
import {
  PaginationResultDto,
  createPaginationResult,
} from '../common/dto/pagination.dto';

export interface TocItem {
  id: string;
  volumeId: string | null;
  volumeTitle: string | null;
  title: string;
  order: number;
  status: ChapterStatus;
  access: ChapterAccess;
  price: number;
  wordCount: number;
  publishedAt: Date | null;
}

export interface TableOfContents {
  volumes: Array<{
    id: string;
    title: string;
    order: number;
    chapters: TocItem[];
  }>;
  noVolumeChapters: TocItem[];
}

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
    @InjectRepository(Volume)
    private readonly volumeRepository: Repository<Volume>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async findAll(queryChaptersDto: QueryChaptersDto): Promise<PaginationResultDto<Chapter>> {
    const {
      page,
      pageSize,
      sortBy,
      sortOrder,
      keyword,
      workId,
      volumeId,
      status,
      access,
      onlyPublished,
    } = queryChaptersDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.work', 'work')
      .leftJoinAndSelect('chapter.volume', 'volume');

    if (workId) {
      queryBuilder.andWhere('chapter.workId = :workId', { workId });
    }

    if (volumeId) {
      queryBuilder.andWhere('chapter.volumeId = :volumeId', { volumeId });
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('chapter.title LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('chapter.summary LIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    if (status) {
      queryBuilder.andWhere('chapter.status = :status', { status });
    } else if (onlyPublished) {
      queryBuilder.andWhere('chapter.status = :status', { status: ChapterStatus.PUBLISHED });
    }

    if (access) {
      queryBuilder.andWhere('chapter.access = :access', { access });
    }

    const validSortFields = ['order', 'createdAt', 'updatedAt', 'publishedAt', 'views', 'likes'];
    const sortField = validSortFields.includes(sortBy) ? `chapter.${sortBy}` : 'chapter.order';
    queryBuilder.orderBy(sortField, sortOrder);

    queryBuilder.skip(skip).take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return createPaginationResult(items, total, page, pageSize);
  }

  async findById(id: string, checkAccess = false, userId?: string): Promise<Chapter> {
    const chapter = await this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.work', 'work')
      .leftJoinAndSelect('chapter.volume', 'volume')
      .where('chapter.id = :id', { id })
      .getOne();

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    if (checkAccess && chapter.access !== ChapterAccess.FREE && userId) {
      const hasAccess = await this.checkChapterAccess(userId, chapter);
      if (!hasAccess) {
        chapter.content = null;
        chapter.contentHtml = null;
        (chapter as any).locked = true;
      }
    }

    return chapter;
  }

  async create(userId: string, userRole: UserRole, createChapterDto: CreateChapterDto): Promise<Chapter> {
    const work = await this.workRepository.findOne({ where: { id: createChapterDto.workId } });
    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    if (work.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限为此作品创建章节');
    }

    if (createChapterDto.volumeId) {
      const volume = await this.volumeRepository.findOne({
        where: { id: createChapterDto.volumeId },
      });
      if (!volume || volume.workId !== createChapterDto.workId) {
        throw new BadRequestException('卷不存在或不属于此作品');
      }
    }

    let order = createChapterDto.order;
    if (!order) {
      const maxOrder = await this.chapterRepository
        .createQueryBuilder('chapter')
        .select('MAX(chapter.order)', 'max')
        .where('chapter.workId = :workId', { workId: createChapterDto.workId })
        .getRawOne();
      order = (maxOrder?.max || 0) + 1;
    } else {
      await this.shiftOrders(createChapterDto.workId, order, null, 1);
    }

    const wordCount = createChapterDto.content
      ? this.countWords(createChapterDto.content)
      : 0;

    const chapter = this.chapterRepository.create({
      ...createChapterDto,
      order,
      wordCount,
      status: createChapterDto.scheduledAt
        ? ChapterStatus.PENDING
        : createChapterDto.status || ChapterStatus.DRAFT,
    });

    if (createChapterDto.scheduledAt) {
      this.scheduleChapterPublish(chapter.id, new Date(createChapterDto.scheduledAt));
    }

    const savedChapter = await this.chapterRepository.save(chapter);

    await this.workRepository.increment({ id: createChapterDto.workId }, 'totalChapters', 1);
    await this.workRepository
      .createQueryBuilder()
      .update(Work)
      .set({
        totalWords: () => `totalWords + ${wordCount}`,
        lastUpdatedAt: new Date(),
      })
      .where('id = :id', { id: createChapterDto.workId })
      .execute();

    if (createChapterDto.volumeId) {
      await this.volumeRepository.increment(
        { id: createChapterDto.volumeId },
        'totalChapters',
        1,
      );
      await this.volumeRepository
        .createQueryBuilder()
        .update(Volume)
        .set({ totalWords: () => `totalWords + ${wordCount}` })
        .where('id = :id', { id: createChapterDto.volumeId })
        .execute();
    }

    await this.updatePrevNextLinks(createChapterDto.workId);

    return this.findById(savedChapter.id);
  }

  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    updateChapterDto: UpdateChapterDto,
  ): Promise<Chapter> {
    const chapter = await this.findById(id);

    if (chapter.work.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限修改此章节');
    }

    const oldWordCount = chapter.wordCount;

    if (updateChapterDto.volumeId && updateChapterDto.volumeId !== chapter.volumeId) {
      if (chapter.volumeId) {
        await this.volumeRepository.decrement(
          { id: chapter.volumeId },
          'totalChapters',
          1,
        );
        await this.volumeRepository
          .createQueryBuilder()
          .update(Volume)
          .set({ totalWords: () => `totalWords - ${oldWordCount}` })
          .where('id = :id', { id: chapter.volumeId })
          .execute();
      }
      await this.volumeRepository.increment(
        { id: updateChapterDto.volumeId },
        'totalChapters',
        1,
      );
    }

    if (updateChapterDto.order !== undefined && updateChapterDto.order !== chapter.order) {
      await this.shiftOrders(chapter.workId, updateChapterDto.order, chapter.order, 0);
    }

    const updateData: any = { ...updateChapterDto };

    if (updateChapterDto.content !== undefined) {
      updateData.wordCount = this.countWords(updateChapterDto.content);
    }

    if (
      updateChapterDto.status === ChapterStatus.PUBLISHED &&
      chapter.status !== ChapterStatus.PUBLISHED
    ) {
      updateData.publishedAt = new Date();
    }

    if (updateChapterDto.scheduledAt && updateChapterDto.status !== ChapterStatus.PUBLISHED) {
      updateData.status = ChapterStatus.PENDING;
      this.scheduleChapterPublish(id, new Date(updateChapterDto.scheduledAt));
    }

    await this.chapterRepository.update(id, updateData);

    const newWordCount = updateData.wordCount || oldWordCount;
    const wordDiff = newWordCount - oldWordCount;

    if (wordDiff !== 0) {
      await this.workRepository
        .createQueryBuilder()
        .update(Work)
        .set({ totalWords: () => `totalWords + ${wordDiff}`, lastUpdatedAt: new Date() })
        .where('id = :id', { id: chapter.workId })
        .execute();

      const volumeId = updateChapterDto.volumeId || chapter.volumeId;
      if (volumeId) {
        await this.volumeRepository
          .createQueryBuilder()
          .update(Volume)
          .set({ totalWords: () => `totalWords + ${wordDiff}` })
          .where('id = :id', { id: volumeId })
          .execute();
      }
    }

    await this.updatePrevNextLinks(chapter.workId);

    return this.findById(id);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const chapter = await this.findById(id);

    if (chapter.work.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限删除此章节');
    }

    const wordCount = chapter.wordCount;

    await this.shiftOrders(chapter.workId, null, chapter.order, -1);

    await this.chapterRepository.delete(id);

    await this.workRepository.decrement({ id: chapter.workId }, 'totalChapters', 1);
    await this.workRepository
      .createQueryBuilder()
      .update(Work)
      .set({ totalWords: () => `totalWords - ${wordCount}`, lastUpdatedAt: new Date() })
      .where('id = :id', { id: chapter.workId })
      .execute();

    if (chapter.volumeId) {
      await this.volumeRepository.decrement(
        { id: chapter.volumeId },
        'totalChapters',
        1,
      );
      await this.volumeRepository
        .createQueryBuilder()
        .update(Volume)
        .set({ totalWords: () => `totalWords - ${wordCount}` })
        .where('id = :id', { id: chapter.volumeId })
        .execute();
    }

    await this.updatePrevNextLinks(chapter.workId);
  }

  async updateStatus(
    id: string,
    userId: string,
    userRole: UserRole,
    updateChapterStatusDto: UpdateChapterStatusDto,
  ): Promise<Chapter> {
    const chapter = await this.findById(id);

    if (chapter.work.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限修改此章节状态');
    }

    return this.update(id, userId, userRole, {
      status: updateChapterStatusDto.status,
    });
  }

  async publish(id: string, userId: string, userRole: UserRole): Promise<Chapter> {
    return this.updateStatus(id, userId, userRole, {
      status: ChapterStatus.PUBLISHED,
    });
  }

  async unpublish(id: string, userId: string, userRole: UserRole): Promise<Chapter> {
    return this.updateStatus(id, userId, userRole, {
      status: ChapterStatus.DRAFT,
    });
  }

  async getTableOfContents(workId: string, userId?: string): Promise<TableOfContents> {
    const chapters = await this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.volume', 'volume')
      .where('chapter.workId = :workId', { workId })
      .andWhere('chapter.status = :status', { status: ChapterStatus.PUBLISHED })
      .orderBy('volume.order', 'ASC')
      .addOrderBy('chapter.order', 'ASC')
      .getMany();

    const volumesMap = new Map<string, { id: string; title: string; order: number; chapters: TocItem[] }>();
    const noVolumeChapters: TocItem[] = [];

    for (const chapter of chapters) {
      const item: TocItem = {
        id: chapter.id,
        volumeId: chapter.volumeId,
        volumeTitle: chapter.volume?.title || null,
        title: chapter.title,
        order: chapter.order,
        status: chapter.status,
        access: chapter.access,
        price: chapter.price,
        wordCount: chapter.wordCount,
        publishedAt: chapter.publishedAt,
      };

      if (chapter.volumeId) {
        if (!volumesMap.has(chapter.volumeId)) {
          volumesMap.set(chapter.volumeId, {
            id: chapter.volumeId,
            title: chapter.volume!.title,
            order: chapter.volume!.order,
            chapters: [],
          });
        }
        volumesMap.get(chapter.volumeId)!.chapters.push(item);
      } else {
        noVolumeChapters.push(item);
      }
    }

    const volumes = Array.from(volumesMap.values()).sort((a, b) => a.order - b.order);

    return { volumes, noVolumeChapters };
  }

  async checkChapterAccess(userId: string, chapter: Chapter): Promise<boolean> {
    if (chapter.access === ChapterAccess.FREE) {
      return true;
    }

    if (chapter.access === ChapterAccess.LOCKED) {
      const work = chapter.work;
      if (!work) {
        return false;
      }

      if (work.authorId === userId) {
        return true;
      }

      const subscription = await this.subscriptionRepository.findOne({
        where: {
          userId,
          workId: work.id,
          status: SubscriptionStatus.ACTIVE,
        },
      });

      return !!subscription;
    }

    if (chapter.access === ChapterAccess.PREMIUM) {
      return chapter.price === 0;
    }

    return false;
  }

  async incrementViews(id: string): Promise<void> {
    await this.chapterRepository.increment({ id }, 'views', 1);
  }

  @Cron('*/5 * * * *')
  async publishScheduledChapters(): Promise<void> {
    const now = new Date();
    const chapters = await this.chapterRepository
      .createQueryBuilder('chapter')
      .where('chapter.status = :status', { status: ChapterStatus.PENDING })
      .andWhere('chapter.scheduledAt IS NOT NULL')
      .andWhere('chapter.scheduledAt <= :now', { now })
      .getMany();

    for (const chapter of chapters) {
      await this.chapterRepository.update(chapter.id, {
        status: ChapterStatus.PUBLISHED,
        publishedAt: new Date(),
      });
    }
  }

  private scheduleChapterPublish(chapterId: string, scheduledAt: Date): void {
    const now = new Date();
    const delay = scheduledAt.getTime() - now.getTime();
    if (delay <= 0) return;

    const timeout = setTimeout(async () => {
      await this.chapterRepository.update(chapterId, {
        status: ChapterStatus.PUBLISHED,
        publishedAt: new Date(),
      });
    }, Math.min(delay, 2147483647));
    this.schedulerRegistry.addTimeout(`chapter-publish-${chapterId}`, timeout);
  }

  private async shiftOrders(
    workId: string,
    newOrder: number | null,
    oldOrder: number | null,
    direction: number,
  ): Promise<void> {
    if (newOrder !== null && oldOrder !== null) {
      if (newOrder > oldOrder) {
        await this.chapterRepository
          .createQueryBuilder()
          .update(Chapter)
          .set({ order: () => '"order" - 1' })
          .where('workId = :workId', { workId })
          .andWhere('order > :oldOrder', { oldOrder })
          .andWhere('order <= :newOrder', { newOrder })
          .execute();
      } else {
        await this.chapterRepository
          .createQueryBuilder()
          .update(Chapter)
          .set({ order: () => '"order" + 1' })
          .where('workId = :workId', { workId })
          .andWhere('order >= :newOrder', { newOrder })
          .andWhere('order < :oldOrder', { oldOrder })
          .execute();
      }
    } else if (newOrder !== null) {
      await this.chapterRepository
        .createQueryBuilder()
        .update(Chapter)
        .set({ order: () => '"order" + 1' })
        .where('workId = :workId', { workId })
        .andWhere('order >= :newOrder', { newOrder })
        .execute();
    } else if (oldOrder !== null) {
      await this.chapterRepository
        .createQueryBuilder()
        .update(Chapter)
        .set({ order: () => '"order" - 1' })
        .where('workId = :workId', { workId })
        .andWhere('order > :oldOrder', { oldOrder })
        .execute();
    }
  }

  private async updatePrevNextLinks(workId: string): Promise<void> {
    const chapters = await this.chapterRepository
      .createQueryBuilder('chapter')
      .where('chapter.workId = :workId', { workId })
      .orderBy('chapter.order', 'ASC')
      .getMany();

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const prev = i > 0 ? chapters[i - 1] : null;
      const next = i < chapters.length - 1 ? chapters[i + 1] : null;

      await this.chapterRepository.update(chapter.id, {
        prevChapterId: prev?.id || null,
        nextChapterId: next?.id || null,
      });
    }
  }

  private countWords(content: string): number {
    if (!content) return 0;
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }
}
