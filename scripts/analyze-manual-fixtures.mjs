#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('📊 Analyzing Manual Fixtures\n');
console.log('='.repeat(80));

// Get manual fixtures by competition
const { data: manualFixtures } = await supabase
  .from('fixtures')
  .select(`
    id,
    utc_kickoff,
    competition_id,
    data_source,
    competitions(name)
  `)
  .eq('data_source', 'manual');

// Group by competition
const byCompetition = {};
const byYear = {};

manualFixtures?.forEach(f => {
  const compName = f.competitions?.name || 'Unknown';
  const year = new Date(f.utc_kickoff).getFullYear();

  if (!byCompetition[compName]) {
    byCompetition[compName] = { count: 0, earliestDate: f.utc_kickoff, latestDate: f.utc_kickoff };
  }
  byCompetition[compName].count++;

  if (new Date(f.utc_kickoff) < new Date(byCompetition[compName].earliestDate)) {
    byCompetition[compName].earliestDate = f.utc_kickoff;
  }
  if (new Date(f.utc_kickoff) > new Date(byCompetition[compName].latestDate)) {
    byCompetition[compName].latestDate = f.utc_kickoff;
  }

  byYear[year] = (byYear[year] || 0) + 1;
});

console.log('\n📅 Manual Fixtures by Competition:\n');
Object.entries(byCompetition)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 15)
  .forEach(([comp, data]) => {
    const earliest = new Date(data.earliestDate).toISOString().split('T')[0];
    const latest = new Date(data.latestDate).toISOString().split('T')[0];
    console.log(`  ${comp.padEnd(30)} ${data.count.toString().padStart(4)} fixtures (${earliest} to ${latest})`);
  });

console.log('\n\n📆 Manual Fixtures by Year:\n');
Object.entries(byYear)
  .sort((a, b) => b[0] - a[0])
  .forEach(([year, count]) => {
    console.log(`  ${year}: ${count} fixtures`);
  });

// Check how many are in the future
const now = new Date().toISOString();
const { count: futureCount } = await supabase
  .from('fixtures')
  .select('*', { count: 'exact', head: true })
  .eq('data_source', 'manual')
  .gte('utc_kickoff', now);

const { count: pastCount } = await supabase
  .from('fixtures')
  .select('*', { count: 'exact', head: true })
  .eq('data_source', 'manual')
  .lt('utc_kickoff', now);

console.log('\n\n⏰ Manual Fixtures by Time:\n');
console.log(`  📜 Past:   ${pastCount || 0} fixtures`);
console.log(`  📅 Future: ${futureCount || 0} fixtures`);

console.log('\n' + '='.repeat(80));
console.log('\n💡 Recommendation:\n');
console.log('  1. Keep past manual fixtures (historical archive)');
console.log('  2. Delete future manual fixtures (Sports Monks will handle)');
console.log(`  3. This would clean up ~${futureCount} fixtures`);
