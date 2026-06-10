import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Work } from './work.entity';

export enum DraftType {
  WORK = 'work',
  VOLUME = 'volume',
  CHAPTER = 'chapter',
}

export enum DraftStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
}

@Entity('drafts')
export class Draft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
@Index("idx_draft_1")
  authorId: string;

  @Column({ type: 'uuid', nullable: true })
@Index("idx_draft_2")
  workId: string;

  @Column({ type: 'uuid', nullable: true })
  targetId: string;

  @Column({
    type: 'enum',
    enum: DraftType,
    default: DraftType.CHAPTER,
  })
@Index("idx_draft_3")
  type: DraftType;

  @Column({
    type: 'enum',
    enum: DraftStatus,
    default: DraftStatus.DRAFT,
  })
@Index("idx_draft_4")
  status: DraftStatus;

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
  cover: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  categories: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tags: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'int', default: 0 })
  version: number;

  @Column({ type: 'uuid', nullable: true })
  parentDraftId: string;

  @Column({ type: 'text', nullable: true })
  editorNotes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rejectionReason: string;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ type: 'datetime', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  autoSaveAt: Date;

  @Column({ type: 'int', default: 0 })
  wordCount: number;

  @Column({ type: 'int', default: 0 })
  editCount: number;

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastEditIp: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.drafts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => Work, (work) => work.drafts, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'workId' })
  work: Work;
}
