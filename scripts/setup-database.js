#!/usr/bin/env node

/**
 * Setup Database for Multi-Competition via REST API
 * Since we can't execute raw SQL via Supabase REST API easily,
 * let's create the data directly using the REST endpoints
 */

const https = require('https');

const SUPABASE_CONFIG = {
  url: 'https://ksqyurqkqznzrntdpood.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcXl1cnFrcXpuenJudGRwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTEwNjAsImV4cCI6MjA3MjM2NzA2MH0.wVBZBEbfctB7JPnpMZkXKMGwXlYxGWjOF_AxixVo-S4'
};

/**
 * Insert competition data
 */
async function insertCompetition(competition) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/competitions`;
    const postData = JSON.stringify(competition);
    
    const options = {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(true);
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
 * Check if competitions table exists and has data
 */
async function checkCompetitions() {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/competitions?select=id,name`;
    
    const options = {
      method: 'GET',
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
        try {
          const competitions = JSON.parse(data);
          resolve(competitions);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Insert sample teams for testing multi-competition
 */
async function insertSampleTeams() {
  const sampleTeams = [
    // Premier League teams (competition_id: 1) - these might already exist
    { name: 'Arsenal', slug: 'arsenal', competition_id: 1, country: 'England' },
    { name: 'Chelsea', slug: 'chelsea', competition_id: 1, country: 'England' },
    { name: 'Liverpool', slug: 'liverpool', competition_id: 1, country: 'England' },
    { name: 'Manchester City', slug: 'manchester-city', competition_id: 1, country: 'England' },
    { name: 'Manchester United', slug: 'manchester-united', competition_id: 1, country: 'England' },
    
    // Bundesliga teams (competition_id: 2)
    { name: 'Bayern Munich', slug: 'bayern-munich', competition_id: 2, country: 'Germany' },
    { name: 'Borussia Dortmund', slug: 'borussia-dortmund', competition_id: 2, country: 'Germany' },
    { name: 'RB Leipzig', slug: 'rb-leipzig', competition_id: 2, country: 'Germany' },
    { name: 'Bayer 04 Leverkusen', slug: 'bayer-leverkusen', competition_id: 2, country: 'Germany' },
    
    // La Liga teams (competition_id: 3)
    { name: 'Real Madrid', slug: 'real-madrid', competition_id: 3, country: 'Spain' },
    { name: 'FC Barcelona', slug: 'fc-barcelona', competition_id: 3, country: 'Spain' },
    { name: 'Atlético Madrid', slug: 'atletico-madrid', competition_id: 3, country: 'Spain' },
    { name: 'Athletic Bilbao', slug: 'athletic-bilbao', competition_id: 3, country: 'Spain' },
    
    // Serie A teams (competition_id: 4)
    { name: 'Juventus', slug: 'juventus', competition_id: 4, country: 'Italy' },
    { name: 'Inter Milan', slug: 'inter-milan', competition_id: 4, country: 'Italy' },
    { name: 'AC Milan', slug: 'ac-milan', competition_id: 4, country: 'Italy' },
    { name: 'Atalanta', slug: 'atalanta', competition_id: 4, country: 'Italy' },
    
    // Ligue 1 teams (competition_id: 5)
    { name: 'Paris Saint-Germain', slug: 'paris-saint-germain', competition_id: 5, country: 'France' },
    { name: 'Olympique Lyonnais', slug: 'olympique-lyonnais', competition_id: 5, country: 'France' },
    { name: 'Olympique de Marseille', slug: 'olympique-marseille', competition_id: 5, country: 'France' },
    { name: 'AS Monaco', slug: 'as-monaco', competition_id: 5, country: 'France' }
  ];
  
  console.log('👥 Inserting sample teams for all competitions...');
  let successCount = 0;
  
  for (const team of sampleTeams) {
    try {
      await insertTeam(team);
      console.log(`✅ Team inserted: ${team.name}`);
      successCount++;
    } catch (error) {
      console.log(`⚠️  Team ${team.name}: ${error.message.includes('duplicate') ? 'already exists' : 'failed'}`);
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log(`\n📊 Teams Summary: ${successCount} inserted/updated`);
}

async function insertTeam(team) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/teams`;
    const postData = JSON.stringify(team);
    
    const options = {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(url, options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve(true);
      } else {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${data}`)));
      }
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Setting up multi-competition database...\n');
  
  try {
    // Check if competitions table exists and has data
    console.log('🔍 Checking existing competitions...');
    let competitions;
    
    try {
      competitions = await checkCompetitions();
      console.log(`📊 Found ${competitions.length} existing competitions`);
      
      if (competitions.length === 0) {
        console.log('📝 No competitions found. The competitions table needs to be created manually.');
        console.log('ℹ️  Please run the database-migration.sql file directly in Supabase SQL Editor');
        console.log('   or ask your database administrator to create the competitions table.');
        return;
      } else {
        console.log('✅ Competitions table exists with data');
        competitions.forEach(comp => console.log(`   - ${comp.id}: ${comp.name}`));
      }
      
    } catch (error) {
      if (error.message && error.message.includes('relation "competitions" does not exist')) {
        console.log('❌ Competitions table does not exist');
        console.log('📝 Please run the database-migration.sql file first');
        console.log('   You can do this in the Supabase SQL Editor at:');
        console.log('   https://supabase.com/dashboard/project/ksqyurqkqznzrntdpood/sql/new');
        return;
      }
      throw error;
    }
    
    // Insert sample teams for testing
    await insertSampleTeams();
    
    console.log('\n🎉 Database setup completed!');
    console.log('✅ Multi-competition support is ready for testing');
    console.log('\n📊 Next steps:');
    console.log('1. Run fixture import script');
    console.log('2. Test the frontend multi-competition functionality');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
main().catch(console.error);