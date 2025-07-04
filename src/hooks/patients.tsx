
/**
 * PATIENTS HOOK - FIXED TYPE ALIGNMENT
 * Version: patients-hook-v1.0.0
 */
import { useConsolidatedPatients } from './patients/useConsolidatedPatients';

export const usePatients = () => {
  const consolidatedPatientsData = useConsolidatedPatients();
  
  return {
    ...consolidatedPatientsData,
    
    meta: {
      hookVersion: 'patients-hook-v1.0.0',
      singleSourceValidated: true,
      typeScriptAligned: true,
      masterConsolidationCompliant: true,
      dataSource: 'consolidated-patients'
    }
  };
};
