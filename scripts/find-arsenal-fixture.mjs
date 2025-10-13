#!/usr/bin/env node
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Find all fixtures on 2025-09-13
const { data: fixtures } = await supabase
  .from('fixtures')
  .select('id, competition_id, home_team_id, away_team_id, utc_kickoff, sportmonks_fixture_id')
  .gte('utc_kickoff', '2025-09-13T00:00:00Z')
  .lte('utc_kickoff', '2025-09-13T23:59:59Z')
  .eq('competition_id', 1);  // Premier League only

console.log('Premier League fixtures on 2025-09-13:\n');
for (const f of fixtures || []) {
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('channel_name, country_code')
    .eq('fixture_id', f.id);

  console.log(`Fixture ${f.id} (SportMonks ${f.sportmonks_fixture_id}):`);
  console.log(`  home_team_id: ${f.home_team_id}, away_team_id: ${f.away_team_id}`);
  console.log(`  Broadcasts: ${broadcasts?.length || 0}`);
  if (broadcasts?.length) {
    broadcasts.forEach(b => console.log(`    - ${b.channel_name} (${b.country_code})`));
  }
  console.log();
}
