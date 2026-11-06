import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

/** Meter reading validation result */
export interface MeterValidation {
  valid: boolean;
  reason?: string;
  needs_confirmation?: boolean;
  delta_kwh?: number;
}

/** Meter reading pair */
export interface MeterPair {
  open_kwh: number;
  close_kwh: number;
  open_hash: string;
  close_hash: string;
  window_days: number;
}

@Injectable()
export class MeterValidationService {
  private readonly seenHashes = new Set<string>();
  private readonly dailyRewards = new Map<string, { date: string; count: number }>();
  private readonly MAX_DAILY_REWARDS = 3;
  private readonly ANOMALY_THRESHOLD = 100; // kWh spike threshold

  /** Hash image for deduplication */
  hashImage(imageBuffer: Buffer): string {
    return createHash('sha256').update(imageBuffer).digest('hex');
  }

  /** Validate meter pair */
  validatePair(pair: MeterPair): MeterValidation {
    // Check duplicate hashes
    if (this.seenHashes.has(pair.open_hash)) {
      return { valid: false, reason: 'Duplicate open meter image' };
    }
    if (this.seenHashes.has(pair.close_hash)) {
      return { valid: false, reason: 'Duplicate close meter image' };
    }

    // Check meter decrease
    if (pair.close_kwh < pair.open_kwh) {
      return { valid: false, reason: 'Meter reading decreased', needs_confirmation: true };
    }

    // Calculate delta
    const delta = pair.close_kwh - pair.open_kwh;

    // Check anomaly: unrealistic spike
    const dailyAvg = delta / pair.window_days;
    if (dailyAvg > this.ANOMALY_THRESHOLD) {
      return {
        valid: false,
        reason: `Unrealistic daily consumption: ${dailyAvg.toFixed(1)} kWh/day`,
        needs_confirmation: true,
        delta_kwh: delta,
      };
    }

    // Valid
    this.seenHashes.add(pair.open_hash);
    this.seenHashes.add(pair.close_hash);

    return { valid: true, delta_kwh: delta };
  }

  /** Check daily reward limit */
  canReceiveReward(businessId: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    const record = this.dailyRewards.get(businessId);

    if (!record || record.date !== today) {
      return true;
    }

    return record.count < this.MAX_DAILY_REWARDS;
  }

  /** Increment daily reward counter */
  incrementRewardCount(businessId: string): void {
    const today = new Date().toISOString().split('T')[0]!;
    const record = this.dailyRewards.get(businessId);

    if (!record || record.date !== today) {
      this.dailyRewards.set(businessId, { date: today, count: 1 });
    } else {
      record.count++;
    }
  }

  /** Clear all - for tests */
  clearAll(): void {
    this.seenHashes.clear();
    this.dailyRewards.clear();
  }
}
