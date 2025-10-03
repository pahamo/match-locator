#!/usr/bin/env node

/**
 * Test Austrian Bundesliga (ID: 1005) specifically
 */

import 'dotenv/config';

async function testAustrianBundesliga() {
  console.log('🇦🇹 Testing Austrian Bundesliga (ID: 1005)...\n');

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  const headers = {
    'User-Agent': 'FixturesApp-Test/1.0',
    'Accept': 'application/json',
  };

  // Test different date ranges for Austrian Bundesliga
  const dateRanges = [
    {
      name: 'Current Season 2024-25',
      dateFrom: '2024-07-01',
      dateTo: '2025-05-31'
    },
    {
      name: 'Previous Season 2023-24',
      dateFrom: '2023-07-01',
      dateTo: '2024-05-31'
    },
    {
      name: 'Season 2022-23',
      dateFrom: '2022-07-01',
      dateTo: '2023-05-31'
    },
    {
      name: 'Broad Historical Range',
      dateFrom: '2020-01-01',
      dateTo: '2024-12-31'
    },
    {
      name: 'Recent Weeks',
      dateFrom: '2024-08-01',
      dateTo: '2024-12-31'
    }
  ];

  for (const range of dateRanges) {
    console.log(`📅 Testing ${range.name} (${range.dateFrom} to ${range.dateTo}):`);

    try {
      const url = new URL('https://api.soccersapi.com/v2.2/fixtures');
      url.searchParams.append('user', username);
      url.searchParams.append('token', token);
      url.searchParams.append('t', 'list');
      url.searchParams.append('league_id', '1005'); // Austrian Bundesliga
      url.searchParams.append('date_from', range.dateFrom);
      url.searchParams.append('date_to', range.dateTo);

      console.log(`   URL: ${url.toString().replace(token, '[TOKEN]')}`);

      const response = await fetch(url.toString(), { headers });
      const data = await response.json();

      console.log(`   Status: ${response.status}`);
      console.log(`   Fixtures: ${data.data ? data.data.length : 0}`);
      console.log(`   Requests left: ${data.meta?.requests_left || 'unknown'}`);

      if (data.data && data.data.length > 0) {
        console.log(`   ✅ SUCCESS! Found ${data.data.length} Austrian Bundesliga fixtures!`);

        // Show first few fixtures
        console.log('\n🎯 Sample Fixtures:');
        data.data.slice(0, 3).forEach((fixture, i) => {
          console.log(`   ${i+1}. ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
          console.log(`      Date: ${fixture.date || fixture.utc_date}`);
          console.log(`      Time: ${fixture.time || fixture.kickoff_time}`);
          console.log(`      Status: ${fixture.status}`);
          console.log(`      Venue: ${fixture.venue?.name || 'Unknown'}`);

          // Check enhanced data
          console.log(`      Enhanced Data:`);
          console.log(`        📺 Broadcasts: ${fixture.broadcasts ? fixture.broadcasts.length : 0}`);
          console.log(`        🌤️ Weather: ${fixture.weather ? 'Yes' : 'No'}`);
          console.log(`        💰 Odds: ${fixture.odds ? 'Yes' : 'No'}`);

          if (fixture.broadcasts && fixture.broadcasts.length > 0) {
            console.log(`        📺 Broadcast Info:`);
            fixture.broadcasts.forEach((broadcast, j) => {
              console.log(`          ${j+1}. ${broadcast.name} (${broadcast.country})`);
              if (broadcast.url) console.log(`             URL: ${broadcast.url}`);
            });
          }
          console.log('');
        });

        // This would be our breakthrough - return early if we find data
        return;
      } else {
        console.log(`   ❌ No fixtures found for ${range.name}`);

        // Check if there's any error message
        if (data.meta && data.meta.msg) {
          console.log(`   Message: ${data.meta.msg}`);
        }
        if (data.error) {
          console.log(`   Error: ${JSON.stringify(data.error)}`);
        }
      }
      console.log('');

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  // Test without date filters for Austrian Bundesliga
  console.log('🌍 Testing Austrian Bundesliga without date filters...');
  try {
    const url = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url.searchParams.append('user', username);
    url.searchParams.append('token', token);
    url.searchParams.append('t', 'list');
    url.searchParams.append('league_id', '1005');

    const response = await fetch(url.toString(), { headers });
    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Fixtures: ${data.data ? data.data.length : 0}`);

    if (data.data && data.data.length > 0) {
      console.log('   ✅ SUCCESS! Found fixtures without date filter');
      const fixture = data.data[0];
      console.log(`   Sample: ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
      console.log(`   Date: ${fixture.date || fixture.utc_date}`);
    } else {
      console.log('   ❌ No fixtures found even without date filter');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');

  // Test seasons endpoint for Austrian Bundesliga
  console.log('🔍 Getting season information for Austrian Bundesliga...');
  try {
    const url = new URL('https://api.soccersapi.com/v2.2/seasons');
    url.searchParams.append('user', username);
    url.searchParams.append('token', token);
    url.searchParams.append('t', 'list');
    url.searchParams.append('league_id', '1005');

    const response = await fetch(url.toString(), { headers });
    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Seasons: ${data.data ? data.data.length : 0}`);

    if (data.data && data.data.length > 0) {
      console.log('   ✅ Found season data:');
      data.data.slice(0, 5).forEach(season => {
        console.log(`   • ${season.name} (ID: ${season.id}) - Current: ${season.is_current}`);
      });

      // Try with specific season
      const currentSeason = data.data.find(s => s.is_current === '1') || data.data[0];
      console.log(`\n   🎯 Testing fixtures with season ${currentSeason.id} (${currentSeason.name})...`);

      const seasonUrl = new URL('https://api.soccersapi.com/v2.2/fixtures');
      seasonUrl.searchParams.append('user', username);
      seasonUrl.searchParams.append('token', token);
      seasonUrl.searchParams.append('t', 'list');
      seasonUrl.searchParams.append('league_id', '1005');
      seasonUrl.searchParams.append('season_id', currentSeason.id);

      const seasonResponse = await fetch(seasonUrl.toString(), { headers });
      const seasonData = await seasonResponse.json();

      console.log(`   Fixtures with season ID: ${seasonData.data ? seasonData.data.length : 0}`);

      if (seasonData.data && seasonData.data.length > 0) {
        console.log('   ✅ SUCCESS! Season-specific fixtures found');
        const fixture = seasonData.data[0];
        console.log(`   Sample: ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
      }
    } else {
      console.log('   ❌ No season data found');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n🎯 Austrian Bundesliga test complete!');
}

testAustrianBundesliga();