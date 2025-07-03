
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';

/**
 * Consolidated Patients Hook - Uses Unified User Management
 * This hook is a wrapper around the unified system for patient-specific functionality
 */
export const useConsolidatedPatients = () => {
  const { 
    users, 
    isLoading, 
    error, 
    getPatients,
    searchUsers,
    meta 
  } = useMasterUserManagement();

  const patients = getPatients();

  const searchPatients = (query: string) => {
    const allFilteredUsers = searchUsers(query);
    return allFilteredUsers.filter(user => 
      user.user_roles.some(userRole => userRole.roles.name === 'patientCaregiver')
    );
  };

  const getPatientStats = () => {
    return {
      total: patients.length,
      verified: patients.filter(p => p.email_confirmed_at).length,
      withFacilities: patients.filter(p => p.facilities).length,
      recent: patients.filter(p => {
        const createdAt = new Date(p.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt > thirtyDaysAgo;
      }).length
    };
  };

  return {
    // Data
    patients,
    isLoading,
    error,
    
    // Utilities
    searchPatients,
    getPatientStats,
    
    // Meta information from unified system
    meta: {
      ...meta,
      patientSpecific: true,
      filterApplied: 'patientCaregiver role'
    }
  };
};
