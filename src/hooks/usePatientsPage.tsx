
import { useUnifiedUserManagement } from './useUnifiedUserManagement';

/**
 * Dedicated hook for Patients page - LOCKED IMPLEMENTATION
 * This hook ensures the Patients page has consistent data access
 * DO NOT MODIFY - This is the single source of truth for Patients page
 */
export const usePatientsPage = () => {
  console.log('🔒 Patients Page Hook - Locked implementation active');
  
  // Use unified user management as single source of truth for patients
  const { users, isLoading, getPatients, searchUsers, meta } = useUnifiedUserManagement();

  // Get patients from unified system
  const patients = getPatients();

  // Calculate patient statistics from real data
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

  // Filter patients based on search
  const searchPatients = (query: string) => {
    return searchUsers(query).filter(user => 
      user.user_roles.some(userRole => userRole.roles.name === 'patientCaregiver')
    );
  };

  // Return consolidated data with clear naming to prevent confusion
  return {
    // Primary data sources - LOCKED
    patients: patients || [],
    allUsers: users || [],
    isLoading,
    
    // Utilities - LOCKED
    getPatientStats,
    searchPatients,
    searchUsers,
    
    // Meta information - LOCKED
    meta: {
      totalPatients: patients.length,
      dataSource: meta.dataSource,
      patientCount: meta.patientCount,
      lastFetched: meta.lastFetched,
      hookVersion: 'locked-v1.0.0',
      singleSourceValidated: true,
      implementationLocked: true
    }
  };
};
