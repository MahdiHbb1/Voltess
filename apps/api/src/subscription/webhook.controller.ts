import { Controller, Post, Headers, RawBodyRequest, Req } from '@nestjs/common';
import Stripe from 'stripe';

@Controller('webhook')
export class WebhookController {
  private stripe?: Stripe;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      this.stripe = new Stripe(key, { apiVersion: '2026-10-28.endive' });
    }
  }

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!this.stripe) throw new Error('Stripe not configured');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not set');

    const event = this.stripe.webhooks.constructEvent(
      req.rawBody!,
      sig,
      webhookSecret,
    );

    switch (event.type) {
      case 'checkout.session.completed':
        // ponytail: create subscription record in DB
        console.log('[WEBHOOK] checkout.session.completed', event.data.object.id);
        break;
      case 'customer.subscription.deleted':
        // ponytail: mark subscription canceled in DB
        console.log('[WEBHOOK] subscription.deleted', event.data.object.id);
        break;
    }

    return { received: true };
  }
}
