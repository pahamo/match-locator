import React, { useState, useEffect } from 'react';
import { getTeams } from '../services/supabase';
import type { Team } from '../types';
import Header from '../components/Header';
import { generateClubsMeta, updateDocumentMeta } from '../utils/seo';

const ClubsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const teamsData = await getTeams();
      setTeams(teamsData);
      
      // Update SEO meta tags for clubs page
      const meta = generateClubsMeta();
      updateDocumentMeta(meta);
    } catch (err) {
      console.error('Failed to load teams:', err);
      setError('Failed to load teams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="clubs-page">
        <Header 
          title="Premier League Clubs"
          subtitle="All 20 clubs in the Premier League"
        />
        <main>
          <div className="wrap">
            <div className="loading">Loading teams...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clubs-page">
        <Header 
          title="Premier League Clubs"
          subtitle="All 20 clubs in the Premier League"
        />
        <main>
          <div className="wrap">
            <div className="error">{error}</div>
            <button onClick={loadTeams}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="clubs-page">
      <Header 
        title="Premier League Clubs"
        subtitle={`All ${teams.length} clubs in the Premier League`}
      />
      
      <main>
        <div className="wrap">
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px', 
              marginTop: '24px' 
            }}
          >
            {teams.map(team => (
              <div 
                key={team.id} 
                style={{ 
                  background: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  textAlign: 'center' as const, 
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#6366f1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div 
                  style={{ 
                    marginBottom: '16px', 
                    height: '80px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  {team.crest ? (
                    <img 
                      src={team.crest} 
                      alt={`${team.name} crest`}
                      style={{ 
                        maxHeight: '80px', 
                        maxWidth: '80px', 
                        objectFit: 'contain' 
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        background: '#f3f4f6', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold', 
                        fontSize: '18px', 
                        color: '#6b7280' 
                      }}
                    >
                      {team.name.split(' ').map((word: string) => word[0]).join('').slice(0, 3)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 
                    style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#1f2937' 
                    }}
                  >
                    {team.name}
                  </h3>
                  <a 
                    href={`/clubs/${team.slug}`} 
                    style={{ 
                      color: '#6366f1', 
                      textDecoration: 'underline', 
                      fontSize: '0.9rem',
                      display: 'inline-block',
                      marginTop: '8px'
                    }}
                  >
                    View Fixtures →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

    </div>
  );
};

export default ClubsPage;