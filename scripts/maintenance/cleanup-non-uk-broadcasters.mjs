import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🧹 Cleaning up non-UK broadcasters from database...\n');

// List of non-UK keywords to filter out
const nonUKKeywords = [
  'Germany', 'France', 'Spain', 'Italy', 'Portugal',
  'Netherlands', 'Belgium', 'Austria', 'Switzerland',
  'Poland', 'Turkey', 'Greece', 'Denmark', 'Sweden',
  'Norway', 'Finland', 'Czech', 'Hungary', 'Russia',
  'Ukraine', 'Romania', 'Serbia', 'Croatia', 'Bulgaria',
  'Arabic', 'MENA', 'Asia', 'Africa', 'Latin America'
];

let totalDeleted = 0;

for (const keyword of nonUKKeywords) {
  const { data: broadcasts, error: selectError } = await supabase
    .from('broadcasts')
    .select('id, channel_name, fixture_id')
    .ilike('channel_name', `%${keyword}%`);

  if (selectError) {
    console.error(`Error querying for "${keyword}":`, selectError);
    continue;
  }

  if (broadcasts && broadcasts.length > 0) {
    console.log(`Found ${broadcasts.length} broadcasts with "${keyword}":`);
    broadcasts.forEach(b => {
      console.log(`  - ${b.channel_name} (fixture ${b.fixture_id})`);
    });

    const ids = broadcasts.map(b => b.id);
    const { error: deleteError } = await supabase
      .from('broadcasts')
      .delete()
      .in('id', ids);

    if (deleteError) {
      console.error(`Error deleting broadcasts with "${keyword}":`, deleteError);
    } else {
      console.log(`  ✅ Deleted ${broadcasts.length} broadcasts\n`);
      totalDeleted += broadcasts.length;
    }
  }
}

console.log(`\n🎉 Cleanup complete! Deleted ${totalDeleted} non-UK broadcaster(s)`);
