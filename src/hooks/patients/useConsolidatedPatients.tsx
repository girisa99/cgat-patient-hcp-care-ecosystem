
import { useConsolidatedUsers } from '@/hooks/useConsolidatedUsers';
import { getPatientUsers } from '@/utils/userDataHelpers';
import type { UserWithRoles } from '@/types/userManagement';

/**
 * Consolidated Patients Hook - Uses the consolidated user data architecture
 */
export const useConsolidatedPatients = () => {
  const { allUsers, isLoading, error, refetch, meta } = useConsolidatedUsers();

  // Filter for patient users using existing helper
  const patients = getPatientUsers(allUsers || []);

  console.log('🏥 Consolidated patients:', {
    totalUsers: allUsers?.length || 0,
    patientUsers: patients.length,
    dataSource: 'consolidated user data'
  });

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
    isLoading,
    error,
    refetch,
    searchPatients,
    getPatientStats,
    meta: {
      ...meta,
      patientCount: patients.length,
      dataSource: 'consolidated user architecture',
      consolidatedVersion: true
    }
  };
};
