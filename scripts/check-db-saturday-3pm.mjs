import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const checkDatabase = async () => {
  console.log('🔍 Checking database for 3pm Saturday Premier League fixtures...\n');

  // Get all Premier League fixtures from this season
  const { data: fixtures, error } = await supabase
    .from('fixtures')
    .select('id, utc_kickoff, home_team_id, away_team_id, competition_id')
    .eq('competition_id', 1)
    .gte('utc_kickoff', '2025-08-01')
    .order('utc_kickoff');

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Filter for 3pm Saturday UK time
  const saturdayFixtures = fixtures.filter(f => {
    const kickoff = new Date(f.utc_kickoff);
    const ukTime = new Date(kickoff.toLocaleString('en-US', { timeZone: 'Europe/London' }));
    const dayOfWeek = ukTime.getDay(); // 6 = Saturday
    const hour = ukTime.getHours();

    return dayOfWeek === 6 && hour === 15;
  });

  console.log(`📊 Found ${saturdayFixtures.length} 3pm Saturday fixtures\n`);

  if (saturdayFixtures.length > 0) {
    // Get detailed data for first 5
    for (const fixture of saturdayFixtures.slice(0, 5)) {
      // Get from fixtures_with_teams view
      const { data: viewData } = await supabase
        .from('fixtures_with_teams')
        .select('*')
        .eq('id', fixture.id)
        .single();

      // Get all broadcasts (not filtered)
      const { data: broadcasts } = await supabase
        .from('broadcasts')
        .select('*')
        .eq('fixture_id', fixture.id);

      console.log(`\n━━━ Fixture ${fixture.id} ━━━`);
      console.log(`📅 Kickoff (UTC): ${fixture.utc_kickoff}`);
      console.log(`🏟️  Match: ${viewData?.home_team} vs ${viewData?.away_team}`);
      console.log(`📺 Broadcaster (from view): ${viewData?.broadcaster || 'NULL'}`);
      console.log(`📡 Raw broadcasts in DB: ${broadcasts?.length || 0}`);

      if (broadcasts && broadcasts.length > 0) {
        broadcasts.forEach(b => {
          console.log(`   - ${b.channel_name} (${b.country_code}, Type: ${b.broadcaster_type})`);
        });
      }
    }
  }
};

checkDatabase();
