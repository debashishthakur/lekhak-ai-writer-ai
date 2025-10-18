-- Lekhak AI PhonePe Integration - MIGRATION SCHEMA
-- This adds PhonePe support while preserving existing Stripe data
-- Compatible with: PostgreSQL 12+ / Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- MODIFY EXISTING TABLES (NON-DESTRUCTIVE)
-- ==========================================

-- Add PhonePe columns to existing subscription_plans table
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS phonepe_plan_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add PhonePe columns to existing user_subscriptions table
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS phonepe_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS phonepe_merchant_order_id VARCHAR(255);

-- Add PhonePe columns to existing payment_transactions table
ALTER TABLE payment_transactions 
ADD COLUMN IF NOT EXISTS phonepe_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS phonepe_merchant_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS phonepe_state VARCHAR(50),
ADD COLUMN IF NOT EXISTS phonepe_payment_details JSONB,
ADD COLUMN IF NOT EXISTS base_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS amount_paisa INTEGER,
ADD COLUMN IF NOT EXISTS amount_rupees DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failed_at TIMESTAMP WITH TIME ZONE;

-- ==========================================
-- CREATE NEW PHONEPE-SPECIFIC TABLES
-- ==========================================

-- Create PhonePe transactions table (enhanced tracking)
CREATE TABLE IF NOT EXISTS phonepe_transactions (
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

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
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

-- Create webhook events table
CREATE TABLE IF NOT EXISTS webhook_events (
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

-- Create settlements table
CREATE TABLE IF NOT EXISTS settlements (
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

-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
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

-- Create subscription renewals table
CREATE TABLE IF NOT EXISTS subscription_renewals (
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
-- CREATE NEW INDEXES
-- ==========================================

-- PhonePe-specific indexes
CREATE INDEX IF NOT EXISTS idx_phonepe_transactions_merchant_order_id ON phonepe_transactions(merchant_order_id);
CREATE INDEX IF NOT EXISTS idx_phonepe_transactions_phonepe_order_id ON phonepe_transactions(phonepe_order_id);
CREATE INDEX IF NOT EXISTS idx_phonepe_transactions_user_id ON phonepe_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_phonepe_transactions_state ON phonepe_transactions(state);

CREATE INDEX IF NOT EXISTS idx_refunds_original_payment_id ON refunds(original_payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_merchant_refund_id ON refunds(merchant_refund_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- New indexes for updated columns
CREATE INDEX IF NOT EXISTS idx_payment_transactions_phonepe_merchant_order_id ON payment_transactions(phonepe_merchant_order_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_phonepe_merchant_order_id ON user_subscriptions(phonepe_merchant_order_id);

-- ==========================================
-- UPDATE SUBSCRIPTION PLANS FOR DUAL SUPPORT
-- ==========================================

-- Update existing plans with PhonePe pricing and plan IDs
UPDATE subscription_plans SET 
    price_monthly = 0.00,
    price_yearly = 0.00,
    phonepe_plan_id = 'PLAN_FREE',
    updated_at = NOW()
WHERE name = 'Free';

UPDATE subscription_plans SET 
    price_monthly = 399.00,  -- INR pricing for PhonePe
    price_yearly = 3999.00,
    phonepe_plan_id = 'PLAN_PRO_MONTHLY',
    updated_at = NOW()
WHERE name = 'Pro';

UPDATE subscription_plans SET 
    price_monthly = 1599.00,  -- INR pricing for PhonePe
    price_yearly = 15999.00,
    phonepe_plan_id = 'PLAN_UNLIMITED_MONTHLY',
    updated_at = NOW()
WHERE name = 'Unlimited';

-- Add new Indian market plans if they don't exist
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, hits_limit, features, phonepe_plan_id, stripe_price_id_monthly, stripe_price_id_yearly) 
VALUES 
    ('Pro India', 'Professional plan for Indian users', 399.00, 3999.00, 1000, 
     '["Advanced AI rewriting", "Grammar checking", "Tone adjustment", "1000 uses per month", "Priority support"]'::jsonb, 
     'PLAN_PRO_MONTHLY_INR', NULL, NULL),
    ('Unlimited India', 'Unlimited plan for Indian power users', 1599.00, 15999.00, -1, 
     '["Unlimited usage", "All Pro features", "API access", "Custom integrations", "Premium support"]'::jsonb, 
     'PLAN_UNLIMITED_MONTHLY_INR', NULL, NULL)
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- ==========================================

-- Enable RLS on new tables
ALTER TABLE phonepe_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_renewals ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role can access all phonepe transactions" ON phonepe_transactions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all refunds" ON refunds FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all webhook events" ON webhook_events FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all settlements" ON settlements FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all disputes" ON disputes FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can access all renewals" ON subscription_renewals FOR ALL TO service_role USING (true);

-- ==========================================
-- PHONEPE-SPECIFIC FUNCTIONS
-- ==========================================

-- Function to check PhonePe quota (extends existing quota system)
CREATE OR REPLACE FUNCTION check_phonepe_quota(p_extension_id VARCHAR)
RETURNS TABLE(
  can_use BOOLEAN,
  hits_remaining INTEGER,
  is_free_user BOOLEAN,
  subscription_status VARCHAR(50),
  plan_name VARCHAR(100),
  payment_provider VARCHAR(20)
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
  v_payment_provider VARCHAR(20) := 'free';
BEGIN
  -- Reset quotas if needed
  PERFORM reset_daily_quotas();
  PERFORM reset_monthly_quotas();
  
  -- Find user
  SELECT * INTO v_user FROM users WHERE extension_id = p_extension_id;
  
  IF v_user IS NULL THEN
    -- Return free tier limits for new users
    RETURN QUERY SELECT false, 0, true, 'free'::VARCHAR(50), 'Free'::VARCHAR(100), 'free'::VARCHAR(20);
    RETURN;
  END IF;
  
  -- Get user quota
  SELECT * INTO v_quota FROM user_quotas WHERE user_id = v_user.id;
  
  -- Get active subscription (prefer PhonePe, fallback to Stripe)
  SELECT us.*, sp.name as plan_name, sp.hits_limit, sp.phonepe_plan_id, sp.stripe_price_id_monthly
  INTO v_subscription 
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = v_user.id 
    AND us.status = 'active' 
    AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
  ORDER BY 
    CASE WHEN us.phonepe_merchant_order_id IS NOT NULL THEN 1 ELSE 2 END, -- Prefer PhonePe
    us.created_at DESC 
  LIMIT 1;
  
  IF v_subscription IS NOT NULL THEN
    v_is_free_user := false;
    v_subscription_status := v_subscription.status;
    v_plan_name := v_subscription.plan_name;
    
    -- Determine payment provider
    IF v_subscription.phonepe_merchant_order_id IS NOT NULL THEN
      v_payment_provider := 'phonepe';
    ELSIF v_subscription.stripe_subscription_id IS NOT NULL THEN
      v_payment_provider := 'stripe';
    END IF;
    
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
    IF v_quota IS NOT NULL AND v_quota.hits_used_today < v_quota.daily_limit THEN
      v_can_use := true;
      v_hits_remaining := v_quota.daily_limit - v_quota.hits_used_today;
    ELSIF v_quota IS NULL THEN
      v_can_use := true;
      v_hits_remaining := 7; -- Default free limit
    END IF;
  END IF;
  
  RETURN QUERY SELECT v_can_use, v_hits_remaining, v_is_free_user, v_subscription_status, v_plan_name, v_payment_provider;
END;
$$ LANGUAGE plpgsql;

-- Create audit log function for new tables
CREATE OR REPLACE FUNCTION audit_log_phonepe() 
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for new tables
CREATE TRIGGER trigger_audit_phonepe_transactions
    BEFORE UPDATE ON phonepe_transactions
    FOR EACH ROW
    EXECUTE FUNCTION audit_log_phonepe();

CREATE TRIGGER trigger_audit_refunds
    BEFORE UPDATE ON refunds
    FOR EACH ROW
    EXECUTE FUNCTION audit_log_phonepe();

-- ==========================================
-- COMMENTS FOR NEW TABLES
-- ==========================================

COMMENT ON TABLE phonepe_transactions IS 'PhonePe-specific transaction tracking';
COMMENT ON TABLE refunds IS 'Refund requests and processing for both Stripe and PhonePe';
COMMENT ON TABLE webhook_events IS 'PhonePe webhook event logs';
COMMENT ON TABLE settlements IS 'PhonePe settlement tracking';
COMMENT ON TABLE disputes IS 'Payment dispute tracking for both providers';
COMMENT ON TABLE subscription_renewals IS 'Subscription renewal history';

-- ==========================================
-- MIGRATION COMPLETION MESSAGE
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ PhonePe migration completed successfully!';
    RAISE NOTICE '🔄 Existing Stripe data preserved';
    RAISE NOTICE '🆕 PhonePe tables added: phonepe_transactions, refunds, webhook_events, settlements, disputes, subscription_renewals';
    RAISE NOTICE '📋 Subscription plans updated with INR pricing (₹399 Pro, ₹1599 Unlimited)';
    RAISE NOTICE '🔧 New function: check_phonepe_quota() supports both payment providers';
    RAISE NOTICE '🛡️ RLS policies created for all new tables';
    RAISE NOTICE '🚀 Database ready for dual Stripe/PhonePe integration!';
END $$;