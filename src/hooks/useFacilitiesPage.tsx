
import { useFacilities } from './useFacilities';

/**
 * Dedicated hook for Facilities page - LOCKED IMPLEMENTATION
 * This hook ensures the Facilities page has consistent data access
 * DO NOT MODIFY - This is the single source of truth for Facilities page
 */
export const useFacilitiesPage = () => {
  console.log('🔒 Facilities Page Hook - Locked implementation active');
  
  // Use consolidated facilities hook as single source of truth
  const facilitiesData = useFacilities();

  // Return consolidated data with clear naming to prevent confusion
  return {
    // Primary data sources - LOCKED
    facilities: facilitiesData.facilities || [],
    isLoading: facilitiesData.isLoading,
    error: facilitiesData.error,
    
    // Actions - LOCKED
    refetch: facilitiesData.refetch,
    
    // Utilities - LOCKED
    getFacilityStats: facilitiesData.getFacilityStats,
    searchFacilities: facilitiesData.searchFacilities,
    
    // Meta information - LOCKED
    meta: {
      totalFacilities: facilitiesData.meta.totalFacilities,
      dataSource: facilitiesData.meta.dataSource,
      lastFetch: facilitiesData.meta.lastFetch,
      version: facilitiesData.meta.version,
      hookVersion: 'locked-v1.0.0',
      singleSourceValidated: true,
      implementationLocked: true
    }
  };
};
