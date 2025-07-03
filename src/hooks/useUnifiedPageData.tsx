
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
  const mockStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalFacilities: 0,
    totalModules: 0,
    totalApis: 0,
    totalPermissions: 0,
    total: 0, // Add missing 'total' property
  };

  const refreshAllData = () => {
    window.location.reload();
  };

  // Facilities data structure with all required methods
  const facilities = {
    data: [],
    isLoading: false,
    error: null,
    getFacilityStats: () => ({
      total: 0,
      active: 0,
      inactive: 0,
      byType: {},
      typeBreakdown: {}
    }),
    searchFacilities: (query: string) => [],
    meta: {
      totalFacilities: 0,
      dataSource: 'unified-mock',
      lastUpdated: new Date().toISOString()
    }
  };

  // Users data structure with all required methods
  const users = {
    data: [],
    isLoading: false,
    error: null,
    getUserStats: () => mockStats,
    getPatients: () => [],
    getStaff: () => [],
    getAdmins: () => [],
    searchUsers: (query: string) => [],
    meta: {
      totalUsers: 0,
      dataSource: 'unified-mock',
      lastUpdated: new Date().toISOString()
    }
  };

  // Modules data structure with all required methods
  const modules = {
    data: [],
    isLoading: false,
    error: null,
    getModuleStats: () => ({
      total: 0,
      active: 0,
      byCategory: {}
    }),
    meta: {
      totalModules: 0,
      dataSource: 'unified-mock',
      lastUpdated: new Date().toISOString()
    }
  };

  // API Services data structure with all required methods
  const apiServices = {
    data: [],
    isLoading: false,
    error: null,
    createIntegration: async () => {},
    updateIntegration: async () => {},
    searchApis: (query: string) => [],
    getApiStats: () => ({
      total: 0,
      active: 0,
      byType: {}
    }),
    meta: {
      totalApis: 0,
      dataSource: 'unified-mock',
      lastUpdated: new Date().toISOString()
    }
  };

  return {
    isLoading,
    error,
    hasError,
    
    // Structured data with all required methods
    facilities,
    users,
    modules,
    apiServices,
    realTimeStats: mockStats,
    
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
