import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchIndexType {
  WORKS = 'works',
  CHAPTERS = 'chapters',
}

export class SearchQueryDto {
  @ApiProperty({ description: '搜索关键词' })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({ description: '搜索类型', enum: SearchIndexType })
  @IsOptional()
  @IsEnum(SearchIndexType)
  type?: SearchIndexType;

  @ApiPropertyOptional({ description: '页码' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: '作品类型过滤: novel/comic' })
  @IsOptional()
  @IsString()
  workType?: string;

  @ApiPropertyOptional({ description: '分类过滤' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '标签过滤' })
  @IsOptional()
  @IsString()
  tag?: string;
}

export class ReindexDto {
  @ApiPropertyOptional({ description: '索引类型，不传则全部重建', enum: SearchIndexType, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(SearchIndexType, { each: true })
  types?: SearchIndexType[];
}

export interface SearchResult<T> {
  hits: T[];
  totalHits: number;
  totalPages: number;
  page: number;
  pageSize: number;
  processingTimeMs: number;
  facets?: any;
}
