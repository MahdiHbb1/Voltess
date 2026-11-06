/**
 * Entitlement module
 * Owner: Mahdi, Sprint: S2
 */

import { Module } from '@nestjs/common';
import { EntitlementController } from './entitlement.controller';
import { EntitlementService } from './entitlement.service';
import { TrialService } from './trial.service';
import { AiEntitlementGuard } from './ai-entitlement.guard';

@Module({
  controllers: [EntitlementController],
  providers: [EntitlementService, TrialService, AiEntitlementGuard],
  exports: [EntitlementService, TrialService, AiEntitlementGuard],
})
export class EntitlementModule {}
