#!/usr/bin/env node

import 'dotenv/config';

const API_TOKEN = process.env.SPORTMONKS_TOKEN;
const BASE_URL = 'https://api.sportmonks.com/v3/football';

async function getLeagueDetails(leagueId) {
  const url = new URL(`${BASE_URL}/leagues/${leagueId}`);
  url.searchParams.append('api_token', API_TOKEN);

  const response = await fetch(url.toString());
  const data = await response.json();
  return data.data;
}

// Check the suspicious leagues
const leaguesToCheck = [2, 5, 486, 501];

console.log('🔍 Checking League Details:\n');

for (const id of leaguesToCheck) {
  const league = await getLeagueDetails(id);
  console.log(`ID ${id}: ${league.name}`);
  console.log(`  Category: ${league.category || 'N/A'}`);
  console.log(`  Type: ${league.type || 'N/A'}`);
  console.log(`  Sub Type: ${league.sub_type || 'N/A'}`);
  console.log(`  Active: ${league.active}`);
  console.log('');
}
