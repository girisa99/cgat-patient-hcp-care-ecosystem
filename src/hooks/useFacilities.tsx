
/**
 * Main Facilities Hook - Uses consolidated approach with real database data
 * Following the unified user management pattern - NO MOCK DATA
 */
import { useFacilityData } from './facilities/useFacilityData';
import { useFacilityMutations } from './facilities/useFacilityMutations';

export const useFacilities = () => {
  const { data: facilities, isLoading, error, refetch } = useFacilityData();
  const mutations = useFacilityMutations();

  // Calculate facility statistics from real data
  const getFacilityStats = () => {
    const stats = {
      total: facilities?.length || 0,
      active: facilities?.filter(f => f.is_active !== false).length || 0,
      inactive: facilities?.filter(f => f.is_active === false).length || 0,
      typeBreakdown: facilities?.reduce((acc, facility) => {
        const type = facility.facility_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    };
    return stats;
  };

  const searchFacilities = (query: string) => {
    if (!query.trim()) return facilities || [];
    
    return (facilities || []).filter((facility: any) => 
      facility.name?.toLowerCase().includes(query.toLowerCase()) ||
      facility.facility_type?.toLowerCase().includes(query.toLowerCase()) ||
      facility.address?.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    facilities: facilities || [],
    isLoading,
    error,
    refetch,
    getFacilityStats,
    searchFacilities,
    ...mutations,
    // Meta information for consistency with unified system
    meta: {
      totalFacilities: facilities?.length || 0,
      dataSource: 'facilities table via direct query',
      lastFetch: new Date().toISOString(),
      version: 'consolidated-v1'
    }
  };
};

// Re-export individual hooks for direct use
export { useFacilityData } from './facilities/useFacilityData';
export { useFacilityMutations } from './facilities/useFacilityMutations';
