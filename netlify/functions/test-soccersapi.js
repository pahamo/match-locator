/**
 * Netlify Function: Test SoccersAPI Connection
 * Simple endpoint to test API connectivity from admin panel
 */

const fetch = require('node-fetch');

// SoccersAPI client for testing
class SoccersApiTester {
  constructor() {
    this.baseUrl = 'https://api.soccersapi.com/v2.2';
    this.apiKey = process.env.SOCCERSAPI_KEY;
    this.email = process.env.SOCCERSAPI_USERNAME;
  }

  async testConnection() {
    if (!this.apiKey) {
      throw new Error('SOCCERSAPI_KEY not configured');
    }

    if (!this.email) {
      throw new Error('SOCCERSAPI_USERNAME not configured');
    }

    // Try a simple endpoint with proper authentication
    const url = new URL(`${this.baseUrl}/leagues`);
    url.searchParams.append('username', this.email);
    url.searchParams.append('token', this.apiKey);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'FixturesApp-Test/1.0',
        'Accept': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  getUsageStats() {
    return {
      requestCount: 1, // This would be tracked in a real implementation
      cacheSize: 0,
      lastRequestTime: Date.now(),
    };
  }
}

exports.handler = async (event, context) => {
  console.log('🧪 SoccersAPI test function called');

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const tester = new SoccersApiTester();

    // Test the connection
    const data = await tester.testConnection();

    console.log('✅ SoccersAPI test successful');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        message: 'SoccersAPI connection successful',
        dataReceived: Array.isArray(data) ? data.length : 1,
        sampleData: Array.isArray(data) ? data.slice(0, 2) : data,
        stats: tester.getUsageStats(),
      })
    };

  } catch (error) {
    console.error('❌ SoccersAPI test failed:', error);

    // Provide helpful error messages
    let userMessage = error.message;
    if (error.message.includes('401')) {
      userMessage = 'Invalid credentials. Please check your email and API key.';
    } else if (error.message.includes('timeout')) {
      userMessage = 'API request timed out. Please try again.';
    } else if (error.message.includes('not configured')) {
      userMessage = 'API credentials not configured in environment variables.';
    }

    return {
      statusCode: 200, // Return 200 so the frontend can handle the error gracefully
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: false,
        error: userMessage,
        details: error.message,
        timestamp: new Date().toISOString(),
      })
    };
  }
};