#!/usr/bin/env node

/**
 * List ALL Sports Monks Leagues
 *
 * Shows every league you have access to for manual mapping
 */

import 'dotenv/config';

const API_TOKEN = process.env.SPORTMONKS_TOKEN || process.env.REACT_APP_SPORTMONKS_TOKEN;
const BASE_URL = 'https://api.sportmonks.com/v3/football';

async function makeRequest(endpoint) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_token', API_TOKEN);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  return response.json();
}

const response = await makeRequest('/leagues');
const leagues = response.data;

console.log(`\n📚 ALL SPORTS MONKS LEAGUES (${leagues.length} total)\n`);
console.log('='.repeat(100));
console.log('');

// Group by first letter for easier browsing
const grouped = {};
leagues.forEach(league => {
  const firstLetter = league.name[0].toUpperCase();
  if (!grouped[firstLetter]) grouped[firstLetter] = [];
  grouped[firstLetter].push(league);
});

Object.keys(grouped).sort().forEach(letter => {
  console.log(`\n${letter}:`);
  grouped[letter]
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(league => {
      const active = league.active ? '✅' : '❌';
      console.log(`   ${active} ${league.id.toString().padStart(6)}: ${league.name}`);
    });
});

console.log('\n');
console.log('='.repeat(100));
console.log('\n🔍 SEARCH FOR MISSING COMPETITIONS:\n');
console.log('Looking for: EFL Cup, Europa Conference League, Scottish Premiership, League One\n');

const searches = [
  { term: 'efl', label: 'EFL Cup' },
  { term: 'carabao', label: 'EFL/Carabao Cup' },
  { term: 'league cup', label: 'League Cup' },
  { term: 'conference', label: 'Europa Conference' },
  { term: 'scottish', label: 'Scottish leagues' },
  { term: 'league one', label: 'League One' },
  { term: 'league 1', label: 'League 1' },
];

searches.forEach(({ term, label }) => {
  const matches = leagues.filter(l => l.name.toLowerCase().includes(term.toLowerCase()));
  if (matches.length > 0) {
    console.log(`${label}:`);
    matches.forEach(m => {
      const active = m.active ? '✅' : '❌';
      console.log(`   ${active} ${m.id.toString().padStart(6)}: ${m.name}`);
    });
    console.log('');
  }
});
