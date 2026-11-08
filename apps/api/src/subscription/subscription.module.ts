import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { WebhookController } from './webhook.controller';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [SubscriptionController, WebhookController],
  providers: [SubscriptionService, DatabaseService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
