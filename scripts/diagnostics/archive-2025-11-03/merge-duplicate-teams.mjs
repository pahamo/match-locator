#!/usr/bin/env node

/**
 * Merge duplicate teams and migrate fixtures to canonical team IDs
 *
 * This script fixes the issue where fixtures are assigned to duplicate team records
 * instead of the canonical team records with the correct slugs.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Map of canonical slug => duplicate team IDs to merge
const MERGES = {
  'bournemouth': { keepId: 20, deleteId: 306 },
  'brighton': { keepId: 17, deleteId: 384 },
  'man-city': { keepId: 7, deleteId: 279 },
  'man-united': { keepId: 8, deleteId: 225 },
  'forest': { keepId: 15, deleteId: 365 },
  'tottenham': { keepId: 11, deleteId: 214 },
  'wolves': { keepId: 12, deleteId: 302 }
};

async function mergeDuplicateTeams() {
  console.log('🔄 Merging duplicate teams and migrating fixtures...\n');

  for (const [slug, { keepId, deleteId }] of Object.entries(MERGES)) {
    console.log(`📋 Processing ${slug}...`);
    console.log(`   Canonical team ID: ${keepId}`);
    console.log(`   Duplicate team ID: ${deleteId}`);

    // 1. Update fixtures where duplicate is home team
    const { data: homeFixtures, error: homeError } = await supabase
      .from('fixtures')
      .update({ home_team_id: keepId })
      .eq('home_team_id', deleteId)
      .select('id');

    if (homeError) {
      console.error(`   ❌ Error updating home fixtures:`, homeError.message);
    } else {
      console.log(`   ✅ Updated ${homeFixtures?.length || 0} fixtures (home team)`);
    }

    // 2. Update fixtures where duplicate is away team
    const { data: awayFixtures, error: awayError } = await supabase
      .from('fixtures')
      .update({ away_team_id: keepId })
      .eq('away_team_id', deleteId)
      .select('id');

    if (awayError) {
      console.error(`   ❌ Error updating away fixtures:`, awayError.message);
    } else {
      console.log(`   ✅ Updated ${awayFixtures?.length || 0} fixtures (away team)`);
    }

    // 3. Verify canonical team has fixtures now
    const { count } = await supabase
      .from('fixtures')
      .select('*', { count: 'exact', head: true })
      .or(`home_team_id.eq.${keepId},away_team_id.eq.${keepId}`);

    console.log(`   ✅ Canonical team now has ${count || 0} fixtures`);

    // 4. Delete duplicate team
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', deleteId);

    if (deleteError) {
      console.error(`   ⚠️  Could not delete duplicate team:`, deleteError.message);
    } else {
      console.log(`   ✅ Deleted duplicate team`);
    }

    console.log('');
  }

  console.log('='.repeat(60));
  console.log('✨ Merge complete! Verifying results...\n');

  // Verify all canonical teams now have fixtures
  for (const [slug, { keepId }] of Object.entries(MERGES)) {
    const { data: team } = await supabase
      .from('teams')
      .select('name')
      .eq('id', keepId)
      .single();

    const { count } = await supabase
      .from('fixtures')
      .select('*', { count: 'exact', head: true })
      .or(`home_team_id.eq.${keepId},away_team_id.eq.${keepId}`);

    console.log(`${team?.name.padEnd(30)} | Fixtures: ${count || 0}`);
  }

  console.log('\n✅ All teams should now show fixtures on their pages!');
}

mergeDuplicateTeams().catch(console.error);
