import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NotificationPayload } from './notification.types';

@Injectable()
export class NotificationQueue {
  private queue?: Queue;
  private enabled: boolean;

  constructor() {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = Number(process.env.REDIS_PORT || 6379);
    const redisUrl = process.env.REDIS_URL;

    // Skip Redis if REDIS_URL is empty or 'disabled'
    this.enabled = redisUrl !== '' && redisUrl !== 'disabled' && redisUrl !== undefined;

    if (this.enabled) {
      this.queue = new Queue('notifications', {
        connection: { host: redisHost, port: redisPort },
      });
    }
  }

  async enqueue(payload: NotificationPayload): Promise<void> {
    if (!this.enabled || !this.queue) {
      console.log('[NotificationQueue] Redis disabled, skipping enqueue:', payload.type);
      return;
    }
    await this.queue.add('send', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  getQueue(): Queue | undefined {
    return this.queue;
  }
}
