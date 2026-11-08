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
    
    const sub = await this.subscriptionService.getSubscription(userId);
    if (!sub?.stripeSubscriptionId) {
      throw new Error('No active subscription');
    }
    
    await this.subscriptionService.cancelSubscription(sub.stripeSubscriptionId);
    return { success: true };
  }

  @Get('status')
  async status(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    
    const sub = await this.subscriptionService.getSubscription(userId);
    if (!sub) {
      return { tier: SubscriptionTier.Free, status: 'active' };
    }
    
    return {
      tier: sub.tier,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
    };
  }
}
