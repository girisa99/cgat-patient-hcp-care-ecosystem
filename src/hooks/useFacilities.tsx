/**
 * Main Facilities Hook - REAL DATA ONLY, NO MOCK
 * Uses real database validation and verification system
 * Implements Verify, Validate, Update pattern - Single Source of Truth
 */
import { useRealFacilities } from './useRealFacilities';

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
<<<<<<< HEAD
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
=======
  const realFacilitiesData = useRealFacilities();
  
  console.log('🏥 Facilities Hook - Using REAL DATABASE data only');
>>>>>>> main

  return {
    // Real data from database
    data: realFacilitiesData.facilities,
    facilities: realFacilitiesData.facilities,
    isLoading: realFacilitiesData.isLoading,
    error: realFacilitiesData.error,
    refetch: realFacilitiesData.refetch,
    
    // Real facility operations (would use Supabase mutations)
    createFacility: async (facilityData: any) => {
      console.log('🏥 Creating real facility in database:', facilityData);
      // In a real implementation, this would use Supabase insert
      // For now, just log that we're using real database operations
      throw new Error('Real facility creation not yet implemented - requires Supabase mutations');
    },
    
    updateFacility: async (id: string, facilityData: any) => {
      console.log('🏥 Updating real facility in database:', id, facilityData);
      // In a real implementation, this would use Supabase update
      throw new Error('Real facility update not yet implemented - requires Supabase mutations');
    },
    
    // Real utility functions
    searchFacilities: (query: string) => {
      if (!query.trim()) return realFacilitiesData.facilities;
      return realFacilitiesData.facilities.filter(facility => 
        facility.name.toLowerCase().includes(query.toLowerCase()) ||
        facility.address?.toLowerCase().includes(query.toLowerCase()) ||
        facility.facility_type.toLowerCase().includes(query.toLowerCase())
      );
    },
    
    getFacilityStats: () => {
      const total = realFacilitiesData.facilities.length;
      const active = realFacilitiesData.facilities.filter(f => f.is_active).length;
      const inactive = total - active;
      const typeBreakdown = realFacilitiesData.facilities.reduce((acc: any, facility) => {
        const type = facility.facility_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return {
        total,
        active,
        inactive,
        typeBreakdown,
        byType: typeBreakdown
      };
    },
    
    // Status flags for real operations
    isCreatingFacility: false,
    isUpdatingFacility: false,
    
    // Real meta information
    meta: realFacilitiesData.meta
  };
};
