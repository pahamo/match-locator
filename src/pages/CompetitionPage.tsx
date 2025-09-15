import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSimpleFixtures, getSimpleCompetitions } from '../services/supabase-simple';
import { getTeams } from '../services/supabase';
import type { SimpleFixture, Competition, Team } from '../types';
import Header from '../components/Header';
import StructuredData from '../components/StructuredData';
import { FixtureCardSkeleton } from '../components/SkeletonLoader';
import FixtureCard from '../design-system/components/FixtureCard';
import { getCompetitionLogo } from '../config/competitions';

const CompetitionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

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

      // Load fixtures and teams for this competition
      const [fixturesData, teamsData] = await Promise.all([
        getSimpleFixtures(currentCompetition.id),
        getTeams()
      ]);

      setFixtures(fixturesData);

      // Filter teams for this competition
      const competitionTeams = teamsData.filter(team =>
        team.competition_id === currentCompetition.id
      );
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


  const getUpcomingFixtures = (fixtures: SimpleFixture[], limit = 5) => {
    const now = new Date();
    return fixtures
      .filter(f => new Date(f.kickoff_utc) >= now)
      .slice(0, limit);
  };

  const getRecentResults = (fixtures: SimpleFixture[], limit = 5) => {
    const now = new Date();
    return fixtures
      .filter(f => new Date(f.kickoff_utc) < now)
      .slice(-limit)
      .reverse();
  };


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

  const upcomingFixtures = getUpcomingFixtures(fixtures);
  const recentResults = getRecentResults(fixtures);

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
          <nav style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            <a href="/competitions" style={{ color: '#6366f1', textDecoration: 'none' }}>
              Competitions
            </a>
            {' > '}
            <span>{competition.name}</span>
          </nav>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {getCompetitionLogo(competition.slug) && (
              <img
                src={getCompetitionLogo(competition.slug)!}
                alt={`${competition.name} logo`}
                style={{
                  height: '60px',
                  width: 'auto',
                  maxWidth: '120px',
                  objectFit: 'contain'
                }}
              />
            )}
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              margin: 0,
              textAlign: 'center'
            }}>
              {competition.name}
            </h1>
          </div>
          {competition.short_name && (
            <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '1rem' }}>
              {competition.short_name}
            </p>
          )}
        </div>


        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Fixtures Section */}
          <div>
            {/* Upcoming Fixtures */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Upcoming Fixtures
              </h2>
              {upcomingFixtures.length > 0 ? (
                <div>
                  {upcomingFixtures.map((fixture) => (
                    <FixtureCard
                      key={fixture.id}
                      fixture={fixture}
                      variant="compact"
                      showMatchweek={true}
                    />
                  ))}
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <a
                      href="/fixtures"
                      style={{
                        color: '#6366f1',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      View All Fixtures →
                    </a>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>No upcoming fixtures scheduled.</p>
              )}
            </section>

            {/* Recent Results */}
            <section>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Recent Results
              </h2>
              {recentResults.length > 0 ? (
                <div>
                  {recentResults.map((fixture) => (
                    <FixtureCard
                      key={fixture.id}
                      fixture={fixture}
                      variant="compact"
                      showMatchweek={true}
                    />
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>No recent results available.</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div>
            {/* Teams in Competition */}
            <section style={{
              padding: '1.5rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                Teams ({teams.length})
              </h3>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {teams.slice(0, 10).map((team) => (
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
                      fontSize: '0.875rem'
                    }}
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
                {teams.length > 10 && (
                  <a
                    href="/clubs"
                    style={{
                      padding: '0.5rem',
                      textAlign: 'center',
                      color: '#6366f1',
                      textDecoration: 'none',
                      fontSize: '0.875rem'
                    }}
                  >
                    View All Teams →
                  </a>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionPage;