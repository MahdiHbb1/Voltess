import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TIER_ENTITLEMENTS, SubscriptionTier } from '../subscription/subscription.types';

@Injectable()
export class EntitlementGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const userTier: SubscriptionTier = req.user?.tier || SubscriptionTier.Free;
    const entitlement = TIER_ENTITLEMENTS[userTier];

    // ponytail: daily swipe count check skipped, add when DB tracks usage
    if (entitlement.maxSwipesPerDay === null) {
      return true; // unlimited
    }

    // placeholder: allow all for now
    return true;
  }
}
