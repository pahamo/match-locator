/**
 * Frontend Competition Configuration
 * Centralized config for competition logos, icons, and metadata
 */

export interface CompetitionConfig {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  logo?: string;
  icon: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
  };
  seasonId?: number; // Sports Monks season ID for current season
}

// Note: Season IDs are for 2024/25 season. Update annually.
// To find current season ID: Check Sports Monks /leagues/{id} endpoint or fixture data
export const COMPETITION_CONFIGS: Record<string, CompetitionConfig> = {
  'premier-league': {
    id: 1,
    slug: 'premier-league',
    name: 'Premier League',
    shortName: 'EPL',
    logo: 'https://cdn.sportmonks.com/images/soccer/leagues/8/8.png',
    icon: '⚽',
    description: 'The top flight of English football with 20 teams competing for the title.',
    colors: {
      primary: '#37003c',
      secondary: '#00ff87'
    },
    seasonId: 25583 // 2024/25 season
  },

  'champions-league': {
    id: 2,
    slug: 'champions-league',
    name: 'UEFA Champions League',
    shortName: 'UCL',
    logo: 'https://cdn.sportmonks.com/images/soccer/leagues/2.png',
    icon: '🏆',
    description: 'Europe\'s premier club competition featuring the best teams from across the continent.',
    colors: {
      primary: '#0d1c4b',
      secondary: '#ffffff'
    }
  },

  'bundesliga': {
    id: 3,
    slug: 'bundesliga',
    name: 'Bundesliga',
    shortName: 'BUN',
    logo: 'https://cdn.sportmonks.com/images/soccer/leagues/18/82.png',
    icon: '🇩🇪',
    description: 'Germany\'s premier football league featuring 18 teams.',
    colors: {
      primary: '#d20515',
      secondary: '#000000'
    },
    seasonId: 25580 // 2025/26 season
  },

  'la-liga': {
    id: 4,
    slug: 'la-liga',
    name: 'La Liga',
    shortName: 'LAL',
    logo: 'https://cdn.sportmonks.com/images/soccer/leagues/20/564.png',
    icon: '🇪🇸',
    description: 'Spain\'s top football division with the world\'s best players.',
    colors: {
      primary: '#ee8707',
      secondary: '#ffffff'
    }
  },

  'serie-a': {
    id: 5,
    slug: 'serie-a',
    name: 'Serie A',
    shortName: 'SER',
    logo: 'https://cdn.sportmonks.com/images/soccer/leagues/0/384.png',
    icon: '🇮🇹',
    description: 'Italy\'s premier football league known for tactical excellence.',
    colors: {
      primary: '#004c99',
      secondary: '#ffffff'
    }
  },

  'ligue-1': {
    id: 6,
    slug: 'ligue-1',
    name: 'Ligue 1',
    shortName: 'L1',
    logo: 'https://cdn.sportmonks.com/images/soccer/leagues/13/301.png',
    icon: '🇫🇷',
    description: 'France\'s top football division featuring PSG and top European talent.',
    colors: {
      primary: '#dae025',
      secondary: '#000000'
    }
  },

  'primeira-liga': {
    id: 7,
    slug: 'primeira-liga',
    name: 'Primeira Liga',
    shortName: 'POR',
    logo: 'https://cdn.sportmonks.com/images/soccer/leagues/14/462.png',
    icon: '🇵🇹',
    description: 'Portugal\'s premier football league featuring Porto, Benfica, and Sporting CP.',
    colors: {
      primary: '#ff6b35',
      secondary: '#ffffff'
    }
  },

  'eredivisie': {
    id: 8,
    slug: 'eredivisie',
    name: 'Eredivisie',
    shortName: 'ERE',
    logo: 'https://cdn.sportmonks.com/images/soccer/leagues/72.png',
    icon: '🇳🇱',
    description: 'Netherlands\' top football division known for developing young talent.',
    colors: {
      primary: '#ff6200',
      secondary: '#ffffff'
    }
  },

  'championship': {
    id: 9,
    slug: 'championship',
    name: 'Championship',
    shortName: 'CHA',
    logo: 'https://cdn.sportmonks.com/images/soccer/leagues/9/9.png',
    icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    description: 'England\'s second tier featuring 24 teams competing for Premier League promotion.',
    colors: {
      primary: '#1e3a8a',
      secondary: '#ffffff'
    }
  },

  'europa-league': {
    id: 11,
    slug: 'europa-league',
    name: 'UEFA Europa League',
    shortName: 'UEL',
    logo: 'https://cdn.sportmonks.com/images/soccer/leagues/5/5.png',
    icon: '🌟',
    description: 'UEFA\'s second-tier European competition for clubs.',
    colors: {
      primary: '#ff6600',
      secondary: '#ffffff'
    }
  },

  // Legacy competitions for backward compatibility
  'fa-cup': {
    id: 10,
    slug: 'fa-cup',
    name: 'FA Cup',
    shortName: 'FAC',
    icon: '🏅',
    description: 'England\'s oldest football competition, open to all eligible clubs.',
    colors: {
      primary: '#003366',
      secondary: '#ffffff'
    }
  },

  'league-cup': {
    id: 12,
    slug: 'league-cup',
    name: 'EFL Cup',
    shortName: 'EFL',
    icon: '🥇',
    description: 'English football\'s secondary cup competition.',
    colors: {
      primary: '#005c99',
      secondary: '#ffffff'
    }
  }
};

/**
 * Get competition configuration by slug
 */
export function getCompetitionConfig(slug: string): CompetitionConfig | null {
  return COMPETITION_CONFIGS[slug] || null;
}

/**
 * Get competition logo URL by slug
 */
export function getCompetitionLogo(slug: string): string | null {
  const config = getCompetitionConfig(slug);
  return config?.logo || null;
}

/**
 * Get competition icon by slug
 */
export function getCompetitionIcon(slug: string): string {
  const config = getCompetitionConfig(slug);
  return config?.icon || '🏁';
}

/**
 * Get competition description by slug
 */
export function getCompetitionDescription(slug: string): string {
  const config = getCompetitionConfig(slug);
  return config?.description || 'Football competition details.';
}

/**
 * Get competition colors by slug
 */
export function getCompetitionColors(slug: string): { primary: string; secondary: string } {
  const config = getCompetitionConfig(slug);
  return config?.colors || { primary: '#000000', secondary: '#ffffff' };
}

/**
 * Get all available competition configs
 */
export function getAllCompetitionConfigs(): CompetitionConfig[] {
  return Object.values(COMPETITION_CONFIGS);
}