import type { Fixture, Team, SimpleFixture } from '../types';

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

export const formatDateForUrl = (date: string): string => {
  return new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
};

export const generateMatchSlug = (fixture: Fixture): string => {
  const homeSlug = slugify(fixture.home.name);
  const awaySlug = slugify(fixture.away.name);
  const dateSlug = formatDateForUrl(fixture.kickoff_utc);
  
  return `${fixture.id}-${homeSlug}-vs-${awaySlug}-${dateSlug}`;
};

export const parseMatchSlug = (slug: string): number | null => {
  // Extract ID from the beginning of the slug
  const match = slug.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
};

export const generateMatchUrl = (fixture: Fixture): string => `/matches/${generateMatchSlug(fixture)}`;

export const generateSimpleMatchSlug = (fixture: SimpleFixture): string => {
  const homeSlug = slugify(fixture.home_team);
  const awaySlug = slugify(fixture.away_team);
  const dateSlug = formatDateForUrl(fixture.kickoff_utc);
  
  return `${fixture.id}-${homeSlug}-vs-${awaySlug}-${dateSlug}`;
};

export const generateSimpleMatchUrl = (fixture: SimpleFixture): string => `/matches/${generateSimpleMatchSlug(fixture)}`;

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
  const date = new Date(fixture.kickoff_utc).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const broadcaster = fixture.blackout?.is_blackout
    ? 'Not available in UK'
    : fixture.providers_uk.length > 0
      ? fixture.providers_uk.map(p => p.name).join(', ')
      : 'TBD';

  const title = `${fixture.home.name} vs ${fixture.away.name}`;

  const description = `${fixture.home.name} vs ${fixture.away.name} on ${date}. ${
    fixture.blackout?.is_blackout
      ? 'Not shown on UK TV.'
      : fixture.providers_uk.length > 0
        ? `Watch on ${broadcaster}.`
        : 'Broadcaster to be confirmed.'
  } UK Premier League TV schedule.`;

  const ogImage = fixture.home.crest || fixture.away.crest || '/favicon.png';
  const canonical = `${CANONICAL_BASE}${generateMatchUrl(fixture)}`;

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
  const date = new Date(fixture.kickoff_utc).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const broadcaster = fixture.isBlackout
    ? 'Not available in UK'
    : fixture.broadcaster || 'TBD';

  const title = `${fixture.home_team} vs ${fixture.away_team}`;

  const description = `${fixture.home_team} vs ${fixture.away_team} on ${date}. ${
    fixture.isBlackout
      ? 'Not shown on UK TV.'
      : fixture.broadcaster
        ? `Watch on ${broadcaster}.`
        : 'Broadcaster to be confirmed.'
  } UK Premier League TV schedule.`;

  const ogImage = fixture.home_crest || fixture.away_crest || '/favicon.png';
  const canonical = `${CANONICAL_BASE}${generateSimpleMatchUrl(fixture)}`;

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

export const generateTeamMeta = (team: Team, upcomingCount: number = 0) => {
  const title = `${team.name} fixtures and TV schedule - Premier League`;
  const description = `${team.name} upcoming Premier League fixtures and TV schedule. ${upcomingCount} matches remaining. Sky Sports, TNT Sports, BBC viewing guide.`;
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
  const title = 'fixtures.app - Premier League TV Guide UK';
  const description = 'Premier League TV Guide UK - Sky Sports & TNT Sports fixtures. Find which broadcaster shows every Premier League match.';
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
  const title = 'Premier League Fixtures & TV Schedule - fixtures.app';
  const description = 'Complete Premier League fixtures and TV schedule. Filter by team, matchweek, and broadcaster. Sky Sports, TNT Sports, BBC viewing guide.';
  const canonical = `${CANONICAL_BASE}/fixtures`;

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
  const title = 'Premier League Teams - fixtures.app';
  const description = 'All 20 Premier League teams. View fixtures, TV schedules, and viewing guides for every club.';
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
