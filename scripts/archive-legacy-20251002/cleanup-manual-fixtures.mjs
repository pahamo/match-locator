#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

console.log('🧹 Cleaning Up Manual Fixtures\n');
console.log('='.repeat(80));

const now = new Date().toISOString();

// First, get count
const { count: futureCount } = await supabase
  .from('fixtures')
  .select('*', { count: 'exact', head: true })
  .eq('data_source', 'manual')
  .gte('utc_kickoff', now);

// Then get ALL future fixtures (paginate to bypass 1000 row limit)
let futureManual = [];
let page = 0;
const pageSize = 1000;

while (true) {
  const { data: pageFuture } = await supabase
    .from('fixtures')
    .select('id, utc_kickoff, competitions(name)')
    .eq('data_source', 'manual')
    .gte('utc_kickoff', now)
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (!pageFuture || pageFuture.length === 0) break;
  futureManual = futureManual.concat(pageFuture);
  if (pageFuture.length < pageSize) break;  // Last page
  page++;
}

console.log(`Fetched ${futureManual.length} future manual fixtures across ${page + 1} page(s)`);

console.log(`\n📅 Future Manual Fixtures to Delete: ${futureCount}\n`);

if (futureCount > 0) {
  // Group by competition to show what's being deleted
  const byComp = {};
  futureManual.forEach(f => {
    const comp = f.competitions?.name || 'Unknown';
    byComp[comp] = (byComp[comp] || 0) + 1;
  });

  Object.entries(byComp)
    .sort((a, b) => b[1] - a[1])
    .forEach(([comp, count]) => {
      console.log(`  ${comp.padEnd(30)} ${count} fixtures`);
    });

  console.log('\n' + '='.repeat(80));
  console.log('\n⚠️  This will DELETE future manual fixtures.');
  console.log('   Sports Monks will provide these fixtures going forward.\n');
  console.log('   Past manual fixtures will be kept as historical archive.\n');

  // Delete broadcasts for future manual fixtures first (foreign key constraint)
  console.log('🗑️  Step 1: Deleting broadcasts for future manual fixtures...\n');

  const futureFixtureIds = futureManual.map(f => f.id);

  // Batch delete broadcasts (IN clause has ~1000 item limit)
  const batchSize = 500;
  let totalBroadcastsDeleted = 0;

  for (let i = 0; i < futureFixtureIds.length; i += batchSize) {
    const batch = futureFixtureIds.slice(i, i + batchSize);
    const { error: batchError, count: batchDeleted } = await supabase
      .from('broadcasts')
      .delete({ count: 'exact' })
      .in('fixture_id', batch);

    if (batchError) {
      console.error(`❌ Error deleting broadcasts batch ${i / batchSize + 1}:`, batchError);
      process.exit(1);
    }

    totalBroadcastsDeleted += batchDeleted || 0;
    console.log(`   Batch ${Math.floor(i / batchSize) + 1}: Deleted ${batchDeleted || 0} broadcasts`);
  }

  console.log(`\n✅ Total broadcasts deleted: ${totalBroadcastsDeleted}\n`);

  // Now delete future manual fixtures in batches
  console.log('🗑️  Step 2: Deleting future manual fixtures...\n');

  let totalFixturesDeleted = 0;

  for (let i = 0; i < futureFixtureIds.length; i += batchSize) {
    const batch = futureFixtureIds.slice(i, i + batchSize);
    const { error: batchError, count: batchDeleted } = await supabase
      .from('fixtures')
      .delete({ count: 'exact' })
      .in('id', batch);

    if (batchError) {
      console.error(`❌ Error deleting fixtures batch ${i / batchSize + 1}:`, batchError);
      process.exit(1);
    }

    totalFixturesDeleted += batchDeleted || 0;
    console.log(`   Batch ${Math.floor(i / batchSize) + 1}: Deleted ${batchDeleted || 0} fixtures`);
  }

  console.log(`\n✅ Successfully deleted ${totalFixturesDeleted} future manual fixtures\n`);

  // Show final counts
  const { count: remainingManual } = await supabase
    .from('fixtures')
    .select('*', { count: 'exact', head: true })
    .eq('data_source', 'manual');

  const { count: sportmonks } = await supabase
    .from('fixtures')
    .select('*', { count: 'exact', head: true })
    .eq('data_source', 'sportmonks');

  const { count: total } = await supabase
    .from('fixtures')
    .select('*', { count: 'exact', head: true });

  console.log('='.repeat(80));
  console.log('\n📊 Final Fixture Counts:\n');
  console.log(`  🤖 Sports Monks:    ${sportmonks || 0}`);
  console.log(`  📜 Manual (archive): ${remainingManual || 0} (past fixtures only)`);
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  📊 Total:            ${total || 0}`);
  console.log('\n✅ Cleanup complete! Sports Monks is now the primary data source.\n');
} else {
  console.log('\n✅ No future manual fixtures found. Database is clean!\n');
}
