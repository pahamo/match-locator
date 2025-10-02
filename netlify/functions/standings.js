// Netlify serverless function to fetch standings from Sports Monks API
// This avoids CORS issues and keeps the API token secure

exports.handler = async (event) => {
  const { seasonId } = event.queryStringParameters || {};

  if (!seasonId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'seasonId query parameter is required' })
    };
  }

  const token = process.env.SPORTMONKS_TOKEN;
  if (!token) {
    console.error('SPORTMONKS_TOKEN not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API token not configured' })
    };
  }

  try {
    const url = `https://api.sportmonks.com/v3/football/standings/seasons/${seasonId}?api_token=${token}&include=participant;rule.type;details.type;form`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Sports Monks API error: ${response.status}`);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `API error: ${response.status}` })
      };
    }

    const data = await response.json();

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
      body: JSON.stringify({ error: 'Failed to fetch standings' })
    };
  }
};
