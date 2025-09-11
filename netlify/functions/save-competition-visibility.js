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
    const { competitionId, isVisible } = JSON.parse(event.body);

    // Validate input
    if (typeof competitionId !== 'number' || typeof isVisible !== 'boolean') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid input: competitionId (number) and isVisible (boolean) required' })
      };
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Update competition visibility
    const { error } = await supabase
      .from('competitions')
      .update({ is_production_visible: isVisible })
      .eq('id', competitionId);

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database update failed', details: error.message })
      };
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