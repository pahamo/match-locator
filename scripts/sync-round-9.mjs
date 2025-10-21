import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TOKEN = process.env.SPORTMONKS_TOKEN || 'lNX5lqJtQo2FSsKfM4PvDzhgkS4AkGLkjRtYZWjNmSZvdGHJxxtD0HyHoazs';
const ROUND_9_ID = 372203;
const PL_COMPETITION_ID = 1;

console.log('🔄 Syncing Round 9 fixtures...\n');

// Fetch Round 9 fixtures
const response = await fetch(
  `https://api.sportmonks.com/v3/football/rounds/${ROUND_9_ID}?api_token=${TOKEN}&include=fixtures.participants`
);
const data = await response.json();

if (!data.data || !data.data.fixtures) {
  console.error('❌ Failed to fetch round data');
  process.exit(1);
}

const fixtures = data.data.fixtures;
console.log(`Found ${fixtures.length} fixtures\n`);

let created = 0;
let updated = 0;
let errors = 0;

for (const fixture of fixtures) {
  try {
    const home = fixture.participants?.find(p => p.meta?.location === 'home');
    const away = fixture.participants?.find(p => p.meta?.location === 'away');

    console.log(`${home.name} vs ${away.name} (ID: ${fixture.id})`);

    // Get team IDs
    const { data: homeTeam } = await supabase
      .from('teams')
      .select('id')
      .or(`sportmonks_team_id.eq.${home.id},name.ilike.%${home.name}%`)
      .limit(1)
      .single();

    const { data: awayTeam } = await supabase
      .from('teams')
      .select('id')
      .or(`sportmonks_team_id.eq.${away.id},name.ilike.%${away.name}%`)
      .limit(1)
      .single();

    if (!homeTeam || !awayTeam) {
      console.log(`  ⚠️  Teams not found in database`);
      errors++;
      continue;
    }

    // Check if fixture exists
    const { data: existingFixture } = await supabase
      .from('fixtures')
      .select('id')
      .eq('sportmonks_fixture_id', fixture.id)
      .maybeSingle();

    const fixtureData = {
      utc_kickoff: fixture.starting_at,
      home_team_id: homeTeam.id,
      away_team_id: awayTeam.id,
      competition_id: PL_COMPETITION_ID,
      round: { id: ROUND_9_ID, name: '9' },
      sportmonks_fixture_id: fixture.id,
      data_source: 'sportmonks',
      last_synced_at: new Date().toISOString(),
      sync_status: 'synced'
    };

    if (existingFixture) {
      await supabase
        .from('fixtures')
        .update(fixtureData)
        .eq('id', existingFixture.id);
      console.log(`  ✅ Updated`);
      updated++;
    } else {
      await supabase
        .from('fixtures')
        .insert(fixtureData);
      console.log(`  ✨ Created`);
      created++;
    }

  } catch (error) {
    console.error(`  ❌ Error:`, error.message);
    errors++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`  Created: ${created}`);
console.log(`  Updated: ${updated}`);
console.log(`  Errors: ${errors}`);
