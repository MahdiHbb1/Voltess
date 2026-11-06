import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    service = new StorageService();
    service.clearAll();
  });

  describe('upload', () => {
    it('uploads file and returns key', async () => {
      const buffer = Buffer.from('test image data');
      const key = await service.upload(buffer, 'image/jpeg', 'biz_1', 'label');

      expect(key).toContain('biz_1/label/');
      expect(service.exists(key)).toBe(true);
    });
  });

  describe('getSignedUrl', () => {
    it('generates signed URL for uploaded file', async () => {
      const buffer = Buffer.from('test');
      const key = await service.upload(buffer, 'image/jpeg', 'biz_1', 'label');

      const url = service.getSignedUrl(key);
      expect(url).toContain(key);
      expect(url).toContain('expires=');
    });

    it('throws for non-existent key', () => {
      expect(() => service.getSignedUrl('nonexistent')).toThrow('Object not found');
    });
  });

  describe('exists', () => {
    it('returns true for uploaded file', async () => {
      const buffer = Buffer.from('test');
      const key = await service.upload(buffer, 'image/jpeg', 'biz_1', 'label');
      expect(service.exists(key)).toBe(true);
    });

    it('returns false for non-existent key', () => {
      expect(service.exists('nonexistent')).toBe(false);
    });
  });
});
