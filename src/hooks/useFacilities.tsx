
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
import { useFacilityData } from './facilities/useFacilityData';
import { useFacilityMutations } from './facilities/useFacilityMutations';

/**
 * Fully Consolidated Facilities Hook - Using Universal Template
 */
export const useFacilities = () => {
  const config = {
    tableName: 'facilities' as const,
    moduleName: 'Facilities',
    requiredFields: ['name', 'facility_type'],
    customValidation: (data: any) => {
      return !!(data.name && data.facility_type);
    }
  };

  const templateResult = useTypeSafeModuleTemplate(config);
  const { data: facilities, isLoading, error, refetch } = useFacilityData();
  const mutations = useFacilityMutations();

  // Facility-specific search
  const searchFacilities = (query: string) => {
    if (!query.trim()) return facilities || [];
    
    return (facilities || []).filter((facility: any) => 
      facility.name?.toLowerCase().includes(query.toLowerCase()) ||
      facility.facility_type?.toLowerCase().includes(query.toLowerCase()) ||
      facility.address?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Facility statistics
  const getFacilityStats = () => {
    const allFacilities = facilities || [];
    const active = allFacilities.filter(f => f.is_active !== false).length;
    const inactive = allFacilities.length - active;
    
    const typeBreakdown = allFacilities.reduce((acc: any, facility: any) => {
      const type = facility.facility_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: allFacilities.length,
      active,
      inactive,
      typeBreakdown
    };
  };

  return {
    // Core data (backward compatible)
    facilities: facilities || [],
    isLoading,
    error,
    refetch,
    
    // Mutations (backward compatible)
    createFacility: mutations.createFacility,
    updateFacility: mutations.updateFacility,
    isCreatingFacility: mutations.isCreatingFacility,
    isUpdatingFacility: mutations.isUpdatingFacility,
    
    // Enhanced functionality
    searchFacilities,
    getFacilityStats,
    
    // Universal template access
    template: templateResult,
    
    // Comprehensive metadata
    meta: {
      ...templateResult.meta,
      facilityCount: facilities?.length || 0,
      dataSource: 'facilities table (direct)',
      consolidationStatus: 'FULLY_CONSOLIDATED',
      templateVersion: '2.0'
    }
  };
};
