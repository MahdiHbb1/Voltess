/**
 * Contract test C5: Entitlement state matrix
 * Owner: Mahdi, Sprint: S2
 */

import { describe, it, expect } from 'vitest';
import type {
  EntitlementStatus,
  EntitlementFeatures,
  Entitlement,
  EntitlementStatusChange,
  EntitlementStatusResponse,
} from '@voltess/contracts';

describe('C5: Entitlement state matrix', () => {
  describe('Feature matrix by status', () => {
    const getFeatures = (status: EntitlementStatus): EntitlementFeatures => {
      switch (status) {
        case 'free':
          return {
            kios: true,
            m1: true,
            ai_analysis: false,
            terra_real_data: false,
            cosmetic_rewards: true,
          };
        case 'trial':
          return {
            kios: true,
            m1: true,
            ai_analysis: true,
            terra_real_data: true,
            cosmetic_rewards: true,
          };
        case 'plus':
          return {
            kios: true,
            m1: true,
            ai_analysis: true,
            terra_real_data: true,
            cosmetic_rewards: true,
          };
        case 'locked':
          return {
            kios: true,
            m1: true,
            ai_analysis: false,
            terra_real_data: false,
            cosmetic_rewards: true,
          };
      }
    };

    it('free: game + simulasi, no AI', () => {
      const features = getFeatures('free');
      expect(features.kios).toBe(true);
      expect(features.m1).toBe(true);
      expect(features.ai_analysis).toBe(false);
      expect(features.wati_real_data).toBe(false);
      expect(features.cosmetic_rewards).toBe(true);
    });

    it('trial: all features unlocked', () => {
      const features = getFeatures('trial');
      expect(features.kios).toBe(true);
      expect(features.m1).toBe(true);
      expect(features.ai_analysis).toBe(true);
      expect(features.terra_real_data).toBe(true);
    });

    it('plus: all features unlocked', () => {
      const features = getFeatures('plus');
      expect(features.kios).toBe(true);
      expect(features.m1).toBe(true);
      expect(features.ai_analysis).toBe(true);
      expect(features.terra_real_data).toBe(true);
    });

    it('locked: game + simulasi, AI locked', () => {
      const features = getFeatures('locked');
      expect(features.kios).toBe(true);
      expect(features.m1).toBe(true);
      expect(features.ai_analysis).toBe(false);
      expect(features.wati_real_data).toBe(false);
    });
  });

  describe('Entitlement', () => {
    it('validates free state', () => {
      const ent: Entitlement = {
        business_id: 'biz_123',
        status: 'free',
        trial_started_at: null,
        trial_ends_at: null,
        features: {
          kios: true,
          m1: true,
          ai_analysis: false,
          wati_real_data: false,
          cosmetic_rewards: true,
        },
        updated_at: new Date().toISOString(),
      };
      expect(ent.status).toBe('free');
      expect(ent.trial_started_at).toBeNull();
    });

    it('validates trial state with dates', () => {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const ent: Entitlement = {
        business_id: 'biz_456',
        status: 'trial',
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEnd.toISOString(),
        features: {
          kios: true,
          m1: true,
          ai_analysis: true,
          wati_real_data: true,
          cosmetic_rewards: true,
        },
        updated_at: now.toISOString(),
      };
      expect(ent.status).toBe('trial');
      expect(ent.trial_started_at).toBeDefined();
      expect(ent.trial_ends_at).toBeDefined();
    });
  });

  describe('EntitlementStatusChange', () => {
    it('validates status change audit', () => {
      const change: EntitlementStatusChange = {
        business_id: 'biz_789',
        from_status: 'free',
        to_status: 'trial',
        reason: 'First real data upload',
        changed_at: new Date().toISOString(),
        changed_by: 'system',
      };
      expect(change.from_status).toBe('free');
      expect(change.to_status).toBe('trial');
      expect(change.reason).toBeDefined();
    });

    it('validates initial state change', () => {
      const change: EntitlementStatusChange = {
        business_id: 'biz_new',
        from_status: null,
        to_status: 'free',
        reason: 'Account created',
        changed_at: new Date().toISOString(),
        changed_by: 'system',
      };
      expect(change.from_status).toBeNull();
      expect(change.to_status).toBe('free');
    });
  });

  describe('EntitlementStatusResponse', () => {
    it('validates status response for trial', () => {
      const response: EntitlementStatusResponse = {
        status: 'trial',
        features: {
          kios: true,
          m1: true,
          ai_analysis: true,
          wati_real_data: true,
          cosmetic_rewards: true,
        },
        trial_days_remaining: 25,
        can_upgrade: true,
      };
      expect(response.status).toBe('trial');
      expect(response.trial_days_remaining).toBe(25);
    });

    it('validates status response for locked', () => {
      const response: EntitlementStatusResponse = {
        status: 'locked',
        features: {
          kios: true,
          m1: true,
          ai_analysis: false,
          wati_real_data: false,
          cosmetic_rewards: true,
        },
        trial_days_remaining: null,
        can_upgrade: true,
      };
      expect(response.status).toBe('locked');
      expect(response.trial_days_remaining).toBeNull();
      expect(response.can_upgrade).toBe(true);
    });
  });
});
