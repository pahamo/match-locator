// Netlify serverless function to fetch standings from Sports Monks API
// This avoids CORS issues and keeps the API token secure

exports.handler = async (event) => {
  const { seasonId } = event.queryStringParameters || {};

  if (!seasonId) {
    console.error('Missing seasonId parameter');
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'seasonId query parameter is required' })
    };
  }

  // Try multiple env var names for flexibility
  const token = process.env.SPORTMONKS_TOKEN ||
                process.env.REACT_APP_SPORTMONKS_TOKEN ||
                process.env.VITE_SPORTMONKS_TOKEN;

  if (!token) {
    console.error('SPORTMONKS_TOKEN not configured. Available env vars:', Object.keys(process.env).filter(k => k.includes('SPORT')));
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'API token not configured',
        message: 'Please set SPORTMONKS_TOKEN environment variable in Netlify dashboard'
      })
    };
  }

  console.log(`Fetching standings for season ${seasonId}`);

  try {
    const url = `https://api.sportmonks.com/v3/football/standings/seasons/${seasonId}?api_token=${token}&include=participant;rule.type;details.type;form`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Sports Monks API error: ${response.status}`, errorText);
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `API error: ${response.status}`,
          details: errorText.substring(0, 200)
        })
      };
    }

    const data = await response.json();
    console.log(`Successfully fetched standings for season ${seasonId}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800' // Cache for 30 minutes
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error fetching standings:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch standings',
        message: error.message
      })
    };
  }
};
