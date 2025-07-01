
import { ModuleConfig } from '@/utils/moduleValidation';

/**
 * Patient-specific validation hook
 */
export const usePatientValidation = () => {
  const validatePatientData = (data: any) => {
    const errors: string[] = [];
    
    // Required fields validation
    if (!data.first_name) errors.push('First name is required');
    if (!data.email) errors.push('Email is required');
    if (!data.email?.includes('@')) errors.push('Valid email is required');
    
    // Role validation for patients
    if (!data.role || !['patient', 'patientCaregiver'].includes(data.role)) {
      errors.push('Valid patient role is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validatePatientRole = (userRoles: any[]) => {
    return userRoles?.some((ur: any) => 
      ur.roles?.name === 'patientCaregiver' || ur.roles?.name === 'patient'
    ) || false;
  };

  return {
    validatePatientData,
    validatePatientRole
  };
};
