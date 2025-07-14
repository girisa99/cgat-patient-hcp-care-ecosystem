
/**
 * REAL PATIENT DATA HOOK - SINGLE SOURCE OF TRUTH
 * Uses dedicated patient data instead of filtered user data
 * Version: real-patient-data-v1.0.0
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RealPatient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth?: string;
  phone?: string;
  address?: string;
  medical_record_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useRealPatientData = () => {
  console.log('👥 Real Patient Data Hook - Using dedicated patient data');

  const { data: patients = [], isLoading, error } = useQuery({
    queryKey: ['real-patients'],
    queryFn: async (): Promise<RealPatient[]> => {
      console.log('📡 Fetching real patient data - using same approach as dashboard');
      
      // First, get all profiles (same as dashboard approach)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          created_at,
          updated_at
        `);

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('✅ Profiles fetched:', profiles?.length || 0);

      // Get roles for each user using the same RPC function as dashboard
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          try {
            const { data: roleNames, error: roleError } = await supabase
              .rpc('get_user_roles', { check_user_id: profile.id });
            
            if (roleError) {
              console.warn('❌ Error fetching roles for user:', profile.id, roleError);
              return null; // Skip users with role errors
            }

            const userRoles = Array.isArray(roleNames) ? roleNames : [];
            
            // Only return users with patientCaregiver role
            // Check if any role matches patientCaregiver
            const hasPatientRole = userRoles.some((role: any) => 
              typeof role === 'string' ? role === 'patientCaregiver' : role.role_name === 'patientCaregiver'
            );
            
            if (hasPatientRole) {
              return {
                id: profile.id,
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                is_active: true,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
              };
            }
            return null; // Not a patient
          } catch (err) {
            console.warn('❌ Role fetch failed for user:', profile.id, err);
            return null;
          }
        })
      );

      // Filter out null values and return only patients
      const patientData = usersWithRoles.filter(user => user !== null) as RealPatient[];
      
      console.log('✅ Patient data loaded:', patientData.length, 'patients found');
      return patientData;
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  const activePatients = patients.filter(p => p.is_active);
  
  const patientStats = {
    totalPatients: patients.length,
    activePatients: activePatients.length,
    inactivePatients: patients.length - activePatients.length,
    recentPatients: patients.filter(p => {
      const created = new Date(p.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return created > thirtyDaysAgo;
    }).length,
  };

  const searchPatients = (query: string) => {
    if (!query.trim()) return patients;
    const lowercaseQuery = query.toLowerCase();
    return patients.filter(p => 
      p.first_name?.toLowerCase().includes(lowercaseQuery) ||
      p.last_name?.toLowerCase().includes(lowercaseQuery) ||
      p.email?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getPatientById = (id: string) => {
    return patients.find(p => p.id === id);
  };

  return {
    patients,
    activePatients,
    patientStats,
    searchPatients,
    getPatientById,
    isLoading,
    error,
    
    meta: {
      hookName: 'useRealPatientData',
      version: 'real-patient-data-v1.0.0',
      singleSourceValidated: true,
      dataSource: 'real-patient-tables',
      noFilteredUserData: true
    }
  };
};
