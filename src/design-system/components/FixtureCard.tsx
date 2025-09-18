import React from 'react';
import { Link } from 'react-router-dom';
import { tokens } from '../tokens';
import type { SimpleFixture, Fixture } from '../../types';
import { getMatchStatus, getMatchStatusStyles } from '../../utils/matchStatus';
import { generateSeoSimpleMatchUrl, generateSeoMatchUrl } from '../../utils/seo';
import { getDisplayTeamName } from '../../utils/teamNames';
import OptimizedImage from '../../components/OptimizedImage';
import { SkyAffiliateLink } from '../../components/affiliate/AffiliateLink';


export interface FixtureCardProps {
  fixture: SimpleFixture | Fixture;
  variant?: 'default' | 'compact' | 'detailed' | 'minimized';
  showMatchweek?: boolean;
  showViewButton?: boolean;
  className?: string;
  style?: React.CSSProperties;
  groupPosition?: 'single' | 'first' | 'middle' | 'last';
  isInLiveGroup?: boolean; // New prop to disable individual live styling when in a live group
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

const FixtureCard: React.FC<FixtureCardProps> = React.memo(({
  fixture,
  variant = 'compact',
  showMatchweek = false,
  showViewButton = true,
  className = '',
  style = {},
  groupPosition = 'single',
  isInLiveGroup = false
}) => {
  const matchStatus = React.useMemo(() => getMatchStatus(fixture.kickoff_utc), [fixture.kickoff_utc]);
  const statusStyles = React.useMemo(() => getMatchStatusStyles(matchStatus), [matchStatus]);

  // If this card is in a live group, disable individual live styling
  const actualStatusStyles = isInLiveGroup && matchStatus.status === 'live'
    ? { card: {}, badge: statusStyles.badge } // Keep badge but remove card styling
    : statusStyles;
  const fixtureData = React.useMemo(() => getFixtureData(fixture), [fixture]);
  const isMinimized = variant === 'minimized';

  // Generate CSS class names instead of inline styles
  const getCardClasses = () => {
    const classes = ['fixture-card'];

    if (isMinimized) classes.push('minimized');
    if (groupPosition !== 'single') classes.push(groupPosition);

    return classes.join(' ');
  };

  const cardClasses = getCardClasses();

  
  return (
    <div
      className={`${cardClasses} ${className}`}
      style={{ ...actualStatusStyles.card, ...style }}
    >
      {/* Teams Section */}
      <div className="teams-section">
        <div className="team-container">
          {fixtureData.homeCrest && (
            <OptimizedImage
              src={fixtureData.homeCrest}
              alt={`${fixtureData.homeTeam} crest`}
              width={isMinimized ? 14 : 18}
              height={isMinimized ? 14 : 18}
              className="flex-shrink-0"
              onError={() => {}}
            />
          )}
          <span className={`team-name ${isMinimized ? 'minimized' : ''}`}>
            <span className="team-name-full">{fixtureData.homeTeam}</span>
            <span className="team-name-short">{getDisplayTeamName(fixtureData.homeTeam, true)}</span>
          </span>
        </div>

        <div className="vs-divider">vs</div>

        <div className="team-container away-team">
          <span className={`team-name ${isMinimized ? 'minimized' : ''}`}>
            <span className="team-name-full">{fixtureData.awayTeam}</span>
            <span className="team-name-short">{getDisplayTeamName(fixtureData.awayTeam, true)}</span>
          </span>
          {fixtureData.awayCrest && (
            <OptimizedImage
              src={fixtureData.awayCrest}
              alt={`${fixtureData.awayTeam} crest`}
              width={isMinimized ? 14 : 18}
              height={isMinimized ? 14 : 18}
              className="flex-shrink-0"
              onError={() => {}}
            />
          )}
        </div>
      </div>
      
      {/* Live indicator dot */}
      {matchStatus.status === 'live' && (
        <div className={`live-indicator ${isMinimized ? 'minimized' : ''} live-pulse`} />
      )}

      {/* Match Status Badge - hidden in minimized view and when in live group */}
      {!isMinimized && !isInLiveGroup && actualStatusStyles.badge && matchStatus.status === 'live' && (
        <div className="live-badge" style={actualStatusStyles.badge}>
          🔴 LIVE
        </div>
      )}

      {/* Broadcaster Info - Hidden in minimized view */}
      {!isMinimized && (
        <div className="broadcaster-info">
          {fixtureData.isBlackout ? (
            <span className="broadcaster-badge blackout">🚫 Blackout</span>
          ) : fixtureData.broadcaster ? (
            fixtureData.broadcaster === 'Sky Sports' ? (
              <SkyAffiliateLink
                href="https://www.sky.com/deals/sports"
                trackingLabel="fixture-card"
                pageType="fixtures"
                className="broadcaster-badge available"
                showDisclosure={false}
              >
                {fixtureData.broadcaster}
              </SkyAffiliateLink>
            ) : (
              <span className="broadcaster-badge available">{fixtureData.broadcaster}</span>
            )
          ) : (
            <span className="broadcaster-badge tbd">TBD</span>
          )}
        </div>
      )}

      {/* View Button - Always Visible */}
      {showViewButton && (
        <Link to={fixtureData.url} className="view-button">
          View
        </Link>
      )}

      {/* Matchweek (if requested) */}
      {showMatchweek && fixtureData.matchweek && (
        <div className="matchweek-badge">
          MW{fixtureData.matchweek}
        </div>
      )}
    </div>
  );
});

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