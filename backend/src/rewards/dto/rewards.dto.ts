import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsNumber,
  Min,
  IsString,
  IsBoolean,
  IsInt,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum RewardRankType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  ALL = 'all',
}

export class CreateRewardDto {
  @ApiProperty({ description: '作品ID' })
  @IsUUID()
  workId: string;

  @ApiPropertyOptional({ description: '章节ID（打赏解锁章节时使用）' })
  @IsOptional()
  @IsUUID()
  chapterId?: string;

  @ApiProperty({ description: '打赏金额' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: '货币' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: '礼物类型' })
  @IsOptional()
  @IsString()
  giftType?: string;

  @ApiPropertyOptional({ description: '礼物数量' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  giftQuantity?: number;

  @ApiPropertyOptional({ description: '是否匿名打赏' })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ description: '打赏留言' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class QueryRewardsDto extends PaginationDto {
  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: '作品ID' })
  @IsOptional()
  @IsUUID()
  workId?: string;

  @ApiPropertyOptional({ description: '章节ID' })
  @IsOptional()
  @IsUUID()
  chapterId?: string;

  @ApiPropertyOptional({ description: '打赏状态' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class RewardRankQueryDto {
  @ApiProperty({ description: '榜单类型', enum: RewardRankType })
  @IsEnum(RewardRankType)
  type: RewardRankType;

  @ApiPropertyOptional({ description: '作品ID（不传则为全站榜）' })
  @IsOptional()
  @IsUUID()
  workId?: string;

  @ApiPropertyOptional({ description: '返回数量，默认20' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class RewardIdDto {
  @ApiProperty({ description: '打赏ID' })
  @IsUUID()
  id: string;
}

export interface RewardRankItem {
  userId: string;
  username: string;
  nickname: string;
  avatar: string;
  totalAmount: number;
  rank: number;
}
