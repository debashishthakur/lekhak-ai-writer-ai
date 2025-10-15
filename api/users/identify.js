// API endpoint for extension user identification and quota checking
import { checkAndIncrementQuota, logUsage, getUserByExtensionId } from '../../lib/database.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { extension_id, action_type, metadata = {} } = req.body;

    // Validate required fields
    if (!extension_id) {
      return res.status(400).json({ 
        error: 'Missing required field: extension_id' 
      });
    }

    if (!action_type) {
      return res.status(400).json({ 
        error: 'Missing required field: action_type' 
      });
    }

    console.log(`📊 Extension usage request: ${extension_id} - ${action_type}`);

    // Check quota and increment usage
    const quotaResult = await checkAndIncrementQuota(extension_id);

    console.log(`📈 Quota check result:`, quotaResult);

    // If usage is allowed, log the activity
    if (quotaResult.can_use) {
      try {
        // Get user info for logging
        const user = await getUserByExtensionId(extension_id);
        
        if (user) {
          await logUsage(user.id, action_type, {
            input_length: metadata.input_length,
            output_length: metadata.output_length,
            user_agent: req.headers['user-agent'],
            ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress
          });
        }
      } catch (logError) {
        // Don't fail the request if logging fails
        console.error('⚠️ Failed to log usage:', logError);
      }
    }

    // Determine upgrade URL
    const upgradeUrl = quotaResult.is_free_user 
      ? `/pricing?extension_id=${extension_id}&upgrade=true`
      : `/pricing?extension_id=${extension_id}&manage=true`;

    // Return response
    return res.status(200).json({
      success: true,
      can_use: quotaResult.can_use,
      hits_remaining: quotaResult.hits_remaining,
      subscription_status: quotaResult.subscription_status,
      plan_name: quotaResult.plan_name,
      is_free_user: quotaResult.is_free_user,
      upgrade_url: upgradeUrl,
      message: quotaResult.can_use 
        ? 'Usage allowed' 
        : quotaResult.is_free_user 
          ? 'Daily limit reached. Upgrade to continue.'
          : 'Monthly limit reached. Please check your subscription.'
    });

  } catch (error) {
    console.error('💥 Error in /api/users/identify:', error);
    
    // Return a safe error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Unable to check usage status. Please try again.',
      can_use: false, // Fail safe - don't allow usage on error
      hits_remaining: 0
    });
  }
}