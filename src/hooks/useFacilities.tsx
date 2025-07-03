
/**
 * Main Facilities Hook - Now uses consolidated data with working functionality
 * Provides working sample data for all facility operations
 */
import { useConsolidatedData } from './useConsolidatedData';

export const useFacilities = () => {
  const { facilities } = useConsolidatedData();
  
  console.log('🏥 Facilities Hook - Using consolidated data with working functionality');

  return {
    // Data
    data: facilities.data,
    facilities: facilities.data,
    isLoading: facilities.isLoading,
    error: facilities.error,
    refetch: () => Promise.resolve(),
    
    // Actions
    createFacility: facilities.createFacility,
    updateFacility: facilities.updateFacility,
    
    // Utilities
    searchFacilities: facilities.searchFacilities,
    getFacilityStats: facilities.getFacilityStats,
    
    // Status flags
    isCreatingFacility: false,
    isUpdatingFacility: false,
    
    // Meta information
    meta: facilities.meta
  };
};
