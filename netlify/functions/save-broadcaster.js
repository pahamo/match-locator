const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { fixtureId, providerId } = JSON.parse(event.body);

    // Validate input
    if (typeof fixtureId !== 'number') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid input: fixtureId (number) required' })
      };
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Handle null providerId (clear broadcaster assignment)
    if (providerId === null) {
      const { error } = await supabase
        .from('broadcasts')
        .delete()
        .eq('fixture_id', fixtureId);

      if (error) {
        console.error('Supabase error (delete):', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Database delete failed', details: error.message })
        };
      }
    } else {
      // Validate providerId is a number
      if (typeof providerId !== 'number') {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid input: providerId must be number or null' })
        };
      }

      // Try to upsert broadcaster assignment
      console.log('Attempting upsert with:', { fixture_id: fixtureId, provider_id: parseInt(String(providerId)) });

      const { data, error } = await supabase
        .from('broadcasts')
        .upsert({
          fixture_id: fixtureId,
          provider_id: parseInt(String(providerId))
        }, {
          onConflict: 'fixture_id'
        });

      if (error) {
        console.error('Supabase error (upsert):', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Database upsert failed', details: error.message })
        };
      }
    }

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
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};