import { describe, it, expect, beforeEach } from 'vitest';
import { MissionService } from './mission.service';

describe('MissionService', () => {
  let service: MissionService;

  beforeEach(() => {
    service = new MissionService();
    service.clearAll();
  });

  describe('createEvent', () => {
    it('creates mission event C4', async () => {
      const event = await service.createEvent({
        type: 'mission_completed',
        mission_id: 'M1',
        business_id: 'biz_1',
        payload: { capture_id: 'cap_1' },
        verification: {
          status: 'verified',
          reason: null,
          confidence: 'high',
        },
        reward: { points: 10, badge: 'first_label' },
      });

      expect(event.event_id).toBeTruthy();
      expect(event.type).toBe('mission_completed');
      expect(event.mission_id).toBe('M1');
      expect(event.business_id).toBe('biz_1');
      expect(event.payload.capture_id).toBe('cap_1');
      expect(event.verification.status).toBe('verified');
      expect(event.reward.points).toBe(10);
      expect(event.occurred_at).toBeTruthy();
    });
  });

  describe('findByBusiness', () => {
    it('returns events for business', async () => {
      await service.createEvent({
        type: 'mission_completed',
        mission_id: 'M1',
        business_id: 'biz_1',
        payload: {},
        verification: { status: 'verified', reason: null, confidence: 'high' },
        reward: { points: 10, badge: null },
      });

      await service.createEvent({
        type: 'mission_completed',
        mission_id: 'M2',
        business_id: 'biz_1',
        payload: {},
        verification: { status: 'pending', reason: null, confidence: 'medium' },
        reward: { points: 5, badge: null },
      });

      const events = service.findByBusiness('biz_1');
      expect(events).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('finds event by ID', async () => {
      const created = await service.createEvent({
        type: 'mission_completed',
        mission_id: 'M1',
        business_id: 'biz_1',
        payload: {},
        verification: { status: 'verified', reason: null, confidence: 'high' },
        reward: { points: 10, badge: null },
      });

      const found = service.findById(created.event_id);
      expect(found).toEqual(created);
    });

    it('returns undefined for unknown ID', () => {
      const found = service.findById('unknown');
      expect(found).toBeUndefined();
    });
  });
});
