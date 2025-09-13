import React from 'react';
import { Link } from 'react-router-dom';
import { tokens } from '../tokens';
import type { SimpleFixture, Fixture } from '../../types';
import { getMatchStatus, getMatchStatusStyles } from '../../utils/matchStatus';
import { generateSimpleMatchUrl, generateMatchUrl } from '../../utils/seo';

export interface FixtureCardProps {
  fixture: SimpleFixture | Fixture;
  variant?: 'default' | 'compact' | 'detailed' | 'minimized';
  showMatchweek?: boolean;
  showViewButton?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Helper functions to work with both fixture types
const isSimpleFixture = (fixture: SimpleFixture | Fixture): fixture is SimpleFixture => {
  return 'home_team' in fixture;
};

const getFixtureData = (fixture: SimpleFixture | Fixture) => {
  if (isSimpleFixture(fixture)) {
    return {
      homeTeam: fixture.home_team,
      awayTeam: fixture.away_team,
      homeCrest: fixture.home_crest,
      awayCrest: fixture.away_crest,
      broadcaster: fixture.broadcaster,
      isBlackout: fixture.isBlackout || false,
      matchweek: fixture.matchweek,
      url: generateSimpleMatchUrl(fixture)
    };
  } else {
    const hasProviders = fixture.providers_uk && fixture.providers_uk.length > 0;
    const broadcasterName = hasProviders ? fixture.providers_uk[0].name : undefined;
    const isBlackout = fixture.blackout?.is_blackout || false;

    return {
      homeTeam: fixture.home.name,
      awayTeam: fixture.away.name,
      homeCrest: fixture.home.crest,
      awayCrest: fixture.away.crest,
      broadcaster: isBlackout ? undefined : broadcasterName,
      isBlackout: isBlackout,
      matchweek: fixture.matchweek,
      url: generateMatchUrl(fixture)
    };
  }
};

const FixtureCard: React.FC<FixtureCardProps> = ({
  fixture,
  variant = 'compact',
  showMatchweek = false,
  showViewButton = true,
  className = '',
  style = {}
}) => {
  const matchStatus = getMatchStatus(fixture.kickoff_utc);
  const statusStyles = getMatchStatusStyles(matchStatus);
  const fixtureData = getFixtureData(fixture);
  const isMinimized = variant === 'minimized';

  // Card style variants
  const baseCardStyle = {
    background: statusStyles.card.background || 'white',
    border: statusStyles.card.border || '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: isMinimized ? '8px' : '12px',
    marginBottom: isMinimized ? '4px' : '6px',
    display: 'flex',
    alignItems: 'center',
    gap: isMinimized ? '8px' : '12px',
    minHeight: 'auto',
    position: 'relative' as const,
    opacity: isMinimized ? 0.7 : 1,
    fontSize: isMinimized ? '13px' : '14px',
    ...statusStyles.card,
    ...style
  };

  const kickoffDate = new Date(fixture.kickoff_utc);
  const timeString = kickoffDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London'
  });
  
  return (
    <div 
      className={`fixture-card-compact ${className}`}
      style={baseCardStyle}
    >
      {/* Teams Section - More Compact */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: '1',
        minWidth: '0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flex: '1',
          minWidth: '0'
        }}>
          {fixtureData.homeCrest && (
            <img
              src={fixtureData.homeCrest}
              alt={`${fixtureData.homeTeam} crest`}
              style={{
                width: isMinimized ? '14px' : '18px',
                height: isMinimized ? '14px' : '18px',
                objectFit: 'contain',
                flexShrink: 0
              }}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span style={{
            fontSize: isMinimized ? '13px' : '14px',
            fontWeight: '500',
            lineHeight: '1.3',
            wordBreak: 'break-word',
            hyphens: 'auto',
            minWidth: 0
          }}>
            {fixtureData.homeTeam}
          </span>
        </div>
        
        <div style={{
          fontSize: '12px',
          color: '#9ca3af',
          fontWeight: '500',
          flexShrink: 0
        }}>vs</div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flex: '1',
          minWidth: '0',
          justifyContent: 'flex-end'
        }}>
          <span style={{
            fontSize: isMinimized ? '13px' : '14px',
            fontWeight: '500',
            lineHeight: '1.3',
            wordBreak: 'break-word',
            hyphens: 'auto',
            minWidth: 0
          }}>
            {fixtureData.awayTeam}
          </span>
          {fixtureData.awayCrest && (
            <img
              src={fixtureData.awayCrest}
              alt={`${fixtureData.awayTeam} crest`}
              style={{
                width: isMinimized ? '14px' : '18px',
                height: isMinimized ? '14px' : '18px',
                objectFit: 'contain',
                flexShrink: 0
              }}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>
      </div>
      
      {/* Live indicator dot */}
      {matchStatus.status === 'live' && (
        <div
          className="live-pulse"
          style={{
            width: isMinimized ? '6px' : '8px',
            height: isMinimized ? '6px' : '8px',
            background: tokens.colors.live.primary,
            borderRadius: tokens.borderRadius.full,
            flexShrink: 0
          }}
        />
      )}

      {/* Match Status Badge - hidden in minimized view */}
      {!isMinimized && statusStyles.badge && (
        <div style={statusStyles.badge}>
          {matchStatus.status === 'live' && '🔴 LIVE'}
          {matchStatus.status === 'upNext' && `⏰ UP NEXT ${matchStatus.timeUntil ? `in ${matchStatus.timeUntil}` : ''}`}
        </div>
      )}
      
      {/* Broadcaster Info - Hidden in minimized view */}
      {!isMinimized && (
        <div style={{
          display: typeof window !== 'undefined' && window.innerWidth <= 640 ? 'none' : 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}>
          {fixtureData.isBlackout ? (
            <span style={{
              fontSize: '12px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#fee2e2',
              color: '#dc2626'
            }}>🚫 Blackout</span>
          ) : fixtureData.broadcaster ? (
            <span style={{
              fontSize: '12px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#dcfce7',
              color: '#16a34a',
              fontWeight: '500'
            }}>{fixtureData.broadcaster}</span>
          ) : (
            <span style={{
              fontSize: '12px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#fef3c7',
              color: '#d97706'
            }}>TBD</span>
          )}
        </div>
      )}

      {/* View Button - Always Visible */}
      {showViewButton && (
        <Link
          to={fixtureData.url}
          style={{ 
            color: '#6366f1', 
            textDecoration: 'none',
            fontSize: typeof window !== 'undefined' && window.innerWidth <= 640 ? '14px' : '12px',
            fontWeight: '500',
            padding: typeof window !== 'undefined' && window.innerWidth <= 640 ? '8px 16px' : '4px 8px',
            borderRadius: '4px',
            border: '1px solid #6366f1',
            transition: 'all 0.2s',
            display: typeof window !== 'undefined' && window.innerWidth <= 640 ? 'inline-flex' : 'inline-block',
            minHeight: typeof window !== 'undefined' && window.innerWidth <= 640 ? '44px' : 'auto',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: typeof window !== 'undefined' && window.innerWidth > 640 ? '8px' : '0'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#6366f1';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6366f1';
          }}
        >
          View
        </Link>
      )}
      
      {/* Matchweek (if requested) */}
      {showMatchweek && fixtureData.matchweek && (
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          fontWeight: '500',
          background: '#f3f4f6',
          padding: '2px 6px',
          borderRadius: '4px',
          flexShrink: 0
        }}>
          MW{fixtureData.matchweek}
        </div>
      )}
    </div>
  );
};

export default FixtureCard;