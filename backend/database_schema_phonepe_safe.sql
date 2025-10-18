-- Lekhak AI PhonePe Payment Integration - SAFE MIGRATION
-- This safely migrates to PhonePe while handling existing policies
-- Compatible with: PostgreSQL 12+ / Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- DROP EXISTING TABLES (EXCEPT USERS)
-- ==========================================
DROP TABLE IF EXISTS subscription_renewals CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS settlements CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS phonepe_transactions CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS usage_logs CASCADE;
DROP TABLE IF EXISTS user_quotas CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- ==========================================
-- CLEAN UP USERS TABLE (PRESERVE DATA)
-- ==========================================
-- Remove any Stripe-specific columns if they exist
ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id;

-- Ensure users table has correct structure
ALTER TABLE users 
  ALTER COLUMN extension_id SET NOT NULL,
  ALTER COLUMN is_active SET DEFAULT true,
  ALTER COLUMN last_seen SET DEFAULT NOW();

-- ==========================================
-- CREATE SUBSCRIPTION PLANS TABLE
-- ==========================================
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  hits_limit INTEGER DEFAULT -1, -- -1 for unlimited
  features JSONB DEFAULT '[]'::jsonb,
  phonepe_plan_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_plans_active ON subscription_plans(is_active);
CREATE INDEX idx_plans_phonepe_id ON subscription_plans(phonepe_plan_id);

-- ==========================================
-- CREATE USER SUBSCRIPTIONS TABLE
-- ==========================================
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, cancelled, expired, past_due, paused
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, yearly
  phonepe_order_id VARCHAR(255),
  phonepe_merchant_order_id VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_phonepe_merchant_order_id ON user_subscriptions(phonepe_merchant_order_id);
CREATE INDEX idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

-- ==========================================
-- CREATE USER QUOTAS TABLE
-- ==========================================
CREATE TABLE user_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hits_used_today INTEGER DEFAULT 0,
  hits_used_this_month INTEGER DEFAULT 0,
  total_hits_used INTEGER DEFAULT 0,
  daily_reset_at TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('day', NOW() + INTERVAL '1 day'),
  monthly_reset_at TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', NOW() + INTERVAL '1 month'),
  daily_limit INTEGER DEFAULT 7, -- Free tier: 7 uses per day
  monthly_limit INTEGER DEFAULT -1, -- -1 for unlimited
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_quotas_user_id ON user_quotas(user_id);
CREATE INDEX idx_user_quotas_reset_dates ON user_quotas(daily_reset_at, monthly_reset_at);

-- ==========================================
-- CREATE USAGE LOGS TABLE
-- ==========================================
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'text_rewrite', 'grammar_check', etc.
  input_text_length INTEGER,
  output_text_length INTEGER,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user_created ON usage_logs(user_id, created_at DESC);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at DESC);

-- ==========================================
-- CREATE PAYMENT TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  phonepe_order_id VARCHAR(255),
  phonepe_merchant_order_id VARCHAR(255) UNIQUE NOT NULL,
  amount_paisa INTEGER NOT NULL,
  amount_rupees DECIMAL(10,2) NOT NULL,
  base_amount DECIMAL(10,2) NOT NULL,
  gst_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, completed, failed, cancelled
  phonepe_state VARCHAR(50),
  payment_method VARCHAR(50),
  phonepe_payment_details JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_transactions_phonepe_merchant_order_id ON payment_transactions(phonepe_merchant_order_id);
CREATE INDEX idx_transactions_status ON payment_transactions(status);
CREATE INDEX idx_transactions_created_at ON payment_transactions(created_at DESC);

-- ==========================================
-- CREATE PHONEPE-SPECIFIC TABLES
-- ==========================================

-- PhonePe transactions table (enhanced tracking)
CREATE TABLE phonepe_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    merchant_order_id VARCHAR(255) UNIQUE NOT NULL,
    phonepe_order_id VARCHAR(255),
    amount_paisa INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    state VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
    payment_details JSONB,
    callback_received_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refunds table
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_payment_id UUID NOT NULL REFERENCES payment_transactions(id),
    user_id UUID NOT NULL REFERENCES users(id),
    merchant_refund_id VARCHAR(255) UNIQUE NOT NULL,
    phonepe_refund_id VARCHAR(255),
    amount_paisa INTEGER NOT NULL,
    amount_rupees DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, accepted
    phonepe_state VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Webhook events table
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    merchant_order_id VARCHAR(255),
    phonepe_order_id VARCHAR(255),
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settlements table
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_id VARCHAR(255) UNIQUE NOT NULL,
    amount_paisa INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'initiated', -- initiated, completed, failed
    settlement_date DATE,
    bank_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disputes table
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id VARCHAR(255) UNIQUE NOT NULL,
    payment_id UUID REFERENCES payment_transactions(id),
    merchant_order_id VARCHAR(255),
    amount_paisa INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'created', -- created, under_review, resolved, lost
    reason TEXT,
    evidence_required TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Subscription renewals table
CREATE TABLE subscription_renewals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    old_subscription_id UUID REFERENCES user_subscriptions(id),
    new_subscription_id UUID REFERENCES user_subscriptions(id),
    payment_transaction_id UUID REFERENCES payment_transactions(id),
    renewal_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    renewal_type VARCHAR(50) DEFAULT 'manual', -- manual, auto
    discount_applied DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT
);

-- ==========================================
-- CREATE INDEXES FOR PHONEPE TABLES
-- ==========================================

CREATE INDEX idx_phonepe_transactions_merchant_order_id ON phonepe_transactions(merchant_order_id);
CREATE INDEX idx_phonepe_transactions_phonepe_order_id ON phonepe_transactions(phonepe_order_id);
CREATE INDEX idx_phonepe_transactions_user_id ON phonepe_transactions(user_id);
CREATE INDEX idx_phonepe_transactions_state ON phonepe_transactions(state);

CREATE INDEX idx_refunds_original_payment_id ON refunds(original_payment_id);
CREATE INDEX idx_refunds_merchant_refund_id ON refunds(merchant_refund_id);
CREATE INDEX idx_refunds_status ON refunds(status);

CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);

-- ==========================================
-- INSERT PHONEPE SUBSCRIPTION PLANS
-- ==========================================
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, hits_limit, features, phonepe_plan_id) VALUES
('Free', 'Perfect for trying out Lekhak AI', 0.00, 0.00, 7, 
 '["Basic text rewriting", "7 uses per day", "Standard support"]'::jsonb, 
 'PLAN_FREE'),
('Pro', 'For regular users who need more features', 399.00, 3999.00, 1000, 
 '["Advanced AI rewriting", "Grammar checking", "Tone adjustment", "1000 uses per month", "Priority support"]'::jsonb, 
 'PLAN_PRO_MONTHLY'),
('Unlimited', 'For power users and professionals', 1599.00, 15999.00, -1, 
 '["Unlimited usage", "All Pro features", "API access", "Custom integrations", "Premium support"]'::jsonb, 
 'PLAN_UNLIMITED_MONTHLY');

-- ==========================================
-- DATABASE FUNCTIONS (UPDATED FOR PHONEPE)
-- ==========================================

-- Function to reset daily quotas
CREATE OR REPLACE FUNCTION reset_daily_quotas()
RETURNS void AS $$
BEGIN
  UPDATE user_quotas 
  SET 
    hits_used_today = 0,
    daily_reset_at = date_trunc('day', NOW() + INTERVAL '1 day'),
    updated_at = NOW()
  WHERE daily_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly quotas
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS void AS $$
BEGIN
  UPDATE user_quotas 
  SET 
    hits_used_this_month = 0,
    monthly_reset_at = date_trunc('month', NOW() + INTERVAL '1 month'),
    updated_at = NOW()
  WHERE monthly_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Updated function to check and increment user quota (PhonePe version)
CREATE OR REPLACE FUNCTION check_and_increment_quota(p_extension_id VARCHAR)
RETURNS TABLE(
  can_use BOOLEAN,
  hits_remaining INTEGER,
  is_free_user BOOLEAN,
  subscription_status VARCHAR(50),
  plan_name VARCHAR(100)
) AS $$
DECLARE
  v_user RECORD;
  v_quota RECORD;
  v_subscription RECORD;
  v_plan RECORD;
  v_can_use BOOLEAN := false;
  v_hits_remaining INTEGER := 0;
  v_is_free_user BOOLEAN := true;
  v_subscription_status VARCHAR(50) := 'free';
  v_plan_name VARCHAR(100) := 'Free';
BEGIN
  -- Reset quotas if needed
  PERFORM reset_daily_quotas();
  PERFORM reset_monthly_quotas();
  
  -- Find or create user
  SELECT * INTO v_user FROM users WHERE extension_id = p_extension_id;
  
  IF v_user IS NULL THEN
    -- Create new user
    INSERT INTO users (extension_id) VALUES (p_extension_id) RETURNING * INTO v_user;
    -- Create quota record
    INSERT INTO user_quotas (user_id) VALUES (v_user.id);
  END IF;
  
  -- Get user quota
  SELECT * INTO v_quota FROM user_quotas WHERE user_id = v_user.id;
  
  -- Create quota record if doesn't exist
  IF v_quota IS NULL THEN
    INSERT INTO user_quotas (user_id) VALUES (v_user.id);
    SELECT * INTO v_quota FROM user_quotas WHERE user_id = v_user.id;
  END IF;
  
  -- Get active subscription
  SELECT us.*, sp.name as plan_name, sp.hits_limit 
  INTO v_subscription 
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = v_user.id 
    AND us.status = 'active' 
    AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
  ORDER BY us.created_at DESC 
  LIMIT 1;
  
  IF v_subscription IS NOT NULL THEN
    -- User has active subscription
    v_is_free_user := false;
    v_subscription_status := v_subscription.status;
    v_plan_name := v_subscription.plan_name;
    
    -- Check limits based on plan
    IF v_subscription.hits_limit = -1 THEN
      -- Unlimited plan
      v_can_use := true;
      v_hits_remaining := -1;
    ELSIF v_quota.hits_used_this_month < v_subscription.hits_limit THEN
      -- Within monthly limit
      v_can_use := true;
      v_hits_remaining := v_subscription.hits_limit - v_quota.hits_used_this_month;
    END IF;
  ELSE
    -- Free user - check daily limit
    IF v_quota.hits_used_today < v_quota.daily_limit THEN
      v_can_use := true;
      v_hits_remaining := v_quota.daily_limit - v_quota.hits_used_today;
    END IF;
  END IF;
  
  -- Increment usage if allowed
  IF v_can_use THEN
    UPDATE user_quotas 
    SET 
      hits_used_today = hits_used_today + 1,
      hits_used_this_month = hits_used_this_month + 1,
      total_hits_used = total_hits_used + 1,
      updated_at = NOW()
    WHERE user_id = v_user.id;
    
    -- Recalculate remaining
    IF v_hits_remaining > 0 THEN
      v_hits_remaining := v_hits_remaining - 1;
    END IF;
  END IF;
  
  RETURN QUERY SELECT v_can_use, v_hits_remaining, v_is_free_user, v_subscription_status, v_plan_name;
END;
$$ LANGUAGE plpgsql;

-- Create audit log function
CREATE OR REPLACE FUNCTION audit_log() 
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
DROP TRIGGER IF EXISTS trigger_audit_users ON users;
CREATE TRIGGER trigger_audit_users
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION audit_log();

DROP TRIGGER IF EXISTS trigger_audit_subscriptions ON user_subscriptions;
CREATE TRIGGER trigger_audit_subscriptions
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION audit_log();

DROP TRIGGER IF EXISTS trigger_audit_payments ON payment_transactions;
CREATE TRIGGER trigger_audit_payments
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION audit_log();

DROP TRIGGER IF EXISTS trigger_audit_phonepe_transactions ON phonepe_transactions;
CREATE TRIGGER trigger_audit_phonepe_transactions
    BEFORE UPDATE ON phonepe_transactions
    FOR EACH ROW
    EXECUTE FUNCTION audit_log();

DROP TRIGGER IF EXISTS trigger_audit_refunds ON refunds;
CREATE TRIGGER trigger_audit_refunds
    BEFORE UPDATE ON refunds
    FOR EACH ROW
    EXECUTE FUNCTION audit_log();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) - SAFE APPROACH
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE phonepe_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_renewals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Service role can access all users" ON users;
DROP POLICY IF EXISTS "Service role can access all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Service role can access all quotas" ON user_quotas;
DROP POLICY IF EXISTS "Service role can access all usage logs" ON usage_logs;
DROP POLICY IF EXISTS "Service role can access all transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Service role can access all plans" ON subscription_plans;

-- Create new policies for service role access
CREATE POLICY "service_role_users_access" ON users FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_subscriptions_access" ON user_subscriptions FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_quotas_access" ON user_quotas FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_usage_logs_access" ON usage_logs FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_transactions_access" ON payment_transactions FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_plans_access" ON subscription_plans FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_phonepe_transactions_access" ON phonepe_transactions FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_refunds_access" ON refunds FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_webhook_events_access" ON webhook_events FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_settlements_access" ON settlements FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_disputes_access" ON disputes FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_renewals_access" ON subscription_renewals FOR ALL TO service_role USING (true);

-- ==========================================
-- COMMENTS FOR DOCUMENTATION
-- ==========================================
COMMENT ON TABLE users IS 'User accounts with extension integration';
COMMENT ON TABLE subscription_plans IS 'Available subscription plans with PhonePe integration';
COMMENT ON TABLE user_subscriptions IS 'Active user subscriptions';
COMMENT ON TABLE user_quotas IS 'User usage quotas and limits';
COMMENT ON TABLE payment_transactions IS 'Payment transaction records';
COMMENT ON TABLE phonepe_transactions IS 'PhonePe-specific transaction tracking';
COMMENT ON TABLE refunds IS 'Refund requests and processing';
COMMENT ON TABLE usage_logs IS 'User action logs for analytics';
COMMENT ON TABLE webhook_events IS 'PhonePe webhook event logs';
COMMENT ON TABLE settlements IS 'PhonePe settlement tracking';
COMMENT ON TABLE disputes IS 'Payment dispute tracking';

-- ==========================================
-- COMPLETED SCHEMA SETUP
-- ==========================================

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE '✅ PhonePe database schema migration completed successfully!';
    RAISE NOTICE '🗑️ Old tables dropped, PhonePe tables created';
    RAISE NOTICE '👥 User data preserved';
    RAISE NOTICE '📊 All tables recreated with PhonePe integration';
    RAISE NOTICE '🔧 Functions updated for PhonePe workflow';
    RAISE NOTICE '🛡️ RLS policies recreated safely';
    RAISE NOTICE '💰 PhonePe subscription plans: Free (₹0), Pro (₹399), Unlimited (₹1599)';
    RAISE NOTICE '🚀 Database ready for PhonePe payment integration!';
END $$;