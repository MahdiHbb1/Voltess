import { Controller, Post, Get, Delete, Body, Req, Inject } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionTier } from './subscription.types';

@Controller('subscription')
export class SubscriptionController {
  constructor(@Inject(SubscriptionService) private readonly subscriptionService: SubscriptionService) {}

  @Post('create')
  async createCheckout(@Req() req: any, @Body() body: { tier: SubscriptionTier }) {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    const url = await this.subscriptionService.createCheckoutSession(userId, body.tier);
    return { checkoutUrl: url };
  }

  @Post('cancel')
  async cancel(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    // ponytail: fetch subscription from DB, use stripeSubscriptionId
    const stripeSubId = 'sub_placeholder'; 
    await this.subscriptionService.cancelSubscription(stripeSubId);
    return { success: true };
  }

  @Get('status')
  async status(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    // ponytail: query DB for user subscription
    return { tier: SubscriptionTier.Free, status: 'active' };
  }
}
