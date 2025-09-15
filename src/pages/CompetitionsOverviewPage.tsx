import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSimpleCompetitions } from '../services/supabase-simple';
import type { Competition } from '../types';
import Header from '../components/Header';
import { FixtureCardSkeleton } from '../components/SkeletonLoader';

const CompetitionsOverviewPage: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Only load production-visible competitions
      const competitionsData = await getSimpleCompetitions(false);
      setCompetitions(competitionsData);
    } catch (err) {
      console.error('Failed to load competitions:', err);
      setError('Failed to load competitions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getCompetitionLogo = (slug: string): string | null => {
    const logos: Record<string, string> = {
      'premier-league': 'https://cdn.brandfetch.io/id3ei9Uwhu/theme/dark/id4u-3dVa7.svg?c=1bxid64Mup7aczewSAYMX&t=1737356816110',
      'champions-league': 'https://upload.wikimedia.org/wikipedia/en/f/f5/UEFA_Champions_League.svg'
    };
    return logos[slug] || null;
  };

  const getCompetitionIcon = (slug: string): string => {
    const icons: Record<string, string> = {
      'premier-league': '⚽',
      'champions-league': '🏆',
      'europa-league': '🌟',
      'fa-cup': '🏅',
      'league-cup': '🥇'
    };
    return icons[slug] || '🏁';
  };

  const getCompetitionDescription = (slug: string): string => {
    const descriptions: Record<string, string> = {
      'premier-league': 'The top flight of English football with 20 teams competing for the title.',
      'champions-league': 'Europe\'s premier club competition featuring the best teams from across the continent.',
      'europa-league': 'UEFA\'s second-tier European competition for clubs.',
      'fa-cup': 'England\'s oldest football competition, open to all eligible clubs.',
      'league-cup': 'English football\'s secondary cup competition.'
    };
    return descriptions[slug] || 'Football competition details.';
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <h1>Competitions</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <FixtureCardSkeleton />
            <FixtureCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Competitions</h1>
          <p style={{ color: '#dc2626' }}>{error}</p>
          <button
            onClick={loadCompetitions}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1rem' }}>Football Competitions</h1>
        <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
          Follow fixtures, results, and TV schedules across all major football competitions.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {competitions.map((competition) => (
            <Link
              key={competition.id}
              to={`/competitions/${competition.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                marginBottom: '10px',
                textAlign: 'center',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getCompetitionLogo(competition.slug) ? (
                  <img
                    src={getCompetitionLogo(competition.slug)!}
                    alt={`${competition.name} logo`}
                    style={{
                      height: '50px',
                      width: 'auto',
                      maxWidth: '100px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      // Fallback to emoji icon if logo fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.style.fontSize = '2rem';
                      fallback.textContent = getCompetitionIcon(competition.slug);
                      e.currentTarget.parentNode?.appendChild(fallback);
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '2rem' }}>
                    {getCompetitionIcon(competition.slug)}
                  </div>
                )}
              </div>

              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '8px',
                textAlign: 'center',
                color: '#111827'
              }}>
                {competition.name}
                {competition.short_name && (
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    fontWeight: '400',
                    display: 'block',
                    marginTop: '4px'
                  }}>
                    {competition.short_name}
                  </span>
                )}
              </h2>

              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                lineHeight: '1.5',
                flex: 1,
                textAlign: 'center'
              }}>
                {getCompetitionDescription(competition.slug)}
              </p>

              <div style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#6366f1',
                textAlign: 'center'
              }}>
                View Fixtures & TV Schedule →
              </div>
            </div>
            </Link>
          ))}
        </div>

        {competitions.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
          }}>
            <p>No competitions available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionsOverviewPage;