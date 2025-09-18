import React, { useState, useEffect } from 'react';
import { getSimpleFixtures } from '../services/supabase-simple';
import type { SimpleFixture } from '../types';
import Header from '../components/Header';
import StructuredData from '../components/StructuredData';
import { FixtureCardSkeleton } from '../components/SkeletonLoader';
import { FixtureCard } from '../design-system';
import { generateHomeMeta, updateDocumentMeta } from '../utils/seo';
import { getMatchStatus } from '../utils/matchStatus';
import { mapCompetitionIdToSlug } from '../utils/competitionMapping';

// Helper to filter for EPL and UCL fixtures happening today
const getTodaysEPLandUCLFixtures = (fixtures: SimpleFixture[]): SimpleFixture[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return fixtures.filter(fixture => {
    // Check if fixture is today
    const fixtureDate = new Date(fixture.kickoff_utc);
    const isToday = fixtureDate >= today && fixtureDate < tomorrow;

    if (!isToday) return false;

    // Check if fixture is EPL or UCL
    if (!fixture.competition_id) return false;
    const competitionSlug = mapCompetitionIdToSlug(fixture.competition_id);
    return competitionSlug === 'premier-league' || competitionSlug === 'champions-league';
  });
};

// Helper to group fixtures by match status (live, upcoming)
const groupFixturesByStatus = (fixtures: SimpleFixture[]) => {
  const liveFixtures: SimpleFixture[] = [];
  const upcomingFixtures: SimpleFixture[] = [];

  fixtures.forEach(fixture => {
    const status = getMatchStatus(fixture.kickoff_utc);
    if (status.status === 'live') {
      liveFixtures.push(fixture);
    } else {
      upcomingFixtures.push(fixture);
    }
  });

  // Sort upcoming fixtures by kickoff time
  upcomingFixtures.sort((a, b) =>
    new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime()
  );

  return { liveFixtures, upcomingFixtures };
};

const HomePage: React.FC = () => {
  const [todaysFixtures, setTodaysFixtures] = useState<SimpleFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all fixtures
        const fixturesData = await getSimpleFixtures();

        // Filter for today's EPL and UCL fixtures only
        const todayEPLandUCL = getTodaysEPLandUCLFixtures(fixturesData);

        if (!isCancelled) {
          setTodaysFixtures(todayEPLandUCL);

          // Update SEO meta tags for homepage
          const meta = generateHomeMeta();
          updateDocumentMeta(meta);
        }
      } catch (err) {
        console.error('Failed to load fixtures:', err);
        if (!isCancelled) setError('Failed to load fixtures. Please try again later.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    })();
    return () => { isCancelled = true; };
  }, []);

  const loadTodaysFixtures = async () => {
    try {
      setLoading(true);
      setError(null);

      const fixturesData = await getSimpleFixtures();
      const todayEPLandUCL = getTodaysEPLandUCLFixtures(fixturesData);
      setTodaysFixtures(todayEPLandUCL);
    } catch (err) {
      console.error('Failed to load fixtures:', err);
      setError('Failed to load fixtures. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <Header />
        <main>
          <div className="wrap">
            <h1 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '700' }}>
              Football TV Schedule (UK)
            </h1>
            <FixtureCardSkeleton />
            <FixtureCardSkeleton />
            <FixtureCardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <Header />
        <main>
          <div className="wrap">
            <div className="error">{error}</div>
            <button onClick={loadTodaysFixtures}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

  // Group today's fixtures by status
  const { liveFixtures, upcomingFixtures } = groupFixturesByStatus(todaysFixtures);

  // If no fixtures today, show fallback content
  if (todaysFixtures.length === 0) {
    return (
      <div className="home-page">
        <StructuredData type="website" />
        <StructuredData type="organization" />
        <Header />
        <main>
          <div className="wrap">
            <h1 style={{ marginTop: '32px', marginBottom: '24px', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: '700' }}>
              Football Today
            </h1>
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '12px'
              }}>
                No Premier League or Champions League games today
              </h2>
              <p style={{
                color: '#64748b',
                marginBottom: '24px',
                fontSize: '1rem'
              }}>
                Check out all upcoming fixtures or browse by competition
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href="/fixtures"
                  style={{
                    display: 'inline-block',
                    background: '#3b82f6',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  📺 All Fixtures
                </a>
                <a
                  href="/competitions"
                  style={{
                    display: 'inline-block',
                    background: '#6366f1',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  🏆 Competitions
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <StructuredData type="website" />
      <StructuredData type="organization" />

      {/* Live game animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            background: #ef4444;
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
          }
          50% {
            background: #dc2626;
            box-shadow: 0 0 25px rgba(239, 68, 68, 0.9);
          }
        }

        @keyframes pulse-border {
          0%, 100% {
            border-color: #ef4444;
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
          }
          50% {
            border-color: #dc2626;
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
          }
        }
      `}</style>

      <Header />

      <main>
        <div className="wrap">
          <h1 style={{ marginTop: '32px', marginBottom: '24px', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: '700' }}>
            Football Today
          </h1>

          {/* Live Games Section */}
          {liveFixtures.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                border: '3px solid #ef4444',
                borderRadius: '12px',
                padding: '16px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
                animation: 'pulse-border 2s ease-in-out infinite',
                position: 'relative'
              }}>
                {/* LIVE indicator */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '16px',
                  background: '#ef4444',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  animation: 'pulse-glow 1.5s ease-in-out infinite'
                }}>
                  🔴 LIVE NOW
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {liveFixtures.map((fixture, index) => (
                    <FixtureCard
                      key={fixture.id}
                      fixture={fixture}
                      variant="compact"
                      showViewButton={true}
                      isInLiveGroup={true}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Next Games Section */}
          {upcomingFixtures.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <div style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  🔵 UPCOMING TODAY
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcomingFixtures.map((fixture, index) => (
                  <FixtureCard
                    key={fixture.id}
                    fixture={fixture}
                    variant="compact"
                    showViewButton={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div style={{
            marginTop: '32px',
            padding: '24px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '12px'
            }}>
              Looking for more?
            </h2>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>
              View all upcoming fixtures or browse by competition
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/fixtures"
                style={{
                  display: 'inline-block',
                  background: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                📺 All Fixtures
              </a>
              <a
                href="/competitions"
                style={{
                  display: 'inline-block',
                  background: '#6366f1',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                🏆 Competitions
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
