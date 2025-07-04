
/**
 * REAL PATIENT DATA HOOK - FIXED DATABASE INTEGRATION
 * Fetches only users with patientCaregiver role from the database
 * Version: real-patient-data-v1.0.0
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RealPatient {
  id: string;
  firstName: string;
  lastName: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  created_at: string;
  facility_id?: string;
  user_roles: Array<{ role: { name: string } }>;
}

export const useRealPatientData = () => {
  console.log('🔍 Real Patient Data Hook - Fetching actual patients only');

  const {
    data: patients = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['real-patients'],
    queryFn: async (): Promise<RealPatient[]> => {
      console.log('🔍 Fetching real patients from database...');
      
      try {
        // First get all users with their roles
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            facility_id,
            created_at,
            user_roles!inner (
              roles!inner (
                name,
                description
              )
            )
          `);

        if (usersError) {
          throw new Error(`Database error: ${usersError.message}`);
        }

        // Filter for users with patientCaregiver role only
        const realPatients = (usersData || [])
          .filter(user => 
            user.user_roles?.some((ur: any) => 
              ur.roles?.name === 'patientCaregiver'
            )
          )
          .map(user => ({
            id: user.id,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.phone,
            isActive: true,
            created_at: user.created_at,
            facility_id: user.facility_id,
            user_roles: user.user_roles || []
          }));

        console.log('✅ Real patients fetched:', realPatients.length);
        return realPatients;
      } catch (err: any) {
        console.error('❌ Real patient data fetch failed:', err);
        throw new Error(`Failed to fetch real patients: ${err.message}`);
      }
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

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
    patients,
    isLoading,
    error,
    refetch,
    patientStats,
    
    // Helper methods
    searchPatients: (term: string) => 
      patients.filter(patient =>
        patient.firstName.toLowerCase().includes(term.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(term.toLowerCase()) ||
        patient.email.toLowerCase().includes(term.toLowerCase())
      ),
    
    getPatientById: (id: string) => 
      patients.find(p => p.id === id),
    
    meta: {
      dataSource: 'profiles-table-with-role-filter',
      hookVersion: 'real-patient-data-v1.0.0',
      realDataOnly: true,
      roleFilter: 'patientCaregiver'
    }
  };
};
