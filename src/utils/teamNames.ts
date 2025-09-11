// Team name shortening utilities for compact displays

export const teamShortNames: Record<string, string> = {
  // Premier League teams with shorter display names
  'Arsenal': 'ARS',
  'Aston Villa': 'AVL',
  'Bournemouth': 'BOU',
  'Brentford': 'BRE',
  'Brighton & Hove Albion': 'BHA',
  'Brighton and Hove Albion': 'BHA',
  'Brighton': 'BHA',
  'Chelsea': 'CHE',
  'Crystal Palace': 'CRY',
  'Everton': 'EVE',
  'Fulham': 'FUL',
  'Ipswich Town': 'IPS',
  'Leicester City': 'LEI',
  'Liverpool': 'LIV',
  'Manchester City': 'MCI',
  'Manchester United': 'MUN',
  'Newcastle United': 'NEW',
  'Newcastle': 'NEW',
  'Nottingham Forest': 'NFO',
  'Southampton': 'SOU',
  'Tottenham Hotspur': 'TOT',
  'Tottenham': 'TOT',
  'West Ham United': 'WHU',
  'West Ham': 'WHU',
  'Wolverhampton Wanderers': 'WOL',
  'Wolves': 'WOL'
};

export const getShortTeamName = (fullName: string): string => {
  return teamShortNames[fullName] || fullName;
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