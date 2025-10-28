import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFixtures } from '../services/supabase';
import type { Fixture } from '../types';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import { generateTeamMeta, updateDocumentMeta, formatTeamNameShort } from '../utils/seo';
import { FixtureCard } from '../design-system';
import { teamMatchesSlug } from '../utils/slugUtils';
import StructuredData from '../components/StructuredData';
import { getMatchStatus } from '../utils/matchStatus';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/components/Card';
import Flex from '../design-system/components/Layout/Flex';
import Stack from '../design-system/components/Layout/Stack';
import { CompetitionBadge } from '../components/CompetitionBadge';
import { RelatedTeamsSection } from '../components/RelatedTeamsSection';
import { LiveMatchesTicker } from '../components/LiveMatchesTicker';
import { getAllCompetitionConfigs } from '../config/competitions';
import { generateBreadcrumbs } from '../utils/breadcrumbs';
import { FreshnessIndicator, PageUpdateTimestamp } from '../components/FreshnessIndicator';
import { getMostRecentFixtureUpdate } from '../utils/contentFreshness';

const ClubPage: React.FC = () => {
  const { slug, clubId } = useParams<{ slug?: string; clubId?: string }>();
  const teamSlug = slug ?? clubId ?? '';
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from 2 months ago to include recent results with broadcast data
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

        const data = await getFixtures({
          teamSlug: teamSlug,
          dateFrom: twoMonthsAgo.toISOString(),
          limit: 500,
          order: 'asc'
        });
        if (!ignore) {
          setFixtures(data);
          
          // Update SEO meta tags for team page once we have team data
          if (data.length > 0) {
            const firstFixture = data[0];
            const teamData = firstFixture.home.slug === teamSlug ? firstFixture.home : firstFixture.away;

            // Find next upcoming match for meta description
            const upcomingMatch = data.find(fx => {
              const status = getMatchStatus(fx.kickoff_utc).status;
              return status === 'upcoming' || status === 'upNext';
            });

            // Prepare next match info for meta
            const nextMatchInfo = upcomingMatch ? {
              opponent: formatTeamNameShort(
                upcomingMatch.home.slug === teamSlug
                  ? upcomingMatch.away.name
                  : upcomingMatch.home.name
              ),
              date: new Date(upcomingMatch.kickoff_utc).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short'
              }),
              channel: upcomingMatch.providers_uk?.[0]?.name
            } : undefined;

            const meta = generateTeamMeta(teamData, data.length, nextMatchInfo);
            updateDocumentMeta(meta);
          }
        }
      } catch (e) {
        if (!ignore) setError('Failed to load team fixtures. Please try again later.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    if (teamSlug) load();
    return () => { ignore = true; };
  }, [teamSlug]);


  const team = useMemo(() => {
    if (!fixtures.length) return undefined;
    const first = fixtures[0];
    if (!first) return undefined;

    // Check if either team matches the current slug
    if (teamMatchesSlug(first.home, teamSlug)) return first.home;
    if (teamMatchesSlug(first.away, teamSlug)) return first.away;
    return undefined;
  }, [fixtures, teamSlug]);

  // Get next match (first upcoming fixture)
  const nextMatch = useMemo(() => {
    return fixtures.find(fx => {
      const status = getMatchStatus(fx.kickoff_utc).status;
      return status === 'upcoming' || status === 'upNext';
    });
  }, [fixtures]);

  // Get competition name for the team
  const competitionName = useMemo(() => {
    if (!team?.competition_id) return undefined;
    const allCompetitions = getAllCompetitionConfigs();
    const competition = allCompetitions.find(c => c.id === team.competition_id);
    return competition?.name;
  }, [team]);

  // Get broadcaster name (prefer fixture.broadcaster, fallback to providers_uk for legacy support)
  const getBroadcasterName = (match: typeof nextMatch) => {
    if (!match) return null;
    return match.broadcaster || match.providers_uk?.[0]?.name || null;
  };

  // Generate dynamic FAQ data based on team and fixtures
  const faqData = useMemo(() => {
    if (!team) return [];

    const teamName = formatTeamNameShort(team.name);
    const opponentName = nextMatch ? formatTeamNameShort(nextMatch.home.slug === teamSlug ? nextMatch.away.name : nextMatch.home.name) : '';

    const broadcasterName = getBroadcasterName(nextMatch);

    const nextMatchAnswer = nextMatch
      ? `${teamName}'s next match is ${formatTeamNameShort(nextMatch.home.name)} vs ${formatTeamNameShort(nextMatch.away.name)} on ${new Date(nextMatch.kickoff_utc).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at ${new Date(nextMatch.kickoff_utc).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}${broadcasterName ? ` on ${broadcasterName}` : ' (TV channel TBC)'}.`
      : `${teamName} has no upcoming fixtures scheduled at this time. Check back soon for updated match schedules.`;

    const channelAnswer = broadcasterName
      ? `${teamName}'s next match is on ${broadcasterName}. You can watch it ${broadcasterName === 'Sky Sports' ? 'with a Sky Sports subscription' : broadcasterName === 'TNT Sports' ? 'with a TNT Sports subscription' : 'via their streaming service'}.`
      : `${teamName}'s next match TV channel has not been confirmed yet. Check back closer to match day for broadcast details.`;

    return [
      {
        question: `What time is ${teamName} playing today?`,
        answer: nextMatch && new Date(nextMatch.kickoff_utc).toDateString() === new Date().toDateString()
          ? `${teamName} is playing today at ${new Date(nextMatch.kickoff_utc).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} UK time against ${opponentName}${broadcasterName ? ` on ${broadcasterName}` : ''}.`
          : `${teamName} is not playing today. Their next match is ${nextMatch ? `on ${new Date(nextMatch.kickoff_utc).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}` : 'to be confirmed'}.`
      },
      {
        question: `What channel is ${teamName} on?`,
        answer: channelAnswer
      },
      {
        question: `Where can I watch ${teamName} on TV in the UK?`,
        answer: `${teamName} matches are typically broadcast on Sky Sports, TNT Sports, Amazon Prime Video, or BBC depending on the competition. Premier League matches are on Sky Sports and TNT Sports, while European competitions are mainly on TNT Sports. Check the fixtures list above for specific channel information for each match.`
      },
      {
        question: `When is ${teamName}'s next match?`,
        answer: nextMatchAnswer
      }
    ];
  }, [team, nextMatch, teamSlug]);

  // Phase 3: Slug consolidation - no more redirect logic needed

  return (
    <div className="club-page">
      {/* FAQ Structured Data */}
      <StructuredData
        type="faq"
        data={faqData}
        dateModified={new Date().toISOString()}
      />
      {/* SportsTeam Structured Data */}
      {team && (
        <StructuredData
          type="team"
          data={team}
        />
      )}
      <Header />

      <main>
        <div className="wrap">
          <Breadcrumbs items={generateBreadcrumbs(window.location.pathname, {
            teamName: team ? formatTeamNameShort(team.name) : 'Team'
          })} />

          <h1 style={{ marginTop: 0, fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            {team ? formatTeamNameShort(team.name) : 'Team'} TV Schedule - What Time Are {team ? formatTeamNameShort(team.name) : 'Team'} Playing?
          </h1>

          {/* Competition Badge - appears below H1 */}
          {team?.competition_id && (
            <CompetitionBadge competitionId={team.competition_id} />
          )}

          {/* Freshness Indicator */}
          {!loading && !error && fixtures.length > 0 && (
            <div style={{ marginTop: '12px', marginBottom: '16px' }}>
              <FreshnessIndicator
                date={getMostRecentFixtureUpdate(fixtures) || new Date()}
                variant="full"
                showBadge={true}
              />
              <PageUpdateTimestamp label="Fixtures last checked" />
            </div>
          )}

          {loading && <div className="loading">Loading fixtures…</div>}
          {error && <div className="error">{error}</div>}

          {!loading && !error && (
            <>
              {/* Next Match Callout */}
              {nextMatch && (
                <Card variant="primary" className="mb-8">
                  <CardHeader size="default">
                    <CardTitle size="sm" as="h2">
                      ⚡ Next Match
                    </CardTitle>
                    <div className="text-3xl font-bold mt-2">
                      {formatTeamNameShort(nextMatch.home.name)} vs {formatTeamNameShort(nextMatch.away.name)}
                    </div>
                  </CardHeader>

                  <CardContent size="default">
                    <Stack space="md">
                      <Flex align="center" gap="sm">
                        <span className="text-xl">📅</span>
                        <span>{new Date(nextMatch.kickoff_utc).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </Flex>

                      <Flex align="center" gap="sm">
                        <span className="text-xl">⏰</span>
                        <span>{new Date(nextMatch.kickoff_utc).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} UK Time</span>
                      </Flex>

                      {getBroadcasterName(nextMatch) && (
                        <Flex align="center" gap="sm">
                          <span className="text-xl">📺</span>
                          <span className="font-semibold">{getBroadcasterName(nextMatch)}</span>
                        </Flex>
                      )}

                      <div className="mt-2 pt-4 border-t border-white/30">
                        <div className="font-medium">
                          Kicks off in: {(() => {
                            const now = new Date().getTime();
                            const kickoff = new Date(nextMatch.kickoff_utc).getTime();
                            const diff = kickoff - now;

                            if (diff < 0) return 'Match started';

                            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                            if (days > 0) return `${days}d ${hours}h`;
                            if (hours > 0) return `${hours}h ${minutes}m`;
                            return `${minutes}m`;
                          })()}
                        </div>
                      </div>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              <Card variant="outline" className="mb-8">
                <CardHeader size="default">
                  <CardTitle size="default" as="h2">
                    📺 How to Watch {team ? formatTeamNameShort(team.name) : 'This Team'} on TV
                  </CardTitle>
                </CardHeader>

                <CardContent size="default">
                  <Stack space="md">
                    {nextMatch && getBroadcasterName(nextMatch) && (
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100">
                          🎯 Next Match: Watch on <span className="font-bold">{getBroadcasterName(nextMatch)}</span>
                        </p>
                        <p className="text-sm mt-1 text-blue-800 dark:text-blue-200">
                          {nextMatch.home.name} vs {nextMatch.away.name} • {new Date(nextMatch.kickoff_utc).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="mb-4">
                        {team ? formatTeamNameShort(team.name) : 'Premier League'} matches are broadcast live across multiple UK channels depending on the competition:
                      </p>

                      <Stack space="sm">
                        <Flex align="start" gap="sm">
                          <span className="text-lg">⚽</span>
                          <div>
                            <strong>Premier League:</strong>{' '}
                            <a href="https://www.skysports.com/football/fixtures-results" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                              Sky Sports
                            </a>
                            {' '}and{' '}
                            <a href="https://tntsports.co.uk/football" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
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
                        ℹ️ All kick-off times shown in UK time (GMT/BST) • Broadcaster confirmed fixtures are marked below
                      </p>
                    </div>
                  </Stack>
                </CardContent>
              </Card>

              {/* Live Matches Ticker - shows matches on same day as next match in same competition */}
              {nextMatch && (
                <LiveMatchesTicker
                  currentMatchDate={nextMatch.kickoff_utc}
                  competitionIds={nextMatch.competition_id ? [nextMatch.competition_id] : undefined}
                />
              )}

              <section>
                <h2 style={{ marginTop: 0 }}>Upcoming fixtures ({fixtures.length})</h2>
                {fixtures.length === 0 ? (
                  <div className="no-fixtures">No upcoming fixtures found.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {fixtures.map(fx => (
                      <FixtureCard
                        key={fx.id}
                        fixture={fx}
                        variant="default"
                        showViewButton={true}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Related Teams Section - moved below fixtures for better UX */}
              {team && (
                <RelatedTeamsSection
                  currentTeam={team}
                  competitionName={competitionName}
                />
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <a href="/" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>← Back to Schedule</a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClubPage;
