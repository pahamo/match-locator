import React, { useEffect, useState } from 'react';
import { getTeams } from '../services/supabase';
import type { Team } from '../types';

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTeams();
        if (!ignore) setTeams(data);
      } catch (e) {
        if (!ignore) setError('Failed to load teams. Please try again later.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  return (
    <div className="teams-page">
      <header>
        <div>
          <h1 style={{ margin: 0 }}>Premier League Clubs</h1>
          <p className="muted" style={{ margin: 0 }}>Find your club’s upcoming fixtures and how to watch</p>
        </div>
        <nav style={{ display: 'flex', gap: '12px' }}>
          <a href="/" style={{ color: '#6366f1', textDecoration: 'underline', fontSize: '0.9rem' }}>Schedule</a>
          <a href="/about" style={{ color: '#6366f1', textDecoration: 'underline', fontSize: '0.9rem' }}>About</a>
        </nav>
      </header>

      <main>
        <div className="wrap">
          {loading && <div className="loading">Loading clubs…</div>}
          {error && <div className="error">{error}</div>}

          {!loading && !error && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 'var(--spacing-lg)'
            }}>
              {teams.map(team => (
                <a
                  key={team.id}
                  href={`/clubs/${team.slug}`}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--border-radius)',
                    padding: 'var(--spacing-lg)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {team.crest ? (
                      <img src={team.crest} alt={`${team.name} crest`} className="team-crest" />
                    ) : (
                      <div
                        aria-hidden
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'var(--color-background)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          color: 'var(--color-muted)'
                        }}
                        title={team.name}
                      >
                        {team.name.charAt(0)}
                      </div>
                    )}
                    <div style={{ fontWeight: 600 }}>{team.name}</div>
                  </div>
                </a>
              ))}
            </div>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <a href="/" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>← Back to Schedule</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamsPage;

