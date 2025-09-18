import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import { FixtureCard } from '../design-system';
import CountdownTimer from '../components/CountdownTimer';
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
      description: `Today's football matches on TV - ${formattedDate}. Live UK schedules for Sky Sports, TNT Sports, BBC, and more. Real-time updates with kick-off times.`,
      canonical: `${process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com'}/fixtures/today`,
      ogTitle: 'Football on TV Today - Live UK Schedule',
      ogDescription: `Today's football matches on TV - ${formattedDate}. Live UK schedules with real-time updates.`,
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
        <Breadcrumbs items={generateBreadcrumbs('/fixtures/today')} />
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
        <Breadcrumbs items={generateBreadcrumbs('/fixtures/today')} />
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

  return (
    <div>
      <Header />
      <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
        <Breadcrumbs items={generateBreadcrumbs('/fixtures/today')} />
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            ⚽ Football on TV Today
            {liveFixtures.length > 0 && (
              <LiveBadge kickoffTime={liveFixtures[0].kickoff_utc} variant="compact" />
            )}
          </h1>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            color: 'var(--color-text-secondary)'
          }}>
            <p style={{ margin: 0, fontSize: '16px' }}>
              {getFormattedDateForSEO(getUKDate())} • Live UK TV Schedule
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px'
            }}>
              <span>Last updated: {lastUpdated.toLocaleTimeString('en-GB')}</span>
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
            to="/fixtures/tomorrow"
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
            to="/fixtures"
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
                to="/fixtures/tomorrow"
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
                to="/fixtures"
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
                  variant="default"
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
                  variant="default"
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
                  variant="compact"
                  showViewButton={false}
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