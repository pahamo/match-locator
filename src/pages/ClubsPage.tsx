import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeams } from '../services/supabase';
import type { Team } from '../types';
import Header from '../components/Header';
import { generateClubsMeta, updateDocumentMeta } from '../utils/seo';
import { getDisplayTeamName } from '../utils/teamNames';

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
        <Header />
        <main>
          <div className="wrap">
            <h1 style={{ marginTop: 0 }}>Premier League Clubs</h1>
            <div className="loading">Loading teams...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clubs-page">
        <Header />
        <main>
          <div className="wrap">
            <h1 style={{ marginTop: 0 }}>Premier League Clubs</h1>
            <div className="error">{error}</div>
            <button onClick={loadTeams}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="clubs-page">
      <Header />
      
      <main>
        <div className="wrap">
          <h1 style={{ marginTop: 0, marginBottom: '16px' }}>Premier League Clubs</h1>
          
          {/* Compact Header */}
          <div style={{
            background: '#f8fafc',
            padding: '12px 16px',
            margin: '0 0 16px 0',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            {teams.length} Premier League clubs
          </div>
          
          {/* Compact Grid */}
          <div 
            className="clubs-grid-compact"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
              gap: '12px', 
              marginTop: '16px' 
            }}
          >
            {teams.map(team => (
              <Link
                key={team.id}
                to={`/clubs/${team.slug}`}
                className="club-card-compact"
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px 12px',
                  textAlign: 'center' as const,
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '120px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Compact Crest */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}>
                  {team.crest ? (
                    <img 
                      src={team.crest} 
                      alt={`${team.name} crest`}
                      style={{ 
                        maxHeight: '40px', 
                        maxWidth: '40px', 
                        objectFit: 'contain' 
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: '#f3f4f6', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold', 
                        fontSize: '14px', 
                        color: '#6b7280' 
                      }}
                    >
                      {team.name.split(' ').map((word: string) => word[0]).join('').slice(0, 3)}
                    </div>
                  )}
                </div>
                
                {/* Team Name - Responsive */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div 
                    className="team-name-full"
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      lineHeight: '1.3',
                      display: 'block'
                    }}
                  >
                    {team.name}
                  </div>
                  <div 
                    className="team-name-short"
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#1f2937',
                      display: 'none'
                    }}
                  >
                    {getDisplayTeamName(team.name, true)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

    </div>
  );
};

export default ClubsPage;