
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';

/**
 * Patients Hook - Now using Universal Template
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
      return data.role === 'patient' || data.role === 'patientCaregiver';
    }
  };

  const templateResult = useTypeSafeModuleTemplate(config);

  // Patient-specific filtering
  const patients = templateResult.items.filter((item: any) => 
    item.role === 'patient' || item.role === 'patientCaregiver'
  );

  // Patient-specific search
  const searchPatients = (query: string) => {
    if (!query.trim()) return patients;
    
    return patients.filter((patient: any) => 
      patient.first_name?.toLowerCase().includes(query.toLowerCase()) ||
      patient.last_name?.toLowerCase().includes(query.toLowerCase()) ||
      patient.email?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Patient-specific statistics
  const getPatientStats = () => {
    const stats = templateResult.getStatistics();
    const caregivers = patients.filter((p: any) => p.role === 'patientCaregiver').length;
    const directPatients = patients.filter((p: any) => p.role === 'patient').length;
    
    return {
      ...stats,
      total: patients.length,
      caregivers,
      directPatients
    };
  };

  return {
    // Core functionality (backward compatible)
    patients,
    isLoading: templateResult.isLoading,
    error: templateResult.error,
    refetch: templateResult.refetch,
    
    // Mutations (backward compatible)
    createPatient: templateResult.createItem,
    updatePatient: templateResult.updateItem,
    deletePatient: templateResult.deleteItem,
    isCreating: templateResult.isCreating,
    isUpdating: templateResult.isUpdating,
    isDeleting: templateResult.isDeleting,
    
    // Enhanced functionality
    searchPatients,
    getPatientStats,
    
    // Universal template access
    template: templateResult,
    
    // Metadata
    meta: {
      ...templateResult.meta,
      patientCount: patients.length,
      patientTypes: {
        caregivers: patients.filter((p: any) => p.role === 'patientCaregiver').length,
        direct: patients.filter((p: any) => p.role === 'patient').length
      }
    }
  };
};
