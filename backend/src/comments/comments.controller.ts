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
import { CommentsService } from './comments.service';
import {
  CreateCommentDto,
  UpdateCommentDto,
  UpdateCommentStatusDto,
  QueryCommentsDto,
  CommentIdDto,
  LikeCommentDto,
} from './dto/comments.dto';
import {
  GetCurrentUserId,
  GetCurrentUser,
  GetIp,
  GetUserAgent,
} from '../common/decorators/user.decorator';
import { Comment } from '../entities/comment.entity';
import { UserRole } from '../entities/user.entity';
import { PaginationResultDto } from '../common/dto/pagination.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('评论')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '发表评论' })
  create(
    @GetCurrentUserId() userId: string,
    @Body() createCommentDto: CreateCommentDto,
    @GetIp() ipAddress: string,
    @GetUserAgent() userAgent: string,
  ): Promise<Comment> {
    return this.commentsService.create(
      userId,
      createCommentDto,
      ipAddress,
      userAgent,
    );
  }

  @Public()
  @Get()
  @ApiOperation({ summary: '获取评论列表' })
  findAll(@Query() queryCommentsDto: QueryCommentsDto): Promise<PaginationResultDto<Comment>> {
    return this.commentsService.findAll(queryCommentsDto);
  }

  @Public()
  @Get('hot/:workId')
  @ApiOperation({ summary: '获取热门评论' })
  getHotComments(
    @Param('workId') workId: string,
    @Query('limit') limit: string = '10',
  ): Promise<Comment[]> {
    return this.commentsService.getHotComments(workId, parseInt(limit, 10));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取评论详情' })
  findOne(@Param() commentIdDto: CommentIdDto): Promise<Comment> {
    return this.commentsService.findById(commentIdDto.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新评论' })
  update(
    @Param() commentIdDto: CommentIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    return this.commentsService.update(
      commentIdDto.id,
      userId,
      userRole,
      updateCommentDto,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除评论' })
  remove(
    @Param() commentIdDto: CommentIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
  ): Promise<void> {
    return this.commentsService.remove(commentIdDto.id, userId, userRole);
  }

  @Post(':id/like')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '评论点赞/点踩' })
  like(
    @Param() commentIdDto: CommentIdDto,
    @GetCurrentUserId() userId: string,
    @Body() likeCommentDto: LikeCommentDto,
  ): Promise<{ likes: number; dislikes: number }> {
    return this.commentsService.like(
      commentIdDto.id,
      userId,
      likeCommentDto.like,
    );
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新评论状态（管理员）' })
  updateStatus(
    @Param() commentIdDto: CommentIdDto,
    @GetCurrentUser('role') userRole: UserRole,
    @Body() updateCommentStatusDto: UpdateCommentStatusDto,
  ): Promise<Comment> {
    return this.commentsService.updateStatus(
      commentIdDto.id,
      userRole,
      updateCommentStatusDto,
    );
  }

  @Post(':id/pin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '精选评论（管理员）' })
  pin(
    @Param() commentIdDto: CommentIdDto,
    @GetCurrentUser('role') userRole: UserRole,
  ): Promise<Comment> {
    return this.commentsService.pin(commentIdDto.id, userRole);
  }

  @Post(':id/unpin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '取消精选评论（管理员）' })
  unpin(
    @Param() commentIdDto: CommentIdDto,
    @GetCurrentUser('role') userRole: UserRole,
  ): Promise<Comment> {
    return this.commentsService.unpin(commentIdDto.id, userRole);
  }
}
