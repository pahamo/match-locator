#!/usr/bin/env node

/**
 * Check all pages of leagues to find English Premier League
 */

import 'dotenv/config';

async function checkAllPages() {
  console.log('📄 Checking all pages of leagues...\n');

  const username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME;
  const token = process.env.REACT_APP_SOCCERSAPI_TOKEN || process.env.SOCCERSAPI_KEY;

  if (!username || !token) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  let allLeagues = [];
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages && page <= 10) { // Safety limit
    console.log(`📋 Fetching page ${page}...`);

    try {
      const url = new URL('https://api.soccersapi.com/v2.2/leagues');
      url.searchParams.append('user', username);
      url.searchParams.append('token', token);
      url.searchParams.append('t', 'list');
      url.searchParams.append('page', page.toString());

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        console.log(`   ✅ Found ${data.data.length} leagues on page ${page}`);
        allLeagues.push(...data.data);

        // Check for English leagues on this page
        const englishLeagues = data.data.filter(league =>
          league.country_name?.toLowerCase().includes('england') ||
          league.cc === 'gb' || league.cc === 'en' ||
          (league.name.toLowerCase().includes('premier league') &&
           league.country_name?.toLowerCase().includes('england'))
        );

        if (englishLeagues.length > 0) {
          console.log(`🏴󠁧󠁢󠁥󠁮󠁧󠁿 FOUND ENGLISH LEAGUES ON PAGE ${page}:`);
          englishLeagues.forEach(league => {
            console.log(`   ✅ ${league.name} (${league.country_name}, ID: ${league.id})`);
          });
        }

        // Check for major European leagues
        const majorLeagues = data.data.filter(league => {
          const name = league.name.toLowerCase();
          const country = league.country_name?.toLowerCase() || '';
          return (
            (name.includes('premier league') && country.includes('england')) ||
            (name.includes('la liga') || name.includes('primera división')) ||
            name.includes('bundesliga') ||
            name.includes('serie a') ||
            (name.includes('ligue 1') && country.includes('france')) ||
            name.includes('champions league') ||
            name.includes('europa league')
          );
        });

        if (majorLeagues.length > 0) {
          console.log(`🏆 MAJOR EUROPEAN LEAGUES ON PAGE ${page}:`);
          majorLeagues.forEach(league => {
            console.log(`   ✅ ${league.name} (${league.country_name}, ID: ${league.id})`);
          });
        }

        page++;
      } else {
        console.log(`   ❌ Page ${page} is empty - reached end`);
        hasMorePages = false;
      }

    } catch (error) {
      console.error(`❌ Error on page ${page}:`, error.message);
      hasMorePages = false;
    }
  }

  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total pages checked: ${page - 1}`);
  console.log(`   Total leagues found: ${allLeagues.length}`);

  // Final search through ALL leagues
  const allEnglishLeagues = allLeagues.filter(league =>
    league.country_name?.toLowerCase().includes('england') ||
    league.cc === 'gb' || league.cc === 'en' ||
    (league.name.toLowerCase().includes('premier league') &&
     league.country_name?.toLowerCase().includes('england'))
  );

  const allMajorLeagues = allLeagues.filter(league => {
    const name = league.name.toLowerCase();
    const country = league.country_name?.toLowerCase() || '';
    return (
      (name.includes('premier league') && country.includes('england')) ||
      (name.includes('la liga') || name.includes('primera división')) ||
      name.includes('bundesliga') ||
      name.includes('serie a') ||
      (name.includes('ligue 1') && country.includes('france')) ||
      name.includes('champions league') ||
      name.includes('europa league')
    );
  });

  console.log(`\n🏴󠁧󠁢󠁥󠁮󠁧󠁿 TOTAL ENGLISH LEAGUES: ${allEnglishLeagues.length}`);
  if (allEnglishLeagues.length > 0) {
    allEnglishLeagues.forEach(league => {
      console.log(`   • ${league.name} (${league.country_name}, ID: ${league.id})`);
    });
  }

  console.log(`\n🏆 TOTAL MAJOR EUROPEAN LEAGUES: ${allMajorLeagues.length}`);
  if (allMajorLeagues.length > 0) {
    allMajorLeagues.forEach(league => {
      console.log(`   • ${league.name} (${league.country_name}, ID: ${league.id})`);
    });
  }

  if (allEnglishLeagues.length === 0 && allMajorLeagues.length === 0) {
    console.log('\n❌ CONFIRMED: No English Premier League or major European leagues found across all pages');
    console.log('\n📋 Sample of what IS available:');
    allLeagues.slice(0, 10).forEach((league, i) => {
      console.log(`   ${i+1}. ${league.name} (${league.country_name})`);
    });
  }
}

checkAllPages();