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
import { Chapter } from './chapter.entity';

export enum VolumeStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  COMPLETED = 'completed',
}

@Entity('volumes')
export class Volume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
@Index("idx_volume_1")
  workId: string;

  @Column({ type: 'int', default: 1 })
@Index("idx_volume_2")
  order: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: VolumeStatus,
    default: VolumeStatus.DRAFT,
  })
@Index("idx_volume_3")
  status: VolumeStatus;

  @Column({ type: 'boolean', default: true })
  isVisible: boolean;

  @Column({ type: 'int', default: 0 })
  totalChapters: number;

  @Column({ type: 'bigint', default: 0 })
  totalWords: number;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Work, (work) => work.volumes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workId' })
  work: Work;

  @OneToMany(() => Chapter, (chapter) => chapter.volume)
  chapters: Chapter[];
}
