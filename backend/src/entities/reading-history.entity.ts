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
import { Chapter } from './chapter.entity';

@Entity('reading_histories')
@Unique(['userId', 'workId', 'chapterId'])
export class ReadingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
@Index("idx_reading_history_1")
  userId: string;

  @Column({ type: 'uuid' })
@Index("idx_reading_history_2")
  workId: string;

  @Column({ type: 'uuid' })
@Index("idx_reading_history_3")
  chapterId: string;

  @Column({ type: 'int', default: 0 })
  page: number;

  @Column({ type: 'int', default: 0 })
  totalPages: number;

  @Column({ type: 'int', default: 0 })
  scrollPosition: number;

  @Column({ type: 'int', default: 0 })
  readPercent: number;

  @Column({ type: 'int', default: 0 })
  secondsSpent: number;

  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  device: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  finishedAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.readingHistories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Chapter, (chapter) => chapter.readingHistories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chapterId' })
  chapter: Chapter;
}
