import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus, UserRole } from '../entities/user.entity';
import {
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
  LoginResponseDto,
} from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login(user: User): Promise<LoginResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();
    const expiresIn = this.configService.get<number>('jwt.expiresIn') || 604800;

    await this.userRepository.update(user.id, {
      refreshToken: this.hashRefreshToken(refreshToken),
      lastLoginAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    const { username, email, phone, password, confirmPassword, nickname } =
      registerDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('两次输入的密码不一致');
    }

    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }, ...(phone ? [{ phone }] : [])],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('用户名已被使用');
      }
      if (existingUser.email === email) {
        throw new ConflictException('邮箱已被注册');
      }
      if (phone && existingUser.phone === phone) {
        throw new ConflictException('手机号已被注册');
      }
    }

    const user = this.userRepository.create({
      username,
      email,
      phone: phone || null,
      password: this.hashPassword(password),
      nickname: nickname || username,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(user);
    return this.login(savedUser);
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginResponseDto> {
    const { refreshToken } = refreshTokenDto;
    const hashedToken = this.hashRefreshToken(refreshToken);

    const user = await this.userRepository.findOne({
      where: { refreshToken: hashedToken },
    });

    if (!user) {
      throw new UnauthorizedException('无效的刷新令牌');
    }

    return this.login(user);
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken: null,
    });
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('两次输入的新密码不一致');
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (user.password !== this.hashPassword(oldPassword)) {
      throw new BadRequestException('旧密码错误');
    }

    await this.userRepository.update(userId, {
      password: this.hashPassword(newPassword),
    });
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private generateRefreshToken(): string {
    return uuidv4() + uuidv4().replace(/-/g, '');
  }

  private hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
