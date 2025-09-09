import React, { useState, useEffect, useRef } from 'react';
import { 
  getSimpleFixtures,
  saveBroadcaster,
  SIMPLE_BROADCASTERS,
  type SimpleFixture 
} from '../services/supabase-simple';

const AdminPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<SimpleFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<number, number | null>>(new Map());
  const [savingFixtures, setSavingFixtures] = useState<Set<number>>(new Set());
  const messageTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

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
    const currentProviderId = fixture?.broadcaster 
      ? SIMPLE_BROADCASTERS.find(b => b.name === fixture.broadcaster)?.id 
      : null;
    
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
          const broadcaster = providerId ? SIMPLE_BROADCASTERS.find(b => b.id === providerId)?.name : undefined;
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
      
      const broadcasterName = providerId ? SIMPLE_BROADCASTERS.find(b => b.id === providerId)?.name || 'Unknown' : 'TBD';
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

        <div className="filter-bar">
          <div>
            <strong>Fixtures loaded: {fixtures.length}</strong>
            {pendingChanges.size > 0 && <span> | Pending changes: {pendingChanges.size}</span>}
          </div>
          <button onClick={() => loadFixtures(true)} className="save-btn">
            🔄 Refresh
          </button>
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
              {fixtures.map(fixture => {
                const hasPendingChange = pendingChanges.has(fixture.id);
                const isSaving = savingFixtures.has(fixture.id);
                const currentProviderId = fixture.broadcaster 
                  ? SIMPLE_BROADCASTERS.find(b => b.name === fixture.broadcaster)?.id 
                  : null;
                const pendingProviderId = pendingChanges.has(fixture.id) 
                  ? pendingChanges.get(fixture.id) 
                  : currentProviderId;
                const dropdownValue = pendingProviderId ? pendingProviderId.toString() : '';
                
                return (
                  <tr key={fixture.id} className="fixture-row">
                    <td className="match-time">
                      {formatDateTime(fixture.kickoff_utc)}
                    </td>
                    <td className="match-info">
                      <div>{fixture.home_team} vs {fixture.away_team}</div>
                    </td>
                    <td>
                      <div className="broadcast-status">
                        {fixture.broadcaster || 'TBD'}
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

        {fixtures.length === 0 && (
          <div className="no-fixtures">
            <p>No fixtures found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
