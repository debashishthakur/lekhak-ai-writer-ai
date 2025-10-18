-- Database Schema for PhonePe Integration

-- Create phonepe_transactions table
CREATE TABLE IF NOT EXISTS phonepe_transactions (
    id SERIAL PRIMARY KEY,
    merchant_order_id VARCHAR(255) UNIQUE NOT NULL,
    phonepe_order_id VARCHAR(255),
    user_id VARCHAR(255) NOT NULL,
    plan_id VARCHAR(255) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL, -- Amount in paisa
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, CANCELLED
    phonepe_response JSONB,
    webhook_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    plan_id VARCHAR(255) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, expired, cancelled
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    merchant_order_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_phonepe_merchant_order_id ON phonepe_transactions(merchant_order_id);
CREATE INDEX IF NOT EXISTS idx_phonepe_user_id ON phonepe_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_phonepe_status ON phonepe_transactions(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON user_subscriptions(expires_at);
