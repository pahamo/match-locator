import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const teamIdMapping = {
  'bournemouth': 52,      // AFC Bournemouth
  'brighton': 78,         // Brighton & Hove Albion
  'man-city': 9,          // Manchester City
  'man-united': 14,       // Manchester United
  'forest': 63,           // Nottingham Forest
  'tottenham': 6,         // Tottenham Hotspur
  'wolves': 29            // Wolverhampton Wanderers
};

async function updateTeamIds() {
  console.log('🔄 Updating Sportmonks team IDs...\n');

  for (const [slug, sportmonksId] of Object.entries(teamIdMapping)) {
    const { data, error } = await supabase
      .from('teams')
      .update({ sportmonks_team_id: sportmonksId })
      .eq('slug', slug)
      .select();

    if (error) {
      console.error(`❌ Error updating ${slug}:`, error);
    } else if (data && data.length > 0) {
      console.log(`✅ Updated ${slug}: sportmonks_team_id = ${sportmonksId} (${data[0].name})`);
    } else {
      console.log(`⚠️  No team found with slug: ${slug}`);
    }
  }

  console.log('\n✨ Done! Now you can sync fixtures for these teams.');
}

updateTeamIds().catch(console.error);
