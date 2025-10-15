// Database utility functions for Lekhak AI Extension
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with error handling
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL environment variable');
  throw new Error('SUPABASE_URL is required');
}

if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Check if user can use the extension and increment quota
 * @param {string} extensionId - Unique extension identifier
 * @returns {Promise<Object>} Usage status and remaining quota
 */
async function checkAndIncrementQuota(extensionId) {
  try {
    const { data, error } = await supabase.rpc('check_and_increment_quota', {
      p_extension_id: extensionId
    });

    if (error) {
      console.error('Database error in checkAndIncrementQuota:', error);
      throw error;
    }

    // Return the first row (function returns table)
    const result = data?.[0] || {
      can_use: false,
      hits_remaining: 0,
      is_free_user: true,
      subscription_status: 'free',
      plan_name: 'Free'
    };

    return result;
  } catch (error) {
    console.error('Error checking user quota:', error);
    throw error;
  }
}

/**
 * Get user information by extension ID
 * @param {string} extensionId - Unique extension identifier
 * @returns {Promise<Object>} User data with quota information
 */
async function getUserByExtensionId(extensionId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_quotas(*),
        user_subscriptions!inner(
          *,
          subscription_plans(*)
        )
      `)
      .eq('extension_id', extensionId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Database error in getUserByExtensionId:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting user by extension ID:', error);
    throw error;
  }
}

/**
 * Create a new user with extension ID
 * @param {string} extensionId - Unique extension identifier
 * @param {Object} userInfo - Optional user information (email, name, etc.)
 * @returns {Promise<Object>} Created user data
 */
async function createUser(extensionId, userInfo = {}) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        extension_id: extensionId,
        email: userInfo.email || null,
        name: userInfo.name || null,
        profile_picture: userInfo.profile_picture || null
      })
      .select()
      .single();

    if (error) {
      console.error('Database error in createUser:', error);
      throw error;
    }

    // Create initial quota record
    await supabase
      .from('user_quotas')
      .insert({
        user_id: data.id
      });

    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Log usage activity
 * @param {string} userId - User UUID
 * @param {string} actionType - Type of action (text_rewrite, grammar_check, etc.)
 * @param {Object} metadata - Additional metadata (text lengths, etc.)
 * @returns {Promise<Object>} Created log entry
 */
async function logUsage(userId, actionType, metadata = {}) {
  try {
    const { data, error } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        action_type: actionType,
        input_text_length: metadata.input_length || null,
        output_text_length: metadata.output_length || null,
        user_agent: metadata.user_agent || null,
        ip_address: metadata.ip_address || null
      })
      .select()
      .single();

    if (error) {
      console.error('Database error in logUsage:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error logging usage:', error);
    throw error;
  }
}

/**
 * Get all subscription plans
 * @returns {Promise<Array>} Available subscription plans
 */
async function getSubscriptionPlans() {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) {
      console.error('Database error in getSubscriptionPlans:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    throw error;
  }
}

/**
 * Create or update user subscription
 * @param {string} userId - User UUID
 * @param {string} planId - Subscription plan UUID
 * @param {Object} subscriptionData - Stripe subscription data
 * @returns {Promise<Object>} Created/updated subscription
 */
async function createUserSubscription(userId, planId, subscriptionData) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        stripe_subscription_id: subscriptionData.stripe_subscription_id,
        stripe_customer_id: subscriptionData.stripe_customer_id,
        status: subscriptionData.status || 'active',
        billing_cycle: subscriptionData.billing_cycle || 'monthly',
        current_period_start: subscriptionData.current_period_start,
        current_period_end: subscriptionData.current_period_end
      })
      .select()
      .single();

    if (error) {
      console.error('Database error in createUserSubscription:', error);
      throw error;
    }

    // Update user quota limits based on plan
    const plan = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (plan.data) {
      await supabase
        .from('user_quotas')
        .update({
          daily_limit: plan.data.hits_limit === -1 ? -1 : Math.min(plan.data.hits_limit, 100),
          monthly_limit: plan.data.hits_limit,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    }

    return data;
  } catch (error) {
    console.error('Error creating user subscription:', error);
    throw error;
  }
}

/**
 * Update subscription status (for webhooks)
 * @param {string} stripeSubscriptionId - Stripe subscription ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated subscription
 */
async function updateSubscriptionStatus(stripeSubscriptionId, updateData) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: updateData.status,
        current_period_start: updateData.current_period_start,
        current_period_end: updateData.current_period_end,
        cancelled_at: updateData.cancelled_at || null,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Database error in updateSubscriptionStatus:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}

/**
 * Record payment transaction
 * @param {string} userId - User UUID
 * @param {Object} transactionData - Payment transaction data
 * @returns {Promise<Object>} Created transaction record
 */
async function recordPaymentTransaction(userId, transactionData) {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        subscription_id: transactionData.subscription_id || null,
        stripe_payment_intent_id: transactionData.stripe_payment_intent_id,
        amount: transactionData.amount,
        currency: transactionData.currency || 'USD',
        status: transactionData.status,
        description: transactionData.description || null,
        metadata: transactionData.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Database error in recordPaymentTransaction:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error recording payment transaction:', error);
    throw error;
  }
}

module.exports = { 
  supabase,
  checkAndIncrementQuota,
  getUserByExtensionId,
  createUser,
  logUsage,
  getSubscriptionPlans,
  createUserSubscription,
  updateSubscriptionStatus,
  recordPaymentTransaction
};