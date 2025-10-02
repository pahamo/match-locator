/**
 * Debug SoccersAPI Authentication
 * Try every possible auth combination
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

const API_KEY = process.env.SOCCERSAPI_KEY;
const EMAIL = process.env.SOCCERSAPI_USERNAME;

console.log('🔑 Email:', EMAIL);
console.log('🔑 API Key:', API_KEY);

async function testAuthCombinations() {
  const baseUrls = [
    'https://api.soccersapi.com/v2.2',
    'https://api.soccersapi.com'
  ];

  const endpoints = ['/leagues', '/competitions', '/countries'];

  // Try every possible auth parameter combination
  const authCombinations = [
    // Standard patterns
    { username: EMAIL, token: API_KEY },
    { email: EMAIL, token: API_KEY },
    { user: EMAIL, key: API_KEY },
    { username: EMAIL, password: API_KEY },
    { email: EMAIL, password: API_KEY },

    // API key only patterns
    { APIkey: API_KEY },
    { apikey: API_KEY },
    { api_key: API_KEY },
    { token: API_KEY },
    { key: API_KEY },

    // Mixed patterns
    { username: EMAIL, APIkey: API_KEY },
    { email: EMAIL, APIkey: API_KEY },
    { user: EMAIL, APIkey: API_KEY },

    // Auth header patterns will be tried separately
  ];

  const headerPatterns = [
    { 'Authorization': `Bearer ${API_KEY}` },
    { 'Authorization': `Basic ${Buffer.from(`${EMAIL}:${API_KEY}`).toString('base64')}` },
    { 'X-API-Key': API_KEY },
    { 'X-Auth-Token': API_KEY },
    { 'X-Username': EMAIL, 'X-Token': API_KEY },
  ];

  let testCount = 0;

  for (const baseUrl of baseUrls) {
    for (const endpoint of endpoints) {
      console.log(`\n🧪 Testing endpoint: ${baseUrl}${endpoint}`);

      // Test query parameter auth
      for (let i = 0; i < authCombinations.length; i++) {
        const auth = authCombinations[i];
        testCount++;

        try {
          const url = new URL(`${baseUrl}${endpoint}`);
          Object.entries(auth).forEach(([key, value]) => {
            url.searchParams.append(key, value);
          });

          console.log(`  ${testCount}. Query params: ${Object.keys(auth).join(', ')}`);

          const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'User-Agent': 'FixturesApp-Debug/1.0' },
          });

          if (response.ok) {
            console.log(`  ✅ SUCCESS! Auth: ${JSON.stringify(auth)}`);
            const data = await response.text();
            console.log(`  📄 Response preview:`, data.substring(0, 200) + '...');
            return { success: true, auth, url: baseUrl + endpoint };
          } else {
            const errorText = await response.text();
            console.log(`  ❌ ${response.status}: ${errorText.substring(0, 100)}...`);
          }

        } catch (error) {
          console.log(`  ❌ Error: ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
      }

      // Test header-based auth
      for (let i = 0; i < headerPatterns.length; i++) {
        const headers = { ...headerPatterns[i], 'User-Agent': 'FixturesApp-Debug/1.0' };
        testCount++;

        try {
          console.log(`  ${testCount}. Headers: ${Object.keys(headerPatterns[i]).join(', ')}`);

          const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'GET',
            headers,
          });

          if (response.ok) {
            console.log(`  ✅ SUCCESS! Headers: ${JSON.stringify(headerPatterns[i])}`);
            const data = await response.text();
            console.log(`  📄 Response preview:`, data.substring(0, 200) + '...');
            return { success: true, headers: headerPatterns[i], url: baseUrl + endpoint };
          } else {
            const errorText = await response.text();
            console.log(`  ❌ ${response.status}: ${errorText.substring(0, 100)}...`);
          }

        } catch (error) {
          console.log(`  ❌ Error: ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
      }

      // If we've tried many combinations, break to avoid rate limiting
      if (testCount > 20) {
        console.log('\n⏸️  Stopping after 20+ attempts to avoid rate limiting');
        break;
      }
    }

    if (testCount > 20) break;
  }

  return { success: false, testCount };
}

async function main() {
  console.log('🚀 Starting comprehensive auth debug...\n');

  if (!API_KEY || !EMAIL) {
    console.error('❌ Missing API_KEY or EMAIL in environment');
    process.exit(1);
  }

  const result = await testAuthCombinations();

  if (result.success) {
    console.log('\n🎉 FOUND WORKING AUTHENTICATION!');
    console.log('Use this configuration in your integration.');
  } else {
    console.log(`\n💔 All ${result.testCount} authentication attempts failed.`);
    console.log('\n🔍 This suggests:');
    console.log('1. Your API key might be incorrect or inactive');
    console.log('2. Your account might not have API access enabled');
    console.log('3. There might be a different authentication endpoint');
    console.log('4. The API key might need to be activated in your dashboard');
    console.log('\n📧 Contact support@soccersapi.com with:');
    console.log(`   - Account email: ${EMAIL}`);
    console.log(`   - API key: ${API_KEY}`);
    console.log('   - Ask for the exact authentication format');
  }
}

main();