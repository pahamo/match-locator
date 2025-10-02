/**
 * Test SoccersAPI with ONLY the API key - no username
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

const API_KEY = process.env.SOCCERSAPI_KEY;

console.log('🔑 Testing with API KEY ONLY:', API_KEY);
console.log('🚀 No username - just the key\n');

async function testKeyOnlyAuth() {
  const baseUrls = [
    'https://api.soccersapi.com/v2.2',
    'https://api.soccersapi.com/v2',
    'https://api.soccersapi.com',
    'https://soccersapi.com/api/v2.2',
    'https://soccersapi.com/api'
  ];

  const endpoints = ['/leagues', '/competitions', '/countries', '/fixtures'];

  // Try key-only authentication patterns
  const keyOnlyMethods = [
    // Query parameter methods
    (url) => {
      url.searchParams.append('APIkey', API_KEY);
      return { method: 'GET', headers: { 'User-Agent': 'FixturesApp/1.0' } };
    },
    (url) => {
      url.searchParams.append('apikey', API_KEY);
      return { method: 'GET', headers: { 'User-Agent': 'FixturesApp/1.0' } };
    },
    (url) => {
      url.searchParams.append('api_key', API_KEY);
      return { method: 'GET', headers: { 'User-Agent': 'FixturesApp/1.0' } };
    },
    (url) => {
      url.searchParams.append('token', API_KEY);
      return { method: 'GET', headers: { 'User-Agent': 'FixturesApp/1.0' } };
    },
    (url) => {
      url.searchParams.append('key', API_KEY);
      return { method: 'GET', headers: { 'User-Agent': 'FixturesApp/1.0' } };
    },

    // Header methods
    (url) => {
      return {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'User-Agent': 'FixturesApp/1.0'
        }
      };
    },
    (url) => {
      return {
        method: 'GET',
        headers: {
          'Authorization': `Token ${API_KEY}`,
          'User-Agent': 'FixturesApp/1.0'
        }
      };
    },
    (url) => {
      return {
        method: 'GET',
        headers: {
          'X-API-Key': API_KEY,
          'User-Agent': 'FixturesApp/1.0'
        }
      };
    },
    (url) => {
      return {
        method: 'GET',
        headers: {
          'X-Auth-Token': API_KEY,
          'User-Agent': 'FixturesApp/1.0'
        }
      };
    },
    (url) => {
      return {
        method: 'GET',
        headers: {
          'API-Key': API_KEY,
          'User-Agent': 'FixturesApp/1.0'
        }
      };
    }
  ];

  const methodNames = [
    'Query: ?APIkey=',
    'Query: ?apikey=',
    'Query: ?api_key=',
    'Query: ?token=',
    'Query: ?key=',
    'Header: Authorization Bearer',
    'Header: Authorization Token',
    'Header: X-API-Key',
    'Header: X-Auth-Token',
    'Header: API-Key'
  ];

  let testCount = 0;

  for (const baseUrl of baseUrls) {
    console.log(`\n🌐 Testing Base URL: ${baseUrl}`);

    for (const endpoint of endpoints) {
      console.log(`\n📡 Endpoint: ${endpoint}`);

      for (let i = 0; i < keyOnlyMethods.length; i++) {
        testCount++;

        try {
          const url = new URL(`${baseUrl}${endpoint}`);
          const config = keyOnlyMethods[i](url);

          console.log(`  ${testCount}. ${methodNames[i]}`);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

          const response = await fetch(url.toString(), {
            ...config,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          console.log(`     Status: ${response.status} ${response.statusText}`);

          if (response.ok) {
            console.log(`     🎉 SUCCESS! Working authentication found!`);
            console.log(`     📍 URL: ${baseUrl}${endpoint}`);
            console.log(`     🔑 Method: ${methodNames[i]}`);

            const data = await response.text();
            console.log(`     📄 Response preview:`, data.substring(0, 300) + '...');

            return {
              success: true,
              baseUrl,
              endpoint,
              method: methodNames[i],
              fullUrl: url.toString()
            };
          } else {
            const errorText = await response.text();
            console.log(`     ❌ ${errorText.substring(0, 150)}...`);
          }

        } catch (error) {
          if (error.name === 'AbortError') {
            console.log(`     ⏰ Timeout`);
          } else {
            console.log(`     ❌ ${error.message}`);
          }
        }

        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Break early if we've tested a lot to avoid rate limiting
      if (testCount > 20) {
        console.log('\n⏸️  Stopping after 20+ tests to avoid rate limiting');
        break;
      }
    }

    if (testCount > 20) break;
  }

  return { success: false, testCount };
}

async function main() {
  if (!API_KEY) {
    console.error('❌ No API_KEY found in environment');
    process.exit(1);
  }

  const result = await testKeyOnlyAuth();

  if (result.success) {
    console.log('\n🎉 FOUND WORKING AUTHENTICATION!');
    console.log('✅ Use this configuration in your integration:');
    console.log(`   Base URL: ${result.baseUrl}`);
    console.log(`   Method: ${result.method}`);
    console.log(`   Example: ${result.fullUrl}`);
  } else {
    console.log(`\n💔 All ${result.testCount} key-only tests failed`);
    console.log('\n🤔 This suggests:');
    console.log('1. The API key might need to be activated in your dashboard');
    console.log('2. Your account might need verification/approval');
    console.log('3. The key format might be different than expected');
    console.log('4. API access might not be included in your plan');
    console.log('\n📧 Best next step: Contact support@soccersapi.com');
    console.log(`   Tell them: "My API key ${API_KEY} isn't working for any authentication method"`);
  }
}

main();