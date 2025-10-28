#!/usr/bin/env node

/**
 * Enable Carabao Cup Competition
 * Sets the Carabao Cup to visible and ensures slug is set correctly
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

async function enableCarabaoCup() {
  console.log('🏆 Enabling Carabao Cup competition...\n');

  // Check current state
  const { data: currentData, error: checkError } = await supabase
    .from('competitions')
    .select('id, name, slug, is_active')
    .eq('id', 4)
    .single();

  if (checkError) {
    console.error('Error checking Carabao Cup:', checkError);
    process.exit(1);
  }

  console.log('Current state:', currentData);

  // Update to enable
  const { data, error } = await supabase
    .from('competitions')
    .update({
      slug: 'carabao-cup',
      is_active: true
    })
    .eq('id', 4)
    .select();

  if (error) {
    console.error('Error updating Carabao Cup:', error);
    process.exit(1);
  }

  console.log('\n✅ Carabao Cup enabled successfully!');
  console.log('Updated data:', data[0]);

  // Verify the mapping
  const { data: mapping, error: mappingError } = await supabase
    .from('api_competition_mapping')
    .select('*')
    .eq('our_competition_id', 4)
    .single();

  if (mappingError) {
    console.error('Error checking mapping:', mappingError);
  } else {
    console.log('\n📊 SportMonks mapping:', mapping);
  }
}

enableCarabaoCup();
