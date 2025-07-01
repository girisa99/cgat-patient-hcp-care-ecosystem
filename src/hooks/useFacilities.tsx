
import { useFacilityData } from './facilities/useFacilityData';
import { useFacilityMutations } from './facilities/useFacilityMutations';

export const useFacilities = () => {
  const { data: facilities, isLoading, error, refetch } = useFacilityData();
  const facilityMutations = useFacilityMutations();

  return {
    facilities,
    isLoading,
    error,
    refetch,
    ...facilityMutations
  };
};
