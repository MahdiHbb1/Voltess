/**
 * Auth module - OTP, session, guest merge
 * Owner: Mahdi, Sprint: S2
 */

import { Module, type NestModule, type MiddlewareConsumer } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { PrivacyController } from './privacy.controller';
import { AuthService } from './auth.service';
import { PrivacyService } from './privacy.service';
import { OtpMockAdapter } from './adapters/otp-mock.adapter';
import { RateLimitMiddleware } from './rate-limit.middleware';
import { BusinessModule } from '../business/business.module';
import { CaptureModule } from '../capture/capture.module';
import { MissionModule } from '../mission/mission.module';
import { EntitlementModule } from '../entitlement/entitlement.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SESSION_SECRET ?? 'dev-secret-change-in-production',
      signOptions: { expiresIn: '24h' },
    }),
    BusinessModule,
    CaptureModule,
    MissionModule,
    EntitlementModule,
    StorageModule,
  ],
  controllers: [AuthController, PrivacyController],
  providers: [
    AuthService,
    PrivacyService,
    {
      provide: 'OTP_ADAPTER',
      useClass: OtpMockAdapter,
    },
    {
      provide: OtpMockAdapter,
      useClass: OtpMockAdapter,
    },
  ],
  exports: [AuthService, PrivacyService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RateLimitMiddleware).forRoutes(AuthController);
  }
}
