-- Lekhak AI PhonePe Payment Integration Database Schema
-- Version: 1.0.0
-- Compatible with: PostgreSQL 12+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    extension_id VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    profile_picture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    hits_limit INTEGER DEFAULT -1, -- -1 for unlimited
    features JSONB,
    phonepe_plan_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired, past_due, paused
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    phonepe_order_id VARCHAR(255),
    phonepe_merchant_order_id VARCHAR(255),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT unique_active_subscription UNIQUE (user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create user quotas table
CREATE TABLE IF NOT EXISTS user_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    hits_used_today INTEGER DEFAULT 0,
    hits_used_this_month INTEGER DEFAULT 0,
    total_hits_used INTEGER DEFAULT 0,
    daily_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
    monthly_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'),
    daily_limit INTEGER DEFAULT 7, -- Cached from plan
    monthly_limit INTEGER DEFAULT -1, -- Cached from plan, -1 for unlimited
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_id UUID REFERENCES user_subscriptions(id),
    phonepe_order_id VARCHAR(255),
    phonepe_merchant_order_id VARCHAR(255) UNIQUE NOT NULL,
    amount_paisa INTEGER NOT NULL,
    amount_rupees DECIMAL(10,2) NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    gst_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, cancelled
    phonepe_state VARCHAR(50),
    payment_method VARCHAR(50),
    phonepe_payment_details JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE
);

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

-- Create usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL, -- text_rewrite, grammar_check, tone_adjustment
    input_text_length INTEGER,
    output_text_length INTEGER,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_extension_id ON users(extension_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_current_period_end ON user_subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_merchant_order_id ON payment_transactions(phonepe_merchant_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_phonepe_transactions_merchant_order_id ON phonepe_transactions(merchant_order_id);
CREATE INDEX IF NOT EXISTS idx_phonepe_transactions_phonepe_order_id ON phonepe_transactions(phonepe_order_id);
CREATE INDEX IF NOT EXISTS idx_phonepe_transactions_user_id ON phonepe_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_phonepe_transactions_state ON phonepe_transactions(state);

CREATE INDEX IF NOT EXISTS idx_refunds_original_payment_id ON refunds(original_payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_merchant_refund_id ON refunds(merchant_refund_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action_type ON usage_logs(action_type);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, hits_limit, features, phonepe_plan_id) 
VALUES 
    ('Free', 'Basic plan with daily usage limit', 0.00, 0.00, 7, 
     '["Basic text rewriting", "Daily reset at midnight UTC", "Standard support"]'::jsonb, 
     'PLAN_FREE'),
    ('Pro', 'Professional plan for regular users', 399.00, 3999.00, 1000, 
     '["Advanced AI rewriting", "Grammar checking", "Tone adjustment", "Priority support", "Monthly reset on billing date"]'::jsonb, 
     'PLAN_PRO_MONTHLY'),
    ('Unlimited', 'Unlimited usage for power users', 1599.00, 15999.00, -1, 
     '["All Pro features", "API access", "Custom integrations", "Premium support", "Early access to new features"]'::jsonb, 
     'PLAN_UNLIMITED_MONTHLY')
ON CONFLICT (name) DO UPDATE SET
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    hits_limit = EXCLUDED.hits_limit,
    features = EXCLUDED.features,
    phonepe_plan_id = EXCLUDED.phonepe_plan_id,
    updated_at = NOW();

-- Create functions for quota management
CREATE OR REPLACE FUNCTION update_user_quota() 
RETURNS TRIGGER AS $$
BEGIN
    -- Update quota when usage log is inserted
    INSERT INTO user_quotas (user_id, hits_used_today, hits_used_this_month, total_hits_used)
    VALUES (NEW.user_id, 1, 1, 1)
    ON CONFLICT (user_id) DO UPDATE SET
        hits_used_today = user_quotas.hits_used_today + 1,
        hits_used_this_month = user_quotas.hits_used_this_month + 1,
        total_hits_used = user_quotas.total_hits_used + 1,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quota updates
DROP TRIGGER IF EXISTS trigger_update_user_quota ON usage_logs;
CREATE TRIGGER trigger_update_user_quota
    AFTER INSERT ON usage_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_user_quota();

-- Create function to reset daily quotas
CREATE OR REPLACE FUNCTION reset_daily_quotas() 
RETURNS void AS $$
BEGIN
    UPDATE user_quotas 
    SET hits_used_today = 0,
        daily_reset_at = CURRENT_DATE + INTERVAL '1 day',
        updated_at = NOW()
    WHERE daily_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to reset monthly quotas
CREATE OR REPLACE FUNCTION reset_monthly_quotas() 
RETURNS void AS $$
BEGIN
    UPDATE user_quotas 
    SET hits_used_this_month = 0,
        monthly_reset_at = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month',
        updated_at = NOW()
    WHERE monthly_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to check user quota
CREATE OR REPLACE FUNCTION check_user_quota(p_user_id UUID, p_action_type VARCHAR)
RETURNS TABLE(
    can_use BOOLEAN,
    hits_remaining INTEGER,
    daily_limit INTEGER,
    monthly_limit INTEGER,
    subscription_status VARCHAR
) AS $$
DECLARE
    v_quota RECORD;
    v_subscription RECORD;
    v_plan RECORD;
BEGIN
    -- Get user subscription
    SELECT * INTO v_subscription 
    FROM user_subscriptions 
    WHERE user_id = p_user_id AND status = 'active'
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Get plan details
    IF v_subscription.plan_id IS NOT NULL THEN
        SELECT * INTO v_plan 
        FROM subscription_plans 
        WHERE id = v_subscription.plan_id;
    ELSE
        -- Default to free plan
        SELECT * INTO v_plan 
        FROM subscription_plans 
        WHERE name = 'Free';
    END IF;
    
    -- Get or create user quota
    SELECT * INTO v_quota 
    FROM user_quotas 
    WHERE user_id = p_user_id;
    
    IF v_quota IS NULL THEN
        INSERT INTO user_quotas (user_id, daily_limit, monthly_limit)
        VALUES (p_user_id, 
                CASE WHEN v_plan.name = 'Free' THEN 7 ELSE v_plan.hits_limit END,
                CASE WHEN v_plan.hits_limit = -1 THEN -1 ELSE v_plan.hits_limit END);
        
        SELECT * INTO v_quota 
        FROM user_quotas 
        WHERE user_id = p_user_id;
    END IF;
    
    -- Check quota limits
    RETURN QUERY SELECT
        CASE 
            WHEN v_plan.name = 'Unlimited' THEN TRUE
            WHEN v_plan.name = 'Free' AND v_quota.hits_used_today < 7 THEN TRUE
            WHEN v_plan.name = 'Pro' AND v_quota.hits_used_this_month < 1000 THEN TRUE
            ELSE FALSE
        END as can_use,
        CASE 
            WHEN v_plan.name = 'Unlimited' THEN -1
            WHEN v_plan.name = 'Free' THEN (7 - v_quota.hits_used_today)
            WHEN v_plan.name = 'Pro' THEN (1000 - v_quota.hits_used_this_month)
            ELSE 0
        END as hits_remaining,
        v_quota.daily_limit,
        v_quota.monthly_limit,
        COALESCE(v_subscription.status, 'free')::VARCHAR;
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

-- Comments for documentation
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

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lekhak_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lekhak_app;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO lekhak_app;