/**
 * Generic hook for dynamic data loading
 * This pattern ensures any new data added to the database is automatically available
 * across all components without manual updates
 */

import { useState, useEffect, useCallback } from 'react';

interface UseDynamicDataOptions<T> {
  /** The async function that loads the data */
  loader: () => Promise<T>;
  /** Dependencies that trigger a reload when changed */
  dependencies?: any[];
  /** Whether to automatically load on mount (default: true) */
  autoLoad?: boolean;
  /** Error message prefix for logging */
  errorContext?: string;
}

interface UseDynamicDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDynamicData<T>(options: UseDynamicDataOptions<T>): UseDynamicDataReturn<T> {
  const {
    loader,
    dependencies = [],
    autoLoad = true,
    errorContext = 'data loading'
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await loader();
      setData(result);
    } catch (err) {
      console.error(`Failed ${errorContext}:`, err);
      setError(err instanceof Error ? err.message : `Failed ${errorContext}`);
    } finally {
      setLoading(false);
    }
  }, [loader, errorContext]);

  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [loadData, autoLoad, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: loadData
  };
}

/**
 * Example usage patterns:
 *
 * // Load competitions dynamically
 * const { data: competitions } = useDynamicData({
 *   loader: () => getSimpleCompetitions(false),
 *   errorContext: 'loading competitions'
 * });
 *
 * // Load teams for a specific competition
 * const { data: teams } = useDynamicData({
 *   loader: () => getTeamsByCompetition(competitionId),
 *   dependencies: [competitionId],
 *   errorContext: 'loading teams'
 * });
 *
 * // Load broadcasters dynamically
 * const { data: broadcasters } = useDynamicData({
 *   loader: () => getBroadcasters(),
 *   errorContext: 'loading broadcasters'
 * });
 */