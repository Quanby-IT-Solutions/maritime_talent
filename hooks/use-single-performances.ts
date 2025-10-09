import { useState, useEffect, useCallback } from 'react';
import { SingleData } from '@/components/single-performance/single-column-def';

interface UseSinglePerformancesReturn {
  singles: SingleData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateSingle: (single: SingleData) => Promise<{ success: boolean; error?: string }>;
  deleteSingle: (singleId: string) => Promise<{ success: boolean; error?: string }>;
}

export function useSinglePerformances(): UseSinglePerformancesReturn {
  const [singles, setSingles] = useState<SingleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSingles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/single_performance');
      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to fetch singles');
        return;
      }

      setSingles(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSingle = useCallback(async (single: SingleData) => {
    try {
      const response = await fetch('/api/single_performance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          single_id: single.single_id,
          performance_title: single.performance_title,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to update single' };
      }

      // Update local state
      setSingles(prev => 
        prev.map(s => s.single_id === single.single_id ? single : s)
      );

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error occurred' 
      };
    }
  }, []);

  const deleteSingle = useCallback(async (singleId: string) => {
    try {
      const response = await fetch(`/api/single_performance?single_id=${singleId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to delete single' };
      }

      // Update local state
      setSingles(prev => prev.filter(s => s.single_id !== singleId));

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error occurred' 
      };
    }
  }, []);

  useEffect(() => {
    fetchSingles();
  }, [fetchSingles]);

  return {
    singles,
    loading,
    error,
    refetch: fetchSingles,
    updateSingle,
    deleteSingle,
  };
}
