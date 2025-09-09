import React, { useState, useEffect } from 'react';
import { getSimpleFixtures, type SimpleFixture } from '../services/supabase-simple';

const HomePage: React.FC = () => {
  const [fixtures, setFixtures] = useState<SimpleFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFixtures();
  }, []);

  const loadFixtures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fixturesData = await getSimpleFixtures();
      setFixtures(fixturesData);
    } catch (err) {
      console.error('Failed to load fixtures:', err);
      setError('Failed to load fixtures. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <header>
          <h1>Premier League TV Schedule</h1>
          <p>Find which broadcaster shows every match: Sky Sports, TNT Sports</p>
        </header>
        
        <main>
          <div className="wrap">
            <div className="loading">Loading fixtures...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <header>
          <h1>Premier League TV Schedule</h1>
          <p>Find which broadcaster shows every match: Sky Sports, TNT Sports</p>
        </header>
        
        <main>
          <div className="wrap">
            <div className="error">{error}</div>
            <button onClick={loadFixtures}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header>
        <h1>Premier League TV Schedule UK</h1>
        <p>Find which broadcaster shows every match: Sky Sports, TNT Sports, BBC</p>
      </header>
      
      <main>
        <div className="wrap">
          {fixtures.length === 0 ? (
            <div className="no-fixtures">
              <p>No upcoming fixtures found.</p>
            </div>
          ) : (
            <div className="fixtures-list">
              <h2>Upcoming Fixtures ({fixtures.length}) 
                <a href="/admin" style={{ marginLeft: '15px', color: '#6366f1', textDecoration: 'underline', fontSize: '0.8rem' }}>
                  🔧 Admin
                </a>
              </h2>
              {fixtures.map(fixture => (
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
                    {fixture.broadcaster ? (
                      <span className="provider confirmed">{fixture.broadcaster}</span>
                    ) : (
                      <span className="tbd-text">TBD</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;