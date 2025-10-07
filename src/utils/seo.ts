import type { Fixture, Team, SimpleFixture } from '../types';
import { mapCompetitionIdToSlug } from './competitionMapping';

// Determine canonical base from env or window origin
const CANONICAL_BASE = (
  (process.env.REACT_APP_CANONICAL_BASE as string | undefined) ||
  (typeof window !== 'undefined' ? window.location.origin : '')
).replace(/\/$/, '');

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// NEW: Clean slug generation that handles accents properly
export const generateCleanSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')  // Decompose accents
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')  // Only alphanumeric
    .replace(/^-+|-+$/g, '');  // Trim hyphens
};

export const formatDateForUrl = (date: string): string => {
  return new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
};

// New SEO-friendly date format: "22-sep-2024"
export const formatDateForSeoUrl = (date: string): string => {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleDateString('en-GB', { month: 'short' }).toLowerCase();
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Clean team names by removing common suffixes
export const cleanTeamName = (teamName: string): string => {
  return teamName
    .replace(/\s+(FC|AFC|CF|United|City)$/i, '') // Remove common suffixes
    .replace(/\s+FC$/i, '') // Remove FC specifically
    .replace(/\s+AFC$/i, '') // Remove AFC specifically
    .trim();
};

// SEO helper functions for title tags and meta descriptions

// Format team name for SEO titles (shorter version)
export const formatTeamNameShort = (teamName: string): string => {
  // Specific team name mappings for common shortenings
  const teamMappings: Record<string, string> = {
    'Brighton & Hove Albion': 'Brighton',
    'Brighton & Hove Albion FC': 'Brighton',
    'Wolverhampton Wanderers': 'Wolves',
    'Wolverhampton Wanderers FC': 'Wolves',
    'Tottenham Hotspur': 'Tottenham',
    'Tottenham Hotspur FC': 'Tottenham',
    'West Ham United': 'West Ham',
    'West Ham United FC': 'West Ham',
    'Newcastle United': 'Newcastle',
    'Newcastle United FC': 'Newcastle',
    'Manchester United': 'Man Utd',
    'Manchester United FC': 'Man Utd',
    'Manchester City': 'Man City',
    'Manchester City FC': 'Man City',
    'Leicester City': 'Leicester',
    'Leicester City FC': 'Leicester',
    'Norwich City': 'Norwich',
    'Norwich City FC': 'Norwich',
    'Sheffield United': 'Sheffield Utd',
    'Sheffield United FC': 'Sheffield Utd',
    'Nottingham Forest': 'Forest',
    'Nottingham Forest FC': 'Forest',
  };

  // Check for exact match first
  if (teamMappings[teamName]) {
    return teamMappings[teamName];
  }

  // Otherwise apply generic cleaning
  return cleanTeamName(teamName)
    .replace(/\s+Football Club$/i, '')
    .replace(/\s+Association Football Club$/i, '')
    .replace(/\s+United$/i, ' Utd')
    .replace(/\s+City$/i, ' City')
    .trim();
};

// Format date for title tags: "22 Sep 2024"
export const formatDateForTitle = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Format time for meta descriptions: "16:30"
export const formatTimeForMeta = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Get broadcaster list for a competition (helper for competition meta)
export const getBroadcasterList = (competitionSlug: string): string => {
  const broadcasters: Record<string, string> = {
    'premier-league': 'Sky, TNT, Amazon',
    'champions-league': 'TNT Sports',
    'europa-league': 'TNT Sports',
    'bundesliga': 'Sky Sports',
    'la-liga': 'Premier Sports',
    'serie-a': 'TNT Sports',
    'ligue-1': 'TNT Sports',
    'primeira-liga': 'Premier Sports',
    'eredivisie': 'Premier Sports',
    'championship': 'Sky Sports'
  };
  return broadcasters[competitionSlug] || 'Sky, TNT, Amazon';
};

// Get current season string: "2024/25"
export const getCurrentSeason = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const isNewSeason = now.getMonth() >= 6; // August onwards
  const seasonStart = isNewSeason ? currentYear : currentYear - 1;
  const seasonEnd = seasonStart + 1;
  return `${seasonStart}/${seasonEnd.toString().slice(-2)}`;
};

// Format competition name for display
export const formatCompetitionName = (competitionSlug: string): string => {
  const competitionNames: Record<string, string> = {
    'premier-league': 'Premier League',
    'champions-league': 'Champions League',
    'europa-league': 'Europa League',
    'bundesliga': 'Bundesliga',
    'la-liga': 'La Liga',
    'serie-a': 'Serie A',
    'ligue-1': 'Ligue 1',
    'primeira-liga': 'Primeira Liga',
    'eredivisie': 'Eredivisie',
    'championship': 'Championship'
  };
  return competitionNames[competitionSlug] || competitionSlug;
};

export const generateMatchSlug = (fixture: Fixture): string => {
  // Legacy function - now returns SEO slug without ID
  return generateSeoMatchSlug(fixture);
};

export const parseMatchSlug = (slug: string): number | null => {
  // Extract ID from the beginning of the slug
  const match = slug.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
};

// LEGACY FUNCTIONS - DO NOT USE - Use generateSeoMatchUrl and generateSeoSimpleMatchUrl instead
// These are kept for backward compatibility but redirect to new SEO URLs
export const generateMatchUrl = (fixture: Fixture): string => generateSeoMatchUrl(fixture);

export const generateSimpleMatchSlug = (fixture: SimpleFixture): string => {
  // Legacy function - now returns SEO slug without ID
  return generateSeoSimpleMatchSlug(fixture);
};

export const generateSimpleMatchUrl = (fixture: SimpleFixture): string => generateSeoSimpleMatchUrl(fixture);

// NEW SEO-FRIENDLY URL FUNCTIONS

export const generateSeoMatchSlug = (fixture: Fixture): string => {
  const homeSlug = generateCleanSlug(cleanTeamName(fixture.home.name));
  const awaySlug = generateCleanSlug(cleanTeamName(fixture.away.name));
  const competitionSlug = fixture.competition_id ? mapCompetitionIdToSlug(fixture.competition_id) : 'unknown';
  const dateSlug = formatDateForSeoUrl(fixture.kickoff_utc);

  return `${homeSlug}-vs-${awaySlug}-${competitionSlug}-${dateSlug}`;
};

export const generateSeoMatchUrl = (fixture: Fixture): string => `/fixtures/${generateSeoMatchSlug(fixture)}`;

export const generateSeoSimpleMatchSlug = (fixture: SimpleFixture): string => {
  const homeSlug = generateCleanSlug(cleanTeamName(fixture.home_team));
  const awaySlug = generateCleanSlug(cleanTeamName(fixture.away_team));
  const competitionSlug = fixture.competition_id ? mapCompetitionIdToSlug(fixture.competition_id) : 'unknown';
  const dateSlug = formatDateForSeoUrl(fixture.kickoff_utc);

  return `${homeSlug}-vs-${awaySlug}-${competitionSlug}-${dateSlug}`;
};

export const generateSeoSimpleMatchUrl = (fixture: SimpleFixture): string => `/fixtures/${generateSeoSimpleMatchSlug(fixture)}`;

// Parse new SEO-friendly URLs to extract match information
export const parseSeoMatchSlug = (slug: string): { homeTeam: string; awayTeam: string; competition: string; date: string } | null => {
  try {
    // Expected format: "liverpool-vs-club-atltico-de-madrid-champions-league-17-sept-2025"
    const parts = slug.split('-');
    if (parts.length < 6) return null;

    const vsIndex = parts.indexOf('vs');
    if (vsIndex === -1) return null;

    // Find date parts (last 3 parts should be day-month-year)
    const year = parts[parts.length - 1];
    const month = parts[parts.length - 2];
    const day = parts[parts.length - 3];

    // Validate date format
    if (!/^\d{4}$/.test(year) || !/^\d{1,2}$/.test(day)) return null;

    // Known competition slugs to help identify where competition starts
    const knownCompetitions = [
      'premier-league', 'champions-league', 'europa-league', 'bundesliga',
      'la-liga', 'serie-a', 'ligue-1', 'championship', 'fa-cup', 'league-cup',
      'primeira-liga', 'eredivisie'
    ];

    // Home team is everything before 'vs'
    const homeTeam = parts.slice(0, vsIndex).join('-');

    // Find competition by looking for known competition slugs
    let competitionIndex = -1;
    let competitionSlug = '';

    for (const comp of knownCompetitions) {
      const compParts = comp.split('-');
      const compLength = compParts.length;

      // Check if this competition appears before the date
      for (let i = vsIndex + 1; i <= parts.length - 3 - compLength; i++) {
        const potentialComp = parts.slice(i, i + compLength).join('-');
        if (potentialComp === comp) {
          competitionIndex = i;
          competitionSlug = comp;
          break;
        }
      }
      if (competitionIndex !== -1) break;
    }

    if (competitionIndex === -1) {
      // Fallback: assume competition is everything after away team and before date
      console.warn('Could not identify competition in URL:', slug);
      return null;
    }

    // Away team is everything between 'vs' and competition
    const awayTeam = parts.slice(vsIndex + 1, competitionIndex).join('-');

    return {
      homeTeam,
      awayTeam,
      competition: competitionSlug,
      date: `${day}-${month}-${year}`
    };
  } catch (error) {
    console.error('Error parsing SEO match slug:', slug, error);
    return null;
  }
};

export const updateDocumentMeta = (meta: {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
}) => {
  // Update title
  if (meta.title) {
    // Only update if different from site name to avoid overriding
    if (!meta.title.includes('Match Locator')) {
      document.title = `${meta.title} | Match Locator`;
    } else {
      document.title = meta.title;
    }
  }

  // Helper function to update or create meta tag
  const updateMetaTag = (property: string, content: string, isProperty = false) => {
    const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
    let metaTag = document.querySelector(selector) as HTMLMetaElement;
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      if (isProperty) {
        metaTag.setAttribute('property', property);
      } else {
        metaTag.setAttribute('name', property);
      }
      document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', content);
  };

  // Update description
  if (meta.description) {
    updateMetaTag('description', meta.description);
  }

  // Update canonical URL
  if (meta.canonical) {
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', meta.canonical);
  }

  // Update Open Graph tags
  if (meta.ogTitle) {
    updateMetaTag('og:title', meta.ogTitle, true);
  }

  if (meta.ogDescription) {
    updateMetaTag('og:description', meta.ogDescription, true);
  }

  if (meta.ogImage) {
    updateMetaTag('og:image', meta.ogImage, true);
  }

  if (meta.ogUrl) {
    updateMetaTag('og:url', meta.ogUrl, true);
  }

  // Always set og:type for consistency
  updateMetaTag('og:type', 'website', true);
};

export const generateMatchMeta = (fixture: Fixture) => {
  const homeShort = formatTeamNameShort(fixture.home.name);
  const awayShort = formatTeamNameShort(fixture.away.name);
  const date = formatDateForTitle(fixture.kickoff_utc);
  const time = formatTimeForMeta(fixture.kickoff_utc);

  // Get broadcaster info for title
  const broadcasterForTitle = fixture.blackout?.is_blackout
    ? 'No UK Broadcast'
    : fixture.providers_uk.length > 0
      ? fixture.providers_uk[0].name // Use first/main broadcaster for title
      : 'Find Channel';

  // Build optimized title: "[Home] vs [Away] TV Schedule - [Broadcaster] | [Date] | Match Locator"
  const title = `${homeShort} vs ${awayShort} TV Schedule - ${broadcasterForTitle} | ${date} | Match Locator`;

  // Get broadcaster list for description
  const broadcasterText = fixture.blackout?.is_blackout
    ? 'Not shown on UK TV'
    : fixture.providers_uk.length > 0
      ? fixture.providers_uk.map(p => p.name).join(', ')
      : 'Broadcaster to be confirmed';

  // Optimized description with urgency and channel emphasis
  const description = fixture.blackout?.is_blackout
    ? `${homeShort} vs ${awayShort} - ${date} at ${time}. Not shown on UK TV. Find alternative viewing options and full match preview.`
    : fixture.providers_uk.length > 0
      ? `${homeShort} vs ${awayShort} LIVE on ${broadcasterText} - ${date} at ${time}. Watch on UK TV. Get ${broadcasterText}, team news & streaming guide.`
      : `${homeShort} vs ${awayShort} - ${date} at ${time}. UK TV channel TBC. Check latest broadcast info, kick-off time & how to watch.`;

  const ogImage = fixture.home.crest || fixture.away.crest || '/favicon.png';
  const canonical = `${CANONICAL_BASE}${generateSeoMatchUrl(fixture)}`;

  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage: ogImage,
    ogUrl: canonical
  };
};

export const generateSimpleMatchMeta = (fixture: SimpleFixture) => {
  const homeShort = formatTeamNameShort(fixture.home_team);
  const awayShort = formatTeamNameShort(fixture.away_team);
  const date = formatDateForTitle(fixture.kickoff_utc);
  const time = formatTimeForMeta(fixture.kickoff_utc);

  // Get broadcaster info for title
  const broadcasterForTitle = fixture.isBlackout
    ? 'No UK Broadcast'
    : fixture.broadcaster || 'Find Channel';

  // Build optimized title: "[Home] vs [Away] TV Schedule - [Broadcaster] | [Date] | Match Locator"
  const title = `${homeShort} vs ${awayShort} TV Schedule - ${broadcasterForTitle} | ${date} | Match Locator`;

  // Optimized description with urgency and channel emphasis
  const description = fixture.isBlackout
    ? `${homeShort} vs ${awayShort} - ${date} at ${time}. Not shown on UK TV. Find alternative viewing options and full match preview.`
    : fixture.broadcaster
      ? `${homeShort} vs ${awayShort} LIVE on ${fixture.broadcaster} - ${date} at ${time}. Watch on UK TV. Get ${fixture.broadcaster}, team news & streaming guide.`
      : `${homeShort} vs ${awayShort} - ${date} at ${time}. UK TV channel TBC. Check latest broadcast info, kick-off time & how to watch.`;

  const ogImage = fixture.home_crest || fixture.away_crest || '/favicon.png';
  const canonical = `${CANONICAL_BASE}${generateSeoSimpleMatchUrl(fixture)}`;

  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage: ogImage,
    ogUrl: canonical
  };
};

export const generateTeamMeta = (
  team: Team,
  upcomingCount: number = 0,
  nextMatch?: { opponent: string; date: string; channel?: string }
) => {
  const teamShort = formatTeamNameShort(team.name);
  const season = getCurrentSeason();

  // Optimized title targeting "what time is [team] playing" searches
  const title = `${teamShort} TV Schedule - What Time Are ${teamShort} Playing? | Match Locator`;

  // Enhanced description with next match info if available
  let description: string;
  if (nextMatch) {
    const channelInfo = nextMatch.channel
      ? ` on ${nextMatch.channel}`
      : ' - channel TBC';
    description = `${teamShort} next play ${nextMatch.opponent} ${nextMatch.date}${channelInfo}. Complete ${season} TV schedule with all fixtures, kick-off times & UK broadcast info.`;
  } else {
    description = `Find out when ${teamShort} are playing next! Complete ${season} TV schedule with all kick-off times and UK broadcast channels. Sky Sports, TNT Sports, Amazon Prime & BBC coverage. Never miss a ${teamShort} match.`;
  }

  const canonical = `${CANONICAL_BASE}/clubs/${team.slug}`;

  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage: team.crest || '/favicon.png',
    ogUrl: canonical
  };
};

export const generateHomeMeta = () => {
  // Get current date for dynamic title
  const today = new Date();
  const dayName = today.toLocaleDateString('en-GB', { weekday: 'long' });

  // Optimized homepage title - focus on "Today's Matches"
  const title = `Football on TV Today ${dayName} - UK Schedule | Sky Sports, TNT | Match Locator`;

  // Optimized homepage description with urgency and channel names
  const description = `${dayName}'s football on UK TV. Live matches today on Sky Sports, TNT Sports, Amazon Prime. Get kick-off times, channels & how to watch Premier League, Champions League now.`;

  const canonical = `${CANONICAL_BASE}/`;

  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage: '/favicon.png',
    ogUrl: canonical
  };
};

export const generateFixturesMeta = () => {
  // Optimized fixtures page title - emphasize TV Schedule
  const title = 'Football Fixtures TV Schedule | This Week\'s Matches on TV | Match Locator';

  // Optimized fixtures page description
  const description = 'Complete football TV schedule and fixtures from Premier League, Champions League and more. Filter by competition, team, and broadcaster. Sky Sports, TNT Sports viewing guide.';

  const canonical = `${CANONICAL_BASE}/matches`;

  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage: '/favicon.png',
    ogUrl: canonical
  };
};

export const generateClubsMeta = () => {
  // Optimized clubs page title
  const title = 'All Premier League & European Football Teams - TV Schedules | Match Locator';

  // Optimized clubs page description
  const description = 'Complete list of football teams across all competitions. View fixtures, TV schedules, and viewing guides for every club. Premier League, Champions League teams.';

  const canonical = `${CANONICAL_BASE}/clubs`;

  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage: '/favicon.png',
    ogUrl: canonical
  };
};

export const generateCompetitionMeta = (competitionSlug: string) => {
  const competitionName = formatCompetitionName(competitionSlug);
  const season = getCurrentSeason();
  const broadcasters = getBroadcasterList(competitionSlug);

  // Optimized competition title: "[Competition] TV Schedule 2024/25 - Sky, TNT, Amazon | Match Locator"
  const title = `${competitionName} TV Schedule ${season} - ${broadcasters} | Match Locator`;

  // Optimized competition description: "Find out which channel is showing [Competition] matches! Complete UK TV guide..."
  const description = `Find out which channel is showing ${competitionName} matches! Complete UK TV schedule for ${broadcasters} and more. All fixtures, kick-off times, and where to watch every match.`;

  const canonical = `${CANONICAL_BASE}/competitions/${competitionSlug}`;

  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage: '/favicon.png',
    ogUrl: canonical
  };
};

export const generateCompetitionsOverviewMeta = () => {
  // Optimized competitions overview title
  const title = 'Football Competitions TV Guide UK - All Leagues | Match Locator';

  // Optimized competitions overview description
  const description = 'Complete guide to football competitions on UK TV. Premier League, Champions League, Europa League and more. Find fixtures and broadcast info for all leagues.';

  const canonical = `${CANONICAL_BASE}/competitions`;

  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage: '/favicon.png',
    ogUrl: canonical
  };
};

export const generatePageMeta = (params: {
  title: string;
  description: string;
  path: string;
}) => {
  const canonical = `${CANONICAL_BASE}${params.path}`;

  return {
    title: params.title,
    description: params.description,
    canonical,
    ogTitle: params.title,
    ogDescription: params.description,
    ogImage: '/favicon.png',
    ogUrl: canonical
  };
};

// Get list of popular Premier League teams (for internal linking fallback)
export const getPopularTeamSlugs = (): string[] => {
  return [
    'arsenal',
    'liverpool',
    'manchester-city',
    'manchester-united',
    'chelsea',
    'tottenham-hotspur'
  ];
};
