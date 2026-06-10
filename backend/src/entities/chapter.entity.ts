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
import { Work } from './work.entity';
import { Volume } from './volume.entity';
import { Comment } from './comment.entity';
import { ReadingHistory } from './reading-history.entity';

export enum ChapterStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  BANNED = 'banned',
}

export enum ChapterAccess {
  FREE = 'free',
  LOCKED = 'locked',
  PREMIUM = 'premium',
}

@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
@Index("idx_chapter_1")
  workId: string;

  @Column({ type: 'uuid', nullable: true })
@Index("idx_chapter_2")
  volumeId: string;

  @Column({ type: 'int', default: 1 })
@Index("idx_chapter_3")
  order: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'longtext', nullable: true })
  content: string;

  @Column({ type: 'longtext', nullable: true })
  contentHtml: string;

  @Column({ type: 'json', nullable: true })
  images: any;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail: string;

  @Column({
    type: 'enum',
    enum: ChapterStatus,
    default: ChapterStatus.DRAFT,
  })
@Index("idx_chapter_4")
  status: ChapterStatus;

  @Column({
    type: 'enum',
    enum: ChapterAccess,
    default: ChapterAccess.FREE,
  })
  access: ChapterAccess;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'int', default: 0 })
  wordCount: number;

  @Column({ type: 'bigint', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  uniqueViews: number;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'int', default: 0 })
  commentsCount: number;

  @Column({ type: 'boolean', default: false })
  allowComments: boolean;

  @Column({ type: 'boolean', default: false })
  isNsfw: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sourceUrl: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  translator: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  editor: string;

  @Column({ type: 'datetime', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  prevChapterId: string;

  @Column({ type: 'uuid', nullable: true })
  nextChapterId: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Work, (work) => work.chapters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workId' })
  work: Work;

  @ManyToOne(() => Volume, (volume) => volume.chapters, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'volumeId' })
  volume: Volume;

  @OneToMany(() => Comment, (comment) => comment.chapter)
  comments: Comment[];

  @OneToMany(() => ReadingHistory, (history) => history.chapter)
  readingHistories: ReadingHistory[];
}
