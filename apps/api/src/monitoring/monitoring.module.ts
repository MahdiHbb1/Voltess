import { Module, Global } from '@nestjs/common';
import { UsageTrackerService } from './usage-tracker.service';
import { UsageAlertService } from './usage-alert.service';
import { MonitoringController } from './monitoring.controller';

@Global()
@Module({
  controllers: [MonitoringController],
  providers: [UsageTrackerService, UsageAlertService],
  exports: [UsageTrackerService, UsageAlertService],
})
export class MonitoringModule {}