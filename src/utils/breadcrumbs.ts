import { BreadcrumbItem } from '../components/Breadcrumbs';

// Competition slug to display name mapping
const getCompetitionDisplayName = (slug: string): string => {
  const names: Record<string, string> = {
    'premier-league': 'Premier League',
    'champions-league': 'Champions League',
    'europa-league': 'Europa League',
    'bundesliga': 'Bundesliga',
    'la-liga': 'La Liga',
    'serie-a': 'Serie A',
    'ligue-1': 'Ligue 1',
    'championship': 'Championship',
    'league-cup': 'League Cup',
    'fa-cup': 'FA Cup',
    'community-shield': 'Community Shield'
  };
  return names[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Parse match slug to extract team names
const parseMatchSlug = (slug: string): { homeTeam: string; awayTeam: string } | null => {
  // Handle both old format (id-team-vs-team) and new format (team-vs-team-competition-date)
  const parts = slug.split('-');
  const vsIndex = parts.indexOf('vs');

  if (vsIndex === -1) return null;

  let homeTeam: string;
  let awayTeam: string;

  // Check if it starts with a number (old format)
  if (/^\d+$/.test(parts[0])) {
    // Old format: id-team-vs-team-date
    homeTeam = parts.slice(1, vsIndex).join(' ');
    awayTeam = parts.slice(vsIndex + 1, parts.length - 1).join(' ');
  } else {
    // New format: team-vs-team-competition-date
    homeTeam = parts.slice(0, vsIndex).join(' ');
    // Find where competition starts (after away team)
    const restAfterVs = parts.slice(vsIndex + 1);
    const datePattern = /^\d{1,2}-(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-\d{4}$/i;

    // Find the last 3 parts that match the date pattern
    let awayTeamEnd = restAfterVs.length - 3; // Default: assume last 3 are date
    for (let i = restAfterVs.length - 3; i >= 0; i--) {
      const testDate = restAfterVs.slice(i, i + 3).join('-');
      if (datePattern.test(testDate)) {
        awayTeamEnd = i;
        break;
      }
    }

    // Everything before the competition is the away team
    awayTeam = restAfterVs.slice(0, Math.max(1, awayTeamEnd - 1)).join(' ');
  }

  // Clean up team names
  return {
    homeTeam: homeTeam.replace(/\b\w/g, l => l.toUpperCase()),
    awayTeam: awayTeam.replace(/\b\w/g, l => l.toUpperCase())
  };
};

// Generate breadcrumbs based on pathname and optional data
export const generateBreadcrumbs = (
  pathname: string,
  options: {
    matchTitle?: string;
    teamName?: string;
    competitionName?: string;
    competitionSlug?: string;
    customTitle?: string;
  } = {}
): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];

  const pathParts = pathname.split('/').filter(Boolean);

  // Handle different route patterns
  switch (pathParts[0]) {
    case 'fixtures':
      if (pathParts.length === 1) {
        // /fixtures
        breadcrumbs.push({ label: 'Matches' });
      } else if (pathParts[1] === 'today') {
        // /fixtures/today
        breadcrumbs.push(
          { label: 'Matches', href: '/matches' },
          { label: 'Today' }
        );
      } else if (pathParts[1] === 'tomorrow') {
        // /fixtures/tomorrow
        breadcrumbs.push(
          { label: 'Matches', href: '/matches' },
          { label: 'Tomorrow' }
        );
      } else if (pathParts[1] === 'this-weekend') {
        // /fixtures/this-weekend
        breadcrumbs.push(
          { label: 'Matches', href: '/matches' },
          { label: 'This Weekend' }
        );
      } else {
        // /fixtures/match-slug (individual match)
        const matchSlug = pathParts[1];
        const parsedMatch = parseMatchSlug(matchSlug);

        breadcrumbs.push(
          { label: 'Fixtures', href: '/fixtures' }
        );

        if (options.matchTitle) {
          breadcrumbs.push({ label: options.matchTitle });
        } else if (parsedMatch) {
          breadcrumbs.push({ label: `${parsedMatch.homeTeam} vs ${parsedMatch.awayTeam}` });
        } else {
          breadcrumbs.push({ label: 'Match Details' });
        }
      }
      break;

    case 'content':
      if (pathParts.length === 1) {
        // /content
        breadcrumbs.push({ label: 'Content' });
      } else {
        // /content/content-slug (H2H pages, guides, etc.)
        const contentSlug = pathParts[1];

        breadcrumbs.push(
          { label: 'Content', href: '/content' }
        );

        // Check if it's an H2H page format
        if (contentSlug.includes('-vs-')) {
          const parts = contentSlug.split('-vs-');
          if (parts.length === 2) {
            const team1 = parts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const team2 = parts[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            breadcrumbs.push({ label: `${team1} vs ${team2}` });
          } else {
            breadcrumbs.push({ label: contentSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) });
          }
        } else {
          // Future content types (guides, etc.)
          breadcrumbs.push({ label: contentSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) });
        }
      }
      break;

    case 'matches':
      // Legacy /matches routes - redirect to fixtures pattern
      const matchSlug = pathParts[1];
      const parsedMatch = parseMatchSlug(matchSlug);

      breadcrumbs.push(
        { label: 'Matches', href: '/matches' }
      );

      if (options.matchTitle) {
        breadcrumbs.push({ label: options.matchTitle });
      } else if (parsedMatch) {
        breadcrumbs.push({ label: `${parsedMatch.homeTeam} vs ${parsedMatch.awayTeam}` });
      } else {
        breadcrumbs.push({ label: 'Match Details' });
      }
      break;

    case 'clubs':
      if (pathParts.length === 1) {
        // /clubs
        breadcrumbs.push({ label: 'Clubs' });
      } else {
        // /clubs/team-slug
        breadcrumbs.push(
          { label: 'Clubs', href: '/clubs' }
        );

        if (options.teamName) {
          breadcrumbs.push({ label: options.teamName });
        } else {
          // Try to extract team name from slug
          const teamSlug = pathParts[1];
          const teamName = teamSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          breadcrumbs.push({ label: teamName });
        }
      }
      break;

    case 'competitions':
      if (pathParts.length === 1) {
        // /competitions
        breadcrumbs.push({ label: 'Competitions' });
      } else if (pathParts[1] === 'champions-league' && pathParts[2] === 'group-stage') {
        // /competitions/champions-league/group-stage
        breadcrumbs.push(
          { label: 'Competitions', href: '/competitions' },
          { label: 'Champions League', href: '/competitions/champions-league' },
          { label: 'Group Stage' }
        );
      } else {
        // /competitions/competition-slug
        const competitionSlug = pathParts[1];
        breadcrumbs.push(
          { label: 'Competitions', href: '/competitions' }
        );

        if (options.competitionName) {
          breadcrumbs.push({ label: options.competitionName });
        } else {
          const competitionName = getCompetitionDisplayName(competitionSlug);
          breadcrumbs.push({ label: competitionName });
        }
      }
      break;

    case 'providers':
      // /providers/provider-slug
      breadcrumbs.push({ label: 'TV Providers', href: '/clubs' }); // Link to clubs as there's no providers index

      if (pathParts[1]) {
        const providerName = pathParts[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        breadcrumbs.push({ label: providerName });
      }
      break;

    case 'about':
      breadcrumbs.push({ label: 'About' });
      break;

    case 'contact':
      breadcrumbs.push({ label: 'Contact' });
      break;

    case 'how-to-watch':
      if (pathParts.length === 1) {
        // /how-to-watch
        breadcrumbs.push({ label: 'How to Watch' });
      } else {
        // /how-to-watch/provider-slug
        breadcrumbs.push(
          { label: 'How to Watch', href: '/how-to-watch' }
        );

        if (options.customTitle) {
          breadcrumbs.push({ label: options.customTitle });
        } else {
          const providerSlug = pathParts[1];
          let providerName = providerSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

          // Special cases for better display names
          if (providerSlug === 'sky-sports') providerName = 'Sky Sports';
          if (providerSlug === 'tnt-sports') providerName = 'TNT Sports';
          if (providerSlug === 'premier-league') providerName = 'Premier League';

          breadcrumbs.push({ label: providerName });
        }
      }
      break;

    case 'support':
      breadcrumbs.push({ label: 'How We Support This Site' });
      break;

    case 'how-we-make-money':
      breadcrumbs.push({ label: 'How We Support This Site' });
      break;

    case 'affiliate-disclosure':
      breadcrumbs.push({ label: 'Affiliate Disclosure' });
      break;

    case 'legal':
      breadcrumbs.push({ label: 'Legal' });

      if (pathParts[1]) {
        const legalPageMap: Record<string, string> = {
          'privacy-policy': 'Privacy Policy',
          'cookie-policy': 'Cookie Policy',
          'terms': 'Terms of Service'
        };

        const pageName = legalPageMap[pathParts[1]] || pathParts[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        breadcrumbs.push({ label: pageName });
      }
      break;

    case 'admin':
      breadcrumbs.push({ label: 'Admin' });

      if (pathParts[1]) {
        const adminPageMap: Record<string, string> = {
          'teams': 'Teams',
          'matches': 'Matches',
          'competitions': 'Competitions'
        };

        const pageName = adminPageMap[pathParts[1]] || pathParts[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        breadcrumbs.push({ label: pageName });
      }
      break;

    default:
      // Custom pages or unknown routes
      if (options.customTitle) {
        breadcrumbs.push({ label: options.customTitle });
      }
      break;
  }

  return breadcrumbs;
};

// Hook to use breadcrumbs with current location
export const useBreadcrumbs = (options: Parameters<typeof generateBreadcrumbs>[1] = {}) => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  return generateBreadcrumbs(pathname, options);
};