#!/usr/bin/env node

/**
 * Add Carabao Cup Competition
 * Fixes La Liga slug and adds new Carabao Cup entry
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

async function addCarabaoCup() {
  console.log('🏆 Adding Carabao Cup competition...\n');

  // Step 1: Fix La Liga slug back to 'la-liga'
  console.log('Step 1: Fixing La Liga slug...');
  const { error: fixError } = await supabase
    .from('competitions')
    .update({ slug: 'la-liga' })
    .eq('id', 4);

  if (fixError) {
    console.error('Error fixing La Liga:', fixError);
    process.exit(1);
  }
  console.log('✅ La Liga slug fixed\n');

  // Step 2: Check if Carabao Cup already exists (ID 12)
  const { data: existing, error: checkError } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', 12)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking for existing Carabao Cup:', checkError);
    process.exit(1);
  }

  if (existing) {
    console.log('Carabao Cup already exists:', existing);

    // Update it
    const { data: updated, error: updateError } = await supabase
      .from('competitions')
      .update({
        name: 'Carabao Cup',
        slug: 'carabao-cup',
        short_name: 'EFL',
        is_active: true,
        is_production_visible: true
      })
      .eq('id', 12)
      .select();

    if (updateError) {
      console.error('Error updating Carabao Cup:', updateError);
      process.exit(1);
    }

    console.log('✅ Carabao Cup updated:', updated[0]);
  } else {
    // Insert new Carabao Cup entry
    console.log('Step 2: Inserting new Carabao Cup entry...');
    const { data: inserted, error: insertError } = await supabase
      .from('competitions')
      .insert({
        id: 12,
        name: 'Carabao Cup',
        slug: 'carabao-cup',
        short_name: 'EFL',
        season: '2025/26',
        is_active: true,
        is_production_visible: true,
        country: 'England',
        country_code: 'ENG',
        type: 'CUP',
        colors_primary: '#00a650',
        colors_secondary: '#ffffff'
      })
      .select();

    if (insertError) {
      console.error('Error inserting Carabao Cup:', insertError);
      process.exit(1);
    }

    console.log('✅ Carabao Cup created:', inserted[0]);
  }

  // Step 3: Add/update SportMonks mapping
  console.log('\nStep 3: Adding SportMonks mapping...');
  const { data: mapping, error: mappingError } = await supabase
    .from('api_competition_mapping')
    .upsert({
      our_competition_id: 12,
      sportmonks_league_id: 27,
      sportmonks_league_name: 'Carabao Cup',
      is_active: true,
      last_verified_at: new Date().toISOString()
    })
    .select();

  if (mappingError) {
    console.error('Error creating mapping:', mappingError);
    process.exit(1);
  }

  console.log('✅ SportMonks mapping created:', mapping[0]);
  console.log('\n🎉 Carabao Cup successfully integrated!');
}

addCarabaoCup();
