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
  IsInt,
  Min,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChapterStatus, ChapterAccess } from '../../entities/chapter.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateChapterDto {
  @ApiProperty({ description: '所属作品ID' })
  @IsUUID()
  workId: string;

  @ApiPropertyOptional({ description: '所属卷ID' })
  @IsOptional()
  @IsUUID()
  volumeId?: string;

  @ApiProperty({ description: '章节标题' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: '章节slug' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({ description: '排序号，不填自动递增' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  order?: number;

  @ApiPropertyOptional({ description: '章节摘要' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: '章节内容（纯文本）' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '章节内容（HTML）' })
  @IsOptional()
  @IsString()
  contentHtml?: string;

  @ApiPropertyOptional({ description: '漫画图片列表' })
  @IsOptional()
  images?: any;

  @ApiPropertyOptional({ description: '缩略图URL' })
  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @ApiPropertyOptional({ description: '章节状态', enum: ChapterStatus })
  @IsOptional()
  @IsEnum(ChapterStatus)
  status?: ChapterStatus;

  @ApiPropertyOptional({ description: '访问权限', enum: ChapterAccess })
  @IsOptional()
  @IsEnum(ChapterAccess)
  access?: ChapterAccess;

  @ApiPropertyOptional({ description: '价格（付费章节）' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: '定时发布时间' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: '是否允许评论' })
  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;

  @ApiPropertyOptional({ description: '是否为NSFW内容' })
  @IsOptional()
  @IsBoolean()
  isNsfw?: boolean;

  @ApiPropertyOptional({ description: '来源URL' })
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: '翻译者' })
  @IsOptional()
  @IsString()
  translator?: string;

  @ApiPropertyOptional({ description: '编辑者' })
  @IsOptional()
  @IsString()
  editor?: string;
}

export class UpdateChapterDto {
  @ApiPropertyOptional({ description: '所属卷ID' })
  @IsOptional()
  @IsUUID()
  volumeId?: string;

  @ApiPropertyOptional({ description: '章节标题' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: '章节slug' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({ description: '排序号' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  order?: number;

  @ApiPropertyOptional({ description: '章节摘要' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: '章节内容（纯文本）' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '章节内容（HTML）' })
  @IsOptional()
  @IsString()
  contentHtml?: string;

  @ApiPropertyOptional({ description: '漫画图片列表' })
  @IsOptional()
  images?: any;

  @ApiPropertyOptional({ description: '缩略图URL' })
  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @ApiPropertyOptional({ description: '章节状态', enum: ChapterStatus })
  @IsOptional()
  @IsEnum(ChapterStatus)
  status?: ChapterStatus;

  @ApiPropertyOptional({ description: '访问权限', enum: ChapterAccess })
  @IsOptional()
  @IsEnum(ChapterAccess)
  access?: ChapterAccess;

  @ApiPropertyOptional({ description: '价格（付费章节）' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: '定时发布时间' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: '是否允许评论' })
  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;

  @ApiPropertyOptional({ description: '是否为NSFW内容' })
  @IsOptional()
  @IsBoolean()
  isNsfw?: boolean;

  @ApiPropertyOptional({ description: '来源URL' })
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: '翻译者' })
  @IsOptional()
  @IsString()
  translator?: string;

  @ApiPropertyOptional({ description: '编辑者' })
  @IsOptional()
  @IsString()
  editor?: string;
}

export class UpdateChapterStatusDto {
  @ApiProperty({ description: '章节状态', enum: ChapterStatus })
  @IsEnum(ChapterStatus)
  status: ChapterStatus;
}

export class QueryChaptersDto extends PaginationDto {
  @ApiPropertyOptional({ description: '作品ID' })
  @IsOptional()
  @IsUUID()
  workId?: string;

  @ApiPropertyOptional({ description: '卷ID' })
  @IsOptional()
  @IsUUID()
  volumeId?: string;

  @ApiPropertyOptional({ description: '章节状态', enum: ChapterStatus })
  @IsOptional()
  @IsEnum(ChapterStatus)
  status?: ChapterStatus;

  @ApiPropertyOptional({ description: '访问权限', enum: ChapterAccess })
  @IsOptional()
  @IsEnum(ChapterAccess)
  access?: ChapterAccess;

  @ApiPropertyOptional({ description: '是否只看已发布' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  onlyPublished?: boolean = true;
}

export class ChapterIdDto {
  @ApiProperty({ description: '章节ID' })
  @IsUUID()
  id: string;
}

export class UnlockChapterDto {
  @ApiProperty({ description: '章节ID列表' })
  @IsArray()
  @IsUUID('4', { each: true })
  chapterIds: string[];
}
