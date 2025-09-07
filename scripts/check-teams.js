#!/usr/bin/env node

/**
 * Check what teams are in the database
 */

const https = require('https');

const SUPABASE_CONFIG = {
  url: 'https://ksqyurqkqznzrntdpood.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcXl1cnFrcXpuenJudGRwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTEwNjAsImV4cCI6MjA3MjM2NzA2MH0.wVBZBEbfctB7JPnpMZkXKMGwXlYxGWjOF_AxixVo-S4'
};

async function checkTeams() {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/teams?select=id,name&order=name`;
    
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
          const teams = JSON.parse(data);
          resolve(teams);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function checkCompetitions() {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/competitions?select=id,name&order=id`;
    
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

async function main() {
  try {
    console.log('🔍 Checking database state...\n');
    
    const competitions = await checkCompetitions();
    console.log('📊 Competitions in database:');
    competitions.forEach(comp => {
      console.log(`   ${comp.id}: ${comp.name}`);
    });
    console.log('');
    
    const teams = await checkTeams();
    console.log(`👥 Teams in database: ${teams ? teams.length : 0} total`);
    console.log('Raw teams response:', teams);
    console.log('');
    
    if (!teams || !Array.isArray(teams)) {
      console.log('❌ No teams found or invalid response');
      return;
    }
    
    const teamsByComp = teams.reduce((acc, team) => {
      if (!acc[team.competition_id]) acc[team.competition_id] = [];
      acc[team.competition_id].push(team.name);
      return acc;
    }, {});
    
    Object.keys(teamsByComp).forEach(compId => {
      const compName = competitions.find(c => c.id == compId)?.name || `Competition ${compId}`;
      console.log(`🏆 ${compName} (${teamsByComp[compId].length} teams):`);
      teamsByComp[compId].slice(0, 5).forEach(team => {
        console.log(`   - ${team}`);
      });
      if (teamsByComp[compId].length > 5) {
        console.log(`   ... and ${teamsByComp[compId].length - 5} more`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();