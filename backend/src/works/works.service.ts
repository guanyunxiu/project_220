import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, Like, MoreThan } from 'typeorm';
import {
  Work,
  WorkType,
  WorkStatus,
  WorkAudience,
} from '../entities/work.entity';
import { User, UserRole } from '../entities/user.entity';
import {
  CreateWorkDto,
  UpdateWorkDto,
  UpdateWorkStatusDto,
  QueryWorksDto,
} from './dto/works.dto';
import {
  PaginationResultDto,
  createPaginationResult,
} from '../common/dto/pagination.dto';

@Injectable()
export class WorksService {
  constructor(
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(queryWorksDto: QueryWorksDto): Promise<PaginationResultDto<Work>> {
    const {
      page,
      pageSize,
      sortBy,
      sortOrder,
      keyword,
      authorId,
      type,
      status,
      audience,
      category,
      tag,
      onlyPublished,
      isFeatured,
      isRecommended,
      minChapters,
    } = queryWorksDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.workRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.author', 'author');

    if (keyword) {
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where('work.title LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('work.description LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('work.tags LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('work.categories LIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    if (authorId) {
      queryBuilder.andWhere('work.authorId = :authorId', { authorId });
    }

    if (type) {
      queryBuilder.andWhere('work.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('work.status = :status', { status });
    } else if (onlyPublished) {
      queryBuilder.andWhere('work.status = :status', { status: WorkStatus.PUBLISHED });
    }

    if (audience) {
      queryBuilder.andWhere('work.audience = :audience', { audience });
    }

    if (category) {
      queryBuilder.andWhere('work.categories LIKE :category', { category: `%${category}%` });
    }

    if (tag) {
      queryBuilder.andWhere('work.tags LIKE :tag', { tag: `%${tag}%` });
    }

    if (isFeatured) {
      queryBuilder.andWhere('work.isFeatured = :isFeatured', { isFeatured: true });
    }

    if (isRecommended) {
      queryBuilder.andWhere('work.isRecommended = :isRecommended', { isRecommended: true });
    }

    if (minChapters) {
      queryBuilder.andWhere('work.totalChapters >= :minChapters', { minChapters });
    }

    const validSortFields = [
      'createdAt',
      'updatedAt',
      'publishedAt',
      'lastUpdatedAt',
      'totalViews',
      'totalLikes',
      'totalFavorites',
      'totalComments',
      'totalRewards',
      'totalRewardAmount',
      'totalChapters',
      'hotScore',
      'rating',
    ];
    const sortField = validSortFields.includes(sortBy) ? `work.${sortBy}` : 'work.createdAt';
    queryBuilder.orderBy(sortField, sortOrder);

    queryBuilder.skip(skip).take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return createPaginationResult(items, total, page, pageSize);
  }

  async findById(id: string, includeAuthor = true): Promise<Work> {
    const queryBuilder = this.workRepository.createQueryBuilder('work');

    if (includeAuthor) {
      queryBuilder.leftJoinAndSelect('work.author', 'author');
    }

    queryBuilder.where('work.id = :id', { id });

    const work = await queryBuilder.getOne();
    if (!work) {
      throw new NotFoundException('作品不存在');
    }
    return work;
  }

  async findBySlug(slug: string): Promise<Work> {
    const work = await this.workRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.author', 'author')
      .where('work.slug = :slug', { slug })
      .getOne();
    if (!work) {
      throw new NotFoundException('作品不存在');
    }
    return work;
  }

  async create(authorId: string, createWorkDto: CreateWorkDto): Promise<Work> {
    const slug = createWorkDto.slug || this.generateSlug(createWorkDto.title);

    const existingSlug = await this.workRepository.findOne({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException('Slug已被使用');
    }

    const work = this.workRepository.create({
      ...createWorkDto,
      authorId,
      slug,
      status: WorkStatus.DRAFT,
    });

    const savedWork = await this.workRepository.save(work);

    await this.userRepository.increment({ id: authorId }, 'totalWorks', 1);

    return this.findById(savedWork.id);
  }

  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    updateWorkDto: UpdateWorkDto,
  ): Promise<Work> {
    const work = await this.findById(id, false);

    if (work.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限修改此作品');
    }

    if (updateWorkDto.slug && updateWorkDto.slug !== work.slug) {
      const existingSlug = await this.workRepository.findOne({
        where: { slug: updateWorkDto.slug },
      });
      if (existingSlug) {
        throw new ConflictException('Slug已被使用');
      }
    }

    await this.workRepository.update(id, {
      ...updateWorkDto,
    });

    return this.findById(id);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const work = await this.findById(id, false);

    if (work.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限删除此作品');
    }

    await this.workRepository.delete(id);
    await this.userRepository.decrement({ id: work.authorId }, 'totalWorks', 1);
  }

  async updateStatus(
    id: string,
    userId: string,
    userRole: UserRole,
    updateWorkStatusDto: UpdateWorkStatusDto,
  ): Promise<Work> {
    const work = await this.findById(id, false);

    if (work.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限修改此作品状态');
    }

    const updateData: Partial<Work> = {
      status: updateWorkStatusDto.status,
    };

    if (
      updateWorkStatusDto.status === WorkStatus.PUBLISHED &&
      work.status !== WorkStatus.PUBLISHED
    ) {
      updateData.publishedAt = new Date();
    }

    updateData.lastUpdatedAt = new Date();

    await this.workRepository.update(id, updateData);

    return this.findById(id);
  }

  async publish(id: string, userId: string, userRole: UserRole): Promise<Work> {
    return this.updateStatus(id, userId, userRole, {
      status: WorkStatus.PUBLISHED,
    });
  }

  async unpublish(id: string, userId: string, userRole: UserRole): Promise<Work> {
    return this.updateStatus(id, userId, userRole, {
      status: WorkStatus.DRAFT,
    });
  }

  async incrementViews(id: string): Promise<void> {
    await this.workRepository.increment({ id }, 'totalViews', 1);
  }

  async findByAuthor(
    authorId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<PaginationResultDto<Work>> {
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.workRepository
      .createQueryBuilder('work')
      .where('work.authorId = :authorId', { authorId })
      .orderBy('work.updatedAt', 'DESC')
      .skip(skip)
      .take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return createPaginationResult(items, total, page, pageSize);
  }

  async getHotWorks(
    type?: WorkType,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<PaginationResultDto<Work>> {
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.workRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.author', 'author')
      .where('work.status = :status', { status: WorkStatus.PUBLISHED })
      .orderBy('work.hotScore', 'DESC')
      .addOrderBy('work.totalViews', 'DESC')
      .skip(skip)
      .take(pageSize);

    if (type) {
      queryBuilder.andWhere('work.type = :type', { type });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return createPaginationResult(items, total, page, pageSize);
  }

  private generateSlug(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${slug}-${Date.now().toString(36)}`;
  }
}
