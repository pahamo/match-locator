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
  const h2hPattern = parseH2HSlug(slug);
  if (!h2hPattern) return false;

  // Check if URL contains a date pattern at the end (dd-mmm-yyyy)
  // Match URLs end with patterns like: "17-sept-2025", "03-jan-2025", etc.
  const datePattern = /\d{1,2}-(jan|feb|mar|apr|may|jun|jul|aug|sept|oct|nov|dec)-\d{4}$/i;
  const hasDateSuffix = datePattern.test(slug);

  // If it has a date suffix, it's a match URL
  // If no date suffix, it's likely an H2H URL
  return !hasDateSuffix;
};

/**
 * Smart router that determines whether to show MatchPage or HeadToHeadPage
 * based on the URL pattern
 *
 * TEMPORARILY DISABLED H2H ROUTING - ALL ROUTES GO TO MATCHPAGE
 */
const SmartFixtureRouter: React.FC = () => {
  const { matchSlug } = useParams<{ matchSlug: string }>();

  if (!matchSlug) {
    return <div>Invalid URL</div>;
  }

  // TEMPORARILY DISABLED: H2H routing causing issues with individual game pages
  // Always route to MatchPage for now
  return (
    <Suspense fallback={<PageLoader />}>
      <MatchPage />
    </Suspense>
  );

  // Original H2H logic (disabled):
  // if (isH2HUrl(matchSlug)) {
  //   return (
  //     <Suspense fallback={<PageLoader />}>
  //       <HeadToHeadPage />
  //     </Suspense>
  //   );
  // } else {
  //   return (
  //     <Suspense fallback={<PageLoader />}>
  //       <MatchPage />
  //     </Suspense>
  //   );
  // }
};

export default SmartFixtureRouter;