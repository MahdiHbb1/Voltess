import { Controller, Post, Headers, Req, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { SubscriptionService } from './subscription.service';
import { SubscriptionTier } from './subscription.types';

@Controller('webhook')
export class WebhookController {
  private stripe?: Stripe;

  constructor(@Inject(SubscriptionService) private readonly subscriptionService: SubscriptionService) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      this.stripe = new Stripe(key, { apiVersion: '2026-10-28.endive' });
    }
  }

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: any,
  ) {
    if (!this.stripe) throw new Error('Stripe not configured');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not set');

    // Get raw body from request
    const rawBody = req.body;
    
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret,
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const subId = session.subscription as string;
        
        console.log('[WEBHOOK] checkout.session.completed', { userId, subId });
        
        if (userId && subId) {
          const stripeSub = await this.stripe!.subscriptions.retrieve(subId);
          
          // Stripe API v2 uses start_date and billing_cycle_anchor
          const periodStart = new Date(stripeSub.start_date * 1000);
          const periodEnd = new Date(stripeSub.billing_cycle_anchor * 1000);
          
          await this.subscriptionService.createSubscription(
            userId,
            SubscriptionTier.Plus,
            subId,
            session.customer as string,
            periodStart,
            periodEnd,
          );
          console.log('[WEBHOOK] subscription created', subId);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.subscriptionService.updateSubscriptionStatus(subscription.id, 'canceled');
        console.log('[WEBHOOK] subscription canceled', subscription.id);
        break;
      }
    }

    return { received: true };
  }
}
