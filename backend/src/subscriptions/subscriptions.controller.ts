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
import { SubscriptionsService, UnreadUpdate } from './subscriptions.service';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  QuerySubscriptionsDto,
  SubscriptionIdDto,
} from './dto/subscriptions.dto';
import { GetCurrentUserId } from '../common/decorators/user.decorator';
import { Subscription } from '../entities/subscription.entity';
import { PaginationResultDto } from '../common/dto/pagination.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('订阅')
@Controller('subscriptions')
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: '订阅作品' })
  subscribe(
    @GetCurrentUserId() userId: string,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    return this.subscriptionsService.subscribe(userId, createSubscriptionDto);
  }

  @Delete('work/:workId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '取消订阅' })
  unsubscribe(
    @GetCurrentUserId() userId: string,
    @Param('workId') workId: string,
  ): Promise<void> {
    return this.subscriptionsService.unsubscribe(userId, workId);
  }

  @Get()
  @ApiOperation({ summary: '获取我的订阅列表' })
  findAll(
    @GetCurrentUserId() userId: string,
    @Query() querySubscriptionsDto: QuerySubscriptionsDto,
  ): Promise<PaginationResultDto<Subscription>> {
    return this.subscriptionsService.findAll(userId, querySubscriptionsDto);
  }

  @Get('unread')
  @ApiOperation({ summary: '获取订阅更新红点' })
  getUnreadUpdates(
    @GetCurrentUserId() userId: string,
  ): Promise<UnreadUpdate[]> {
    return this.subscriptionsService.getUnreadUpdates(userId);
  }

  @Get('check/:workId')
  @ApiOperation({ summary: '检查是否已订阅' })
  checkSubscription(
    @GetCurrentUserId() userId: string,
    @Param('workId') workId: string,
  ): Promise<Subscription | null> {
    return this.subscriptionsService.checkSubscription(userId, workId);
  }

  @Public()
  @Get('count/:workId')
  @ApiOperation({ summary: '获取作品订阅数' })
  getSubscriberCount(
    @Param('workId') workId: string,
  ): Promise<{ count: number }> {
    return this.subscriptionsService
      .getSubscriberCount(workId)
      .then((count) => ({ count }));
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订阅详情' })
  findOne(@Param() subscriptionIdDto: SubscriptionIdDto): Promise<Subscription> {
    return this.subscriptionsService.findById(subscriptionIdDto.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新订阅设置' })
  update(
    @Param() subscriptionIdDto: SubscriptionIdDto,
    @GetCurrentUserId() userId: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    return this.subscriptionsService.update(
      subscriptionIdDto.id,
      userId,
      updateSubscriptionDto,
    );
  }
}
