import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkFixture() {
  console.log('🔍 Checking fixture 6057...\n');

  // Check what the view returns
  const { data: viewData } = await supabase
    .from('fixtures_with_teams')
    .select('id, home_team, away_team, broadcaster, broadcaster_id')
    .eq('id', 6057)
    .single();

  console.log('View returns:');
  console.log(`  Broadcaster: ${viewData.broadcaster}`);
  console.log(`  Broadcaster ID: ${viewData.broadcaster_id}`);
  console.log('');

  // Check ALL broadcasts for this fixture
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('id, fixture_id, provider_id, country_code')
    .eq('fixture_id', 6057)
    .order('id', { ascending: true });

  console.log('All broadcasts in database:');
  broadcasts.forEach(b => {
    console.log(`  Broadcast ID ${b.id}: provider_id=${b.provider_id}, country=${b.country_code}`);
  });
  console.log('');

  // Get provider names
  const providerIds = broadcasts.map(b => b.provider_id).filter(Boolean);
  const { data: providers } = await supabase
    .from('providers')
    .select('id, name')
    .in('id', providerIds);

  const providerMap = new Map(providers.map(p => [p.id, p.name]));

  console.log('Broadcasts with provider names:');
  broadcasts.forEach(b => {
    const providerName = b.provider_id ? providerMap.get(b.provider_id) : 'NULL';
    console.log(`  ${providerName} (ID ${b.provider_id}) - ${b.country_code}`);
  });
  console.log('');

  console.log('Expected: TNT Sports');
  console.log(`Actual from view: ${viewData.broadcaster}`);
}

checkFixture();
