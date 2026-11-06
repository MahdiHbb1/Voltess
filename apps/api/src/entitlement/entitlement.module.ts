/**
 * Entitlement module
 * Owner: Mahdi, Sprint: S2
 */

import { Module } from '@nestjs/common';
import { EntitlementController } from './entitlement.controller';
import { EntitlementService } from './entitlement.service';
import { AiEntitlementGuard } from './ai-entitlement.guard';

@Module({
  controllers: [EntitlementController],
  providers: [EntitlementService, AiEntitlementGuard],
  exports: [EntitlementService, AiEntitlementGuard],
})
export class EntitlementModule {}
