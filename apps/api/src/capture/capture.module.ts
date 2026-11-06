import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { CaptureController } from './capture.controller';
import { CaptureService } from './capture.service';
import { MeterValidationService } from './meter-validation.service';
import { BusinessModule } from '../business/business.module';
import { MissionModule } from '../mission/mission.module';
import { StorageModule } from '../storage/storage.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
        files: 1000, // max files per request
      },
    }),
    BusinessModule,
    MissionModule,
    StorageModule,
    QueueModule,
  ],
  controllers: [CaptureController],
  providers: [CaptureService, MeterValidationService],
  exports: [CaptureService, MeterValidationService],
})
export class CaptureModule {}
