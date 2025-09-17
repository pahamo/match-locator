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
 */
const isH2HUrl = (slug: string): boolean => {
  const h2hPattern = parseH2HSlug(slug);
  if (!h2hPattern) return false;

  // If the slug exactly matches "team1-vs-team2", it's H2H
  // If it has extra segments (competition, date), it's a match URL
  const reconstructed = `${h2hPattern.team1Slug}-vs-${h2hPattern.team2Slug}`;
  return slug === reconstructed;
};

/**
 * Smart router that determines whether to show MatchPage or HeadToHeadPage
 * based on the URL pattern
 */
const SmartFixtureRouter: React.FC = () => {
  const { matchSlug } = useParams<{ matchSlug: string }>();

  if (!matchSlug) {
    return <div>Invalid URL</div>;
  }

  // Check if this is a pure H2H pattern (team1-vs-team2 only)
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
};

export default SmartFixtureRouter;