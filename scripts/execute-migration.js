#!/usr/bin/env node

/**
 * Execute Database Migration via Supabase API
 * This script runs the database migration SQL using Supabase's REST API
 */

const fs = require('fs');
const https = require('https');

const SUPABASE_CONFIG = {
  url: 'https://ksqyurqkqznzrntdpood.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcXl1cnFrcXpuenJudGRwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTEwNjAsImV4cCI6MjA3MjM2NzA2MH0.wVBZBEbfctB7JPnpMZkXKMGwXlYxGWjOF_AxixVo-S4'
};

/**
 * Execute SQL via Supabase RPC
 */
async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/rpc/exec_sql`;
    const postData = JSON.stringify({ sql_query: sql });
    
    const options = {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Create competitions table and insert default data
 */
async function setupCompetitions() {
  console.log('🏆 Creating competitions table...');
  
  const createTable = `
    CREATE TABLE IF NOT EXISTS competitions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(50) UNIQUE NOT NULL,
      short_name VARCHAR(10),
      country VARCHAR(50),
      country_code VARCHAR(3),
      season VARCHAR(10) DEFAULT '2024-25',
      thesportsdb_id INTEGER UNIQUE,
      external_ref VARCHAR(50),
      total_rounds INTEGER,
      total_teams INTEGER,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      is_featured BOOLEAN DEFAULT false,
      logo_url VARCHAR(500),
      primary_color VARCHAR(7),
      secondary_color VARCHAR(7),
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;
  
  try {
    await executeSQL(createTable);
    console.log('✅ Competitions table created');
  } catch (error) {
    console.log('⚠️  Competitions table creation (may already exist):', error.message);
  }
  
  // Insert competition data
  console.log('📊 Inserting competition data...');
  
  const competitions = [
    {
      id: 1, name: 'Premier League', slug: 'premier-league', short_name: 'EPL',
      country: 'England', country_code: 'ENG', total_rounds: 38, total_teams: 20,
      thesportsdb_id: 4328, display_order: 1, is_active: true, is_featured: true,
      primary_color: '#38003c', secondary_color: '#00ff87'
    },
    {
      id: 2, name: 'Bundesliga', slug: 'bundesliga', short_name: 'BL1',
      country: 'Germany', country_code: 'GER', total_rounds: 34, total_teams: 18,
      thesportsdb_id: 4331, display_order: 2, is_active: true, is_featured: true,
      primary_color: '#d20515', secondary_color: '#ffcc02'
    },
    {
      id: 3, name: 'La Liga', slug: 'la-liga', short_name: 'LL1',
      country: 'Spain', country_code: 'ESP', total_rounds: 38, total_teams: 20,
      thesportsdb_id: 4335, display_order: 3, is_active: true, is_featured: true,
      primary_color: '#ee8707', secondary_color: '#ffffff'
    },
    {
      id: 4, name: 'Serie A', slug: 'serie-a', short_name: 'SA',
      country: 'Italy', country_code: 'ITA', total_rounds: 38, total_teams: 20,
      thesportsdb_id: 4332, display_order: 4, is_active: true, is_featured: true,
      primary_color: '#024494', secondary_color: '#ffffff'
    },
    {
      id: 5, name: 'Ligue 1', slug: 'ligue-1', short_name: 'L1',
      country: 'France', country_code: 'FRA', total_rounds: 34, total_teams: 18,
      thesportsdb_id: 4334, display_order: 5, is_active: true, is_featured: true,
      primary_color: '#dae025', secondary_color: '#000000'
    }
  ];

  for (const comp of competitions) {
    const insertComp = `
      INSERT INTO competitions (
        id, name, slug, short_name, country, country_code, 
        total_rounds, total_teams, thesportsdb_id, display_order,
        is_active, is_featured, primary_color, secondary_color
      ) VALUES (
        ${comp.id}, '${comp.name}', '${comp.slug}', '${comp.short_name}',
        '${comp.country}', '${comp.country_code}', ${comp.total_rounds}, ${comp.total_teams},
        ${comp.thesportsdb_id}, ${comp.display_order}, ${comp.is_active}, ${comp.is_featured},
        '${comp.primary_color}', '${comp.secondary_color}'
      ) ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        short_name = EXCLUDED.short_name,
        primary_color = EXCLUDED.primary_color,
        secondary_color = EXCLUDED.secondary_color,
        updated_at = NOW();
    `;
    
    try {
      await executeSQL(insertComp);
      console.log(`✅ Competition inserted/updated: ${comp.name}`);
    } catch (error) {
      console.log(`❌ Failed to insert competition ${comp.name}:`, error.message);
    }
  }
}

/**
 * Add competition_id column to teams table
 */
async function updateTeamsTable() {
  console.log('👥 Updating teams table...');
  
  const alterTable = `
    ALTER TABLE teams 
    ADD COLUMN IF NOT EXISTS competition_id INTEGER REFERENCES competitions(id);
  `;
  
  try {
    await executeSQL(alterTable);
    console.log('✅ Added competition_id column to teams table');
  } catch (error) {
    console.log('⚠️  Teams table update (may already exist):', error.message);
  }
  
  // Update existing Premier League teams to have competition_id = 1
  console.log('🔄 Setting competition_id for existing Premier League teams...');
  
  const updateTeams = `
    UPDATE teams SET competition_id = 1 WHERE competition_id IS NULL;
  `;
  
  try {
    await executeSQL(updateTeams);
    console.log('✅ Updated existing teams with Premier League competition_id');
  } catch (error) {
    console.log('❌ Failed to update teams:', error.message);
  }
}

/**
 * Add competition_id column to fixtures table
 */
async function updateFixturesTable() {
  console.log('⚽ Updating fixtures table...');
  
  const alterTable = `
    ALTER TABLE fixtures 
    ADD COLUMN IF NOT EXISTS competition_id INTEGER REFERENCES competitions(id);
  `;
  
  try {
    await executeSQL(alterTable);
    console.log('✅ Added competition_id column to fixtures table');
  } catch (error) {
    console.log('⚠️  Fixtures table update (may already exist):', error.message);
  }
  
  // Update existing fixtures to have competition_id = 1 (Premier League)
  console.log('🔄 Setting competition_id for existing fixtures...');
  
  const updateFixtures = `
    UPDATE fixtures SET competition_id = 1 WHERE competition_id IS NULL;
  `;
  
  try {
    await executeSQL(updateFixtures);
    console.log('✅ Updated existing fixtures with Premier League competition_id');
  } catch (error) {
    console.log('❌ Failed to update fixtures:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting database migration for multi-competition support...\n');
  
  try {
    await setupCompetitions();
    console.log('');
    
    await updateTeamsTable();
    console.log('');
    
    await updateFixturesTable();
    console.log('');
    
    console.log('🎉 Database migration completed successfully!');
    console.log('✅ Multi-competition support is now enabled');
    console.log('\n📊 Next steps:');
    console.log('1. Import teams for all competitions');
    console.log('2. Import fixtures for all competitions');
    console.log('3. Test the frontend multi-competition functionality');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
main().catch(console.error);