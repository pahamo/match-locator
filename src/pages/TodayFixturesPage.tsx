import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import StructuredData from '../components/StructuredData';
import { FixtureCard } from '../design-system';
import LiveBadge from '../components/LiveBadge';
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
        {/* Compact Status Bar */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '10px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '13px',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {liveFixtures.length > 0 && (
              <LiveBadge kickoffTime={liveFixtures[0].kickoff_utc} variant="compact" />
            )}
            <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>
              {fixtures.length} {fixtures.length === 1 ? 'match' : 'matches'} today
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '12px' }}>
            <span>Updated: {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>• Auto-updates</span>
          </div>
        </div>

        {/* Page Header - Compact */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            marginBottom: '12px',
            fontWeight: '700',
            lineHeight: '1.2'
          }}>
            ⚽ Football on TV Today - {getFormattedDateForSEO(getUKDate())}
          </h1>

          {/* Compact SEO Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: 'white',
            fontSize: 'clamp(13px, 2.5vw, 15px)',
            lineHeight: '1.5',
            textAlign: 'center'
          }}>
            Find every Premier League, Champions League, and FA Cup match on Sky Sports, TNT Sports, BBC & Amazon Prime — free, real-time updates
          </div>
        </div>

        {/* Quick Navigation */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          <Link
            to="/matches/tomorrow"
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-md)',
              textDecoration: 'none',
              color: 'var(--color-text)',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Tomorrow's Fixtures →
          </Link>
          <Link
            to="/matches"
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-md)',
              textDecoration: 'none',
              color: 'var(--color-text)',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            All Fixtures
          </Link>
        </div>

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
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '1.75rem',
              marginBottom: '20px',
              fontWeight: '700',
              color: 'var(--color-text)'
            }}>
              Today's Matches ({fixtures.length})
            </h2>
          </div>
        )}

        {/* No fixtures message - Simplified since discovery sections are always shown */}
        {fixtures.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '32px 20px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--color-border)',
            marginBottom: '32px'
          }}>
            <h2 style={{
              marginBottom: '12px',
              color: 'var(--color-text)',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              No matches scheduled today
            </h2>
            <p style={{
              margin: 0,
              color: 'var(--color-text-secondary)',
              fontSize: '0.95rem'
            }}>
              Explore popular teams and competitions above, or check this weekend's fixtures.
            </p>
          </div>
        )}

        {/* Live Fixtures */}
        {liveFixtures.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔴 Live Now ({liveFixtures.length})
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {liveFixtures.map(fixture => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  variant="withTime"
                  showViewButton={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Fixtures */}
        {upcomingFixtures.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⏰ Upcoming Today ({upcomingFixtures.length})
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {upcomingFixtures.map(fixture => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  variant="withTime"
                  showViewButton={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* Finished Fixtures */}
        {finishedFixtures.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ✅ Finished Today ({finishedFixtures.length})
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {finishedFixtures.map(fixture => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  variant="withTime"
                  showViewButton={true}
                  hideBroadcaster={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer info */}
        {fixtures.length > 0 && (
          <div style={{
            marginTop: '48px',
            padding: '24px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--color-border)',
            textAlign: 'center'
          }}>
            <p style={{
              margin: '0',
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6'
            }}>
              All times shown in UK timezone. Page updates automatically every 60 seconds during match days.
              <br />
              Showing {fixtures.length} match{fixtures.length !== 1 ? 'es' : ''} for today.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TodayFixturesPage;