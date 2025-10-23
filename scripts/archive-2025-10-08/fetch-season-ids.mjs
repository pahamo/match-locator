#!/usr/bin/env node

/**
 * Fetch Current Season IDs for All Competitions
 *
 * This script fetches the current season IDs from Sports Monks API
 * for all competitions we track.
 */

import dotenv from 'dotenv';

dotenv.config();

const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

if (!SPORTMONKS_TOKEN) {
  console.error('❌ Missing SPORTMONKS_TOKEN');
  process.exit(1);
}

const LEAGUES = [
  { id: 8, name: 'Premier League' },
  { id: 2, name: 'Champions League' },
  { id: 5, name: 'Europa League' },
  { id: 2286, name: 'Europa Conference League' },
  { id: 82, name: 'Bundesliga' },
  { id: 564, name: 'La Liga' },
  { id: 384, name: 'Serie A' },
  { id: 301, name: 'Ligue 1' },
  { id: 24, name: 'FA Cup' },
  { id: 27, name: 'Carabao Cup' },
  { id: 501, name: 'Scottish Premiership' },
  { id: 9, name: 'Championship' },
];

async function fetchSeasonId(leagueId, leagueName) {
  try {
    const url = `https://api.sportmonks.com/v3/football/leagues/${leagueId}?api_token=${SPORTMONKS_TOKEN}&include=currentseason`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const currentSeason = data.data?.currentseason;

    if (currentSeason) {
      return {
        leagueId,
        leagueName,
        seasonId: currentSeason.id,
        seasonName: currentSeason.name,
        startDate: currentSeason.starting_at,
        endDate: currentSeason.ending_at,
      };
    } else {
      return {
        leagueId,
        leagueName,
        error: 'No current season found',
      };
    }
  } catch (error) {
    return {
      leagueId,
      leagueName,
      error: error.message,
    };
  }
}

async function main() {
  console.log('🔍 Fetching Current Season IDs from Sports Monks API\n');
  console.log('='.repeat(80));

  const results = [];

  for (const league of LEAGUES) {
    const result = await fetchSeasonId(league.id, league.name);
    results.push(result);

    if (result.error) {
      console.log(`❌ ${result.leagueName} (League ${result.leagueId}): ${result.error}`);
    } else {
      console.log(`✅ ${result.leagueName} (League ${result.leagueId}):`);
      console.log(`   Season ID: ${result.seasonId}`);
      console.log(`   Season: ${result.seasonName}`);
      console.log(`   Dates: ${result.startDate} to ${result.endDate}\n`);
    }

    // Rate limit: 200ms between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('='.repeat(80));
  console.log('\n📝 TypeScript Config (for src/config/competitions.ts):\n');

  results.forEach(result => {
    if (!result.error) {
      const slug = result.leagueName.toLowerCase().replace(/ /g, '-');
      console.log(`  '${slug}': {`);
      console.log(`    // ... other fields`);
      console.log(`    seasonId: ${result.seasonId} // ${result.seasonName}`);
      console.log(`  },`);
    }
  });

  console.log('\n✅ Done!\n');
}

main();
