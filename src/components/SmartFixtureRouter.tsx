import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { parseH2HSlug } from '../utils/headToHead';
import { FixtureCardSkeleton } from './SkeletonLoader';

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
 * Smart router that determines whether to show MatchPage or HeadToHeadPage
 * based on the URL pattern
 *
 * IMPROVED H2H ROUTING - NOW WITH BETTER PATTERN DETECTION
 */
const SmartFixtureRouter: React.FC = () => {
  const { matchSlug } = useParams<{ matchSlug: string }>();

  if (!matchSlug) {
    return <div>Invalid URL</div>;
  }

  try {
    // Check if this is a pure H2H pattern with improved logic
    if (isH2HUrl(matchSlug)) {
      // This is a Head-to-Head URL
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