import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
  LoginResponseDto,
} from './dto/auth.dto';
import { GetCurrentUser, GetCurrentUserId } from '../common/decorators/user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../entities/user.entity';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  login(
    @GetCurrentUser() user: User,
    @Body() _loginDto: LoginDto,
  ): Promise<LoginResponseDto> {
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  register(@Body() registerDto: RegisterDto): Promise<LoginResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新令牌' })
  refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录' })
  logout(@GetCurrentUserId() userId: string): Promise<void> {
    return this.authService.logout(userId);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  changePassword(
    @GetCurrentUserId() userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
