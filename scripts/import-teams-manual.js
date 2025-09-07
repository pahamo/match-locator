#!/usr/bin/env node

/**
 * Manual Team Import Script with Correct League Data
 * 
 * Since TheSportsDB API returned incorrect teams, this script uses
 * manually curated team lists for accurate imports
 * 
 * @version 1.0.1
 * @created 2025-09-07
 */

const fs = require('fs').promises;

// ============================================
// MANUALLY CURATED TEAM DATA
// ============================================

const MANUAL_TEAMS = {
  'premier-league': [
    // Current 2024-25 Premier League teams
    { name: 'Arsenal', slug: 'arsenal', city: 'London' },
    { name: 'Aston Villa', slug: 'aston-villa', city: 'Birmingham' },
    { name: 'AFC Bournemouth', slug: 'afc-bournemouth', city: 'Bournemouth' },
    { name: 'Brentford', slug: 'brentford', city: 'London' },
    { name: 'Brighton & Hove Albion', slug: 'brighton-hove-albion', city: 'Brighton' },
    { name: 'Chelsea', slug: 'chelsea', city: 'London' },
    { name: 'Crystal Palace', slug: 'crystal-palace', city: 'London' },
    { name: 'Everton', slug: 'everton', city: 'Liverpool' },
    { name: 'Fulham', slug: 'fulham', city: 'London' },
    { name: 'Ipswich Town', slug: 'ipswich-town', city: 'Ipswich' },
    { name: 'Leicester City', slug: 'leicester-city', city: 'Leicester' },
    { name: 'Liverpool', slug: 'liverpool', city: 'Liverpool' },
    { name: 'Manchester City', slug: 'manchester-city', city: 'Manchester' },
    { name: 'Manchester United', slug: 'manchester-united', city: 'Manchester' },
    { name: 'Newcastle United', slug: 'newcastle-united', city: 'Newcastle' },
    { name: 'Nottingham Forest', slug: 'nottingham-forest', city: 'Nottingham' },
    { name: 'Southampton', slug: 'southampton', city: 'Southampton' },
    { name: 'Tottenham Hotspur', slug: 'tottenham-hotspur', city: 'London' },
    { name: 'West Ham United', slug: 'west-ham-united', city: 'London' },
    { name: 'Wolverhampton Wanderers', slug: 'wolverhampton-wanderers', city: 'Wolverhampton' }
  ],

  'bundesliga': [
    // 2024-25 Bundesliga teams
    { name: 'FC Augsburg', slug: 'fc-augsburg', city: 'Augsburg' },
    { name: 'Bayer 04 Leverkusen', slug: 'bayer-leverkusen', city: 'Leverkusen' },
    { name: 'Bayern Munich', slug: 'bayern-munich', city: 'Munich' },
    { name: 'Borussia Dortmund', slug: 'borussia-dortmund', city: 'Dortmund' },
    { name: 'Borussia Mönchengladbach', slug: 'borussia-monchengladbach', city: 'Mönchengladbach' },
    { name: 'Eintracht Frankfurt', slug: 'eintracht-frankfurt', city: 'Frankfurt' },
    { name: '1. FC Heidenheim', slug: '1-fc-heidenheim', city: 'Heidenheim' },
    { name: 'TSG Hoffenheim', slug: 'tsg-hoffenheim', city: 'Sinsheim' },
    { name: 'Holstein Kiel', slug: 'holstein-kiel', city: 'Kiel' },
    { name: 'RB Leipzig', slug: 'rb-leipzig', city: 'Leipzig' },
    { name: '1. FSV Mainz 05', slug: '1-fsv-mainz-05', city: 'Mainz' },
    { name: 'FC St. Pauli', slug: 'fc-st-pauli', city: 'Hamburg' },
    { name: 'SC Freiburg', slug: 'sc-freiburg', city: 'Freiburg' },
    { name: 'FC Schalke 04', slug: 'fc-schalke-04', city: 'Gelsenkirchen' },
    { name: 'VfB Stuttgart', slug: 'vfb-stuttgart', city: 'Stuttgart' },
    { name: 'Union Berlin', slug: 'union-berlin', city: 'Berlin' },
    { name: 'VfL Bochum', slug: 'vfl-bochum', city: 'Bochum' },
    { name: 'Werder Bremen', slug: 'werder-bremen', city: 'Bremen' }
  ],

  'la-liga': [
    // 2024-25 La Liga teams
    { name: 'Athletic Bilbao', slug: 'athletic-bilbao', city: 'Bilbao' },
    { name: 'Atlético Madrid', slug: 'atletico-madrid', city: 'Madrid' },
    { name: 'FC Barcelona', slug: 'fc-barcelona', city: 'Barcelona' },
    { name: 'Real Betis', slug: 'real-betis', city: 'Seville' },
    { name: 'Cádiz CF', slug: 'cadiz-cf', city: 'Cádiz' },
    { name: 'Celta Vigo', slug: 'celta-vigo', city: 'Vigo' },
    { name: 'Deportivo Alavés', slug: 'deportivo-alaves', city: 'Vitoria-Gasteiz' },
    { name: 'Espanyol', slug: 'espanyol', city: 'Barcelona' },
    { name: 'Getafe CF', slug: 'getafe-cf', city: 'Getafe' },
    { name: 'Girona FC', slug: 'girona-fc', city: 'Girona' },
    { name: 'Las Palmas', slug: 'las-palmas', city: 'Las Palmas' },
    { name: 'CD Leganés', slug: 'cd-leganes', city: 'Leganés' },
    { name: 'Mallorca', slug: 'mallorca', city: 'Palma' },
    { name: 'Osasuna', slug: 'osasuna', city: 'Pamplona' },
    { name: 'Rayo Vallecano', slug: 'rayo-vallecano', city: 'Madrid' },
    { name: 'Real Madrid', slug: 'real-madrid', city: 'Madrid' },
    { name: 'Real Sociedad', slug: 'real-sociedad', city: 'San Sebastián' },
    { name: 'Sevilla FC', slug: 'sevilla-fc', city: 'Seville' },
    { name: 'Valencia CF', slug: 'valencia-cf', city: 'Valencia' },
    { name: 'Villarreal CF', slug: 'villarreal-cf', city: 'Villarreal' }
  ],

  'serie-a': [
    // 2024-25 Serie A teams
    { name: 'Atalanta', slug: 'atalanta', city: 'Bergamo' },
    { name: 'Bologna FC', slug: 'bologna-fc', city: 'Bologna' },
    { name: 'Cagliari', slug: 'cagliari', city: 'Cagliari' },
    { name: 'Como 1907', slug: 'como-1907', city: 'Como' },
    { name: 'Empoli FC', slug: 'empoli-fc', city: 'Empoli' },
    { name: 'ACF Fiorentina', slug: 'acf-fiorentina', city: 'Florence' },
    { name: 'Genoa CFC', slug: 'genoa-cfc', city: 'Genoa' },
    { name: 'Hellas Verona', slug: 'hellas-verona', city: 'Verona' },
    { name: 'Inter Milan', slug: 'inter-milan', city: 'Milan' },
    { name: 'Juventus', slug: 'juventus', city: 'Turin' },
    { name: 'Lazio', slug: 'lazio', city: 'Rome' },
    { name: 'Lecce', slug: 'lecce', city: 'Lecce' },
    { name: 'AC Milan', slug: 'ac-milan', city: 'Milan' },
    { name: 'AC Monza', slug: 'ac-monza', city: 'Monza' },
    { name: 'Napoli', slug: 'napoli', city: 'Naples' },
    { name: 'Parma Calcio 1913', slug: 'parma-calcio-1913', city: 'Parma' },
    { name: 'AS Roma', slug: 'as-roma', city: 'Rome' },
    { name: 'Torino FC', slug: 'torino-fc', city: 'Turin' },
    { name: 'Udinese', slug: 'udinese', city: 'Udine' },
    { name: 'Venezia FC', slug: 'venezia-fc', city: 'Venice' }
  ],

  'ligue-1': [
    // 2024-25 Ligue 1 teams
    { name: 'Angers SCO', slug: 'angers-sco', city: 'Angers' },
    { name: 'AJ Auxerre', slug: 'aj-auxerre', city: 'Auxerre' },
    { name: 'Stade Brestois 29', slug: 'stade-brestois-29', city: 'Brest' },
    { name: 'Le Havre AC', slug: 'le-havre-ac', city: 'Le Havre' },
    { name: 'RC Lens', slug: 'rc-lens', city: 'Lens' },
    { name: 'Lille OSC', slug: 'lille-osc', city: 'Lille' },
    { name: 'Olympique Lyonnais', slug: 'olympique-lyonnais', city: 'Lyon' },
    { name: 'Olympique de Marseille', slug: 'olympique-de-marseille', city: 'Marseille' },
    { name: 'AS Monaco', slug: 'as-monaco', city: 'Monaco' },
    { name: 'FC Nantes', slug: 'fc-nantes', city: 'Nantes' },
    { name: 'OGC Nice', slug: 'ogc-nice', city: 'Nice' },
    { name: 'Paris Saint-Germain', slug: 'paris-saint-germain', city: 'Paris' },
    { name: 'RC Racing Club de Strasbourg', slug: 'rc-strasbourg', city: 'Strasbourg' },
    { name: 'Stade Rennais FC', slug: 'stade-rennais-fc', city: 'Rennes' },
    { name: 'AS Saint-Étienne', slug: 'as-saint-etienne', city: 'Saint-Étienne' },
    { name: 'Toulouse FC', slug: 'toulouse-fc', city: 'Toulouse' },
    { name: 'Montpellier HSC', slug: 'montpellier-hsc', city: 'Montpellier' },
    { name: 'Stade de Reims', slug: 'stade-de-reims', city: 'Reims' }
  ]
};

// Competition configuration
const COMPETITION_CONFIG = {
  'premier-league': { id: 1, name: 'Premier League', countryCode: 'ENG' },
  'bundesliga': { id: 2, name: 'Bundesliga', countryCode: 'GER' },
  'la-liga': { id: 3, name: 'La Liga', countryCode: 'ESP' },
  'serie-a': { id: 4, name: 'Serie A', countryCode: 'ITA' },
  'ligue-1': { id: 5, name: 'Ligue 1', countryCode: 'FRA' }
};

// ============================================
// PROCESSING FUNCTIONS
// ============================================

function slugify(name) {
  return String(name)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function processTeams() {
  const allTeams = [];
  
  Object.entries(MANUAL_TEAMS).forEach(([competitionSlug, teams]) => {
    const competition = COMPETITION_CONFIG[competitionSlug];
    
    teams.forEach((team, index) => {
      const processedTeam = {
        name: team.name,
        slug: team.slug || slugify(team.name),
        competition_id: competition.id,
        country_code: competition.countryCode,
        external_ref: `manual_${competition.id}_${index + 1}`,
        venue: team.venue || null,
        founded_year: team.founded_year || null,
        city: team.city || null
      };
      
      allTeams.push(processedTeam);
    });
    
    console.log(`✅ Processed ${teams.length} teams for ${competition.name}`);
  });
  
  return allTeams;
}

function generateSQL(teams) {
  const values = teams.map(team => {
    const name = team.name.replace(/'/g, "''");
    const slug = team.slug.replace(/'/g, "''");
    const venue = team.venue ? `'${team.venue.replace(/'/g, "''")}'` : 'NULL';
    const city = team.city ? `'${team.city.replace(/'/g, "''")}'` : 'NULL';
    const foundedYear = team.founded_year || 'NULL';
    
    return `('${name}', '${slug}', NULL, ${team.competition_id}, '${team.country_code}', '${team.external_ref}', ${venue}, NULL, ${foundedYear})`;
  }).join(',\n  ');
  
  return `-- Manual Team Import SQL
-- Generated: ${new Date().toISOString()}
-- Total teams: ${teams.length}

-- Insert teams with manual data
INSERT INTO teams (
  name, slug, crest_url, competition_id, country_code, 
  external_ref, venue, website, founded_year
) VALUES
  ${values}
ON CONFLICT (slug) DO UPDATE SET
  competition_id = EXCLUDED.competition_id,
  country_code = EXCLUDED.country_code,
  external_ref = EXCLUDED.external_ref,
  venue = EXCLUDED.venue,
  founded_year = EXCLUDED.founded_year,
  updated_at = NOW();

-- Verify import
-- SELECT c.name, COUNT(t.id) as team_count 
-- FROM competitions c
-- LEFT JOIN teams t ON c.id = t.competition_id
-- GROUP BY c.name
-- ORDER BY c.display_order;
`;
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('🏟️  Manual Team Import Starting...');
  
  try {
    // Process all teams
    const allTeams = processTeams();
    
    // Generate SQL
    console.log('\n📝 Generating SQL...');
    const sql = generateSQL(allTeams);
    
    // Save files
    console.log('💾 Saving files...');
    
    await fs.writeFile('teams-manual-import.sql', sql);
    await fs.writeFile('teams-manual-data.json', JSON.stringify({
      generatedAt: new Date().toISOString(),
      source: 'manual',
      totalTeams: allTeams.length,
      teams: allTeams
    }, null, 2));
    
    // Summary
    console.log('\n📊 Import Summary:');
    console.log(`   Total teams: ${allTeams.length}`);
    Object.entries(COMPETITION_CONFIG).forEach(([slug, comp]) => {
      const count = allTeams.filter(t => t.competition_id === comp.id).length;
      console.log(`   ${comp.name}: ${count} teams`);
    });
    
    console.log('\n✅ Manual team import completed!');
    console.log('📁 Files created:');
    console.log('   - teams-manual-import.sql (ready to execute)');
    console.log('   - teams-manual-data.json (for review)');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { processTeams, generateSQL, MANUAL_TEAMS };