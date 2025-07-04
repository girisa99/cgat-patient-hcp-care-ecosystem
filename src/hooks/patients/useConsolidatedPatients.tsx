
/**
 * CONSOLIDATED PATIENTS HOOK
 * Uses real patient data hook as single source
 */
import { useRealPatientData } from './useRealPatientData';

export const useConsolidatedPatients = () => {
  const realPatientData = useRealPatientData();
  
  console.log('🏥 Consolidated Patients - Using Real Patient Data');
  console.log('🔍 Patient count from consolidated source:', realPatientData.patients.length);

  return {
    patients: realPatientData.patients,
    isLoading: realPatientData.isLoading,
    error: realPatientData.error,
    patientStats: realPatientData.patientStats,
    
    // Utilities
    searchPatients: realPatientData.searchPatients,
    getPatientById: realPatientData.getPatientById,
    
    // Meta information
    meta: {
      dataSource: 'real-patient-data-consolidated',
      patientCount: realPatientData.patients.length,
      hookVersion: 'consolidated-patients-v1.0.0'
    }
  };
};
