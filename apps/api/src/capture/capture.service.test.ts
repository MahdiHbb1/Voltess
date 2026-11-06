import { describe, it, expect, beforeEach } from 'vitest';
import { CaptureService } from './capture.service';

describe('CaptureService', () => {
  let service: CaptureService;

  beforeEach(() => {
    service = new CaptureService();
    service.clearAll();
  });

  describe('create', () => {
    it('creates capture with queued status', () => {
      const capture = service.create('biz_1', 'label', 'file_ref_1');

      expect(capture.capture_id).toBeTruthy();
      expect(capture.business_id).toBe('biz_1');
      expect(capture.type).toBe('label');
      expect(capture.file_ref).toBe('file_ref_1');
      expect(capture.status).toBe('queued');
      expect(capture.result).toBeNull();
      expect(capture.confidence).toBeNull();
    });

    it('stores idempotency key', () => {
      const capture = service.create('biz_1', 'label', 'file_ref_1', 'idem_key_123');
      const found = service.findByIdempotencyKey('idem_key_123');
      expect(found).toEqual(capture);
    });
  });

  describe('update', () => {
    it('updates capture fields', () => {
      const capture = service.create('biz_1', 'label', 'file_ref_1');
      
      const updated = service.update(capture.capture_id, {
        result: { name: 'Kulkas', power_w: 150 },
        confidence: 'high',
        status: 'verified',
        request_id: 'req_123',
      });

      expect(updated?.status).toBe('verified');
      expect(updated?.confidence).toBe('high');
      expect(updated?.result).toEqual({ name: 'Kulkas', power_w: 150 });
      expect(updated?.request_id).toBe('req_123');
    });

    it('returns undefined for unknown ID', () => {
      const result = service.update('unknown', { status: 'verified' });
      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('finds capture by ID', () => {
      const capture = service.create('biz_1', 'label', 'file_ref_1');
      const found = service.findById(capture.capture_id);
      expect(found).toEqual(capture);
    });

    it('returns undefined for unknown ID', () => {
      const found = service.findById('unknown');
      expect(found).toBeUndefined();
    });
  });

  describe('findByBusiness', () => {
    it('returns captures for business', () => {
      service.create('biz_1', 'label', 'file_1');
      service.create('biz_1', 'meter', 'file_2');
      service.create('biz_2', 'label', 'file_3');

      const captures = service.findByBusiness('biz_1');
      expect(captures).toHaveLength(2);
      expect(captures.every(c => c.business_id === 'biz_1')).toBe(true);
    });

    it('returns empty for business with no captures', () => {
      const captures = service.findByBusiness('biz_none');
      expect(captures).toEqual([]);
    });
  });
});
