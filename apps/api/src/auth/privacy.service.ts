import { Injectable } from '@nestjs/common';

/** Data category */
export interface DataCategory {
  category: string;
  description: string;
  items: string[];
  retention_days: number | null;
}

/** Deletion request */
export interface DeletionRequest {
  request_id: string;
  user_id: string;
  business_id: string;
  requested_at: Date;
  completed_at: Date | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

@Injectable()
export class PrivacyService {
  private readonly deletionRequests = new Map<string, DeletionRequest>();

  /** Get data categories for user */
  getDataCategories(userId: string, businessId: string): DataCategory[] {
    return [
      {
        category: 'Account',
        description: 'Authentication and profile data',
        items: ['Phone number', 'OTP history', 'Session tokens'],
        retention_days: null, // Retained until account deletion
      },
      {
        category: 'Business Profile',
        description: 'Business information and settings',
        items: [
          'Business name',
          'Template selection',
          'Electricity rate',
          'Billing type',
          'Appliances list',
        ],
        retention_days: null,
      },
      {
        category: 'Captures',
        description: 'Uploaded images and OCR results',
        items: [
          'Label photos',
          'Meter readings',
          'Token receipts',
          'OCR extracted data',
        ],
        retention_days: 365, // 1 year
      },
      {
        category: 'Mission Events',
        description: 'Gamification progress and rewards',
        items: ['Completed missions', 'Points earned', 'Badges'],
        retention_days: null,
      },
      {
        category: 'Entitlement',
        description: 'Subscription status and trial history',
        items: ['Trial start/end dates', 'Subscription status', 'Status changes'],
        retention_days: null,
      },
      {
        category: 'Usage Analytics',
        description: 'Anonymous usage statistics',
        items: ['API call counts', 'Feature usage', 'Error logs'],
        retention_days: 90,
      },
    ];
  }

  /** Create deletion request */
  createDeletionRequest(userId: string, businessId: string): DeletionRequest {
    const request: DeletionRequest = {
      request_id: `del_${Date.now()}_${userId}`,
      user_id: userId,
      business_id: businessId,
      requested_at: new Date(),
      completed_at: null,
      status: 'pending',
    };

    this.deletionRequests.set(request.request_id, request);
    return request;
  }

  /** Get deletion request status */
  getDeletionRequest(requestId: string): DeletionRequest | undefined {
    return this.deletionRequests.get(requestId);
  }

  /** Mark deletion as completed */
  markCompleted(requestId: string): void {
    const request = this.deletionRequests.get(requestId);
    if (request) {
      request.status = 'completed';
      request.completed_at = new Date();
    }
  }

  /** Mark deletion as failed */
  markFailed(requestId: string): void {
    const request = this.deletionRequests.get(requestId);
    if (request) {
      request.status = 'failed';
    }
  }

  /** Clear all - for tests */
  clearAll(): void {
    this.deletionRequests.clear();
  }
}
