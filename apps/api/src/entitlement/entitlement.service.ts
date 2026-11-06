/**
 * Entitlement service - state machine free/trial/plus/locked
 * Owner: Mahdi, Sprint: S2
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import type {
  Entitlement,
  EntitlementStatus,
  EntitlementFeatures,
  EntitlementStatusChange,
} from '@voltra/contracts';

@Injectable()
export class EntitlementService {
  private readonly entitlements = new Map<string, Entitlement>(); // ponytail: in-memory, DB nanti
  private readonly auditLogs = new Map<string, EntitlementStatusChange[]>();

  private readonly TRIAL_DAYS = 30;

  async getOrCreateEntitlement(businessId: string): Promise<Entitlement> {
    let ent = this.entitlements.get(businessId);

    if (!ent) {
      ent = this.createInitialEntitlement(businessId);
      this.entitlements.set(businessId, ent);
      this.recordStatusChange(businessId, null, 'free', 'Account created', 'system');
    }

    return ent;
  }

  async startTrial(businessId: string, reason: string): Promise<Entitlement> {
    const ent = await this.getOrCreateEntitlement(businessId);

    // Idempoten: sudah trial, jangan restart
    if (ent.status === 'trial') {
      return ent;
    }

    // Reject dari plus atau locked
    if (ent.status === 'plus') {
      throw new BadRequestException('Already Plus subscriber. Trial not needed.');
    }

    if (ent.status === 'locked') {
      throw new BadRequestException('Cannot start trial from locked. Upgrade to Plus required.');
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + this.TRIAL_DAYS * 24 * 60 * 60 * 1000);

    ent.status = 'trial';
    ent.trial_started_at = now.toISOString();
    ent.trial_ends_at = trialEnd.toISOString();
    ent.features = this.getFeaturesForStatus('trial');
    ent.updated_at = now.toISOString();

    this.recordStatusChange(businessId, 'free', 'trial', reason, 'system');

    return ent;
  }

  async checkAndTransitionExpiredTrial(businessId: string): Promise<boolean> {
    const ent = await this.getOrCreateEntitlement(businessId);

    if (ent.status !== 'trial' || !ent.trial_ends_at) {
      return false;
    }

    const now = Date.now();
    const trialEnd = new Date(ent.trial_ends_at).getTime();

    if (now > trialEnd) {
      ent.status = 'locked';
      ent.features = this.getFeaturesForStatus('locked');
      ent.updated_at = new Date().toISOString();

      this.recordStatusChange(businessId, 'trial', 'locked', 'Trial expired', 'system');
      return true;
    }

    return false;
  }

  async upgradeToPlusManual(businessId: string, reason: string): Promise<Entitlement> {
    const ent = await this.getOrCreateEntitlement(businessId);

    if (ent.status === 'plus') {
      return ent; // idempoten
    }

    const fromStatus = ent.status;
    ent.status = 'plus';
    ent.features = this.getFeaturesForStatus('plus');
    ent.updated_at = new Date().toISOString();

    this.recordStatusChange(businessId, fromStatus, 'plus', reason, 'system');

    return ent;
  }

  async getAuditLog(businessId: string): Promise<EntitlementStatusChange[]> {
    return this.auditLogs.get(businessId) ?? [];
  }

  private createInitialEntitlement(businessId: string): Entitlement {
    return {
      business_id: businessId,
      status: 'free',
      trial_started_at: null,
      trial_ends_at: null,
      features: this.getFeaturesForStatus('free'),
      updated_at: new Date().toISOString(),
    };
  }

  private getFeaturesForStatus(status: EntitlementStatus): EntitlementFeatures {
    switch (status) {
      case 'free':
        return {
          kios: true,
          m1: true,
          ai_analysis: false,
          wati_real_data: false,
          cosmetic_rewards: true,
        };
      case 'trial':
      case 'plus':
        return {
          kios: true,
          m1: true,
          ai_analysis: true,
          wati_real_data: true,
          cosmetic_rewards: true,
        };
      case 'locked':
        return {
          kios: true,
          m1: true,
          ai_analysis: false,
          wati_real_data: false,
          cosmetic_rewards: true,
        };
    }
  }

  private recordStatusChange(
    businessId: string,
    fromStatus: EntitlementStatus | null,
    toStatus: EntitlementStatus,
    reason: string,
    changedBy: string,
  ): void {
    const log = this.auditLogs.get(businessId) ?? [];
    log.push({
      business_id: businessId,
      from_status: fromStatus,
      to_status: toStatus,
      reason,
      changed_at: new Date().toISOString(),
      changed_by: changedBy,
    });
    this.auditLogs.set(businessId, log);
  }
}
