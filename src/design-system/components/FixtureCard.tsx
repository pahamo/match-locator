import React from 'react';
import { tokens } from '../tokens';
import { styleUtils } from '../styles';
import type { SimpleFixture } from '../../types';
import { getMatchStatus, getMatchStatusStyles } from '../../utils/matchStatus';

export interface FixtureCardProps {
  fixture: SimpleFixture;
  variant?: 'default' | 'compact' | 'detailed';
  showMatchweek?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const FixtureCard: React.FC<FixtureCardProps> = ({ 
  fixture, 
  variant = 'default',
  showMatchweek = false,
  className = '',
  style = {}
}) => {
  const matchStatus = getMatchStatus(fixture.kickoff_utc);
  const statusStyles = getMatchStatusStyles(matchStatus);
  
  const baseCardStyle = {
    background: statusStyles.card.background || 'white',
    border: statusStyles.card.border || `1px solid ${tokens.colors.gray[200]}`,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
    position: 'relative' as const,
    transition: tokens.transition.base,
    ...statusStyles.card,
    ...style
  };
  
  const teamStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    flex: '1',
    minWidth: '0'
  };
  
  const teamNameStyle = {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.gray[800],
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
  
  const crestStyle = {
    width: '18px',
    height: '18px',
    objectFit: 'contain' as const,
    flexShrink: 0
  };
  
  const timeStyle = {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.gray[500],
    flexShrink: 0,
    minWidth: '40px',
    textAlign: 'center' as const
  };
  
  const broadcasterStyle = {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.primary[600],
    background: tokens.colors.primary[50],
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    borderRadius: tokens.borderRadius.full,
    whiteSpace: 'nowrap' as const,
    flexShrink: 0
  };
  
  const blackoutStyle = {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.gray[500],
    background: tokens.colors.gray[100],
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    borderRadius: tokens.borderRadius.full,
    whiteSpace: 'nowrap' as const,
    flexShrink: 0
  };
  
  const kickoffDate = new Date(fixture.kickoff_utc);
  const timeString = kickoffDate.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/London'
  });
  
  return (
    <div 
      className={`fixture-card fixture-card--${variant} ${className}`}
      style={baseCardStyle}
    >
      {/* Live indicator */}
      {matchStatus.status === 'live' && (
        <div style={{
          position: 'absolute',
          top: tokens.spacing.xs,
          left: tokens.spacing.xs,
          width: '8px',
          height: '8px',
          background: tokens.colors.live.primary,
          borderRadius: tokens.borderRadius.full,
          animation: 'pulse 2s infinite'
        }} />
      )}
      
      {/* Teams Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing.sm,
        flex: '1',
        minWidth: '0'
      }}>
        {/* Home team */}
        <div style={teamStyle}>
          {fixture.home_crest && (
            <img 
              src={fixture.home_crest} 
              alt={`${fixture.home_team} crest`}
              style={crestStyle}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span style={teamNameStyle}>
            {fixture.home_team}
          </span>
        </div>
        
        {/* VS indicator */}
        <span style={{
          fontSize: tokens.fontSize.xs,
          color: tokens.colors.gray[400],
          fontWeight: tokens.fontWeight.medium,
          flexShrink: 0
        }}>
          vs
        </span>
        
        {/* Away team */}
        <div style={teamStyle}>
          {fixture.away_crest && (
            <img 
              src={fixture.away_crest} 
              alt={`${fixture.away_team} crest`}
              style={crestStyle}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span style={teamNameStyle}>
            {fixture.away_team}
          </span>
        </div>
      </div>
      
      {/* Time */}
      <div style={timeStyle}>
        {timeString}
      </div>
      
      {/* Broadcaster or Blackout */}
      {fixture.isBlackout ? (
        <div style={blackoutStyle}>
          Blackout
        </div>
      ) : fixture.broadcaster ? (
        <div style={broadcasterStyle}>
          {fixture.broadcaster}
        </div>
      ) : (
        <div style={blackoutStyle}>
          TBD
        </div>
      )}
      
      {/* Matchweek (if requested) */}
      {showMatchweek && fixture.matchweek && (
        <div style={{
          fontSize: tokens.fontSize.xs,
          color: tokens.colors.gray[500],
          fontWeight: tokens.fontWeight.medium,
          background: tokens.colors.gray[100],
          padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
          borderRadius: tokens.borderRadius.full,
          flexShrink: 0
        }}>
          MW{fixture.matchweek}
        </div>
      )}
    </div>
  );
};

export default FixtureCard;