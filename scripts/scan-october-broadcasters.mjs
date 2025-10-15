#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('📊 OCTOBER 2025 BROADCASTER COVERAGE\n');
console.log('='.repeat(80));

// Get all October fixtures
const { data: fixtures } = await supabase
  .from('fixtures_with_teams')
  .select('id, competition_id, round, home_team, away_team, utc_kickoff, broadcaster')
  .gte('utc_kickoff', '2025-10-01')
  .lt('utc_kickoff', '2025-11-01')
  .order('utc_kickoff');

const competitions = {
  1: 'Premier League',
  2: 'Champions League',
  3: 'FA Cup',
  4: 'EFL Cup',
  5: 'Serie A',
  6: 'Ligue 1',
  7: 'Primeira Liga',
  8: 'Eredivisie',
  9: 'Championship',
  11: 'Europa League'
};

// Overall stats
let totalOct = fixtures.length;
let withBroadcaster = fixtures.filter(f => f.broadcaster).length;

console.log('OVERALL OCTOBER:');
console.log(`  Total Fixtures: ${totalOct}`);
console.log(`  With Broadcaster: ${withBroadcaster} (${((withBroadcaster/totalOct)*100).toFixed(1)}%)`);
console.log(`  Without Broadcaster: ${totalOct - withBroadcaster} (${(((totalOct - withBroadcaster)/totalOct)*100).toFixed(1)}%)\n`);

// By competition
const byComp = {};
fixtures.forEach(f => {
  const comp = competitions[f.competition_id] || 'Other';
  if (!byComp[comp]) {
    byComp[comp] = { total: 0, withBroadcaster: 0 };
  }
  byComp[comp].total++;
  if (f.broadcaster) {
    byComp[comp].withBroadcaster++;
  }
});

console.log('BY COMPETITION:');
Object.entries(byComp)
  .sort((a, b) => b[1].total - a[1].total)
  .forEach(([comp, stats]) => {
    const pct = ((stats.withBroadcaster/stats.total)*100).toFixed(1);
    console.log(`  ${comp.padEnd(20)}: ${stats.total.toString().padStart(3)} fixtures, ${stats.withBroadcaster.toString().padStart(3)} with broadcaster (${pct}%)`);
  });

// By week
console.log('\nBY WEEK:');
const byWeek = {};
fixtures.forEach(f => {
  const date = new Date(f.utc_kickoff);
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
  const weekKey = weekStart.toISOString().slice(0, 10);

  if (!byWeek[weekKey]) {
    byWeek[weekKey] = { total: 0, withBroadcaster: 0 };
  }
  byWeek[weekKey].total++;
  if (f.broadcaster) {
    byWeek[weekKey].withBroadcaster++;
  }
});

Object.entries(byWeek)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([week, stats]) => {
    const pct = ((stats.withBroadcaster/stats.total)*100).toFixed(1);
    const weekDate = new Date(week);
    const weekLabel = 'Week of ' + weekDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    console.log(`  ${weekLabel.padEnd(20)}: ${stats.total.toString().padStart(3)} fixtures, ${stats.withBroadcaster.toString().padStart(3)} with broadcaster (${pct}%)`);
  });

// Premier League detail
const plFixtures = fixtures.filter(f => f.competition_id === 1);
console.log('\n' + '='.repeat(80));
console.log('\nPREMIER LEAGUE OCTOBER DETAIL:');
console.log(`  Total: ${plFixtures.length}`);
console.log(`  With Broadcaster: ${plFixtures.filter(f => f.broadcaster).length} (${((plFixtures.filter(f => f.broadcaster).length/plFixtures.length)*100).toFixed(1)}%)`);
console.log('\n  All PL Fixtures:');
plFixtures.forEach(f => {
  const date = new Date(f.utc_kickoff);
  const dateStr = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const broadcaster = f.broadcaster || 'TBD';
  const round = 'MW' + (f.round?.name || '?');
  console.log(`    ${dateStr} ${timeStr}  ${round.padEnd(6)}  ${f.home_team.substring(0, 20).padEnd(20)} vs ${f.away_team.substring(0, 20).padEnd(20)}  ${broadcaster}`);
});
