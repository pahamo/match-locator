import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import StructuredData from '../components/StructuredData';
import { FixtureCard } from '../design-system';
import LiveBadge from '../components/LiveBadge';
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
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <span>⚽ Football on TV Today - {getFormattedDateForSEO(getUKDate())}</span>
            {liveFixtures.length > 0 && (
              <LiveBadge kickoffTime={liveFixtures[0].kickoff_utc} variant="compact" />
            )}
          </h1>

          {/* Hero Value Proposition */}
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '12px',
            padding: 'clamp(20px, 4vw, 32px)',
            marginBottom: '24px',
            color: 'white',
            textAlign: 'center'
          }}>
            <p style={{
              margin: '0 0 12px 0',
              fontSize: 'clamp(18px, 3vw, 22px)',
              fontWeight: '600',
              lineHeight: '1.4'
            }}>
              Your Complete Guide to UK Football on TV
            </p>
            <p style={{
              margin: 0,
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              opacity: 0.95,
              lineHeight: '1.5',
              maxWidth: '800px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Find every Premier League, Champions League, and FA Cup match shown on Sky Sports, TNT Sports, BBC, and Amazon Prime. Real-time updates, kick-off times, and broadcast info — completely free.
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            color: 'var(--color-text-secondary)'
          }}>
            <p style={{ margin: 0, fontSize: '16px' }}>
              Live UK TV Schedule • {fixtures.length} {fixtures.length === 1 ? 'match' : 'matches'} today
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px'
            }}>
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              <span>Updates every 60 seconds</span>
            </div>
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

        {/* No fixtures message */}
        {fixtures.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '64px 20px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--color-border)'
          }}>
            <h2 style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
              No matches today
            </h2>
            <p style={{
              marginBottom: '24px',
              color: 'var(--color-text-secondary)',
              maxWidth: '400px',
              margin: '0 auto 24px'
            }}>
              There are no football matches scheduled for today. Check tomorrow's fixtures or browse all upcoming matches.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link
                to="/matches/tomorrow"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 'var(--border-radius-md)',
                  fontWeight: '500'
                }}
              >
                Tomorrow's Fixtures
              </Link>
              <Link
                to="/matches"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--color-border)',
                  fontWeight: '500'
                }}
              >
                All Fixtures
              </Link>
            </div>
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