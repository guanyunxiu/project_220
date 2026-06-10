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
} from 'class-validator';
import { Type } from 'class-transformer';
import { VolumeStatus } from '../../entities/volume.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateVolumeDto {
  @ApiProperty({ description: '所属作品ID' })
  @IsUUID()
  workId: string;

  @ApiProperty({ description: '卷标题' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: '卷slug' })
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

  @ApiPropertyOptional({ description: '封面图片URL' })
  @IsOptional()
  @IsUrl()
  cover?: string;

  @ApiPropertyOptional({ description: '卷描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '卷状态', enum: VolumeStatus })
  @IsOptional()
  @IsEnum(VolumeStatus)
  status?: VolumeStatus;

  @ApiPropertyOptional({ description: '是否可见' })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class UpdateVolumeDto {
  @ApiPropertyOptional({ description: '卷标题' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: '卷slug' })
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

  @ApiPropertyOptional({ description: '封面图片URL' })
  @IsOptional()
  @IsUrl()
  cover?: string;

  @ApiPropertyOptional({ description: '卷描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '卷状态', enum: VolumeStatus })
  @IsOptional()
  @IsEnum(VolumeStatus)
  status?: VolumeStatus;

  @ApiPropertyOptional({ description: '是否可见' })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class UpdateVolumeStatusDto {
  @ApiProperty({ description: '卷状态', enum: VolumeStatus })
  @IsEnum(VolumeStatus)
  status: VolumeStatus;
}

export class QueryVolumesDto extends PaginationDto {
  @ApiPropertyOptional({ description: '作品ID' })
  @IsOptional()
  @IsUUID()
  workId?: string;

  @ApiPropertyOptional({ description: '卷状态', enum: VolumeStatus })
  @IsOptional()
  @IsEnum(VolumeStatus)
  status?: VolumeStatus;

  @ApiPropertyOptional({ description: '是否只看可见' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  onlyVisible?: boolean;
}

export class VolumeIdDto {
  @ApiProperty({ description: '卷ID' })
  @IsUUID()
  id: string;
}
