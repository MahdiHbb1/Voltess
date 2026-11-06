import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TrialService } from './trial.service';

describe('TrialService', () => {
  let service: TrialService;

  beforeEach(() => {
    service = new TrialService();
    service.clearAll();
  });

  describe('getState', () => {
    it('returns default state for new business', () => {
      const state = service.getState('biz_new');
      expect(state.started_at).toBeNull();
      expect(state.ends_at).toBeNull();
      expect(state.days_remaining).toBeNull();
      expect(state.locked).toBe(false);
    });
  });

  describe('startTrial', () => {
    it('starts trial with 30 days', () => {
      const state = service.startTrial('biz_1');
      
      expect(state.started_at).toBeTruthy();
      expect(state.ends_at).toBeTruthy();
      expect(state.days_remaining).toBe(30);
      expect(state.locked).toBe(false);
    });

    it('is idempotent - does not restart', () => {
      const first = service.startTrial('biz_1');
      const second = service.startTrial('biz_1');
      
      expect(second.started_at).toEqual(first.started_at);
      expect(second.ends_at).toEqual(first.ends_at);
    });
  });

  describe('shouldSendReminder', () => {
    it('returns false for not started trial', () => {
      expect(service.shouldSendReminder('biz_1')).toBe(false);
    });

    it('returns false when more than 5 days remaining', () => {
      service.startTrial('biz_1');
      expect(service.shouldSendReminder('biz_1')).toBe(false);
    });

    it('returns false after reminder already sent', () => {
      service.startTrial('biz_1');
      service.markReminderSent('biz_1');
      expect(service.shouldSendReminder('biz_1')).toBe(false);
    });
  });

  describe('markReminderSent', () => {
    it('marks reminder as sent', () => {
      service.startTrial('biz_1');
      service.markReminderSent('biz_1');
      
      const state = service.getState('biz_1');
      expect(state.reminder_sent).toBe(true);
    });
  });

  describe('lockTrial', () => {
    it('locks trial', () => {
      service.startTrial('biz_1');
      const locked = service.lockTrial('biz_1');
      
      expect(locked.locked).toBe(true);
    });

    it('throws for non-existent trial', () => {
      expect(() => service.lockTrial('biz_none')).toThrow('Trial not found');
    });
  });
});
