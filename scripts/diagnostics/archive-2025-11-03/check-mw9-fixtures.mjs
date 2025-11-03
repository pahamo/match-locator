import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Checking MW9 fixtures in database...\n');

// Get all fixtures that might be MW9
const { data: allFixtures, error } = await supabase
  .from('fixtures')
  .select('id, home_team_id, away_team_id, utc_kickoff, round, sportmonks_fixture_id')
  .eq('competition_id', 1)
  .gte('utc_kickoff', '2025-10-24')
  .lte('utc_kickoff', '2025-10-27')
  .order('utc_kickoff');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`Total fixtures between Oct 24-27: ${allFixtures.length}\n`);

// Group by round
const byRound = {};
allFixtures.forEach(f => {
  const round = f.round?.name || 'Unknown';
  if (!byRound[round]) byRound[round] = [];
  byRound[round].push(f);
});

Object.keys(byRound).forEach(round => {
  console.log(`Round ${round}: ${byRound[round].length} fixtures`);
  byRound[round].forEach(f => {
    const date = new Date(f.utc_kickoff);
    console.log(`  - Fixture ${f.id} at ${date.toLocaleString('en-GB', { timeZone: 'Europe/London' })} (SM ID: ${f.sportmonks_fixture_id || 'NONE'})`);
  });
  console.log('');
});

// Check what SportMonks has for MW9
console.log('📡 Checking SportMonks API for MW9...\n');

const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

// Get round info
const roundResponse = await fetch(`https://api.sportmonks.com/v3/football/rounds/372199?api_token=${SPORTMONKS_TOKEN}&include=fixtures.participants`);
const roundData = await roundResponse.json();

if (roundData.data) {
  console.log(`Round ${roundData.data.name} has ${roundData.data.fixtures?.length || 0} fixtures`);

  if (roundData.data.fixtures) {
    console.log('\nFixtures from SportMonks API:\n');
    roundData.data.fixtures.forEach(f => {
      const home = f.participants?.find(p => p.meta?.location === 'home');
      const away = f.participants?.find(p => p.meta?.location === 'away');
      console.log(`  - ${f.id}: ${home?.name || '?'} vs ${away?.name || '?'} (${f.starting_at})`);
    });
  }
}
