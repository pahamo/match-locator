import React from 'react';
import type { Fixture } from '../types';
import { formatDetailedDate } from '../utils/dateFormat';

interface H2HStats {
  totalMatches: number;
  team1Wins: number;
  team2Wins: number;
  draws: number;
  team1Goals: number;
  team2Goals: number;
  lastMeetings: Fixture[];
}

interface H2HStatsCardProps {
  team1Name: string;
  team2Name: string;
  stats: H2HStats;
  className?: string;
}

const H2HStatsCard: React.FC<H2HStatsCardProps> = ({
  team1Name,
  team2Name,
  stats,
  className = ''
}) => {
  const getResultForTeam1 = (fixture: Fixture, team1Name: string): 'W' | 'L' | 'D' | null => {
    if (!fixture.score || fixture.score.home === null || fixture.score.away === null) {
      return null;
    }

    const isTeam1Home = fixture.home.name === team1Name;
    const homeScore = fixture.score.home;
    const awayScore = fixture.score.away;

    if (homeScore === awayScore) return 'D';

    if (isTeam1Home) {
      return homeScore > awayScore ? 'W' : 'L';
    } else {
      return awayScore > homeScore ? 'W' : 'L';
    }
  };

  const getResultColor = (result: 'W' | 'L' | 'D' | null): string => {
    switch (result) {
      case 'W': return '#16a34a'; // green
      case 'L': return '#dc2626'; // red
      case 'D': return '#64748b'; // gray
      default: return '#64748b';
    }
  };

  const winPercentage1 = stats.totalMatches > 0 ? Math.round((stats.team1Wins / stats.totalMatches) * 100) : 0;
  const winPercentage2 = stats.totalMatches > 0 ? Math.round((stats.team2Wins / stats.totalMatches) * 100) : 0;
  const drawPercentage = stats.totalMatches > 0 ? Math.round((stats.draws / stats.totalMatches) * 100) : 0;

  return (
    <div
      className={`h2h-stats-card ${className}`}
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
          Head-to-Head Record
        </h2>
        <p style={{
          color: '#64748b',
          textAlign: 'center',
          margin: 0
        }}>
          {stats.totalMatches} meetings this season
        </p>
      </div>

      {/* Main Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Team 1 Stats */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#16a34a',
            marginBottom: '4px'
          }}>
            {stats.team1Wins}
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: '#64748b',
            marginBottom: '8px'
          }}>
            {team1Name} wins
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#94a3b8'
          }}>
            {winPercentage1}%
          </div>
        </div>

        {/* VS and Draws */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#64748b',
            marginBottom: '8px'
          }}>
            VS
          </div>
          <div style={{
            fontSize: '1rem',
            color: '#64748b',
            marginBottom: '4px'
          }}>
            {stats.draws} draws
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#94a3b8'
          }}>
            {drawPercentage}%
          </div>
        </div>

        {/* Team 2 Stats */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#16a34a',
            marginBottom: '4px'
          }}>
            {stats.team2Wins}
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: '#64748b',
            marginBottom: '8px'
          }}>
            {team2Name} wins
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#94a3b8'
          }}>
            {winPercentage2}%
          </div>
        </div>
      </div>

      {/* Goals Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        background: '#f8fafc',
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b'
          }}>
            {stats.team1Goals}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#64748b'
          }}>
            Goals
          </div>
        </div>

        <div style={{
          fontSize: '1rem',
          color: '#64748b',
          fontWeight: '500'
        }}>
          -
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b'
          }}>
            {stats.team2Goals}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#64748b'
          }}>
            Goals
          </div>
        </div>
      </div>

      {/* Last 5 Meetings */}
      {stats.lastMeetings.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '16px'
          }}>
            Recent Meetings
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {stats.lastMeetings.slice(0, 5).map((meeting, index) => {
              const result = getResultForTeam1(meeting, team1Name);
              const hasScore = meeting.score && meeting.score.home !== null && meeting.score.away !== null;

              return (
                <div
                  key={meeting.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: index === 0 ? '#f1f5f9' : 'transparent',
                    borderRadius: '6px',
                    border: index === 0 ? '1px solid #e2e8f0' : 'none'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '2px'
                    }}>
                      {meeting.home.name} vs {meeting.away.name}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748b'
                    }}>
                      {formatDetailedDate(meeting.kickoff_utc)} • {meeting.competition || 'Competition'}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    {hasScore && (
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#1e293b'
                      }}>
                        {meeting.score!.home} - {meeting.score!.away}
                      </div>
                    )}

                    {result && (
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: getResultColor(result),
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}>
                        {result}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default H2HStatsCard;