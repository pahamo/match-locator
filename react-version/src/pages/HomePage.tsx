import React, { useState, useEffect } from 'react';
import { getSimpleFixtures, type SimpleFixture } from '../services/supabase-simple';
import Header from '../components/Header';

interface MatchWeek {
  matchweek: number;
  fixtures: SimpleFixture[];
  dateRange: string;
  hasToday: boolean;
  isUpcoming: boolean;
}

const HomePage: React.FC = () => {
  const [matchWeek, setMatchWeek] = useState<MatchWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blackoutIds, setBlackoutIds] = useState<number[]>([]);

  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const fixturesData = await getSimpleFixtures();
        const currentMatchWeek = getCurrentOrUpcomingMatchWeek(fixturesData);
        if (!isCancelled) setMatchWeek(currentMatchWeek);
        try {
          const stored = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
          if (!isCancelled && Array.isArray(stored)) setBlackoutIds(stored);
        } catch { /* ignore */ }
      } catch (err) {
        console.error('Failed to load fixtures:', err);
        if (!isCancelled) setError('Failed to load fixtures. Please try again later.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    })();
    return () => { isCancelled = true; };
  }, []);

  const loadMatchWeek = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fixturesData = await getSimpleFixtures();
      const currentMatchWeek = getCurrentOrUpcomingMatchWeek(fixturesData);
      setMatchWeek(currentMatchWeek);

      // Load blackout flags from localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
        if (Array.isArray(stored)) setBlackoutIds(stored);
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed to load fixtures:', err);
      setError('Failed to load fixtures. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentOrUpcomingMatchWeek = (fixtures: SimpleFixture[]): MatchWeek | null => {
    if (!fixtures.length) return null;

    const now = new Date();
    
    // Group fixtures by matchweek
    const fixturesByMatchweek = new Map<number, SimpleFixture[]>();
    
    fixtures.forEach(fixture => {
      if (fixture.matchweek) {
        if (!fixturesByMatchweek.has(fixture.matchweek)) {
          fixturesByMatchweek.set(fixture.matchweek, []);
        }
        fixturesByMatchweek.get(fixture.matchweek)!.push(fixture);
      }
    });

    // Find current or upcoming matchweek
    const sortedMatchweeks = Array.from(fixturesByMatchweek.keys()).sort((a, b) => a - b);
    
    // First check if there's a matchweek with games today or in the future
    for (const matchweek of sortedMatchweeks) {
      const matchweekFixtures = fixturesByMatchweek.get(matchweek)!;
      const upcomingFixtures = matchweekFixtures.filter(f => new Date(f.kickoff_utc) >= now);
      
      if (upcomingFixtures.length > 0) {
        // Sort fixtures by kickoff time
        const sortedFixtures = matchweekFixtures.sort((a, b) => 
          new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime()
        );
        
        // Calculate date range
        const firstDate = new Date(sortedFixtures[0].kickoff_utc);
        const lastDate = new Date(sortedFixtures[sortedFixtures.length - 1].kickoff_utc);
        
        const dateRange = firstDate.toDateString() === lastDate.toDateString() 
          ? firstDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
          : `${firstDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${lastDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
        
        // Check if any fixtures are today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const hasToday = matchweekFixtures.some(f => {
          const fixtureDate = new Date(f.kickoff_utc);
          fixtureDate.setHours(0, 0, 0, 0);
          return fixtureDate.getTime() === today.getTime();
        });
        
        return {
          matchweek,
          fixtures: sortedFixtures,
          dateRange,
          hasToday,
          isUpcoming: true
        };
      }
    }

    return null;
  };

  if (loading) {
    return (
      <div className="home-page">
        <Header />
        <main>
          <div className="wrap">
            <div className="loading">Loading upcoming matches...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <Header />
        <main>
          <div className="wrap">
            <div className="error">{error}</div>
            <button onClick={loadMatchWeek}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

  if (!matchWeek) {
    return (
      <div className="home-page">
        <Header />
        <main>
          <div className="wrap">
            <div className="no-fixtures">
              <p>No upcoming matches found.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header />
      
      <main>
        <div className="wrap">
          <div 
            style={{ 
              background: matchWeek.hasToday ? '#f0f9ff' : '#fefce8', 
              border: matchWeek.hasToday ? '2px solid #0ea5e9' : '2px solid #eab308',
              borderRadius: '12px', 
              padding: '24px', 
              marginBottom: '24px' 
            }}
          >
            <h2 style={{ 
              margin: '0 0 8px 0', 
              color: matchWeek.hasToday ? '#0c4a6e' : '#713f12',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {matchWeek.hasToday ? '🔴' : '📅'} Upcoming Matches
            </h2>
            <p style={{ 
              margin: 0, 
              color: matchWeek.hasToday ? '#075985' : '#92400e',
              fontSize: '14px'
            }}>
              <strong>Matchweek {matchWeek.matchweek}</strong> • {matchWeek.dateRange} • {matchWeek.fixtures.length} match{matchWeek.fixtures.length === 1 ? '' : 'es'}
            </p>
          </div>

          <div className="fixtures-list">
            {matchWeek.fixtures.map(fixture => (
              <div key={fixture.id} className="fixture-card">
                <div className="fixture-datetime">
                  {new Date(fixture.kickoff_utc).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/London'
                  })}
                  {fixture.matchweek && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      MW {fixture.matchweek}
                    </div>
                  )}
                </div>
                <div className="fixture-teams">
                  <div className="team">
                    <span className="team-name">{fixture.home_team}</span>
                  </div>
                  <div className="vs">vs</div>
                  <div className="team away-team">
                    <span className="team-name">{fixture.away_team}</span>
                  </div>
                </div>
                <div className="broadcaster-info">
                  {blackoutIds.includes(fixture.id) ? (
                    <span className="provider blackout">🚫 Blackout</span>
                  ) : fixture.broadcaster ? (
                    <span className="provider confirmed">{fixture.broadcaster}</span>
                  ) : (
                    <span className="tbd-text">TBD</span>
                  )}
                </div>
                <div style={{ marginTop: '12px', textAlign: 'right' }}>
                  <a 
                    href={`/matches/${fixture.id}`} 
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
            ))}
          </div>

          <div style={{ 
            marginTop: '32px', 
            padding: '16px', 
            background: '#f9fafb', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '14px' }}>
              Want to see all upcoming fixtures or manage broadcasts?
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a 
                href="/fixtures" 
                style={{ 
                  color: '#6366f1', 
                  textDecoration: 'underline', 
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                📺 All Fixtures
              </a>
              <a 
                href="/admin" 
                style={{ 
                  color: '#6366f1', 
                  textDecoration: 'underline', 
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                🔧 Admin
              </a>
              <a 
                href="/clubs" 
                style={{ 
                  color: '#6366f1', 
                  textDecoration: 'underline', 
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                🏟️ Browse by Club
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
