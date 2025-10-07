#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const leagues = [
  { id: 1, name: 'Premier League' },
  { id: 2, name: 'Champions League' },
  { id: 3, name: 'Bundesliga' },
  { id: 4, name: 'La Liga' },
  { id: 5, name: 'Serie A' },
  { id: 6, name: 'Ligue 1' },
  { id: 9, name: 'Championship' },
];

console.log('\n📊 Fixtures Status by League\n');
console.log('─'.repeat(70));

for (const league of leagues) {
  const { data: fixtures } = await supabase
    .from('fixtures')
    .select('data_source')
    .eq('competition_id', league.id);

  const sportmonks = fixtures.filter(f => f.data_source === 'sportmonks').length;
  const manual = fixtures.filter(f => f.data_source === 'manual').length;
  const total = fixtures.length;

  const pct = total > 0 ? Math.round((sportmonks / total) * 100) : 0;
  const status = sportmonks === total ? '✅' : sportmonks > manual ? '⚠️' : '❌';

  console.log(`${status} ${league.name.padEnd(20)} ${sportmonks.toString().padStart(4)} SM / ${manual.toString().padStart(4)} manual / ${total.toString().padStart(4)} total (${pct}%)`);
}

console.log('─'.repeat(70));
console.log();
