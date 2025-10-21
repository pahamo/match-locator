import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Analyzing ALL PL fixtures around MW9...\n');

// Get all PL fixtures with round info
const { data: fixtures } = await supabase
  .from('fixtures_with_teams')
  .select('id, home_team, away_team, utc_kickoff, round, sportmonks_fixture_id')
  .eq('competition_id', 1)
  .order('utc_kickoff');

// Find fixtures around Oct 20-30
const oct20 = new Date('2025-10-20');
const oct30 = new Date('2025-10-30');

const octFixtures = fixtures.filter(f => {
  const date = new Date(f.utc_kickoff);
  return date >= oct20 && date <= oct30;
});

console.log('Fixtures between Oct 20-30:\n');

octFixtures.forEach(f => {
  const date = new Date(f.utc_kickoff);
  const mw = f.round?.name || '?';
  console.log(`MW${mw.padStart(2)} ${date.toLocaleDateString('en-GB')} ${f.home_team} vs ${f.away_team} (SM: ${f.sportmonks_fixture_id || 'NONE'})`);
});

// Count by round
const byRound = {};
octFixtures.forEach(f => {
  const mw = f.round?.name || 'Unknown';
  byRound[mw] = (byRound[mw] || 0) + 1;
});

console.log('\n📊 Count by round:');
Object.keys(byRound).sort().forEach(mw => {
  console.log(`  MW${mw}: ${byRound[mw]} fixtures`);
});

// Check what teams are in MW9
console.log('\n🔍 Teams in MW9:');
const mw9 = octFixtures.filter(f => f.round?.name === '9');
const teams = new Set();
mw9.forEach(f => {
  teams.add(f.home_team);
  teams.add(f.away_team);
});
console.log(`  ${teams.size} unique teams: ${Array.from(teams).sort().join(', ')}`);

// Which teams are MISSING from MW9?
const allPLTeams = ['Arsenal FC', 'Aston Villa FC', 'AFC Bournemouth', 'Brentford FC', 'Brighton & Hove Albion',
  'Burnley FC', 'Chelsea FC', 'Crystal Palace FC', 'Everton FC', 'Fulham FC', 'Leeds United FC',
  'Liverpool FC', 'Manchester City', 'Manchester United', 'Newcastle United FC', 'Nottingham Forest',
  'Sunderland AFC', 'Tottenham Hotspur', 'West Ham United FC', 'Wolverhampton Wanderers'];

console.log('\n⚠️  Teams MISSING from MW9:');
allPLTeams.forEach(team => {
  if (!teams.has(team)) {
    console.log(`  - ${team}`);
  }
});
