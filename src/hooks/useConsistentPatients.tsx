
import { usePatientData } from './useUnifiedUserData';
import { usePatientMutations } from './mutations/usePatientMutations';

export const useConsistentPatients = () => {
  const { patients, isLoading, error, refetch, meta } = usePatientData();
  const { deactivatePatient, isDeactivating } = usePatientMutations();

  return {
    patients,
    isLoading,
    error,
    refetch,
    deactivatePatient,
    isDeactivating,
    meta
  };
};
