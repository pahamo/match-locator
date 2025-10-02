#!/usr/bin/env node

/**
 * Test alternative endpoints and API structures
 */

import 'dotenv/config';

async function testAlternativeEndpoints() {
  console.log('🔄 Testing Alternative API Endpoints and Structures...\n');

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  const headers = {
    'User-Agent': 'FixturesApp-Test/1.0',
    'Accept': 'application/json',
  };

  // Test 1: Different endpoint paths
  const endpoints = [
    'fixtures',
    'fixture',
    'matches',
    'match',
    'games',
    'game',
    'events',
    'results'
  ];

  console.log('🔀 Testing different endpoint names...');
  for (const endpoint of endpoints) {
    try {
      const url = new URL(`https://api.soccersapi.com/v2.2/${endpoint}`);
      url.searchParams.append('user', username);
      url.searchParams.append('token', token);
      url.searchParams.append('t', 'list');

      const response = await fetch(url.toString(), { headers });
      const data = await response.json();

      console.log(`   /${endpoint}: Status ${response.status}, Data: ${data.data ? data.data.length : 0} items`);

      if (data.data && data.data.length > 0) {
        console.log(`   ✅ SUCCESS! ${endpoint} endpoint has data`);
        const item = data.data[0];
        console.log(`   Sample: ${JSON.stringify(item, null, 2).substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   /${endpoint}: Error - ${error.message}`);
    }
  }
  console.log('');

  // Test 2: Check what endpoints ARE available
  console.log('📋 Checking what endpoints are documented/available...');
  const knownWorkingEndpoints = ['leagues', 'teams', 'standings', 'players'];

  for (const endpoint of knownWorkingEndpoints) {
    try {
      const url = new URL(`https://api.soccersapi.com/v2.2/${endpoint}`);
      url.searchParams.append('user', username);
      url.searchParams.append('token', token);
      url.searchParams.append('t', 'list');

      const response = await fetch(url.toString(), { headers });
      const data = await response.json();

      console.log(`   /${endpoint}: Status ${response.status}, Data: ${data.data ? data.data.length : 0} items`);

      if (data.data && data.data.length > 0) {
        console.log(`   ✅ ${endpoint} working`);
      }
    } catch (error) {
      console.log(`   /${endpoint}: Error - ${error.message}`);
    }
  }
  console.log('');

  // Test 3: Try teams endpoint to see if it has fixture-like data
  console.log('🏟️ Testing teams endpoint for Premier League...');
  try {
    const url = new URL('https://api.soccersapi.com/v2.2/teams');
    url.searchParams.append('user', username);
    url.searchParams.append('token', token);
    url.searchParams.append('t', 'list');
    url.searchParams.append('league_id', '583'); // Premier League

    const response = await fetch(url.toString(), { headers });
    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Teams: ${data.data ? data.data.length : 0}`);

    if (data.data && data.data.length > 0) {
      console.log('   ✅ Teams data available for Premier League');
      const team = data.data[0];
      console.log(`   Sample team: ${team.name} (ID: ${team.id})`);
      console.log(`   Team data structure: ${Object.keys(team).join(', ')}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 4: Try standings endpoint
  console.log('📊 Testing standings endpoint...');
  try {
    const url = new URL('https://api.soccersapi.com/v2.2/standings');
    url.searchParams.append('user', username);
    url.searchParams.append('token', token);
    url.searchParams.append('t', 'list');
    url.searchParams.append('league_id', '583'); // Premier League

    const response = await fetch(url.toString(), { headers });
    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Standings: ${data.data ? data.data.length : 0}`);

    if (data.data && data.data.length > 0) {
      console.log('   ✅ Standings data available');
      const standing = data.data[0];
      console.log(`   Sample: ${standing.team?.name || 'Unknown'} - ${standing.points || 0} pts`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 5: Check if there's a status endpoint
  console.log('📡 Testing API status/info endpoint...');
  try {
    const statusEndpoints = ['status', 'info', 'account', 'user', 'plan'];

    for (const endpoint of statusEndpoints) {
      try {
        const url = new URL(`https://api.soccersapi.com/v2.2/${endpoint}`);
        url.searchParams.append('user', username);
        url.searchParams.append('token', token);
        url.searchParams.append('t', 'list');

        const response = await fetch(url.toString(), { headers });
        const data = await response.json();

        if (response.status === 200 && data) {
          console.log(`   ✅ /${endpoint}: ${JSON.stringify(data, null, 2).substring(0, 300)}...`);
        } else {
          console.log(`   /${endpoint}: Status ${response.status}`);
        }
      } catch (error) {
        console.log(`   /${endpoint}: Error`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test 6: Check if fixtures require a specific 't' parameter
  console.log('🔧 Testing different t parameter values for fixtures...');
  const tValues = ['list', 'get', 'fetch', 'fixtures', 'data', 'json'];

  for (const tValue of tValues) {
    try {
      const url = new URL('https://api.soccersapi.com/v2.2/fixtures');
      url.searchParams.append('user', username);
      url.searchParams.append('token', token);
      url.searchParams.append('t', tValue);
      url.searchParams.append('league_id', '583');

      const response = await fetch(url.toString(), { headers });
      const data = await response.json();

      console.log(`   t=${tValue}: Status ${response.status}, Fixtures: ${data.data ? data.data.length : 0}`);

      if (data.data && data.data.length > 0) {
        console.log(`   ✅ SUCCESS! t=${tValue} works for fixtures`);
        return;
      }
    } catch (error) {
      console.log(`   t=${tValue}: Error`);
    }
  }

  console.log('\n🎯 Alternative endpoints test complete!');
}

testAlternativeEndpoints();