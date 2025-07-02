
import { useFacilities } from './useFacilities';
import { useFacilityData } from './facilities/useFacilityData';

/**
 * Dedicated hook for Facilities page - LOCKED IMPLEMENTATION
 * This hook ensures the Facilities page has consistent data access
 * DO NOT MODIFY - This is the single source of truth for Facilities page
 */
export const useFacilitiesPage = () => {
  console.log('🔒 Facilities Page Hook - Locked implementation active');
  
  // Use consolidated facilities management as single source of truth
  const facilitiesData = useFacilities();
  const facilityDetailsData = useFacilityData();

  // Return consolidated data with clear naming to prevent confusion
  return {
    // Primary data sources - LOCKED
    facilities: facilitiesData.facilities || [],
    isLoading: facilitiesData.isLoading,
    error: facilitiesData.error,
    
    // Actions - LOCKED
    createFacility: facilitiesData.createFacility,
    updateFacility: facilitiesData.updateFacility,
    deleteFacility: facilitiesData.deleteFacility,
    
    // Utilities - LOCKED
    searchFacilities: facilitiesData.searchFacilities,
    getFacilityStats: facilitiesData.getFacilityStats,
    getActiveFacilities: facilitiesData.getActiveFacilities,
    
    // Status flags - LOCKED
    isCreating: facilitiesData.isCreating,
    isUpdating: facilitiesData.isUpdating,
    isDeleting: facilitiesData.isDeleting,
    
    // Meta information - LOCKED
    meta: {
      totalFacilities: facilitiesData.facilities?.length || 0,
      activeFacilities: facilitiesData.getActiveFacilities?.().length || 0,
      dataSource: 'facilities table',
      hookVersion: 'locked-v1.0.0',
      singleSourceValidated: true,
      implementationLocked: true
    }
  };
};
