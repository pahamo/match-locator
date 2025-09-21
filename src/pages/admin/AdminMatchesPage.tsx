import React, { useState, useEffect, useMemo } from 'react';
import { getAdminFixtures, type AdminFixture, BROADCASTERS } from '../../services/supabase';
import { saveBroadcaster } from '../../services/supabase-simple';
import { useAdminCompetitions } from '../../hooks/useCompetitions';
import AdminLayout from '../../components/AdminLayout';
import AdminAuth from '../../components/AdminAuth';

type CompetitionFilter = '' | number | 'all'; // Use competition IDs instead of hardcoded strings
type MatchStatusFilter = '' | 'scheduled' | 'live' | 'finished';
type BroadcastStatusFilter = '' | 'with_broadcast' | 'no_broadcast';
type MonthFilter = '' | string; // Format: 'YYYY-MM'
type DayOfWeekFilter = '' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type TeamFilter = '' | string; // Team name or partial name

const AdminMatchesPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<AdminFixture[]>([]);
  const [filteredFixtures, setFilteredFixtures] = useState<AdminFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load competitions dynamically
  const { competitions } = useAdminCompetitions();

  // Filters
  const [competitionFilter, setCompetitionFilter] = useState<CompetitionFilter>(1); // Default to Premier League (ID: 1)
  const [matchStatusFilter, setMatchStatusFilter] = useState<MatchStatusFilter>('scheduled'); // Default to scheduled (future games)
  const [broadcastStatusFilter, setBroadcastStatusFilter] = useState<BroadcastStatusFilter>(''); // Default to all
  const [monthFilter, setMonthFilter] = useState<MonthFilter>(''); // Default to all months
  const [dayOfWeekFilter, setDayOfWeekFilter] = useState<DayOfWeekFilter>(''); // Default to all days
  const [teamFilter, setTeamFilter] = useState<TeamFilter>(''); // Default to all teams
  const [searchTerm, setSearchTerm] = useState('');
  const [savingFixtures, setSavingFixtures] = useState<Set<number>>(new Set());

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
    if (isAuthenticated && competitions.length > 0) {
      loadData();
    }
  }, [isAuthenticated, competitions]);

  useEffect(() => {
    filterFixtures();
  }, [fixtures, competitionFilter, matchStatusFilter, broadcastStatusFilter, monthFilter, dayOfWeekFilter, teamFilter, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Dynamically load fixtures from all active competitions
      const fixturePromises = competitions.map(comp => getAdminFixtures(comp.id));
      const allFixturesArrays = await Promise.all(fixturePromises);

      // Flatten all fixtures into a single array
      const fixturesData = allFixturesArrays.flat();

      setFixtures(fixturesData);
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

    // Competition filter - use dynamic competition IDs
    if (competitionFilter && competitionFilter !== 'all') {
      filtered = filtered.filter(fixture => fixture.competition_id === competitionFilter);
    }

    // Match status filter (scheduled, live, finished)
    if (matchStatusFilter === 'scheduled') {
      filtered = filtered.filter(fixture => getActualStatus(fixture) === 'scheduled');
    } else if (matchStatusFilter === 'live') {
      filtered = filtered.filter(fixture => getActualStatus(fixture) === 'live');
    } else if (matchStatusFilter === 'finished') {
      filtered = filtered.filter(fixture => getActualStatus(fixture) === 'finished');
    }

    // Month filter (YYYY-MM format)
    if (monthFilter) {
      filtered = filtered.filter(fixture => {
        const fixtureMonth = new Date(fixture.kickoff_utc).toISOString().substring(0, 7); // Extract YYYY-MM
        return fixtureMonth === monthFilter;
      });
    }

    // Day of week filter
    if (dayOfWeekFilter) {
      filtered = filtered.filter(fixture => {
        const fixtureDate = new Date(fixture.kickoff_utc);
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = dayNames[fixtureDate.getDay()];
        return dayOfWeek === dayOfWeekFilter;
      });
    }

    // Team filter (matches where specified team plays either home or away)
    if (teamFilter) {
      filtered = filtered.filter(fixture => {
        const homeTeamMatch = fixture.home.name.toLowerCase().includes(teamFilter.toLowerCase());
        const awayTeamMatch = fixture.away.name.toLowerCase().includes(teamFilter.toLowerCase());
        return homeTeamMatch || awayTeamMatch;
      });
    }

    // Broadcast status filter (with/without broadcast)
    if (broadcastStatusFilter === 'with_broadcast') {
      filtered = filtered.filter(fixture => fixture.broadcast && fixture.broadcast.provider_id !== 999);
    } else if (broadcastStatusFilter === 'no_broadcast') {
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTokenExpiry');
    setIsAuthenticated(false);
    window.location.href = '/admin';
  };




  const handleBroadcastChange = async (fixtureId: number, broadcastValue: string) => {
    try {
      // Add to saving state
      setSavingFixtures(prev => new Set([...Array.from(prev), fixtureId]));

      const providerId = broadcastValue === '' ? null : parseInt(broadcastValue);

      // Update local state optimistically
      setFixtures(prev => prev.map(fixture => {
        if (fixture.id === fixtureId) {
          const updatedFixture = { ...fixture };
          if (providerId === null) {
            updatedFixture.broadcast = null;
          } else {
            const broadcasterName = BROADCASTERS.find(b => b.id === providerId)?.name || 'Unknown';
            updatedFixture.broadcast = {
              provider_id: providerId,
              provider_display_name: broadcasterName
            };
          }
          return updatedFixture;
        }
        return fixture;
      }));

      // Save to database
      await saveBroadcaster(fixtureId, providerId);

      // Remove from saving state
      setSavingFixtures(prev => {
        const updated = new Set(prev);
        updated.delete(fixtureId);
        return updated;
      });
    } catch (err) {
      console.error('Failed to save broadcast:', err);
      alert('Failed to save broadcaster. Please try again.');

      // Remove from saving state on error
      setSavingFixtures(prev => {
        const updated = new Set(prev);
        updated.delete(fixtureId);
        return updated;
      });
    }
  };


  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  if (loading) {
    return (
      <AdminLayout title="Fixtures Management" onLogout={handleLogout}>
        <div>Loading fixtures...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Fixtures Management" onLogout={handleLogout}>
        <div className="error">{error}</div>
        <button onClick={loadData} style={{ marginTop: '16px' }}>Retry</button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Fixtures Management" onLogout={handleLogout}>
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
          value={competitionFilter}
          onChange={(e) => {
            const value = e.target.value;
            setCompetitionFilter(value === '' || value === 'all' ? '' : Number(value));
          }}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="">All Competitions</option>
          {competitions.map(competition => (
            <option key={competition.id} value={competition.id}>
              {competition.name}
              {competition.short_name && ` (${competition.short_name})`}
            </option>
          ))}
        </select>

        <select
          value={matchStatusFilter}
          onChange={(e) => setMatchStatusFilter(e.target.value as MatchStatusFilter)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="">All Match Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="finished">Finished</option>
        </select>

        <select
          value={broadcastStatusFilter}
          onChange={(e) => setBroadcastStatusFilter(e.target.value as BroadcastStatusFilter)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="">All Broadcasts</option>
          <option value="with_broadcast">With Broadcast</option>
          <option value="no_broadcast">No Broadcast</option>
        </select>

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="">All Months</option>
          <option value="2025-01">January 2025</option>
          <option value="2025-02">February 2025</option>
          <option value="2025-03">March 2025</option>
          <option value="2025-04">April 2025</option>
          <option value="2025-05">May 2025</option>
          <option value="2025-06">June 2025</option>
          <option value="2025-07">July 2025</option>
          <option value="2025-08">August 2025</option>
          <option value="2025-09">September 2025</option>
          <option value="2025-10">October 2025</option>
          <option value="2025-11">November 2025</option>
          <option value="2025-12">December 2025</option>
          <option value="2024-12">December 2024</option>
          <option value="2024-11">November 2024</option>
          <option value="2024-10">October 2024</option>
        </select>

        <select
          value={dayOfWeekFilter}
          onChange={(e) => setDayOfWeekFilter(e.target.value as DayOfWeekFilter)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="">All Days</option>
          <option value="monday">Monday</option>
          <option value="tuesday">Tuesday</option>
          <option value="wednesday">Wednesday</option>
          <option value="thursday">Thursday</option>
          <option value="friday">Friday</option>
          <option value="saturday">Saturday</option>
          <option value="sunday">Sunday</option>
        </select>

        <input
          type="text"
          placeholder="Filter by team..."
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '150px'
          }}
        />

        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Showing {filteredFixtures.length} of {fixtures.length} fixtures
        </div>
      </div>


      {/* Fixtures Table - Full Width */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'visible',
        width: '100%'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{
            background: '#f8fafc'
          }}>
            <tr>
              <th style={{
                padding: '16px 12px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '14px',
                color: '#374151',
                borderBottom: '1px solid #e2e8f0',
                width: '80px'
              }}>ID</th>
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
                minWidth: '150px'
              }}>Home Team</th>
              <th style={{
                padding: '16px 12px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '14px',
                color: '#374151',
                borderBottom: '1px solid #e2e8f0',
                minWidth: '150px'
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
                  <td style={{ padding: '16px 12px', fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                    {fixture.id}
                  </td>
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
                    ) : fixture.broadcast && fixture.broadcast.provider_id === 999 ? (
                      <span style={{ color: '#9ca3af' }}>Blackout</span>
                    ) : (
                      <span style={{ color: '#6b7280' }}>TBD</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        value={fixture.broadcast?.provider_id || ''}
                        onChange={(e) => handleBroadcastChange(fixture.id, e.target.value)}
                        disabled={savingFixtures.has(fixture.id)}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px',
                          minWidth: '120px',
                          cursor: savingFixtures.has(fixture.id) ? 'not-allowed' : 'pointer',
                          opacity: savingFixtures.has(fixture.id) ? 0.6 : 1
                        }}
                      >
                        <option value="">TBD</option>
                        {BROADCASTERS.map(broadcaster => (
                          <option key={broadcaster.id} value={broadcaster.id}>
                            {broadcaster.name}
                          </option>
                        ))}
                      </select>
                      {savingFixtures.has(fixture.id) && (
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>Saving...</span>
                      )}
                    </div>
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
            Use the dropdown menus to assign UK TV broadcasters to fixtures. Changes are saved automatically. Common broadcasters include Sky Sports, TNT Sports, BBC, and Amazon Prime Video.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMatchesPage;