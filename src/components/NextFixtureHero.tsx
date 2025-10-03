import React from 'react';
import type { Fixture } from '../types';
import { formatDetailedDate } from '../utils/dateFormat';
import { mapCompetitionSlugToName } from '../utils/competitionMapping';
import CountdownTimer from './CountdownTimer';
import LiveBadge from './LiveBadge';
import { getMatchStatus } from '../utils/matchStatus';

interface NextFixtureHeroProps {
  fixture: Fixture;
  team1Name: string;
  team2Name: string;
  className?: string;
}

const NextFixtureHero: React.FC<NextFixtureHeroProps> = ({
  fixture,
  team1Name,
  team2Name,
  className = ''
}) => {
  const matchStatus = getMatchStatus(fixture.kickoff_utc);
  const isLive = matchStatus.status === 'live';
  const isUpcoming = matchStatus.status === 'upcoming' || matchStatus.status === 'upNext';
  const isCompleted = matchStatus.status === 'finished';
  const hasScore = fixture.score?.home !== undefined && fixture.score?.away !== undefined;

  const getBroadcasterIcons = () => {
    return fixture.providers_uk.map(provider => {
      const icons: Record<string, string> = {
        'sky-sports': '📺',
        'bt-sport': '🟦',
        'tnt-sports': '🟦',
        'bbc': '📻',
        'itv': '📺',
        'amazon-prime': '💻',
        'discovery-plus': '💻'
      };
      return icons[provider.slug || ''] || '📺';
    });
  };

  return (
    <div
      className={`next-fixture-hero ${className}`}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.3,
        zIndex: 1
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          {isLive && (
            <div style={{ marginBottom: '12px' }}>
              <LiveBadge kickoffTime={fixture.kickoff_utc} />
            </div>
          )}

          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {isLive ? 'LIVE NOW' : isCompleted ? 'Final Score' : 'Next Meeting'}
          </h1>

          <p style={{
            fontSize: '1.125rem',
            opacity: 0.9,
            margin: 0
          }}>
            {team1Name} vs {team2Name}
          </p>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Home Team */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '2rem',
              overflow: 'hidden'
            }}>
              {fixture.home.crest ? (
                <img
                  src={fixture.home.crest}
                  alt={`${fixture.home.name} crest`}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '⚽';
                  }}
                />
              ) : (
                '⚽'
              )}
            </div>
            <a
              href={`/clubs/${fixture.home.slug}`}
              style={{
                color: 'inherit',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                margin: 0,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                {fixture.home.name}
              </h3>
            </a>
          </div>

          {/* VS/Score and Competition */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '8px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {isCompleted && hasScore && fixture.score ? (
                <div style={{ fontSize: '3rem', lineHeight: '1' }}>
                  {fixture.score.home} - {fixture.score.away}
                </div>
              ) : (
                'VS'
              )}
            </div>
            <a
              href={`/competitions/${fixture.competition || 'premier-league'}`}
              style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                color: 'inherit',
                display: 'inline-block',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              {fixture.competition ? mapCompetitionSlugToName(fixture.competition) : 'Premier League'}
            </a>
          </div>

          {/* Away Team */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '2rem',
              overflow: 'hidden'
            }}>
              {fixture.away.crest ? (
                <img
                  src={fixture.away.crest}
                  alt={`${fixture.away.name} crest`}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '⚽';
                  }}
                />
              ) : (
                '⚽'
              )}
            </div>
            <a
              href={`/clubs/${fixture.away.slug}`}
              style={{
                color: 'inherit',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                margin: 0,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                {fixture.away.name}
              </h3>
            </a>
          </div>
        </div>

        {/* Match Details */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}>
            {/* Date & Time */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '0.875rem',
                opacity: 0.8,
                marginBottom: '4px'
              }}>
                {isLive ? 'Match Started' : 'Kick-off'}
              </div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '600'
              }}>
                {formatDetailedDate(fixture.kickoff_utc)}
              </div>
            </div>

            {/* Countdown */}
            {isUpcoming && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '0.875rem',
                  opacity: 0.8,
                  marginBottom: '4px'
                }}>
                  Time Remaining
                </div>
                <CountdownTimer
                  targetDate={fixture.kickoff_utc}
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: 'white'
                  }}
                />
              </div>
            )}

            {/* Where to Watch */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '0.875rem',
                opacity: 0.8,
                marginBottom: '4px'
              }}>
                Where to Watch
              </div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '600'
              }}>
                {fixture.providers_uk.length > 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                    {getBroadcasterIcons().map((icon, index) => (
                      <span key={index}>{icon}</span>
                    ))}
                    <span style={{ marginLeft: '8px' }}>
                      {fixture.providers_uk[0].name}
                      {fixture.providers_uk.length > 1 && ` +${fixture.providers_uk.length - 1}`}
                    </span>
                  </div>
                ) : fixture.blackout?.is_blackout ? (
                  <span>🚫 Not televised</span>
                ) : (
                  <span>📺 TBD</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NextFixtureHero;