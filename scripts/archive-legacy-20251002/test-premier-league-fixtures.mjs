#!/usr/bin/env node

/**
 * Test Premier League fixtures with correct ID: 583
 */

import 'dotenv/config';

async function testPremierLeagueFixtures() {
  console.log('🏴󠁧󠁢󠁥󠁮󠁧󠁿 Testing English Premier League fixtures (ID: 583)...\n');

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  if (!username || !token) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  try {
    // Test Premier League fixtures for different date ranges
    const tests = [
      {
        name: 'Today',
        dateFrom: '2025-09-27',
        dateTo: '2025-09-27'
      },
      {
        name: 'This Week',
        dateFrom: '2025-09-23',
        dateTo: '2025-09-29'
      },
      {
        name: 'This Month',
        dateFrom: '2025-09-01',
        dateTo: '2025-09-30'
      },
      {
        name: 'Past Month',
        dateFrom: '2025-08-01',
        dateTo: '2025-08-31'
      }
    ];

    for (const test of tests) {
      console.log(`📅 Testing ${test.name} (${test.dateFrom} to ${test.dateTo}):`);

      const url = new URL('https://api.soccersapi.com/v2.2/fixtures');
      url.searchParams.append('user', username);
      url.searchParams.append('token', token);
      url.searchParams.append('t', 'list');
      url.searchParams.append('league_id', '583'); // Premier League
      url.searchParams.append('date_from', test.dateFrom);
      url.searchParams.append('date_to', test.dateTo);

      const response = await fetch(url.toString());
      const data = await response.json();

      console.log(`   Status: ${response.status}`);
      console.log(`   Fixtures: ${data.data ? data.data.length : 0}`);
      console.log(`   Requests left: ${data.meta?.requests_left || 'unknown'}`);

      if (data.data && data.data.length > 0) {
        console.log(`   ✅ Found ${data.data.length} Premier League fixtures!`);

        // Show first fixture details
        const fixture = data.data[0];
        console.log('\n🎯 Example Fixture:');
        console.log(`   Match: ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
        console.log(`   Date: ${fixture.date || fixture.utc_date}`);
        console.log(`   Time: ${fixture.time || fixture.kickoff_time}`);
        console.log(`   Status: ${fixture.status}`);
        console.log(`   Venue: ${fixture.venue?.name || 'Unknown'}`);

        // Check for enhanced data
        console.log('\n📺 Enhanced Data Available:');
        console.log(`   Broadcasts: ${fixture.broadcasts ? fixture.broadcasts.length : 0}`);
        console.log(`   Weather: ${fixture.weather ? 'Yes' : 'No'}`);
        console.log(`   Odds: ${fixture.odds ? 'Yes' : 'No'}`);
        console.log(`   Statistics: ${fixture.statistics ? 'Yes' : 'No'}`);
        console.log(`   Lineups: ${fixture.lineups ? 'Yes' : 'No'}`);

        if (fixture.broadcasts && fixture.broadcasts.length > 0) {
          console.log('\n📺 Broadcast Info:');
          fixture.broadcasts.forEach((broadcast, i) => {
            console.log(`   ${i+1}. ${broadcast.name} (${broadcast.country})`);
            if (broadcast.url) console.log(`      URL: ${broadcast.url}`);
          });
        }

        break; // Found data, no need to test more ranges
      } else {
        console.log(`   ❌ No fixtures found for ${test.name}`);
      }
      console.log('');
    }

    // Test specific teams
    console.log('🔍 Testing specific teams in Premier League:');
    const teams = ['manchester-united', 'arsenal', 'liverpool', 'chelsea'];

    for (const team of teams) {
      const url = new URL('https://api.soccersapi.com/v2.2/fixtures');
      url.searchParams.append('user', username);
      url.searchParams.append('token', token);
      url.searchParams.append('t', 'list');
      url.searchParams.append('league_id', '583');
      url.searchParams.append('team', team);
      url.searchParams.append('date_from', '2025-08-01');
      url.searchParams.append('date_to', '2025-09-30');

      const response = await fetch(url.toString());
      const data = await response.json();

      console.log(`   ${team}: ${data.data ? data.data.length : 0} fixtures`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPremierLeagueFixtures();