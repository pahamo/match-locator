#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('📊 OVERALL FIXTURES SCAN\n');
console.log('='.repeat(80));

// Get all fixtures with broadcaster data
const { data: fixtures } = await supabase
  .from('fixtures_with_teams')
  .select('id, competition_id, round, home_team, away_team, utc_kickoff, status, broadcaster')
  .order('utc_kickoff');

// Competition mapping
const competitions = {
  1: 'Premier League',
  2: 'Champions League',
  3: 'FA Cup',
  4: 'EFL Cup'
};

// Aggregate by competition
const stats = {};

fixtures.forEach(f => {
  const comp = competitions[f.competition_id] || 'Other';
  if (!stats[comp]) {
    stats[comp] = {
      total: 0,
      withBroadcaster: 0,
      withoutBroadcaster: 0,
      byRound: {}
    };
  }

  stats[comp].total++;

  if (f.broadcaster) {
    stats[comp].withBroadcaster++;
  } else {
    stats[comp].withoutBroadcaster++;
  }

  // Track by round
  const roundName = f.round?.name || 'Unknown';
  if (!stats[comp].byRound[roundName]) {
    stats[comp].byRound[roundName] = { total: 0, withBroadcaster: 0 };
  }
  stats[comp].byRound[roundName].total++;
  if (f.broadcaster) {
    stats[comp].byRound[roundName].withBroadcaster++;
  }
});

// Print summary
let grandTotal = 0;
let grandWithBroadcaster = 0;

Object.entries(stats).forEach(([comp, data]) => {
  console.log(`\n${comp}:`);
  console.log(`  Total Fixtures: ${data.total}`);
  console.log(`  With Broadcaster: ${data.withBroadcaster} (${((data.withBroadcaster/data.total)*100).toFixed(1)}%)`);
  console.log(`  Without Broadcaster: ${data.withoutBroadcaster} (${((data.withoutBroadcaster/data.total)*100).toFixed(1)}%)`);

  // Show breakdown by round (sorted)
  const rounds = Object.entries(data.byRound).sort((a, b) => {
    const aNum = parseInt(a[0]) || 999;
    const bNum = parseInt(b[0]) || 999;
    return aNum - bNum;
  });

  if (rounds.length > 0) {
    console.log(`  By Round:`);
    rounds.forEach(([round, roundData]) => {
      const pct = ((roundData.withBroadcaster/roundData.total)*100).toFixed(0);
      console.log(`    Round ${round.padEnd(15)}: ${roundData.total.toString().padStart(3)} fixtures, ${roundData.withBroadcaster.toString().padStart(3)} with broadcaster (${pct}%)`);
    });
  }

  grandTotal += data.total;
  grandWithBroadcaster += data.withBroadcaster;
});

console.log(`\n${'='.repeat(80)}`);
console.log(`\nGRAND TOTAL:`);
console.log(`  Total Fixtures: ${grandTotal}`);
console.log(`  With Broadcaster: ${grandWithBroadcaster} (${((grandWithBroadcaster/grandTotal)*100).toFixed(1)}%)`);
console.log(`  Without Broadcaster: ${grandTotal - grandWithBroadcaster} (${(((grandTotal - grandWithBroadcaster)/grandTotal)*100).toFixed(1)}%)`);
