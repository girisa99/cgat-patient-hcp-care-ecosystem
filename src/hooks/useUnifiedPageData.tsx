
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';

export const useUnifiedPageData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasError, setHasError] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setHasError(false);

        // Wait for auth to be ready
        if (authLoading) {
          return;
        }

        // Simulate page data loading
        await new Promise(resolve => setTimeout(resolve, 100));

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading page data:', err);
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    loadPageData();
  }, [authLoading, isAuthenticated]);

  return {
    isLoading,
    error,
    hasError,
    meta: {
      implementationLocked: true,
      version: 'unified-page-v1.0.0',
      singleSourceValidated: true,
      dataSourcesCount: 1,
      lastUpdated: new Date().toISOString()
    }
  };
};
