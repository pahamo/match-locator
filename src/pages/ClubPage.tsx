import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getFixtures } from '../services/supabase';
import type { Fixture } from '../types';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import { generateTeamMeta, updateDocumentMeta, formatTeamNameShort } from '../utils/seo';
import StructuredData from '../components/StructuredData';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/components/Card';
import Flex from '../design-system/components/Layout/Flex';
import Stack from '../design-system/components/Layout/Stack';
import { RelatedTeamsSection } from '../components/RelatedTeamsSection';
import { getAllCompetitionConfigs } from '../config/competitions';
import { generateBreadcrumbs } from '../utils/breadcrumbs';
import { FreshnessIndicator, PageUpdateTimestamp } from '../components/FreshnessIndicator';
import { getMostRecentFixtureUpdate } from '../utils/contentFreshness';

// New enhanced components and hooks
import { useTeamMetadata, useTeamFixtures } from '../hooks/useTeamData';
import TeamHeader from '../components/TeamHeader';
import EnhancedNextMatch from '../components/EnhancedNextMatch';
import TeamStatsCard from '../components/TeamStatsCard';
import CompetitionFixturesSection from '../components/CompetitionFixturesSection';
import { generateExpandedTeamFAQ, generateMultipleSportsEvents } from '../utils/structuredDataHelpers';

const ClubPage: React.FC = () => {
  const { slug, clubId } = useParams<{ slug?: string; clubId?: string }>();
  const teamSlug = slug ?? clubId ?? '';
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch fixtures (includes past 4 months + all future)
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from 4 months ago to get current season results
        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

        const data = await getFixtures({
          teamSlug: teamSlug,
          dateFrom: fourMonthsAgo.toISOString(),
          limit: 500,
          order: 'asc'
        });
        if (!ignore) {
          setFixtures(data);
        }
      } catch (e) {
        if (!ignore) setError('Failed to load team fixtures. Please try again later.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    if (teamSlug) load();
    return () => {
      ignore = true;
    };
  }, [teamSlug]);

  // Extract team metadata using new hook
  const teamMetadata = useTeamMetadata(fixtures, teamSlug);

  // Process fixtures data using new hook
  const fixturesData = useTeamFixtures(fixtures);

  // Get competition name for primary competition
  const competitionName = useMemo(() => {
    if (!teamMetadata?.team.competition_id) return undefined;
    const allCompetitions = getAllCompetitionConfigs();
    const competition = allCompetitions.find(c => c.id === teamMetadata.team.competition_id);
    return competition?.name;
  }, [teamMetadata]);

  // Get broadcaster name helper
  const getBroadcasterName = useCallback((match: Fixture | undefined) => {
    if (!match) return null;
    return match.broadcaster || match.providers_uk?.[0]?.name || null;
  }, []);

  // Generate enhanced FAQ data with 8-10 questions
  const faqData = useMemo(() => {
    if (!teamMetadata) return [];

    const competitions = fixturesData.competitionGroups.map(g => g.competition.name);

    return generateExpandedTeamFAQ(
      teamMetadata.team,
      fixturesData.nextMatch,
      fixturesData.broadcastCoverage.total,
      competitions
    );
  }, [teamMetadata, fixturesData]);

  // Update SEO meta tags with enhanced options
  useEffect(() => {
    if (!teamMetadata) return;

    const nextMatchInfo = fixturesData.nextMatch
      ? {
          opponent: formatTeamNameShort(
            fixturesData.nextMatch.home.slug === teamSlug
              ? fixturesData.nextMatch.away.name
              : fixturesData.nextMatch.home.name
          ),
          date: new Date(fixturesData.nextMatch.kickoff_utc).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short'
          }),
          channel: getBroadcasterName(fixturesData.nextMatch) || undefined
        }
      : undefined;

    const competitions = fixturesData.competitionGroups.map(g => g.competition.name);

    const meta = generateTeamMeta(
      teamMetadata.team,
      fixturesData.broadcastCoverage.total,
      nextMatchInfo,
      {
        competitions,
        venue: teamMetadata.venue,
        location: teamMetadata.city
      }
    );

    updateDocumentMeta(meta);
  }, [teamMetadata, fixturesData, teamSlug, getBroadcasterName]);

  // Generate multiple SportsEvent schemas for rich results
  const sportsEventSchemas = useMemo(() => {
    return generateMultipleSportsEvents(
      fixturesData.competitionGroups.flatMap(g => g.upcoming),
      5
    );
  }, [fixturesData.competitionGroups]);

  if (loading) {
    return (
      <div className="club-page">
        <Header />
        <main>
          <div className="wrap">
            <div className="loading">Loading fixtures…</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="club-page">
        <Header />
        <main>
          <div className="wrap">
            <div className="error">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (!teamMetadata) {
    return (
      <div className="club-page">
        <Header />
        <main>
          <div className="wrap">
            <div className="error">Team not found.</div>
          </div>
        </main>
      </div>
    );
  }

  const teamName = formatTeamNameShort(teamMetadata.team.name);

  return (
    <div className="club-page">
      {/* Enhanced Structured Data */}
      <StructuredData type="faq" data={faqData} dateModified={new Date().toISOString()} />
      <StructuredData type="team" data={teamMetadata.team} />

      {/* Multiple SportsEvent schemas for rich results */}
      {sportsEventSchemas.map((schema, index) => (
        <script
          key={`sports-event-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <Header />

      <main>
        <div className="wrap">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={generateBreadcrumbs(window.location.pathname, {
              teamName
            })}
          />

          {/* NEW: Team Header with crest and metadata */}
          <TeamHeader
            metadata={teamMetadata}
            competitionGroups={fixturesData.competitionGroups}
            className="mb-6"
          />

          {/* Freshness Indicator */}
          {fixtures.length > 0 && (
            <div style={{ marginTop: '12px', marginBottom: '16px' }}>
              <FreshnessIndicator
                date={getMostRecentFixtureUpdate(fixtures) || new Date()}
                variant="full"
                showBadge={true}
              />
              <PageUpdateTimestamp label="Fixtures last checked" />
            </div>
          )}

          {/* NEW: Enhanced Next Match Component */}
          {fixturesData.nextMatch && (
            <EnhancedNextMatch
              fixture={fixturesData.nextMatch}
              teamSlug={teamSlug}
              className="mb-8"
            />
          )}

          {/* NEW: Team Stats Card */}
          <TeamStatsCard
            metadata={teamMetadata}
            competitionGroups={fixturesData.competitionGroups}
            upcomingCount={fixturesData.broadcastCoverage.total}
            next7DaysCount={fixturesData.next7Days.length}
            broadcastCoverage={fixturesData.broadcastCoverage}
            className="mb-12"
          />

          {/* Visual Separator */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent)',
            margin: '3rem 0'
          }} />

          {/* How to Watch Section */}
          <Card variant="outline" className="mb-12">
            <CardHeader size="default">
              <CardTitle size="default" as="h2">
                📺 How to Watch {teamName} on TV
              </CardTitle>
            </CardHeader>

            <CardContent size="default">
              <Stack space="md">
                {fixturesData.nextMatch && getBroadcasterName(fixturesData.nextMatch) && (
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      🎯 Next Match: Watch on{' '}
                      <span className="font-bold">{getBroadcasterName(fixturesData.nextMatch)}</span>
                    </p>
                    <p className="text-sm mt-1 text-blue-800 dark:text-blue-200">
                      {formatTeamNameShort(fixturesData.nextMatch.home.name)} vs{' '}
                      {formatTeamNameShort(fixturesData.nextMatch.away.name)} •{' '}
                      {new Date(fixturesData.nextMatch.kickoff_utc).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>
                )}

                <div>
                  <p className="mb-4">
                    {teamName} matches are broadcast live across multiple UK channels depending on the
                    competition:
                  </p>

                  <Stack space="sm">
                    <Flex align="start" gap="sm">
                      <span className="text-lg">⚽</span>
                      <div>
                        <strong>Premier League:</strong>{' '}
                        <a
                          href="https://www.skysports.com/football/fixtures-results"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Sky Sports
                        </a>{' '}
                        and{' '}
                        <a
                          href="https://tntsports.co.uk/football"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          TNT Sports
                        </a>
                      </div>
                    </Flex>

                    <Flex align="start" gap="sm">
                      <span className="text-lg">🏆</span>
                      <div>
                        <strong>Champions League & Europa League:</strong> Primarily TNT Sports
                      </div>
                    </Flex>

                    <Flex align="start" gap="sm">
                      <span className="text-lg">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                      <div>
                        <strong>FA Cup & Carabao Cup:</strong> BBC, ITV, Sky Sports
                      </div>
                    </Flex>
                  </Stack>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ℹ️ All kick-off times shown in UK time (GMT/BST) • Broadcaster confirmed fixtures are
                    marked below
                  </p>
                </div>
              </Stack>
            </CardContent>
          </Card>

          {/* Visual Separator */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent)',
            margin: '3rem 0'
          }} />

          {/* NEW: Competition Fixtures Section with Tabs */}
          <CompetitionFixturesSection
            competitionGroups={fixturesData.competitionGroups}
            teamName={teamMetadata.team.name}
            hasMultipleCompetitions={fixturesData.hasMultipleCompetitions}
            className="mb-12"
          />

          {/* Related Teams Section */}
          {teamMetadata.team && (
            <div className="mb-8">
              <RelatedTeamsSection
                currentTeam={teamMetadata.team}
                competitionName={competitionName}
              />
            </div>
          )}

          {/* Back Link */}
          <div style={{ marginTop: '1.5rem' }}>
            <a href="/" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
              ← Back to Schedule
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClubPage;
