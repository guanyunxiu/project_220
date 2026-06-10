import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User, UserStatus } from '../../entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username OR user.email = :username OR user.phone = :username', {
        username,
      })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('账号已被封禁');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('账号未激活');
    }

    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const { password: _password, refreshToken: _refreshToken, ...result } = user;
    return result;
  }

  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}
