import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  console.log('Checking broadcast/TV station data by country...\n');

  // Check broadcasts table structure
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('*')
    .limit(3);

  console.log('Sample broadcasts:');
  console.log(JSON.stringify(broadcasts, null, 2));

  // Check if there's country information
  const { data: withCountry } = await supabase
    .from('broadcasts')
    .select('fixture_id, channel_name, country_code')
    .not('country_code', 'is', null)
    .limit(10);

  console.log('\n\nBroadcasts with country codes (sample):');
  console.log(JSON.stringify(withCountry, null, 2));

  // Get all unique countries
  const { data: allBroadcasts } = await supabase
    .from('broadcasts')
    .select('country_code');

  const countryCounts = {};
  allBroadcasts?.forEach(b => {
    if (b.country_code) {
      countryCounts[b.country_code] = (countryCounts[b.country_code] || 0) + 1;
    }
  });

  console.log('\n\nBroadcasts by country:');
  Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([code, count]) => {
      console.log(`${code}: ${count} broadcasts`);
    });

  console.log(`\nTotal unique countries: ${Object.keys(countryCounts).length}`);
}

main();
