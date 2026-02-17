
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { validatePatientData } from '@/utils/patientDataHelpers';

interface PatientUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  facility_id?: string;
  facilities?: {
    id: string;
    name: string;
    facility_type: string;
  } | null;
  user_roles: {
    roles: {
      name: string;
      description: string | null;
    };
  }[];
}

/**
 * Core hook for fetching patient data with proper role filtering
 */
export const usePatientData = () => {
  return useQuery({
    queryKey: ['patients', 'patientCaregiver'],
    queryFn: async (): Promise<PatientUser[]> => {
      console.log('🔍 Fetching patients with patientCaregiver role...');
      
      try {
        const { data: response, error } = await supabase.functions.invoke('manage-user-profiles', {
          body: { action: 'list' }
        });

        if (error) {
          throw new Error(`Edge function error: ${error.message}`);
        }

        if (!response?.success) {
          throw new Error(response?.error || 'Failed to fetch users from auth table');
        }

        const allUsers = response.data || [];
        
        // Filter for users with patientCaregiver role ONLY
        const patientUsers = allUsers.filter((user: any) => {
          return user.user_roles?.some((ur: any) => 
            ur.roles?.name === 'patientCaregiver'
          );
        });

        console.log('✅ Total patients with patientCaregiver role:', patientUsers.length);
        
        // Validate data structure
        const validatedPatients = patientUsers.map((user: any) => ({
          id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email,
          phone: user.phone || '',
          created_at: user.created_at,
          facility_id: user.facility_id,
          facilities: user.facilities,
          user_roles: user.user_roles || []
        }));
        
        return validatedPatients;
      } catch (err: any) {
        console.error('❌ Critical error in patient data fetch:', err);
        throw new Error(`Patient data fetch failed: ${err.message}`);
      }
    },
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    meta: {
      description: 'Fetches patient users from auth.users table via edge function',
      requiresRole: 'patientCaregiver',
      dataSource: 'auth.users (via manage-user-profiles edge function)'
    }
  });
};
