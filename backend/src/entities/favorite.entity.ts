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

export enum FavoriteType {
  READ_LATER = 'read_later',
  FAVORITE = 'favorite',
  COLLECTION = 'collection',
}

@Entity('favorites')
@Unique(['userId', 'workId', 'type'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
@Index("idx_favorite_1")
  userId: string;

  @Column({ type: 'uuid' })
@Index("idx_favorite_2")
  workId: string;

  @Column({
    type: 'enum',
    enum: FavoriteType,
    default: FavoriteType.FAVORITE,
  })
@Index("idx_favorite_3")
  type: FavoriteType;

  @Column({ type: 'uuid', nullable: true })
  collectionId: string;

  @Column({ type: 'int', default: 0 })
  lastReadChapter: number;

  @Column({ type: 'int', default: 0 })
  progressPercent: number;

  @Column({ type: 'boolean', default: true })
  notifyOnUpdate: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note: string;

  @Column({ type: 'datetime', nullable: true })
  lastReadAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Work, (work) => work.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workId' })
  work: Work;
}
