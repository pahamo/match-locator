const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  console.log('=== UPDATE TEAM URL SLUG START ===');

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { teamId, newUrlSlug } = JSON.parse(event.body);

    // Validate input
    if (typeof teamId !== 'number' || !newUrlSlug || typeof newUrlSlug !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid input: teamId (number) and newUrlSlug (string) required' })
      };
    }

    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Check if the new slug is already in use
    const { data: existingTeam, error: checkError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('url_slug', newUrlSlug)
      .neq('id', teamId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Check existing slug error:', checkError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to check slug availability', details: checkError.message })
      };
    }

    if (existingTeam) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: 'Slug already in use',
          details: `The slug "${newUrlSlug}" is already used by team "${existingTeam.name}"`
        })
      };
    }

    // Update the team's url_slug
    const { error: updateError } = await supabase
      .from('teams')
      .update({ url_slug: newUrlSlug })
      .eq('id', teamId);

    if (updateError) {
      console.error('Update error:', updateError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to update team slug', details: updateError.message })
      };
    }

    console.log(`Updated team ${teamId} url_slug to: ${newUrlSlug}`);
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