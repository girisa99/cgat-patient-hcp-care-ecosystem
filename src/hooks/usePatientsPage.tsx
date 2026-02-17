
/**
 * PATIENTS PAGE HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates patient page functionality
 * Version: patients-page-v1.0.0
 */
import { useConsolidatedPatients } from './patients/useConsolidatedPatients';

export const usePatientsPage = () => {
  console.log('📄 Patients Page Hook - Single source of truth');
  
  const consolidatedData = useConsolidatedPatients();

  return {
    // Direct pass-through from consolidated patients
    patients: consolidatedData.patients,
    activePatients: consolidatedData.activePatients,
    patientStats: consolidatedData.patientStats,
    searchPatients: consolidatedData.searchPatients,
    getPatientById: consolidatedData.getPatientById,
    isLoading: consolidatedData.isLoading,
    error: consolidatedData.error,
    
    // Meta
    meta: {
      hookName: 'usePatientsPage',
      version: 'patients-page-v1.0.0',
      singleSourceValidated: true,
      dataSource: 'consolidated-patients',
      pageReady: true
    }
  };
};
