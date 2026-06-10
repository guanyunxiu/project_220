import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsBoolean,
  IsArray,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  NotificationType,
  NotificationPriority,
} from '../../entities/notification.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateNotificationDto {
  @ApiProperty({ description: '接收用户ID列表（单个通知可传单个）' })
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];

  @ApiPropertyOptional({ description: '发送者ID' })
  @IsOptional()
  @IsUUID()
  senderId?: string;

  @ApiProperty({ description: '通知类型', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({ description: '通知优先级', enum: NotificationPriority })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiProperty({ description: '通知标题' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: '通知内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '图片URL' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: '链接URL' })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiPropertyOptional({ description: '关联ID' })
  @IsOptional()
  @IsUUID()
  relatedId?: string;

  @ApiPropertyOptional({ description: '关联类型' })
  @IsOptional()
  @IsString()
  relatedType?: string;

  @ApiPropertyOptional({ description: '是否立即推送' })
  @IsOptional()
  @IsBoolean()
  pushNow?: boolean;
}

export class QueryNotificationsDto extends PaginationDto {
  @ApiPropertyOptional({ description: '通知类型', enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ description: '是否已读' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ description: '通知优先级', enum: NotificationPriority })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;
}

export class MarkReadDto {
  @ApiProperty({ description: '通知ID列表（不传则全部标记已读）' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  ids?: string[];
}

export class NotificationIdDto {
  @ApiProperty({ description: '通知ID' })
  @IsUUID()
  id: string;
}

export interface UnreadCount {
  total: number;
  byType: Record<string, number>;
}
