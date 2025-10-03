#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('🔍 Checking fixture 3986...\n');

const { data: fixture } = await supabase
  .from('fixtures')
  .select('id, utc_kickoff, data_source, competitions(name)')
  .eq('id', 3986)
  .single();

console.log('Fixture:', fixture);

const { data: broadcasts } = await supabase
  .from('broadcasts')
  .select('id, fixture_id, provider_id, channel_name, data_source')
  .eq('fixture_id', 3986);

console.log('\nBroadcasts:', broadcasts);

// Check all broadcasts for future manual fixtures
const now = new Date().toISOString();
const { data: futureFixtures } = await supabase
  .from('fixtures')
  .select('id')
  .eq('data_source', 'manual')
  .gte('utc_kickoff', now)
  .limit(5000);

const futureIds = futureFixtures.map(f => f.id);
console.log(`\nTotal future manual fixture IDs: ${futureIds.length}`);

// Check how many broadcasts reference these fixtures
const { count: broadcastCount } = await supabase
  .from('broadcasts')
  .select('*', { count: 'exact', head: true })
  .in('fixture_id', futureIds);

console.log(`Broadcasts referencing future manual fixtures: ${broadcastCount}`);
