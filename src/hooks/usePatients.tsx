
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
import { usePatientData } from './useUnifiedUserData';
import type { UserWithRoles } from '@/types/userManagement';

export const usePatients = () => {
  const config = {
    tableName: 'profiles' as const,
    moduleName: 'Patients',
    requiredFields: ['email', 'first_name'],
    customValidation: (data: any) => {
      return data.user_roles?.some((userRole: any) => 
        userRole.roles?.name === 'patientCaregiver'
      );
    }
  };

  const template = useTypeSafeModuleTemplate(config);
  const { patients, isLoading: patientsLoading, error: patientsError } = usePatientData();

  // Override template data with actual patient data
  const templateWithPatients = {
    ...template,
    items: patients,
    isLoading: patientsLoading || template.isLoading,
    error: patientsError || template.error
  };

  const searchPatients = (query: string): UserWithRoles[] => {
    if (!query.trim()) return patients;
    
    return patients.filter((patient: UserWithRoles) => 
      patient.first_name?.toLowerCase().includes(query.toLowerCase()) ||
      patient.last_name?.toLowerCase().includes(query.toLowerCase()) ||
      patient.email?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getPatientStats = () => {
    return {
      total: patients.length,
      active: patients.filter(p => p.created_at).length,
      withFacilities: patients.filter(p => p.facilities).length,
      recentlyAdded: patients.filter(p => {
        const createdDate = new Date(p.created_at || '');
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate > weekAgo;
      }).length
    };
  };

  return {
    patients,
    isLoading: templateWithPatients.isLoading,
    error: templateWithPatients.error,
    refetch: template.refetch,
    createItem: template.createItem,
    updateItem: template.updateItem,
    deleteItem: template.deleteItem,
    isCreating: template.isCreating,
    isUpdating: template.isUpdating,
    isDeleting: template.isDeleting,
    searchPatients,
    getPatientStats,
    meta: {
      patientCount: patients.length,
      templateVersion: template.meta.templateVersion,
      dataSource: 'unified patient data'
    }
  };
};
