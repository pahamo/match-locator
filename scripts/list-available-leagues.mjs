#!/usr/bin/env node

/**
 * List all leagues available in current SoccersAPI plan
 */

import 'dotenv/config';

async function listAvailableLeagues() {
  console.log('🔍 Checking your available SoccersAPI leagues...\n');

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  if (!username || !token) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  try {
    const url = new URL('https://api.soccersapi.com/v2.2/leagues');
    url.searchParams.append('user', username);
    url.searchParams.append('token', token);
    url.searchParams.append('t', 'list');

    console.log('📡 Fetching leagues...');
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log('📋 Raw API response:', JSON.stringify(data, null, 2));

    const leagues = Array.isArray(data) ? data : data.data || [];

    console.log(`✅ Found ${leagues.length} leagues in your plan:\n`);

    leagues.forEach((league, index) => {
      console.log(`${index + 1}. ${league.name}`);
      console.log(`   Country: ${league.country_name} (${league.cc ? league.cc.toUpperCase() : 'no code'})`);
      console.log(`   ID: ${league.id}`);
      console.log(`   Type: ${league.is_cup === '1' ? 'Cup' : 'League'}`);
      console.log(`   Current Season: ${league.current_season_id}`);
      console.log('');
    });

    // Check for popular leagues - search more specifically
    const popularLeagues = [
      { name: 'Premier League', search: ['Premier League'] },
      { name: 'La Liga', search: ['La Liga', 'Primera División'] },
      { name: 'Serie A', search: ['Serie A'] },
      { name: 'Bundesliga', search: ['Bundesliga'] },
      { name: 'Ligue 1', search: ['Ligue 1'] },
      { name: 'Champions League', search: ['Champions League', 'UEFA Champions'] },
      { name: 'Europa League', search: ['Europa League', 'UEFA Europa'] },
      { name: 'English Premier League', search: ['England', 'Premier League'] }
    ];

    console.log('🎯 Popular leagues check:');
    popularLeagues.forEach(popular => {
      const found = leagues.find(league =>
        popular.search.some(searchTerm =>
          league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          league.country_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      console.log(`   ${found ? '✅' : '❌'} ${popular.name}`);
      if (found) {
        console.log(`       Found: ${found.name} (${found.country_name})`);
      }
    });

    console.log(`\n📊 Credits used: ${2980 - leagues.length} (approx)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listAvailableLeagues();