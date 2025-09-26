const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Read the _redirects file from the build directory
    const redirectsPath = path.join(process.cwd(), '_redirects');

    // Check if file exists
    if (!fs.existsSync(redirectsPath)) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: '_redirects file not found' })
      };
    }

    // Read the file content
    const content = fs.readFileSync(redirectsPath, 'utf8');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET'
      },
      body: content
    };
  } catch (error) {
    console.error('Error reading _redirects file:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to read _redirects file', details: error.message })
    };
  }
};