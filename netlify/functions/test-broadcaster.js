const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const logs = [];
  const log = (message) => {
    console.log(message);
    logs.push(message);
  };

  log('=== TEST FUNCTION START ===');

  try {
    // Test environment variables
    log('Environment check:');
    log(`URL: ${process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'NOT SET'}`);
    log(`KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'}`);

    if (!process.env.REACT_APP_SUPABASE_URL) {
      log('ERROR: REACT_APP_SUPABASE_URL is missing');
      return {
        statusCode: 500,
        body: JSON.stringify({ logs, error: 'Missing SUPABASE_URL' })
      };
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      log('ERROR: SUPABASE_SERVICE_ROLE_KEY is missing');
      return {
        statusCode: 500,
        body: JSON.stringify({ logs, error: 'Missing SERVICE_ROLE_KEY' })
      };
    }

    // Test Supabase client creation
    log('Creating Supabase client...');
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    log('Supabase client created');

    // Test a simple query
    log('Testing database connection...');
    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .limit(1);

    if (error) {
      log(`Database error: ${error.message}`);
      return {
        statusCode: 500,
        body: JSON.stringify({ logs, error: error.message })
      };
    }

    log(`Database test successful. Found ${data?.length || 0} records`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        logs,
        success: true,
        message: 'All tests passed',
        sampleData: data?.length
      })
    };

  } catch (error) {
    log(`CAUGHT EXCEPTION: ${error.message}`);
    log(`Error type: ${error.constructor.name}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        logs,
        error: error.message,
        type: error.constructor.name,
        stack: error.stack
      })
    };
  }
};