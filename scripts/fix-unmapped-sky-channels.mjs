#!/usr/bin/env node
/**
 * Fix broadcasts table to allow multiple channels from same provider
 *
 * Problem 1: Old unique constraint on (fixture_id, provider_id) prevented
 * storing multiple channels from same provider (e.g., Sky Go AND Sky Ultra HD)
 *
 * Problem 2: Channels like "Sky Ultra HD", "Sky+", "Skylink" were not mapped
 * to provider_id = 1 (Sky Sports) because the old mapping function only
 * caught "Sky Sports" and "Sky Go".
 *
 * Solution:
 * 1. Drop old unique constraint on (fixture_id, provider_id)
 * 2. Add new unique constraint on (fixture_id, sportmonks_tv_station_id)
 * 3. Update unmapped Sky channels to provider_id = 1
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('🔧 Fixing broadcasts table schema and unmapped Sky channels...\n');

// Step 1: Show what needs fixing
const { data: unmappedSky, error: queryError } = await supabase
  .from('broadcasts')
  .select('channel_name, fixture_id')
  .is('provider_id', null)
  .ilike('channel_name', '%sky%');

if (queryError) {
  console.error('❌ Error querying unmapped Sky channels:', queryError);
  process.exit(1);
}

if (!unmappedSky || unmappedSky.length === 0) {
  console.log('✅ No unmapped Sky channels found. Everything is already mapped correctly!');
  process.exit(0);
}

console.log(`Found ${unmappedSky.length} unmapped Sky channel broadcasts:\n`);

// Group by channel name to show summary
const channelCounts = {};
unmappedSky.forEach(b => {
  channelCounts[b.channel_name] = (channelCounts[b.channel_name] || 0) + 1;
});

Object.entries(channelCounts).forEach(([name, count]) => {
  console.log(`  - ${name}: ${count} broadcasts`);
});

console.log('\n⚠️  IMPORTANT: This script requires running SQL migration first!\n');
console.log('📋 INSTRUCTIONS:');
console.log('   1. Open Supabase Dashboard > SQL Editor');
console.log('   2. Run the SQL from: scripts/fix-unmapped-sky-channels.sql');
console.log('   3. This will:');
console.log('      - Drop old unique constraint on (fixture_id, provider_id)');
console.log('      - Add new constraint on (fixture_id, sportmonks_tv_station_id)');
console.log('      - Update unmapped Sky channels to provider_id = 1\n');

console.log('💡 The SQL file contains all necessary steps in the correct order.\n');
console.log('   File path: scripts/fix-unmapped-sky-channels.sql\n');

const sqlPath = join(__dirname, 'fix-unmapped-sky-channels.sql');
console.log('📄 SQL file contents:\n');
console.log('─'.repeat(70));
const sqlContent = readFileSync(sqlPath, 'utf-8');
console.log(sqlContent);
console.log('─'.repeat(70));
console.log('\n✅ Copy the SQL above and run it in Supabase SQL Editor.\n');
