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
import { WorksService } from './works.service';
import {
  CreateWorkDto,
  UpdateWorkDto,
  UpdateWorkStatusDto,
  QueryWorksDto,
  WorkIdDto,
} from './dto/works.dto';
import {
  GetCurrentUserId,
  GetCurrentUser,
} from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Work, WorkType, WorkStatus } from '../entities/work.entity';
import { User, UserRole } from '../entities/user.entity';
import { PaginationResultDto } from '../common/dto/pagination.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('作品')
@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取作品列表' })
  findAll(@Query() queryWorksDto: QueryWorksDto): Promise<PaginationResultDto<Work>> {
    return this.worksService.findAll(queryWorksDto);
  }

  @Public()
  @Get('hot')
  @ApiOperation({ summary: '获取热门作品' })
  getHotWorks(
    @Query('type') type?: WorkType,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ): Promise<PaginationResultDto<Work>> {
    return this.worksService.getHotWorks(type, page, pageSize);
  }

  @Get('mine')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的作品' })
  getMyWorks(
    @GetCurrentUserId() authorId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ): Promise<PaginationResultDto<Work>> {
    return this.worksService.findByAuthor(authorId, page, pageSize);
  }

  @Public()
  @Get('author/:authorId')
  @ApiOperation({ summary: '获取作者的作品列表' })
  getWorksByAuthor(
    @Param('authorId') authorId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ): Promise<PaginationResultDto<Work>> {
    return this.worksService.findByAuthor(authorId, page, pageSize);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取作品详情' })
  findOne(@Param() workIdDto: WorkIdDto): Promise<Work> {
    return this.worksService.findById(workIdDto.id);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: '根据Slug获取作品详情' })
  findBySlug(@Param('slug') slug: string): Promise<Work> {
    return this.worksService.findBySlug(slug);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建作品' })
  create(
    @GetCurrentUserId() authorId: string,
    @Body() createWorkDto: CreateWorkDto,
  ): Promise<Work> {
    return this.worksService.create(authorId, createWorkDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新作品' })
  update(
    @Param() workIdDto: WorkIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
    @Body() updateWorkDto: UpdateWorkDto,
  ): Promise<Work> {
    return this.worksService.update(workIdDto.id, userId, userRole, updateWorkDto);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新作品状态' })
  updateStatus(
    @Param() workIdDto: WorkIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
    @Body() updateWorkStatusDto: UpdateWorkStatusDto,
  ): Promise<Work> {
    return this.worksService.updateStatus(
      workIdDto.id,
      userId,
      userRole,
      updateWorkStatusDto,
    );
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '上架作品' })
  publish(
    @Param() workIdDto: WorkIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
  ): Promise<Work> {
    return this.worksService.publish(workIdDto.id, userId, userRole);
  }

  @Post(':id/unpublish')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '下架作品' })
  unpublish(
    @Param() workIdDto: WorkIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
  ): Promise<Work> {
    return this.worksService.unpublish(workIdDto.id, userId, userRole);
  }

  @Public()
  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '增加作品浏览量' })
  incrementViews(@Param() workIdDto: WorkIdDto): Promise<void> {
    return this.worksService.incrementViews(workIdDto.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除作品' })
  remove(
    @Param() workIdDto: WorkIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
  ): Promise<void> {
    return this.worksService.remove(workIdDto.id, userId, userRole);
  }
}
