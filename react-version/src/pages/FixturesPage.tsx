import React, { useState, useEffect } from 'react';
import { getFixtures, getTeams } from '../services/supabase';
import type { Fixture, Team } from '../types';
import Header from '../components/Header';

type FilterTeam = '' | string;
type FilterMatchweek = '' | string;
type FilterCompetition = '' | string;
type FilterLocation = '' | 'tv' | 'streaming' | 'blackout' | 'tbd';

const FixturesPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [filteredFixtures, setFilteredFixtures] = useState<Fixture[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [teamFilter, setTeamFilter] = useState<FilterTeam>('');
  const [matchweekFilter, setMatchweekFilter] = useState<FilterMatchweek>('');
  const [competitionFilter, setCompetitionFilter] = useState<FilterCompetition>('');
  const [locationFilter, setLocationFilter] = useState<FilterLocation>('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...fixtures];

    if (teamFilter) {
      filtered = filtered.filter(f => f.home.slug === teamFilter || f.away.slug === teamFilter);
    }

    if (matchweekFilter) {
      const week = parseInt(matchweekFilter);
      filtered = filtered.filter(f => f.matchweek === week);
    }

    if (competitionFilter) {
      filtered = filtered.filter(f => f.competition === competitionFilter);
    }

    if (locationFilter) {
      if (locationFilter === 'tv') {
        filtered = filtered.filter(f => f.providers_uk.some(p => p.type === 'tv'));
      } else if (locationFilter === 'streaming') {
        filtered = filtered.filter(f => f.providers_uk.some(p => p.type === 'streaming'));
      } else if (locationFilter === 'blackout') {
        filtered = filtered.filter(f => f.blackout?.is_blackout === true);
      } else if (locationFilter === 'tbd') {
        filtered = filtered.filter(f => f.providers_uk.length === 0 && !f.blackout?.is_blackout);
      }
    }

    setFilteredFixtures(filtered);
  }, [fixtures, teamFilter, matchweekFilter, competitionFilter, locationFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [fixturesData, teamsData] = await Promise.all([
        getFixtures({
          limit: 500,
          order: 'asc'
        }),
        getTeams()
      ]);
      
      setFixtures(fixturesData);
      setTeams(teamsData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load fixtures. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  

  const getMatchweekOptions = () => {
    const weeks = new Set<number>();
    fixtures.forEach(f => {
      if (f.matchweek) weeks.add(f.matchweek);
    });
    return Array.from(weeks).sort((a, b) => a - b);
  };

  const getCompetitionOptions = () => {
    const competitions = new Set<string>();
    fixtures.forEach(f => {
      if (f.competition) competitions.add(f.competition);
    });
    return Array.from(competitions).sort();
  };


  const formatDateTime = (kickoffUtc: string) => {
    const date = new Date(kickoffUtc);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    });
  };

  const getProviderDisplay = (fixture: Fixture) => {
    if (fixture.blackout?.is_blackout) {
      return <span className="provider blackout">🚫 Blackout</span>;
    }
    
    if (fixture.providers_uk.length === 0) {
      return <span className="tbd-text">TBD</span>;
    }

    return fixture.providers_uk.map(provider => (
      <span 
        key={provider.id} 
        className={`provider confirmed ${provider.type}`}
        title={provider.type}
      >
        {provider.name}
      </span>
    ));
  };

  const clearFilters = () => {
    setTeamFilter('');
    setMatchweekFilter('');
    setCompetitionFilter('');
    setLocationFilter('');
  };

  if (loading) {
    return (
      <div className="fixtures-page">
        <Header 
          title="Premier League Fixtures"
          subtitle="All upcoming matches with TV schedule information"
        />
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
      <div className="fixtures-page">
        <Header 
          title="Premier League Fixtures"
          subtitle="All upcoming matches with TV schedule information"
        />
        <main>
          <div className="wrap">
            <div className="error">{error}</div>
            <button onClick={loadData}>Retry</button>
          </div>
        </main>
      </div>
    );
  }


  return (
    <div className="fixtures-page">
      <Header 
        title="Premier League Fixtures"
        subtitle="All upcoming matches with TV schedule information"
      />
      
      <main>
        <div className="wrap">

          {/* Filters */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '12px', 
              marginBottom: '24px',
              padding: '20px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Team
              </label>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">All teams</option>
                {teams.map(team => (
                  <option key={team.slug} value={team.slug}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Matchweek
              </label>
              <select
                value={matchweekFilter}
                onChange={(e) => setMatchweekFilter(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">All matchweeks</option>
                {getMatchweekOptions().map(week => (
                  <option key={week} value={week}>
                    Matchweek {week}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Competition
              </label>
              <select
                value={competitionFilter}
                onChange={(e) => setCompetitionFilter(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">All competitions</option>
                {getCompetitionOptions().map(comp => (
                  <option key={comp} value={comp}>
                    {comp === 'premier-league' ? 'Premier League' : comp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                Where to Watch
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value as FilterLocation)}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">All locations</option>
                <option value="tv">📺 TV (Sky, TNT, BBC)</option>
                <option value="streaming">💻 Streaming (Prime, etc)</option>
                <option value="blackout">🚫 Not shown (blackout)</option>
                <option value="tbd">❓ TBD (awaiting announcement)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'end', gap: '8px' }}>
              <button
                onClick={clearFilters}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#374151'
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Fixtures List */}
          {filteredFixtures.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px 24px',
              background: '#fafafa',
              borderRadius: '8px'
            }}>
              <p style={{ margin: 0, color: '#6b7280' }}>
                No fixtures match the current filters.
              </p>
            </div>
          ) : (
            <div className="fixtures-list">
              {filteredFixtures.map(fixture => (
                <div key={fixture.id} className="fixture-card">
                  <div className="fixture-datetime">
                    {formatDateTime(fixture.kickoff_utc)}
                    {fixture.matchweek && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        MW {fixture.matchweek}
                      </div>
                    )}
                  </div>
                  <div className="fixture-teams">
                    <div className="team">
                      {fixture.home.crest && (
                        <img 
                          src={fixture.home.crest} 
                          alt={`${fixture.home.name} crest`}
                          style={{ width: '20px', height: '20px', marginRight: '8px', objectFit: 'contain' }}
                        />
                      )}
                      <span className="team-name">{fixture.home.name}</span>
                    </div>
                    <div className="vs">vs</div>
                    <div className="team away-team">
                      <span className="team-name">{fixture.away.name}</span>
                      {fixture.away.crest && (
                        <img 
                          src={fixture.away.crest} 
                          alt={`${fixture.away.name} crest`}
                          style={{ width: '20px', height: '20px', marginLeft: '8px', objectFit: 'contain' }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="broadcaster-info">
                    {getProviderDisplay(fixture)}
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
          )}
        </div>
      </main>
    </div>
  );
};

export default FixturesPage;
