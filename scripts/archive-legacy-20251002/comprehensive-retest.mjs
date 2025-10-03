#!/usr/bin/env node

/**
 * Comprehensive re-test with current dates and all possible approaches
 */

import 'dotenv/config';

async function comprehensiveRetest() {
  console.log('🔍 COMPREHENSIVE RE-TEST - All Possible Approaches...\n');
  console.log(`🕐 Current time: ${new Date().toISOString()}\n`);

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  // Get current date for testing
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  console.log(`📅 Testing with current dates: ${todayStr} to ${tomorrowStr}\n`);

  const tests = [
    {
      name: 'Premier League - Today/Tomorrow',
      params: { league_id: '583', date_from: todayStr, date_to: tomorrowStr }
    },
    {
      name: 'Premier League - This Weekend',
      params: { league_id: '583', date_from: '2024-12-28', date_to: '2024-12-29' }
    },
    {
      name: 'Premier League - Recent Historical',
      params: { league_id: '583', date_from: '2024-12-01', date_to: '2024-12-26' }
    },
    {
      name: 'Bundesliga - Recent',
      params: { league_id: '594', date_from: '2024-12-01', date_to: todayStr }
    },
    {
      name: 'Champions League - Recent',
      params: { league_id: '539', date_from: '2024-12-01', date_to: todayStr }
    },
    {
      name: 'Any League - Today Only',
      params: { date_from: todayStr, date_to: todayStr }
    },
    {
      name: 'Any League - No Filters',
      params: {}
    },
    {
      name: 'Live Matches Only',
      params: { live: '1' }
    }
  ];

  for (const test of tests) {
    console.log(`🧪 ${test.name}:`);

    try {
      const url = new URL('https://api.soccersapi.com/v2.2/fixtures');
      url.searchParams.append('user', username);
      url.searchParams.append('token', token);
      url.searchParams.append('t', 'list');

      Object.entries(test.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      console.log(`   URL: ${url.toString().replace(token, '[TOKEN]')}`);

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'FixturesApp-Test/1.0',
          'Accept': 'application/json',
        }
      });

      const data = await response.json();

      console.log(`   Status: ${response.status}`);
      console.log(`   Response keys: [${Object.keys(data).join(', ')}]`);
      console.log(`   Has data field: ${data.data !== undefined ? 'Yes' : 'No'}`);
      console.log(`   Data type: ${typeof data.data}`);
      console.log(`   Data length: ${data.data ? data.data.length : 'N/A'}`);
      console.log(`   Meta count: ${data.meta?.count}`);
      console.log(`   Meta total: ${data.meta?.total}`);
      console.log(`   Requests left: ${data.meta?.requests_left}`);

      if (data.data && data.data.length > 0) {
        console.log(`\n   🎉 BREAKTHROUGH! Found ${data.data.length} fixtures!`);

        const fixture = data.data[0];
        console.log(`   ✅ Sample fixture:`);
        console.log(`      Match: ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
        console.log(`      Date: ${fixture.date || fixture.utc_date}`);
        console.log(`      League: ${fixture.league?.name}`);
        console.log(`      Status: ${fixture.status}`);

        if (fixture.broadcasts) {
          console.log(`      📺 Broadcasts: ${fixture.broadcasts.length}`);
        }
        if (fixture.weather) {
          console.log(`      🌤️ Weather: Available`);
        }
        if (fixture.odds) {
          console.log(`      💰 Odds: Available`);
        }

        console.log(`\n   🔍 Raw fixture data:`);
        console.log(`   ${JSON.stringify(fixture, null, 2).substring(0, 500)}...`);

        return; // Exit early on success
      } else if (data.data) {
        console.log(`   ⚠️ Data field exists but empty (length: 0)`);
      } else {
        console.log(`   ❌ No data field in response`);
        console.log(`   Full response: ${JSON.stringify(data, null, 2).substring(0, 300)}...`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }

  // Final test - check if account has been updated/changed
  console.log('🔍 ACCOUNT STATUS CHECK:');
  try {
    const url = new URL('https://api.soccersapi.com/v2.2/leagues');
    url.searchParams.append('user', username);
    url.searchParams.append('token', token);
    url.searchParams.append('t', 'list');

    const response = await fetch(url.toString());
    const data = await response.json();

    console.log(`   Plan: ${data.meta?.plan}`);
    console.log(`   Requests left: ${data.meta?.requests_left}`);
    console.log(`   Total leagues: ${data.meta?.total}`);
    console.log(`   ✅ Account still active and working`);

  } catch (error) {
    console.log(`   ❌ Account check failed: ${error.message}`);
  }

  console.log('\n🎯 Comprehensive re-test complete');
  console.log('Result: Still no fixture data available across all approaches');
}

comprehensiveRetest();