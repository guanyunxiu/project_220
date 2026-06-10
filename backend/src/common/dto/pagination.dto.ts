import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  IsEnum,
} from 'class-validator';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationDto {
  @ApiPropertyOptional({ description: '页码，默认1', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量，默认20', minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: '排序字段' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: '排序方式', enum: SortOrder })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class PaginationResultDto<T> {
  @ApiPropertyOptional({ description: '数据列表' })
  items: T[];

  @ApiPropertyOptional({ description: '总数' })
  total: number;

  @ApiPropertyOptional({ description: '当前页码' })
  page: number;

  @ApiPropertyOptional({ description: '每页数量' })
  pageSize: number;

  @ApiPropertyOptional({ description: '总页数' })
  totalPages: number;

  @ApiPropertyOptional({ description: '是否有上一页' })
  hasPrev: boolean;

  @ApiPropertyOptional({ description: '是否有下一页' })
  hasNext: boolean;
}

export function createPaginationResult<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginationResultDto<T> {
  const totalPages = Math.ceil(total / pageSize);
  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}
