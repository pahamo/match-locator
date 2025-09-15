import React, { useState, useEffect } from 'react';
import { getTeams } from '../services/supabase';
import type { Team } from '../types';
import Header from '../components/Header';
import { ClubCard } from '../design-system';
import { generateClubsMeta, updateDocumentMeta } from '../utils/seo';

const ClubsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Filter teams by competition using competition_id
  const eplTeams = teams.filter(team => team.competition_id === 1);

  // English teams that are in Champions League (both dedicated UCL teams and EPL teams in UCL)
  const englishTeamsInUCL = [
    'Arsenal', 'Aston Villa', 'Liverpool', 'Manchester City'
  ];

  const uclTeams = teams.filter(team => {
    // Include teams marked as UCL (competition_id === 2) OR English teams that qualified for UCL
    return team.competition_id === 2 || englishTeamsInUCL.includes(team.name);
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const getCompetitionLogo = (competition: string): string | null => {
    const logos: Record<string, string> = {
      'premier-league': 'https://cdn.brandfetch.io/id3ei9Uwhu/theme/dark/id4u-3dVa7.svg?c=1bxid64Mup7aczewSAYMX&t=1737356816110',
      'champions-league': 'https://upload.wikimedia.org/wikipedia/en/f/f5/UEFA_Champions_League.svg'
    };
    return logos[competition] || null;
  };

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
            <h1 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '700' }}>Football Clubs</h1>
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
            <h1 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '700' }}>Football Clubs</h1>
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
          <h1 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '700' }}>Football Clubs</h1>
          
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
              gap: '12px'
            }}>
              {getCompetitionLogo('premier-league') ? (
                <img
                  src={getCompetitionLogo('premier-league')!}
                  alt="Premier League logo"
                  style={{
                    height: '32px',
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                '⚽'
              )}
              Premier League
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
              {eplTeams.length} of 20 Premier League clubs
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
                <ClubCard 
                  key={team.id}
                  team={team}
                  variant="compact"
                />
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
              gap: '12px'
            }}>
              <img
                src="https://upload.wikimedia.org/wikipedia/en/f/f5/UEFA_Champions_League.svg"
                alt="UEFA Champions League"
                style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
              />
              UEFA Champions League
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
              {uclTeams.length} of 36 Champions League clubs tracked
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
              {uclTeams.map(team => (
                <ClubCard 
                  key={`ucl-${team.id}`}
                  team={team}
                  variant="ucl"
                  showBadge={true}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

    </div>
  );
};

export default ClubsPage;