
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useApiServices } from './useApiServices';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUnifiedPageData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasError, setHasError] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();

  // Get API services data
  const apiServicesData = useApiServices();

  // Get users data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['unified-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated,
  });

  // Get facilities data
  const { data: facilities = [], isLoading: facilitiesLoading } = useQuery({
    queryKey: ['unified-facilities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .where('is_active', 'eq', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated,
  });

  // Get modules data
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['unified-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .where('is_active', 'eq', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated,
  });

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

  // Calculate real-time stats
  const realTimeStats = {
    totalUsers: users.length,
    activeUsers: users.filter((user: any) => user.is_active !== false).length,
    totalFacilities: facilities.length,
    totalModules: modules.length,
    totalApis: apiServicesData.integrations?.length || 0,
  };

  // Refresh function
  const refreshAllData = () => {
    window.location.reload();
  };

  const combinedLoading = isLoading || usersLoading || facilitiesLoading || modulesLoading || apiServicesData.isLoading;
  const combinedError = error || apiServicesData.error;

  return {
    isLoading: combinedLoading,
    error: combinedError,
    hasError: hasError || !!apiServicesData.error,
    
    // Data properties
    apiServices: {
      data: apiServicesData.integrations || [],
      isLoading: apiServicesData.isLoading,
      error: apiServicesData.error
    },
    users,
    facilities,
    modules,
    realTimeStats,
    
    // Methods
    refreshAllData,
    
    meta: {
      implementationLocked: true,
      version: 'unified-page-v1.0.0',
      singleSourceValidated: true,
      dataSourcesCount: 4, // apiServices, users, facilities, modules
      lastUpdated: new Date().toISOString()
    }
  };
};
