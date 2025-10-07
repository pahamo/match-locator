import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN || process.env.REACT_APP_SPORTMONKS_TOKEN;

// Get fixtures with NULL matchday
const { data: nullFixtures } = await supabase
  .from('fixtures')
  .select('id, sportmonks_fixture_id, utc_kickoff')
  .eq('competition_id', 1)
  .is('matchday', null)
  .not('sportmonks_fixture_id', 'is', null)
  .gte('utc_kickoff', '2025-10-01')
  .lte('utc_kickoff', '2025-10-31');

console.log(`Found ${nullFixtures.length} fixtures with NULL matchday`);

for (const fixture of nullFixtures) {
  try {
    // Fetch from Sports Monks API
    const url = `https://api.sportmonks.com/v3/football/fixtures/${fixture.sportmonks_fixture_id}?api_token=${SPORTMONKS_TOKEN}&include=round`;
    const response = await fetch(url);
    const data = await response.json();
    
    const matchday = data.data?.round?.name ? parseInt(data.data.round.name, 10) : null;
    
    if (matchday) {
      const { error } = await supabase
        .from('fixtures')
        .update({ matchday })
        .eq('id', fixture.id);
      
      if (!error) {
        console.log(`✅ Updated fixture ${fixture.id} to matchday ${matchday}`);
      } else {
        console.log(`❌ Error updating fixture ${fixture.id}:`, error);
      }
    } else {
      console.log(`⚠️  No round data for fixture ${fixture.id}`);
    }
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 400));
  } catch (err) {
    console.log(`❌ Error fetching fixture ${fixture.id}:`, err.message);
  }
}

console.log('\n✅ Done!');
