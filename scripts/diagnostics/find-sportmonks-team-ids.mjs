// Find Sportmonks team IDs for Premier League teams
import dotenv from 'dotenv';

dotenv.config();

const SPORTMONKS_TOKEN = process.env.SPORTMONKS_TOKEN;

const teamsToFind = [
  'Bournemouth',
  'Brighton',
  'Manchester City',
  'Manchester United',
  'Nottingham Forest',
  'Tottenham',
  'Wolves'
];

async function findTeamIds() {
  console.log('🔍 Searching for Sportmonks team IDs...\n');

  const url = `https://api.sportmonks.com/v3/football/teams?api_token=${SPORTMONKS_TOKEN}&filters=teamCountries:462`;

  const response = await fetch(url);
  const data = await response.json();

  console.log(`Found ${data.data.length} teams from England\n`);

  const foundTeams = data.data.filter(team => {
    return teamsToFind.some(name => team.name.includes(name));
  });

  console.log('✅ Found teams:\n');
  foundTeams.forEach(team => {
    console.log(`${String(team.id).padEnd(8)} | ${team.name}`);
  });

  console.log('\n📋 SQL Update statements:\n');

  const mapping = {
    'Bournemouth': 'bournemouth',
    'Brighton': 'brighton',
    'Manchester City': 'man-city',
    'Manchester United': 'man-united',
    'Nottingham Forest': 'forest',
    'Tottenham': 'tottenham',
    'Wolves': 'wolves'
  };

  foundTeams.forEach(team => {
    const matchKey = Object.keys(mapping).find(key => team.name.includes(key));
    if (matchKey) {
      const slug = mapping[matchKey];
      console.log(`UPDATE teams SET sportmonks_team_id = ${team.id} WHERE slug = '${slug}'; -- ${team.name}`);
    }
  });
}

findTeamIds().catch(console.error);
