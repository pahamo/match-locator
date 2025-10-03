#!/usr/bin/env node

/**
 * Test Premier League fixtures to see what SoccersAPI data we get
 */

import 'dotenv/config';

async function testPremierLeagueFixtures() {
  console.log('🏴󠁧󠁢󠁥󠁮󠁧󠁿 Testing English Premier League fixtures from SoccersAPI...\n');

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  if (!username || !token) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  try {
    // Test English Premier League fixtures (try common Premier League IDs)
    const url = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url.searchParams.append('user', username);
    url.searchParams.append('token', token);
    url.searchParams.append('t', 'list');
    // url.searchParams.append('league_id', '39'); // Try all leagues first
    url.searchParams.append('date_from', '2025-09-27');
    url.searchParams.append('date_to', '2025-09-27');

    console.log('📡 Fetching fixtures from ALL available leagues...');
    console.log('🔗 URL:', url.toString().replace(token, '[TOKEN]'));
    console.log('');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();

    console.log('📊 API Response Summary:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Fixtures found: ${data.data ? data.data.length : 0}`);
    console.log(`   Requests left: ${data.meta?.requests_left || 'unknown'}`);
    console.log('');

    if (data.data && data.data.length > 0) {
      console.log('🎯 Example Fixture Data:');
      console.log('=' .repeat(60));

      const fixture = data.data[0];

      console.log('📅 BASIC INFO:');
      console.log(`   Match: ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
      console.log(`   Date: ${fixture.date || fixture.utc_date}`);
      console.log(`   Time: ${fixture.time || fixture.kickoff_time}`);
      console.log(`   Status: ${fixture.status}`);
      console.log(`   League: ${fixture.league?.name || 'Unknown'}`);
      console.log('');

      console.log('🏟️ VENUE INFO:');
      if (fixture.venue) {
        console.log(`   Stadium: ${fixture.venue.name || fixture.venue}`);
        console.log(`   City: ${fixture.venue.city || 'Unknown'}`);
        console.log(`   Capacity: ${fixture.venue.capacity || 'Unknown'}`);
      } else {
        console.log('   No venue data available');
      }
      console.log('');

      console.log('📺 BROADCAST INFO:');
      if (fixture.broadcasts && fixture.broadcasts.length > 0) {
        fixture.broadcasts.forEach((broadcast, index) => {
          console.log(`   ${index + 1}. ${broadcast.name} (${broadcast.country})`);
          console.log(`      Type: ${broadcast.type}`);
          if (broadcast.url) console.log(`      URL: ${broadcast.url}`);
        });
      } else {
        console.log('   No broadcast data available');
      }
      console.log('');

      console.log('🌤️ WEATHER INFO:');
      if (fixture.weather) {
        console.log(`   Temperature: ${fixture.weather.temperature}°C`);
        console.log(`   Condition: ${fixture.weather.condition}`);
        console.log(`   Humidity: ${fixture.weather.humidity}%`);
      } else {
        console.log('   No weather data available');
      }
      console.log('');

      console.log('💰 ODDS INFO:');
      if (fixture.odds) {
        console.log(`   Home: ${fixture.odds.home}`);
        console.log(`   Draw: ${fixture.odds.draw}`);
        console.log(`   Away: ${fixture.odds.away}`);
      } else {
        console.log('   No odds data available');
      }
      console.log('');

      console.log('📋 RAW FIXTURE DATA:');
      console.log('=' .repeat(60));
      console.log(JSON.stringify(fixture, null, 2));

    } else {
      console.log('❌ No fixtures found for Danish Superliga');
      console.log('📋 Full API Response:');
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPremierLeagueFixtures();