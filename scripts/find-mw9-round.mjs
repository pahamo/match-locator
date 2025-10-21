import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get PL league ID from mapping
const { data: mapping } = await supabase
  .from('api_competition_mapping')
  .select('sportmonks_league_id')
  .eq('our_competition_id', 1)
  .single();

console.log('Premier League SportMonks ID:', mapping.sportmonks_league_id);

const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

// Get fixtures for Oct 24-26
const dates = ['2025-10-24', '2025-10-25', '2025-10-26'];

for (const date of dates) {
  const response = await fetch(
    `https://api.sportmonks.com/v3/football/fixtures/date/${date}?api_token=${SPORTMONKS_TOKEN}&include=round,participants&leagues=${mapping.sportmonks_league_id}`
  );
  const json = await response.json();

  console.log(`\n${date}: ${json.data?.length || 0} fixtures`);

  if (json.data && json.data.length > 0) {
    json.data.forEach(f => {
      const home = f.participants?.find(p => p.meta?.location === 'home');
      const away = f.participants?.find(p => p.meta?.location === 'away');
      console.log(`  Round ${f.round?.name}: ${home?.name} vs ${away?.name} (ID: ${f.id})`);
    });
  }
}
