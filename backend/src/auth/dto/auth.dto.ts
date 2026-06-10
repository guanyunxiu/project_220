import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '用户名/邮箱/手机号' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' })
  username: string;

  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号' })
  phone?: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty({ description: '确认密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  confirmPassword: string;

  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional({ description: '邀请码' })
  @IsOptional()
  @IsString()
  inviteCode?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  newPassword: string;

  @ApiProperty({ description: '确认新密码' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: '重置令牌' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: '新密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty({ description: '确认新密码' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: '访问令牌' })
  accessToken: string;

  @ApiProperty({ description: '刷新令牌' })
  refreshToken: string;

  @ApiProperty({ description: '过期时间（秒）' })
  expiresIn: number;

  @ApiProperty({ description: '令牌类型' })
  tokenType: string;
}
