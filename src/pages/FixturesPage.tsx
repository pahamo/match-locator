import React, { useState, useEffect } from 'react';
import { getFixtures, getTeams } from '../services/supabase';
import { getSimpleCompetitions } from '../services/supabase-simple';
import type { Fixture, Team, Competition } from '../types';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import MobileFilterModal from '../components/MobileFilterModal';
import StructuredData from '../components/StructuredData';
import { FixtureCard } from '../design-system';
import { generateFixturesMeta, updateDocumentMeta } from '../utils/seo';
import { generateBreadcrumbs } from '../utils/breadcrumbs';
import { getMatchStatus } from '../utils/matchStatus';

type FilterTeam = '' | string;
type FilterMatchweek = '' | string;
type FilterCompetition = '' | number;
type FilterLocation = '' | 'tv' | 'streaming' | 'blackout' | 'tbd';

const FixturesPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [filteredFixtures, setFilteredFixtures] = useState<Fixture[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [teamFilter, setTeamFilter] = useState<FilterTeam>('');
  const [matchweekFilter, setMatchweekFilter] = useState<FilterMatchweek>('');
  const [competitionFilter, setCompetitionFilter] = useState<FilterCompetition>('');
  const [locationFilter, setLocationFilter] = useState<FilterLocation>('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showPastGames, setShowPastGames] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData();
  }, []);

  const [displayCount, setDisplayCount] = useState(50);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let filtered = [...fixtures];

    // Filter out past games by default (unless showPastGames is true)
    if (!showPastGames) {
      filtered = filtered.filter(f => {
        const matchStatus = getMatchStatus(f.kickoff_utc);
        return matchStatus.status !== 'finished';
      });
    }

    if (teamFilter) {
      filtered = filtered.filter(f => f.home.slug === teamFilter || f.away.slug === teamFilter);
    }

    if (matchweekFilter) {
      const week = parseInt(matchweekFilter);
      filtered = filtered.filter(f => f.matchweek === week);
    }

    if (competitionFilter) {
      // Filter by competition ID - use competition_id for more reliable filtering
      filtered = filtered.filter(f => f.competition_id === competitionFilter);
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

    // Reset display count when filters change and update hasMore
    setDisplayCount(50);
    setHasMore(filtered.length > 50);
  }, [fixtures, teamFilter, matchweekFilter, competitionFilter, locationFilter, showPastGames, competitions]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load data from all visible competitions (no competitionId filter = multi-competition)
      const [fixturesData, teamsData, competitionsData] = await Promise.all([
        getFixtures({
          limit: 500,
          order: 'asc'
          // No competitionId parameter = loads from all production-visible competitions
        }),
        getTeams(),
        getSimpleCompetitions(false) // Only production-visible competitions
      ]);

      setFixtures(fixturesData);
      setTeams(teamsData);
      setCompetitions(competitionsData);
      setHasMore(fixturesData.length > 50);

      // Update SEO meta tags for fixtures page
      const meta = generateFixturesMeta();
      updateDocumentMeta(meta);
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
    return competitions;
  };



  const clearFilters = () => {
    setTeamFilter('');
    setMatchweekFilter('');
    setCompetitionFilter('');
    setLocationFilter('');
  };

  const loadMore = () => {
    const newDisplayCount = Math.min(displayCount + 50, filteredFixtures.length);
    setDisplayCount(newDisplayCount);
    setHasMore(newDisplayCount < filteredFixtures.length);
  };

  if (loading) {
    return (
      <div className="fixtures-page">
        <Header />
        <Breadcrumbs items={generateBreadcrumbs('/fixtures')} />
        <main>
          <div className="wrap">
            <h1 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '700' }}>Football Fixtures</h1>
            <div className="loading">Loading fixtures...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixtures-page">
        <Header />
        <Breadcrumbs items={generateBreadcrumbs('/fixtures')} />
        <main>
          <div className="wrap">
            <h1 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '700' }}>Football Fixtures</h1>
            <div className="error">{error}</div>
            <button onClick={loadData}>Retry</button>
          </div>
        </main>
      </div>
    );
  }


  return (
    <div className="fixtures-page">
      <StructuredData type="faq" />
      <Header />

      <main>
        <div className="wrap">
          <Breadcrumbs items={generateBreadcrumbs('/fixtures')} />
          <h1 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.5rem, 5vw, 1.875rem)', fontWeight: '700' }}>Football Fixtures</h1>

          {/* Past Games Toggle Button */}
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={() => setShowPastGames(!showPastGames)}
              style={{
                background: showPastGames ? '#6366f1' : 'transparent',
                color: showPastGames ? 'white' : '#6366f1',
                border: '1px solid #6366f1',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {showPastGames ? '✓ ' : ''}
              {showPastGames ? 'Hide Past Games' : 'Show Past Games'}
            </button>
          </div>

          {/* Mobile filter button */}
          <div className="mobile-filter-trigger">
            <button
              onClick={() => setShowMobileFilters(true)}
              style={{
                width: '100%',
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '1rem',
                color: 'var(--color-text)',
                marginBottom: '16px',
                cursor: 'pointer',
                minHeight: '44px'
              }}
            >
              <span>🔍 Filter fixtures</span>
              <span>⚙️</span>
            </button>
          </div>

          {/* Mobile Filter Modal */}
          <MobileFilterModal 
            isOpen={showMobileFilters} 
            onClose={() => setShowMobileFilters(false)}
          >
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
                  Team
                </label>
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '8px',
                    fontSize: '16px',
                    minHeight: '44px'
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
                    padding: '12px', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '8px',
                    fontSize: '16px',
                    minHeight: '44px'
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
                  onChange={(e) => setCompetitionFilter(e.target.value ? Number(e.target.value) : '')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    minHeight: '44px'
                  }}
                >
                  <option value="">All competitions</option>
                  {getCompetitionOptions().map(comp => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
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
                    padding: '12px', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '8px',
                    fontSize: '16px',
                    minHeight: '44px'
                  }}
                >
                  <option value="">All locations</option>
                  <option value="tv">📺 TV (Sky, TNT, BBC)</option>
                  <option value="streaming">💻 Streaming (Prime, etc)</option>
                  <option value="blackout">🚫 Not shown (blackout)</option>
                  <option value="tbd">❓ TBD (awaiting announcement)</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#f3f4f6',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: '#374151',
                  minHeight: '44px'
                }}
              >
                Clear Filters
              </button>
            </div>
          </MobileFilterModal>

          {/* Desktop Filters */}
          <div 
            className="desktop-filters"
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
                onChange={(e) => setCompetitionFilter(e.target.value ? Number(e.target.value) : '')}
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
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
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

          {/* Results Count */}
          <div style={{ 
            marginBottom: '16px', 
            color: '#6b7280', 
            fontSize: '14px' 
          }}>
            Showing {Math.min(displayCount, filteredFixtures.length)} of {filteredFixtures.length} fixtures
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
            <>
              <div className="fixtures-list">
                {filteredFixtures.slice(0, displayCount).map(fixture => (
                  <FixtureCard
                    key={fixture.id}
                    fixture={fixture}
                    variant="withTime"
                    showMatchweek={true}
                    showViewButton={true}
                    style={{ marginBottom: '8px' }}
                  />
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '32px',
                  paddingTop: '24px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button
                    onClick={loadMore}
                    style={{
                      padding: '12px 24px',
                      background: '#6366f1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      minHeight: '44px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5856eb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
                  >
                    Load More Fixtures ({filteredFixtures.length - displayCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default FixturesPage;
