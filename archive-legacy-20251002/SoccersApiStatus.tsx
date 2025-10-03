/**
 * SoccersAPI Status Component
 * Shows API connection status and usage statistics
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';

interface ApiStatus {
  connected: boolean;
  lastCheck: string;
  errorMessage?: string;
  usageStats?: {
    requestCount: number;
    cacheSize: number;
    lastRequestTime: number;
  };
}

interface SyncStatus {
  running: boolean;
  lastSync?: string;
  lastResult?: {
    syncedCount: number;
    errorCount: number;
    totalFixtures: number;
  };
}

export const SoccersApiStatus: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    connected: false,
    lastCheck: 'Never',
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    running: false,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check API connection status
  const checkApiConnection = async () => {
    setIsChecking(true);
    try {
      // Test connection by trying to fetch leagues
      const response = await fetch('/.netlify/functions/test-soccersapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });

      const result = await response.json();

      setApiStatus({
        connected: result.success,
        lastCheck: new Date().toLocaleString(),
        errorMessage: result.success ? undefined : result.error,
        usageStats: result.stats,
      });
    } catch (error) {
      setApiStatus({
        connected: false,
        lastCheck: new Date().toLocaleString(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Trigger broadcast sync
  const triggerSync = async (dryRun = false) => {
    setIsSyncing(true);
    try {
      const response = await fetch('/.netlify/functions/sync-broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: 20,
          dryRun,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSyncStatus({
          running: false,
          lastSync: new Date().toLocaleString(),
          lastResult: {
            syncedCount: result.syncedCount || 0,
            errorCount: result.errorCount || 0,
            totalFixtures: result.totalFixtures || 0,
          },
        });

        alert(
          dryRun
            ? `Dry run completed: Found ${result.fixturesFound} fixtures needing sync`
            : `Sync completed: ${result.syncedCount} synced, ${result.errorCount} errors`
        );
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      alert(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-check on component mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">SoccersAPI Integration</h2>

      {/* API Connection Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Connection Status</h3>
          <Button
            onClick={checkApiConnection}
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            {isChecking ? 'Checking...' : 'Test Connection'}
          </Button>
        </div>

        <div className="bg-gray-50 rounded p-4">
          <div className="flex items-center mb-2">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                apiStatus.connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className={`font-medium ${
              apiStatus.connected ? 'text-green-700' : 'text-red-700'
            }`}>
              {apiStatus.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="text-sm text-gray-600">
            <p>Last checked: {apiStatus.lastCheck}</p>
            {apiStatus.errorMessage && (
              <p className="text-red-600 mt-1">Error: {apiStatus.errorMessage}</p>
            )}
          </div>

          {apiStatus.usageStats && (
            <div className="mt-3 text-sm">
              <p>Requests made: {apiStatus.usageStats.requestCount}</p>
              <p>Cache entries: {apiStatus.usageStats.cacheSize}</p>
              {apiStatus.usageStats.lastRequestTime > 0 && (
                <p>
                  Last request: {new Date(apiStatus.usageStats.lastRequestTime).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Sync Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Broadcast Sync</h3>

        <div className="bg-gray-50 rounded p-4">
          <div className="flex gap-3 mb-4">
            <Button
              onClick={() => triggerSync(true)}
              disabled={isSyncing || !apiStatus.connected}
              variant="outline"
            >
              {isSyncing ? 'Running...' : 'Dry Run'}
            </Button>

            <Button
              onClick={() => triggerSync(false)}
              disabled={isSyncing || !apiStatus.connected}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSyncing ? 'Running...' : 'Sync Broadcasts'}
            </Button>
          </div>

          {syncStatus.lastSync && (
            <div className="text-sm text-gray-600">
              <p>Last sync: {syncStatus.lastSync}</p>
              {syncStatus.lastResult && (
                <div className="mt-2">
                  <p>
                    Results: {syncStatus.lastResult.syncedCount} synced,{' '}
                    {syncStatus.lastResult.errorCount} errors out of{' '}
                    {syncStatus.lastResult.totalFixtures} fixtures
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 text-sm text-gray-500">
            <p>• Dry Run: Preview what would be synced without making changes</p>
            <p>• Sync: Update broadcast data for fixtures from the next 30 days</p>
            <p>• Only fixtures without existing broadcast data are processed</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-3">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 rounded p-3">
            <div className="font-medium text-blue-700">API Status</div>
            <div className="text-blue-600">
              {apiStatus.connected ? '✅ Ready' : '❌ Not Ready'}
            </div>
          </div>
          <div className="bg-green-50 rounded p-3">
            <div className="font-medium text-green-700">Auto Sync</div>
            <div className="text-green-600">⏰ Coming Soon</div>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      {!apiStatus.connected && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-medium text-yellow-800 mb-2">Setup Required</h4>
          <div className="text-sm text-yellow-700">
            <p className="mb-2">To use SoccersAPI integration:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Verify your SoccersAPI account is active</li>
              <li>Check SOCCERSAPI_EMAIL and SOCCERSAPI_KEY in environment variables</li>
              <li>Ensure your subscription has API access</li>
              <li>Contact support@soccersapi.com if issues persist</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};