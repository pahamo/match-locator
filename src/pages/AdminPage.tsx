import React, { useState, useEffect, useRef } from 'react';
import {
  getSimpleFixtures,
  saveBroadcaster,
  SIMPLE_BROADCASTERS
} from '../services/supabase-simple';
import type { SimpleFixture } from '../types';

type FilterStatus = '' | 'confirmed' | 'tbd';
type TimeFilter = '' | 'upcoming' | 'all';

const AdminPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<SimpleFixture[]>([]);
  const [filteredFixtures, setFilteredFixtures] = useState<SimpleFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<number, number | null>>(new Map());
  const [savingFixtures, setSavingFixtures] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('');
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [matchweekFilter, setMatchweekFilter] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');
  const messageTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const isBlackout = (fixtureId: number): boolean => {
    try {
      const blackoutFixtures = JSON.parse(localStorage.getItem('blackoutFixtures') || '[]');
      return Array.isArray(blackoutFixtures) && blackoutFixtures.includes(fixtureId);
    } catch {
      return false;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // In React StrictMode (dev), components mount/unmount/mount; reset flag on each mount
    isMountedRef.current = true;
    loadFixtures();
    return () => {
      isMountedRef.current = false;
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
        messageTimeoutRef.current = null;
      }
    };
  }, []);

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
        // Use actual matchweek data from database
        filtered = filtered.filter(f => f.matchweek === matchweek);
      }
    }

    if (statusFilter === 'confirmed') {
      filtered = filtered.filter(f => !!f.broadcaster);
    } else if (statusFilter === 'tbd') {
      filtered = filtered.filter(f => !f.broadcaster);
    }

    setFilteredFixtures(filtered);
  }, [fixtures, statusFilter, monthFilter, matchweekFilter, timeFilter]);

  const loadFixtures = async (confirmIfPending: boolean = false) => {
    if (confirmIfPending && pendingChanges.size > 0) {
      const proceed = window.confirm('You have unsaved changes. Refreshing will discard them. Continue?');
      if (!proceed) return;
    }
    try {
      setLoading(true);
      setError(null);
      const fixturesData = await getSimpleFixtures();
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
  };

  

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
    const confirmed = filteredFixtures.filter(f => !!f.broadcaster).length;
    const tbd = total - confirmed;
    return { total, confirmed, tbd };
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
    const currentProviderId = isBlackout(fixtureId)
      ? -1
      : (fixture?.broadcaster 
          ? SIMPLE_BROADCASTERS.find(b => b.name === fixture.broadcaster)?.id 
          : null);
    
    const parsed = providerId === '' ? null : Number.parseInt(providerId, 10);
    const selectedProviderId = parsed === null || Number.isNaN(parsed) ? null : parsed;
    
    console.log('Provider change:', { fixtureId, currentProviderId, selectedProviderId, providerId });
    
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

    console.log('Saving broadcast:', { fixtureId, providerId });

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
          console.log('Updated fixture broadcaster:', { fixtureId, broadcaster });
          return { ...f, broadcaster };
        }
        return f;
      }));
      
      // Remove from pending changes
      setPendingChanges(prev => {
        const newChanges = new Map(prev);
        newChanges.delete(fixtureId);
        return newChanges;
      });
      
      const broadcasterName = (providerId === -1)
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

  const getMatchweekOptions = () => {
    // Get actual matchweeks from fixture data
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
    
    // Set all pending fixtures as saving
    setSavingFixtures(prev => {
      const newSet = new Set(prev);
      changeEntries.forEach(([fixtureId]) => newSet.add(fixtureId));
      return newSet;
    });
    
    // Process all changes
    for (const [fixtureId, providerId] of changeEntries) {
      try {
        await saveBroadcaster(fixtureId, providerId);
        successCount++;
        
        // Update local fixture data
        if (isMountedRef.current) {
          setFixtures(prev => prev.map(f => {
            if (f.id === fixtureId) {
              const broadcaster = (providerId && providerId > 0)
                ? SIMPLE_BROADCASTERS.find(b => b.id === providerId)?.name
                : undefined;
              return { ...f, broadcaster };
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
      // Clear all pending changes after processing
      setPendingChanges(new Map());
      
      // Clear saving state
      setSavingFixtures(new Set());
      
      // Show summary message
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

  if (loading) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <div className="container">
            <h1>Broadcast Admin - Premier League TV Schedule</h1>
            <p>Manage TV broadcaster assignments for upcoming fixtures</p>
          </div>
        </header>
        
        <main className="container">
          <div className="loading">Loading fixtures...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <div className="container">
            <h1>Broadcast Admin - Premier League TV Schedule</h1>
            <p>Manage TV broadcaster assignments for upcoming fixtures</p>
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
          <h1>Broadcast Admin - Premier League TV Schedule</h1>
          <p>Simple broadcaster assignments: Sky Sports & TNT Sports</p>
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

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
            className="filter-select"
          >
            <option value="">All fixtures</option>
            <option value="confirmed">Confirmed broadcaster</option>
            <option value="tbd">TBD (awaiting announcement)</option>
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
            <strong>Showing: {filteredFixtures.length} of {fixtures.length}</strong>
            {pendingChanges.size > 0 && <span> | Pending changes: {pendingChanges.size}</span>}
          </div>
        </div>

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
                const currentProviderId = isBlackout(fixture.id)
                  ? -1
                  : (fixture.broadcaster 
                      ? SIMPLE_BROADCASTERS.find(b => b.name === fixture.broadcaster)?.id 
                      : null);
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
                    </td>
                    <td>
                      <div className="broadcast-status">
                        {isBlackout(fixture.id) ? '🚫 Blackout' : (fixture.broadcaster || 'TBD')}
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
                          <option value="-1">🚫 Blackout (No UK TV)</option>
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
            <p>No fixtures found.</p>
          </div>
        ) : filteredFixtures.length === 0 && (
          <div className="no-fixtures">
            <p>No fixtures match the current filters.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
