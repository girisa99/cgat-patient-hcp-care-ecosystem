/**
 * Main Facilities Hook - Uses consolidated approach with real database data
 * Following the unified user management pattern - NO MOCK DATA
 */
import { useFacilityData } from './facilities/useFacilityData';
import { useFacilityMutations } from './facilities/useFacilityMutations';

// Sync type with useRealFacilities hook (could be moved to a shared file)
export interface Facility {
  id: string;
  name: string;
  facility_type: string;
  address?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  npi_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useFacilities = () => {
  const { data: facilities, isLoading, error, refetch } = useFacilityData();
  const mutations = useFacilityMutations();

  // Calculate facility statistics from real data
  const getFacilityStats = () => {
    const base: Record<string, number> = {};
    const byType = (facilities ?? []).reduce<Record<string, number>>((acc, facility) => {
      const type = facility.facility_type ?? 'unknown';
      acc[type] = (acc[type] ?? 0) + 1;
      return acc;
    }, base);

    return {
      total: facilities?.length ?? 0,
      active: (facilities ?? []).filter((f) => f.is_active !== false).length,
      byType
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
  const createFacility = async (facilityData: Partial<Facility>) => {
    console.log('🏥 Create facility requested:', facilityData);
    // This would be implemented with actual API calls
    return Promise.resolve();
  };

  // Update facility function (placeholder)
  const updateFacility = async (id: string, facilityData: Partial<Facility>) => {
    console.log('🏥 Update facility requested:', id, facilityData);
    // This would be implemented with actual API calls
    return Promise.resolve();
  };

  return {
    // Data
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
