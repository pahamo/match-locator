import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getSimpleFixtures,
  saveBroadcaster,
  SIMPLE_BROADCASTERS,
  getSimpleCompetitions,
  saveCompetitionVisibility
} from '../services/supabase-simple';
import type { SimpleFixture, Competition } from '../types';
import BroadcastEditor from '../components/BroadcastEditor';
import AdminAuth from '../components/AdminAuth';

type FilterStatus = '' | 'confirmed' | 'tbd' | 'blackout';
type TimeFilter = '' | 'upcoming' | 'all';

const AdminPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<SimpleFixture[]>([]);
  const [filteredFixtures, setFilteredFixtures] = useState<SimpleFixture[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<number, number | null>>(new Map());
  const [savingFixtures, setSavingFixtures] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('');
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [matchweekFilter, setMatchweekFilter] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');
  const [showBroadcastEditor, setShowBroadcastEditor] = useState(false);
  const messageTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const loadCompetitions = async () => {
    try {
      const competitionsData = await getSimpleCompetitions(true); // Include hidden for admin
      setCompetitions(competitionsData);
    } catch (err) {
      console.error('Failed to load competitions:', err);
    }
  };

  const loadFixturesUnsafe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fixturesData = await getSimpleFixtures(selectedCompetitionId);
      if (!isMountedRef.current) return;
      setFixtures(fixturesData);
      // Clear any pending changes after a fresh load to avoid stale state
      setPendingChanges(new Map());
    } catch (err) {
      console.error('Failed to load fixtures:', err);
      if (!isMountedRef.current) return;
      setError('Failed to load fixtures. Please try again later.');
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
    }
  }, [selectedCompetitionId]);

  const loadFixtures = useCallback(async (confirmIfPending: boolean = false) => {
    if (confirmIfPending && pendingChanges.size > 0) {
      const proceed = window.confirm('You have unsaved changes. Refreshing will discard them. Continue?');
      if (!proceed) return;
    }
    await loadFixturesUnsafe();
  }, [pendingChanges, loadFixturesUnsafe]);

  useEffect(() => {
    isMountedRef.current = true;
    loadCompetitions();
    loadFixturesUnsafe();
    return () => {
      isMountedRef.current = false;
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
    };
  }, [loadFixturesUnsafe]);

  useEffect(() => {
    let filtered = [...fixtures];

    // Time filter (default to upcoming)
    if (timeFilter === 'upcoming') {
      const now = new Date();
      filtered = filtered.filter(f => new Date(f.kickoff_utc) > now);
    }

    if (monthFilter) {
      filtered = filtered.filter(f => f.kickoff_utc.startsWith(monthFilter));
    }

    if (matchweekFilter) {
      const matchweek = parseInt(matchweekFilter, 10);
      if (!isNaN(matchweek)) {
        filtered = filtered.filter(f => f.matchweek === matchweek);
      }
    }

    if (statusFilter === 'confirmed') {
      filtered = filtered.filter(f => f.broadcaster && !f.isBlackout);
    } else if (statusFilter === 'tbd') {
      filtered = filtered.filter(f => !f.broadcaster && !f.isBlackout);
    } else if (statusFilter === 'blackout') {
      filtered = filtered.filter(f => f.isBlackout);
    }

    setFilteredFixtures(filtered);
  }, [fixtures, statusFilter, monthFilter, matchweekFilter, timeFilter]);

  const getMonthOptions = () => {
    const months = new Set<string>();
    fixtures.forEach(f => {
      const month = f.kickoff_utc.substring(0, 7); // YYYY-MM
      months.add(month);
    });
    return Array.from(months).sort();
  };

  const getStats = () => {
    const total = filteredFixtures.length;
    const confirmed = filteredFixtures.filter(f => f.broadcaster && !f.isBlackout).length;
    const blackout = filteredFixtures.filter(f => f.isBlackout).length;
    const tbd = total - confirmed - blackout;
    return { total, confirmed, tbd, blackout };
  };

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    if (messageTimeoutRef.current) {
      window.clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
    messageTimeoutRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      setMessage(null);
      messageTimeoutRef.current = null;
    }, 5000);
  };

  const handleProviderChange = (fixtureId: number, providerId: string) => {
    const newChanges = new Map(pendingChanges);
    const fixture = fixtures.find(f => f.id === fixtureId);
    const currentProviderId = fixture?.providerId || null;
    
    const parsed = providerId === '' ? null : Number.parseInt(providerId, 10);
    const selectedProviderId = parsed === null || Number.isNaN(parsed) ? null : parsed;
    
    if (selectedProviderId !== currentProviderId) {
      newChanges.set(fixtureId, selectedProviderId);
    } else {
      newChanges.delete(fixtureId);
    }
    
    setPendingChanges(newChanges);
  };

  const handleSaveBroadcast = async (fixtureId: number) => {
    const providerId = pendingChanges.get(fixtureId);
    if (providerId === undefined) return;

    setSavingFixtures(prev => {
      const newSet = new Set(prev);
      newSet.add(fixtureId);
      return newSet;
    });
    
    try {
      await saveBroadcaster(fixtureId, providerId);
      if (!isMountedRef.current) return;
      
      // Update local fixture data
      setFixtures(prev => prev.map(f => {
        if (f.id === fixtureId) {
          const broadcaster = (providerId && providerId > 0)
            ? SIMPLE_BROADCASTERS.find(b => b.id === providerId)?.name
            : undefined;
          const isBlackout = providerId === 999;
          return { ...f, broadcaster, isBlackout, providerId: providerId || undefined };
        }
        return f;
      }));
      
      // Remove from pending changes
      setPendingChanges(prev => {
        const newChanges = new Map(prev);
        newChanges.delete(fixtureId);
        return newChanges;
      });
      
      const broadcasterName = (providerId === 999)
        ? '🚫 Blackout'
        : (providerId ? (SIMPLE_BROADCASTERS.find(b => b.id === providerId)?.name || 'Unknown') : 'TBD');
      showMessage(`Successfully updated broadcaster to ${broadcasterName}`, 'success');
      
    } catch (err) {
      console.error('Failed to save broadcast:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (isMountedRef.current) {
        showMessage(`Failed to save broadcaster: ${errorMessage}`, 'error');
      }
    } finally {
      if (isMountedRef.current) {
        setSavingFixtures(prev => {
          const newSet = new Set(prev);
          newSet.delete(fixtureId);
          return newSet;
        });
      }
    }
  };

  const handleCompetitionVisibilityChange = async (competitionId: number, isVisible: boolean) => {
    try {
      await saveCompetitionVisibility(competitionId, isVisible);
      
      // Update local state
      setCompetitions(prev => prev.map(comp => 
        comp.id === competitionId 
          ? { ...comp, is_production_visible: isVisible }
          : comp
      ));
      
      const compName = competitions.find(c => c.id === competitionId)?.name || 'Competition';
      showMessage(`${compName} is now ${isVisible ? 'visible' : 'hidden'} on the public site`, 'success');
      
    } catch (err) {
      console.error('Failed to save competition visibility:', err);
      showMessage('Failed to save competition visibility', 'error');
    }
  };

  const getMatchweekOptions = () => {
    const matchweeks = new Set<number>();
    fixtures.forEach(f => {
      if (f.matchweek) matchweeks.add(f.matchweek);
    });
    return Array.from(matchweeks).sort((a, b) => a - b);
  };

  const handleSaveAll = async () => {
    if (pendingChanges.size === 0) return;
    
    const changeEntries = Array.from(pendingChanges.entries());
    let successCount = 0;
    let errorCount = 0;
    
    setSavingFixtures(prev => {
      const newSet = new Set(prev);
      changeEntries.forEach(([fixtureId]) => newSet.add(fixtureId));
      return newSet;
    });
    
    for (const [fixtureId, providerId] of changeEntries) {
      try {
        await saveBroadcaster(fixtureId, providerId);
        successCount++;
        
        if (isMountedRef.current) {
          setFixtures(prev => prev.map(f => {
            if (f.id === fixtureId) {
              const broadcaster = (providerId && providerId > 0)
                ? SIMPLE_BROADCASTERS.find(b => b.id === providerId)?.name
                : undefined;
              const isBlackout = providerId === 999;
              return { ...f, broadcaster, isBlackout, providerId: providerId || undefined };
            }
            return f;
          }));
        }
      } catch (err) {
        console.error(`Failed to save fixture ${fixtureId}:`, err);
        errorCount++;
      }
    }
    
    if (isMountedRef.current) {
      setPendingChanges(new Map());
      setSavingFixtures(new Set());
      
      if (errorCount === 0) {
        showMessage(`Successfully saved all ${successCount} changes`, 'success');
      } else if (successCount === 0) {
        showMessage(`Failed to save ${errorCount} changes`, 'error');
      } else {
        showMessage(`Saved ${successCount} changes, ${errorCount} failed`, 'error');
      }
    }
  };

  const formatDateTime = (utcKickoff: string) => {
    const date = new Date(utcKickoff);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    });
  };

  const selectedCompetition = competitions.find(c => c.id === selectedCompetitionId);

  if (loading && competitions.length === 0) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <div className="container">
            <h1>Broadcast Admin - Football TV Schedule</h1>
            <p>Manage TV broadcaster assignments and competition visibility</p>
          </div>
        </header>
        
        <main className="container">
          <div className="loading">Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <div className="container">
            <h1>Broadcast Admin - Football TV Schedule</h1>
            <p>Manage TV broadcaster assignments and competition visibility</p>
          </div>
        </header>
        
        <main className="container">
          <div className="error">{error}</div>
          <button onClick={() => loadFixtures()} className="save-btn">Retry</button>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container">
          <h1>Broadcast Admin - Football TV Schedule</h1>
          <p>Manage TV broadcaster assignments and competition visibility</p>
          <div style={{ marginTop: '10px' }}>
            <a href="/" style={{ color: '#6366f1', textDecoration: 'underline', fontSize: '0.9rem' }}>
              ← Back to Schedule
            </a>
          </div>
        </div>
      </header>
      
      <main className="container">
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Competition Overview Section */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
            Competition Overview
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            {competitions.map(competition => (
              <div key={competition.id} style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                      {competition.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                      {competition.short_name} • ID: {competition.id}
                    </p>
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                    Public Visibility
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`visibility-${competition.id}`}
                        checked={competition.is_production_visible === true}
                        onChange={() => handleCompetitionVisibilityChange(competition.id, true)}
                      />
                      <span style={{ fontSize: '14px' }}>Visible</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`visibility-${competition.id}`}
                        checked={competition.is_production_visible === false}
                        onChange={() => handleCompetitionVisibilityChange(competition.id, false)}
                      />
                      <span style={{ fontSize: '14px' }}>Hidden</span>
                    </label>
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  backgroundColor: competition.is_production_visible ? '#f0fdf4' : '#fef2f2',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  <strong>Status:</strong> {competition.is_production_visible ? 'Visible to public' : 'Hidden from public'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Broadcaster Management Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#1f2937' }}>
              Broadcaster Management
            </h2>
            <button 
              onClick={() => setShowBroadcastEditor(true)}
              className="save-btn"
              style={{ fontSize: '14px' }}
            >
              📺 Manage Broadcasters
            </button>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 16px 0' }}>
            Current broadcasters: {SIMPLE_BROADCASTERS.map(b => b.name).join(', ')}
          </p>
        </div>

        {/* Competition Filter */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Competition
          </label>
          <select 
            value={selectedCompetitionId} 
            onChange={(e) => setSelectedCompetitionId(Number(e.target.value))}
            className="filter-select"
            style={{ minWidth: '200px' }}
          >
            {competitions.map(comp => (
              <option key={comp.id} value={comp.id}>
                {comp.name} ({comp.is_production_visible ? 'Visible' : 'Hidden'})
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-number total">{getStats().total}</div>
            <div className="stats-label">Total</div>
          </div>
          <div className="stats-card">
            <div className="stats-number confirmed">{getStats().confirmed}</div>
            <div className="stats-label">Confirmed</div>
          </div>
          <div className="stats-card">
            <div className="stats-number pending">{getStats().tbd}</div>
            <div className="stats-label">TBD</div>
          </div>
          <div className="stats-card">
            <div className="stats-number" style={{ color: '#dc2626' }}>{getStats().blackout}</div>
            <div className="stats-label">Blackout</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="filter-select"
          >
            <option value="upcoming">Upcoming fixtures</option>
            <option value="all">All fixtures</option>
          </select>

          <select 
            value={monthFilter} 
            onChange={(e) => setMonthFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All months</option>
            {getMonthOptions().map(month => (
              <option key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>

          {selectedCompetition?.id === 1 && (
            <select 
              value={matchweekFilter} 
              onChange={(e) => setMatchweekFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All matchweeks</option>
              {getMatchweekOptions().map(week => (
                <option key={week} value={week}>
                  Matchweek {week}
                </option>
              ))}
            </select>
          )}

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
            className="filter-select"
          >
            <option value="">All fixtures</option>
            <option value="confirmed">Confirmed broadcaster</option>
            <option value="tbd">TBD (awaiting announcement)</option>
            <option value="blackout">Blackout (No UK TV)</option>
          </select>

          <button onClick={() => loadFixtures(true)} className="save-btn">
            🔄 Refresh
          </button>

          {pendingChanges.size > 1 && (
            <button onClick={handleSaveAll} className="save-btn save-all-btn">
              💾 Save All ({pendingChanges.size})
            </button>
          )}

          <div>
            <strong>
              {selectedCompetition ? selectedCompetition.name : 'All Competitions'}: {filteredFixtures.length} of {fixtures.length}
            </strong>
            {pendingChanges.size > 0 && <span> | Pending changes: {pendingChanges.size}</span>}
          </div>
        </div>

        {/* Fixtures Table */}
        <div className="fixtures-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Match</th>
                <th>Broadcaster</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFixtures.map(fixture => {
                const hasPendingChange = pendingChanges.has(fixture.id);
                const isSaving = savingFixtures.has(fixture.id);
                const currentProviderId = fixture.providerId || null;
                const pendingProviderId = pendingChanges.has(fixture.id) 
                  ? pendingChanges.get(fixture.id) 
                  : currentProviderId;
                const dropdownValue = (pendingProviderId || pendingProviderId === 0)
                  ? String(pendingProviderId)
                  : '';
                
                return (
                  <tr key={fixture.id} className="fixture-row">
                    <td className="match-time">
                      {formatDateTime(fixture.kickoff_utc)}
                    </td>
                    <td className="match-info">
                      <div>{fixture.home_team} vs {fixture.away_team}</div>
                      {fixture.matchweek && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                          MW {fixture.matchweek}
                        </div>
                      )}
                      {fixture.stage && fixture.round && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                          {fixture.stage} - {fixture.round}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="broadcast-status">
                        {fixture.isBlackout ? '🚫 Blackout' : (fixture.broadcaster || 'TBD')}
                      </div>
                    </td>
                    <td>
                      <div className="broadcast-editor">
                        <select
                          aria-label={`Select broadcaster for ${fixture.home_team} vs ${fixture.away_team}`}
                          value={dropdownValue}
                          onChange={(e) => handleProviderChange(fixture.id, e.target.value)}
                          className="broadcast-select"
                          disabled={isSaving}
                        >
                          <option value="">-- Select broadcaster --</option>
                          {SIMPLE_BROADCASTERS.map(broadcaster => (
                            <option key={broadcaster.id} value={broadcaster.id}>
                              {broadcaster.name}
                            </option>
                          ))}
                        </select>
                        
                        {hasPendingChange && (
                          <button
                            onClick={() => handleSaveBroadcast(fixture.id)}
                            disabled={isSaving}
                            className="save-btn save-btn-small"
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {fixtures.length === 0 ? (
          <div className="no-fixtures">
            <p>No fixtures found for {selectedCompetition?.name}.</p>
          </div>
        ) : filteredFixtures.length === 0 && (
          <div className="no-fixtures">
            <p>No fixtures match the current filters.</p>
          </div>
        )}
      </main>

      <BroadcastEditor
        isOpen={showBroadcastEditor}
        onClose={() => setShowBroadcastEditor(false)}
        onSave={(broadcasters) => {
          console.log('Updated broadcasters:', broadcasters);
          setShowBroadcastEditor(false);
        }}
      />
    </div>
  );
};

// Wrap the AdminPage with authentication
const AuthenticatedAdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // In development (localhost), skip authentication
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setIsAuthenticated(true);
        setAuthChecked(true);
        return;
      }

      // In production, require authentication
      const token = localStorage.getItem('adminToken');
      const expiry = localStorage.getItem('adminTokenExpiry');
      
      if (token && expiry && Date.now() < parseInt(expiry)) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminTokenExpiry');
        setIsAuthenticated(false);
      }
      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (!authChecked) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return <AdminPage />;
};

export default AuthenticatedAdminPage;