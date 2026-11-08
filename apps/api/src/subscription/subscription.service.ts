import { Injectable, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { SubscriptionTier, Subscription } from './subscription.types';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SubscriptionService {
  private stripe?: Stripe;

  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {
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

  async getSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await this.db.getClient()
      .from('stripe_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.subscription_id,
      userId: data.user_id,
      tier: data.tier as SubscriptionTier,
      status: data.status,
      stripeSubscriptionId: data.stripe_subscription_id,
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async createSubscription(
    userId: string,
    tier: SubscriptionTier,
    stripeSubId: string,
    stripeCustomerId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<void> {
    try {
      const { error } = await this.db.getClient()
        .from('stripe_subscriptions')
        .insert({
          user_id: userId,
          tier,
          status: 'active',
          stripe_subscription_id: stripeSubId,
          stripe_customer_id: stripeCustomerId,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
        });
      
      if (error) {
        console.error('[SubscriptionService] Insert error:', error);
        throw error;
      }
      
      console.log('[SubscriptionService] Insert success:', { userId, stripeSubId });
    } catch (err) {
      console.error('[SubscriptionService] createSubscription failed:', err);
      throw err;
    }
  }

  async updateSubscriptionStatus(stripeSubId: string, status: 'active' | 'canceled' | 'past_due'): Promise<void> {
    await this.db.getClient()
      .from('stripe_subscriptions')
      .update({ status })
      .eq('stripe_subscription_id', stripeSubId);
  }

  private getPriceId(tier: SubscriptionTier): string {
    // ponytail: hardcoded price IDs, move to env when multiple tiers exist
    if (tier === SubscriptionTier.Plus) {
      return process.env.STRIPE_PLUS_PRICE_ID || 'price_placeholder';
    }
    throw new Error(`No price for tier ${tier}`);
  }
}
