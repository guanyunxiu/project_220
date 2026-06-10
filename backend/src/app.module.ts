import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import configuration from './config/configuration';

import { User } from './entities/user.entity';
import { Work } from './entities/work.entity';
import { Chapter } from './entities/chapter.entity';
import { Volume } from './entities/volume.entity';
import { Subscription } from './entities/subscription.entity';
import { Favorite } from './entities/favorite.entity';
import { Reward } from './entities/reward.entity';
import { Comment } from './entities/comment.entity';
import { ReadingHistory } from './entities/reading-history.entity';
import { Notification } from './entities/notification.entity';
import { Draft } from './entities/draft.entity';

import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorksModule } from './works/works.module';
import { VolumesModule } from './volumes/volumes.module';
import { ChaptersModule } from './chapters/chapters.module';
import { UploadModule } from './upload/upload.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { FavoritesModule } from './favorites/favorites.module';
import { RewardsModule } from './rewards/rewards.module';
import { CommentsModule } from './comments/comments.module';
import { ReadingHistoryModule } from './reading-history/reading-history.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { SensitiveModule } from './sensitive/sensitive.module';
import { QueueModule } from './queue/queue.module';

const entities = [
  User,
  Work,
  Chapter,
  Volume,
  Subscription,
  Favorite,
  Reward,
  Comment,
  ReadingHistory,
  Notification,
  Draft,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        charset: configService.get<string>('database.charset'),
        timezone: configService.get<string>('database.timezone'),
        entities,
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        autoLoadEntities: false,
        keepConnectionAlive: true,
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password') || undefined,
          db: configService.get<number>('redis.db'),
        },
        defaultJobOptions: {
          attempts: configService.get<number>('bull.attempts'),
          backoff: {
            type: configService.get<any>('bull.backoff.type'),
            delay: configService.get<number>('bull.backoff.delay'),
          },
        },
      }),
    }),

    BullModule.registerQueueAsync({
      name: 'novel-queue',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        name: configService.get<string>('bull.defaultQueue'),
      }),
    }),

    TypeOrmModule.forFeature(entities),

    CommonModule,
    AuthModule,
    UsersModule,
    WorksModule,
    VolumesModule,
    ChaptersModule,
    UploadModule,
    SubscriptionsModule,
    FavoritesModule,
    RewardsModule,
    CommentsModule,
    ReadingHistoryModule,
    NotificationsModule,
    SearchModule,
    SensitiveModule,
    QueueModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
