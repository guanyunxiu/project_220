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
import { ReadingHistoryService } from './reading-history.service';
import {
  CreateReadingHistoryDto,
  UpdateReadingHistoryDto,
  QueryReadingHistoryDto,
  ClearHistoryDto,
  ReadingHistoryIdDto,
} from './dto/reading-history.dto';
import {
  GetCurrentUserId,
  GetIp,
  GetUserAgent,
} from '../common/decorators/user.decorator';
import { ReadingHistory } from '../entities/reading-history.entity';
import { PaginationResultDto } from '../common/dto/pagination.dto';

@ApiTags('阅读历史')
@Controller('reading-history')
@ApiBearerAuth()
export class ReadingHistoryController {
  constructor(private readonly readingHistoryService: ReadingHistoryService) {}

  @Post()
  @ApiOperation({ summary: '创建/更新阅读记录' })
  create(
    @GetCurrentUserId() userId: string,
    @Body() createDto: CreateReadingHistoryDto,
    @GetIp() ipAddress: string,
    @GetUserAgent() userAgent: string,
  ): Promise<ReadingHistory> {
    return this.readingHistoryService.create(
      userId,
      createDto,
      ipAddress,
      userAgent,
    );
  }

  @Get()
  @ApiOperation({ summary: '获取我的阅读历史' })
  findAll(
    @GetCurrentUserId() userId: string,
    @Query() queryDto: QueryReadingHistoryDto,
  ): Promise<PaginationResultDto<ReadingHistory>> {
    return this.readingHistoryService.findAll(userId, queryDto);
  }

  @Get('continue')
  @ApiOperation({ summary: '获取续接阅读列表' })
  getContinueReading(
    @GetCurrentUserId() userId: string,
    @Query('limit') limit: string = '10',
  ): Promise<ReadingHistory[]> {
    return this.readingHistoryService.getContinueReading(
      userId,
      parseInt(limit, 10),
    );
  }

  @Get('last/:workId')
  @ApiOperation({ summary: '获取作品的最后阅读记录' })
  getLastRead(
    @GetCurrentUserId() userId: string,
    @Param('workId') workId: string,
  ): Promise<ReadingHistory | null> {
    return this.readingHistoryService.getLastRead(userId, workId);
  }

  @Get('read-chapters/:workId')
  @ApiOperation({ summary: '获取作品已读章节ID列表' })
  getReadChapters(
    @GetCurrentUserId() userId: string,
    @Param('workId') workId: string,
  ): Promise<string[]> {
    return this.readingHistoryService.getReadChapters(userId, workId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取阅读记录详情' })
  findOne(@Param() idDto: ReadingHistoryIdDto): Promise<ReadingHistory> {
    return this.readingHistoryService.findById(idDto.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新阅读记录' })
  update(
    @GetCurrentUserId() userId: string,
    @Param() idDto: ReadingHistoryIdDto,
    @Body() updateDto: UpdateReadingHistoryDto,
  ): Promise<ReadingHistory> {
    return this.readingHistoryService.update(userId, idDto.id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除单条阅读记录' })
  remove(
    @GetCurrentUserId() userId: string,
    @Param() idDto: ReadingHistoryIdDto,
  ): Promise<void> {
    return this.readingHistoryService.remove(userId, idDto.id);
  }

  @Post('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '清除阅读历史' })
  clear(
    @GetCurrentUserId() userId: string,
    @Body() clearDto: ClearHistoryDto,
  ): Promise<void> {
    return this.readingHistoryService.clear(userId, clearDto.workId);
  }
}
