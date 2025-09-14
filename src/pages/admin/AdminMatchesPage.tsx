import React, { useState, useEffect } from 'react';
import { getSimpleFixtures, getSimpleCompetitions } from '../../services/supabase-simple';
import { getMatchStatus } from '../../utils/matchStatus';
import type { SimpleFixture, Competition } from '../../types';
import AdminLayout from '../../components/AdminLayout';
import AdminAuth from '../../components/AdminAuth';

type StatusFilter = '' | 'upcoming' | 'live' | 'finished';
type BroadcasterFilter = '' | 'with_broadcaster' | 'no_broadcaster' | 'blackouts';

const AdminMatchesPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<SimpleFixture[]>([]);
  const [filteredFixtures, setFilteredFixtures] = useState<SimpleFixture[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Filters
  const [competitionFilter, setCompetitionFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [broadcasterFilter, setBroadcasterFilter] = useState<BroadcasterFilter>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      const expiry = localStorage.getItem('adminTokenExpiry');
      if (token && expiry && new Date().getTime() < parseInt(expiry)) {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterFixtures();
  }, [fixtures, competitionFilter, statusFilter, broadcasterFilter, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [fixturesData, competitionsData] = await Promise.all([
        getSimpleFixtures(), // Get all fixtures
        getSimpleCompetitions(true) // Include hidden competitions
      ]);

      setFixtures(fixturesData);
      setCompetitions(competitionsData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterFixtures = () => {
    let filtered = [...fixtures];

    // Text search filter
    if (searchTerm) {
      filtered = filtered.filter(fixture =>
        fixture.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fixture.away_team.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Competition filter
    if (competitionFilter) {
      filtered = filtered.filter(fixture => fixture.competition_id === competitionFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(fixture => {
        const status = getMatchStatus(fixture.kickoff_utc);
        return status.status === statusFilter;
      });
    }

    // Broadcaster filter
    if (broadcasterFilter === 'with_broadcaster') {
      filtered = filtered.filter(fixture => fixture.broadcaster);
    } else if (broadcasterFilter === 'no_broadcaster') {
      filtered = filtered.filter(fixture => !fixture.broadcaster);
    } else if (broadcasterFilter === 'blackouts') {
      filtered = filtered.filter(fixture => fixture.isBlackout);
    }

    setFilteredFixtures(filtered);
  };

  const getFixtureStats = () => {
    const total = fixtures.length;
    let upcoming = 0;
    let live = 0;
    let finished = 0;
    let withBroadcaster = 0;
    let blackouts = 0;

    fixtures.forEach(fixture => {
      const status = getMatchStatus(fixture.kickoff_utc);
      if (status.status === 'upcoming') upcoming++;
      else if (status.status === 'live' || status.status === 'upNext') live++;
      else if (status.status === 'finished') finished++;

      if (fixture.broadcaster) withBroadcaster++;
      if (fixture.isBlackout) blackouts++;
    });

    return { total, upcoming, live, finished, withBroadcaster, blackouts };
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  if (loading) {
    return (
      <AdminLayout title="Matches Management">
        <div>Loading matches...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Matches Management">
        <div className="error">{error}</div>
        <button onClick={loadData} style={{ marginTop: '16px' }}>Retry</button>
      </AdminLayout>
    );
  }

  const stats = getFixtureStats();

  return (
    <AdminLayout title="Matches Management">
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>{stats.total}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Fixtures</div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{stats.live}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Live/Up Next</div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>{stats.upcoming}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Upcoming</div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>{Math.round((stats.withBroadcaster / stats.total) * 100)}%</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>With Broadcaster</div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{stats.blackouts}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Blackouts</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '200px'
            }}
          />

          <select
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value === '' ? '' : Number(e.target.value))}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="">All Competitions</option>
            {competitions.map(comp => (
              <option key={comp.id} value={comp.id}>{comp.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live/Up Next</option>
            <option value="finished">Finished</option>
          </select>

          <select
            value={broadcasterFilter}
            onChange={(e) => setBroadcasterFilter(e.target.value as BroadcasterFilter)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="">All Broadcasters</option>
            <option value="with_broadcaster">With Broadcaster</option>
            <option value="no_broadcaster">No Broadcaster</option>
            <option value="blackouts">Blackouts</option>
          </select>

          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Showing {filteredFixtures.length} of {fixtures.length} fixtures
          </div>
        </div>

        {/* Fixtures List */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 1fr 120px 100px 80px 100px',
            gap: '12px',
            padding: '16px',
            background: '#f8fafc',
            fontWeight: '600',
            fontSize: '14px',
            color: '#374151',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div>Date/Time</div>
            <div>Home Team</div>
            <div>Away Team</div>
            <div>Broadcaster</div>
            <div>Status</div>
            <div>Blackout</div>
            <div>Actions</div>
          </div>

          {filteredFixtures.length === 0 ? (
            <div style={{
              padding: '32px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              No fixtures found matching your filters.
            </div>
          ) : (
            filteredFixtures.map((fixture) => {
              const matchStatus = getMatchStatus(fixture.kickoff_utc);
              return (
                <div
                  key={fixture.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr 1fr 120px 100px 80px 100px',
                    gap: '12px',
                    padding: '16px',
                    borderBottom: '1px solid #e2e8f0',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {formatDateTime(fixture.kickoff_utc)}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {fixture.home_team}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {fixture.away_team}
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    {fixture.broadcaster ? (
                      <span style={{
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        {fixture.broadcaster}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>None</span>
                    )}
                  </div>
                  <div>
                    <span style={{
                      background:
                        matchStatus.status === 'live' || matchStatus.status === 'upNext' ? '#fee2e2' :
                        matchStatus.status === 'upcoming' ? '#dbeafe' : '#f3f4f6',
                      color:
                        matchStatus.status === 'live' || matchStatus.status === 'upNext' ? '#dc2626' :
                        matchStatus.status === 'upcoming' ? '#2563eb' : '#6b7280',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      {matchStatus.status === 'upNext' ? 'Up Next' :
                       matchStatus.status.charAt(0).toUpperCase() + matchStatus.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    {fixture.isBlackout ? (
                      <span style={{ color: '#dc2626', fontSize: '12px' }}>Yes</span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>No</span>
                    )}
                  </div>
                  <div>
                    <button
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
    </AdminLayout>
  );
};

export default AdminMatchesPage;