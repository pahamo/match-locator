#!/usr/bin/env node

/**
 * List all competitions and their mappings
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listCompetitions() {
  console.log('📊 Listing all competitions...\n');

  const { data: competitions, error } = await supabase
    .from('competitions')
    .select('id, name, slug, is_active')
    .order('id');

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('Competitions:');
  console.table(competitions);

  // Get mappings
  const { data: mappings, error: mapError } = await supabase
    .from('api_competition_mapping')
    .select('*')
    .order('our_competition_id');

  if (mapError) {
    console.error('Mapping error:', mapError);
  } else {
    console.log('\n📋 SportMonks Mappings:');
    console.table(mappings);
  }

  // Look for Carabao Cup specifically
  const carabao = mappings?.find(m => m.sportmonks_league_id === 27 || m.sportmonks_league_name?.includes('Carabao'));
  if (carabao) {
    console.log('\n🏆 Found Carabao Cup mapping:', carabao);
  } else {
    console.log('\n❌ No Carabao Cup mapping found');
  }
}

listCompetitions();
