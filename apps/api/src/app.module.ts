import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { AiController } from './ai/ai.controller';
import { AiModule } from './ai/ai.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { BusinessController } from './business/business.controller';
import { BusinessModule } from './business/business.module';
import { CaptureController } from './capture/capture.controller';
import { CaptureModule } from './capture/capture.module';
import { EntitlementController } from './entitlement/entitlement.controller';
import { EntitlementModule } from './entitlement/entitlement.module';
import { MissionModule } from './mission/mission.module';
import { RequestIdMiddleware } from './ai/request-id.middleware';
import { AppController } from './app.controller';

@Module({
  imports: [AiModule, AuthModule, BusinessModule, CaptureModule, EntitlementModule, MissionModule],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes(AiController, AuthController, BusinessController, CaptureController, EntitlementController, AppController);
  }
}
