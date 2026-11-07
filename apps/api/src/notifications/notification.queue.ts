import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NotificationPayload } from './notification.types';

@Injectable()
export class NotificationQueue {
  private queue: Queue;

  constructor() {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = Number(process.env.REDIS_PORT || 6379);

    this.queue = new Queue('notifications', {
      connection: { host: redisHost, port: redisPort },
    });
  }

  async enqueue(payload: NotificationPayload): Promise<void> {
    await this.queue.add('send', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  getQueue(): Queue {
    return this.queue;
  }
}
