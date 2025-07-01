
import { useApiServiceData } from './api/useApiServiceData';
import { useApiServiceMutations } from './api/useApiServiceMutations';

/**
 * Main API Services Hook - Now uses consolidated approach
 * Following the unified user management pattern
 */
export const useApiServices = () => {
  const { data: apiServices, isLoading, error, refetch } = useApiServiceData();
  const mutations = useApiServiceMutations();

  const getApiServiceStats = () => {
    const stats = {
      total: apiServices?.length || 0,
      active: apiServices?.filter(s => s.status === 'active').length || 0,
      inactive: apiServices?.filter(s => s.status !== 'active').length || 0,
      typeBreakdown: apiServices?.reduce((acc, service) => {
        const type = service.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    };
    return stats;
  };

  const searchApiServices = (query: string) => {
    if (!query.trim()) return apiServices || [];
    
    return (apiServices || []).filter((service: any) => 
      service.name?.toLowerCase().includes(query.toLowerCase()) ||
      service.description?.toLowerCase().includes(query.toLowerCase()) ||
      service.category?.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    apiServices: apiServices || [],
    isLoading,
    error,
    refetch,
    getApiServiceStats,
    searchApiServices,
    ...mutations,
    // Meta information consistent with unified system
    meta: {
      totalServices: apiServices?.length || 0,
      dataSource: 'api_integration_registry table via direct query',
      lastFetch: new Date().toISOString(),
      version: 'consolidated-v1'
    }
  };
};
