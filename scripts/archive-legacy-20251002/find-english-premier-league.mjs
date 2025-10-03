#!/usr/bin/env node

/**
 * Find English Premier League in SoccersAPI
 */

import 'dotenv/config';

async function findEnglishPremierLeague() {
  console.log('🔍 Looking for English Premier League...\n');

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

    const response = await fetch(url.toString());
    const data = await response.json();
    const leagues = Array.isArray(data) ? data : data.data || [];

    console.log(`📋 Searching ${leagues.length} leagues...\n`);

    // Look for England/English Premier League
    const englishLeagues = leagues.filter(league =>
      league.country_name?.toLowerCase().includes('england') ||
      league.cc === 'gb' ||
      league.cc === 'en' ||
      (league.name.toLowerCase().includes('premier league') &&
       league.country_name?.toLowerCase().includes('england'))
    );

    console.log('🏴󠁧󠁢󠁥󠁮󠁧󠁿 English leagues found:');
    englishLeagues.forEach(league => {
      console.log(`✅ ${league.name}`);
      console.log(`   Country: ${league.country_name} (${league.cc || 'no code'})`);
      console.log(`   ID: ${league.id}`);
      console.log(`   Type: ${league.is_cup === '1' ? 'Cup' : 'League'}`);
      console.log(`   Season: ${league.current_season_id}`);
      console.log('');
    });

    if (englishLeagues.length === 0) {
      console.log('❌ No English leagues found');

      // Let's see all Premier Leagues
      console.log('\n🔍 All "Premier League" entries:');
      const premierLeagues = leagues.filter(league =>
        league.name.toLowerCase().includes('premier league')
      );

      premierLeagues.forEach((league, i) => {
        console.log(`${i+1}. ${league.name} (${league.country_name}, ${league.cc || 'no code'}) - ID: ${league.id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findEnglishPremierLeague();