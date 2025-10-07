import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSimpleFixtures, getSimpleCompetitions } from '../services/supabase-simple';
import { getTeams } from '../services/supabase';
import type { SimpleFixture, Competition, Team } from '../types';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import StructuredData from '../components/StructuredData';
import { FixtureCardSkeleton } from '../components/SkeletonLoader';
import { getCompetitionLogo, getCompetitionConfig } from '../config/competitions';
import { generateCompetitionMeta, updateDocumentMeta } from '../utils/seo';
import { generateBreadcrumbs } from '../utils/breadcrumbs';
import LeagueStandings from '../components/LeagueStandings';
import MatchdaySection from '../components/MatchdaySection';
import { useIsMobile } from '../hooks/useMediaQuery';

const CompetitionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [fixtures, setFixtures] = useState<SimpleFixture[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompetitionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load competitions to find the one matching this slug
      const competitions = await getSimpleCompetitions(false);
      const currentCompetition = competitions.find(c => c.slug === slug);

      if (!currentCompetition) {
        navigate('/competitions'); // Redirect to competitions page if not found
        return;
      }

      setCompetition(currentCompetition);

      // Update SEO meta tags for this competition
      if (slug) {
        const meta = generateCompetitionMeta(slug);
        updateDocumentMeta(meta);
      }

      // Load fixtures and full teams list
      const [fixturesData, allTeams] = await Promise.all([
        getSimpleFixtures(currentCompetition.id),
        getTeams()
      ]);

      setFixtures(fixturesData);

      // Extract unique team IDs from fixtures
      const teamIdsInFixtures = new Set<number>();
      fixturesData.forEach((fixture: any) => {
        if (fixture.home_team_id) teamIdsInFixtures.add(fixture.home_team_id);
        if (fixture.away_team_id) teamIdsInFixtures.add(fixture.away_team_id);
      });

      // Get full team objects for teams that have fixtures in this competition
      const competitionTeams = allTeams
        .filter(team => teamIdsInFixtures.has(team.id))
        .sort((a, b) => a.name.localeCompare(b.name));

      setTeams(competitionTeams);

    } catch (err) {
      console.error('Failed to load competition data:', err);
      setError('Failed to load competition data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    loadCompetitionData();
  }, [loadCompetitionData]);

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <FixtureCardSkeleton />
          <FixtureCardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div>
        <Header />
        <div style={{ padding: '20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <h1>Competition Not Found</h1>
          <p style={{ color: '#dc2626' }}>{error || 'The requested competition could not be found.'}</p>
          <button
            onClick={() => navigate('/competitions')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            View All Competitions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StructuredData
        type="competition"
        data={{
          "@context": "https://schema.org",
          "@type": "SportsOrganization",
          "name": competition.name,
          "sport": "Football",
          "url": `https://matchlocator.com/competitions/${competition.slug}`,
          "description": `${competition.name} fixtures, results, and TV schedule information.`
        }}
      />
      <Header />

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Competition Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Breadcrumbs items={generateBreadcrumbs(window.location.pathname, {
            competitionName: competition.name
          })} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '12px' : '20px',
            marginBottom: '0.5rem',
            flexWrap: 'nowrap'
          }}>
            {getCompetitionLogo(competition.slug) && (
              <img
                src={getCompetitionLogo(competition.slug)!}
                alt={`${competition.name} logo`}
                style={{
                  height: isMobile ? '40px' : '60px',
                  width: 'auto',
                  maxWidth: isMobile ? '60px' : '120px',
                  objectFit: 'contain',
                  flexShrink: 0
                }}
              />
            )}
            <h1 style={{
              fontSize: isMobile ? '1.5rem' : '2.5rem',
              fontWeight: 'bold',
              margin: 0,
              textAlign: isMobile ? 'left' : 'center',
              lineHeight: 1.2
            }}>
              {competition.name}
            </h1>
          </div>

          {/* Page Overview */}
          <p style={{
            fontSize: '1rem',
            color: '#4b5563',
            lineHeight: '1.6',
            maxWidth: '800px',
            margin: '1rem auto',
            textAlign: 'center'
          }}>
            View the latest {competition.name} fixtures, results, and league table. Check kick-off times,
            TV broadcast information, and where to watch every match live in the UK. Stay up to date with
            the current standings and upcoming matches.
          </p>
        </div>

        {/* Jump-to Navigation (Mobile Only) */}
        {isMobile && (
          <nav
            aria-label="Page sections"
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '1.5rem',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <a
              href="#fixtures"
              style={{
                padding: '8px 16px',
                backgroundColor: '#6366f1',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              📅 Fixtures
            </a>
            <a
              href="#standings"
              style={{
                padding: '8px 16px',
                backgroundColor: '#6366f1',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              📊 {slug && getCompetitionConfig(slug)?.seasonId ? 'Table' : 'Teams'}
            </a>
          </nav>
        )}

        {/* 2-Column Layout: Fixtures + Standings */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem'
        }} className="competition-content-grid">
          {/* Left Column: Matchday Section */}
          <div id="fixtures" style={{ scrollMarginTop: '80px' }}>
            <MatchdaySection
              fixtures={fixtures}
              competitionName={competition.name}
            />
          </div>

          {/* Right Column: Standings or Teams List */}
          <div id="standings" style={{ scrollMarginTop: '80px' }}>
            {slug && getCompetitionConfig(slug)?.seasonId ? (
              <LeagueStandings
                seasonId={getCompetitionConfig(slug)!.seasonId!}
                competitionName={competition.name}
                compact={true}
              />
            ) : (
            <section style={{
              padding: '1.5rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {competition.name} Teams
              </h3>

              {/* SEO-optimized description */}
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '1rem',
                lineHeight: '1.5'
              }}>
                Browse all {teams.length} teams competing in {competition.name}. Click any team to view their complete fixture schedule, TV broadcast information, and upcoming matches.
              </p>

              <div style={{
                display: 'grid',
                gap: '0.5rem',
                maxHeight: '500px',
                overflowY: 'auto',
                paddingRight: '0.5rem'
              }}>
                {teams.map((team) => (
                  <a
                    key={team.id}
                    href={`/clubs/${team.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      color: 'inherit',
                      fontSize: '0.875rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    {team.crest && (
                      <img
                        src={team.crest}
                        alt={`${team.name} crest`}
                        style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                        loading="lazy"
                      />
                    )}
                    <span>{team.name}</span>
                  </a>
                ))}
              </div>

              {teams.length === 0 && (
                <p style={{
                  textAlign: 'center',
                  color: '#9ca3af',
                  padding: '2rem 0',
                  fontSize: '0.875rem'
                }}>
                  No teams available for this competition yet.
                </p>
              )}

              {teams.length > 0 && (
                <a
                  href="/clubs"
                  style={{
                    display: 'block',
                    marginTop: '1rem',
                    padding: '0.5rem',
                    textAlign: 'center',
                    color: '#6366f1',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  View All Teams →
                </a>
              )}
            </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionPage;