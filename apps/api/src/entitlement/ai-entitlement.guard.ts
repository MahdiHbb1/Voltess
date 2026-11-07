/**
 * Entitlement guard - proteksi endpoint AI dari status yang tidak berhak
 * Owner: Mahdi, Sprint: S2
 * 
 * Mengembalikan 403 Forbidden bila status tidak mengizinkan ai_analysis.
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { EntitlementService } from './entitlement.service';
import type { ApiErrorBody } from '@voltess/contracts';

@Injectable()
export class AiEntitlementGuard implements CanActivate {
  constructor(@Inject(EntitlementService) private readonly entitlementService: EntitlementService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // ponytail: extract business_id dari user session nanti, mock dulu
    const businessId = request.headers['x-business-id'] ?? request.user?.business_id ?? 'biz_default';

    // Cek expiry dulu
    await this.entitlementService.checkAndTransitionExpiredTrial(businessId);

    const ent = await this.entitlementService.getOrCreateEntitlement(businessId);

    if (!ent.features.ai_analysis) {
      const error: ApiErrorBody = {
        error: {
          code: 'FORBIDDEN',
          message: `AI features locked for status: ${ent.status}. Upgrade to Plus required.`,
          request_id: request.headers['x-request-id'] ?? 'entitlement_check',
        },
      };
      throw new ForbiddenException(error);
    }

    return true;
  }
}
