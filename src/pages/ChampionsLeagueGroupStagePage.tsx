import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFixtures } from '../services/supabase';
import type { Fixture } from '../types';
import Header from '../components/Header';
import StructuredData from '../components/StructuredData';
import { updateDocumentMeta } from '../utils/seo';
import { formatCompactDate } from '../utils/dateFormat';
import { getMatchStatus } from '../utils/matchStatus';

interface GroupedFixtures {
  [date: string]: Fixture[];
}

const ChampionsLeagueGroupStagePage: React.FC = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFixtures = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get Champions League fixtures (competition_id = 2)
        const fixturesData = await getFixtures({
          competitionId: 2,
          limit: 100,
          order: 'asc'
        });

        // Filter for league stage only
        const leagueStageFixtures = fixturesData.filter(f =>
          f.stage === 'LEAGUE_STAGE' || f.round === 'LEAGUE_STAGE'
        );

        setFixtures(leagueStageFixtures);

        // Update SEO meta tags
        updateDocumentMeta({
          title: 'UEFA Champions League - Group Stage | Match Locator',
          description: 'UEFA Champions League group stage fixtures and schedule. View all matches, times, and broadcasters.'
        });

      } catch (err) {
        console.error('Failed to load Champions League fixtures:', err);
        setError('Failed to load fixtures. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadFixtures();
  }, []);

  // Group fixtures by date
  const groupedFixtures = fixtures.reduce<GroupedFixtures>((acc, fixture) => {
    const date = new Date(fixture.kickoff_utc).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(fixture);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedFixtures).sort();

  const getMatchStatusColor = (fixture: Fixture) => {
    const status = getMatchStatus(fixture.kickoff_utc);
    switch (status.status) {
      case 'live':
        return '#ef4444'; // red
      case 'upNext':
        return '#3b82f6'; // blue
      case 'finished':
        return '#6b7280'; // gray
      default:
        return '#374151'; // dark gray
    }
  };

  if (loading) {
    return (
      <div className="champions-league-page">
        <Header
          title="Match Locator"
          subtitle="Football TV Schedule (UK)"
        />

        <main>
          <div className="wrap">
            <h1>UEFA Champions League - Group Stage</h1>
            <div className="loading">Loading Champions League fixtures...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="champions-league-page">
        <Header
          title="Match Locator"
          subtitle="Football TV Schedule (UK)"
        />

        <main>
          <div className="wrap">
            <h1>UEFA Champions League - Group Stage</h1>
            <div className="error">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="champions-league-page">
      <StructuredData type="competition" data={{
        name: 'UEFA Champions League',
        description: 'Champions League group stage fixtures and results'
      }} />
      <Header
        title="Match Locator"
        subtitle="Football TV Schedule (UK)"
      />

      <main>
        <div className="wrap">
          <div style={{ marginBottom: '24px' }}>
            <Link
              to="/competitions"
              style={{
                color: '#6366f1',
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              ← All Competitions
            </Link>
          </div>

          <h1 style={{
            marginBottom: '8px',
            fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
            fontWeight: '700'
          }}>
            🏆 UEFA Champions League
          </h1>

          <h2 style={{
            marginBottom: '32px',
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#6b7280'
          }}>
            League Stage - {fixtures.length} Fixtures
          </h2>

          {sortedDates.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: '#f9fafb',
              borderRadius: '8px',
              color: '#6b7280'
            }}>
              <p>No Champions League fixtures found for the current season.</p>
            </div>
          ) : (
            <div className="fixtures-grid">
              {sortedDates.map(date => (
                <div key={date} style={{ marginBottom: '32px' }}>
                  {/* Date Header */}
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#374151',
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    borderRadius: '6px',
                    borderLeft: '4px solid #3b82f6'
                  }}>
                    {formatCompactDate(groupedFixtures[date][0].kickoff_utc).replace(/ at.*/, '')}
                  </h3>

                  {/* Matches Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px'
                  }}>
                    {groupedFixtures[date]
                      .sort((a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime())
                      .map(fixture => {
                        const status = getMatchStatus(fixture.kickoff_utc);
                        const statusColor = getMatchStatusColor(fixture);

                        return (
                          <Link
                            key={fixture.id}
                            to={`/match/${fixture.home.slug}-vs-${fixture.away.slug}-${fixture.id}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <div style={{
                              background: 'white',
                              border: `2px solid ${statusColor}`,
                              borderRadius: '8px',
                              padding: '16px',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            >
                              {/* Match Status Badge */}
                              {status.status !== 'scheduled' && (
                                <div style={{
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  background: statusColor,
                                  color: 'white',
                                  width: 'fit-content',
                                  marginBottom: '8px',
                                  textTransform: 'uppercase'
                                }}>
                                  {status.status === 'live' && '🔴 LIVE'}
                                  {status.status === 'upNext' && `⏰ ${status.timeUntil ? `IN ${status.timeUntil}` : 'UP NEXT'}`}
                                  {status.status === 'finished' && '✅ FINISHED'}
                                </div>
                              )}

                              {/* Teams */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '12px'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  flex: '1',
                                  minWidth: '0'
                                }}>
                                  {fixture.home.crest && (
                                    <img
                                      src={fixture.home.crest}
                                      alt={fixture.home.name}
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        objectFit: 'contain',
                                        flexShrink: 0
                                      }}
                                    />
                                  )}
                                  <span style={{
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: '#374151',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {fixture.home.name}
                                  </span>
                                </div>

                                <span style={{
                                  fontSize: '12px',
                                  color: '#9ca3af',
                                  fontWeight: '500',
                                  padding: '0 8px'
                                }}>vs</span>

                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  flex: '1',
                                  minWidth: '0',
                                  justifyContent: 'flex-end'
                                }}>
                                  <span style={{
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: '#374151',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    textAlign: 'right'
                                  }}>
                                    {fixture.away.name}
                                  </span>
                                  {fixture.away.crest && (
                                    <img
                                      src={fixture.away.crest}
                                      alt={fixture.away.name}
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        objectFit: 'contain',
                                        flexShrink: 0
                                      }}
                                    />
                                  )}
                                </div>
                              </div>

                              {/* Time and Broadcaster */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '12px',
                                color: '#6b7280'
                              }}>
                                <span>
                                  {new Date(fixture.kickoff_utc).toLocaleTimeString('en-GB', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZone: 'Europe/London'
                                  })}
                                </span>

                                {fixture.blackout?.is_blackout ? (
                                  <span style={{
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '500'
                                  }}>
                                    🚫 Blackout
                                  </span>
                                ) : fixture.providers_uk.length > 0 ? (
                                  <span style={{
                                    background: '#dcfce7',
                                    color: '#16a34a',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '500'
                                  }}>
                                    📺 {fixture.providers_uk[0].name}
                                  </span>
                                ) : (
                                  <span style={{
                                    background: '#fef3c7',
                                    color: '#d97706',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '500'
                                  }}>
                                    TBD
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Section */}
          <div style={{
            marginTop: '48px',
            padding: '24px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
              About the Champions League Format
            </h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
              The new Champions League format features a single league phase with 36 teams.
              Each team plays 8 different opponents (4 home, 4 away). The top 8 teams advance
              directly to the Round of 16, while teams ranked 9-24 enter playoffs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChampionsLeagueGroupStagePage;