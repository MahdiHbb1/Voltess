-- Voltess DB Schema v1 - Initial tables
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (auth + profile)
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  phone_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_phone_hash ON users(phone_hash);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- Business profiles
CREATE TABLE business_profiles (
  business_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  template_id VARCHAR(50) NOT NULL,
  electricity_rate DECIMAL(10,2) NOT NULL,
  billing_type VARCHAR(20) NOT NULL CHECK (billing_type IN ('prepaid', 'postpaid')),
  unit_label VARCHAR(50) NOT NULL DEFAULT 'unit',
  appliances JSONB NOT NULL DEFAULT '[]',
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_business_user_id ON business_profiles(user_id);
CREATE INDEX idx_business_deleted_at ON business_profiles(deleted_at) WHERE deleted_at IS NOT NULL;

-- Captures (label, meter, token)
CREATE TABLE captures (
  capture_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES business_profiles(business_id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('label', 'meter', 'token')),
  file_ref VARCHAR(500) NOT NULL,
  result JSONB,
  confidence VARCHAR(20) CHECK (confidence IN ('high', 'medium', 'low')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('queued', 'pending', 'verified', 'rejected', 'needs_retake')),
  request_id VARCHAR(100),
  idempotency_key VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_captures_business_id ON captures(business_id);
CREATE INDEX idx_captures_status ON captures(status);
CREATE INDEX idx_captures_idempotency_key ON captures(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_captures_created_at ON captures(created_at);

-- Mission events
CREATE TABLE mission_events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  mission_id VARCHAR(50) NOT NULL,
  business_id UUID NOT NULL REFERENCES business_profiles(business_id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL DEFAULT '{}',
  verification JSONB NOT NULL,
  reward JSONB NOT NULL
);

CREATE INDEX idx_mission_business_id ON mission_events(business_id);
CREATE INDEX idx_mission_occurred_at ON mission_events(occurred_at);

-- Entitlements
CREATE TABLE entitlements (
  business_id UUID PRIMARY KEY REFERENCES business_profiles(business_id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('free', 'trial', 'plus', 'locked')),
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  features JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_entitlement_status ON entitlements(status);

-- Entitlement audit log
CREATE TABLE entitlement_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES business_profiles(business_id) ON DELETE CASCADE,
  from_status VARCHAR(20),
  to_status VARCHAR(20) NOT NULL,
  reason TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by VARCHAR(50) NOT NULL
);

CREATE INDEX idx_entitlement_changes_business_id ON entitlement_changes(business_id);
CREATE INDEX idx_entitlement_changes_changed_at ON entitlement_changes(changed_at);

-- OTP codes (temporary, short TTL)
CREATE TABLE otp_codes (
  phone VARCHAR(20) PRIMARY KEY,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_expires_at ON otp_codes(expires_at);

-- Guest consent (for merge)
CREATE TABLE guest_consents (
  guest_id VARCHAR(100) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  progress_snapshot JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  merged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guest_consents_expires_at ON guest_consents(expires_at);
CREATE INDEX idx_guest_consents_phone ON guest_consents(phone);

-- Deletion requests (privacy)
CREATE TABLE deletion_requests (
  request_id VARCHAR(100) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES business_profiles(business_id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_deletion_requests_user_id ON deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_status ON deletion_requests(status);

-- Jobs queue (BullMQ replacement)
CREATE TABLE jobs (
  job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_name VARCHAR(50) NOT NULL,
  job_name VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_queue_status ON jobs(queue_name, status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlement_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service role bypasses these)
-- Add policies here when needed for client-side access

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER business_profiles_updated_at BEFORE UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER captures_updated_at BEFORE UPDATE ON captures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER entitlements_updated_at BEFORE UPDATE ON entitlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Cleanup expired OTP and guest consents (run via cron or scheduled function)
CREATE OR REPLACE FUNCTION cleanup_expired_temp_data()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes WHERE expires_at < NOW();
  DELETE FROM guest_consents WHERE expires_at < NOW() AND merged = TRUE;
END;
$$ LANGUAGE plpgsql;
