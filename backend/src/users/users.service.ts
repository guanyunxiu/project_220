import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, Like } from 'typeorm';
import * as crypto from 'crypto';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
  QueryUsersDto,
} from './dto/users.dto';
import {
  PaginationResultDto,
  createPaginationResult,
} from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(queryUsersDto: QueryUsersDto): Promise<PaginationResultDto<User>> {
    const { page, pageSize, sortBy, sortOrder, keyword, role, status } = queryUsersDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (keyword) {
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where('user.username LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('user.nickname LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('user.email LIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    const validSortFields = ['createdAt', 'updatedAt', 'username', 'totalWorks', 'totalFollowers'];
    const sortField = validSortFields.includes(sortBy) ? `user.${sortBy}` : 'user.createdAt';
    queryBuilder.orderBy(sortField, sortOrder);

    queryBuilder.skip(skip).take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return createPaginationResult(items, total, page, pageSize);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async getCurrentUser(userId: string): Promise<User> {
    return this.findById(userId);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, phone, password } = createUserDto;

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
      ...createUserDto,
      password: this.hashPassword(password),
      role: createUserDto.role || UserRole.USER,
      status: UserStatus.ACTIVE,
    });

    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findById(id);

    if (updateUserDto.email || updateUserDto.phone) {
      const existingUser = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id != :id', { id })
        .andWhere(
          new Brackets((qb) => {
            if (updateUserDto.email) {
              qb.orWhere('user.email = :email', { email: updateUserDto.email });
            }
            if (updateUserDto.phone) {
              qb.orWhere('user.phone = :phone', { phone: updateUserDto.phone });
            }
          }),
        )
        .getOne();

      if (existingUser) {
        if (updateUserDto.email && existingUser.email === updateUserDto.email) {
          throw new ConflictException('邮箱已被使用');
        }
        if (updateUserDto.phone && existingUser.phone === updateUserDto.phone) {
          throw new ConflictException('手机号已被使用');
        }
      }
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async updateStatus(
    id: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<User> {
    await this.findById(id);
    await this.userRepository.update(id, { status: updateUserStatusDto.status });
    return this.findById(id);
  }

  async updateRole(
    id: string,
    updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<User> {
    const user = await this.findById(id);

    if (user.role === UserRole.ADMIN && updateUserRoleDto.role !== UserRole.ADMIN) {
      const adminCount = await this.userRepository.count({
        where: { role: UserRole.ADMIN },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('至少需要保留一个管理员');
      }
    }

    await this.userRepository.update(id, { role: updateUserRoleDto.role });
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.userRepository.count({
        where: { role: UserRole.ADMIN },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('至少需要保留一个管理员');
      }
    }
    await this.userRepository.delete(id);
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}
