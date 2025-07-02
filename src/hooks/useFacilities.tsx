
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
    const total = facilities?.length || 0;
    const active = facilities?.filter(f => f.is_active !== false).length || 0;
    const inactive = total - active;
    const byType = facilities?.reduce((acc: any, facility) => {
      const type = facility.facility_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      total,
      active,
      inactive,
      byType,
      typeBreakdown: byType
    };
  };

  // Search facilities function
  const searchFacilities = (query: string) => {
    if (!query.trim()) return facilities || [];
    
    return facilities?.filter(facility => 
      facility.name?.toLowerCase().includes(query.toLowerCase()) ||
      facility.address?.toLowerCase().includes(query.toLowerCase())
    ) || [];
  };

  // Create facility function (placeholder)
  const createFacility = async (facilityData: any) => {
    console.log('🏥 Create facility requested:', facilityData);
    // This would be implemented with actual API calls
    return Promise.resolve();
  };

  // Update facility function (placeholder)
  const updateFacility = async (id: string, facilityData: any) => {
    console.log('🏥 Update facility requested:', id, facilityData);
    // This would be implemented with actual API calls
    return Promise.resolve();
  };

  return {
    // Data
    data: facilities || [],
    facilities: facilities || [],
    isLoading,
    error,
    refetch,
    
    // Actions
    createFacility,
    updateFacility,
    
    // Utilities
    searchFacilities,
    getFacilityStats,
    
    // Status flags
    isCreatingFacility: false,
    isUpdatingFacility: false,
    
    // Meta information
    meta: {
      totalFacilities: facilities?.length || 0,
      dataSource: 'facilities table (real database)',
      lastFetch: new Date().toISOString(),
      version: 'real-data-v1'
    }
  };
};
