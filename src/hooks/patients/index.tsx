
/**
 * Refactored Patients Hook - Now uses smaller, focused modules
 */
// Legacy import removed - use useMasterData instead
// import { usePatientData } from './usePatientData';
import { usePatientMutations } from './usePatientMutations';

export const usePatients = () => {
  // Legacy hook replaced with useMasterData
  // const { data: patients, isLoading, error, refetch } = usePatientData();
  const mutations = usePatientMutations();

  return {
    // Legacy hook return values removed - use useMasterData instead
    // patients,
    // isLoading,
    // error,
    // refetch,
    ...mutations,
    // Metadata for debugging
    meta: {
      // totalPatients: patients?.length || 0,
      dataSource: 'Use useMasterData instead of legacy usePatientData',
      lastFetch: new Date().toISOString()
    }
  };
};

// Re-export individual hooks for direct use
// Legacy hook removed - use useMasterData instead
// export { usePatientData } from './usePatientData';
export { usePatientMutations } from './usePatientMutations';
