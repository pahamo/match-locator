const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  console.log('=== FUNCTION START ===');
  console.log('Method:', event.httpMethod);
  console.log('Body:', event.body);

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('ERROR: Method not allowed');
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('=== PARSING BODY ===');
    // Parse request body
    const { fixtureId, providerId } = JSON.parse(event.body);
    console.log('Parsed:', { fixtureId, providerId, fixtureIdType: typeof fixtureId, providerIdType: typeof providerId });

    console.log('=== VALIDATION ===');
    // Validate input
    if (typeof fixtureId !== 'number') {
      console.log('ERROR: Invalid fixtureId type:', typeof fixtureId);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid input: fixtureId (number) required' })
      };
    }
    console.log('Validation passed');

    console.log('=== ENV CHECK ===');
    console.log('URL exists:', !!process.env.REACT_APP_SUPABASE_URL);
    console.log('Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('URL value:', process.env.REACT_APP_SUPABASE_URL);
    console.log('Key preview:', process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : 'MISSING');

    if (!process.env.REACT_APP_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('CRITICAL: Missing environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Configuration error: Missing environment variables' })
      };
    }

    console.log('=== SUPABASE INIT ===');
    // Initialize Supabase client - using direct approach for critical function
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log('Supabase client created');

    console.log('=== DATABASE OPERATION ===');
    // Handle null providerId (clear broadcaster assignment)
    if (providerId === null) {
      console.log('DELETE operation for fixture:', fixtureId);
      const { error } = await supabase
        .from('broadcasts')
        .delete()
        .eq('fixture_id', fixtureId);

      if (error) {
        console.error('DELETE failed:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Database delete failed', details: error.message })
        };
      }
      console.log('DELETE successful');
    } else {
      // Validate providerId is a number
      if (typeof providerId !== 'number') {
        console.log('ERROR: Invalid providerId type:', typeof providerId);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid input: providerId must be number or null' })
        };
      }

      console.log('UPSERT operation with:', { fixture_id: fixtureId, provider_id: parseInt(String(providerId)) });

      const { data, error } = await supabase
        .from('broadcasts')
        .upsert({
          fixture_id: fixtureId,
          provider_id: parseInt(String(providerId))
        }, {
          onConflict: 'fixture_id'
        });

      if (error) {
        console.error('UPSERT failed:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Database upsert failed', details: error.message })
        };
      }
      console.log('UPSERT successful, data:', data);
    }

    console.log('=== SUCCESS ===');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('=== CAUGHT EXCEPTION ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', JSON.stringify(error, null, 2));
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message,
        type: error.constructor.name
      })
    };
  }
};