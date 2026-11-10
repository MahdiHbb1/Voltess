import { Controller, Get } from '@nestjs/common';
import { CONTRACT_VERSION } from '@voltess/contracts';
import { ENGINE_VERSION } from '@voltess/energy-calc';

@Controller()
export class AppController {
  @Get('health')
  health(): {
    mode: 'live';
    status: 'healthy';
    service: string;
    contractVersion: string;
    engineVersion: string;
  } {
    return {
      mode: 'live',
      status: 'healthy',
      service: 'voltess-api',
      contractVersion: CONTRACT_VERSION,
      engineVersion: ENGINE_VERSION,
    };
  }
}
