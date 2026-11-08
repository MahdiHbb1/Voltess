-- Subscriptions & AI Usage Schema
-- Run this in Supabase SQL Editor after 001_initial_schema.sql

-- Stripe subscriptions table (separate from legacy subscriptions table)
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'plus')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due')),
  stripe_subscription_id VARCHAR(100) UNIQUE,
  stripe_customer_id VARCHAR(100),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user_id ON stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_stripe_sub_id ON stripe_subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status ON stripe_subscriptions(status);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'stripe_subscriptions_updated_at') THEN
    CREATE TRIGGER stripe_subscriptions_updated_at BEFORE UPDATE ON stripe_subscriptions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- AI usage tracking (separate from legacy ai_usage table)
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
  usage_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES business_profiles(business_id) ON DELETE CASCADE,
  feature VARCHAR(50) NOT NULL CHECK (feature IN ('ocr', 'stt', 'analysis')),
  provider VARCHAR(50) NOT NULL,
  tokens_used INT NOT NULL,
  cost_usd DECIMAL(10,6) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_business_id ON ai_usage_tracking(business_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_created_at ON ai_usage_tracking(created_at);

ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;
