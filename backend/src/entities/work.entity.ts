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
import { Volume } from './volume.entity';
import { Chapter } from './chapter.entity';
import { Subscription } from './subscription.entity';
import { Favorite } from './favorite.entity';
import { Reward } from './reward.entity';
import { Comment } from './comment.entity';
import { Draft } from './draft.entity';

export enum WorkType {
  NOVEL = 'novel',
  COMIC = 'comic',
}

export enum WorkStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  COMPLETED = 'completed',
  HIATUS = 'hiatus',
  BANNED = 'banned',
}

export enum WorkAudience {
  ALL = 'all',
  TEEN = 'teen',
  ADULT = 'adult',
}

@Entity('works')
export class Work {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
@Index("idx_work_1")
  authorId: string;

  @Column({ type: 'varchar', length: 200 })
@Index("idx_work_2")
  title: string;

  @Column({ type: 'varchar', length: 200, unique: true })
@Index("idx_work_3")
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  banner: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: WorkType,
    default: WorkType.NOVEL,
  })
@Index("idx_work_4")
  type: WorkType;

  @Column({
    type: 'enum',
    enum: WorkStatus,
    default: WorkStatus.DRAFT,
  })
@Index("idx_work_5")
  status: WorkStatus;

  @Column({
    type: 'enum',
    enum: WorkAudience,
    default: WorkAudience.ALL,
  })
  audience: WorkAudience;

  @Column({ type: 'varchar', length: 255, nullable: true })
  categories: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tags: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  language: string;

  @Column({ type: 'boolean', default: false })
  isOriginal: boolean;

  @Column({ type: 'boolean', default: false })
  isPremium: boolean;

  @Column({ type: 'boolean', default: true })
  allowComments: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: false })
  isRecommended: boolean;

  @Column({ type: 'int', default: 0 })
  totalVolumes: number;

  @Column({ type: 'int', default: 0 })
  totalChapters: number;

  @Column({ type: 'bigint', default: 0 })
  totalWords: number;

  @Column({ type: 'bigint', default: 0 })
  totalViews: number;

  @Column({ type: 'int', default: 0 })
  uniqueViews: number;

  @Column({ type: 'int', default: 0 })
  totalLikes: number;

  @Column({ type: 'int', default: 0 })
  totalComments: number;

  @Column({ type: 'int', default: 0 })
  totalFavorites: number;

  @Column({ type: 'int', default: 0 })
  totalSubscriptions: number;

  @Column({ type: 'int', default: 0 })
  totalRewards: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalRewardAmount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ type: 'int', default: 0 })
  hotScore: number;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastUpdatedAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.works, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @OneToMany(() => Volume, (volume) => volume.work)
  volumes: Volume[];

  @OneToMany(() => Chapter, (chapter) => chapter.work)
  chapters: Chapter[];

  @OneToMany(() => Subscription, (subscription) => subscription.work)
  subscriptions: Subscription[];

  @OneToMany(() => Favorite, (favorite) => favorite.work)
  favorites: Favorite[];

  @OneToMany(() => Reward, (reward) => reward.work)
  rewards: Reward[];

  @OneToMany(() => Comment, (comment) => comment.work)
  comments: Comment[];

  @OneToMany(() => Draft, (draft) => draft.work)
  drafts: Draft[];
}
