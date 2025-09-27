const { createClient } = require('@supabase/supabase-js');

/**
 * Get standardized Supabase client for Netlify functions
 * This ensures consistent environment variable usage across all functions
 */
function getSupabaseClient() {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!url) {
    throw new Error('REACT_APP_SUPABASE_URL environment variable is not set');
  }

  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_KEY environment variable is not set');
  }

  return createClient(url, serviceKey);
}

module.exports = { getSupabaseClient };