import React from 'react';
import { Link } from 'react-router-dom';
import type { SimpleFixture, Fixture } from '../../types';
import { getMatchStatus, getMatchStatusStyles } from '../../utils/matchStatus';
import { shouldCreateMatchPage } from '../../utils/matchPageFilter';
import { getDisplayTeamName } from '../../utils/teamNames';
import { formatTeamNameShort } from '../../utils/seo';
import { formatTime } from '../../utils/dateFormat';
import { COMPETITION_CONFIGS } from '../../config/competitions';
import OptimizedImage from '../../components/OptimizedImage';
import { SkyAffiliateLink } from '../../components/affiliate/AffiliateLink';
import { buildH2HUrl } from '../../utils/urlBuilder';
import { getRoundNumber } from '../../utils/fixtures';

// Helper function to get relative day label
const getRelativeDayLabel = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset time parts for comparison
  const resetTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dateOnly = resetTime(date);
  const todayOnly = resetTime(today);

  // Get day difference
  const diffTime = dateOnly.getTime() - todayOnly.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  // For dates within the next week, show "This [Day]"
  if (diffDays > 0 && diffDays <= 7) {
    const dayName = date.toLocaleDateString('en-GB', { weekday: 'long' });
    return `This ${dayName}`;
  }

  // For dates in the past week, show "[Day]"
  if (diffDays < 0 && diffDays >= -7) {
    return date.toLocaleDateString('en-GB', { weekday: 'long' });
  }

  // For further dates, show short date
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};


export interface FixtureCardProps {
  fixture: SimpleFixture | Fixture;
  variant?: 'default' | 'compact' | 'detailed' | 'minimized' | 'withTime' | 'withTimeNoCompetition';
  showMatchweek?: boolean;
  showViewButton?: boolean;
  className?: string;
  style?: React.CSSProperties;
  groupPosition?: 'single' | 'first' | 'middle' | 'last';
  isInLiveGroup?: boolean; // New prop to disable individual live styling when in a live group
  hideBroadcaster?: boolean; // Hide broadcaster info (e.g., for completed matches)
}

// Helper functions to work with both fixture types
const isSimpleFixture = (fixture: SimpleFixture | Fixture): fixture is SimpleFixture => {
  return 'home_team' in fixture;
};

// Helper to get competition info from fixture
const getCompetitionInfo = (fixture: SimpleFixture | Fixture) => {
  const competitionId = fixture.competition_id;
  if (!competitionId) return null;

  const competition = Object.values(COMPETITION_CONFIGS).find(c => c.id === competitionId);
  return competition || null;
};

const getFixtureData = (fixture: SimpleFixture | Fixture) => {
  // Determine if we should create a match page for this fixture
  const shouldCreatePage = shouldCreateMatchPage(fixture);

  if (isSimpleFixture(fixture)) {
    // Smart URL builder: Direct SEO URL (best) → Fixture ID fallback (robust)
    const urlResult = shouldCreatePage ? buildH2HUrl(fixture) : null;

    return {
      homeTeam: fixture.home_team,
      awayTeam: fixture.away_team,
      homeCrest: fixture.home_crest,
      awayCrest: fixture.away_crest,
      broadcaster: fixture.broadcaster,
      isBlackout: fixture.isBlackout || false,
      matchweek: getRoundNumber(fixture),
      url: urlResult?.url || null,
      urlStrategy: urlResult?.strategy,  // Track which strategy used (for monitoring)
      shouldCreatePage: shouldCreatePage,
      homeScore: fixture.home_score,
      awayScore: fixture.away_score,
      status: fixture.status
    };
  } else {
    // Prefer broadcaster from database view, fallback to providers_uk for legacy support
    const hasProviders = fixture.providers_uk && fixture.providers_uk.length > 0;
    const broadcasterName = fixture.broadcaster || (hasProviders ? fixture.providers_uk[0].name : undefined);
    const isBlackout = fixture.blackout?.is_blackout || false;

    // Smart URL builder: Direct SEO URL (best) → Fixture ID fallback (robust)
    const urlResult = shouldCreatePage ? buildH2HUrl(fixture) : null;

    return {
      homeTeam: fixture.home.name,
      awayTeam: fixture.away.name,
      homeCrest: fixture.home.crest,
      awayCrest: fixture.away.crest,
      broadcaster: broadcasterName,
      isBlackout: isBlackout,
      matchweek: getRoundNumber(fixture),
      url: urlResult?.url || null,
      urlStrategy: urlResult?.strategy,  // Track which strategy used (for monitoring)
      shouldCreatePage: shouldCreatePage,
      homeScore: fixture.score?.home,
      awayScore: fixture.score?.away,
      status: fixture.status
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
  isInLiveGroup = false,
  hideBroadcaster = false
}) => {
  const matchStatus = React.useMemo(() => getMatchStatus(fixture.kickoff_utc), [fixture.kickoff_utc]);
  const statusStyles = React.useMemo(() => getMatchStatusStyles(matchStatus), [matchStatus]);

  // If this card is in a live group, disable individual live styling
  const actualStatusStyles = isInLiveGroup && matchStatus.status === 'live'
    ? { card: {}, badge: statusStyles.badge } // Keep badge but remove card styling
    : statusStyles;
  const fixtureData = React.useMemo(() => getFixtureData(fixture), [fixture]);
  const isMinimized = variant === 'minimized';
  const isWithTime = variant === 'withTime' || variant === 'withTimeNoCompetition';
  const showCompetitionBadge = variant === 'withTime'; // Only show competition badge for 'withTime', not 'withTimeNoCompetition'

  // Generate CSS class names instead of inline styles
  const getCardClasses = () => {
    const classes = ['fixture-card'];

    if (isMinimized) classes.push('minimized');
    if (isWithTime) classes.push('with-time');
    if (groupPosition !== 'single') classes.push(groupPosition);

    return classes.join(' ');
  };

  const cardClasses = getCardClasses();


  return (
    <div
      className={`${cardClasses} ${className}`}
      style={{ ...actualStatusStyles.card, ...style }}
    >
      {/* Time Column - only for withTime variant */}
      {isWithTime && (
        <div className="time-column">
          {/* Day Label */}
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: 1,
            marginBottom: '2px'
          }}>
            {getRelativeDayLabel(fixture.kickoff_utc)}
          </div>

          {/* Time */}
          <div className="kickoff-time">
            {formatTime(fixture.kickoff_utc)}
          </div>

          {(() => {
            const competition = getCompetitionInfo(fixture);
            return (
              <div className="time-column-metadata">
                {/* League Pill - Only show if showCompetitionBadge is true */}
                {showCompetitionBadge && competition && (
                  <Link
                    to={`/competitions/${competition.slug}`}
                    className="league-pill"
                    style={{
                      background: 'rgba(0, 0, 0, 0.08)',
                      color: '#1f2937',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                    title={`View ${competition.name} fixtures`}
                  >
                    {competition.logo && (
                      <img
                        src={competition.logo}
                        alt={`${competition.name} logo`}
                        style={{
                          width: '14px',
                          height: '14px',
                          objectFit: 'contain'
                        }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <span className="league-pill-text">
                      {competition.shortName}
                    </span>
                  </Link>
                )}

                {/* Matchweek */}
                {showMatchweek && fixtureData.matchweek !== null && (
                  <div className="matchweek-pill">
                    {fixtureData.matchweek}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

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
            <span className="team-name-full">{formatTeamNameShort(fixtureData.homeTeam)}</span>
            <span className="team-name-short">{getDisplayTeamName(fixtureData.homeTeam, true)}</span>
          </span>
        </div>

        {fixtureData.homeScore !== undefined && fixtureData.awayScore !== undefined && fixtureData.status !== 'NS' ? (
          <div className="score-display">
            {fixtureData.homeScore} - {fixtureData.awayScore}
          </div>
        ) : (
          <div className="vs-divider">vs</div>
        )}

        <div className="team-container away-team">
          <span className={`team-name ${isMinimized ? 'minimized' : ''}`}>
            <span className="team-name-full">{formatTeamNameShort(fixtureData.awayTeam)}</span>
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

      {/* Broadcaster Info - Hidden in minimized view or when hideBroadcaster is true */}
      {!isMinimized && !hideBroadcaster && (
        <div className="broadcaster-info">
          {fixtureData.isBlackout ? (
            <span className="broadcaster-badge blackout">🚫 No UK Broadcast</span>
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
            <span className="broadcaster-badge tbd">Broadcast TBD</span>
          )}
        </div>
      )}

      {/* Info Button - Only show if we should create a page */}
      {showViewButton && fixtureData.shouldCreatePage && fixtureData.url && (
        <Link to={fixtureData.url} className="view-button">
          Info
        </Link>
      )}

      {/* Matchweek moved to time column for withTime variant */}
    </div>
  );
});

// Add CSS for responsive styles
const fixtureCardStyles = `
  .fixture-card.with-time {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 12px;
    padding: 12px;
    min-height: auto;
  }

  .fixture-card.with-time .teams-section {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .time-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 80px;
    flex-shrink: 0;
    padding-right: 8px;
    border-right: 1px solid #e5e7eb;
    gap: 4px;
  }

  /* Mobile optimizations for time column */
  @media (max-width: 640px) {
    .time-column {
      min-width: 50px;
      padding-right: 6px;
      gap: 2px;
    }

    .kickoff-time {
      font-size: 12px;
    }

    .league-pill {
      font-size: 10px;
      padding: 1px 4px;
    }

    .matchweek-pill {
      font-size: 9px;
    }
  }

  .kickoff-time {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    text-align: center;
    line-height: 1.2;
  }

  .time-column-metadata {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .league-pill {
    font-size: clamp(11px, 2vw, 12px); /* Increased from 9px for better readability */
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: center;
    line-height: 1;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-block;
  }

  .league-pill:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }

  .matchweek-pill {
    font-size: clamp(10px, 2vw, 11px); /* Increased from 8px for better readability */
    font-weight: 600;
    color: #64748b; /* Darkened from #6b7280 for better contrast */
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: center;
    line-height: 1;
  }

  .score-display {
    background: #e5e7eb;
    color: #1f2937;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    min-width: 60px;
    text-align: center;
  }

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

  .view-button.disabled {
    color: #9ca3af;
    border-color: #9ca3af;
    cursor: not-allowed;
    pointer-events: none;
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

    .fixture-card.with-time {
      grid-template-columns: auto 1fr auto;
      gap: 8px;
      padding: 10px 8px;
    }

    .fixture-card.with-time .teams-section {
      gap: 6px;
    }

    .fixture-card.with-time .team-container {
      gap: 3px;
    }

    .fixture-card.with-time .team-name {
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fixture-card.with-time .vs-divider {
      font-size: 11px;
      min-width: 16px;
    }

    .score-display {
      font-size: 13px;
      padding: 4px 8px;
      min-width: 50px;
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