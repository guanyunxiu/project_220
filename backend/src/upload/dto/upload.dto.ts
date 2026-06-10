import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum UploadType {
  AVATAR = 'avatar',
  COVER = 'cover',
  BANNER = 'banner',
  CHAPTER_IMAGE = 'chapter_image',
  CONTENT_IMAGE = 'content_image',
  THUMBNAIL = 'thumbnail',
  OTHER = 'other',
}

export enum ImageFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
}

export class UploadImageDto {
  @ApiProperty({ description: '上传类型', enum: UploadType })
  @IsEnum(UploadType)
  type: UploadType;

  @ApiPropertyOptional({ description: '宽度（像素）' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  width?: number;

  @ApiPropertyOptional({ description: '高度（像素）' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  height?: number;

  @ApiPropertyOptional({ description: '质量（1-100）' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  quality?: number = 80;

  @ApiPropertyOptional({ description: '输出格式', enum: ImageFormat })
  @IsOptional()
  @IsEnum(ImageFormat)
  format?: ImageFormat = ImageFormat.WEBP;

  @ApiPropertyOptional({ description: '是否添加水印' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  watermark?: boolean = false;

  @ApiPropertyOptional({ description: '关联ID（作品/章节ID' })
  @IsOptional()
  @IsString()
  relatedId?: string;
}

export class RichTextImageDto {
  @ApiProperty({ description: '富文本内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '关联ID（作品/章节ID' })
  @IsOptional()
  @IsString()
  relatedId?: string;
}

export interface UploadResult {
  url: string;
  originalName: string;
  fileName: string;
  size: number;
  width: number;
  height: number;
  mimeType: string;
  format: string;
}
