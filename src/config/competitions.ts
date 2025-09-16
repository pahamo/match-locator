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
}

export const COMPETITION_CONFIGS: Record<string, CompetitionConfig> = {
  'premier-league': {
    id: 1,
    slug: 'premier-league',
    name: 'Premier League',
    shortName: 'EPL',
    logo: 'https://cdn.brandfetch.io/id3ei9Uwhu/theme/dark/id4u-3dVa7.svg?c=1bxid64Mup7aczewSAYMX&t=1737356816110',
    icon: '⚽',
    description: 'The top flight of English football with 20 teams competing for the title.',
    colors: {
      primary: '#37003c',
      secondary: '#00ff87'
    }
  },

  'champions-league': {
    id: 2,
    slug: 'champions-league',
    name: 'UEFA Champions League',
    shortName: 'UCL',
    logo: 'https://upload.wikimedia.org/wikipedia/en/f/f5/UEFA_Champions_League.svg',
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
    logo: 'https://cdn.brandfetch.io/idULAJYHGL/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1756046283501',
    icon: '🇩🇪',
    description: 'Germany\'s premier football league featuring 18 teams.',
    colors: {
      primary: '#d20515',
      secondary: '#000000'
    }
  },

  'la-liga': {
    id: 4,
    slug: 'la-liga',
    name: 'La Liga',
    shortName: 'LAL',
    logo: 'https://cdn.brandfetch.io/idB6wr4svd/w/820/h/750/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1754867400907',
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
    logo: 'https://cdn.brandfetch.io/id_NHLWhOF/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1751361578120',
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
    logo: 'https://upload.wikimedia.org/wikipedia/fr/d/d9/Logo_Ligue_1_2024.svg',
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
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/S%C3%ADmbolo_da_Liga_Portuguesa_de_Futebol_Profissional.png',
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
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Eredivisie_nuovo_logo.png',
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
    logo: 'https://upload.wikimedia.org/wikipedia/fr/c/c3/EFL_Championship.svg',
    icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    description: 'England\'s second tier featuring 24 teams competing for Premier League promotion.',
    colors: {
      primary: '#1e3a8a',
      secondary: '#ffffff'
    }
  },

  // Legacy competitions for backward compatibility
  'europa-league': {
    id: 10,
    slug: 'europa-league',
    name: 'UEFA Europa League',
    shortName: 'UEL',
    icon: '🌟',
    description: 'UEFA\'s second-tier European competition for clubs.',
    colors: {
      primary: '#ff6600',
      secondary: '#ffffff'
    }
  },

  'fa-cup': {
    id: 11,
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