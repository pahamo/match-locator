import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import StructuredData from '../components/StructuredData';
import { StatusBar } from '../components/StatusBar';
import { Card } from '../design-system/components/Card';
import Flex from '../design-system/components/Layout/Flex';
import { FixtureCard } from '../design-system';
import { PopularTeamsGrid } from '../components/PopularTeamsGrid';
import { PopularCompetitionsGrid } from '../components/PopularCompetitionsGrid';
import { WeekendPreviewSection } from '../components/WeekendPreviewSection';
import { getFixturesByDateRange } from '../services/supabase';
import { getTodayUTCRange, getFormattedDateForSEO, getUKDate, getTimeUntilMidnight } from '../utils/dateRange';
import { updateDocumentMeta } from '../utils/seo';
import { generateBreadcrumbs } from '../utils/breadcrumbs';
import { getMatchStatus } from '../utils/matchStatus';
import type { Fixture } from '../types';

const TodayFixturesPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchTodayFixtures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { start, end } = getTodayUTCRange();
      const todayFixtures = await getFixturesByDateRange(start, end);

      // Sort by kickoff time
      const sortedFixtures = todayFixtures.sort((a, b) =>
        new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime()
      );

      setFixtures(sortedFixtures);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching today\'s fixtures:', err);
      setError('Failed to load today\'s fixtures. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTodayFixtures();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchTodayFixtures]);

  // Refresh at midnight
  useEffect(() => {
    const timeUntilMidnight = getTimeUntilMidnight();
    const midnightTimeout = setTimeout(() => {
      fetchTodayFixtures();
      // Set up daily refresh
      const dailyRefresh = setInterval(fetchTodayFixtures, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyRefresh);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, [fetchTodayFixtures]);

  // Initial load
  useEffect(() => {
    fetchTodayFixtures();
  }, [fetchTodayFixtures]);

  // Update SEO meta
  useEffect(() => {
    const ukToday = getUKDate();
    const formattedDate = getFormattedDateForSEO(ukToday);

    const meta = {
      title: 'Football on TV Today - Live UK Schedule | Match Locator',
      description: `Find out which channel is showing football today! Complete ${formattedDate} TV guide for Sky Sports, TNT Sports, BBC & Amazon Prime. Live updates, kick-off times, and where to watch every match.`,
      canonical: `${process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com'}/matches/today`,
      ogTitle: 'Football on TV Today - Live UK Schedule',
      ogDescription: `Find out which channel is showing football today! ${formattedDate} TV guide with live updates.`,
      ogImage: `${process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com'}/og-today-fixtures.jpg`
    };

    updateDocumentMeta(meta);
  }, []);

  const liveFixtures = fixtures.filter(fixture =>
    getMatchStatus(fixture.kickoff_utc).status === 'live'
  );

  const upcomingFixtures = fixtures.filter(fixture => {
    const status = getMatchStatus(fixture.kickoff_utc).status;
    return status === 'upcoming' || status === 'upNext';
  });

  const finishedFixtures = fixtures.filter(fixture =>
    getMatchStatus(fixture.kickoff_utc).status === 'finished'
  );

  if (loading) {
    return (
      <div>
        <Header />
        <Breadcrumbs items={generateBreadcrumbs('/matches/today')} />
        <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <h1>Loading today's fixtures...</h1>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <Breadcrumbs items={generateBreadcrumbs('/matches/today')} />
        <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <h1>Error</h1>
            <p style={{ color: 'var(--color-error)', marginBottom: '24px' }}>{error}</p>
            <button
              onClick={fetchTodayFixtures}
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius-md)',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Generate dynamic FAQ data based on today's fixtures
  const faqData = [
    {
      question: "What football is on TV today in the UK?",
      answer: `Today (${getFormattedDateForSEO(getUKDate())}) there ${fixtures.length === 1 ? 'is' : 'are'} ${fixtures.length} football ${fixtures.length === 1 ? 'match' : 'matches'} on UK TV${liveFixtures.length > 0 ? `, with ${liveFixtures.length} currently live` : ''}. Matches are broadcast on Sky Sports, TNT Sports, Amazon Prime, and BBC. Check the full schedule above for kick-off times and channels.`
    },
    {
      question: "What channel is football on today?",
      answer: "Today's football matches are shown on Sky Sports (Premier League, EFL), TNT Sports (Champions League, Europa League), Amazon Prime Video (selected Premier League games), and BBC (FA Cup, selected matches). Check each match above for specific channel information."
    },
    {
      question: "Is there any football on TV tonight?",
      answer: fixtures.length > 0
        ? `Yes, there ${fixtures.length === 1 ? 'is' : 'are'} ${fixtures.length} football ${fixtures.length === 1 ? 'match' : 'matches'} on TV today${upcomingFixtures.length > 0 ? `, including ${upcomingFixtures.length} upcoming ${upcomingFixtures.length === 1 ? 'match' : 'matches'}` : ''}. See the complete schedule above with kick-off times and UK TV channels.`
        : "Check tomorrow's fixtures or the full match calendar for upcoming games on Sky Sports, TNT Sports, Amazon Prime and BBC."
    },
    {
      question: "What time does football start today?",
      answer: upcomingFixtures.length > 0
        ? `The next football match kicks off at ${new Date(upcomingFixtures[0].kickoff_utc).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} UK time on ${upcomingFixtures[0].providers_uk?.[0]?.name || 'TV'}.`
        : fixtures.length > 0
          ? `Today's football has already started. Check the live matches section above or view tomorrow's fixtures.`
          : "There are no matches scheduled for today. Check tomorrow's fixtures or the full match calendar."
    }
  ];

  return (
    <div>
      <StructuredData type="faq" data={faqData} />
      <Header />
      <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
        <Breadcrumbs items={generateBreadcrumbs('/matches/today')} />

        {/* Status Bar - Design System Component */}
        <StatusBar
          matchCount={fixtures.length}
          lastUpdated={lastUpdated}
          hasLiveMatches={liveFixtures.length > 0}
          liveKickoffTime={liveFixtures.length > 0 ? liveFixtures[0].kickoff_utc : undefined}
        />

        {/* Page Header - Compact with Tailwind */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3">
            ⚽ Football on TV Today - {getFormattedDateForSEO(getUKDate())}
          </h1>

          {/* Compact SEO Banner - Using Card with gradient */}
          <Card variant="primary" className="py-3 px-4">
            <p className="text-xs sm:text-sm text-center text-white leading-relaxed">
              Find every Premier League, Champions League, and FA Cup match on Sky Sports, TNT Sports, BBC & Amazon Prime — free, real-time updates
            </p>
          </Card>
        </div>

        {/* Quick Navigation - Using Flex and Tailwind */}
        <Flex gap="md" wrap="wrap" className="mb-8">
          <Link
            to="/matches/tomorrow"
            className="px-4 py-2 bg-card border border-border rounded-md no-underline text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            Tomorrow's Fixtures →
          </Link>
          <Link
            to="/matches"
            className="px-4 py-2 bg-card border border-border rounded-md no-underline text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            All Fixtures
          </Link>
        </Flex>

        {/* Discovery Sections - Always Visible */}
        {!loading && (
          <>
            <PopularTeamsGrid />
            <PopularCompetitionsGrid />
            <WeekendPreviewSection />
          </>
        )}

        {/* Today's Fixtures Section - Only show if there are matches today */}
        {fixtures.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-5 text-foreground">
              Today's Matches ({fixtures.length})
            </h2>
          </div>
        )}

        {/* No fixtures message - Using Card component */}
        {fixtures.length === 0 && !loading && (
          <Card variant="outline" className="text-center py-8 px-5 mb-8">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">
              No matches scheduled today
            </h2>
            <p className="text-sm text-muted-foreground">
              Explore popular teams and competitions above, or check this weekend's fixtures.
            </p>
          </Card>
        )}

        {/* Live Fixtures */}
        {liveFixtures.length > 0 && (
          <section className="mb-10">
            <Flex align="center" gap="sm" className="mb-5">
              <h2 className="text-2xl font-bold text-foreground">
                🔴 Live Now ({liveFixtures.length})
              </h2>
            </Flex>
            <Flex direction="column" gap="sm">
              {liveFixtures.map(fixture => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  variant="withTime"
                  showViewButton={true}
                />
              ))}
            </Flex>
          </section>
        )}

        {/* Upcoming Fixtures */}
        {upcomingFixtures.length > 0 && (
          <section className="mb-10">
            <Flex align="center" gap="sm" className="mb-5">
              <h2 className="text-2xl font-bold text-foreground">
                ⏰ Upcoming Today ({upcomingFixtures.length})
              </h2>
            </Flex>
            <Flex direction="column" gap="sm">
              {upcomingFixtures.map(fixture => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  variant="withTime"
                  showViewButton={true}
                />
              ))}
            </Flex>
          </section>
        )}

        {/* Finished Fixtures */}
        {finishedFixtures.length > 0 && (
          <section className="mb-10">
            <Flex align="center" gap="sm" className="mb-5">
              <h2 className="text-2xl font-bold text-foreground">
                ✅ Finished Today ({finishedFixtures.length})
              </h2>
            </Flex>
            <Flex direction="column" gap="sm">
              {finishedFixtures.map(fixture => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  variant="withTime"
                  showViewButton={true}
                  hideBroadcaster={true}
                />
              ))}
            </Flex>
          </section>
        )}

        {/* Footer info */}
        {fixtures.length > 0 && (
          <Card variant="outline" className="mt-12 p-6 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed m-0">
              All times shown in UK timezone. Page updates automatically every 60 seconds during match days.
              <br />
              Showing {fixtures.length} match{fixtures.length !== 1 ? 'es' : ''} for today.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TodayFixturesPage;