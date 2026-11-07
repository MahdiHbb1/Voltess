import { Controller, Post, Get, Body, Req, Inject } from '@nestjs/common';
import { NotificationQueue } from './notification.queue';
import { NotificationType } from './notification.types';

@Controller('notifications')
export class NotificationController {
  constructor(@Inject(NotificationQueue) private readonly queue: NotificationQueue) {}

  @Post('send')
  async send(
    @Body() body: { userId: string; type: NotificationType; title: string; message: string },
  ) {
    await this.queue.enqueue({
      userId: body.userId,
      type: body.type,
      title: body.title,
      body: body.message,
    });
    return { queued: true };
  }

  @Get('preferences')
  async getPreferences(@Req() req: any) {
    const userId = req.user?.id;
    // ponytail: query DB for preferences
    return { enabled: true, dailyCap: 5 };
  }

  @Post('preferences')
  async updatePreferences(@Req() req: any, @Body() body: { enabled: boolean; dailyCap: number }) {
    const userId = req.user?.id;
    // ponytail: update DB
    return { success: true };
  }
}
