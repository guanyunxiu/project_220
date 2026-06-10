import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FavoriteType } from '../../entities/favorite.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateFavoriteDto {
  @ApiProperty({ description: '作品ID' })
  @IsUUID()
  workId: string;

  @ApiPropertyOptional({ description: '收藏类型', enum: FavoriteType })
  @IsOptional()
  @IsEnum(FavoriteType)
  type?: FavoriteType;

  @ApiPropertyOptional({ description: '收藏夹ID' })
  @IsOptional()
  @IsUUID()
  collectionId?: string;

  @ApiPropertyOptional({ description: '是否接收更新通知' })
  @IsOptional()
  @IsBoolean()
  notifyOnUpdate?: boolean;

  @ApiPropertyOptional({ description: '笔记' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateFavoriteDto {
  @ApiPropertyOptional({ description: '收藏类型', enum: FavoriteType })
  @IsOptional()
  @IsEnum(FavoriteType)
  type?: FavoriteType;

  @ApiPropertyOptional({ description: '收藏夹ID' })
  @IsOptional()
  @IsUUID()
  collectionId?: string;

  @ApiPropertyOptional({ description: '最近阅读章节序号' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lastReadChapter?: number;

  @ApiPropertyOptional({ description: '阅读进度百分比' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @ApiPropertyOptional({ description: '是否接收更新通知' })
  @IsOptional()
  @IsBoolean()
  notifyOnUpdate?: boolean;

  @ApiPropertyOptional({ description: '笔记' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateProgressDto {
  @ApiProperty({ description: '最近阅读章节序号' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lastReadChapter: number;

  @ApiPropertyOptional({ description: '阅读进度百分比' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercent?: number;
}

export class QueryFavoritesDto extends PaginationDto {
  @ApiPropertyOptional({ description: '作品ID' })
  @IsOptional()
  @IsUUID()
  workId?: string;

  @ApiPropertyOptional({ description: '收藏类型', enum: FavoriteType })
  @IsOptional()
  @IsEnum(FavoriteType)
  type?: FavoriteType;
}

export class FavoriteIdDto {
  @ApiProperty({ description: '收藏ID' })
  @IsUUID()
  id: string;
}
