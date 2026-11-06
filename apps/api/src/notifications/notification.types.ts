export enum NotificationType {
  NewMatch = 'new_match',
  IncomingLike = 'incoming_like',
  ExpiringMatch = 'expiring_match',
}

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  types: Partial<Record<NotificationType, boolean>>;
  dailyCap: number;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_DAILY_CAP = 5;
