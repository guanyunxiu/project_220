import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Work } from './work.entity';

export enum SubscriptionType {
  FREE = 'free',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

@Entity('subscriptions')
@Unique(['userId', 'workId'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
@Index("idx_subscription_1")
  userId: string;

  @Column({ type: 'uuid' })
@Index("idx_subscription_2")
  workId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionType,
    default: SubscriptionType.FREE,
  })
  type: SubscriptionType;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
@Index("idx_subscription_3")
  status: SubscriptionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  orderId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionId: string;

  @Column({ type: 'datetime', nullable: true })
  startDate: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate: Date;

  @Column({ type: 'boolean', default: true })
  autoRenew: boolean;

  @Column({ type: 'boolean', default: true })
  emailNotification: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Work, (work) => work.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workId' })
  work: Work;
}
