#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const { data: fixtures, error } = await supabase
  .from('fixtures')
  .select('*')
  .eq('competition_id', 1)
  .limit(1);

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

if (!fixtures || fixtures.length === 0) {
  console.log('No fixtures found');
  process.exit(0);
}

console.log('\n📋 Fixtures table schema (column names):\n');
console.log(Object.keys(fixtures[0]).join(', '));
console.log('\n');
