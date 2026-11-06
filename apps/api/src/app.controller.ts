import { Controller, Get } from '@nestjs/common';
import { CONTRACT_VERSION } from '@voltess/contracts';
import { ENGINE_VERSION } from '@voltess/energy-calc';

@Controller()
export class AppController {
  @Get('health')
  health(): {
    status: 'ok';
    service: 'voltess-api';
    contractVersion: string;
    engineVersion: string;
  } {
    return {
      status: 'ok',
      service: 'voltess-api',
      contractVersion: CONTRACT_VERSION,
      engineVersion: ENGINE_VERSION,
    };
  }
}
