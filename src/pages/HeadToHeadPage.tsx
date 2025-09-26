import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import H2HStatsCard from '../components/H2HStatsCard';
import NextFixtureHero from '../components/NextFixtureHero';
import { FixtureCard } from '../design-system';
import {
  getHeadToHeadFixtures,
  getNextHeadToHeadFixture,
  getTeamBySlugIntelligent
} from '../services/supabase';
import { updateDocumentMeta } from '../utils/seo';
import { generateBreadcrumbs } from '../utils/breadcrumbs';
import {
  parseH2HSlug,
  needsCanonicalRedirect,
  generateH2HMeta,
  cleanTeamNameForDisplay,
  calculateH2HStats
} from '../utils/headToHead';
import { normalizeTeamSlug, mapSeoSlugToDbSlugEnhanced } from '../utils/teamSlugs';
import { isSupportedTeam } from '../utils/teamSlugs';
import { generateMatchPreview, isPremierLeagueFixture } from '../utils/matchPreview';
import type { Fixture, Team } from '../types';

const HeadToHeadPage: React.FC = () => {
  const { matchSlug, contentSlug } = useParams<{ matchSlug?: string; contentSlug?: string }>();

  // Use contentSlug if available (from /content/ route), otherwise use matchSlug (from /fixtures/ route)
  const slug = contentSlug || matchSlug;
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [nextFixture, setNextFixture] = useState<Fixture | null>(null);
  const [team1, setTeam1] = useState<Team | null>(null);
  const [team2, setTeam2] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);

  // Parse team slugs from URL
  const parsedTeams = slug ? parseH2HSlug(slug) : null;

  useEffect(() => {
    // Check if we need to redirect to canonical URL
    const canonicalSlug = slug ? needsCanonicalRedirect(slug) : null;
    if (canonicalSlug) {
      setShouldRedirect(canonicalSlug);
      return;
    }

    if (!parsedTeams) {
      setError('Invalid team matchup URL');
      setLoading(false);
      return;
    }

    // Validate this is a supported H2H matchup (Premier League or Champions League)
    if (!slug) {
      setError('Invalid H2H URL format');
      setLoading(false);
      return;
    }

    const parts = slug.split('-vs-');
    if (parts.length !== 2 || !isSupportedTeam(parts[0]) || !isSupportedTeam(parts[1])) {
      setError('H2H pages are currently available for Premier League and Champions League teams only');
      setLoading(false);
      return;
    }

    loadH2HData();
  }, [slug]);

  // Handle redirect after hooks
  if (shouldRedirect) {
    // Redirect to h2h path (new primary location for H2H pages)
    return <Navigate to={`/h2h/${shouldRedirect}`} replace />;
  }

  const loadH2HData = async () => {
    if (!parsedTeams) return;

    try {
      setLoading(true);
      setError(null);

      // Normalize team slugs to handle variations (SEO-friendly)
      const seoTeam1Slug = normalizeTeamSlug(parsedTeams.team1Slug);
      const seoTeam2Slug = normalizeTeamSlug(parsedTeams.team2Slug);

      // Map SEO slugs to database slugs (enhanced mapping for Premier League and Champions League)
      const dbTeam1Slug = mapSeoSlugToDbSlugEnhanced(seoTeam1Slug);
      const dbTeam2Slug = mapSeoSlugToDbSlugEnhanced(seoTeam2Slug);

      console.log(`Loading H2H data for ${seoTeam1Slug} vs ${seoTeam2Slug}`);
      console.log(`Database lookup: ${dbTeam1Slug} vs ${dbTeam2Slug}`);

      // Load teams first to get their actual slugs
      const [team1Data, team2Data] = await Promise.all([
        getTeamBySlugIntelligent(dbTeam1Slug),
        getTeamBySlugIntelligent(dbTeam2Slug)
      ]);

      // Validate teams exist before proceeding
      if (!team1Data || !team2Data) {
        const missingTeam = !team1Data ? seoTeam1Slug : seoTeam2Slug;
        setError(`Team not found: ${cleanTeamNameForDisplay(missingTeam)}`);
        setLoading(false);
        return;
      }

      // Now load fixtures using the actual team slugs found in the database
      const [fixturesData, nextFixtureData] = await Promise.all([
        getHeadToHeadFixtures(team1Data.slug, team2Data.slug),
        getNextHeadToHeadFixture(team1Data.slug, team2Data.slug)
      ]);

      setTeam1(team1Data);
      setTeam2(team2Data);
      setFixtures(fixturesData);
      setNextFixture(nextFixtureData);

      // Update SEO meta tags with enhanced information
      const upcomingCount = fixturesData.filter(f => new Date(f.kickoff_utc) > new Date()).length;
      const completedCount = fixturesData.filter(f => new Date(f.kickoff_utc) <= new Date()).length;

      const meta = generateH2HMeta(team1Data.name, team2Data.name, fixturesData.length);

      // Enhanced meta description with more context
      const enhancedDescription = nextFixtureData
        ? `${meta.description} Next match: ${new Date(nextFixtureData.kickoff_utc).toLocaleDateString()}. ${upcomingCount} upcoming fixtures, ${completedCount} completed meetings.`
        : `${meta.description} ${upcomingCount} upcoming fixtures, ${completedCount} completed meetings this season.`;

      updateDocumentMeta({
        ...meta,
        description: enhancedDescription
      });

      console.log(`Loaded ${fixturesData.length} fixtures between ${team1Data.name} and ${team2Data.name}`);

    } catch (err) {
      console.error('Failed to load H2H data:', err);
      setError('Failed to load team data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h2h-page">
        <Header />
        <Breadcrumbs items={generateBreadcrumbs(window.location.pathname)} />

        <main>
          <div className="wrap">
            <div style={{
              textAlign: 'center',
              padding: '64px 20px',
              color: '#64748b'
            }}>
              <h1>Loading team data...</h1>
              <p>Please wait while we fetch the head-to-head information.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !team1 || !team2) {
    return (
      <div className="h2h-page">
        <Header />
        <Breadcrumbs items={generateBreadcrumbs(window.location.pathname)} />

        <main>
          <div className="wrap">
            <div style={{
              textAlign: 'center',
              padding: '64px 20px'
            }}>
              <h1 style={{
                color: '#dc2626',
                marginBottom: '16px'
              }}>
                {error || 'Teams not found'}
              </h1>
              <p style={{
                color: '#64748b',
                marginBottom: '24px'
              }}>
                We couldn't find the requested team matchup. Please check the URL and try again.
              </p>
              <a
                href="/fixtures"
                style={{
                  display: 'inline-block',
                  background: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                Browse All Fixtures
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate H2H statistics
  const h2hStats = calculateH2HStats(fixtures, team1.name, team2.name);

  // Separate upcoming and completed fixtures
  const now = new Date();
  const upcomingFixtures = fixtures.filter(f => new Date(f.kickoff_utc) > now);
  const completedFixtures = fixtures.filter(f => new Date(f.kickoff_utc) <= now);

  return (
    <div className="h2h-page">
      <Header />

      <main>
        <div className="wrap">
          <Breadcrumbs items={generateBreadcrumbs(window.location.pathname, {
            matchTitle: `${team1.name} vs ${team2.name}`
          })} />
          {/* Page Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px',
            paddingTop: '16px'
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '8px'
            }}>
              <a
                href={`/clubs/${team1.slug}`}
                style={{
                  color: 'inherit',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                {team1.name}
              </a>
              {' vs '}
              <a
                href={`/clubs/${team2.slug}`}
                style={{
                  color: 'inherit',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                {team2.name}
              </a>
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#64748b',
              margin: 0
            }}>
              Head-to-Head Fixtures & Statistics
            </p>
          </div>

          {/* Next Fixture Hero */}
          {nextFixture && (
            <NextFixtureHero
              fixture={nextFixture}
              team1Name={team1.name}
              team2Name={team2.name}
            />
          )}

          {/* Match Preview for Premier League fixtures */}
          {nextFixture && isPremierLeagueFixture(team1.name, team2.name) && (
            <div style={{
              marginBottom: '32px',
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '2px solid #e2e8f0'
              }}>
                Match Preview
              </h2>
              <div style={{
                fontSize: '1rem',
                lineHeight: '1.7',
                color: '#374151'
              }}>
                {generateMatchPreview(team1.name, team2.name, nextFixture || undefined)}
              </div>
            </div>
          )}

          {/* H2H Statistics */}
          {fixtures.length > 0 && (
            <H2HStatsCard
              team1Name={team1.name}
              team2Name={team2.name}
              stats={h2hStats}
            />
          )}

          {/* Upcoming Fixtures */}
          {upcomingFixtures.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '2px solid #e2e8f0'
              }}>
                Upcoming Fixtures ({upcomingFixtures.length})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcomingFixtures.map(fixture => (
                  <FixtureCard
                    key={fixture.id}
                    fixture={fixture}
                    variant="compact"
                    showMatchweek={true}
                    showViewButton={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Fixtures */}
          {completedFixtures.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '2px solid #e2e8f0'
              }}>
                Recent Results ({completedFixtures.length})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {completedFixtures.map(fixture => (
                  <FixtureCard
                    key={fixture.id}
                    fixture={fixture}
                    variant="compact"
                    showMatchweek={true}
                    showViewButton={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Fixtures Message */}
          {fixtures.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px'
              }}>
                No Fixtures Found
              </h3>
              <p style={{
                color: '#64748b',
                marginBottom: '24px'
              }}>
                There are no scheduled fixtures between {team1.name} and {team2.name} this season.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={`/clubs/${team1.slug}`}
                  style={{
                    display: 'inline-block',
                    background: '#3b82f6',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  View {team1.name} Fixtures
                </a>
                <a
                  href={`/clubs/${team2.slug}`}
                  style={{
                    display: 'inline-block',
                    background: '#3b82f6',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  View {team2.name} Fixtures
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HeadToHeadPage;