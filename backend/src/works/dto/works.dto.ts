import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
  MaxLength,
  IsUrl,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkType, WorkStatus, WorkAudience } from '../../entities/work.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateWorkDto {
  @ApiProperty({ description: '作品标题' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: '作品slug' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({ description: '封面图片URL' })
  @IsOptional()
  @IsUrl()
  cover?: string;

  @ApiPropertyOptional({ description: '横幅图片URL' })
  @IsOptional()
  @IsUrl()
  banner?: string;

  @ApiPropertyOptional({ description: '作品描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '作品类型', enum: WorkType })
  @IsOptional()
  @IsEnum(WorkType)
  type?: WorkType;

  @ApiPropertyOptional({ description: '受众类型', enum: WorkAudience })
  @IsOptional()
  @IsEnum(WorkAudience)
  audience?: WorkAudience;

  @ApiPropertyOptional({ description: '分类标签，逗号分隔' })
  @IsOptional()
  @IsString()
  categories?: string;

  @ApiPropertyOptional({ description: '标签，逗号分隔' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: '语言' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: '是否原创' })
  @IsOptional()
  @IsBoolean()
  isOriginal?: boolean;

  @ApiPropertyOptional({ description: '是否付费作品' })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({ description: '是否允许评论' })
  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;
}

export class UpdateWorkDto {
  @ApiPropertyOptional({ description: '作品标题' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: '作品slug' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({ description: '封面图片URL' })
  @IsOptional()
  @IsUrl()
  cover?: string;

  @ApiPropertyOptional({ description: '横幅图片URL' })
  @IsOptional()
  @IsUrl()
  banner?: string;

  @ApiPropertyOptional({ description: '作品描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '作品类型', enum: WorkType })
  @IsOptional()
  @IsEnum(WorkType)
  type?: WorkType;

  @ApiPropertyOptional({ description: '作品状态', enum: WorkStatus })
  @IsOptional()
  @IsEnum(WorkStatus)
  status?: WorkStatus;

  @ApiPropertyOptional({ description: '受众类型', enum: WorkAudience })
  @IsOptional()
  @IsEnum(WorkAudience)
  audience?: WorkAudience;

  @ApiPropertyOptional({ description: '分类标签，逗号分隔' })
  @IsOptional()
  @IsString()
  categories?: string;

  @ApiPropertyOptional({ description: '标签，逗号分隔' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: '语言' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: '是否原创' })
  @IsOptional()
  @IsBoolean()
  isOriginal?: boolean;

  @ApiPropertyOptional({ description: '是否付费作品' })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({ description: '是否允许评论' })
  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;
}

export class UpdateWorkStatusDto {
  @ApiProperty({ description: '作品状态', enum: WorkStatus })
  @IsEnum(WorkStatus)
  status: WorkStatus;
}

export class QueryWorksDto extends PaginationDto {
  @ApiPropertyOptional({ description: '作者ID' })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({ description: '作品类型', enum: WorkType })
  @IsOptional()
  @IsEnum(WorkType)
  type?: WorkType;

  @ApiPropertyOptional({ description: '作品状态', enum: WorkStatus })
  @IsOptional()
  @IsEnum(WorkStatus)
  status?: WorkStatus;

  @ApiPropertyOptional({ description: '受众类型', enum: WorkAudience })
  @IsOptional()
  @IsEnum(WorkAudience)
  audience?: WorkAudience;

  @ApiPropertyOptional({ description: '分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: '是否只看已发布' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  onlyPublished?: boolean = true;

  @ApiPropertyOptional({ description: '是否精选' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: '是否推荐' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isRecommended?: boolean;

  @ApiPropertyOptional({ description: '最小章节数' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minChapters?: number;
}

export class WorkIdDto {
  @ApiProperty({ description: '作品ID' })
  @IsUUID()
  id: string;
}
