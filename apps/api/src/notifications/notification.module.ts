import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationQueue } from './notification.queue';
import { NotificationWorker } from './notification.worker';

@Module({
  controllers: [NotificationController],
  providers: [NotificationQueue, NotificationWorker],
  exports: [NotificationQueue],
})
export class NotificationModule {}
