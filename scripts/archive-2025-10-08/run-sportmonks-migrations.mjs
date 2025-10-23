#!/usr/bin/env node

/**
 * Run Sports Monks Database Migrations
 *
 * Runs all 3 migrations in order:
 * 1. add-sportmonks-metadata.sql
 * 2. sportmonks-league-mapping.sql
 * 3. sportmonks-tv-station-mapping.sql
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔄 Running Sports Monks Database Migrations');
console.log('='.repeat(80));
console.log(`\n📍 Database: ${SUPABASE_URL}\n`);

const migrations = [
  {
    name: 'Add Sports Monks Metadata',
    file: 'database/migrations/add-sportmonks-metadata.sql',
    description: 'Adds API tracking columns to fixtures, teams, broadcasts'
  },
  {
    name: 'Competition Mapping',
    file: 'database/migrations/sportmonks-league-mapping.sql',
    description: 'Creates competition ID mapping table'
  },
  {
    name: 'TV Station Mapping',
    file: 'database/migrations/sportmonks-tv-station-mapping.sql',
    description: 'Creates TV broadcaster mapping table'
  }
];

async function runMigration(migration, index) {
  console.log(`\n${index + 1}. ${migration.name}`);
  console.log(`   📄 ${migration.file}`);
  console.log(`   📝 ${migration.description}`);

  try {
    const sql = readFileSync(migration.file, 'utf8');

    // Split SQL into statements (simple split on ;)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`   🔧 Running ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty statements
      if (!statement || statement.startsWith('--')) continue;

      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

      // If exec_sql function doesn't exist, use direct query
      if (error && error.message.includes('function "exec_sql"')) {
        // Try direct query for simple statements
        if (statement.toUpperCase().startsWith('CREATE') ||
            statement.toUpperCase().startsWith('ALTER') ||
            statement.toUpperCase().startsWith('INSERT') ||
            statement.toUpperCase().startsWith('COMMENT')) {

          // For Supabase, we'll need to use the SQL editor instead
          console.log(`   ⚠️  Statement ${i + 1}/${statements.length}: Cannot execute via API`);
          console.log(`      This migration needs to be run in Supabase SQL Editor`);
          return { success: false, useEditor: true };
        }
      } else if (error) {
        // Ignore certain safe errors
        if (error.message.includes('already exists') ||
            error.message.includes('IF NOT EXISTS')) {
          console.log(`   ✅ Statement ${i + 1}/${statements.length}: Already exists (OK)`);
        } else {
          throw error;
        }
      } else {
        console.log(`   ✅ Statement ${i + 1}/${statements.length}: Success`);
      }
    }

    console.log(`   ✅ Migration complete!`);
    return { success: true };

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  let needsEditor = false;

  for (let i = 0; i < migrations.length; i++) {
    const result = await runMigration(migrations[i], i);

    if (!result.success) {
      if (result.useEditor) {
        needsEditor = true;
      } else {
        console.error(`\n❌ Migration failed: ${migrations[i].name}`);
        process.exit(1);
      }
    }
  }

  if (needsEditor) {
    console.log('\n' + '='.repeat(80));
    console.log('⚠️  MIGRATIONS NEED TO BE RUN IN SUPABASE SQL EDITOR');
    console.log('='.repeat(80));
    console.log('\nSupabase API client cannot execute DDL statements.');
    console.log('Please run the migrations manually:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/nkfuzkrazehjivzmdrvt/sql');
    console.log('2. Copy/paste each file:');
    migrations.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.file}`);
    });
    console.log('3. Click "Run" for each file\n');

    console.log('📋 Quick Copy Commands:');
    migrations.forEach((m, i) => {
      console.log(`\n# Migration ${i + 1}: ${m.name}`);
      console.log(`cat ${m.file} | pbcopy  # Copies to clipboard (Mac)`);
    });

  } else {
    console.log('\n' + '='.repeat(80));
    console.log('✅ All migrations completed successfully!');
    console.log('='.repeat(80));
  }
}

main().catch(console.error);
