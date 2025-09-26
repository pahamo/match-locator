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
    // Try multiple possible locations for the _redirects file
    const possiblePaths = [
      path.join(process.cwd(), '_redirects'),
      path.join(process.cwd(), 'build/_redirects'),
      path.join(process.cwd(), 'public/_redirects'),
      path.join(__dirname, '../../_redirects'),
      path.join(__dirname, '../../build/_redirects'),
      path.join(__dirname, '../../public/_redirects')
    ];

    let redirectsPath = null;
    const debugInfo = {
      cwd: process.cwd(),
      dirname: __dirname,
      checkedPaths: []
    };

    for (const testPath of possiblePaths) {
      const exists = fs.existsSync(testPath);
      debugInfo.checkedPaths.push({ path: testPath, exists });
      if (exists) {
        redirectsPath = testPath;
        break;
      }
    }

    // Check if file exists
    if (!redirectsPath) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: '_redirects file not found',
          debug: debugInfo
        })
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