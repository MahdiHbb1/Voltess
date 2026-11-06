import { describe, it, expect, beforeEach } from 'vitest';
import { PrivacyService } from './privacy.service';

describe('PrivacyService', () => {
  let service: PrivacyService;

  beforeEach(() => {
    service = new PrivacyService();
    service.clearAll();
  });

  describe('getDataCategories', () => {
    it('returns all data categories', () => {
      const categories = service.getDataCategories('user_1', 'biz_1');

      expect(categories).toHaveLength(6);
      expect(categories[0].category).toBe('Account');
      expect(categories[1].category).toBe('Business Profile');
      expect(categories[2].category).toBe('Captures');
      expect(categories[3].category).toBe('Mission Events');
      expect(categories[4].category).toBe('Entitlement');
      expect(categories[5].category).toBe('Usage Analytics');
    });

    it('includes retention days for each category', () => {
      const categories = service.getDataCategories('user_1', 'biz_1');

      expect(categories[0].retention_days).toBeNull(); // Account - retained until deletion
      expect(categories[2].retention_days).toBe(365); // Captures - 1 year
      expect(categories[5].retention_days).toBe(90); // Analytics - 90 days
    });
  });

  describe('createDeletionRequest', () => {
    it('creates deletion request with pending status', () => {
      const request = service.createDeletionRequest('user_1', 'biz_1');

      expect(request.request_id).toBeTruthy();
      expect(request.user_id).toBe('user_1');
      expect(request.business_id).toBe('biz_1');
      expect(request.status).toBe('pending');
      expect(request.requested_at).toBeTruthy();
      expect(request.completed_at).toBeNull();
    });
  });

  describe('getDeletionRequest', () => {
    it('retrieves deletion request by ID', () => {
      const created = service.createDeletionRequest('user_1', 'biz_1');
      const retrieved = service.getDeletionRequest(created.request_id);

      expect(retrieved).toEqual(created);
    });

    it('returns undefined for unknown ID', () => {
      expect(service.getDeletionRequest('unknown')).toBeUndefined();
    });
  });

  describe('markCompleted', () => {
    it('marks deletion request as completed', () => {
      const request = service.createDeletionRequest('user_1', 'biz_1');
      service.markCompleted(request.request_id);

      const updated = service.getDeletionRequest(request.request_id);
      expect(updated?.status).toBe('completed');
      expect(updated?.completed_at).toBeTruthy();
    });
  });

  describe('markFailed', () => {
    it('marks deletion request as failed', () => {
      const request = service.createDeletionRequest('user_1', 'biz_1');
      service.markFailed(request.request_id);

      const updated = service.getDeletionRequest(request.request_id);
      expect(updated?.status).toBe('failed');
    });
  });
});
