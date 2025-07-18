/**
 * Patients Hook - Following Stability Framework Structure
 * Uses useTypeSafeModuleTemplate for consistency
 */

import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';

const patientsConfig = {
  tableName: 'profiles',
  moduleName: 'Patients',
  requiredFields: ['first_name', 'email'],
  customValidation: (data: any) => {
    // Filter only patient profiles
    return data.first_name && data.email;
  }
};

export const usePatients = () => {
  const templateResult = useTypeSafeModuleTemplate(patientsConfig);

  return {
    ...templateResult,
    // Add any patient-specific methods here if needed
    meta: {
      ...templateResult.meta,
      moduleType: 'patients',
      description: 'Patient profiles and healthcare data management'
    }
  };
};