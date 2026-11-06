import { Injectable } from '@nestjs/common';

/** Trial state */
export interface TrialState {
  business_id: string;
  started_at: Date | null;
  ends_at: Date | null;
  days_remaining: number | null;
  reminder_sent: boolean;
  locked: boolean;
}

/** Trial configuration */
const TRIAL_DURATION_DAYS = 30;
const REMINDER_DAYS_BEFORE = 5; // H-25 = 5 days before end
const TIMEZONE = 'Asia/Jakarta';

@Injectable()
export class TrialService {
  private readonly trials = new Map<string, TrialState>();

  /** Get trial state */
  getState(businessId: string): TrialState {
    const existing = this.trials.get(businessId);
    if (existing) {
      return this.calculateRemaining(existing);
    }

    // Default: not started
    return {
      business_id: businessId,
      started_at: null,
      ends_at: null,
      days_remaining: null,
      reminder_sent: false,
      locked: false,
    };
  }

  /** Start trial - idempotent */
  startTrial(businessId: string): TrialState {
    const existing = this.trials.get(businessId);
    
    // Already started - idempotent
    if (existing && existing.started_at) {
      return this.calculateRemaining(existing);
    }

    const now = this.nowJakarta();
    const endsAt = new Date(now);
    endsAt.setDate(endsAt.getDate() + TRIAL_DURATION_DAYS);

    const state: TrialState = {
      business_id: businessId,
      started_at: now,
      ends_at: endsAt,
      days_remaining: TRIAL_DURATION_DAYS,
      reminder_sent: false,
      locked: false,
    };

    this.trials.set(businessId, state);
    return state;
  }

  /** Check if reminder should be sent */
  shouldSendReminder(businessId: string): boolean {
    const state = this.trials.get(businessId);
    if (!state || !state.started_at || state.reminder_sent) {
      return false;
    }

    const remaining = this.calculateRemaining(state);
    return remaining.days_remaining !== null && 
           remaining.days_remaining <= REMINDER_DAYS_BEFORE &&
           !state.reminder_sent;
  }

  /** Mark reminder as sent */
  markReminderSent(businessId: string): void {
    const state = this.trials.get(businessId);
    if (state) {
      state.reminder_sent = true;
    }
  }

  /** Lock trial after expiry */
  lockTrial(businessId: string): TrialState {
    const state = this.trials.get(businessId);
    if (!state) {
      throw new Error('Trial not found');
    }

    state.locked = true;
    return state;
  }

  /** Calculate remaining days */
  private calculateRemaining(state: TrialState): TrialState {
    if (!state.started_at || !state.ends_at) {
      return state;
    }

    const now = this.nowJakarta();
    const diffMs = state.ends_at.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      ...state,
      days_remaining: Math.max(0, diffDays),
      locked: diffDays <= 0 ? true : state.locked,
    };
  }

  /** Get current time in Asia/Jakarta */
  private nowJakarta(): Date {
    // ponytail: use proper timezone lib (date-fns-tz) when needed, stub now
    return new Date();
  }

  /** Clear all - for tests */
  clearAll(): void {
    this.trials.clear();
  }
}
