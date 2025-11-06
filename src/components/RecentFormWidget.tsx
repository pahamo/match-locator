import React from 'react';
import type { Team, Fixture } from '../types';
import { formatTeamNameShort } from '../utils/seo';
import { formatDetailedDate } from '../utils/dateFormat';

interface FormMatch {
  opponent: string;
  result: 'W' | 'D' | 'L';
  score: string;
  date: string;
  competition: string;
}

interface RecentFormWidgetProps {
  team1: Team;
  team2: Team;
  team1Fixtures: Fixture[];
  team2Fixtures: Fixture[];
  matchesCount?: number;
  className?: string;
}

const RecentFormWidget: React.FC<RecentFormWidgetProps> = ({
  team1,
  team2,
  team1Fixtures,
  team2Fixtures,
  matchesCount = 5,
  className = ''
}) => {
  const getRecentForm = (team: Team, fixtures: Fixture[]): FormMatch[] => {
    // Filter completed fixtures
    const completedFixtures = fixtures
      .filter(f => f.score && f.score.home !== null && f.score.away !== null)
      .sort((a, b) => new Date(b.kickoff_utc).getTime() - new Date(a.kickoff_utc).getTime())
      .slice(0, matchesCount);

    return completedFixtures.map(fixture => {
      const isHome = fixture.home.name === team.name;
      const teamScore = isHome ? fixture.score!.home! : fixture.score!.away!;
      const opponentScore = isHome ? fixture.score!.away! : fixture.score!.home!;
      const opponent = isHome ? fixture.away.name : fixture.home.name;

      let result: 'W' | 'D' | 'L';
      if (teamScore > opponentScore) {
        result = 'W';
      } else if (teamScore === opponentScore) {
        result = 'D';
      } else {
        result = 'L';
      }

      return {
        opponent: formatTeamNameShort(opponent),
        result,
        score: `${teamScore}-${opponentScore}`,
        date: formatDetailedDate(fixture.kickoff_utc),
        competition: fixture.competition || 'Competition'
      };
    });
  };

  const getResultColor = (result: 'W' | 'D' | 'L'): string => {
    switch (result) {
      case 'W': return '#16a34a'; // green
      case 'D': return '#64748b'; // gray
      case 'L': return '#dc2626'; // red
    }
  };

  const getResultBackground = (result: 'W' | 'D' | 'L'): string => {
    switch (result) {
      case 'W': return '#dcfce7'; // light green
      case 'D': return '#f1f5f9'; // light gray
      case 'L': return '#fee2e2'; // light red
    }
  };

  const team1Form = getRecentForm(team1, team1Fixtures);
  const team2Form = getRecentForm(team2, team2Fixtures);

  if (team1Form.length === 0 && team2Form.length === 0) {
    return null; // Don't show if no completed matches
  }

  return (
    <div
      className={`recent-form-widget ${className}`}
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
          Recent Form
        </h2>
        <p style={{
          color: '#64748b',
          textAlign: 'center',
          margin: 0,
          fontSize: '0.875rem'
        }}>
          Last {matchesCount} matches for each team
        </p>
      </div>

      {/* Team 1 Form */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '12px'
        }}>
          {formatTeamNameShort(team1.name)}
        </h3>

        {team1Form.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {team1Form.map((match, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: getResultBackground(match.result),
                  borderRadius: '8px',
                  border: `1px solid ${match.result === 'W' ? '#bbf7d0' : match.result === 'L' ? '#fecaca' : '#e2e8f0'}`
                }}
              >
                {/* Result Badge */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: getResultColor(match.result),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  {match.result}
                </div>

                {/* Match Details */}
                <div style={{ flex: 1, marginLeft: '16px' }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '2px'
                  }}>
                    vs {match.opponent}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#64748b'
                  }}>
                    {match.competition}
                  </div>
                </div>

                {/* Score */}
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginLeft: '12px',
                  marginRight: '12px',
                  flexShrink: 0
                }}>
                  {match.score}
                </div>

                {/* Date */}
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  {new Date(match.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '24px',
            color: '#94a3b8',
            fontSize: '0.875rem',
            background: '#f8fafc',
            borderRadius: '8px'
          }}>
            No recent matches
          </div>
        )}
      </div>

      {/* Team 2 Form */}
      <div>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '12px'
        }}>
          {formatTeamNameShort(team2.name)}
        </h3>

        {team2Form.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {team2Form.map((match, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: getResultBackground(match.result),
                  borderRadius: '8px',
                  border: `1px solid ${match.result === 'W' ? '#bbf7d0' : match.result === 'L' ? '#fecaca' : '#e2e8f0'}`
                }}
              >
                {/* Result Badge */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: getResultColor(match.result),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  {match.result}
                </div>

                {/* Match Details */}
                <div style={{ flex: 1, marginLeft: '16px' }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '2px'
                  }}>
                    vs {match.opponent}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#64748b'
                  }}>
                    {match.competition}
                  </div>
                </div>

                {/* Score */}
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginLeft: '12px',
                  marginRight: '12px',
                  flexShrink: 0
                }}>
                  {match.score}
                </div>

                {/* Date */}
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  {new Date(match.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '24px',
            color: '#94a3b8',
            fontSize: '0.875rem',
            background: '#f8fafc',
            borderRadius: '8px'
          }}>
            No recent matches
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentFormWidget;
