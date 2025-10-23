#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const { data: fixtures } = await supabase
  .from('fixtures')
  .select(`
    id,
    competition_id,
    sportmonks_fixture_id,
    utc_kickoff,
    data_source,
    competitions(id, name)
  `)
  .eq('data_source', 'sportmonks')
  .order('utc_kickoff');

console.log(`\nTotal Sports Monks fixtures: ${fixtures?.length}\n`);

const byComp = {};
fixtures?.forEach(f => {
  const compId = f.competition_id;
  const compName = f.competitions?.name || 'Unknown';
  if (!byComp[compId]) {
    byComp[compId] = { name: compName, count: 0, fixtures: [] };
  }
  byComp[compId].count++;
  byComp[compId].fixtures.push({
    kickoff: f.utc_kickoff,
    smId: f.sportmonks_fixture_id
  });
});

Object.entries(byComp)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([id, data]) => {
    console.log(`Competition ${id}: ${data.name} - ${data.count} fixtures`);
    data.fixtures.slice(0, 3).forEach(f => {
      console.log(`  - ${f.kickoff} (SM: ${f.smId})`);
    });
    console.log('');
  });
