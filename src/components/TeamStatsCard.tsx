/**
 * TeamStatsCard Component
 *
 * Displays quick facts and statistics about a team:
 * - Venue, location, colors, founded date
 * - Upcoming fixtures count
 * - Broadcast coverage percentage
 * - Next 7 days fixtures
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/components/Card';
import Flex from '../design-system/components/Layout/Flex';
import Stack from '../design-system/components/Layout/Stack';
import { formatTeamNameShort } from '../utils/seo';
import { getAllCompetitionConfigs } from '../config/competitions';
import type { TeamMetadata } from '../hooks/useTeamData';
import type { CompetitionFixtureGroup } from '../utils/teamFixtures';

export interface TeamStatsCardProps {
  metadata: TeamMetadata;
  competitionGroups?: CompetitionFixtureGroup[];
  upcomingCount: number;
  next7DaysCount: number;
  broadcastCoverage: {
    total: number;
    confirmed: number;
    percentage: number;
  };
  className?: string;
}

export const TeamStatsCard: React.FC<TeamStatsCardProps> = ({
  metadata,
  competitionGroups,
  upcomingCount,
  next7DaysCount,
  broadcastCoverage,
  className = ''
}) => {
  const { team, venue, city, founded, clubColors, website } = metadata;
  const teamName = formatTeamNameShort(team.name);

  // Get primary competition for fallback
  const primaryCompetition = team.competition_id
    ? getAllCompetitionConfigs().find(c => c.id === team.competition_id)
    : null;

  return (
    <Card variant="outline" className={className}>
      <CardHeader size="default">
        <CardTitle size="default" as="h2">
          📊 Quick Facts
        </CardTitle>
      </CardHeader>

      <CardContent size="default">
        <Stack space="sm">
          {/* Venue */}
          {venue && (
            <Flex align="start" gap="sm">
              <span className="text-lg" style={{ minWidth: '24px' }}>🏟️</span>
              <div className="flex-1">
                <strong>Home Stadium:</strong> {venue}
              </div>
            </Flex>
          )}

          {/* Location */}
          {city && (
            <Flex align="start" gap="sm">
              <span className="text-lg" style={{ minWidth: '24px' }}>📍</span>
              <div className="flex-1">
                <strong>Location:</strong> {city}
              </div>
            </Flex>
          )}

          {/* Founded */}
          {founded && (
            <Flex align="start" gap="sm">
              <span className="text-lg" style={{ minWidth: '24px' }}>📅</span>
              <div className="flex-1">
                <strong>Founded:</strong> {founded}
              </div>
            </Flex>
          )}

          {/* Colors */}
          {clubColors && (
            <Flex align="start" gap="sm">
              <span className="text-lg" style={{ minWidth: '24px' }}>🎨</span>
              <div className="flex-1">
                <strong>Team Colors:</strong> {clubColors}
              </div>
            </Flex>
          )}

          {/* Website */}
          {website && (
            <Flex align="start" gap="sm">
              <span className="text-lg" style={{ minWidth: '24px' }}>🌐</span>
              <div className="flex-1">
                <strong>Website:</strong>{' '}
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </a>
              </div>
            </Flex>
          )}

          {/* Competitions - Show all if available, otherwise primary */}
          {competitionGroups && competitionGroups.length > 0 ? (
            <Flex align="start" gap="sm">
              <span className="text-lg" style={{ minWidth: '24px' }}>🏆</span>
              <div className="flex-1">
                <strong>Competitions:</strong>{' '}
                {competitionGroups.length === 1
                  ? competitionGroups[0].competition.name
                  : competitionGroups.map((g, idx) => (
                      <React.Fragment key={g.competition.id}>
                        {idx > 0 && ' • '}
                        <span style={{ whiteSpace: 'nowrap' }}>
                          {g.competition.icon} {g.competition.shortName || g.competition.name}
                        </span>
                      </React.Fragment>
                    ))}
              </div>
            </Flex>
          ) : (
            primaryCompetition && (
              <Flex align="start" gap="sm">
                <span className="text-lg" style={{ minWidth: '24px' }}>{primaryCompetition.icon}</span>
                <div className="flex-1">
                  <strong>Current Competition:</strong> {primaryCompetition.name}
                </div>
              </Flex>
            )
          )}

          {/* Divider */}
          <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

          {/* Upcoming Stats */}
          <Flex align="start" gap="sm">
            <span className="text-lg" style={{ minWidth: '24px' }}>📅</span>
            <div className="flex-1">
              <strong>Next 7 Days:</strong> {next7DaysCount} {next7DaysCount === 1 ? 'match' : 'matches'}
            </div>
          </Flex>

          <Flex align="start" gap="sm">
            <span className="text-lg" style={{ minWidth: '24px' }}>📺</span>
            <div className="flex-1">
              <strong>Broadcast Coverage:</strong> {broadcastCoverage.confirmed} of {broadcastCoverage.total} fixtures confirmed ({broadcastCoverage.percentage}%)
            </div>
          </Flex>

          <Flex align="start" gap="sm">
            <span className="text-lg" style={{ minWidth: '24px' }}>🎯</span>
            <div className="flex-1">
              <strong>Total Upcoming:</strong> {upcomingCount} {upcomingCount === 1 ? 'match' : 'matches'}
            </div>
          </Flex>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TeamStatsCard;
