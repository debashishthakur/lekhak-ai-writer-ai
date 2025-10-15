-- Lekhak AI Extension Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- USERS TABLE
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  extension_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX idx_users_extension_id ON users(extension_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ==========================================
-- SUBSCRIPTION PLANS TABLE
-- ==========================================
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  hits_limit INTEGER NOT NULL, -- -1 for unlimited
  features JSONB DEFAULT '[]'::jsonb,
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_plans_active ON subscription_plans(is_active);

-- ==========================================
-- USER SUBSCRIPTIONS TABLE
-- ==========================================
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, cancelled, expired, past_due
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, yearly
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

-- ==========================================
-- USER QUOTAS TABLE
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
-- USAGE LOGS TABLE
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
-- PAYMENT TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_payment_intent_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- succeeded, failed, pending, cancelled
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_transactions_status ON payment_transactions(status);
CREATE INDEX idx_transactions_created_at ON payment_transactions(created_at DESC);

-- ==========================================
-- INSERT DEFAULT SUBSCRIPTION PLANS
-- ==========================================
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, hits_limit, features) VALUES
('Free', 'Perfect for trying out Lekhak AI', 0.00, 0.00, 7, '["Basic text rewriting", "7 uses per day", "Standard support"]'::jsonb),
('Pro', 'For regular users who need more features', 4.99, 49.99, 1000, '["Advanced AI rewriting", "Grammar checking", "Tone adjustment", "1000 uses per month", "Priority support"]'::jsonb),
('Unlimited', 'For power users and professionals', 19.99, 199.99, -1, '["Unlimited usage", "All Pro features", "API access", "Custom integrations", "Premium support"]'::jsonb);

-- ==========================================
-- DATABASE FUNCTIONS
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

-- Function to check and increment user quota
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
  SELECT * INTO v_subscription 
  FROM user_subscriptions 
  WHERE user_id = v_user.id 
    AND status = 'active' 
    AND (current_period_end IS NULL OR current_period_end > NOW())
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF v_subscription IS NOT NULL THEN
    -- Get subscription plan
    SELECT * INTO v_plan FROM subscription_plans WHERE id = v_subscription.plan_id;
    v_is_free_user := false;
    v_subscription_status := v_subscription.status;
    v_plan_name := v_plan.name;
    
    -- Check limits based on plan
    IF v_plan.hits_limit = -1 THEN
      -- Unlimited plan
      v_can_use := true;
      v_hits_remaining := -1;
    ELSIF v_quota.hits_used_this_month < v_plan.hits_limit THEN
      -- Within monthly limit
      v_can_use := true;
      v_hits_remaining := v_plan.hits_limit - v_quota.hits_used_this_month;
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

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (API endpoints)
CREATE POLICY "Service role can access all users" ON users FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all subscriptions" ON user_subscriptions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all quotas" ON user_quotas FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all usage logs" ON usage_logs FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all transactions" ON payment_transactions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all plans" ON subscription_plans FOR ALL TO service_role USING (true);

-- ==========================================
-- COMPLETED SCHEMA SETUP
-- ==========================================

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema setup completed successfully!';
    RAISE NOTICE '📊 Tables created: users, subscription_plans, user_subscriptions, user_quotas, usage_logs, payment_transactions';
    RAISE NOTICE '🔧 Functions created: check_and_increment_quota, reset_daily_quotas, reset_monthly_quotas';
    RAISE NOTICE '🛡️ Row Level Security enabled with service role policies';
    RAISE NOTICE '📋 Default subscription plans inserted (Free, Pro, Unlimited)';
END $$;