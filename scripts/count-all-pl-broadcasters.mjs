import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('📊 Checking ALL Premier League broadcaster coverage...\n');

// Get all PL fixtures from the view (this applies the blackout rule)
const { data: fixtures, error } = await supabase
  .from('fixtures_with_teams')
  .select('id, home_team, away_team, utc_kickoff, round, broadcaster')
  .eq('competition_id', 1)
  .order('utc_kickoff');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

const withBroadcaster = fixtures.filter(f => f.broadcaster);
const withoutBroadcaster = fixtures.filter(f => !f.broadcaster);

console.log(`Total PL fixtures: ${fixtures.length}`);
console.log(`With broadcaster: ${withBroadcaster.length} (${((withBroadcaster.length/fixtures.length)*100).toFixed(1)}%)`);
console.log(`Without broadcaster: ${withoutBroadcaster.length} (${((withoutBroadcaster.length/fixtures.length)*100).toFixed(1)}%)`);

console.log('\n📺 Fixtures WITH broadcasters:\n');

withBroadcaster.forEach(f => {
  const date = new Date(f.utc_kickoff);
  const mw = f.round?.name || '?';
  console.log(`MW${mw.padStart(2)} ${date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London'
  })} ${f.home_team} vs ${f.away_team} - ${f.broadcaster}`);
});

console.log('\n🔍 Breakdown by matchweek:\n');

const byMatchweek = {};
fixtures.forEach(f => {
  const mw = f.round?.name || 'Unknown';
  if (!byMatchweek[mw]) {
    byMatchweek[mw] = { total: 0, withBroadcaster: 0 };
  }
  byMatchweek[mw].total++;
  if (f.broadcaster) byMatchweek[mw].withBroadcaster++;
});

Object.keys(byMatchweek).sort((a, b) => parseInt(a) - parseInt(b)).forEach(mw => {
  const stats = byMatchweek[mw];
  const pct = ((stats.withBroadcaster / stats.total) * 100).toFixed(0);
  console.log(`MW${mw.padStart(2)}: ${stats.withBroadcaster}/${stats.total} (${pct}%)`);
});
