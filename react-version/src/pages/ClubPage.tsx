import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFixtures } from '../services/supabase';
import type { Fixture } from '../types';
import Header from '../components/Header';
import { generateTeamMeta, updateDocumentMeta, generateMatchUrl } from '../utils/seo';

const ClubPage: React.FC = () => {
  const { slug, clubId } = useParams<{ slug?: string; clubId?: string }>();
  const teamSlug = slug ?? clubId ?? '';
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFixtures({ 
          teamSlug: teamSlug, 
          dateFrom: new Date().toISOString(),
          limit: 500, 
          order: 'asc' 
        });
        if (!ignore) {
          setFixtures(data);
          
          // Update SEO meta tags for team page once we have team data
          if (data.length > 0) {
            const firstFixture = data[0];
            const teamData = firstFixture.home.slug === teamSlug ? firstFixture.home : firstFixture.away;
            const meta = generateTeamMeta(teamData, data.length);
            updateDocumentMeta(meta);
          }
        }
      } catch (e) {
        if (!ignore) setError('Failed to load team fixtures. Please try again later.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    if (teamSlug) load();
    return () => { ignore = true; };
  }, [teamSlug]);

  const team = useMemo(() => {
    if (!fixtures.length) return undefined;
    const first = fixtures[0];
    if (!first) return undefined;
    if (first.home.slug === teamSlug) return first.home;
    if (first.away.slug === teamSlug) return first.away;
    return undefined;
  }, [fixtures, teamSlug]);

  return (
    <div className="club-page">
      <Header 
        title={team?.name || 'Team'}
        subtitle="Upcoming fixtures and how to watch in the UK"
      />

      <main>
        <div className="wrap">
          {loading && <div className="loading">Loading fixtures…</div>}
          {error && <div className="error">{error}</div>}

          {!loading && !error && (
            <>
              <section className="card" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: 'var(--spacing-xl)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ marginTop: 0 }}>How to watch {team?.name || 'this team'}</h2>
                <p>
                  In the UK, live Premier League TV coverage is typically carried by
                  <a href="https://www.skysports.com/football/fixtures-results" target="_blank" rel="noreferrer" style={{ marginLeft: 6 }}>Sky Sports</a>
                  {' '}and
                  <a href="https://tntsports.co.uk/football" target="_blank" rel="noreferrer" style={{ marginLeft: 6 }}>TNT Sports</a> across the season.
                  Listings can change; always check the official broadcaster schedule.
                </p>
                <ul>
                  <li>When a broadcaster is confirmed, it appears on each fixture below.</li>
                  <li>Kick-off times are shown in local UK time (Europe/London).</li>
                </ul>
              </section>

              <section>
                <h2 style={{ marginTop: 0 }}>Upcoming fixtures ({fixtures.length})</h2>
                {fixtures.length === 0 ? (
                  <div className="no-fixtures">No upcoming fixtures found.</div>
                ) : (
                  fixtures.map(fx => (
                    <div key={fx.id} className="fixture-card">
                      <div className="fixture-datetime">
                        {new Date(fx.kickoff_utc).toLocaleDateString('en-GB', {
                          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London'
                        })}
                      </div>
                      <div className="fixture-teams">
                        <div className="team">
                          {fx.home.crest && <img className="team-crest" src={fx.home.crest} alt={`${fx.home.name} crest`} />}
                          <span className="team-name">{fx.home.name}</span>
                        </div>
                        <div className="vs">vs</div>
                        <div className="team away-team">
                          {fx.away.crest && <img className="team-crest" src={fx.away.crest} alt={`${fx.away.name} crest`} />}
                          <span className="team-name">{fx.away.name}</span>
                        </div>
                      </div>
                      <div className="broadcaster-info">
                        {fx.providers_uk && fx.providers_uk.length > 0 ? (
                          fx.providers_uk.map(p => (
                            <a key={p.id} href={p.href || (p.name.includes('Sky') ? 'https://www.skysports.com/football/fixtures-results' : p.name.includes('TNT') ? 'https://tntsports.co.uk/football' : undefined)} target="_blank" rel="noreferrer" aria-label={`Affiliate link to ${p.name}`} className="provider confirmed" style={{ marginRight: 8, textDecoration: 'none', color: '#059669' }}>
                              {p.name}
                            </a>
                          ))
                        ) : (
                          <span className="tbd-text">TBD</span>
                        )}
                      </div>
                      {fx.venue && (
                        <div className="fixture-venue">{fx.venue}</div>
                      )}
                      <div style={{ marginTop: '12px', textAlign: 'right' }}>
                        <a 
                          href={generateMatchUrl(fx)} 
                          style={{ 
                            color: '#6366f1', 
                            textDecoration: 'underline', 
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}
                        >
                          Details →
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </section>

              <div style={{ marginTop: '1.5rem' }}>
                <a href="/" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>← Back to Schedule</a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClubPage;
