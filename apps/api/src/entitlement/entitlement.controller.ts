/**
 * Entitlement controller - status endpoints untuk FE
 * Owner: Mahdi, Sprint: S2
 */

import { Controller, Get, Post, Body, Request, Headers } from '@nestjs/common';
import { EntitlementService } from './entitlement.service';
import { TrialService } from './trial.service';
import type { EntitlementStatusResponse, Entitlement } from '@voltess/contracts';

@Controller('entitlement')
export class EntitlementController {
  constructor(
    private readonly entitlementService: EntitlementService,
    private readonly trialService: TrialService,
  ) {}

  @Get('status')
  async getStatus(
    @Request() req: any,
    @Headers('x-business-id') headerBizId?: string,
  ): Promise<EntitlementStatusResponse> {
    const businessId = headerBizId ?? req.user?.business_id ?? 'biz_default';

    await this.entitlementService.checkAndTransitionExpiredTrial(businessId);
    const ent = await this.entitlementService.getOrCreateEntitlement(businessId);

    // Get trial state from TrialService
    const trialState = this.trialService.getState(businessId);
    const daysRemaining = trialState.days_remaining;

    return {
      status: ent.status,
      features: ent.features,
      trial_days_remaining: daysRemaining,
      can_upgrade: ent.status === 'free' || ent.status === 'trial' || ent.status === 'locked',
    };
  }

  @Post('start-trial')
  async startTrial(
    @Request() req: any,
    @Body('reason') reason: string,
    @Headers('x-business-id') headerBizId?: string,
  ): Promise<Entitlement> {
    const businessId = headerBizId ?? req.user?.business_id ?? 'biz_default';
    return this.entitlementService.startTrial(businessId, reason ?? 'User action');
  }

  @Post('upgrade-plus-manual')
  async upgradePlus(
    @Request() req: any,
    @Body('reason') reason: string,
    @Headers('x-business-id') headerBizId?: string,
  ): Promise<Entitlement> {
    const businessId = headerBizId ?? req.user?.business_id ?? 'biz_default';
    return this.entitlementService.upgradeToPlusManual(businessId, reason ?? 'Manual upgrade');
  }
}
