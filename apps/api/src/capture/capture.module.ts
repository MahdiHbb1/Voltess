import { Module } from '@nestjs/common';
import { CaptureController } from './capture.controller';
import { CaptureService } from './capture.service';
import { BusinessModule } from '../business/business.module';
import { MissionModule } from '../mission/mission.module';

@Module({
  imports: [BusinessModule, MissionModule],
  controllers: [CaptureController],
  providers: [CaptureService],
  exports: [CaptureService],
})
export class CaptureModule {}
