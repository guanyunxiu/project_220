import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateReadingHistoryDto {
  @ApiProperty({ description: '作品ID' })
  @IsUUID()
  workId: string;

  @ApiProperty({ description: '章节ID' })
  @IsUUID()
  chapterId: string;

  @ApiPropertyOptional({ description: '当前页码' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number;

  @ApiPropertyOptional({ description: '总页数' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalPages?: number;

  @ApiPropertyOptional({ description: '滚动位置' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  scrollPosition?: number;

  @ApiPropertyOptional({ description: '阅读进度百分比' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readPercent?: number;

  @ApiPropertyOptional({ description: '花费时间（秒）' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  secondsSpent?: number;

  @ApiPropertyOptional({ description: '是否已完成阅读' })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class UpdateReadingHistoryDto {
  @ApiPropertyOptional({ description: '当前页码' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number;

  @ApiPropertyOptional({ description: '总页数' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalPages?: number;

  @ApiPropertyOptional({ description: '滚动位置' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  scrollPosition?: number;

  @ApiPropertyOptional({ description: '阅读进度百分比' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readPercent?: number;

  @ApiPropertyOptional({ description: '花费时间（秒）' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  secondsSpent?: number;

  @ApiPropertyOptional({ description: '是否已完成阅读' })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class QueryReadingHistoryDto extends PaginationDto {
  @ApiPropertyOptional({ description: '作品ID' })
  @IsOptional()
  @IsUUID()
  workId?: string;

  @ApiPropertyOptional({ description: '章节ID' })
  @IsOptional()
  @IsUUID()
  chapterId?: string;
}

export class ClearHistoryDto {
  @ApiPropertyOptional({ description: '作品ID（不传则清除全部）' })
  @IsOptional()
  @IsUUID()
  workId?: string;
}

export class ReadingHistoryIdDto {
  @ApiProperty({ description: '阅读记录ID' })
  @IsUUID()
  id: string;
}
