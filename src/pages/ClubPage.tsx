import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFixtures } from '../services/supabase';
import type { Fixture } from '../types';
import Header from '../components/Header';
import { generateTeamMeta, updateDocumentMeta, formatTeamNameShort } from '../utils/seo';
import { FixtureCard } from '../design-system';
import { teamMatchesSlug } from '../utils/slugUtils';
import StructuredData from '../components/StructuredData';
import { getMatchStatus } from '../utils/matchStatus';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/components/Card';
import Flex from '../design-system/components/Layout/Flex';
import Stack from '../design-system/components/Layout/Stack';

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
        const data = await getFixtures({ 
          teamSlug: teamSlug, 
          dateFrom: new Date().toISOString(),
          limit: 500, 
          order: 'asc' 
        });
        if (!ignore) {
          setFixtures(data);
          
          // Update SEO meta tags for team page once we have team data
          if (data.length > 0) {
            const firstFixture = data[0];
            const teamData = firstFixture.home.slug === teamSlug ? firstFixture.home : firstFixture.away;
            const meta = generateTeamMeta(teamData, data.length);
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

  // Generate dynamic FAQ data based on team and fixtures
  const faqData = useMemo(() => {
    if (!team) return [];

    const teamName = team.name;
    const nextMatchAnswer = nextMatch
      ? `${teamName}'s next match is ${nextMatch.home.name} vs ${nextMatch.away.name} on ${new Date(nextMatch.kickoff_utc).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at ${new Date(nextMatch.kickoff_utc).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}${nextMatch.providers_uk?.[0] ? ` on ${nextMatch.providers_uk[0].name}` : ' (TV channel TBC)'}.`
      : `${teamName} has no upcoming fixtures scheduled at this time. Check back soon for updated match schedules.`;

    const channelAnswer = nextMatch?.providers_uk?.[0]
      ? `${teamName}'s next match is on ${nextMatch.providers_uk[0].name}. You can watch it ${nextMatch.providers_uk[0].name === 'Sky Sports' ? 'with a Sky Sports subscription' : nextMatch.providers_uk[0].name === 'TNT Sports' ? 'with a TNT Sports subscription' : 'via their streaming service'}.`
      : `${teamName}'s next match TV channel has not been confirmed yet. Check back closer to match day for broadcast details.`;

    return [
      {
        question: `What time is ${teamName} playing today?`,
        answer: nextMatch && new Date(nextMatch.kickoff_utc).toDateString() === new Date().toDateString()
          ? `${teamName} is playing today at ${new Date(nextMatch.kickoff_utc).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} UK time against ${nextMatch.home.slug === teamSlug ? nextMatch.away.name : nextMatch.home.name}${nextMatch.providers_uk?.[0] ? ` on ${nextMatch.providers_uk[0].name}` : ''}.`
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
      <StructuredData type="faq" data={faqData} />
      <Header />

      <main>
        <div className="wrap">
          <h1 style={{ marginTop: 0 }}>
            {team ? formatTeamNameShort(team.name) : 'Team'} TV Schedule - What Time Are {team ? formatTeamNameShort(team.name) : 'Team'} Playing?
          </h1>
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

                      {nextMatch.providers_uk?.[0] && (
                        <Flex align="center" gap="sm">
                          <span className="text-xl">📺</span>
                          <span className="font-semibold">{nextMatch.providers_uk[0].name}</span>
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

              <section className="card" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: 'var(--spacing-xl)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ marginTop: 0 }}>How to watch {team ? formatTeamNameShort(team.name) : 'this team'}</h2>
                <p>
                  In the UK, live football TV coverage is typically carried by
                  <a href="https://www.skysports.com/football/fixtures-results" target="_blank" rel="noreferrer" style={{ marginLeft: 6 }}>Sky Sports</a>
                  {' '}and
                  <a href="https://tntsports.co.uk/football" target="_blank" rel="noreferrer" style={{ marginLeft: 6 }}>TNT Sports</a> across different competitions.
                  Listings can change; always check the official broadcaster schedule.
                </p>
                <ul>
                  <li>When a broadcaster is confirmed, it appears on each fixture below.</li>
                  <li>Kick-off times are shown in local UK time (Europe/London).</li>
                </ul>
              </section>

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
