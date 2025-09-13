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

  // EPL teams (all teams are Premier League)
  const eplTeams = teams;
  
  // UCL teams (Champions League participating teams from EPL)
  const uclTeamNames = [
    'Manchester City',
    'Arsenal', 
    'Liverpool',
    'Aston Villa'
  ];
  
  // Filter EPL teams that are also in UCL
  const uclEplTeams = teams.filter(team => 
    uclTeamNames.some(uclTeam => team.name.includes(uclTeam))
  );

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
            <h1 style={{ marginTop: 32, marginBottom: 32 }}>Football Clubs</h1>
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
            <h1 style={{ marginTop: 32, marginBottom: 32 }}>Football Clubs</h1>
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
          <h1 style={{ marginTop: 32, marginBottom: 32 }}>Football Clubs</h1>
          
          {/* Premier League Section */}
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#1f2937',
              borderBottom: '2px solid #6366f1',
              paddingBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚽ Premier League
            </h2>
            
            <div style={{
              background: '#f8fafc',
              padding: '12px 16px',
              margin: '0 0 16px 0',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              {eplTeams.length} Premier League clubs
            </div>
            
            <div 
              className="clubs-grid-compact"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
                gap: '12px', 
                marginTop: '16px' 
              }}
            >
              {eplTeams.map(team => (
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
          </section>

          {/* Champions League Section */}
          <section>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#1f2937',
              borderBottom: '2px solid #0ea5e9',
              paddingBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🏆 UEFA Champions League
            </h2>
            
            <div style={{
              background: '#e0f2fe',
              padding: '12px 16px',
              margin: '0 0 16px 0',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#0369a1',
              fontWeight: '500'
            }}>
              {uclEplTeams.length} EPL clubs qualified for Champions League
            </div>
            
            <div 
              className="clubs-grid-compact"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
                gap: '12px', 
                marginTop: '16px' 
              }}
            >
              {uclEplTeams.map(team => (
              <Link
                key={`ucl-${team.id}`}
                to={`/clubs/${team.slug}`}
                className="club-card-compact"
                style={{
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)',
                  border: '1px solid #0ea5e9',
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
                  justifyContent: 'center',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0369a1';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* UCL Badge */}
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: '#0ea5e9',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px'
                }}>
                  ⭐
                </div>

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
          </section>
        </div>
      </main>

    </div>
  );
};

export default ClubsPage;