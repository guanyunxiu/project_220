import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import {
  CreateRewardDto,
  QueryRewardsDto,
  RewardRankQueryDto,
  RewardIdDto,
  RewardRankItem,
} from './dto/rewards.dto';
import { GetCurrentUserId, GetIp } from '../common/decorators/user.decorator';
import { Reward } from '../entities/reward.entity';
import { PaginationResultDto } from '../common/dto/pagination.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('打赏')
@Controller('rewards')
@ApiBearerAuth()
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  @ApiOperation({ summary: '创建打赏' })
  create(
    @GetCurrentUserId() userId: string,
    @Body() createRewardDto: CreateRewardDto,
    @GetIp() ipAddress: string,
  ): Promise<Reward> {
    return this.rewardsService.create(userId, createRewardDto, ipAddress);
  }

  @Get('mine')
  @ApiOperation({ summary: '获取我的打赏记录' })
  getMyRewards(
    @GetCurrentUserId() userId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ): Promise<PaginationResultDto<Reward>> {
    return this.rewardsService.getMyRewards(
      userId,
      parseInt(page, 10),
      parseInt(pageSize, 10),
    );
  }

  @Public()
  @Get('work/:workId')
  @ApiOperation({ summary: '获取作品的打赏记录' })
  getWorkRewards(
    @Param('workId') workId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ): Promise<PaginationResultDto<Reward>> {
    return this.rewardsService.getWorkRewards(
      workId,
      parseInt(page, 10),
      parseInt(pageSize, 10),
    );
  }

  @Public()
  @Get('rank')
  @ApiOperation({ summary: '获取打赏榜单' })
  getRank(@Query() rankQuery: RewardRankQueryDto): Promise<RewardRankItem[]> {
    return this.rewardsService.getRank(rankQuery);
  }

  @Get('unlocked/:workId')
  @ApiOperation({ summary: '获取已通过打赏解锁的章节ID列表' })
  checkUnlockedChapters(
    @GetCurrentUserId() userId: string,
    @Param('workId') workId: string,
  ): Promise<string[]> {
    return this.rewardsService.checkUnlockedChapters(userId, workId);
  }

  @Get()
  @ApiOperation({ summary: '获取打赏记录列表' })
  findAll(@Query() queryRewardsDto: QueryRewardsDto): Promise<PaginationResultDto<Reward>> {
    return this.rewardsService.findAll(queryRewardsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取打赏详情' })
  findOne(@Param() rewardIdDto: RewardIdDto): Promise<Reward> {
    return this.rewardsService.findById(rewardIdDto.id);
  }
}
