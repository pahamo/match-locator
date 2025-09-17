import React from 'react';
import { Link } from 'react-router-dom';
import { tokens } from '../tokens';
import type { SimpleFixture, Fixture } from '../../types';
import { getMatchStatus, getMatchStatusStyles } from '../../utils/matchStatus';
import { generateSeoSimpleMatchUrl, generateSeoMatchUrl } from '../../utils/seo';
import { getDisplayTeamName } from '../../utils/teamNames';


export interface FixtureCardProps {
  fixture: SimpleFixture | Fixture;
  variant?: 'default' | 'compact' | 'detailed' | 'minimized';
  showMatchweek?: boolean;
  showViewButton?: boolean;
  className?: string;
  style?: React.CSSProperties;
  groupPosition?: 'single' | 'first' | 'middle' | 'last';
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
      url: generateSeoSimpleMatchUrl(fixture)
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
      url: generateSeoMatchUrl(fixture)
    };
  }
};

const FixtureCard: React.FC<FixtureCardProps> = ({
  fixture,
  variant = 'compact',
  showMatchweek = false,
  showViewButton = true,
  className = '',
  style = {},
  groupPosition = 'single'
}) => {
  const matchStatus = getMatchStatus(fixture.kickoff_utc);
  const statusStyles = getMatchStatusStyles(matchStatus);
  const fixtureData = getFixtureData(fixture);
  const isMinimized = variant === 'minimized';

  // Card style variants with grouped styling
  const getGroupedCardStyle = () => {
    let borderRadius = '6px';
    let marginBottom = isMinimized ? '4px' : '6px';

    // Handle grouped card styling
    if (groupPosition !== 'single') {
      switch (groupPosition) {
        case 'first':
          borderRadius = '6px 6px 0 0';
          marginBottom = '1px';
          break;
        case 'middle':
          borderRadius = '0';
          marginBottom = '1px';
          break;
        case 'last':
          borderRadius = '0 0 6px 6px';
          marginBottom = isMinimized ? '4px' : '6px';
          break;
      }
    }

    return {
      background: statusStyles.card.background || 'white',
      border: statusStyles.card.border || '1px solid #e2e8f0',
      borderRadius,
      padding: isMinimized ? '8px' : '12px',
      marginBottom,
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
  };

  const baseCardStyle = getGroupedCardStyle();

  
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
            <span className="team-name-full">{fixtureData.homeTeam}</span>
            <span className="team-name-short">{getDisplayTeamName(fixtureData.homeTeam, true)}</span>
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
            <span className="team-name-full">{fixtureData.awayTeam}</span>
            <span className="team-name-short">{getDisplayTeamName(fixtureData.awayTeam, true)}</span>
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
      {!isMinimized && statusStyles.badge && matchStatus.status === 'live' && (
        <div style={statusStyles.badge}>
          🔴 LIVE
        </div>
      )}
      
      {/* Broadcaster Info - Hidden in minimized view */}
      {!isMinimized && (
        <div className="broadcaster-info">
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
          className="view-button"
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

// Add CSS for responsive styles
const fixtureCardStyles = `
  .broadcaster-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .view-button {
    color: #6366f1;
    text-decoration: none;
    font-size: 12px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #6366f1;
    transition: all 0.2s;
    display: inline-block;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
  }

  .view-button:hover {
    background: #6366f1;
    color: white;
  }

  .team-name-short {
    display: none;
  }

  /* Show short names on smaller screens */
  @media (max-width: 768px) {
    .team-name-full {
      display: none;
    }

    .team-name-short {
      display: inline;
    }
  }

  @media (max-width: 640px) {
    .broadcaster-info {
      display: none;
    }

    .view-button {
      font-size: 14px;
      padding: 8px 16px;
      display: inline-flex;
      min-height: 44px;
      margin-left: 0;
    }
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('fixture-card-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'fixture-card-styles';
  styleSheet.textContent = fixtureCardStyles;
  document.head.appendChild(styleSheet);
}

export default FixtureCard;