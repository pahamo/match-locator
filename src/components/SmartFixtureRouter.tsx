import React, { Suspense, useEffect } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { FixtureCardSkeleton } from './SkeletonLoader';
import { generateCanonicalH2HSlug } from '../utils/headToHead';
import { generateCleanSlug } from '../utils/seo';

// Lazy load both components
const MatchPage = React.lazy(() => import('../pages/MatchPage'));
const HeadToHeadPage = React.lazy(() => import('../pages/HeadToHeadPage'));

const PageLoader = () => (
  <div style={{ padding: '20px' }}>
    <FixtureCardSkeleton />
    <FixtureCardSkeleton />
  </div>
);

/**
 * Check if URL is pure H2H format (team1-vs-team2 only, no competition/date)
 * Match URLs follow format: team1-vs-team2-competition-17-sep-2024
 * H2H URLs follow format: team1-vs-team2
 */
const isH2HUrl = (slug: string): boolean => {
  // First check basic H2H pattern (must contain exactly one "-vs-")
  const parts = slug.split('-vs-');
  if (parts.length !== 2) return false;

  const beforeVs = parts[0];
  const afterVs = parts[1];

  // Basic validation: both parts should exist and not be empty
  if (!beforeVs || !afterVs) return false;

  // Check if URL contains competition names (strong indicator of match URL)
  const competitionPatterns = [
    '-premier-league-',
    '-champions-league-',
    '-europa-league-',
    '-bundesliga-',
    '-la-liga-',
    '-serie-a-',
    '-ligue-1-',
    '-championship-'
  ];

  const hasCompetition = competitionPatterns.some(pattern => slug.includes(pattern));
  if (hasCompetition) return false;

  // Check if URL contains a date pattern at the end (dd-mmm-yyyy)
  const datePattern = /\d{1,2}-(jan|feb|mar|apr|may|jun|jul|aug|sept|oct|nov|dec)-\d{4}$/i;
  const hasDateSuffix = datePattern.test(slug);
  if (hasDateSuffix) return false;

  // Additional safety: if afterVs contains more than 3 parts, likely a match URL
  const afterVsParts = afterVs.split('-');
  if (afterVsParts.length > 3) return false;

  // If it passes all checks, it's likely a pure H2H URL
  return true;
};

/**
 * Extract team names from legacy match URL
 * Pattern: /matches/123-arsenal-vs-liverpool-premier-league-2025-01-15
 */
const extractTeamsFromLegacyUrl = (slug: string): { team1: string; team2: string } | null => {
  try {
    // Split by '-vs-' to find the team boundary
    const parts = slug.split('-vs-');
    if (parts.length < 2) return null;

    // Clean team1: remove leading ID numbers
    const team1Raw = parts[0].replace(/^\d+-/, '');
    const team1 = generateCleanSlug(team1Raw);

    // Clean team2: remove competition and date suffix
    const team2Raw = parts[1]
      .replace(/-premier-league.*$/, '')
      .replace(/-champions-league.*$/, '')
      .replace(/-europa-league.*$/, '')
      .replace(/-\d{4}-\d{2}-\d{2}.*$/, '') // Remove date
      .replace(/-\d{1,2}-(jan|feb|mar|apr|may|jun|jul|aug|sept|oct|nov|dec)-\d{4}.*$/i, ''); // Remove formatted date

    const team2 = generateCleanSlug(team2Raw);

    if (!team1 || !team2) return null;

    return { team1, team2 };
  } catch (error) {
    console.error('Error extracting teams from legacy URL:', error);
    return null;
  }
};

/**
 * Smart router that determines whether to show MatchPage or HeadToHeadPage
 * based on the URL pattern, with legacy URL redirects
 *
 * PHASE 2: NOW WITH LEGACY MATCH URL REDIRECTS
 */
const SmartFixtureRouter: React.FC = () => {
  const { matchSlug, contentSlug } = useParams<{ matchSlug?: string; contentSlug?: string }>();
  const location = useLocation();
  const [redirectTo, setRedirectTo] = React.useState<string | null>(null);

  // Determine which slug to use based on the route
  const slug = contentSlug || matchSlug;
  const isContentRoute = location.pathname.startsWith('/content/');

  // Handle legacy match URL redirects
  useEffect(() => {
    if (slug && (location.pathname.startsWith('/matches/') || location.pathname.startsWith('/match/'))) {
      console.log('Legacy match URL detected:', location.pathname);

      // Try to extract teams from the legacy URL
      const teams = extractTeamsFromLegacyUrl(slug);

      if (teams) {
        // Generate canonical H2H URL and redirect
        const h2hSlug = generateCanonicalH2HSlug(teams.team1, teams.team2);
        const newUrl = `/h2h/${h2hSlug}`;

        console.log(`Redirecting ${location.pathname} -> ${newUrl}`);
        setRedirectTo(newUrl);
      } else {
        console.warn('Could not extract teams from legacy URL:', slug);
      }
    }
  }, [slug, location.pathname]);

  // Handle redirect
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!slug) {
    return <div>Invalid URL</div>;
  }

  try {
    // If it's a /content/ route, check if it's H2H format
    if (isContentRoute) {
      if (isH2HUrl(slug)) {
        // Content H2H URL like /content/arsenal-vs-chelsea
        return (
          <Suspense fallback={<PageLoader />}>
            <HeadToHeadPage />
          </Suspense>
        );
      } else {
        // Future content types (guides, etc.) - for now fallback to MatchPage
        return (
          <Suspense fallback={<PageLoader />}>
            <MatchPage />
          </Suspense>
        );
      }
    } else {
      // Legacy /fixtures/ route - check if it's H2H format
      if (isH2HUrl(slug)) {
        // This is a Head-to-Head URL on /fixtures/ (legacy)
        return (
          <Suspense fallback={<PageLoader />}>
            <HeadToHeadPage />
          </Suspense>
        );
      } else {
        // This is a regular match URL (includes competition/date)
        return (
          <Suspense fallback={<PageLoader />}>
            <MatchPage />
          </Suspense>
        );
      }
    }
  } catch (error) {
    // Fallback to MatchPage if there's any routing error
    console.error('SmartFixtureRouter error:', error);
    return (
      <Suspense fallback={<PageLoader />}>
        <MatchPage />
      </Suspense>
    );
  }
};

export default SmartFixtureRouter;