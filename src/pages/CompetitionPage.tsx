import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSimpleFixtures, getSimpleCompetitions } from '../services/supabase-simple';
import { getTeams } from '../services/supabase';
import type { SimpleFixture, Competition, Team } from '../types';
import Header from '../components/Header';
import StructuredData from '../components/StructuredData';
import { FixtureCardSkeleton } from '../components/SkeletonLoader';
import FixtureCard from '../design-system/components/FixtureCard';
import { generateMatchUrl } from '../utils/seo';

const CompetitionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [fixtures, setFixtures] = useState<SimpleFixture[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompetitionData();
  }, [slug]);

  const loadCompetitionData = async () => {
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
  };

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

  const getCompetitionStats = () => {
    const totalFixtures = fixtures.length;
    const confirmedBroadcasts = fixtures.filter(f => f.providerId && f.providerId !== 999).length;
    const blackouts = fixtures.filter(f => f.isBlackout).length;
    const pendingBroadcasts = totalFixtures - confirmedBroadcasts - blackouts;

    return { totalFixtures, confirmedBroadcasts, blackouts, pendingBroadcasts };
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
  const stats = getCompetitionStats();

  return (
    <div>
      <StructuredData
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

          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {competition.name}
          </h1>
          {competition.short_name && (
            <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '1rem' }}>
              {competition.short_name}
            </p>
          )}
        </div>

        {/* Competition Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>
              {stats.totalFixtures}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Fixtures</div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
              {stats.confirmedBroadcasts}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Confirmed Broadcasts</div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
              {stats.blackouts}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Blackout Games</div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706' }}>
              {stats.pendingBroadcasts}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending TV Assignments</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '2rem',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
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