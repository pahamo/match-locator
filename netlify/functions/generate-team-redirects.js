const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  console.log('=== GENERATE TEAM REDIRECTS START ===');

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
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

    // Get all teams with both old and new slugs
    const { data: teams, error } = await supabase
      .from('teams')
      .select('id, name, slug, url_slug')
      .order('name');

    if (error) {
      console.error('Fetch Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch teams', details: error.message })
      };
    }

    // Generate redirect mappings
    const redirects = [];
    const redirectsSet = new Set(); // Track duplicates

    for (const team of teams) {
      if (team.url_slug && team.slug !== team.url_slug) {
        // Create redirects from old slug to new url_slug
        const oldPath = `/club/${team.slug}`;
        const newPath = `/club/${team.url_slug}`;
        const redirectLine = `${oldPath} ${newPath} 301!`;

        // Also redirect the old /clubs/ path to new /club/ path
        const oldClubsPath = `/clubs/${team.slug}`;
        const redirectClubsLine = `${oldClubsPath} ${newPath} 301!`;

        if (!redirectsSet.has(redirectLine)) {
          redirects.push(redirectLine);
          redirectsSet.add(redirectLine);
        }

        if (!redirectsSet.has(redirectClubsLine)) {
          redirects.push(redirectClubsLine);
          redirectsSet.add(redirectClubsLine);
        }

        console.log(`Redirect: ${team.name}: ${team.slug} → ${team.url_slug}`);
      }
    }

    // Add general /clubs/ to /club/ redirect pattern
    redirects.push('/clubs/:slug /club/:slug 301!');

    const redirectsContent = redirects.join('\n') + '\n';

    console.log(`Generated ${redirects.length} redirect rules`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: redirectsContent
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