// Check environment variables
module.exports = async function handler(req, res) {
  return res.status(200).json({
    supabase_url_exists: !!process.env.SUPABASE_URL,
    supabase_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabase_url_preview: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 20) + '...' : 'NOT SET',
    env_vars: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
  });
};