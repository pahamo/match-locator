/**
 * Test script for SoccersAPI integration
 * Verifies API connection and data fetching capabilities
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

const SOCCERSAPI_KEY = process.env.SOCCERSAPI_KEY;

if (!SOCCERSAPI_KEY) {
  console.error('❌ SOCCERSAPI_KEY not found in environment variables');
  process.exit(1);
}

console.log('🔑 API Key found:', SOCCERSAPI_KEY.substring(0, 5) + '...');

class SoccersApiTester {
  constructor() {
    this.baseUrls = [
      'https://api.soccersapi.com/v2.2',
      'https://api.soccersapi.com',
      'https://soccersapi.com/api/v2.2',
      'https://soccersapi.com/api'
    ];
    this.apiKey = SOCCERSAPI_KEY;
    this.requestCount = 0;
  }

  async makeRequest(endpoint, params = {}, authMethod = 'query') {
    const errors = [];

    for (const baseUrl of this.baseUrls) {
      const url = new URL(`${baseUrl}${endpoint}`);

      // Add parameters
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      // Try different authentication methods
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'FixturesApp-Test/1.0',
      };

      const authMethods = [
        () => url.searchParams.append('APIkey', this.apiKey),
        () => url.searchParams.append('apikey', this.apiKey),
        () => url.searchParams.append('token', this.apiKey),
        () => headers['Authorization'] = `Bearer ${this.apiKey}`,
        () => headers['X-API-Key'] = this.apiKey,
        () => headers['X-Auth-Token'] = this.apiKey,
        () => {
          // Try using key as both username and token
          url.searchParams.append('username', this.apiKey);
          url.searchParams.append('token', this.apiKey);
        }
      ];

      this.requestCount++;
      console.log(`\n📡 Request #${this.requestCount}: ${endpoint}`);
      console.log(`🔗 Base URL: ${baseUrl}`);

      // Try each auth method
      for (let i = 0; i < authMethods.length; i++) {
        try {
          // Reset URL params for each auth attempt
          const testUrl = new URL(`${baseUrl}${endpoint}`);
          Object.entries(params).forEach(([key, value]) => {
            testUrl.searchParams.append(key, value);
          });

          const testHeaders = { ...headers };

          // Apply auth method
          authMethods[i]();

          console.log(`🔑 Auth method ${i + 1}: ${testUrl.toString()}`);

          const response = await fetch(testUrl.toString(), {
            method: 'GET',
            headers: testHeaders,
          });

          console.log(`📊 Status: ${response.status} ${response.statusText}`);

          if (response.ok) {
            // Success! Return the data
            const data = await response.json();
            console.log(`✅ SUCCESS with auth method ${i + 1} on ${baseUrl}`);

            // Log rate limit headers if present
            const rateLimitHeaders = {};
            ['X-RateLimit-Remaining', 'X-RateLimit-Reset', 'X-RateLimit-Limit'].forEach(header => {
              const value = response.headers.get(header);
              if (value) rateLimitHeaders[header] = value;
            });

            if (Object.keys(rateLimitHeaders).length > 0) {
              console.log('📈 Rate Limits:', rateLimitHeaders);
            }

            return { success: true, data, baseUrl, authMethod: i + 1 };
          } else {
            const errorText = await response.text();
            errors.push(`Auth method ${i + 1} on ${baseUrl}: ${response.status} ${errorText.substring(0, 100)}...`);
          }

        } catch (error) {
          errors.push(`Auth method ${i + 1} on ${baseUrl}: ${error.message}`);
        }

        // Small delay between auth attempts
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Delay between base URL attempts
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // All attempts failed
    console.error('❌ All authentication methods failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    return { success: false, errors };
  }

  async testBasicConnection() {
    console.log('\n🧪 Testing basic API connection...');

    // Try different common endpoints
    const testEndpoints = [
      '/leagues',
      '/competitions',
      '/countries',
    ];

    for (const endpoint of testEndpoints) {
      const result = await this.makeRequest(endpoint);

      if (result.success) {
        console.log(`✅ ${endpoint} - Success!`);
        if (result.data && Array.isArray(result.data)) {
          console.log(`📝 Returned ${result.data.length} items`);
          if (result.data.length > 0) {
            console.log(`📄 Sample item:`, JSON.stringify(result.data[0], null, 2));
          }
        } else {
          console.log(`📄 Response:`, JSON.stringify(result.data, null, 2));
        }
        return true; // Success on first working endpoint
      } else {
        console.log(`❌ ${endpoint} - Failed`);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return false;
  }

  async testEnglishLeagues() {
    console.log('\n🏴󠁧󠁢󠁥󠁮󠁧󠁿 Testing English leagues/competitions...');

    const testParams = [
      { country: 'England' },
      { country: 'United Kingdom' },
      { country: 'UK' },
      { country: 'GB' },
    ];

    for (const params of testParams) {
      const result = await this.makeRequest('/leagues', params);

      if (result.success && result.data) {
        console.log(`✅ Found leagues with ${JSON.stringify(params)}`);

        if (Array.isArray(result.data)) {
          console.log(`📊 Found ${result.data.length} leagues`);

          // Look for Premier League and other English competitions
          const englishComps = result.data.filter(league =>
            league.name?.toLowerCase().includes('premier') ||
            league.name?.toLowerCase().includes('championship') ||
            league.name?.toLowerCase().includes('fa cup') ||
            league.country?.toLowerCase().includes('england')
          );

          if (englishComps.length > 0) {
            console.log('🎯 English competitions found:');
            englishComps.forEach(comp => {
              console.log(`  - ${comp.name} (ID: ${comp.id})`);
            });
            return englishComps;
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return [];
  }

  async testFixtures(leagueId = null) {
    console.log('\n⚽ Testing fixtures endpoint...');

    const params = {};
    if (leagueId) {
      params.league = leagueId.toString();
      console.log(`🎯 Testing with league ID: ${leagueId}`);
    }

    // Add date range for current week
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    params.from = weekAgo.toISOString().split('T')[0];
    params.to = weekAhead.toISOString().split('T')[0];

    const result = await this.makeRequest('/fixtures', params);

    if (result.success && result.data) {
      console.log(`✅ Fixtures endpoint working!`);

      if (Array.isArray(result.data)) {
        console.log(`📊 Found ${result.data.length} fixtures`);

        if (result.data.length > 0) {
          const sample = result.data[0];
          console.log(`📄 Sample fixture:`, JSON.stringify(sample, null, 2));

          // Check if broadcasts are included
          if (sample.broadcasts || sample.tv || sample.streaming) {
            console.log('🎥 Broadcast data appears to be included!');
          } else {
            console.log('❓ No broadcast data in fixtures - may need separate endpoint');
          }
        }
      }

      return result.data;
    }

    return [];
  }

  async testBroadcastsEndpoint(fixtureId = null) {
    console.log('\n🎥 Testing broadcasts endpoint...');

    if (!fixtureId) {
      console.log('❓ No fixture ID provided, skipping broadcast test');
      return;
    }

    const endpoints = [
      `/fixtures/${fixtureId}/broadcasts`,
      `/fixtures/${fixtureId}/tv`,
      `/broadcasts/${fixtureId}`,
      `/tv/${fixtureId}`,
    ];

    for (const endpoint of endpoints) {
      const result = await this.makeRequest(endpoint);

      if (result.success) {
        console.log(`✅ ${endpoint} - Success!`);
        console.log(`📄 Broadcast data:`, JSON.stringify(result.data, null, 2));
        return result.data;
      } else {
        console.log(`❌ ${endpoint} - Failed`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return null;
  }

  async runFullTest() {
    console.log('🚀 Starting SoccersAPI Integration Test\n');
    console.log('=' * 50);

    try {
      // Test 1: Basic connection
      const connectionWorking = await this.testBasicConnection();
      if (!connectionWorking) {
        console.log('\n❌ Basic connection failed. Check API key and endpoints.');
        return false;
      }

      // Test 2: English leagues
      const englishLeagues = await this.testEnglishLeagues();

      // Test 3: Fixtures
      let premierLeagueId = null;
      if (englishLeagues.length > 0) {
        const pl = englishLeagues.find(l => l.name?.toLowerCase().includes('premier'));
        if (pl) {
          premierLeagueId = pl.id;
          console.log(`🎯 Found Premier League ID: ${premierLeagueId}`);
        }
      }

      const fixtures = await this.testFixtures(premierLeagueId);

      // Test 4: Broadcasts (if we have a fixture)
      if (fixtures.length > 0) {
        const sampleFixtureId = fixtures[0].id || fixtures[0].fixture_id;
        if (sampleFixtureId) {
          await this.testBroadcastsEndpoint(sampleFixtureId);
        }
      }

      console.log('\n✅ Test completed successfully!');
      console.log(`📊 Total requests made: ${this.requestCount}`);

      return true;

    } catch (error) {
      console.error('\n❌ Test failed with error:', error);
      return false;
    }
  }
}

// Run the test
const tester = new SoccersApiTester();
tester.runFullTest()
  .then(success => {
    if (success) {
      console.log('\n🎉 SoccersAPI integration test PASSED!');
      process.exit(0);
    } else {
      console.log('\n💥 SoccersAPI integration test FAILED!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Test crashed:', error);
    process.exit(1);
  });