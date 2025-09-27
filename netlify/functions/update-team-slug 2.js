const { getSupabaseClient } = require('./_shared/supabase');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { teamId, oldSlug, newSlug } = JSON.parse(event.body);

    if (!teamId || !newSlug) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'teamId and newSlug are required' })
      };
    }

    // Initialize Supabase with service role key for admin operations
    const supabase = getSupabaseClient();

    // Update the team slug
    const { data, error } = await supabase
      .from('teams')
      .update({ slug: newSlug })
      .eq('id', teamId)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to update team slug', details: error.message })
      };
    }

    if (!data || data.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Team not found' })
      };
    }

    console.log(`Updated team ${teamId} slug from '${oldSlug}' to '${newSlug}'`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        team: data[0],
        message: `Slug updated from '${oldSlug}' to '${newSlug}'`
      })
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: err.message })
    };
  }
};