import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Work } from './work.entity';
import { Chapter } from './chapter.entity';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SPAM = 'spam',
  DELETED = 'deleted',
}

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
@Index("idx_comment_1")
  userId: string;

  @Column({ type: 'uuid' })
@Index("idx_comment_2")
  workId: string;

  @Column({ type: 'uuid', nullable: true })
@Index("idx_comment_3")
  chapterId: string;

  @Column({ type: 'uuid', nullable: true })
@Index("idx_comment_4")
  parentId: string;

  @Column({ type: 'uuid', nullable: true })
  replyToUserId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.APPROVED,
  })
@Index("idx_comment_5")
  status: CommentStatus;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'int', default: 0 })
  dislikes: number;

  @Column({ type: 'int', default: 0 })
  repliesCount: number;

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ type: 'boolean', default: false })
  isSpoiler: boolean;

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'datetime', nullable: true })
  editedAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Work, (work) => work.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workId' })
  work: Work;

  @ManyToOne(() => Chapter, (chapter) => chapter.comments, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'chapterId' })
  chapter: Chapter;

  @OneToMany(() => Comment, (comment) => comment.parentId)
  replies: Comment[];
}
