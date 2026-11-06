import { describe, it, expect, beforeEach } from 'vitest';
import { MeterValidationService } from './meter-validation.service';

describe('MeterValidationService', () => {
  let service: MeterValidationService;

  beforeEach(() => {
    service = new MeterValidationService();
    service.clearAll();
  });

  describe('validatePair', () => {
    it('validates normal meter pair', () => {
      const result = service.validatePair({
        open_kwh: 1000,
        close_kwh: 1100,
        open_hash: 'hash_open_1',
        close_hash: 'hash_close_1',
        window_days: 7,
      });

      expect(result.valid).toBe(true);
      expect(result.delta_kwh).toBe(100);
    });

    it('rejects duplicate open hash', () => {
      service.validatePair({
        open_kwh: 1000,
        close_kwh: 1100,
        open_hash: 'hash_open_dup',
        close_hash: 'hash_close_1',
        window_days: 7,
      });

      const result = service.validatePair({
        open_kwh: 1100,
        close_kwh: 1200,
        open_hash: 'hash_open_dup',
        close_hash: 'hash_close_2',
        window_days: 7,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Duplicate');
    });

    it('rejects duplicate close hash', () => {
      service.validatePair({
        open_kwh: 1000,
        close_kwh: 1100,
        open_hash: 'hash_open_1',
        close_hash: 'hash_close_dup',
        window_days: 7,
      });

      const result = service.validatePair({
        open_kwh: 1100,
        close_kwh: 1200,
        open_hash: 'hash_open_2',
        close_hash: 'hash_close_dup',
        window_days: 7,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Duplicate');
    });

    it('flags meter decrease as needs confirmation', () => {
      const result = service.validatePair({
        open_kwh: 1100,
        close_kwh: 1000,
        open_hash: 'hash_open_3',
        close_hash: 'hash_close_3',
        window_days: 7,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('decreased');
      expect(result.needs_confirmation).toBe(true);
    });

    it('flags unrealistic spike as needs confirmation', () => {
      const result = service.validatePair({
        open_kwh: 1000,
        close_kwh: 1750, // 750 kWh / 7 days = 107 kWh/day > 100 threshold
        open_hash: 'hash_open_4',
        close_hash: 'hash_close_4',
        window_days: 7,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Unrealistic');
      expect(result.needs_confirmation).toBe(true);
      expect(result.delta_kwh).toBe(750);
    });

    it('accepts high consumption within threshold', () => {
      const result = service.validatePair({
        open_kwh: 1000,
        close_kwh: 1699, // 699 / 7 = 99.8 kWh/day < 100 threshold
        open_hash: 'hash_open_5',
        close_hash: 'hash_close_5',
        window_days: 7,
      });

      expect(result.valid).toBe(true);
      expect(result.delta_kwh).toBe(699);
    });
  });

  describe('canReceiveReward', () => {
    it('allows reward for new business', () => {
      expect(service.canReceiveReward('biz_new')).toBe(true);
    });

    it('allows reward up to 3 per day', () => {
      service.incrementRewardCount('biz_1');
      expect(service.canReceiveReward('biz_1')).toBe(true);

      service.incrementRewardCount('biz_1');
      expect(service.canReceiveReward('biz_1')).toBe(true);

      service.incrementRewardCount('biz_1');
      expect(service.canReceiveReward('biz_1')).toBe(false);
    });
  });

  describe('hashImage', () => {
    it('produces consistent hash for same buffer', () => {
      const buffer = Buffer.from('test image data');
      const hash1 = service.hashImage(buffer);
      const hash2 = service.hashImage(buffer);
      expect(hash1).toBe(hash2);
    });

    it('produces different hash for different buffer', () => {
      const buffer1 = Buffer.from('test1');
      const buffer2 = Buffer.from('test2');
      expect(service.hashImage(buffer1)).not.toBe(service.hashImage(buffer2));
    });
  });
});
