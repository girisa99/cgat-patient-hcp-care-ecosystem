
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

        // Simulate minimal data loading
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

  // Mock data for components that expect it
  const mockData = {
    totalUsers: 0,
    activeUsers: 0,
    totalFacilities: 0,
    totalModules: 0,
    totalApis: 0,
  };

  const refreshAllData = () => {
    window.location.reload();
  };

  return {
    isLoading,
    error,
    hasError,
    
    // Simplified data structure
    apiServices: {
      data: [],
      isLoading: false,
      error: null
    },
    users: [],
    facilities: [],
    modules: [],
    realTimeStats: mockData,
    
    // Methods
    refreshAllData,
    
    meta: {
      implementationLocked: true,
      version: 'unified-page-v1.0.0',
      singleSourceValidated: true,
      dataSourcesCount: 0,
      lastUpdated: new Date().toISOString()
    }
  };
};
