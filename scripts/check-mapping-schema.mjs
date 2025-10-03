#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const { data, error } = await supabase
  .from('api_competition_mapping')
  .select('*')
  .limit(1);

if (data && data.length > 0) {
  console.log('api_competition_mapping columns:', Object.keys(data[0]));
} else {
  console.log('No data found or error:', error);
}

const { data: compData } = await supabase
  .from('competitions')
  .select('*')
  .limit(1);

if (compData && compData.length > 0) {
  console.log('competitions columns:', Object.keys(compData[0]));
}
