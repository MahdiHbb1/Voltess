import { Injectable } from '@nestjs/common';
import { Worker } from 'bullmq';
import { NotificationPayload, NotificationType, DEFAULT_DAILY_CAP } from './notification.types';

@Injectable()
export class NotificationWorker {
  private worker?: Worker;
  private enabled: boolean;
  private dailyCount = new Map<string, number>(); // ponytail: in-memory, use Redis when scaled

  constructor() {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = Number(process.env.REDIS_PORT || 6379);
    const redisUrl = process.env.REDIS_URL;

    // Skip Redis if REDIS_URL is empty or 'disabled'
    this.enabled = redisUrl !== '' && redisUrl !== 'disabled' && redisUrl !== undefined;

    if (this.enabled) {
      this.worker = new Worker(
        'notifications',
        async (job) => {
          const payload = job.data as NotificationPayload;
          await this.processNotification(payload);
        },
        { connection: { host: redisHost, port: redisPort } },
      );
    } else {
      console.log('[NotificationWorker] Redis disabled, worker not started');
    }
  }

  private async processNotification(payload: NotificationPayload): Promise<void> {
    const { userId, type, title, body } = payload;

    // Check daily cap
    const count = this.dailyCount.get(userId) || 0;
    if (count >= DEFAULT_DAILY_CAP) {
      console.log(`[NOTIF] Daily cap reached for ${userId}`);
      return;
    }

    // ponytail: check preferences (opt-in), FCM send skipped
    console.log(`[NOTIF] Send ${type} to ${userId}: ${title}`);

    // Increment count
    this.dailyCount.set(userId, count + 1);
  }

  // Reset daily counts (call via cron at midnight)
  resetDailyCounts(): void {
    this.dailyCount.clear();
  }
}
