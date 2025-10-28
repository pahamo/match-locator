/**
 * EnhancedNextMatch Component
 *
 * Enhanced "Next Match" callout with:
 * - Competition badge
 * - Matchweek/round information
 * - Venue display
 * - Countdown timer
 * - Link to match page
 * - Add to calendar button (future enhancement)
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Fixture } from '../types';
import { formatTeamNameShort } from '../utils/seo';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/components/Card';
import Flex from '../design-system/components/Layout/Flex';
import Stack from '../design-system/components/Layout/Stack';
import { COMPETITION_CONFIGS } from '../config/competitions';
import { getRoundNumber } from '../utils/fixtures';
import { buildH2HUrl } from '../utils/urlBuilder';
import OptimizedImage from './OptimizedImage';

export interface EnhancedNextMatchProps {
  fixture: Fixture;
  teamSlug: string;
  className?: string;
}

export const EnhancedNextMatch: React.FC<EnhancedNextMatchProps> = ({
  fixture,
  teamSlug,
  className = ''
}) => {
  const competition = useMemo(() => {
    if (!fixture.competition_id) return null;
    return Object.values(COMPETITION_CONFIGS).find(c => c.id === fixture.competition_id);
  }, [fixture.competition_id]);

  const broadcaster = fixture.broadcaster || fixture.providers_uk?.[0]?.name;
  const roundNumber = getRoundNumber(fixture);
  const isHomeMatch = fixture.home.slug === teamSlug;
  const venue = fixture.venue || (isHomeMatch ? fixture.home.venue : fixture.away.venue);

  // Build match URL
  const urlResult = buildH2HUrl(fixture);

  // Calculate countdown
  const countdown = useMemo(() => {
    const now = new Date().getTime();
    const kickoff = new Date(fixture.kickoff_utc).getTime();
    const diff = kickoff - now;

    if (diff < 0) return 'Match started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, [fixture.kickoff_utc]);

  return (
    <Card variant="primary" className={`mb-8 ${className}`}>
      <CardHeader size="default">
        <Flex justify="between" align="center">
          <CardTitle size="sm" as="h2">
            ⚡ Next Match
          </CardTitle>
          {competition && (
            <Flex align="center" gap="xs" style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              <span>{competition.icon}</span>
              <span>{competition.shortName}</span>
            </Flex>
          )}
        </Flex>

        <div className="text-3xl font-bold mt-3">
          <Flex align="center" justify="center" gap="md" wrap="wrap">
            {fixture.home.crest && (
              <OptimizedImage
                src={fixture.home.crest}
                alt={fixture.home.name}
                width={40}
                height={40}
              />
            )}
            <span>{formatTeamNameShort(fixture.home.name)}</span>
            <span style={{ opacity: 0.6 }}>vs</span>
            <span>{formatTeamNameShort(fixture.away.name)}</span>
            {fixture.away.crest && (
              <OptimizedImage
                src={fixture.away.crest}
                alt={fixture.away.name}
                width={40}
                height={40}
              />
            )}
          </Flex>
        </div>
      </CardHeader>

      <CardContent size="default">
        <Stack space="md">
          {/* Competition & Round */}
          {competition && (
            <Flex align="center" gap="sm">
              <span className="text-xl">{competition.icon}</span>
              <span>
                {competition.name}
                {roundNumber && ` - Matchday ${roundNumber}`}
              </span>
            </Flex>
          )}

          {/* Date */}
          <Flex align="center" gap="sm">
            <span className="text-xl">📅</span>
            <span>
              {new Date(fixture.kickoff_utc).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </Flex>

          {/* Time */}
          <Flex align="center" gap="sm">
            <span className="text-xl">⏰</span>
            <span>
              {new Date(fixture.kickoff_utc).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}{' '}
              UK Time
            </span>
          </Flex>

          {/* Broadcaster */}
          {broadcaster && (
            <Flex align="center" gap="sm">
              <span className="text-xl">📺</span>
              <span className="font-semibold">{broadcaster}</span>
            </Flex>
          )}

          {/* Venue */}
          {venue && (
            <Flex align="center" gap="sm">
              <span className="text-xl">🏟️</span>
              <span>{venue}{isHomeMatch && ' (Home)'}</span>
            </Flex>
          )}

          {/* Countdown */}
          <div className="mt-2 pt-4 border-t border-white/30">
            <div className="font-medium">Kicks off in: {countdown}</div>
          </div>

          {/* View Match Button */}
          {urlResult?.url && (
            <Link
              to={urlResult.url}
              className="inline-block mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-center transition-colors"
            >
              View Match Details →
            </Link>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default EnhancedNextMatch;
