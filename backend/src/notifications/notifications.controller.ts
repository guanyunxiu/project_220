import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  QueryNotificationsDto,
  MarkReadDto,
  NotificationIdDto,
  UnreadCount,
} from './dto/notifications.dto';
import { GetCurrentUserId, GetCurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Notification } from '../entities/notification.entity';
import { UserRole } from '../entities/user.entity';
import { PaginationResultDto } from '../common/dto/pagination.dto';

@ApiTags('通知')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '发送通知（管理员）' })
  create(@Body() createDto: CreateNotificationDto): Promise<Notification[]> {
    return this.notificationsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '获取我的通知列表' })
  findAll(
    @GetCurrentUserId() userId: string,
    @Query() queryDto: QueryNotificationsDto,
  ): Promise<PaginationResultDto<Notification>> {
    return this.notificationsService.findAll(userId, queryDto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读通知数量' })
  getUnreadCount(
    @GetCurrentUserId() userId: string,
  ): Promise<UnreadCount> {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取通知详情（自动标记已读）' })
  findOne(
    @GetCurrentUserId() userId: string,
    @Param() idDto: NotificationIdDto,
  ): Promise<Notification> {
    return this.notificationsService.findById(userId, idDto.id);
  }

  @Post('mark-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '标记通知为已读' })
  markRead(
    @GetCurrentUserId() userId: string,
    @Body() markReadDto: MarkReadDto,
  ): Promise<void> {
    return this.notificationsService.markRead(userId, markReadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除单条通知' })
  remove(
    @GetCurrentUserId() userId: string,
    @Param() idDto: NotificationIdDto,
  ): Promise<void> {
    return this.notificationsService.remove(userId, idDto.id);
  }

  @Post('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '清空所有通知' })
  clearAll(@GetCurrentUserId() userId: string): Promise<void> {
    return this.notificationsService.clearAll(userId);
  }
}
