
import { useConsolidatedPatients } from './patients/useConsolidatedPatients';

/**
 * Main Patients Hook - Now uses consolidated approach
 * Following "Update First" principle - leverages existing architecture
 */
export const usePatients = () => {
  const consolidated = useConsolidatedPatients();

  console.log('🔄 usePatients - Using consolidated approach:', {
    patientCount: consolidated.patients.length,
    dataSource: consolidated.meta.dataSource
  });

  return {
    // Primary data
    patients: consolidated.patients,
    isLoading: consolidated.isLoading,
    error: consolidated.error,
    
    // Utilities
    searchPatients: consolidated.searchPatients,
    getPatientStats: consolidated.getPatientStats,
    
    // Meta
    meta: consolidated.meta,
    
    // Legacy compatibility
    items: consolidated.patients,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    createItem: () => Promise.resolve({}),
    updateItem: () => Promise.resolve({}),
    deleteItem: () => Promise.resolve()
  };
};
