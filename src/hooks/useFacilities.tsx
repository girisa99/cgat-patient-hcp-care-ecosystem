
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';

/**
 * Facilities Hook - Now using Universal Template
 * 
 * Consolidated with the template system while preserving all facility-specific functionality.
 */
export const useFacilities = () => {
  const config = {
    tableName: 'facilities' as const,
    moduleName: 'Facilities',
    requiredFields: ['name', 'facility_type'],
    customValidation: (data: any) => {
      // Validate facility types
      const validTypes = ['hospital', 'clinic', 'pharmacy', 'laboratory', 'imaging_center'];
      return validTypes.includes(data.facility_type);
    }
  };

  const templateResult = useTypeSafeModuleTemplate(config);

  // Facility-specific filtering
  const facilities = templateResult.items.filter((item: any) => 
    item.name && item.facility_type
  );

  // Facility-specific search
  const searchFacilities = (query: string) => {
    if (!query.trim()) return facilities;
    
    return facilities.filter((facility: any) => 
      facility.name?.toLowerCase().includes(query.toLowerCase()) ||
      facility.address?.toLowerCase().includes(query.toLowerCase()) ||
      facility.facility_type?.toLowerCase().includes(query.toLowerCase()) ||
      facility.license_number?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Facility-specific statistics
  const getFacilityStats = () => {
    const stats = templateResult.getStatistics();
    const typeDistribution = facilities.reduce((acc: any, facility: any) => {
      acc[facility.facility_type] = (acc[facility.facility_type] || 0) + 1;
      return acc;
    }, {});
    
    const licensed = facilities.filter((f: any) => f.license_number).length;
    const withNPI = facilities.filter((f: any) => f.npi_number).length;
    
    return {
      ...stats,
      total: facilities.length,
      typeDistribution,
      licensed,
      withNPI,
      hospitals: typeDistribution.hospital || 0,
      clinics: typeDistribution.clinic || 0,
      pharmacies: typeDistribution.pharmacy || 0
    };
  };

  return {
    // Core functionality (backward compatible)
    facilities,
    isLoading: templateResult.isLoading,
    error: templateResult.error,
    refetch: templateResult.refetch,
    
    // Mutations (backward compatible)
    createFacility: templateResult.createItem,
    updateFacility: templateResult.updateItem,
    deleteFacility: templateResult.deleteItem,
    isCreating: templateResult.isCreating,
    isUpdating: templateResult.isUpdating,
    isDeleting: templateResult.isDeleting,
    
    // Enhanced functionality
    searchFacilities,
    getFacilityStats,
    
    // Universal template access
    template: templateResult,
    
    // Metadata
    meta: {
      ...templateResult.meta,
      facilityCount: facilities.length,
      typeDistribution: facilities.reduce((acc: any, facility: any) => {
        acc[facility.facility_type] = (acc[facility.facility_type] || 0) + 1;
        return acc;
      }, {}),
      licensedCount: facilities.filter((f: any) => f.license_number).length
    }
  };
};
