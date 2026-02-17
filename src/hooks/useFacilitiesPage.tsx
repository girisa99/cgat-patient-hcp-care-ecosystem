
import { useMasterData } from './useMasterData';
import { useMasterAuth } from './useMasterAuth';

/**
 * Dedicated hook for Facilities page - MASTER DATA INTEGRATION
 */
export const useFacilitiesPage = () => {
  console.log('🔒 Facilities Page Hook - Master data integration active');
  
  const authData = useMasterAuth();
  const masterData = useMasterData();

  return {
    // Primary data sources - MASTER DATA
    facilities: masterData.facilities,
    isLoading: masterData.isLoading,
    error: masterData.error,
    
    // Actions - MASTER DATA (simplified for now)
    createFacility: () => console.log('Create facility - to be implemented'),
    updateFacility: () => console.log('Update facility - to be implemented'),
    
    // Utilities - MASTER DATA
    searchFacilities: masterData.searchFacilities,
    
    // Stats - MASTER DATA
    getFacilityStats: () => ({
      total: masterData.stats.totalFacilities,
      active: masterData.stats.activeFacilities,
      inactive: masterData.stats.totalFacilities - masterData.stats.activeFacilities
    }),
    
    // Status flags - MASTER DATA
    isCreatingFacility: false,
    isUpdatingFacility: false,
    
    // Meta information - MASTER DATA
    meta: {
      dataSource: masterData.meta.dataSource,
      hookVersion: 'master-facilities-v1.0.0',
      singleSourceValidated: true,
      implementationLocked: true
    }
  };
};
