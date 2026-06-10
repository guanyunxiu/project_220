import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChaptersService, TableOfContents } from './chapters.service';
import {
  CreateChapterDto,
  UpdateChapterDto,
  UpdateChapterStatusDto,
  QueryChaptersDto,
  ChapterIdDto,
  UnlockChapterDto,
} from './dto/chapters.dto';
import {
  GetCurrentUserId,
  GetCurrentUser,
} from '../common/decorators/user.decorator';
import { Chapter } from '../entities/chapter.entity';
import { UserRole } from '../entities/user.entity';
import { PaginationResultDto } from '../common/dto/pagination.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('章节')
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取章节列表' })
  findAll(@Query() queryChaptersDto: QueryChaptersDto): Promise<PaginationResultDto<Chapter>> {
    return this.chaptersService.findAll(queryChaptersDto);
  }

  @Public()
  @Get('toc/work/:workId')
  @ApiOperation({ summary: '获取作品目录' })
  getTableOfContents(
    @Param('workId') workId: string,
    @GetCurrentUserId() userId?: string,
  ): Promise<TableOfContents> {
    return this.chaptersService.getTableOfContents(workId, userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取章节详情' })
  findOne(
    @Param() chapterIdDto: ChapterIdDto,
    @GetCurrentUserId() userId?: string,
  ): Promise<Chapter> {
    return this.chaptersService.findById(chapterIdDto.id, true, userId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建章节' })
  create(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
    @Body() createChapterDto: CreateChapterDto,
  ): Promise<Chapter> {
    return this.chaptersService.create(userId, userRole, createChapterDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新章节' })
  update(
    @Param() chapterIdDto: ChapterIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
    @Body() updateChapterDto: UpdateChapterDto,
  ): Promise<Chapter> {
    return this.chaptersService.update(chapterIdDto.id, userId, userRole, updateChapterDto);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新章节状态' })
  updateStatus(
    @Param() chapterIdDto: ChapterIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
    @Body() updateChapterStatusDto: UpdateChapterStatusDto,
  ): Promise<Chapter> {
    return this.chaptersService.updateStatus(
      chapterIdDto.id,
      userId,
      userRole,
      updateChapterStatusDto,
    );
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '上架章节' })
  publish(
    @Param() chapterIdDto: ChapterIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
  ): Promise<Chapter> {
    return this.chaptersService.publish(chapterIdDto.id, userId, userRole);
  }

  @Post(':id/unpublish')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '下架章节' })
  unpublish(
    @Param() chapterIdDto: ChapterIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
  ): Promise<Chapter> {
    return this.chaptersService.unpublish(chapterIdDto.id, userId, userRole);
  }

  @Public()
  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '增加章节浏览量' })
  incrementViews(@Param() chapterIdDto: ChapterIdDto): Promise<void> {
    return this.chaptersService.incrementViews(chapterIdDto.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除章节' })
  remove(
    @Param() chapterIdDto: ChapterIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
  ): Promise<void> {
    return this.chaptersService.remove(chapterIdDto.id, userId, userRole);
  }
}
