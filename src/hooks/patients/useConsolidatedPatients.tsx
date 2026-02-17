
/**
 * CONSOLIDATED PATIENTS HOOK - SINGLE SOURCE OF TRUTH
 * Uses real patient data exclusively
 * Version: consolidated-patients-v2.0.0
 */
import { useRealPatientData } from './useRealPatientData';

export const useConsolidatedPatients = () => {
  console.log('🏥 Consolidated Patients Hook - Single source using real data');
  
  const realPatientData = useRealPatientData();

  return {
    // Direct pass-through from real patient data
    patients: realPatientData.patients,
    activePatients: realPatientData.activePatients,
    patientStats: realPatientData.patientStats,
    searchPatients: realPatientData.searchPatients,
    getPatientById: realPatientData.getPatientById,
    isLoading: realPatientData.isLoading,
    error: realPatientData.error,
    
    // Meta
    meta: {
      hookName: 'useConsolidatedPatients',
      version: 'consolidated-patients-v2.0.0',
      singleSourceValidated: true,
      dataSource: 'real-patient-data-only',
      consolidationComplete: true
    }
  };
};
