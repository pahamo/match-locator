/**
 * Custom hook for loading competitions dynamically
 * This ensures any new competitions added to the database are automatically available
 * across all components without manual updates
 */

import { useState, useEffect } from 'react';
import { getSimpleCompetitions } from '../services/supabase-simple';
import type { Competition } from '../types';

interface UseCompetitionsOptions {
  /** Whether to include hidden/inactive competitions (default: false) */
  includeHidden?: boolean;
  /** Whether to automatically refetch when dependencies change (default: true) */
  autoRefetch?: boolean;
}

interface UseCompetitionsReturn {
  competitions: Competition[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCompetitions(options: UseCompetitionsOptions = {}): UseCompetitionsReturn {
  const { includeHidden = false, autoRefetch = true } = options;

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      setError(null);

      const competitionsData = await getSimpleCompetitions(includeHidden);
      setCompetitions(competitionsData);
    } catch (err) {
      console.error('Failed to load competitions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load competitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoRefetch) {
      loadCompetitions();
    }
  }, [includeHidden, autoRefetch]);

  return {
    competitions,
    loading,
    error,
    refetch: loadCompetitions
  };
}

/**
 * Hook specifically for production-visible competitions (for public pages)
 */
export function usePublicCompetitions() {
  return useCompetitions({ includeHidden: false });
}

/**
 * Hook specifically for admin competitions (includes hidden ones)
 */
export function useAdminCompetitions() {
  return useCompetitions({ includeHidden: true });
}