/** C5 - Entitlement. */
export type EntitlementStatus = 'free' | 'trial' | 'plus' | 'locked';

export interface EntitlementFeatures {
  kios: boolean;
  m1: boolean;
  ai_analysis: boolean;
  terra_real_data: boolean;
  cosmetic_rewards: boolean;
}

export interface Entitlement {
  business_id: string;
  status: EntitlementStatus;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  features: EntitlementFeatures;
  updated_at: string;
}

/** Audit log perubahan status */
export interface EntitlementStatusChange {
  business_id: string;
  from_status: EntitlementStatus | null;
  to_status: EntitlementStatus;
  reason: string;
  changed_at: string;
  changed_by: string;
}

/** GET /entitlement/status response */
export interface EntitlementStatusResponse {
  status: EntitlementStatus;
  features: EntitlementFeatures;
  trial_days_remaining: number | null;
  can_upgrade: boolean;
}
