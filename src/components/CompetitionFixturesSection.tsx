/**
 * CompetitionFixturesSection Component
 *
 * Displays team fixtures grouped by competition with:
 * - Tabbed interface for multi-competition teams
 * - Direct sections for single-competition teams
 * - Upcoming vs Results split
 * - Competition-specific descriptions for SEO
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/components/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../design-system/components/Tabs';
import { FixtureCard } from '../design-system';
import Flex from '../design-system/components/Layout/Flex';
import Stack from '../design-system/components/Layout/Stack';
import { formatTeamNameShort } from '../utils/seo';
import type { CompetitionFixtureGroup } from '../utils/teamFixtures';

export interface CompetitionFixturesSectionProps {
  competitionGroups: CompetitionFixtureGroup[];
  teamName: string;
  hasMultipleCompetitions: boolean;
  className?: string;
}

interface CompetitionTabProps {
  group: CompetitionFixtureGroup;
  teamName: string;
}

const CompetitionTab: React.FC<CompetitionTabProps> = ({ group, teamName }) => {
  const [activeView, setActiveView] = useState<'upcoming' | 'results'>('upcoming');
  const { competition, upcoming, results, stats } = group;

  return (
    <div>
      {/* Competition Description for SEO */}
      <p className="mb-4" style={{ fontSize: '0.95rem', opacity: 0.9 }}>
        View all {stats.upcoming} upcoming {competition.name} fixtures for {teamName}. Check kick-off times,
        TV broadcast channels, and where to watch every match live in the UK.
      </p>

      {/* Upcoming / Results Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'upcoming' | 'results')}>
        <TabsList variant="underline" style={{ marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0' }}>
          <TabsTrigger
            value="upcoming"
            style={{
              fontSize: '1.05rem',
              fontWeight: '600',
              padding: '0.75rem 1.5rem'
            }}
          >
            Upcoming ({stats.upcoming})
          </TabsTrigger>
          <TabsTrigger
            value="results"
            style={{
              fontSize: '1.05rem',
              fontWeight: '600',
              padding: '0.75rem 1.5rem'
            }}
          >
            Results ({Math.min(results.length, 5)})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Fixtures */}
        <TabsContent value="upcoming" className="mt-4">
          {upcoming.length === 0 ? (
            <Card variant="outline">
              <CardContent size="default">
                <p className="text-center py-4">No upcoming {competition.name} fixtures scheduled.</p>
              </CardContent>
            </Card>
          ) : (
            <Stack space="sm">
              {upcoming.map(fixture => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  variant="withTime"
                  showViewButton={true}
                />
              ))}
            </Stack>
          )}
        </TabsContent>

        {/* Latest Results */}
        <TabsContent value="results" className="mt-4">
          {results.length === 0 ? (
            <Card variant="outline">
              <CardContent size="default">
                <p className="text-center py-4">No recent {competition.name} results.</p>
              </CardContent>
            </Card>
          ) : (
            <Stack space="sm">
              {results.map(fixture => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  variant="withTime"
                  hideBroadcaster={true}
                  showViewButton={true}
                />
              ))}
            </Stack>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const CompetitionFixturesSection: React.FC<CompetitionFixturesSectionProps> = ({
  competitionGroups,
  teamName,
  hasMultipleCompetitions,
  className = ''
}) => {
  if (competitionGroups.length === 0) {
    return (
      <Card variant="outline" className={className}>
        <CardContent size="default">
          <p className="text-center py-4">No upcoming fixtures found.</p>
        </CardContent>
      </Card>
    );
  }

  const shortTeamName = formatTeamNameShort(teamName);

  // For single competition teams, show direct sections
  if (!hasMultipleCompetitions) {
    const group = competitionGroups[0];

    return (
      <section className={className}>
        <h2 style={{
          marginTop: 0,
          marginBottom: '1.5rem',
          fontSize: '1.75rem',
          fontWeight: '700',
          color: 'var(--text-primary, #1a202c)'
        }}>
          {group.competition.icon} Complete Match Schedule
        </h2>

        <CompetitionTab group={group} teamName={shortTeamName} />

        {/* Link to full competition schedule */}
        <div className="mt-4">
          <a
            href={`/competitions/${group.competition.slug}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Full {group.competition.name} Schedule →
          </a>
        </div>
      </section>
    );
  }

  // For multi-competition teams, use tabbed interface
  return (
    <section className={className}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '1.5rem',
        fontSize: '1.75rem',
        fontWeight: '700',
        color: 'var(--text-primary, #1a202c)'
      }}>
        📅 Complete Match Schedule
      </h2>

      <Tabs defaultValue={competitionGroups[0].competition.slug}>
        <TabsList variant="pills" style={{ marginBottom: '1.5rem' }}>
          {competitionGroups.map(group => (
            <TabsTrigger
              key={group.competition.slug}
              value={group.competition.slug}
              style={{
                fontSize: '1rem',
                padding: '0.75rem 1.25rem',
                fontWeight: '600'
              }}
            >
              <Flex align="center" gap="xs">
                <span style={{ fontSize: '1.25rem' }}>{group.competition.icon}</span>
                <span>{group.competition.shortName}</span>
                <span className="opacity-60">({group.stats.upcoming})</span>
              </Flex>
            </TabsTrigger>
          ))}
        </TabsList>

        {competitionGroups.map(group => (
          <TabsContent
            key={group.competition.slug}
            value={group.competition.slug}
            className="mt-4"
          >
            <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>
              {group.competition.icon} {group.competition.name} ({group.stats.upcoming})
            </h3>

            <CompetitionTab group={group} teamName={shortTeamName} />

            {/* Link to full competition schedule */}
            <div className="mt-4">
              <a
                href={`/competitions/${group.competition.slug}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Full {group.competition.name} Schedule →
              </a>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
};

export default CompetitionFixturesSection;
