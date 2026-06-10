import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../entities/user.entity';

export const GetCurrentUser = createParamDecorator(
  (data: keyof User | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    return data ? user?.[data] : user;
  },
);

export const GetCurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    return request.user?.id;
  },
);

export const GetIp = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const ip =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.ip;
    return Array.isArray(ip) ? ip[0] : ip;
  },
);

export const GetUserAgent = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    return request.headers['user-agent'] || '';
  },
);
