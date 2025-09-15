import React, { useState, useEffect, useMemo } from 'react';
import { getAdminFixtures, saveBroadcast, type AdminFixture, BROADCASTERS } from '../../services/supabase';
import { getSimpleCompetitions } from '../../services/supabase-simple';
import type { Competition } from '../../types';
import AdminLayout from '../../components/AdminLayout';
import AdminAuth from '../../components/AdminAuth';

type CompetitionFilter = '' | 'epl' | 'ucl' | 'all';
type StatusFilter = '' | 'scheduled' | 'live' | 'finished' | 'with_broadcast' | 'no_broadcast';

const AdminMatchesPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<AdminFixture[]>([]);
  const [filteredFixtures, setFilteredFixtures] = useState<AdminFixture[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Filters
  const [competitionFilter, setCompetitionFilter] = useState<CompetitionFilter>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('scheduled'); // Default to scheduled (future games)
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFixture, setEditingFixture] = useState<number | null>(null);
  const [newBroadcast, setNewBroadcast] = useState<string>('');

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
  }, [fixtures, competitionFilter, statusFilter, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [fixturesData, competitionsData] = await Promise.all([
        getAdminFixtures(1), // EPL fixtures
        getSimpleCompetitions(true) // Include hidden competitions
      ]);

      setFixtures(fixturesData);
      setCompetitions(competitionsData);
    } catch (err) {
      console.error('Failed to load fixtures data:', err);
      setError('Failed to load fixtures. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate actual fixture status
  const getActualStatus = (fixture: AdminFixture) => {
    const now = new Date();
    const kickoff = new Date(fixture.kickoff_utc);
    const hoursAfterKickoff = (now.getTime() - kickoff.getTime()) / (1000 * 60 * 60);

    if (hoursAfterKickoff > 2) {
      return 'finished'; // Games are typically 90-120 minutes
    } else if (hoursAfterKickoff > -0.25 && hoursAfterKickoff <= 2) {
      return 'live'; // From 15 minutes before to 2 hours after kickoff
    } else {
      return 'scheduled';
    }
  };

  const filterFixtures = () => {
    let filtered = [...fixtures];

    // Text search filter (search by team names)
    if (searchTerm) {
      filtered = filtered.filter(fixture =>
        fixture.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fixture.away.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'scheduled') {
      filtered = filtered.filter(fixture => getActualStatus(fixture) === 'scheduled');
    } else if (statusFilter === 'live') {
      filtered = filtered.filter(fixture => getActualStatus(fixture) === 'live');
    } else if (statusFilter === 'finished') {
      filtered = filtered.filter(fixture => getActualStatus(fixture) === 'finished');
    } else if (statusFilter === 'with_broadcast') {
      filtered = filtered.filter(fixture => fixture.broadcast && fixture.broadcast.provider_id !== 999);
    } else if (statusFilter === 'no_broadcast') {
      filtered = filtered.filter(fixture => !fixture.broadcast || fixture.broadcast.provider_id === 999);
    }

    setFilteredFixtures(filtered);
  };

  // Helper function for stats - must be defined before useMemo
  const getFixtureStats = () => {
    const total = fixtures.length;
    const scheduled = fixtures.filter(f => getActualStatus(f) === 'scheduled').length;
    const live = fixtures.filter(f => getActualStatus(f) === 'live').length;
    const finished = fixtures.filter(f => getActualStatus(f) === 'finished').length;
    const withBroadcast = fixtures.filter(f => f.broadcast && f.broadcast.provider_id !== 999).length;
    const noBroadcast = fixtures.filter(f => !f.broadcast || f.broadcast.provider_id === 999).length;

    return {
      total,
      scheduled,
      live,
      finished,
      withBroadcast,
      noBroadcast
    };
  };

  // Derived state - must be before early returns
  const stats = useMemo(() => getFixtureStats(), [fixtures]);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleEditBroadcast = (fixtureId: number, currentProviderId?: number) => {
    setEditingFixture(fixtureId);
    setNewBroadcast(currentProviderId ? currentProviderId.toString() : '');
  };

  const handleCancelEdit = () => {
    setEditingFixture(null);
    setNewBroadcast('');
  };

  const handleSaveBroadcast = async (fixtureId: number) => {
    try {
      const providerId = newBroadcast === '' ? null : parseInt(newBroadcast);
      await saveBroadcast(fixtureId, providerId);

      // Refresh data
      await loadData();

      // Clear editing state
      setEditingFixture(null);
      setNewBroadcast('');
    } catch (err) {
      console.error('Failed to save broadcast:', err);
      alert('Failed to save broadcaster. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  if (loading) {
    return (
      <AdminLayout title="Fixtures Management">
        <div>Loading fixtures...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Fixtures Management">
        <div className="error">{error}</div>
        <button onClick={loadData} style={{ marginTop: '16px' }}>Retry</button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Fixtures Management">
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>{stats.scheduled}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Scheduled</div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{stats.live}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Live</div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>{stats.finished}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Finished</div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>{stats.withBroadcast}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>With Broadcast</div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{stats.noBroadcast}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>No Broadcast</div>
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
          placeholder="Search fixtures..."
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
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="finished">Finished</option>
          <option value="with_broadcast">With Broadcast</option>
          <option value="no_broadcast">No Broadcast</option>
        </select>

        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Showing {filteredFixtures.length} of {fixtures.length} fixtures
        </div>
      </div>

      {/* Fixtures Table - Full Width */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'auto',
        width: '100%',
        maxHeight: '70vh'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead style={{
            position: 'sticky',
            top: 0,
            background: '#f8fafc',
            zIndex: 10
          }}>
            <tr>
              <th style={{
                padding: '16px 12px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '14px',
                color: '#374151',
                borderBottom: '1px solid #e2e8f0',
                width: '120px'
              }}>Date</th>
              <th style={{
                padding: '16px 12px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '14px',
                color: '#374151',
                borderBottom: '1px solid #e2e8f0',
                width: 'auto'
              }}>Home Team</th>
              <th style={{
                padding: '16px 12px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '14px',
                color: '#374151',
                borderBottom: '1px solid #e2e8f0',
                width: 'auto'
              }}>Away Team</th>
              <th style={{
                padding: '16px 12px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '14px',
                color: '#374151',
                borderBottom: '1px solid #e2e8f0',
                width: '120px'
              }}>Kickoff</th>
              <th style={{
                padding: '16px 12px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '14px',
                color: '#374151',
                borderBottom: '1px solid #e2e8f0',
                width: '80px'
              }}>Status</th>
              <th style={{
                padding: '16px 12px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '14px',
                color: '#374151',
                borderBottom: '1px solid #e2e8f0',
                width: '150px'
              }}>Broadcast</th>
              <th style={{
                padding: '16px 12px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '14px',
                color: '#374151',
                borderBottom: '1px solid #e2e8f0',
                width: '120px'
              }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFixtures.length === 0 ? (
              <tr>
                <td colSpan={7} style={{
                  padding: '32px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  No fixtures found matching your filters.
                </td>
              </tr>
            ) : (
              filteredFixtures.map((fixture) => (
                <tr key={fixture.id} style={{
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <td style={{ padding: '16px 12px', fontSize: '12px', color: '#6b7280' }}>
                    {new Date(fixture.kickoff_utc).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {fixture.home.crest && (
                        <img
                          src={fixture.home.crest}
                          alt={fixture.home.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain'
                          }}
                        />
                      )}
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{fixture.home.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {fixture.away.crest && (
                        <img
                          src={fixture.away.crest}
                          alt={fixture.away.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain'
                          }}
                        />
                      )}
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{fixture.away.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 12px', fontSize: '12px', color: '#6b7280' }}>
                    {new Date(fixture.kickoff_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      background: getActualStatus(fixture) === 'live' ? '#fee2e2' : getActualStatus(fixture) === 'finished' ? '#f0fdf4' : '#fef3c7',
                      color: getActualStatus(fixture) === 'live' ? '#dc2626' : getActualStatus(fixture) === 'finished' ? '#16a34a' : '#d97706'
                    }}>
                      {getActualStatus(fixture)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', fontSize: '12px' }}>
                    {fixture.broadcast && fixture.broadcast.provider_id !== 999 ? (
                      <span style={{
                        background: '#f0fdf4',
                        color: '#166534',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {fixture.broadcast.provider_display_name || `Provider ${fixture.broadcast.provider_id}`}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                  {editingFixture === fixture.id ? (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <select
                        value={newBroadcast}
                        onChange={(e) => setNewBroadcast(e.target.value)}
                        style={{
                          padding: '2px 4px',
                          fontSize: '11px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          maxWidth: '80px'
                        }}
                      >
                        <option value="">None</option>
                        {BROADCASTERS.filter(b => b.id !== 999).map(broadcaster => (
                          <option key={broadcaster.id} value={broadcaster.id}>
                            {broadcaster.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleSaveBroadcast(fixture.id)}
                        style={{
                          padding: '2px 6px',
                          fontSize: '11px',
                          border: '1px solid #16a34a',
                          borderRadius: '4px',
                          background: '#16a34a',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleCancelEdit()}
                        style={{
                          padding: '2px 6px',
                          fontSize: '11px',
                          border: '1px solid #dc2626',
                          borderRadius: '4px',
                          background: '#dc2626',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditBroadcast(fixture.id, fixture.broadcast?.provider_id)}
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
                  )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Broadcast Management Info */}
      <div style={{ marginTop: '24px' }}>
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
            📺 Broadcast Management
          </h3>
          <p style={{ fontSize: '14px', color: '#0f172a', margin: '0 0 8px 0' }}>
            Use the Edit button to assign UK TV broadcasters to fixtures. Common broadcasters include Sky Sports, BT Sport, BBC, and Amazon Prime Video.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMatchesPage;