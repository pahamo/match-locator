#!/usr/bin/env node

/**
 * Test if ANY leagues have fixture data available
 */

import 'dotenv/config';

async function testAnyFixtures() {
  console.log('🔍 Testing fixture data availability across different leagues...\n');

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  if (!username || !token) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  // Test major leagues we know are available
  const leaguesToTest = [
    { name: 'Premier League', id: '583' },
    { name: 'Champions League', id: '539' },
    { name: 'Europa League', id: '541' },
    { name: 'Bundesliga', id: '594' },
    { name: 'Serie A', id: '719' },
    { name: 'Ligue 1', id: '764' },
    { name: 'FA Cup', id: '578' },
    { name: 'J1 League (Japan)', id: '2645' },
    { name: 'MLS', id: '1126' },
    { name: 'Bundesliga Austria', id: '1005' }
  ];

  console.log('🧪 Testing major leagues for fixtures in the past 2 months...\n');

  for (const league of leaguesToTest) {
    try {
      const url = new URL('https://api.soccersapi.com/v2.2/fixtures');
      url.searchParams.append('user', username);
      url.searchParams.append('token', token);
      url.searchParams.append('t', 'list');
      url.searchParams.append('league_id', league.id);
      url.searchParams.append('date_from', '2025-07-01');
      url.searchParams.append('date_to', '2025-09-30');

      const response = await fetch(url.toString());
      const data = await response.json();

      const fixtureCount = data.data ? data.data.length : 0;
      console.log(`${league.name} (ID: ${league.id}): ${fixtureCount} fixtures`);

      if (fixtureCount > 0) {
        const fixture = data.data[0];
        console.log(`   ✅ Sample: ${fixture.homeTeam?.name || fixture.home_team} vs ${fixture.awayTeam?.name || fixture.away_team}`);
        console.log(`   📅 Date: ${fixture.date || fixture.utc_date}`);
        console.log(`   🏟️ Venue: ${fixture.venue?.name || 'Unknown'}`);
        console.log(`   📺 Broadcasts: ${fixture.broadcasts ? fixture.broadcasts.length : 0}`);
      }
      console.log('');

    } catch (error) {
      console.log(`${league.name}: Error - ${error.message}\n`);
    }
  }

  // Test without league filter to see what's available globally
  console.log('🌍 Testing global fixtures (all leagues) for past week...\n');

  try {
    const url = new URL('https://api.soccersapi.com/v2.2/fixtures');
    url.searchParams.append('user', username);
    url.searchParams.append('token', token);
    url.searchParams.append('t', 'list');
    url.searchParams.append('date_from', '2025-09-20');
    url.searchParams.append('date_to', '2025-09-27');

    const response = await fetch(url.toString());
    const data = await response.json();

    const fixtures = data.data || [];
    console.log(`📊 Total fixtures globally: ${fixtures.length}`);

    if (fixtures.length > 0) {
      console.log('\n🏆 Leagues with recent fixtures:');
      const leagueMap = new Map();

      fixtures.forEach(fixture => {
        const leagueName = fixture.league?.name || 'Unknown League';
        const country = fixture.league?.country || 'Unknown';
        const key = `${leagueName} (${country})`;
        leagueMap.set(key, (leagueMap.get(key) || 0) + 1);
      });

      [...leagueMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([league, count]) => {
          console.log(`   • ${league}: ${count} fixtures`);
        });

      console.log('\n🎯 Sample fixture details:');
      const sampleFixture = fixtures[0];
      console.log(`   Match: ${sampleFixture.homeTeam?.name || sampleFixture.home_team} vs ${sampleFixture.awayTeam?.name || sampleFixture.away_team}`);
      console.log(`   League: ${sampleFixture.league?.name || 'Unknown'}`);
      console.log(`   Country: ${sampleFixture.league?.country || 'Unknown'}`);
      console.log(`   Date: ${sampleFixture.date || sampleFixture.utc_date}`);
      console.log(`   Enhanced data:`);
      console.log(`     📺 Broadcasts: ${sampleFixture.broadcasts ? sampleFixture.broadcasts.length : 0}`);
      console.log(`     🌤️ Weather: ${sampleFixture.weather ? 'Yes' : 'No'}`);
      console.log(`     💰 Odds: ${sampleFixture.odds ? 'Yes' : 'No'}`);

      if (sampleFixture.broadcasts && sampleFixture.broadcasts.length > 0) {
        console.log(`\n📺 Broadcast example:`);
        const broadcast = sampleFixture.broadcasts[0];
        console.log(`     ${broadcast.name} (${broadcast.country})`);
        if (broadcast.url) console.log(`     URL: ${broadcast.url}`);
      }
    } else {
      console.log('❌ No fixtures found globally - this suggests a data issue');
    }

  } catch (error) {
    console.error('❌ Global fixtures test failed:', error.message);
  }
}

testAnyFixtures();