/**
 * TeamHeader Component
 *
 * Displays team crest, name, and metadata (venue, location, colors, etc.)
 * with proper SEO structure and visual hierarchy.
 */

import React from 'react';
import { formatTeamNameShort } from '../utils/seo';
import { CompetitionBadge } from './CompetitionBadge';
import Flex from '../design-system/components/Layout/Flex';
import Stack from '../design-system/components/Layout/Stack';
import OptimizedImage from './OptimizedImage';
import type { TeamMetadata } from '../hooks/useTeamData';
import type { CompetitionFixtureGroup } from '../utils/teamFixtures';

export interface TeamHeaderProps {
  metadata: TeamMetadata;
  competitionGroups?: CompetitionFixtureGroup[];
  className?: string;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({ metadata, competitionGroups, className = '' }) => {
  const { team, venue, city, founded, clubColors, website, crestUrl } = metadata;
  const teamName = formatTeamNameShort(team.name);

  return (
    <div className={className}>
      {/* Team Crest & Title */}
      <Flex align="start" gap="lg" className="mb-6">
        {crestUrl && (
          <div
            className="team-crest flex-shrink-0"
            style={{
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <OptimizedImage
              src={crestUrl}
              alt={`${teamName} crest`}
              width={80}
              height={80}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        )}

        <Stack space="sm" className="flex-1">
          <h1
            className="team-title"
            style={{
              margin: 0,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1
            }}
          >
            {teamName} TV Schedule & Fixtures
          </h1>

          <p
            className="team-subtitle"
            style={{
              margin: 0,
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              opacity: 0.8
            }}
          >
            Your Complete Guide to Watching {teamName} Live
          </p>
        </Stack>
      </Flex>

      {/* Team Metadata Row */}
      <Flex
        wrap="wrap"
        gap="md"
        className="team-metadata mb-4"
        style={{
          fontSize: '0.95rem',
          opacity: 0.85
        }}
      >
        {venue && (
          <Flex align="center" gap="xs">
            <span style={{ fontSize: '1.1rem' }}>🏟️</span>
            <span>{venue}</span>
          </Flex>
        )}

        {city && (
          <Flex align="center" gap="xs">
            <span style={{ fontSize: '1.1rem' }}>📍</span>
            <span>{city}</span>
          </Flex>
        )}

        {clubColors && (
          <Flex align="center" gap="xs">
            <span style={{ fontSize: '1.1rem' }}>🎨</span>
            <span>{clubColors}</span>
          </Flex>
        )}

        {founded && (
          <Flex align="center" gap="xs">
            <span style={{ fontSize: '1.1rem' }}>📅</span>
            <span>Founded {founded}</span>
          </Flex>
        )}

        {website && (
          <Flex align="center" gap="xs">
            <span style={{ fontSize: '1.1rem' }}>🌐</span>
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
            </a>
          </Flex>
        )}
      </Flex>

      {/* Competition Badges - Show all competitions team participates in */}
      {competitionGroups && competitionGroups.length > 0 ? (
        <div className="mt-4">
          <Flex align="center" gap="sm" wrap="wrap">
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                opacity: 0.7,
                marginRight: '0.25rem'
              }}
            >
              Playing in:
            </span>
            {competitionGroups.map((group) => (
              <CompetitionBadge key={group.competition.id} competitionId={group.competition.id} />
            ))}
          </Flex>
        </div>
      ) : (
        /* Fallback to primary competition if competitionGroups not provided */
        team.competition_id && (
          <div className="mt-3">
            <CompetitionBadge competitionId={team.competition_id} />
          </div>
        )
      )}
    </div>
  );
};

export default TeamHeader;
