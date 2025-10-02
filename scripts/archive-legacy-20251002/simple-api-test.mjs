/**
 * Simple SoccersAPI test - try basic connectivity
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

const SOCCERSAPI_KEY = process.env.SOCCERSAPI_KEY;

console.log('🔑 API Key:', SOCCERSAPI_KEY);

async function testSimpleEndpoint() {
  console.log('\n🧪 Testing simple connectivity...');

  // Try the most basic endpoint patterns with different auth methods
  const testCases = [
    {
      url: `https://api.soccersapi.com/v2.2/leagues?username=p@kinotto.co&token=${SOCCERSAPI_KEY}`,
      name: 'Email + Token (v2.2)'
    },
    {
      url: `https://api.soccersapi.com/v2.2/leagues?APIkey=${SOCCERSAPI_KEY}`,
      name: 'APIkey only (v2.2)'
    },
    {
      url: `https://api.soccersapi.com/leagues?username=p@kinotto.co&token=${SOCCERSAPI_KEY}`,
      name: 'Email + Token (no version)'
    },
    {
      url: `https://api.soccersapi.com/leagues?APIkey=${SOCCERSAPI_KEY}`,
      name: 'APIkey only (no version)'
    },
    {
      url: `https://api.soccersapi.com/v2.2/competitions?username=p@kinotto.co&token=${SOCCERSAPI_KEY}`,
      name: 'Competitions with email + token'
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n📡 Testing: ${testCase.name}`);
      console.log(`🔗 URL: ${testCase.url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(testCase.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'FixturesApp-Test/1.0',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📊 Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const text = await response.text();
        console.log(`✅ SUCCESS! Response length: ${text.length} chars`);

        try {
          const data = JSON.parse(text);
          console.log(`📄 JSON Response:`, JSON.stringify(data, null, 2).substring(0, 500) + '...');
          return true;
        } catch (e) {
          console.log(`📄 Raw Response:`, text.substring(0, 500) + '...');
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ Error response:`, errorText.substring(0, 200) + '...');
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`⏰ Request timed out`);
      } else {
        console.log(`❌ Request failed:`, error.message);
      }
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return false;
}

// Check if API is completely down
async function checkApiStatus() {
  console.log('\n🏥 Checking if API server is responding...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.soccersapi.com/', {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`📊 Server status: ${response.status} ${response.statusText}`);
    return response.status < 500; // Any non-server error means API is at least responding

  } catch (error) {
    console.log(`❌ Server check failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Simple SoccersAPI Test\n');

  if (!SOCCERSAPI_KEY) {
    console.error('❌ No API key found');
    process.exit(1);
  }

  // First check if server is responding at all
  const serverUp = await checkApiStatus();
  if (!serverUp) {
    console.log('\n💔 API server appears to be down. Try again later.');
    process.exit(1);
  }

  // Test specific endpoints
  const success = await testSimpleEndpoint();

  if (success) {
    console.log('\n🎉 API connection successful!');
    process.exit(0);
  } else {
    console.log('\n💥 All tests failed. Check your API key or contact support.');
    process.exit(1);
  }
}

main();