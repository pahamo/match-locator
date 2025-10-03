/**
 * Final authentication test - maybe the key needs different treatment
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

const API_KEY = process.env.SOCCERSAPI_KEY;
const EMAIL = 'p@kinotto.co';

console.log('🔍 FINAL AUTHENTICATION TEST');
console.log('Based on pattern: API responds to ?token= but wants username+token');
console.log(`Email: ${EMAIL}`);
console.log(`Key: ${API_KEY}\n`);

async function testFinalAttempts() {
  const testCases = [
    // Maybe the key needs to be used as both username AND token
    {
      name: 'Key as both username and token',
      params: { username: API_KEY, token: API_KEY }
    },

    // Maybe the email needs specific encoding
    {
      name: 'URL encoded email',
      params: { username: encodeURIComponent(EMAIL), token: API_KEY }
    },

    // Maybe it's case sensitive
    {
      name: 'Uppercase parameters',
      params: { USERNAME: EMAIL, TOKEN: API_KEY }
    },

    // Maybe it wants different parameter names
    {
      name: 'User + password',
      params: { user: EMAIL, password: API_KEY }
    },
    {
      name: 'Email + key',
      params: { email: EMAIL, key: API_KEY }
    },
    {
      name: 'Login + token',
      params: { login: EMAIL, token: API_KEY }
    },

    // Maybe the token needs prefix/suffix
    {
      name: 'Token with Bearer prefix',
      params: { username: EMAIL, token: `Bearer ${API_KEY}` }
    },
    {
      name: 'Token with API prefix',
      params: { username: EMAIL, token: `API ${API_KEY}` }
    },

    // Maybe just the email without the key
    {
      name: 'Email only as token',
      params: { token: EMAIL }
    },

    // Maybe the key is actually a user ID
    {
      name: 'Key as username, email as token',
      params: { username: API_KEY, token: EMAIL }
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];

    try {
      console.log(`${i + 1}. Testing: ${testCase.name}`);

      const url = new URL('https://api.soccersapi.com/v2.2/leagues');
      Object.entries(testCase.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      console.log(`   URL: ${url.toString()}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'User-Agent': 'FixturesApp/1.0' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        console.log(`   🎉 SUCCESS! This worked!`);
        const data = await response.text();
        console.log(`   📄 Response: ${data.substring(0, 200)}...`);
        return { success: true, method: testCase.name, params: testCase.params };
      } else {
        const errorText = await response.text();
        console.log(`   ❌ ${errorText.substring(0, 100)}...`);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`   ⏰ Timeout`);
      } else {
        console.log(`   ❌ ${error.message}`);
      }
    }

    console.log(''); // Empty line for readability
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
  }

  return { success: false };
}

// Also test if the API is just completely down or has issues
async function testApiHealth() {
  console.log('🏥 Testing API Health...\n');

  const healthTests = [
    'https://api.soccersapi.com/',
    'https://api.soccersapi.com/health',
    'https://api.soccersapi.com/status',
    'https://soccersapi.com/api/',
    'https://soccersapi.com/'
  ];

  for (const url of healthTests) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        timeout: 5000
      });
      console.log(`${url}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`${url}: ${error.message}`);
    }
  }

  console.log('\n');
}

async function main() {
  await testApiHealth();

  const result = await testFinalAttempts();

  if (result.success) {
    console.log('🎉 AUTHENTICATION SUCCESSFUL!');
    console.log(`✅ Working method: ${result.method}`);
    console.log(`✅ Parameters: ${JSON.stringify(result.params)}`);
  } else {
    console.log('💔 All final attempts failed.');
    console.log('\n🎯 CONCLUSION:');
    console.log('The API is responding but rejecting all authentication attempts.');
    console.log('This strongly suggests:');
    console.log('');
    console.log('1. 🔑 Your API key needs to be activated in your dashboard');
    console.log('2. 📧 Your account needs email verification');
    console.log('3. 💳 Your subscription needs to be confirmed');
    console.log('4. 🔐 There might be a different API key in your account');
    console.log('');
    console.log('📞 CONTACT SUPPORT: support@soccersapi.com');
    console.log('Tell them: "My API key returns \'User or token incorrect!\' - please verify my account setup"');
  }
}

main();