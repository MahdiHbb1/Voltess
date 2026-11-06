import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { SubscriptionTier } from './subscription.types';

@Injectable()
export class SubscriptionService {
  private stripe?: Stripe;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      this.stripe = new Stripe(key, { apiVersion: '2026-10-28.endive' });
    }
  }

  async createCheckoutSession(userId: string, tier: SubscriptionTier): Promise<string> {
    if (!this.stripe) throw new Error('Stripe not configured');
    const priceId = this.getPriceId(tier);
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL}/subscription/success`,
      cancel_url: `${process.env.APP_URL}/subscription/cancel`,
      client_reference_id: userId,
    });
    return session.url!;
  }

  async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    if (!this.stripe) throw new Error('Stripe not configured');
    await this.stripe.subscriptions.cancel(stripeSubscriptionId);
  }

  private getPriceId(tier: SubscriptionTier): string {
    // ponytail: hardcoded price IDs, move to env when multiple tiers exist
    if (tier === SubscriptionTier.Plus) {
      return process.env.STRIPE_PLUS_PRICE_ID || 'price_placeholder';
    }
    throw new Error(`No price for tier ${tier}`);
  }
}
