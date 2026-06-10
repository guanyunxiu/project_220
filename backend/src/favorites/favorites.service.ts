import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Favorite, FavoriteType } from '../entities/favorite.entity';
import { Work } from '../entities/work.entity';
import {
  CreateFavoriteDto,
  UpdateFavoriteDto,
  UpdateProgressDto,
  QueryFavoritesDto,
} from './dto/favorites.dto';
import {
  PaginationResultDto,
  createPaginationResult,
} from '../common/dto/pagination.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
  ) {}

  async add(
    userId: string,
    createFavoriteDto: CreateFavoriteDto,
  ): Promise<Favorite> {
    const { workId, type, collectionId, notifyOnUpdate, note } =
      createFavoriteDto;

    const work = await this.workRepository.findOne({ where: { id: workId } });
    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    const favoriteType = type || FavoriteType.FAVORITE;

    const existing = await this.favoriteRepository.findOne({
      where: { userId, workId, type: favoriteType },
    });
    if (existing) {
      throw new ConflictException('已收藏该作品');
    }

    const favorite = this.favoriteRepository.create({
      userId,
      workId,
      type: favoriteType,
      collectionId: collectionId || null,
      notifyOnUpdate: notifyOnUpdate !== undefined ? notifyOnUpdate : true,
      note: note || null,
      lastReadAt: new Date(),
    });

    const saved = await this.favoriteRepository.save(favorite);

    await this.workRepository.increment({ id: workId }, 'totalFavorites', 1);

    return this.findById(saved.id);
  }

  async remove(userId: string, workId: string, type?: FavoriteType): Promise<void> {
    const favoriteType = type || FavoriteType.FAVORITE;

    const favorite = await this.favoriteRepository.findOne({
      where: { userId, workId, type: favoriteType },
    });
    if (!favorite) {
      throw new NotFoundException('未收藏该作品');
    }

    await this.favoriteRepository.delete(favorite.id);
    await this.workRepository.decrement({ id: workId }, 'totalFavorites', 1);
  }

  async removeById(userId: string, id: string): Promise<void> {
    const favorite = await this.findById(id);

    if (favorite.userId !== userId) {
      throw new NotFoundException('收藏不存在');
    }

    await this.favoriteRepository.delete(id);
    await this.workRepository.decrement(
      { id: favorite.workId },
      'totalFavorites',
      1,
    );
  }

  async findAll(
    userId: string,
    queryFavoritesDto: QueryFavoritesDto,
  ): Promise<PaginationResultDto<Favorite>> {
    const { page, pageSize, sortBy, sortOrder, keyword, workId, type } =
      queryFavoritesDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.work', 'work')
      .leftJoinAndSelect('work.author', 'author')
      .where('favorite.userId = :userId', { userId });

    if (workId) {
      queryBuilder.andWhere('favorite.workId = :workId', { workId });
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('work.title LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('favorite.note LIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    if (type) {
      queryBuilder.andWhere('favorite.type = :type', { type });
    }

    const validSortFields = [
      'createdAt',
      'updatedAt',
      'lastReadAt',
      'progressPercent',
      'lastReadChapter',
    ];
    const sortField = validSortFields.includes(sortBy)
      ? `favorite.${sortBy}`
      : 'favorite.lastReadAt';
    queryBuilder.orderBy(sortField, sortOrder);

    queryBuilder.skip(skip).take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return createPaginationResult(items, total, page, pageSize);
  }

  async findById(id: string): Promise<Favorite> {
    const favorite = await this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.work', 'work')
      .leftJoinAndSelect('work.author', 'author')
      .where('favorite.id = :id', { id })
      .getOne();

    if (!favorite) {
      throw new NotFoundException('收藏不存在');
    }
    return favorite;
  }

  async checkFavorite(
    userId: string,
    workId: string,
    type?: FavoriteType,
  ): Promise<Favorite | null> {
    const favoriteType = type || FavoriteType.FAVORITE;
    return this.favoriteRepository.findOne({
      where: { userId, workId, type: favoriteType },
    });
  }

  async update(
    userId: string,
    id: string,
    updateFavoriteDto: UpdateFavoriteDto,
  ): Promise<Favorite> {
    const favorite = await this.findById(id);

    if (favorite.userId !== userId) {
      throw new NotFoundException('收藏不存在');
    }

    await this.favoriteRepository.update(id, updateFavoriteDto);
    return this.findById(id);
  }

  async syncProgress(
    userId: string,
    workId: string,
    updateProgressDto: UpdateProgressDto,
    type?: FavoriteType,
  ): Promise<Favorite> {
    const favoriteType = type || FavoriteType.FAVORITE;

    const favorite = await this.favoriteRepository.findOne({
      where: { userId, workId, type: favoriteType },
    });

    if (!favorite) {
      const work = await this.workRepository.findOne({ where: { id: workId } });
      if (!work) {
        throw new NotFoundException('作品不存在');
      }

      const newFavorite = this.favoriteRepository.create({
        userId,
        workId,
        type: favoriteType,
        lastReadChapter: updateProgressDto.lastReadChapter,
        progressPercent: updateProgressDto.progressPercent || 0,
        lastReadAt: new Date(),
      });
      const saved = await this.favoriteRepository.save(newFavorite);
      await this.workRepository.increment({ id: workId }, 'totalFavorites', 1);
      return this.findById(saved.id);
    }

    await this.favoriteRepository.update(favorite.id, {
      lastReadChapter: updateProgressDto.lastReadChapter,
      progressPercent: updateProgressDto.progressPercent || favorite.progressPercent,
      lastReadAt: new Date(),
    });

    return this.findById(favorite.id);
  }

  async getContinueReading(userId: string, limit: number = 10): Promise<Favorite[]> {
    return this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.work', 'work')
      .leftJoinAndSelect('work.author', 'author')
      .where('favorite.userId = :userId', { userId })
      .orderBy('favorite.lastReadAt', 'DESC')
      .limit(limit)
      .getMany();
  }
}
