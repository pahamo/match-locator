// Test script to verify we can connect to the production database
const { createClient } = require('@supabase/supabase-js');

console.log('Testing database connection...');
console.log('Environment variables available:');
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

// Try to use the same URLs as your working Netlify setup
const SUPABASE_URL = 'https://your-project.supabase.co';  // You'll need to provide this
const SERVICE_KEY = 'your-service-role-key';  // You'll need to provide this

if (!SUPABASE_URL.includes('supabase.co') || !SERVICE_KEY.startsWith('eyJ')) {
  console.log('❌ Please update this script with your actual Supabase credentials');
  console.log('You can find these in your Netlify environment variables dashboard');
  process.exit(1);
}

async function testConnection() {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Test basic connection
    const { data, error } = await supabase
      .from('teams')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Connection failed:', error.message);
    } else {
      console.log('✅ Successfully connected to database');
      console.log('Ready to run migration!');
    }
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

testConnection();