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

export enum NotificationType {
  SYSTEM = 'system',
  COMMENT = 'comment',
  LIKE = 'like',
  FOLLOW = 'follow',
  SUBSCRIPTION = 'subscription',
  REWARD = 'reward',
  CHAPTER_UPDATE = 'chapter_update',
  MENTION = 'mention',
  REPORT = 'report',
  NEWS = 'news',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
@Index("idx_notification_1")
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  senderId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
@Index("idx_notification_2")
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  linkUrl: string;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ type: 'uuid', nullable: true })
  relatedId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  relatedType: string;

  @Column({ type: 'boolean', default: false })
@Index("idx_notification_3")
  isRead: boolean;

  @Column({ type: 'boolean', default: false })
@Index("idx_notification_4")
  isDeleted: boolean;

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ type: 'datetime', nullable: true })
  readAt: Date;

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
