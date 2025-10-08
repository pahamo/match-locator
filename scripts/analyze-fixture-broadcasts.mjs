#!/usr/bin/env node
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const FIXTURE_ID = 6057;

console.log(`🔍 Fixture ${FIXTURE_ID} - Broadcast Analysis\n`);

const { data: broadcasts } = await supabase
  .from('broadcasts')
  .select('id, channel_name, provider_id, country_code, sportmonks_tv_station_id')
  .eq('fixture_id', FIXTURE_ID)
  .order('provider_id');

console.log(`Found ${broadcasts?.length || 0} broadcast records:\n`);

// Group by provider
const byProvider = {};
broadcasts?.forEach(b => {
  const pid = b.provider_id || 'unmapped';
  if (!byProvider[pid]) byProvider[pid] = [];
  byProvider[pid].push(b);
});

Object.entries(byProvider).forEach(([providerId, items]) => {
  const providerName = providerId === '1' ? 'Sky Sports' :
                      providerId === '2' ? 'TNT Sports' :
                      providerId === '3' ? 'BBC' :
                      providerId === '4' ? 'Amazon Prime' : 'Unmapped';

  console.log(`${providerName} (Provider ID: ${providerId}) - ${items.length} channels:`);
  items.forEach(b => {
    console.log(`   - ${b.channel_name}`);
  });
  console.log('');
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('INTERPRETATION:');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Multiple channels from SAME provider = Different delivery methods');
console.log('  Example: Sky Go, Sky Ultra HD, Sky+ = All showing SAME content\n');

console.log('Multiple PROVIDERS = Potential problem (PL games are exclusive)\n');

const uniqueProviders = Object.keys(byProvider).filter(p => p !== 'unmapped');
console.log(`Unique providers for this fixture: ${uniqueProviders.length}`);
uniqueProviders.forEach(pid => {
  const name = pid === '1' ? 'Sky Sports' :
               pid === '2' ? 'TNT Sports' :
               pid === '3' ? 'BBC' :
               pid === '4' ? 'Amazon Prime' : pid;
  console.log(`   - Provider ${pid}: ${name}`);
});

if (uniqueProviders.length > 1) {
  console.log('\n⚠️  WARNING: Multiple providers detected!');
  console.log('   Premier League games should have only ONE broadcaster.');
  console.log('   Either:');
  console.log('   1. Our UK filtering is wrong (international channels getting through)');
  console.log('   2. Our provider mapping is wrong');
  console.log('   3. Match was actually on multiple platforms (rare)');
}
