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

export enum RewardStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('rewards')
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
@Index("idx_reward_1")
  userId: string;

  @Column({ type: 'uuid' })
@Index("idx_reward_2")
  workId: string;

  @Column({ type: 'uuid', nullable: true })
  chapterId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'CNY' })
  currency: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  orderId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionId: string;

  @Column({
    type: 'enum',
    enum: RewardStatus,
    default: RewardStatus.PENDING,
  })
@Index("idx_reward_3")
  status: RewardStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  giftType: string;

  @Column({ type: 'int', default: 1 })
  giftQuantity: number;

  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  message: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.rewards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Work, (work) => work.rewards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workId' })
  work: Work;
}
