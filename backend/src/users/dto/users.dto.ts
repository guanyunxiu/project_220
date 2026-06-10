import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
  IsUrl,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { UserRole, UserStatus } from '../../entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({ description: '个人简介' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: '用户角色', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({ description: '个人简介' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ description: '用户状态', enum: UserStatus })
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class UpdateUserRoleDto {
  @ApiProperty({ description: '用户角色', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
}

export class QueryUsersDto extends PaginationDto {
  @ApiPropertyOptional({ description: '用户角色', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: '用户状态', enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class UserIdDto {
  @ApiProperty({ description: '用户ID' })
  @IsUUID()
  id: string;
}
