
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UserWithRoles } from '@/types/userManagement';
import { userHasRole, getPatientUsers, getHealthcareStaff, getAdminUsers } from '@/utils/userDataHelpers';

export const useUnifiedUserData = () => {
  const query = useQuery({
    queryKey: ['unified-users'],
    queryFn: async (): Promise<UserWithRoles[]> => {
      console.log('🔍 Fetching unified user data...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            roles (
              name,
              description
            )
          ),
          facilities (
            id,
            name,
            facility_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching unified user data:', error);
        throw error;
      }

      console.log('✅ Unified user data fetched:', data?.length || 0);
      
      // Transform and validate the data to match UserWithRoles interface
      const transformedData: UserWithRoles[] = (data || []).map(user => ({
        id: user.id,
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at,
        facility_id: user.facility_id,
        user_roles: Array.isArray(user.user_roles) ? user.user_roles.map((ur: any) => ({
          roles: {
            name: ur.roles?.name || '',
            description: ur.roles?.description || null
          }
        })) : [],
        facilities: user.facilities ? {
          id: user.facilities.id,
          name: user.facilities.name,
          facility_type: user.facilities.facility_type
        } : null
      }));

      return transformedData;
    },
    retry: 2,
    staleTime: 30000,
    meta: {
      description: 'Fetches unified user data with roles and facilities',
      dataSource: 'profiles table with joins',
      requiresAuth: true
    }
  });

  const users = query.data || [];
  
  return {
    ...query,
    allUsers: users,
    meta: {
      totalUsers: users.length,
      patientCount: getPatientUsers(users).length,
      staffCount: getHealthcareStaff(users).length,
      adminCount: getAdminUsers(users).length,
      dataSource: 'profiles table with joins',
      lastFetched: new Date().toISOString()
    }
  };
};

// Specialized hooks that filter the unified data
export const usePatientData = () => {
  const { allUsers, isLoading, error, refetch } = useUnifiedUserData();
  
  return {
    patients: getPatientUsers(allUsers || []),
    isLoading,
    error,
    refetch
  };
};

export const useHealthcareStaffData = () => {
  const { allUsers, isLoading, error, refetch } = useUnifiedUserData();
  
  return {
    staff: getHealthcareStaff(allUsers || []),
    isLoading,
    error,
    refetch
  };
};

export const useAdminUserData = () => {
  const { allUsers, isLoading, error, refetch } = useUnifiedUserData();
  
  return {
    admins: getAdminUsers(allUsers || []),
    isLoading,
    error,
    refetch
  };
};
