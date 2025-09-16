import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFixtures } from '../services/supabase';
import type { Fixture, Team } from '../types';
import Header from '../components/Header';
import StructuredData from '../components/StructuredData';
import { updateDocumentMeta } from '../utils/seo';

interface TeamMatchup {
  fixture: Fixture;
  isHome: boolean;
}

const ChampionsLeagueGroupStagePage: React.FC = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

  useEffect(() => {
    const loadFixtures = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get Champions League fixtures (competition_id = 2)
        // Set date range to cover entire current season
        const now = new Date();
        const seasonYear = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
        const seasonStart = `${seasonYear}-08-01T00:00:00.000Z`;
        const seasonEnd = `${seasonYear + 1}-07-31T23:59:59.999Z`;

        console.log('Loading Champions League fixtures for season:', seasonYear, 'from', seasonStart, 'to', seasonEnd);

        const fixturesData = await getFixtures({
          competitionId: 2,
          dateFrom: seasonStart,
          dateTo: seasonEnd,
          limit: 200, // Increased limit for full season
          order: 'asc'
        });

        console.log('Loaded fixtures count:', fixturesData.length);
        console.log('Sample fixtures:', fixturesData.slice(0, 3));

        // Filter for league stage only
        const leagueStageFixtures = fixturesData.filter(f =>
          f.stage === 'LEAGUE_STAGE' || f.round === 'LEAGUE_STAGE'
        );

        console.log('League stage fixtures after filtering:', leagueStageFixtures.length);

        setFixtures(leagueStageFixtures);

        // Extract unique teams from fixtures
        const uniqueTeams = new Map<number, Team>();
        leagueStageFixtures.forEach(fixture => {
          uniqueTeams.set(fixture.home.id, fixture.home);
          uniqueTeams.set(fixture.away.id, fixture.away);
        });

        const sortedTeams = Array.from(uniqueTeams.values()).sort((a, b) => a.name.localeCompare(b.name));
        setTeams(sortedTeams);

        // Update SEO meta tags
        updateDocumentMeta({
          title: 'UEFA Champions League - League Stage Matrix | Match Locator',
          description: 'UEFA Champions League league stage fixtures matrix. See who plays who in an easy grid view.'
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

  // Helper function to find fixture between two teams
  const getFixtureBetweenTeams = (team1: Team, team2: Team): TeamMatchup | null => {
    const fixture = fixtures.find(f =>
      (f.home.id === team1.id && f.away.id === team2.id) ||
      (f.home.id === team2.id && f.away.id === team1.id)
    );

    if (!fixture) return null;

    return {
      fixture,
      isHome: fixture.home.id === team1.id
    };
  };

  // Helper function to get all opponents for a team
  const getTeamOpponents = (team: Team): Team[] => {
    const opponents: Team[] = [];
    fixtures.forEach(fixture => {
      if (fixture.home.id === team.id) {
        opponents.push(fixture.away);
      } else if (fixture.away.id === team.id) {
        opponents.push(fixture.home);
      }
    });
    return opponents;
  };

  // Get filtered teams for X-axis (columns) - excludes the selected team to avoid duplication
  const getFilteredXAxisTeams = (): Team[] => {
    if (expandedTeam === null) {
      return teams;
    }

    const selectedTeam = teams.find(t => t.id === expandedTeam);
    if (!selectedTeam) return teams;

    const opponents = getTeamOpponents(selectedTeam);
    const opponentIds = new Set(opponents.map(o => o.id));

    // Return only opponents (not the selected team itself) in original order
    return teams.filter(team => opponentIds.has(team.id));
  };

  // Y-axis teams stay the same when expanded, only filter to show the selected team
  const getFilteredYAxisTeams = (): Team[] => {
    if (expandedTeam === null) {
      return teams;
    }

    // Return only the selected team for Y-axis
    return teams.filter(team => team.id === expandedTeam);
  };

  const filteredXAxisTeams = getFilteredXAxisTeams();
  const filteredYAxisTeams = getFilteredYAxisTeams();

  if (loading) {
    return (
      <div className="champions-league-page">
        <Header
          title="Match Locator"
          subtitle="Football TV Schedule (UK)"
        />

        <main>
          <div className="wrap">
            <h1>UEFA Champions League - League Stage Matrix</h1>
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
            <h1>UEFA Champions League - League Stage Matrix</h1>
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
        description: 'Champions League league stage fixtures matrix'
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
            League Stage Matrix - {expandedTeam ? `${filteredXAxisTeams.length} opponents of ${teams.find(t => t.id === expandedTeam)?.name}` : `${teams.length} Teams`}, {fixtures.length} Fixtures
          </h2>

          {teams.length === 0 ? (
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
            <>
              {/* Info Section - moved above matrix */}
              <div style={{
                marginBottom: '24px',
                padding: '20px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
                  How to Read the Matrix
                </h3>
                <p style={{ margin: '0', fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  This matrix shows all Champions League matchups. Find a team on the left (Y-axis) and
                  see across the row which teams they play. Blue cells with 'H' indicate home games,
                  'A' indicates away games. <strong>Click any team name on the left to highlight their fixtures.</strong>
                  Click any blue cell to view match details including date, time, and broadcaster information.
                </p>
              </div>

              <div style={{
                position: 'relative',
                overflowX: 'auto',
                marginBottom: '32px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}>
                <style>
                  {`
                    .team-column {
                      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                      overflow: hidden;
                    }
                    .team-column.hidden {
                      max-width: 0 !important;
                      min-width: 0 !important;
                      opacity: 0;
                      transform: scaleX(0);
                    }
                    .team-row {
                      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                      overflow: hidden;
                    }
                    .team-row.hidden {
                      max-height: 0 !important;
                      min-height: 0 !important;
                      opacity: 0;
                      transform: scaleY(0);
                      padding: 0 !important;
                    }
                  `}
                </style>

                {/* Show All Teams Button */}
                {expandedTeam && (
                  <div style={{
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => setExpandedTeam(null)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4f46e5';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#6366f1';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      ← Show All Teams
                    </button>
                  </div>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `120px repeat(${filteredXAxisTeams.length}, 60px)`,
                  gap: '1px',
                  minWidth: `${120 + filteredXAxisTeams.length * 60}px`,
                  overflow: 'hidden',
                  background: '#e2e8f0',
                  transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  {/* Top-left corner cell */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    vs
                  </div>

                  {/* Column headers (teams on X-axis) */}
                  {filteredXAxisTeams.map(team => (
                    <div key={`header-${team.id}`} style={{
                      background: '#f8fafc',
                      padding: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: '#374151',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2px',
                      minHeight: '60px'
                    }}>
                      {team.crest && (
                        <img
                          src={team.crest}
                          alt={team.name}
                          style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                        />
                      )}
                      <span style={{
                        textAlign: 'center',
                        lineHeight: '1.1',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%'
                      }}>
                        {team.name.split(' ').slice(-1)[0]} {/* Show last word of team name */}
                      </span>
                    </div>
                  ))}

                  {/* Matrix rows */}
                  {(expandedTeam ? filteredYAxisTeams : teams).map(rowTeam => {
                    const isExpanded = expandedTeam === rowTeam.id;
                    const opponents = getTeamOpponents(rowTeam);

                    return (
                      <React.Fragment key={`row-${rowTeam.id}`}>
                        {/* Row header (team on Y-axis) */}
                        <div
                          style={{
                            background: isExpanded ? '#e0f2fe' : '#f8fafc',
                            padding: '8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: isExpanded ? '#0c4a6e' : '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'sticky',
                            left: '0',
                            zIndex: 2,
                            border: isExpanded ? '2px solid #0284c7' : '1px solid transparent'
                          }}
                          onClick={() => {
                            setExpandedTeam(isExpanded ? null : rowTeam.id);
                          }}
                          onMouseEnter={(e) => {
                            if (!isExpanded) {
                              e.currentTarget.style.background = '#e0f2fe';
                              e.currentTarget.style.color = '#0c4a6e';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isExpanded) {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#374151';
                            }
                          }}
                        >
                          {rowTeam.crest && (
                            <img
                              src={rowTeam.crest}
                              alt={rowTeam.name}
                              style={{ width: '16px', height: '16px', objectFit: 'contain', flexShrink: 0 }}
                            />
                          )}
                          <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {rowTeam.name}
                          </span>
                          <span style={{
                            marginLeft: 'auto',
                            fontSize: '10px',
                            color: isExpanded ? '#0284c7' : '#9ca3af'
                          }}>
                            {isExpanded ? '−' : '+'}
                          </span>
                        </div>

                        {/* Matrix cells */}
                        {(expandedTeam ? filteredXAxisTeams : teams).map(colTeam => {
                          const matchup = getFixtureBetweenTeams(rowTeam, colTeam);
                          const isSameTeam = rowTeam.id === colTeam.id;
                          const isOpponent = opponents.some(opp => opp.id === colTeam.id);

                          return (
                            <div key={`cell-${rowTeam.id}-${colTeam.id}`} style={{
                              background: matchup ? (isExpanded && isOpponent ? '#3b82f6' : '#dbeafe') : 'white',
                              minHeight: '60px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: matchup ? 'pointer' : 'default',
                              position: 'relative',
                              transition: 'all 0.4s ease'
                            }}
                            onClick={() => {
                              if (matchup) {
                                window.location.href = `/match/${matchup.fixture.home.slug}-vs-${matchup.fixture.away.slug}-${matchup.fixture.id}`;
                              }
                            }}
                            onMouseEnter={(e) => {
                              if (matchup) {
                                e.currentTarget.style.background = isExpanded && isOpponent ? '#1e40af' : '#bfdbfe';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (matchup) {
                                e.currentTarget.style.background = isExpanded && isOpponent ? '#3b82f6' : '#dbeafe';
                              }
                            }}
                            >
                              {matchup ? (
                                <div style={{
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  color: isExpanded && isOpponent ? 'white' : '#1e40af',
                                  textAlign: 'center',
                                  padding: '2px'
                                }}>
                                  {matchup.isHome ? 'H' : 'A'}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{
                  marginTop: '16px',
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'flex',
                  gap: '24px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#dbeafe', border: '1px solid #e2e8f0' }}></div>
                    <span>Fixture exists</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: '600' }}>H</span>
                    <span>Home game</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: '600' }}>A</span>
                    <span>Away game</span>
                  </div>
                  <div style={{ fontSize: '11px' }}>
                    Click any team name to highlight their fixtures • Click H/A cells for match details
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChampionsLeagueGroupStagePage;