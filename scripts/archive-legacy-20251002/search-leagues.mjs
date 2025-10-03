#!/usr/bin/env node

/**
 * Comprehensive search for specific leagues in SoccersAPI
 */

import 'dotenv/config';

async function searchLeagues() {
  console.log('🔍 Comprehensive league search...\n');

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

    // Search terms for major European leagues
    const searchTerms = [
      'england', 'english', 'premier', 'epl', 'championship', 'fa cup',
      'spain', 'spanish', 'la liga', 'primera', 'laliga',
      'germany', 'german', 'bundesliga',
      'italy', 'italian', 'serie a',
      'france', 'french', 'ligue 1', 'ligue1',
      'champions league', 'europa league', 'uefa',
      'portugal', 'portuguese', 'primeira liga',
      'netherlands', 'dutch', 'eredivisie'
    ];

    const foundLeagues = new Map();

    searchTerms.forEach(term => {
      const matches = leagues.filter(league =>
        league.name.toLowerCase().includes(term.toLowerCase()) ||
        league.country_name?.toLowerCase().includes(term.toLowerCase())
      );

      if (matches.length > 0) {
        foundLeagues.set(term, matches);
      }
    });

    if (foundLeagues.size === 0) {
      console.log('❌ No major European leagues found\n');

      // Show a sample of what IS available
      console.log('📋 Sample of available leagues:');
      leagues.slice(0, 20).forEach((league, i) => {
        console.log(`${i+1}. ${league.name} (${league.country_name || 'Unknown'}) - ID: ${league.id}`);
      });

      console.log(`\n... and ${leagues.length - 20} more leagues`);
    } else {
      console.log('✅ Major leagues found:');
      for (const [term, matches] of foundLeagues) {
        console.log(`\n🔍 "${term.toUpperCase()}" matches:`);
        matches.forEach(league => {
          console.log(`   • ${league.name} (${league.country_name || 'Unknown'}, ID: ${league.id})`);
        });
      }
    }

    // Check for country codes that might be UK/England
    const ukCodes = ['gb', 'en', 'uk', 'eng'];
    const ukLeagues = leagues.filter(league =>
      ukCodes.includes(league.cc?.toLowerCase())
    );

    if (ukLeagues.length > 0) {
      console.log('\n🇬🇧 UK/England country code matches:');
      ukLeagues.forEach(league => {
        console.log(`   • ${league.name} (${league.country_name}, ${league.cc}) - ID: ${league.id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

searchLeagues();