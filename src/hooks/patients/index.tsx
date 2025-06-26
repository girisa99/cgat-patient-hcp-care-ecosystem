
/**
 * Refactored Patients Hook - Now uses smaller, focused modules
 */
import { usePatientData } from './usePatientData';
import { usePatientMutations } from './usePatientMutations';

export const usePatients = () => {
  const { data: patients, isLoading, error, refetch } = usePatientData();
  const mutations = usePatientMutations();

  return {
    patients,
    isLoading,
    error,
    refetch,
    ...mutations,
    // Metadata for debugging
    meta: {
      totalPatients: patients?.length || 0,
      dataSource: 'auth.users via manage-user-profiles edge function',
      lastFetch: new Date().toISOString()
    }
  };
};

// Re-export individual hooks for direct use
export { usePatientData } from './usePatientData';
export { usePatientMutations } from './usePatientMutations';
