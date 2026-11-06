import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AiController } from './ai/ai.controller';
import { AiModule } from './ai/ai.module';
import { AuthController } from './auth/auth.controller';
import { PrivacyController } from './auth/privacy.controller';
import { AuthModule } from './auth/auth.module';
import { BusinessController } from './business/business.controller';
import { BusinessModule } from './business/business.module';
import { CaptureController } from './capture/capture.controller';
import { CaptureModule } from './capture/capture.module';
import { EntitlementController } from './entitlement/entitlement.controller';
import { EntitlementModule } from './entitlement/entitlement.module';
import { MissionModule } from './mission/mission.module';
import { StorageModule } from './storage/storage.module';
import { QueueModule } from './queue/queue.module';
import { DatabaseModule } from './database/database.module';
import { NotificationModule } from './notifications/notification.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { RequestIdMiddleware } from './ai/request-id.middleware';
import { IdempotencyMiddleware } from './capture/idempotency.middleware';
import { AppController } from './app.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    DatabaseModule,
    AiModule,
    AuthModule,
    BusinessModule,
    CaptureModule,
    EntitlementModule,
    MissionModule,
    StorageModule,
    QueueModule,
    NotificationModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes(AiController, AuthController, PrivacyController, BusinessController, CaptureController, EntitlementController, AppController);
    
    consumer
      .apply(IdempotencyMiddleware)
      .forRoutes(CaptureController);
  }
}
