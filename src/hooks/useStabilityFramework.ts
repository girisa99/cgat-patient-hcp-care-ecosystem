/**
 * React Hook for Stability Framework Integration
 * Simplified version for immediate use
 */

import { useState, useEffect } from 'react';
import { getStabilityFrameworkStatus } from '@/utils/framework/init';

export interface UseStabilityFrameworkReturn {
  getStatus: () => any;
  loading: boolean;
  error: Error | null;
}

export const useStabilityFramework = (): UseStabilityFrameworkReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      getStabilityFrameworkStatus();
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, []);

  const getStatus = () => {
    try {
      return getStabilityFrameworkStatus();
    } catch (err) {
      console.error('Error getting framework status:', err);
      return null;
    }
  };

  return {
    getStatus,
    loading,
    error
  };
};

export default useStabilityFramework;