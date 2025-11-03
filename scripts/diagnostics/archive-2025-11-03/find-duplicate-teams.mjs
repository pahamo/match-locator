import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findDuplicates() {
  console.log('🔍 Finding duplicate teams for the 7 problem teams...\n');

  const targetSlugs = ['bournemouth', 'brighton', 'man-city', 'man-united', 'forest', 'tottenham', 'wolves'];

  for (const slug of targetSlugs) {
    // Get the canonical team (the one we want to keep)
    const { data: canonical } = await supabase
      .from('teams')
      .select('id, name, slug, sportmonks_team_id')
      .eq('slug', slug)
      .single();

    if (!canonical) {
      console.log(`⚠️  No team found for slug: ${slug}\n`);
      continue;
    }

    // Find all teams with the same Sportmonks ID
    const { data: duplicates } = await supabase
      .from('teams')
      .select('id, name, slug, sportmonks_team_id')
      .eq('sportmonks_team_id', canonical.sportmonks_team_id);

    if (duplicates && duplicates.length > 1) {
      console.log(`🔴 DUPLICATES for ${slug}:`);
      duplicates.forEach(team => {
        const isCanonical = team.id === canonical.id;
        console.log(`   ${isCanonical ? '✅ KEEP' : '❌ DELETE'}: ID ${team.id}, "${team.name}", slug: "${team.slug}"`);
      });

      // Check fixture counts for each
      for (const team of duplicates) {
        const { count } = await supabase
          .from('fixtures')
          .select('*', { count: 'exact', head: true })
          .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`);

        console.log(`      └─ Team ID ${team.id} has ${count || 0} fixtures`);
      }

      console.log('');
    } else {
      console.log(`✅ ${slug}: No duplicates found\n`);
    }
  }
}

findDuplicates().catch(console.error);
