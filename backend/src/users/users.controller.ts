import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
  QueryUsersDto,
  UserIdDto,
} from './dto/users.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, User } from '../entities/user.entity';
import { GetCurrentUser, GetCurrentUserId } from '../common/decorators/user.decorator';
import { PaginationResultDto } from '../common/dto/pagination.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('用户')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  getCurrentUser(@GetCurrentUserId() userId: string): Promise<User> {
    return this.usersService.getCurrentUser(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: '更新当前用户信息' })
  updateCurrentUser(
    @GetCurrentUserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(userId, updateUserDto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取指定用户信息' })
  findOne(@Param() userIdDto: UserIdDto): Promise<User> {
    return this.usersService.findById(userIdDto.id);
  }

  @Public()
  @Get('username/:username')
  @ApiOperation({ summary: '根据用户名获取用户信息' })
  findByUsername(@Param('username') username: string): Promise<User> {
    return this.usersService.findByUsername(username);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取用户列表（管理员）' })
  findAll(@Query() queryUsersDto: QueryUsersDto): Promise<PaginationResultDto<User>> {
    return this.usersService.findAll(queryUsersDto);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '创建用户（管理员）' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '更新用户信息（管理员）' })
  update(
    @Param() userIdDto: UserIdDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(userIdDto.id, updateUserDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新用户状态（管理员）' })
  updateStatus(
    @Param() userIdDto: UserIdDto,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<User> {
    return this.usersService.updateStatus(userIdDto.id, updateUserStatusDto);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新用户角色（管理员）' })
  updateRole(
    @Param() userIdDto: UserIdDto,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<User> {
    return this.usersService.updateRole(userIdDto.id, updateUserRoleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除用户（管理员）' })
  remove(@Param() userIdDto: UserIdDto): Promise<void> {
    return this.usersService.remove(userIdDto.id);
  }
}
