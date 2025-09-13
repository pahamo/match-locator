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

  // EPL teams (all 20 Premier League teams)
  const eplTeams = teams;
  
  // ALL UCL teams (complete Champions League participants)
  const uclTeamNames = [
    // English teams
    'Manchester City',
    'Arsenal', 
    'Liverpool',
    'Aston Villa',
    // Spanish teams
    'Real Madrid',
    'Barcelona',
    'Atletico Madrid',
    'Athletic Bilbao',
    // German teams  
    'Bayern Munich',
    'Borussia Dortmund',
    'RB Leipzig',
    'Bayer Leverkusen',
    // Italian teams
    'Inter Milan',
    'AC Milan',
    'Juventus',
    'Atalanta',
    // French teams
    'Paris Saint-Germain',
    'AS Monaco',
    'Lille',
    'Brest',
    // Portuguese teams
    'Sporting CP',
    'Benfica',
    // Dutch teams
    'PSV Eindhoven',
    'Feyenoord',
    // Other major teams
    'Celtic',
    'Club Brugge',
    'Shakhtar Donetsk',
    'Red Star Belgrade',
    'Young Boys',
    'Sparta Prague',
    'Salzburg',
    'Stuttgart',
    'Sturm Graz',
    'Slovan Bratislava',
    'Girona'
  ];
  
  // Create UCL teams - mix of existing EPL teams and placeholder teams for non-EPL
  const uclTeams = uclTeamNames.map(teamName => {
    // Check if this team exists in our EPL data
    const existingTeam = teams.find(team => team.name.includes(teamName.split(' ')[0]));
    
    if (existingTeam) {
      return existingTeam;
    } else {
      // Create placeholder team for non-EPL UCL teams
      return {
        id: Math.random(), // Temporary ID for non-EPL teams
        name: teamName,
        slug: teamName.toLowerCase().replace(/\s+/g, '-'),
        crest: null
      };
    }
  });

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
              {uclTeams.length} clubs in Champions League
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