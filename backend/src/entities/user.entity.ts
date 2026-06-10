import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Work } from './work.entity';
import { Subscription } from './subscription.entity';
import { Favorite } from './favorite.entity';
import { Reward } from './reward.entity';
import { Comment } from './comment.entity';
import { ReadingHistory } from './reading-history.entity';
import { Notification } from './notification.entity';
import { Draft } from './draft.entity';

export enum UserRole {
  USER = 'user',
  AUTHOR = 'author',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
@Index("idx_user_1")
  username: string;

  @Column({ type: 'varchar', length: 100, unique: true })
@Index("idx_user_2")
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
@Index("idx_user_3")
  phone: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nickname: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'int', default: 0 })
  totalReads: number;

  @Column({ type: 'int', default: 0 })
  totalWorks: number;

  @Column({ type: 'int', default: 0 })
  totalFollowers: number;

  @Column({ type: 'int', default: 0 })
  totalFollowing: number;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  refreshToken: string;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastLoginIp: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => Work, (work) => work.author)
  works: Work[];

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Reward, (reward) => reward.user)
  rewards: Reward[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => ReadingHistory, (history) => history.user)
  readingHistories: ReadingHistory[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Draft, (draft) => draft.author)
  drafts: Draft[];
}
