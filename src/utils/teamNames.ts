// Team name shortening utilities for compact displays

// Manual overrides for teams where automatic shortening doesn't work well
export const teamShortNameOverrides: Record<string, string> = {
  // Premier League
  'Arsenal FC': 'ARS',
  'Aston Villa FC': 'AVL',
  'AFC Bournemouth FC': 'BOU',
  'Brentford FC': 'BRE',
  'Brighton & Hove Albion FC': 'BHA',
  'Chelsea FC': 'CHE',
  'Crystal Palace FC': 'CRY',
  'Everton FC': 'EVE',
  'Fulham FC': 'FUL',
  'Ipswich Town FC': 'IPS',
  'Leicester City FC': 'LEI',
  'Liverpool FC': 'LIV',
  'Manchester City FC': 'MCI',
  'Manchester United FC': 'MUN',
  'Newcastle United FC': 'NEW',
  'Nottingham Forest FC': 'NFO',
  'Southampton FC': 'SOU',
  'Tottenham Hotspur FC': 'TOT',
  'West Ham United FC': 'WHU',
  'Wolverhampton Wanderers FC': 'WOL',

  // Champions League
  'Real Madrid CF': 'RMA',
  'FC Barcelona': 'BAR',
  'Club Atlético de Madrid': 'ATM',
  'Paris Saint-Germain FC': 'PSG',
  'FC Bayern München': 'BAY',
  'Borussia Dortmund': 'BVB',
  'RB Leipzig': 'RBL',
  'Bayer 04 Leverkusen': 'B04',
  'AC Milan': 'MIL',
  'FC Internazionale Milano': 'INT',
  'Juventus FC': 'JUV',
  'Atalanta BC': 'ATA',
  'AS Monaco FC': 'MON',

  // German teams - remove numbers and clean up
  '1. FC Heidenheim 1846 FC': 'HEI',
  '1. FC Köln FC': 'KOL',
  '1. FC Union Berlin FC': 'UNI',
  '1. FSV Mainz 05 FC': 'M05',
  'Bayer 04 Leverkusen FC': 'B04',
  'FC St. Pauli FC': 'STP',
  'Holstein Kiel FC': 'KIE',
  'VfL Bochum 1848 FC': 'BOC',
  'VfL Wolfsburg FC': 'WOL',
  'VfB Stuttgart FC': 'STU',
  'SV Werder Bremen FC': 'BRE',
  'TSG 1899 Hoffenheim FC': 'HOF',
  'SC Freiburg FC': 'FRE',
  'FC Augsburg FC': 'AUG',
  'Eintracht Frankfurt FC': 'SGE',
  'Borussia Mönchengladbach FC': 'BMG',

  // Spanish teams
  'Real Madrid CF FC': 'RMA',
  'FC Barcelona FC': 'BAR',
  'Club Atlético de Madrid FC': 'ATM',
  'Athletic Club FC': 'ATH',
  'Real Sociedad de Fútbol FC': 'RSO',
  'RC Celta de Vigo FC': 'CEL',
  'Real Betis Balompié FC': 'BET',
  'Sevilla FC FC': 'SEV',
  'Valencia CF FC': 'VAL',
  'Villarreal CF FC': 'VIL',
  'RCD Espanyol de Barcelona FC': 'ESP',
  'RCD Mallorca FC': 'MLL',
  'Deportivo Alavés FC': 'ALA',
  'CA Osasuna FC': 'OSA',
  'UD Las Palmas FC': 'LPA',
  'Rayo Vallecano de Madrid FC': 'RAY',
  'Getafe CF FC': 'GET',
  'CD Leganés FC': 'LEG',
  'Real Valladolid CF FC': 'VLL',

  // Italian teams
  'AC Milan FC': 'MIL',
  'FC Internazionale Milano FC': 'INT',
  'Juventus FC FC': 'JUV',
  'AS Roma FC': 'ROM',
  'SS Lazio FC': 'LAZ',
  'ACF Fiorentina FC': 'FIO',
  'Atalanta BC FC': 'ATA',
  'SSC Napoli FC': 'NAP',
  'Torino FC FC': 'TOR',
  'Bologna FC 1909 FC': 'BOL',
  'Udinese Calcio FC': 'UDI',
  'UC Sampdoria FC': 'SAM',
  'Genoa CFC FC': 'GEN',
  'US Lecce FC': 'LEC',
  'Parma Calcio 1913 FC': 'PAR',
  'Hellas Verona FC FC': 'VER',
  'Como 1907 FC': 'COM',
  'Empoli FC FC': 'EMP',
  'Cagliari Calcio FC': 'CAG',
  'AC Monza FC': 'MON',
  'Venezia FC FC': 'VEN',

  // French teams
  'Paris Saint-Germain FC FC': 'PSG',
  'Olympique de Marseille FC': 'OM',
  'Olympique Lyonnais FC': 'OL',
  'AS Monaco FC FC': 'MON',
  'LOSC Lille FC': 'LIL',
  'OGC Nice FC': 'NIC',
  'RC Lens FC': 'LEN',
  'Stade Rennais FC FC': 'REN',
  'RC Strasbourg Alsace FC': 'STR',
  'Stade Brestois 29 FC': 'BRE',
  'FC Nantes FC': 'NAN',
  'Stade de Reims FC': 'REI',
  'Montpellier HSC FC': 'MTP',
  'AJ Auxerre FC': 'AUX',
  'Toulouse FC FC': 'TOU',
  'Angers SCO FC': 'ANG',
  'Le Havre AC FC': 'HAV',
  'AS Saint-Étienne FC': 'STE',

  // Portuguese teams
  'FC Porto FC': 'POR',
  'SL Benfica FC': 'BEN',
  'Sporting Clube de Portugal FC': 'SCP',
  'SC Braga FC': 'BRA',
  'Vitória Sport Clube FC': 'VSC',
  'FC Famalicão FC': 'FAM',
  'Rio Ave FC FC': 'RIO',
  'CD Nacional FC': 'NAC',
  'Casa Pia AC FC': 'CAS',
  'FC Arouca FC': 'ARO',
  'CD Santa Clara FC': 'SCL',
  'Moreirense FC FC': 'MOR',
  'CF Estrela da Amadora FC': 'EST',
  'SC Farense FC': 'FAR',
  'AVS FC FC': 'AVS',
  'Boavista FC FC': 'BOA',
  'Gil Vicente FC FC': 'GIL',
  'FC Penafiel FC': 'PEN',

  // Dutch teams
  'AFC Ajax FC': 'AJA',
  'PSV FC': 'PSV',
  'Feyenoord FC': 'FEY',
  'FC Utrecht FC': 'UTR',
  'FC Twente FC': 'TWE',
  'AZ FC': 'AZ',
  'sc Heerenveen FC': 'HEE',
  'PEC Zwolle FC': 'ZWO',
  'FC Groningen FC': 'GRO',
  'Willem II FC': 'WIL',
  'NAC Breda FC': 'NAC',
  'NEC FC': 'NEC',
  'Fortuna Sittard FC': 'FOR',
  'Sparta Rotterdam FC': 'SPA',
  'Go Ahead Eagles FC': 'GAE',
  'Heracles Almelo FC': 'HER',
  'RKC Waalwijk FC': 'RKC',
  'Almere City FC FC': 'ALM',

  // Championship teams (keep English names more readable)
  'Birmingham City FC': 'BIR',
  'Blackburn Rovers FC': 'BLA',
  'Bristol City FC': 'BRC',
  'Burnley FC': 'BUR',
  'Cardiff City FC': 'CAR',
  'Coventry City FC': 'COV',
  'Derby County FC': 'DER',
  'Hull City FC': 'HUL',
  'Leeds United FC': 'LEE',
  'Luton Town FC': 'LUT',
  'Middlesbrough FC': 'MID',
  'Millwall FC': 'MIL',
  'Norwich City FC': 'NOR',
  'Oxford United FC': 'OXF',
  'Plymouth Argyle FC': 'PLY',
  'Portsmouth FC': 'POR',
  'Preston North End FC': 'PNE',
  'Queens Park Rangers FC': 'QPR',
  'Sheffield United FC': 'SHU',
  'Sheffield Wednesday FC': 'SHW',
  'Stoke City FC': 'STO',
  'Sunderland AFC': 'SUN',
  'Swansea City AFC': 'SWA',
  'Watford FC': 'WAT',
  'West Bromwich Albion FC': 'WBA'
};

// Auto-generate short names for teams not in the override list
const generateShortName = (fullName: string): string => {
  // Remove common suffixes
  let name = fullName
    .replace(/\s+FC$/, '')
    .replace(/\s+CF$/, '')
    .replace(/\s+AC$/, '')
    .replace(/\s+BC$/, '')
    .replace(/\s+SC$/, '')
    .replace(/\s+AFC$/, '')
    .replace(/\s+CFC$/, '')
    .replace(/\s+RFC$/, '')
    .replace(/\s+United$/, '')
    .replace(/\s+City$/, '')
    .replace(/\s+Town$/, '')
    .replace(/\s+Rovers$/, '')
    .replace(/\s+Wanderers$/, '')
    .replace(/\s+Albion$/, '')
    .replace(/\s+County$/, '')
    .replace(/\s+Athletic$/, '')
    .replace(/\s+Hotspur$/, '')
    .replace(/\s+Palace$/, '')
    .replace(/\s+Forest$/, '')
    .replace(/\s+Villa$/, '')
    .replace(/\s+Calcio$/, '')
    .replace(/\s+Balompié$/, '')
    .replace(/\s+de\s+.*$/, '') // Remove "de Something" parts
    .replace(/\s+1909$/, '')
    .replace(/\s+1913$/, '')
    .replace(/\s+1907$/, '')
    .replace(/\s+1846$/, '')
    .replace(/\s+1848$/, '')
    .replace(/\s+1899$/, '')
    .replace(/\s+04$/, '')
    .replace(/\s+05$/, '')
    .replace(/\s+29$/, '')
    .replace(/^\d+\.\s*/, '') // Remove leading numbers like "1. "
    .trim();

  // If name is short enough after cleanup, use it
  if (name.length <= 6) {
    return name.toUpperCase();
  }

  // Generate 3-letter acronym from significant words
  const words = name.split(/\s+/)
    .filter(word => word.length > 2) // Skip short words like "de", "la", "of"
    .filter(word => !['the', 'and', 'of', 'in', 'at', 'on', 'for', 'FC', 'CF', 'AC'].includes(word));

  if (words.length >= 2) {
    // Take first letter of first 3 significant words
    return words.slice(0, 3).map(word => word[0]).join('').toUpperCase();
  } else if (words.length === 1) {
    // For single word, take first 3 letters
    return words[0].substring(0, 3).toUpperCase();
  }

  // Fallback: take first 3 letters of original name
  return fullName.substring(0, 3).toUpperCase();
};

export const getShortTeamName = (fullName: string): string => {
  // Check manual overrides first
  if (teamShortNameOverrides[fullName]) {
    return teamShortNameOverrides[fullName];
  }

  // Auto-generate if not in overrides
  return generateShortName(fullName);
};

export const getDisplayTeamName = (fullName: string, useShort: boolean = false): string => {
  if (!useShort) return fullName;
  return getShortTeamName(fullName);
};

// Helper to determine if we should use short names based on viewport
export const shouldUseShortNames = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768; // Use short names on mobile/tablet
};