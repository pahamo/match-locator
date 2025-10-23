import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  console.log('Checking Europa League configuration...\n');

  // Check all competitions
  const { data, error } = await supabase
    .from('competitions')
    .select('id, name, slug, is_active, is_production_visible')
    .order('id');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('All competitions:');
  data.forEach(c => {
    const visible = c.is_production_visible ? '✅ VIS' : '❌ HID';
    const active = c.is_active ? 'ACT' : 'INA';
    console.log(`${visible} ${active} | ID ${c.id}: ${c.name} (${c.slug})`);
  });

  // Check Europa League specifically
  const europa = data.find(c => c.id === 11 || c.slug === 'europa-league');
  if (europa) {
    console.log('\n📌 Europa League Status:');
    console.log(JSON.stringify(europa, null, 2));

    if (!europa.is_production_visible) {
      console.log('\n⚠️  Europa League is HIDDEN from production');
      console.log('To enable it, run:');
      console.log('UPDATE competitions SET is_production_visible = true WHERE id = 11;');
    } else {
      console.log('\n✅ Europa League is visible in production');
    }
  } else {
    console.log('\n❌ Europa League NOT found in database');
    console.log('Need to insert it first.');
  }
}

main();
