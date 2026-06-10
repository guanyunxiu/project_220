import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommentStatus } from '../../entities/comment.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateCommentDto {
  @ApiProperty({ description: '作品ID' })
  @IsUUID()
  workId: string;

  @ApiPropertyOptional({ description: '章节ID' })
  @IsOptional()
  @IsUUID()
  chapterId?: string;

  @ApiPropertyOptional({ description: '父评论ID（回复时使用）' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: '回复的用户ID' })
  @IsOptional()
  @IsUUID()
  replyToUserId?: string;

  @ApiProperty({ description: '评论内容' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ description: '是否为剧透评论' })
  @IsOptional()
  @IsBoolean()
  isSpoiler?: boolean;
}

export class UpdateCommentDto {
  @ApiPropertyOptional({ description: '评论内容' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @ApiPropertyOptional({ description: '是否为剧透评论' })
  @IsOptional()
  @IsBoolean()
  isSpoiler?: boolean;
}

export class UpdateCommentStatusDto {
  @ApiProperty({ description: '评论状态', enum: CommentStatus })
  @IsEnum(CommentStatus)
  status: CommentStatus;
}

export class LikeCommentDto {
  @ApiProperty({ description: '是否点赞（true点赞，false点踩）' })
  @IsBoolean()
  like: boolean;
}

export class QueryCommentsDto extends PaginationDto {
  @ApiPropertyOptional({ description: '作品ID' })
  @IsOptional()
  @IsUUID()
  workId?: string;

  @ApiPropertyOptional({ description: '章节ID' })
  @IsOptional()
  @IsUUID()
  chapterId?: string;

  @ApiPropertyOptional({ description: '父评论ID' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: '评论状态', enum: CommentStatus })
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;

  @ApiPropertyOptional({ description: '是否只看热门' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hot?: boolean;
}

export class CommentIdDto {
  @ApiProperty({ description: '评论ID' })
  @IsUUID()
  id: string;
}
