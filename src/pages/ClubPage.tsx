import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFixtures } from '../services/supabase';
import type { Fixture } from '../types';
import Header from '../components/Header';
import { generateTeamMeta, updateDocumentMeta } from '../utils/seo';
import { FixtureCard } from '../design-system';
import { teamMatchesSlug, getTeamUrlSlug } from '../utils/slugUtils';

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

  const navigate = useNavigate();

  const team = useMemo(() => {
    if (!fixtures.length) return undefined;
    const first = fixtures[0];
    if (!first) return undefined;

    // Check if either team matches the current slug
    if (teamMatchesSlug(first.home, teamSlug)) return first.home;
    if (teamMatchesSlug(first.away, teamSlug)) return first.away;
    return undefined;
  }, [fixtures, teamSlug]);

  // Handle redirect if team is found but using old slug
  useEffect(() => {
    if (team && team.url_slug && team.slug !== team.url_slug && teamSlug === team.slug) {
      // Redirect from old slug to new url_slug
      console.log(`Redirecting from old slug "${team.slug}" to new slug "${team.url_slug}"`);
      navigate(`/club/${team.url_slug}`, { replace: true });
    }
  }, [team, teamSlug, navigate]);

  return (
    <div className="club-page">
      <Header />

      <main>
        <div className="wrap">
          <h1 style={{ marginTop: 0 }}>{team?.name || 'Team'}</h1>
          {loading && <div className="loading">Loading fixtures…</div>}
          {error && <div className="error">{error}</div>}

          {!loading && !error && (
            <>
              <section className="card" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: 'var(--spacing-xl)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ marginTop: 0 }}>How to watch {team?.name || 'this team'}</h2>
                <p>
                  In the UK, live football TV coverage is typically carried by
                  <a href="https://www.skysports.com/football/fixtures-results" target="_blank" rel="noreferrer" style={{ marginLeft: 6 }}>Sky Sports</a>
                  {' '}and
                  <a href="https://tntsports.co.uk/football" target="_blank" rel="noreferrer" style={{ marginLeft: 6 }}>TNT Sports</a> across different competitions.
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {fixtures.map(fx => (
                      <FixtureCard
                        key={fx.id}
                        fixture={fx}
                        variant="default"
                        showViewButton={true}
                      />
                    ))}
                  </div>
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
