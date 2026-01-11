import { Module } from '@nestjs/common';
import { FeedController } from '@interface/nestjs/controllers/feed.controller';
import { NotificationsController } from '@interface/nestjs/controllers/notifications.controller';
import { SSEService } from '@infrastructure/services/SSEService';
import { InMemoryArticleRepository } from '@infrastructure/repositories/in-memory/InMemoryArticleRepository';
import { InMemoryNotificationRepository } from '@infrastructure/repositories/in-memory/InMemoryNotificationRepository';

const ArticleRepositoryProvider = {
  provide: 'ArticleRepository',
  useClass: InMemoryArticleRepository,
};

const NotificationRepositoryProvider = {
  provide: 'NotificationRepository',
  useClass: InMemoryNotificationRepository,
};

@Module({
  controllers: [FeedController, NotificationsController],
  providers: [
    SSEService,
    ArticleRepositoryProvider,
    NotificationRepositoryProvider,
  ],
  exports: [SSEService, ArticleRepositoryProvider, NotificationRepositoryProvider],
})
export class SSEModule {}
