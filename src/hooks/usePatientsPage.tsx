
import { useMasterUserManagement } from './useMasterUserManagement';

/**
 * Dedicated hook for Patients page - LOCKED IMPLEMENTATION
 * Uses consolidated real data from master user management
 * Version: patients-page-v3.0.0 - Real data only
 */
export const usePatientsPage = () => {
  console.log('🔒 Patients Page Hook - Locked implementation active');
  
  const userData = useMasterUserManagement();
  
  // Filter for patient users from real data
  const patients = userData.users.filter(user => 
    user.user_roles.some(userRole => 
      userRole.role.name.toLowerCase().includes('patient')
    )
  );

  const patientStats = {
    totalPatients: patients.length,
    activePatients: patients.filter(p => p.isActive).length,
    inactivePatients: patients.filter(p => !p.isActive).length,
    recentPatients: patients.filter(p => {
      const createdDate = new Date(p.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length
  };

  return {
    // Primary data - LOCKED
    patients,
    isLoading: userData.isLoading,
    error: userData.error,
    
    // Patient-specific methods - LOCKED
    getPatients: () => patients,
    searchPatients: (term: string) => 
      patients.filter(patient =>
        patient.firstName.toLowerCase().includes(term.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(term.toLowerCase()) ||
        patient.email.toLowerCase().includes(term.toLowerCase())
      ),
    
    // Stats - LOCKED (Real data only)
    patientStats,
    
    // Meta information - LOCKED
    meta: {
      patientCount: patientStats.totalPatients,
      dataSource: userData.meta.dataSource,
      hookVersion: 'locked-v3.0.0',
      singleSourceValidated: true,
      implementationLocked: true,
      realDataOnly: true
    }
  };
};
