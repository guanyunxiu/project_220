import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, IsNull, In } from 'typeorm';
import { Comment, CommentStatus } from '../entities/comment.entity';
import { Work } from '../entities/work.entity';
import { UserRole } from '../entities/user.entity';
import {
  CreateCommentDto,
  UpdateCommentDto,
  UpdateCommentStatusDto,
  QueryCommentsDto,
} from './dto/comments.dto';
import {
  PaginationResultDto,
  createPaginationResult,
} from '../common/dto/pagination.dto';

interface DFAState {
  transitions: Map<string, DFAState>;
  isEnd: boolean;
}

@Injectable()
export class CommentsService {
  private root: DFAState = { transitions: new Map(), isEnd: false };
  private sensitiveWords: Set<string> = new Set();

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
  ) {
    this.loadDefaultSensitiveWords();
  }

  private loadDefaultSensitiveWords(): void {
    const defaults = [
      '色情',
      '赌博',
      '毒品',
      '暴力',
      '恐怖',
    ];
    defaults.forEach((word) => this.addSensitiveWord(word));
  }

  addSensitiveWord(word: string): void {
    if (!word || !word.trim()) return;
    this.sensitiveWords.add(word);
    let current = this.root;
    for (const char of word) {
      if (!current.transitions.has(char)) {
        current.transitions.set(char, { transitions: new Map(), isEnd: false });
      }
      current = current.transitions.get(char)!;
    }
    current.isEnd = true;
  }

  filterSensitiveWords(text: string): { filtered: string; hasSensitive: boolean; matchedWords: string[] } {
    const matchedWords: Set<string> = new Set();
    let result = '';
    let i = 0;

    while (i < text.length) {
      let current = this.root;
      let found = false;
      let maxMatchLength = 0;

      for (let j = i; j < text.length; j++) {
        const char = text[j];
        if (current.transitions.has(char)) {
          current = current.transitions.get(char)!;
          if (current.isEnd) {
            maxMatchLength = j - i + 1;
          }
        } else {
          break;
        }
      }

      if (maxMatchLength > 0) {
        const matched = text.slice(i, i + maxMatchLength);
        matchedWords.add(matched);
        result += '*'.repeat(maxMatchLength);
        i += maxMatchLength;
        found = true;
      }

      if (!found) {
        result += text[i];
        i++;
      }
    }

    return {
      filtered: result,
      hasSensitive: matchedWords.size > 0,
      matchedWords: Array.from(matchedWords),
    };
  }

  async create(
    userId: string,
    createCommentDto: CreateCommentDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<Comment> {
    const { workId, chapterId, parentId, replyToUserId, content, isSpoiler } =
      createCommentDto;

    const work = await this.workRepository.findOne({ where: { id: workId } });
    if (!work) {
      throw new NotFoundException('作品不存在');
    }

    if (parentId) {
      const parent = await this.commentRepository.findOne({
        where: { id: parentId },
      });
      if (!parent || parent.workId !== workId) {
        throw new BadRequestException('父评论不存在或不属于该作品');
      }
      if (parent.parentId) {
        throw new BadRequestException('只能回复一级评论');
      }
    }

    const { filtered, hasSensitive } = this.filterSensitiveWords(content);

    const comment = this.commentRepository.create({
      userId,
      workId,
      chapterId: chapterId || null,
      parentId: parentId || null,
      replyToUserId: replyToUserId || null,
      content: filtered,
      status: hasSensitive ? CommentStatus.PENDING : CommentStatus.APPROVED,
      isSpoiler: isSpoiler || false,
      ipAddress,
      userAgent,
    });

    const saved = await this.commentRepository.save(comment);

    await this.workRepository.increment({ id: workId }, 'totalComments', 1);

    if (parentId) {
      await this.commentRepository.increment(
        { id: parentId },
        'repliesCount',
        1,
      );
    }

    return this.findById(saved.id);
  }

  async findAll(
    queryCommentsDto: QueryCommentsDto,
  ): Promise<PaginationResultDto<Comment>> {
    const { page, pageSize, sortBy, sortOrder, keyword, workId, chapterId, parentId, userId, status, hot } =
      queryCommentsDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'replyUser');

    if (!parentId) {
      queryBuilder.andWhere('comment.parentId IS NULL');
    } else {
      queryBuilder.andWhere('comment.parentId = :parentId', { parentId });
    }

    if (workId) {
      queryBuilder.andWhere('comment.workId = :workId', { workId });
    }

    if (chapterId) {
      queryBuilder.andWhere('comment.chapterId = :chapterId', { chapterId });
    }

    if (userId) {
      queryBuilder.andWhere('comment.userId = :userId', { userId });
    }

    if (keyword) {
      queryBuilder.andWhere('comment.content LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('comment.status = :status', { status });
    } else {
      queryBuilder.andWhere('comment.status = :status', {
        status: CommentStatus.APPROVED,
      });
    }

    if (hot) {
      queryBuilder.orderBy('comment.likes', 'DESC');
    } else {
      const validSortFields = ['createdAt', 'likes', 'dislikes', 'repliesCount'];
      const sortField = validSortFields.includes(sortBy)
        ? `comment.${sortBy}`
        : 'comment.isPinned';
      queryBuilder.orderBy(sortField, sortOrder);
      queryBuilder.addOrderBy('comment.createdAt', 'DESC');
    }

    queryBuilder.skip(skip).take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    return createPaginationResult(items, total, page, pageSize);
  }

  async findById(id: string): Promise<Comment> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'replyUser')
      .where('comment.id = :id', { id })
      .getOne();

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }
    return comment;
  }

  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.findById(id);

    if (comment.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限修改此评论');
    }

    const updateData: any = { ...updateCommentDto };

    if (updateCommentDto.content) {
      const { filtered, hasSensitive } = this.filterSensitiveWords(
        updateCommentDto.content,
      );
      updateData.content = filtered;
      updateData.isEdited = true;
      updateData.editedAt = new Date();
      if (hasSensitive) {
        updateData.status = CommentStatus.PENDING;
      }
    }

    await this.commentRepository.update(id, updateData);
    return this.findById(id);
  }

  async remove(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const comment = await this.findById(id);

    if (comment.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限删除此评论');
    }

    await this.commentRepository.update(id, {
      status: CommentStatus.DELETED,
    });

    await this.workRepository.decrement(
      { id: comment.workId },
      'totalComments',
      1,
    );

    if (comment.parentId) {
      await this.commentRepository.decrement(
        { id: comment.parentId },
        'repliesCount',
        1,
      );
    }
  }

  async like(
    id: string,
    userId: string,
    like: boolean,
  ): Promise<{ likes: number; dislikes: number }> {
    const comment = await this.findById(id);

    if (like) {
      await this.commentRepository.increment({ id }, 'likes', 1);
    } else {
      await this.commentRepository.increment({ id }, 'dislikes', 1);
    }

    const updated = await this.commentRepository.findOne({ where: { id } });
    return {
      likes: updated?.likes || 0,
      dislikes: updated?.dislikes || 0,
    };
  }

  async updateStatus(
    id: string,
    userRole: UserRole,
    updateCommentStatusDto: UpdateCommentStatusDto,
  ): Promise<Comment> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限修改评论状态');
    }

    await this.commentRepository.update(id, updateCommentStatusDto);
    return this.findById(id);
  }

  async pin(id: string, userRole: UserRole): Promise<Comment> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限精选评论');
    }

    await this.commentRepository.update(id, { isPinned: true });
    return this.findById(id);
  }

  async unpin(id: string, userRole: UserRole): Promise<Comment> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('没有权限取消精选评论');
    }

    await this.commentRepository.update(id, { isPinned: false });
    return this.findById(id);
  }

  async getHotComments(
    workId: string,
    limit: number = 10,
  ): Promise<Comment[]> {
    return this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.workId = :workId', { workId })
      .andWhere('comment.status = :status', { status: CommentStatus.APPROVED })
      .andWhere('comment.parentId IS NULL')
      .orderBy('comment.likes', 'DESC')
      .addOrderBy('comment.repliesCount', 'DESC')
      .limit(limit)
      .getMany();
  }
}
