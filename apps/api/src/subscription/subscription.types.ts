export enum SubscriptionTier {
  Free = 'free',
  Plus = 'plus',
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due';
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionEntitlement {
  maxSwipesPerDay: number | null; // null = unlimited
  priorityMatch: boolean;
}

export const TIER_ENTITLEMENTS: Record<SubscriptionTier, SubscriptionEntitlement> = {
  [SubscriptionTier.Free]: {
    maxSwipesPerDay: 5,
    priorityMatch: false,
  },
  [SubscriptionTier.Plus]: {
    maxSwipesPerDay: null,
    priorityMatch: true,
  },
};
