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
 * Smart router that determines whether to show MatchPage or HeadToHeadPage
 * based on the URL pattern
 */
const SmartFixtureRouter: React.FC = () => {
  const { matchSlug } = useParams<{ matchSlug: string }>();

  if (!matchSlug) {
    return <div>Invalid URL</div>;
  }

  // Check if this is a H2H pattern (team1-vs-team2)
  const h2hPattern = parseH2HSlug(matchSlug);

  if (h2hPattern) {
    // This is a Head-to-Head URL
    return (
      <Suspense fallback={<PageLoader />}>
        <HeadToHeadPage />
      </Suspense>
    );
  } else {
    // This is a regular match URL
    return (
      <Suspense fallback={<PageLoader />}>
        <MatchPage />
      </Suspense>
    );
  }
};

export default SmartFixtureRouter;