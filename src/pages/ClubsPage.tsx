import React, { useState, useEffect } from 'react';
import { getTeams } from '../services/supabase';
import type { Team } from '../types';
import { usePublicCompetitions } from '../hooks/useCompetitions';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import { ClubCard } from '../design-system';
import { generateClubsMeta, updateDocumentMeta } from '../utils/seo';
import { getCompetitionLogo, getCompetitionIcon } from '../config/competitions';
import { generateBreadcrumbs } from '../utils/breadcrumbs';

const ClubsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load competitions dynamically
  const { competitions, loading: competitionsLoading } = usePublicCompetitions();

  // Group teams by competition
  const teamsByCompetition = teams.reduce((acc, team) => {
    const competitionId = team.competition_id;
    if (competitionId && !acc[competitionId]) {
      acc[competitionId] = [];
    }
    if (competitionId) {
      acc[competitionId].push(team);
    }
    return acc;
  }, {} as Record<number, Team[]>);

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

  if (loading || competitionsLoading) {
    return (
      <div className="clubs-page">
        <Header />
        <Breadcrumbs items={generateBreadcrumbs('/clubs')} />
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
        <Breadcrumbs items={generateBreadcrumbs('/clubs')} />
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
          <Breadcrumbs items={generateBreadcrumbs('/clubs')} />
          <h1 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '700' }}>Football Clubs</h1>

          {/* Dynamic Competition Sections */}
          {competitions.map((competition, index) => {
            const competitionTeams = teamsByCompetition[competition.id] || [];
            if (competitionTeams.length === 0) return null;

            const competitionLogo = getCompetitionLogo(competition.slug);
            const competitionIcon = getCompetitionIcon(competition.slug);

            // Use different colors for each competition
            const colors = [
              { border: '#6366f1', bg: '#f8fafc', text: '#64748b' }, // Premier League purple
              { border: '#0ea5e9', bg: '#e0f2fe', text: '#0369a1' }, // Champions League blue
              { border: '#ef4444', bg: '#fef2f2', text: '#dc2626' }, // Bundesliga red
              { border: '#f59e0b', bg: '#fef3c7', text: '#d97706' }, // La Liga amber
              { border: '#10b981', bg: '#ecfdf5', text: '#059669' }, // Serie A green
              { border: '#8b5cf6', bg: '#f3e8ff', text: '#7c3aed' }, // Ligue 1 violet
              { border: '#06b6d4', bg: '#cffafe', text: '#0891b2' }, // Primeira Liga cyan
              { border: '#f97316', bg: '#fff7ed', text: '#ea580c' }, // Eredivisie orange
              { border: '#64748b', bg: '#f1f5f9', text: '#475569' }  // Championship slate
            ];
            const colorScheme = colors[index % colors.length];

            return (
              <section key={competition.id} style={{ marginBottom: index === competitions.length - 1 ? '0' : '48px' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: '#1f2937',
                  borderBottom: `2px solid ${colorScheme.border}`,
                  paddingBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {competitionLogo ? (
                    <img
                      src={competitionLogo}
                      alt={`${competition.name} logo`}
                      style={{
                        height: '32px',
                        width: 'auto',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    competitionIcon
                  )}
                  {competition.name}
                </h2>

                <div style={{
                  background: colorScheme.bg,
                  padding: '12px 16px',
                  margin: '0 0 16px 0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: colorScheme.text,
                  fontWeight: '500'
                }}>
                  {competitionTeams.length} {competition.name} clubs tracked
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
                  {competitionTeams.map(team => (
                    <ClubCard
                      key={team.id}
                      team={team}
                      variant={competition.slug === 'champions-league' ? 'ucl' : 'compact'}
                      showBadge={competition.slug === 'champions-league'}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ClubsPage;