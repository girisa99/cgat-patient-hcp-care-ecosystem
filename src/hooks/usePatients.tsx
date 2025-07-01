
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
import { usePatientValidation } from './patients/usePatientValidation';
import { usePatientStats } from './patients/usePatientStats';

/**
 * Fully Consolidated Patients Hook - Using Universal Template
 * 
 * This hook now uses the unified template system while maintaining
 * complete backward compatibility with existing code.
 */
export const usePatients = () => {
  const config = {
    tableName: 'profiles' as const,
    moduleName: 'Patients',
    requiredFields: ['first_name', 'email', 'role'],
    customValidation: (data: any) => {
      // Ensure this is a patient record
      return data.role === 'patient' || data.role === 'patientCaregiver' ||
             data.user_roles?.some((ur: any) => 
               ur.roles?.name === 'patientCaregiver' || ur.roles?.name === 'patient'
             );
    }
  };

  const templateResult = useTypeSafeModuleTemplate(config);
  const { validatePatientData, validatePatientRole } = usePatientValidation();

  // Patient-specific filtering - only show users with patient roles
  const patients = templateResult.items.filter((item: any) => 
    validatePatientRole(item.user_roles || [])
  );

  const { getPatientStatistics } = usePatientStats(patients);

  // Patient-specific search
  const searchPatients = (query: string) => {
    if (!query.trim()) return patients;
    
    return patients.filter((patient: any) => 
      patient.first_name?.toLowerCase().includes(query.toLowerCase()) ||
      patient.last_name?.toLowerCase().includes(query.toLowerCase()) ||
      patient.email?.toLowerCase().includes(query.toLowerCase()) ||
      patient.phone?.includes(query)
    );
  };

  // Enhanced patient creation with validation
  const createPatient = async (data: any) => {
    const validation = validatePatientData(data);
    if (!validation.isValid) {
      throw new Error(`Patient validation failed: ${validation.errors.join(', ')}`);
    }
    return templateResult.createItem(data);
  };

  return {
    // Core functionality (backward compatible)
    patients,
    isLoading: templateResult.isLoading,
    error: templateResult.error,
    refetch: templateResult.refetch,
    
    // Mutations (backward compatible)
    createPatient,
    updatePatient: templateResult.updateItem,
    deletePatient: templateResult.deleteItem,
    isCreating: templateResult.isCreating,
    isUpdating: templateResult.isUpdating,
    isDeleting: templateResult.isDeleting,
    
    // Enhanced functionality
    searchPatients,
    getPatientStats: getPatientStatistics,
    validatePatientData,
    
    // Universal template access
    template: templateResult,
    
    // Comprehensive metadata
    meta: {
      ...templateResult.meta,
      patientCount: patients.length,
      dataSource: 'auth.users via manage-user-profiles edge function',
      patientTypes: {
        caregivers: patients.filter((p: any) => 
          p.user_roles?.some((ur: any) => ur.roles?.name === 'patientCaregiver')
        ).length,
        direct: patients.filter((p: any) => 
          p.user_roles?.some((ur: any) => ur.roles?.name === 'patient')
        ).length
      },
      consolidationStatus: 'FULLY_CONSOLIDATED',
      templateVersion: '2.0'
    }
  };
};
