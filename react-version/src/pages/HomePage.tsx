import React, { useState, useEffect } from 'react';
import { getSimpleFixtures, type SimpleFixture } from '../services/supabase-simple';
import Header from '../components/Header';

interface MatchDay {
  date: string;
  displayDate: string;
  fixtures: SimpleFixture[];
  isToday: boolean;
  isUpcoming: boolean;
}

const HomePage: React.FC = () => {
  const [matchDay, setMatchDay] = useState<MatchDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blackoutIds, setBlackoutIds] = useState<number[]>([]);

  useEffect(() => {
    loadMatchDay();
  }, []);

  const loadMatchDay = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fixturesData = await getSimpleFixtures();
      const currentMatchDay = getCurrentOrUpcomingMatchDay(fixturesData);
      setMatchDay(currentMatchDay);

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

  const getCurrentOrUpcomingMatchDay = (fixtures: SimpleFixture[]): MatchDay | null => {
    if (!fixtures.length) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Group fixtures by date
    const fixturesByDate = new Map<string, SimpleFixture[]>();
    
    fixtures.forEach(fixture => {
      const fixtureDate = new Date(fixture.kickoff_utc);
      const dateKey = fixtureDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!fixturesByDate.has(dateKey)) {
        fixturesByDate.set(dateKey, []);
      }
      fixturesByDate.get(dateKey)!.push(fixture);
    });

    // Sort dates and find current/next match day
    const sortedDates = Array.from(fixturesByDate.keys()).sort();
    
    // First, check if there are matches today
    const todayKey = today.toISOString().split('T')[0];
    if (fixturesByDate.has(todayKey)) {
      const todayFixtures = fixturesByDate.get(todayKey)!;
      return {
        date: todayKey,
        displayDate: 'Today',
        fixtures: todayFixtures.sort((a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime()),
        isToday: true,
        isUpcoming: false
      };
    }

    // Otherwise, find the next upcoming match day
    for (const dateKey of sortedDates) {
      const matchDate = new Date(dateKey);
      if (matchDate >= today) {
        const fixtures = fixturesByDate.get(dateKey)!;
        const displayDate = matchDate.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
        
        return {
          date: dateKey,
          displayDate,
          fixtures: fixtures.sort((a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime()),
          isToday: false,
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
            <div className="loading">Loading match day...</div>
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
            <button onClick={loadMatchDay}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

  if (!matchDay) {
    return (
      <div className="home-page">
        <Header />
        <main>
          <div className="wrap">
            <div className="no-fixtures">
              <p>No upcoming match days found.</p>
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
              background: matchDay.isToday ? '#f0f9ff' : '#fefce8', 
              border: matchDay.isToday ? '2px solid #0ea5e9' : '2px solid #eab308',
              borderRadius: '12px', 
              padding: '24px', 
              marginBottom: '24px' 
            }}
          >
            <h2 style={{ 
              margin: '0 0 8px 0', 
              color: matchDay.isToday ? '#0c4a6e' : '#713f12',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {matchDay.isToday ? '🔴' : '📅'} {matchDay.displayDate}
            </h2>
            <p style={{ 
              margin: 0, 
              color: matchDay.isToday ? '#075985' : '#92400e',
              fontSize: '14px'
            }}>
              {matchDay.isToday 
                ? `${matchDay.fixtures.length} match${matchDay.fixtures.length === 1 ? '' : 'es'} today`
                : `Next Premier League match day • ${matchDay.fixtures.length} match${matchDay.fixtures.length === 1 ? '' : 'es'}`
              }
            </p>
          </div>

          <div className="fixtures-list">
            {matchDay.fixtures.map(fixture => (
              <div key={fixture.id} className="fixture-card">
                <div className="fixture-datetime">
                  {new Date(fixture.kickoff_utc).toLocaleDateString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/London'
                  })}
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
