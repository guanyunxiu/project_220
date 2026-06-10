import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, MoreThan, LessThan } from 'typeorm';
import { Volume, VolumeStatus } from '../entities/volume.entity';
import { Work } from '../entities/work.entity';
import { UserRole } from '../entities/user.entity';
import {
  CreateVolumeDto,
  UpdateVolumeDto,
  UpdateVolumeStatusDto,
  QueryVolumesDto,
} from './dto/volumes.dto';
import {
  PaginationResultDto,
  createPaginationResult,
} from '../common/dto/pagination.dto';

@Injectable()
export class VolumesService {
  constructor(
    @InjectRepository(Volume)
    private readonly volumeRepository: Repository<Volume>,
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
  ) {}

  async findAll(queryVolumesDto: QueryVolumesDto): Promise<PaginationResultDto<Volume>> {
    const {
      page,
      pageSize,
      sortBy,
      sortOrder,
      keyword,
      workId,
      status,
      onlyVisible,
    } = queryVolumesDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.volumeRepository
      .createQueryBuilder('volume')
      .leftJoinAndSelect('volume.work', 'work');

    if (workId) {
      queryBuilder.andWhere('volume.workId = :workId', { workId });
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('volume.title LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('volume.description LIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    if (status) {
      queryBuilder.andWhere('volume.status = :status', { status });
    }

    if (onlyVisible) {
      queryBuilder.andWhere('volume.isVisible = :isVisible', { isVisible: true });
    }

    const validSortFields = ['order', 'createdAt', 'updatedAt', 'publishedAt'];
    const sortField = validSortFields.includes(sortBy) ? `volume.${sortBy}` : 'volume.order';
    queryBuilder.orderBy(sortField, sortOrder);

    queryBuilder.skip(skip).take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return createPaginationResult(items, total, page, pageSize);
  }

  async findByWorkId(workId: string, includeChapters = false): Promise<Volume[]> {
    const queryBuilder = this.volumeRepository
      .createQueryBuilder('volume')
      .where('volume.workId = :workId', { workId })
      .andWhere('volume.isVisible = :isVisible', { isVisible: true })
      .orderBy('volume.order', 'ASC');

    if (includeChapters) {
      queryBuilder.leftJoinAndSelect('volume.chapters', 'chapters')
        .andWhere('chapters.status = :chapterStatus', { chapterStatus: 'published' })
        .addOrderBy('chapters.order', 'ASC');
    }

    return queryBuilder.getMany();
  }

  async findById(id: string): Promise<Volume> {
    const volume = await this.volumeRepository
      .createQueryBuilder('volume')
      .leftJoinAndSelect('volume.work', 'work')
      .where('volume.id = :id', { id })
      .getOne();

    if (!volume) {
      throw new NotFoundException('卷不存在');
    }
    return volume;
  }

  async create(userId: string, userRole: UserRole, createVolumeDto: CreateVolumeDto): Promise<Volume> {
    const work = await this.workRepository.findOne({ where: { id: createVolumeDto.workId } });
    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    if (work.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限为此作品创建卷');
    }

    let order = createVolumeDto.order;
    if (!order) {
      const maxOrder = await this.volumeRepository
        .createQueryBuilder('volume')
        .select('MAX(volume.order)', 'max')
        .where('volume.workId = :workId', { workId: createVolumeDto.workId })
        .getRawOne();
      order = (maxOrder?.max || 0) + 1;
    } else {
      await this.shiftOrders(createVolumeDto.workId, order, null, 1);
    }

    const volume = this.volumeRepository.create({
      ...createVolumeDto,
      order,
      status: createVolumeDto.status || VolumeStatus.DRAFT,
    });

    const savedVolume = await this.volumeRepository.save(volume);

    await this.workRepository.increment(
      { id: createVolumeDto.workId },
      'totalVolumes',
      1,
    );

    return this.findById(savedVolume.id);
  }

  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    updateVolumeDto: UpdateVolumeDto,
  ): Promise<Volume> {
    const volume = await this.findById(id);

    if (volume.work.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限修改此卷');
    }

    if (updateVolumeDto.order !== undefined && updateVolumeDto.order !== volume.order) {
      await this.shiftOrders(volume.workId, updateVolumeDto.order, volume.order, 0);
    }

    await this.volumeRepository.update(id, updateVolumeDto);

    return this.findById(id);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const volume = await this.findById(id);

    if (volume.work.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限删除此卷');
    }

    await this.shiftOrders(volume.workId, null, volume.order, -1);

    await this.volumeRepository.delete(id);

    await this.workRepository.decrement(
      { id: volume.workId },
      'totalVolumes',
      1,
    );
  }

  async updateStatus(
    id: string,
    userId: string,
    userRole: UserRole,
    updateVolumeStatusDto: UpdateVolumeStatusDto,
  ): Promise<Volume> {
    const volume = await this.findById(id);

    if (volume.work.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限修改此卷状态');
    }

    const updateData: Partial<Volume> = {
      status: updateVolumeStatusDto.status,
    };

    if (
      updateVolumeStatusDto.status === VolumeStatus.PUBLISHED &&
      volume.status !== VolumeStatus.PUBLISHED
    ) {
      updateData.publishedAt = new Date();
    }

    await this.volumeRepository.update(id, updateData);

    return this.findById(id);
  }

  private async shiftOrders(
    workId: string,
    newOrder: number | null,
    oldOrder: number | null,
    direction: number,
  ): Promise<void> {
    if (newOrder !== null && oldOrder !== null) {
      if (newOrder > oldOrder) {
        await this.volumeRepository
          .createQueryBuilder()
          .update(Volume)
          .set({ order: () => '"order" - 1' })
          .where('workId = :workId', { workId })
          .andWhere('order > :oldOrder', { oldOrder })
          .andWhere('order <= :newOrder', { newOrder })
          .execute();
      } else {
        await this.volumeRepository
          .createQueryBuilder()
          .update(Volume)
          .set({ order: () => '"order" + 1' })
          .where('workId = :workId', { workId })
          .andWhere('order >= :newOrder', { newOrder })
          .andWhere('order < :oldOrder', { oldOrder })
          .execute();
      }
    } else if (newOrder !== null) {
      await this.volumeRepository
        .createQueryBuilder()
        .update(Volume)
        .set({ order: () => '"order" + 1' })
        .where('workId = :workId', { workId })
        .andWhere('order >= :newOrder', { newOrder })
        .execute();
    } else if (oldOrder !== null) {
      await this.volumeRepository
        .createQueryBuilder()
        .update(Volume)
        .set({ order: () => '"order" - 1' })
        .where('workId = :workId', { workId })
        .andWhere('order > :oldOrder', { oldOrder })
        .execute();
    }
  }
}
