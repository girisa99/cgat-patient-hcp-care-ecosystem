
import { useFacilityData } from './facilities/useFacilityData';
import { useFacilityMutations } from './facilities/useFacilityMutations';
import { useMemo } from 'react';

export const useFacilities = () => {
  const { data: facilities, isLoading, error, refetch } = useFacilityData();
  const facilityMutations = useFacilityMutations();

  // Calculate facility statistics
  const getFacilityStats = useMemo(() => {
    return () => {
      if (!facilities) {
        return {
          total: 0,
          active: 0,
          inactive: 0,
          typeBreakdown: {}
        };
      }

      const stats = {
        total: facilities.length,
        active: facilities.filter(f => f.is_active).length,
        inactive: facilities.filter(f => !f.is_active).length,
        typeBreakdown: facilities.reduce((acc, facility) => {
          const type = facility.facility_type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      return stats;
    };
  }, [facilities]);

  return {
    facilities: facilities || [],
    isLoading,
    error,
    refetch,
    getFacilityStats,
    ...facilityMutations
  };
};
