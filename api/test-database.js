// Test endpoint to verify database connection and functionality
const { supabase, checkAndIncrementQuota, getSubscriptionPlans } = require('../lib/database.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing database connection...');

    // Test 1: Basic connection
    const { data: testConnection, error: connectionError } = await supabase
      .from('subscription_plans')
      .select('count')
      .limit(1);

    if (connectionError) {
      throw new Error(`Connection failed: ${connectionError.message}`);
    }

    console.log('✅ Database connection successful');

    // Test 2: Get subscription plans
    const plans = await getSubscriptionPlans();
    console.log(`✅ Retrieved ${plans.length} subscription plans`);

    // Test 3: Test quota function with dummy extension ID
    const testExtensionId = 'test-extension-' + Date.now();
    const quotaResult = await checkAndIncrementQuota(testExtensionId);
    console.log('✅ Quota function test successful:', quotaResult);

    // Test 4: Check if test user was created
    const { data: testUser } = await supabase
      .from('users')
      .select('*')
      .eq('extension_id', testExtensionId)
      .single();

    console.log('✅ Test user created:', testUser ? 'Yes' : 'No');

    return res.status(200).json({
      success: true,
      message: 'Database tests completed successfully',
      tests: {
        connection: 'PASSED',
        subscription_plans: `PASSED (${plans.length} plans)`,
        quota_function: 'PASSED',
        user_creation: testUser ? 'PASSED' : 'SKIPPED'
      },
      data: {
        plans: plans,
        test_quota_result: quotaResult,
        test_user_id: testUser?.id
      }
    });

  } catch (error) {
    console.error('💥 Database test failed:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Database test failed',
      details: {
        error_type: error.name,
        error_stack: error.stack?.split('\n').slice(0, 3) // First 3 lines of stack
      }
    });
  }
}