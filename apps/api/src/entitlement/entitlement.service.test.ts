/**
 * Entitlement service test
 * Owner: Mahdi, Sprint: S2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { EntitlementService } from './entitlement.service';
import type { EntitlementStatus } from '@voltra/contracts';

describe('EntitlementService', () => {
  let service: EntitlementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntitlementService],
    }).compile();

    service = module.get<EntitlementService>(EntitlementService);
  });

  describe('getOrCreateEntitlement', () => {
    it('creates free entitlement for new business', async () => {
      const ent = await service.getOrCreateEntitlement('biz_new');

      expect(ent.business_id).toBe('biz_new');
      expect(ent.status).toBe('free');
      expect(ent.trial_started_at).toBeNull();
      expect(ent.features.kios).toBe(true);
      expect(ent.features.ai_analysis).toBe(false);
    });

    it('returns existing entitlement', async () => {
      const first = await service.getOrCreateEntitlement('biz_existing');
      const second = await service.getOrCreateEntitlement('biz_existing');

      expect(second.business_id).toBe(first.business_id);
      expect(second.status).toBe(first.status);
    });
  });

  describe('startTrial', () => {
    it('transitions free to trial', async () => {
      await service.getOrCreateEntitlement('biz_trial1');
      
      const ent = await service.startTrial('biz_trial1', 'First real data upload');

      expect(ent.status).toBe('trial');
      expect(ent.trial_started_at).toBeDefined();
      expect(ent.trial_ends_at).toBeDefined();
      expect(ent.features.ai_analysis).toBe(true);
    });

    it('is idempotent - does not restart trial', async () => {
      await service.getOrCreateEntitlement('biz_trial2');
      
      const first = await service.startTrial('biz_trial2', 'First upload');
      const second = await service.startTrial('biz_trial2', 'Second upload');

      expect(second.trial_started_at).toBe(first.trial_started_at);
      expect(second.trial_ends_at).toBe(first.trial_ends_at);
    });

    it('rejects trial start from plus', async () => {
      await service.getOrCreateEntitlement('biz_plus');
      await service.upgradeToPlusManual('biz_plus', 'Purchased');

      await expect(service.startTrial('biz_plus', 'Invalid')).rejects.toThrow();
    });
  });

  describe('checkAndTransitionExpiredTrial', () => {
    it('transitions expired trial to locked', async () => {
      await service.getOrCreateEntitlement('biz_expired');
      await service.startTrial('biz_expired', 'Started');

      // ponytail: manual expire untuk test, time-travel nanti
      const ent = await service.getOrCreateEntitlement('biz_expired');
      ent.trial_ends_at = new Date(Date.now() - 1000).toISOString();

      const transitioned = await service.checkAndTransitionExpiredTrial('biz_expired');

      expect(transitioned).toBe(true);
      const locked = await service.getOrCreateEntitlement('biz_expired');
      expect(locked.status).toBe('locked');
      expect(locked.features.ai_analysis).toBe(false);
    });

    it('does not transition unexpired trial', async () => {
      await service.getOrCreateEntitlement('biz_active');
      await service.startTrial('biz_active', 'Started');

      const transitioned = await service.checkAndTransitionExpiredTrial('biz_active');

      expect(transitioned).toBe(false);
      const ent = await service.getOrCreateEntitlement('biz_active');
      expect(ent.status).toBe('trial');
    });
  });

  describe('upgradeToPlusManual', () => {
    it('transitions trial to plus', async () => {
      await service.getOrCreateEntitlement('biz_upgrade1');
      await service.startTrial('biz_upgrade1', 'Started');

      const plus = await service.upgradeToPlusManual('biz_upgrade1', 'Payment successful');

      expect(plus.status).toBe('plus');
      expect(plus.features.ai_analysis).toBe(true);
    });

    it('transitions locked to plus', async () => {
      await service.getOrCreateEntitlement('biz_upgrade2');
      await service.startTrial('biz_upgrade2', 'Started');
      
      // Expire trial
      const ent = await service.getOrCreateEntitlement('biz_upgrade2');
      ent.trial_ends_at = new Date(Date.now() - 1000).toISOString();
      await service.checkAndTransitionExpiredTrial('biz_upgrade2');

      const plus = await service.upgradeToPlusManual('biz_upgrade2', 'Payment after lock');

      expect(plus.status).toBe('plus');
    });
  });

  describe('getAuditLog', () => {
    it('records status changes', async () => {
      await service.getOrCreateEntitlement('biz_audit');
      await service.startTrial('biz_audit', 'First upload');

      const log = await service.getAuditLog('biz_audit');

      expect(log.length).toBeGreaterThanOrEqual(2); // free->trial
      expect(log[0].to_status).toBe('free');
      expect(log[1].to_status).toBe('trial');
    });
  });
});
