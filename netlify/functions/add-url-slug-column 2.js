const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  console.log('=== ADD URL_SLUG COLUMN START ===');

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Add url_slug column to teams table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                        WHERE table_name='teams' AND column_name='url_slug') THEN
            ALTER TABLE teams ADD COLUMN url_slug TEXT;
            CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_url_slug ON teams(url_slug) WHERE url_slug IS NOT NULL;
          END IF;
        END $$;
      `
    });

    if (error) {
      console.error('SQL Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to add column', details: error.message })
      };
    }

    console.log('URL_SLUG column added successfully');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ success: true, message: 'url_slug column added to teams table' })
    };

  } catch (error) {
    console.error('Exception:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};