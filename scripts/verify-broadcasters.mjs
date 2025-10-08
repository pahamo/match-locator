#!/usr/bin/env node
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function verify() {
  // Count by provider
  const { data } = await supabase.from('broadcasts').select('provider_id, channel_name');

  const byProvider = {};
  data.forEach(b => {
    const pid = b.provider_id || 'unmapped';
    if (!byProvider[pid]) byProvider[pid] = new Set();
    byProvider[pid].add(b.channel_name);
  });

  console.log('📊 Broadcasts by Provider:');
  console.log('   Provider 1 (Sky Sports):', byProvider['1']?.size || 0, 'unique channels');
  console.log('   Provider 2 (TNT Sports):', byProvider['2']?.size || 0, 'unique channels');
  console.log('   Provider 3 (BBC):', byProvider['3']?.size || 0, 'unique channels');
  console.log('   Provider 4 (Amazon):', byProvider['4']?.size || 0, 'unique channels');
  console.log('   Unmapped:', byProvider['unmapped']?.size || 0, 'unique channels');

  console.log('\n📺 Sky Sports channels:');
  Array.from(byProvider['1'] || []).slice(0, 5).forEach(c => console.log('   -', c));

  console.log('\n📺 TNT Sports channels:');
  Array.from(byProvider['2'] || []).slice(0, 5).forEach(c => console.log('   -', c));

  console.log('\n📺 Amazon channels:');
  Array.from(byProvider['4'] || []).slice(0, 5).forEach(c => console.log('   -', c));
}

verify();
