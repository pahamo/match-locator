import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import StructuredData from '../components/StructuredData';
import { FixtureCard } from '../design-system';
import CountdownTimer from '../components/CountdownTimer';
import LiveBadge from '../components/LiveBadge';
import { getFixturesByDateRange } from '../services/supabase';
import { getUKDate, getFormattedDateForSEO } from '../utils/dateRange';
import { updateDocumentMeta } from '../utils/seo';
import { generateBreadcrumbs } from '../utils/breadcrumbs';
import { getMatchStatus } from '../utils/matchStatus';
import type { Fixture } from '../types';

const ThisWeekendFixturesPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Get this weekend's date range (Friday evening to Sunday night)
  const getThisWeekendRange = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Find the next Friday (or current Friday if it's Friday after 4pm)
    let startDate = new Date(now);
    const currentHour = now.getHours();

    if (currentDay === 5 && currentHour >= 16) {
      // It's Friday after 4pm - start from today
      startDate = new Date(now);
    } else if (currentDay === 6) {
      // It's Saturday - start from yesterday (Friday)
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 1);
    } else if (currentDay === 0) {
      // It's Sunday - start from 2 days ago (Friday)
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 2);
    } else {
      // Find next Friday
      const daysUntilFriday = (5 - currentDay + 7) % 7;
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() + daysUntilFriday);
    }

    // Set start to Friday 4pm
    startDate.setHours(16, 0, 0, 0);

    // End on Sunday 11:59pm
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2); // Friday + 2 = Sunday
    endDate.setHours(23, 59, 59, 999);

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
  };

  const fetchWeekendFixtures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { start, end } = getThisWeekendRange();
      const weekendFixtures = await getFixturesByDateRange(start, end);

      // Sort by kickoff time
      const sortedFixtures = weekendFixtures.sort((a, b) =>
        new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime()
      );

      setFixtures(sortedFixtures);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching weekend fixtures:', err);
      setError('Failed to load this weekend\'s fixtures. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWeekendFixtures();
    }, 120000);

    return () => clearInterval(interval);
  }, [fetchWeekendFixtures]);

  // Initial load
  useEffect(() => {
    fetchWeekendFixtures();
  }, [fetchWeekendFixtures]);

  // Update SEO meta
  useEffect(() => {
    const meta = {
      title: 'Football on TV This Weekend - UK Schedule | Match Locator',
      description: 'This weekend\'s football matches on TV - Friday evening through Sunday night. Complete UK TV schedule for Sky Sports, TNT Sports, BBC, and more.',
      canonical: `${process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com'}/matches/this-weekend`,
      ogTitle: 'Football on TV This Weekend - UK Schedule',
      ogDescription: 'This weekend\'s football matches on TV with complete UK broadcasting information.',
      ogImage: `${process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com'}/og-weekend-fixtures.jpg`
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
        <StructuredData type="faq" />
        <Header />
        <Breadcrumbs items={generateBreadcrumbs('/matches/this-weekend')} />
        <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <h1>Loading weekend fixtures...</h1>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <StructuredData type="faq" />
        <Header />
        <Breadcrumbs items={generateBreadcrumbs('/matches/this-weekend')} />
        <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <h1>Error</h1>
            <p style={{ color: 'var(--color-error)', marginBottom: '24px' }}>{error}</p>
            <button
              onClick={fetchWeekendFixtures}
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
      <StructuredData type="faq" />
      <Header />
      <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
        <Breadcrumbs items={generateBreadcrumbs('/matches/this-weekend')} />

        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            🏆 Football on TV This Weekend
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
              Friday Evening to Sunday Night • Live UK TV Schedule
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px'
            }}>
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              <span>Updates every 2 minutes</span>
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
            to="/matches/today"
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
            Today's Fixtures
          </Link>
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
            Tomorrow's Fixtures
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
              No matches this weekend
            </h2>
            <p style={{
              marginBottom: '24px',
              color: 'var(--color-text-secondary)',
              maxWidth: '400px',
              margin: '0 auto 24px'
            }}>
              There are no football matches scheduled for this weekend. Check today's fixtures or browse all upcoming matches.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link
                to="/matches/today"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 'var(--border-radius-md)',
                  fontWeight: '500'
                }}
              >
                Today's Fixtures
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
              ⏰ Upcoming This Weekend ({upcomingFixtures.length})
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
              ✅ Finished This Weekend ({finishedFixtures.length})
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
              All times shown in UK timezone. Weekend fixtures include Friday evening through Sunday night.
              <br />
              Showing {fixtures.length} match{fixtures.length !== 1 ? 'es' : ''} for this weekend.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ThisWeekendFixturesPage;