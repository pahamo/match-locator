import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import StructuredData from '../components/StructuredData';
import { FixtureCard } from '../design-system';
import { getFixturesByDateRange } from '../services/supabase';
import { getTomorrowUTCRange, getFormattedDateForSEO, getUKDate, getTimeUntilMidnight } from '../utils/dateRange';
import { updateDocumentMeta } from '../utils/seo';
import { mapCompetitionIdToSlug } from '../utils/competitionMapping';
import { generateBreadcrumbs } from '../utils/breadcrumbs';
import type { Fixture } from '../types';

interface GroupedFixtures {
  [competitionSlug: string]: {
    name: string;
    fixtures: Fixture[];
  };
}

const TomorrowFixturesPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchTomorrowFixtures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { start, end } = getTomorrowUTCRange();
      const tomorrowFixtures = await getFixturesByDateRange(start, end);

      // Sort by kickoff time
      const sortedFixtures = tomorrowFixtures.sort((a, b) =>
        new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime()
      );

      setFixtures(sortedFixtures);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching tomorrow\'s fixtures:', err);
      setError('Failed to load tomorrow\'s fixtures. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 5 minutes (less frequent than today)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTomorrowFixtures();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchTomorrowFixtures]);

  // Refresh at midnight
  useEffect(() => {
    const timeUntilMidnight = getTimeUntilMidnight();
    const midnightTimeout = setTimeout(() => {
      fetchTomorrowFixtures();
      // Set up daily refresh
      const dailyRefresh = setInterval(fetchTomorrowFixtures, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyRefresh);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, [fetchTomorrowFixtures]);

  // Initial load
  useEffect(() => {
    fetchTomorrowFixtures();
  }, [fetchTomorrowFixtures]);

  // Update SEO meta
  useEffect(() => {
    const ukToday = getUKDate();
    const ukTomorrow = new Date(ukToday);
    ukTomorrow.setDate(ukTomorrow.getDate() + 1);
    const formattedDate = getFormattedDateForSEO(ukTomorrow);

    const meta = {
      title: 'Tomorrow\'s Football on TV - UK Schedule | Match Locator',
      description: `Tomorrow's football matches on TV - ${formattedDate}. Complete UK TV schedule for Sky Sports, TNT Sports, BBC, and more. Plan your viewing.`,
      canonical: `${process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com'}/matches/tomorrow`,
      ogTitle: 'Tomorrow\'s Football on TV - UK Schedule',
      ogDescription: `Tomorrow's football matches on TV - ${formattedDate}. Complete UK TV schedule.`,
      ogImage: `${process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com'}/og-tomorrow-fixtures.jpg`
    };

    updateDocumentMeta(meta);
  }, []);

  // Group fixtures by competition
  const groupedFixtures: GroupedFixtures = fixtures.reduce((acc, fixture) => {
    const competitionSlug = mapCompetitionIdToSlug(fixture.competition_id || 0);
    const competitionName = getCompetitionDisplayName(competitionSlug);

    if (!acc[competitionSlug]) {
      acc[competitionSlug] = {
        name: competitionName,
        fixtures: []
      };
    }

    acc[competitionSlug].fixtures.push(fixture);
    return acc;
  }, {} as GroupedFixtures);

  function getCompetitionDisplayName(slug: string): string {
    const names: Record<string, string> = {
      'premier-league': 'Premier League',
      'champions-league': 'Champions League',
      'europa-league': 'Europa League',
      'bundesliga': 'Bundesliga',
      'la-liga': 'La Liga',
      'serie-a': 'Serie A',
      'ligue-1': 'Ligue 1',
      'championship': 'Championship',
      'league-cup': 'League Cup',
      'fa-cup': 'FA Cup'
    };
    return names[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Calculate time until first match
  const firstMatch = fixtures[0];
  const timeUntilFirstMatch = firstMatch
    ? new Date(firstMatch.kickoff_utc).getTime() - new Date().getTime()
    : null;

  const formatTimeUntilFirstMatch = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <Breadcrumbs items={generateBreadcrumbs('/matches/tomorrow')} />
        <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <h1>Loading tomorrow's fixtures...</h1>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <Breadcrumbs items={generateBreadcrumbs('/matches/tomorrow')} />
        <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <h1>Error</h1>
            <p style={{ color: 'var(--color-error)', marginBottom: '24px' }}>{error}</p>
            <button
              onClick={fetchTomorrowFixtures}
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

  const ukTomorrow = new Date(getUKDate());
  ukTomorrow.setDate(ukTomorrow.getDate() + 1);

  // Generate dynamic FAQ data based on tomorrow's fixtures
  const faqData = [
    {
      question: "What football is on TV tomorrow in the UK?",
      answer: `Tomorrow (${getFormattedDateForSEO(ukTomorrow)}) there ${fixtures.length === 1 ? 'is' : 'are'} ${fixtures.length} football ${fixtures.length === 1 ? 'match' : 'matches'} on UK TV. Matches are broadcast on Sky Sports, TNT Sports, Amazon Prime, and BBC. Check the full schedule above for kick-off times and channels.`
    },
    {
      question: "What channel is football on tomorrow?",
      answer: "Tomorrow's football matches are shown on Sky Sports (Premier League, EFL), TNT Sports (Champions League, Europa League), Amazon Prime Video (selected Premier League games), and BBC (FA Cup, selected matches). Check each match above for specific channel information."
    },
    {
      question: "What time does football start tomorrow?",
      answer: firstMatch
        ? `The first football match tomorrow kicks off at ${new Date(firstMatch.kickoff_utc).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} UK time on ${firstMatch.providers_uk?.[0]?.name || 'TV'}.`
        : "Check the schedule above for exact kick-off times for tomorrow's matches."
    },
    {
      question: "Is there any football on TV tomorrow night?",
      answer: fixtures.length > 0
        ? `Yes, there ${fixtures.length === 1 ? 'is' : 'are'} ${fixtures.length} football ${fixtures.length === 1 ? 'match' : 'matches'} on TV tomorrow. See the complete schedule above with kick-off times and UK TV channels.`
        : "Check the full match calendar for upcoming games on Sky Sports, TNT Sports, Amazon Prime and BBC."
    }
  ];

  return (
    <div>
      <StructuredData type="faq" data={faqData} />
      <Header />
      <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
        <Breadcrumbs items={generateBreadcrumbs('/matches/tomorrow')} />
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📅 Tomorrow's Football on TV
          </h1>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            color: 'var(--color-text-secondary)'
          }}>
            <p style={{ margin: 0, fontSize: '16px' }}>
              {getFormattedDateForSEO(ukTomorrow)} • UK TV Schedule
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px',
              flexWrap: 'wrap'
            }}>
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              {timeUntilFirstMatch && timeUntilFirstMatch > 0 && (
                <span>First match in: {formatTimeUntilFirstMatch(timeUntilFirstMatch)}</span>
              )}
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
            ← Today's Fixtures
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
              No matches tomorrow
            </h2>
            <p style={{
              marginBottom: '24px',
              color: 'var(--color-text-secondary)',
              maxWidth: '400px',
              margin: '0 auto 24px'
            }}>
              There are no football matches scheduled for tomorrow. Check today's fixtures or browse all upcoming matches.
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

        {/* Fixtures grouped by competition */}
        {Object.entries(groupedFixtures).map(([competitionSlug, { name, fixtures: competitionFixtures }]) => (
          <section key={competitionSlug} style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {name} ({competitionFixtures.length})
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {competitionFixtures.map(fixture => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  variant="withTime"
                  showViewButton={true}
                />
              ))}
            </div>
          </section>
        ))}

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
              All times shown in UK timezone. Page updates automatically every 5 minutes.
              <br />
              Showing {fixtures.length} match{fixtures.length !== 1 ? 'es' : ''} for tomorrow, grouped by competition.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TomorrowFixturesPage;