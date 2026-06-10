import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionType, SubscriptionStatus } from '../../entities/subscription.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateSubscriptionDto {
  @ApiProperty({ description: '作品ID' })
  @IsUUID()
  workId: string;

  @ApiPropertyOptional({ description: '订阅类型', enum: SubscriptionType })
  @IsOptional()
  @IsEnum(SubscriptionType)
  type?: SubscriptionType;

  @ApiPropertyOptional({ description: '金额' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: '是否接收邮件通知' })
  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean;
}

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ description: '订阅类型', enum: SubscriptionType })
  @IsOptional()
  @IsEnum(SubscriptionType)
  type?: SubscriptionType;

  @ApiPropertyOptional({ description: '订阅状态', enum: SubscriptionStatus })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional({ description: '是否自动续费' })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @ApiPropertyOptional({ description: '是否接收邮件通知' })
  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean;
}

export class QuerySubscriptionsDto extends PaginationDto {
  @ApiPropertyOptional({ description: '作品ID' })
  @IsOptional()
  @IsUUID()
  workId?: string;

  @ApiPropertyOptional({ description: '订阅类型', enum: SubscriptionType })
  @IsOptional()
  @IsEnum(SubscriptionType)
  type?: SubscriptionType;

  @ApiPropertyOptional({ description: '订阅状态', enum: SubscriptionStatus })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}

export class SubscriptionIdDto {
  @ApiProperty({ description: '订阅ID' })
  @IsUUID()
  id: string;
}
