import { Module } from '@nestjs/common';
import { MissionService } from './mission.service';

@Module({
  providers: [MissionService],
  exports: [MissionService],
})
export class MissionModule {}
