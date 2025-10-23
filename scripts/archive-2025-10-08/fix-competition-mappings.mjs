#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('🔧 Fixing Competition Mappings\n');
console.log('='.repeat(80));

// Correct Sports Monks mappings
const correctMappings = [
  { ourId: 1, smId: 8, smName: 'Premier League' },
  { ourId: 2, smId: 2, smName: 'Champions League' },
  { ourId: 3, smId: 82, smName: 'Bundesliga' },
  { ourId: 4, smId: 564, smName: 'La Liga' },
  { ourId: 5, smId: 384, smName: 'Serie A' },
  { ourId: 6, smId: 301, smName: 'Ligue 1' },
  { ourId: 7, smId: 462, smName: 'Liga Portugal' },
  { ourId: 8, smId: 72, smName: 'Eredivisie' },
  { ourId: 9, smId: 9, smName: 'Championship' },
  { ourId: 11, smId: 5, smName: 'Europa League' },
];

// Update competition mappings
console.log('\n🔗 Updating competition mappings...\n');

// Delete all existing mappings
await supabase.from('api_competition_mapping').delete().neq('our_competition_id', 0);
console.log('  Cleared existing mappings');

// Insert correct mappings
for (const mapping of correctMappings) {
  const { error } = await supabase
    .from('api_competition_mapping')
    .insert({
      our_competition_id: mapping.ourId,
      sportmonks_league_id: mapping.smId,
      sportmonks_league_name: mapping.smName,
      is_active: true
    });
  
  if (error) {
    console.log(`  ❌ Error creating mapping ${mapping.ourId}:`, error.message);
  } else {
    console.log(`  ✅ Competition ${mapping.ourId} → Sports Monks ${mapping.smId} (${mapping.smName})`);
  }
}

// Remove old API IDs from competitions
console.log('\n\n🧹 Removing old API IDs from competitions...\n');

const { error: updateError } = await supabase
  .from('competitions')
  .update({ 
    footballdata_id: null,
    external_id: null,
    external_code: null
  })
  .or('footballdata_id.not.is.null,external_id.not.is.null');

if (updateError) {
  console.log(`  ❌ Error:`, updateError.message);
} else {
  console.log(`  ✅ Removed old API IDs`);
}

console.log('\n' + '='.repeat(80));
console.log('\n✅ Mappings updated!');
console.log('\nℹ️  Note: Incorrectly mapped fixtures were already deleted in previous step');
