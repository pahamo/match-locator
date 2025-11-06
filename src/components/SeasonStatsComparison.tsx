import React, { useState, useEffect } from 'react';
import type { Team, Fixture } from '../types';
import { calculateCleanSheets } from '../utils/cleanSheets';

interface TeamSeasonStats {
  teamName: string;
  position: number | null;
  totalTeams: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  goalsPerMatch: number;
  goalsConcededPerMatch: number;
  cleanSheets: number;
  cleanSheetPercentage: number;
  form: string[]; // ['W', 'W', 'D', 'L', 'W']
}

interface SeasonStatsComparisonProps {
  team1: Team;
  team2: Team;
  team1Fixtures: Fixture[];
  team2Fixtures: Fixture[];
  className?: string;
}

const SeasonStatsComparison: React.FC<SeasonStatsComparisonProps> = ({
  team1,
  team2,
  team1Fixtures,
  team2Fixtures,
  className = ''
}) => {
  const [team1Stats, setTeam1Stats] = useState<TeamSeasonStats | null>(null);
  const [team2Stats, setTeam2Stats] = useState<TeamSeasonStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateSeasonStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team1, team2, team1Fixtures, team2Fixtures]);

  const calculateSeasonStats = async () => {
    setLoading(true);

    try {
      // Calculate stats from completed fixtures for each team
      const team1CompletedFixtures = team1Fixtures.filter(f =>
        f.score && f.score.home !== null && f.score.away !== null
      );

      const team2CompletedFixtures = team2Fixtures.filter(f =>
        f.score && f.score.home !== null && f.score.away !== null
      );

      // Calculate team 1 stats
      const team1StatsData = calculateTeamStats(team1, team1CompletedFixtures);
      const team2StatsData = calculateTeamStats(team2, team2CompletedFixtures);

      setTeam1Stats(team1StatsData);
      setTeam2Stats(team2StatsData);
    } catch (error) {
      console.error('[SeasonStatsComparison] Failed to calculate stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTeamStats = (team: Team, fixtures: Fixture[]): TeamSeasonStats => {
    let played = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    const form: string[] = [];

    // Process each completed fixture
    fixtures.forEach(fixture => {
      if (!fixture.score) return;

      const isHome = fixture.home.name === team.name;
      const isAway = fixture.away.name === team.name;

      if (!isHome && !isAway) return;

      played++;

      const teamScore = isHome ? fixture.score.home : fixture.score.away;
      const opponentScore = isHome ? fixture.score.away : fixture.score.home;

      goalsFor += teamScore!;
      goalsAgainst += opponentScore!;

      if (teamScore! > opponentScore!) {
        won++;
        form.unshift('W'); // Add to front (most recent first)
      } else if (teamScore === opponentScore) {
        drawn++;
        form.unshift('D');
      } else {
        lost++;
        form.unshift('L');
      }
    });

    // Calculate clean sheets
    const cleanSheetStats = calculateCleanSheets(fixtures, team.name);

    // Calculate derived metrics
    const points = (won * 3) + drawn;
    const goalDifference = goalsFor - goalsAgainst;
    const goalsPerMatch = played > 0 ? Math.round((goalsFor / played) * 10) / 10 : 0;
    const goalsConcededPerMatch = played > 0 ? Math.round((goalsAgainst / played) * 10) / 10 : 0;

    return {
      teamName: team.name,
      position: null, // We don't have standings data, so set to null
      totalTeams: 0,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDifference,
      points,
      goalsPerMatch,
      goalsConcededPerMatch,
      cleanSheets: cleanSheetStats.cleanSheets,
      cleanSheetPercentage: cleanSheetStats.cleanSheetPercentage,
      form: form.slice(0, 5) // Keep only last 5
    };
  };

  const getFormColor = (result: string): string => {
    switch (result) {
      case 'W': return '#16a34a'; // green
      case 'D': return '#64748b'; // gray
      case 'L': return '#dc2626'; // red
      default: return '#64748b';
    }
  };

  const getBetterValue = (value1: number, value2: number, higherIsBetter: boolean = true): 'team1' | 'team2' | 'tie' => {
    if (value1 === value2) return 'tie';
    if (higherIsBetter) {
      return value1 > value2 ? 'team1' : 'team2';
    } else {
      return value1 < value2 ? 'team1' : 'team2';
    }
  };

  if (loading || !team1Stats || !team2Stats) {
    return (
      <div className={className} style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        textAlign: 'center',
        color: '#64748b'
      }}>
        Loading season statistics...
      </div>
    );
  }

  if (team1Stats.played === 0 && team2Stats.played === 0) {
    return null; // Don't show if no matches played
  }

  return (
    <div
      className={`season-stats-comparison ${className}`}
      style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          Season Stats Comparison
        </h2>
        <p style={{
          color: '#64748b',
          textAlign: 'center',
          margin: 0,
          fontSize: '0.875rem'
        }}>
          Current season performance • {team1Stats.played + team2Stats.played} total matches
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Matches Played */}
        <StatRow
          label="Matches Played"
          team1Value={team1Stats.played}
          team2Value={team2Stats.played}
          team1Name={team1.name}
          team2Name={team2.name}
          better={getBetterValue(team1Stats.played, team2Stats.played, true)}
          showComparison={false}
        />

        {/* Won-Drawn-Lost */}
        <div style={{
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#64748b',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            W-D-L Record
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e293b'
              }}>
                {team1Stats.won}-{team1Stats.drawn}-{team1Stats.lost}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#64748b',
                marginTop: '4px'
              }}>
                {team1Stats.points} pts
              </div>
            </div>
            <div style={{
              width: '1px',
              height: '40px',
              background: '#e2e8f0'
            }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e293b'
              }}>
                {team2Stats.won}-{team2Stats.drawn}-{team2Stats.lost}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#64748b',
                marginTop: '4px'
              }}>
                {team2Stats.points} pts
              </div>
            </div>
          </div>
        </div>

        {/* Goals Per Match */}
        <StatRow
          label="Goals Per Match"
          team1Value={team1Stats.goalsPerMatch}
          team2Value={team2Stats.goalsPerMatch}
          team1Name={team1.name}
          team2Name={team2.name}
          better={getBetterValue(team1Stats.goalsPerMatch, team2Stats.goalsPerMatch, true)}
          format={(val) => val.toFixed(1)}
        />

        {/* Goals Conceded Per Match */}
        <StatRow
          label="Goals Conceded Per Match"
          team1Value={team1Stats.goalsConcededPerMatch}
          team2Value={team2Stats.goalsConcededPerMatch}
          team1Name={team1.name}
          team2Name={team2.name}
          better={getBetterValue(team1Stats.goalsConcededPerMatch, team2Stats.goalsConcededPerMatch, false)}
          format={(val) => val.toFixed(1)}
          lowerIsBetter={true}
        />

        {/* Clean Sheets */}
        <StatRow
          label="Clean Sheets"
          team1Value={team1Stats.cleanSheets}
          team2Value={team2Stats.cleanSheets}
          team1Name={team1.name}
          team2Name={team2.name}
          better={getBetterValue(team1Stats.cleanSheets, team2Stats.cleanSheets, true)}
          subtitle={`${team1Stats.cleanSheetPercentage}% | ${team2Stats.cleanSheetPercentage}%`}
        />

        {/* Form (Last 5) */}
        <div style={{
          padding: '16px',
          background: '#f1f5f9',
          borderRadius: '8px'
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#64748b',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            Recent Form (Last 5)
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '16px',
            alignItems: 'center'
          }}>
            {/* Team 1 Form */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '4px'
            }}>
              {team1Stats.form.length > 0 ? team1Stats.form.map((result, index) => (
                <div
                  key={index}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: getFormColor(result),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}
                >
                  {result}
                </div>
              )) : (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No matches</div>
              )}
            </div>

            <div style={{
              width: '1px',
              height: '32px',
              background: '#e2e8f0'
            }} />

            {/* Team 2 Form */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '4px'
            }}>
              {team2Stats.form.length > 0 ? team2Stats.form.map((result, index) => (
                <div
                  key={index}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: getFormColor(result),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}
                >
                  {result}
                </div>
              )) : (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No matches</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper component for individual stat rows
interface StatRowProps {
  label: string;
  team1Value: number;
  team2Value: number;
  team1Name: string;
  team2Name: string;
  better: 'team1' | 'team2' | 'tie';
  showComparison?: boolean;
  format?: (val: number) => string;
  subtitle?: string;
  lowerIsBetter?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({
  label,
  team1Value,
  team2Value,
  team1Name,
  team2Name,
  better,
  showComparison = true,
  format = (val) => val.toString(),
  subtitle,
  lowerIsBetter = false
}) => {
  const getHighlightColor = (team: 'team1' | 'team2' | 'tie', currentTeam: 'team1' | 'team2'): string => {
    if (team === 'tie') return '#94a3b8'; // gray
    if (team === currentTeam) return '#16a34a'; // green
    return '#94a3b8'; // gray
  };

  return (
    <div style={{
      padding: '16px',
      background: '#f8fafc',
      borderRadius: '8px'
    }}>
      <div style={{
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#64748b',
        marginBottom: '12px',
        textAlign: 'center'
      }}>
        {label}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: getHighlightColor(better, 'team1')
          }}>
            {format(team1Value)}
          </div>
        </div>
        <div style={{
          width: '1px',
          height: '32px',
          background: '#e2e8f0'
        }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: getHighlightColor(better, 'team2')
          }}>
            {format(team2Value)}
          </div>
        </div>
      </div>
      {subtitle && (
        <div style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          textAlign: 'center',
          marginTop: '8px'
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default SeasonStatsComparison;
