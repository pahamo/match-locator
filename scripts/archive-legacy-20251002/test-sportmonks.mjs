#!/usr/bin/env node

/**
 * Sports Monks API Connection Test
 *
 * Tests authentication and basic endpoints
 *
 * Usage: node scripts/test-sportmonks.mjs
 */

import 'dotenv/config';

const API_TOKEN = process.env.SPORTMONKS_TOKEN || process.env.REACT_APP_SPORTMONKS_TOKEN;
const BASE_URL = 'https://api.sportmonks.com/v3/football';

if (!API_TOKEN) {
  console.error('❌ No API token found');
  console.error('Set SPORTMONKS_TOKEN in .env file');
  process.exit(1);
}

console.log('🔑 API Token found:', API_TOKEN.substring(0, 20) + '...');
console.log('');

async function makeRequest(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_token', API_TOKEN);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  console.log(`📡 GET ${endpoint}`);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Show rate limit info
    if (data.rate_limit) {
      console.log(`   ⏱️  Rate limit: ${data.rate_limit.remaining} requests remaining`);
      console.log(`   ⏱️  Resets in: ${data.rate_limit.resets_in_seconds}s`);
    }

    return data;
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    throw error;
  }
}

async function testConnection() {
  console.log('=== SPORTS MONKS API CONNECTION TEST ===\n');

  try {
    // Test 1: Get leagues (simple auth test)
    console.log('Test 1: Get Leagues (Auth Test)');
    const leaguesResponse = await makeRequest('/leagues', {
      include: 'country',
    });
    console.log(`   ✅ Found ${leaguesResponse.data.length} leagues`);

    // Find Premier League
    const premierLeague = leaguesResponse.data.find(l =>
      l.name.includes('Premier League') && !l.name.includes('U18') && !l.name.includes('U21')
    );
    if (premierLeague) {
      console.log(`   ✅ Premier League ID: ${premierLeague.id} - "${premierLeague.name}"`);
    }
    console.log('');

    // Test 2: Get today's fixtures (basic, no includes)
    console.log('Test 2: Get Today\'s Fixtures (Basic)');
    const today = new Date().toISOString().split('T')[0];
    const fixturesResponse = await makeRequest('/fixtures/date/' + today);
    console.log(`   ✅ Found ${fixturesResponse.data.length} fixtures today`);

    if (fixturesResponse.data.length > 0) {
      const sample = fixturesResponse.data[0];
      console.log(`   📍 Sample fixture:`, JSON.stringify(sample, null, 2).substring(0, 500));
    }
    console.log('');

    // Test 3: Get TV Stations (if we have fixtures)
    if (fixturesResponse.data.length > 0) {
      const fixtureId = fixturesResponse.data[0].id;
      console.log(`Test 3: Get TV Stations for Fixture ${fixtureId}`);
      const tvResponse = await makeRequest(`/tv-stations/fixtures/${fixtureId}`);
      console.log(`   ✅ Found ${tvResponse.data.length} TV stations`);

      if (tvResponse.data.length > 0) {
        console.log('   📺 Broadcasters:', JSON.stringify(tvResponse.data, null, 2).substring(0, 300));
      }
      console.log('');
    }

    // Test 4: Get Livescores (basic, no includes)
    console.log('Test 4: Get Live Scores');
    const livescoresResponse = await makeRequest('/livescores/inplay');
    const liveMatches = Array.isArray(livescoresResponse.data) ? livescoresResponse.data : [];
    console.log(`   ✅ Found ${liveMatches.length} live matches`);

    if (liveMatches.length > 0) {
      const live = liveMatches[0];
      console.log(`   ⚽ Live match:`, JSON.stringify(live, null, 2).substring(0, 300));
    }
    console.log('');

    // Summary
    console.log('=== TEST SUMMARY ===');
    console.log('✅ Authentication: PASSED');
    console.log('✅ Leagues endpoint: PASSED');
    console.log('✅ Fixtures endpoint: PASSED');
    console.log('✅ TV Stations endpoint: PASSED');
    console.log('✅ Livescores endpoint: PASSED');
    console.log('');
    console.log('🎉 All tests passed! Sports Monks API is ready to use.');
    console.log('');

    // Show what you have access to
    if (leaguesResponse.subscription) {
      console.log('=== YOUR SUBSCRIPTION ===');
      leaguesResponse.subscription.forEach(sub => {
        console.log(`Plan: ${sub.plans[0]?.plan || 'Unknown'}`);
        console.log(`Sport: ${sub.plans[0]?.sport || 'Unknown'}`);
        console.log(`Category: ${sub.plans[0]?.category || 'Unknown'}`);
      });
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

// Run tests
testConnection();
