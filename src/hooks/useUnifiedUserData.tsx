
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UserWithRoles } from '@/types/userManagement';
import { userHasRole, getPatientUsers, getHealthcareStaff, getAdminUsers } from '@/utils/userDataHelpers';

export const useUnifiedUserData = () => {
  const query = useQuery({
    queryKey: ['unified-users'],
    queryFn: async (): Promise<UserWithRoles[]> => {
      console.log('🔍 Fetching unified user data...');
      
      try {
        // First, get all profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            *,
            facilities (
              id,
              name,
              facility_type
            )
          `)
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('❌ Error fetching profiles:', profilesError);
          throw profilesError;
        }

        // Then get user roles separately
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            roles (
              name,
              description
            )
          `);

        if (rolesError) {
          console.error('❌ Error fetching user roles:', rolesError);
          throw rolesError;
        }

        console.log('✅ Profiles fetched:', profiles?.length || 0);
        console.log('✅ User roles fetched:', userRoles?.length || 0);
        
        // Transform and combine the data
        const transformedData: UserWithRoles[] = (profiles || []).map(profile => {
          // Find all roles for this user
          const userRoleRecords = userRoles?.filter(ur => ur.user_id === profile.id) || [];
          
          return {
            id: profile.id,
            email: profile.email || '',
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            phone: profile.phone,
            created_at: profile.created_at || new Date().toISOString(),
            updated_at: profile.updated_at,
            facility_id: profile.facility_id,
            user_roles: userRoleRecords.map((ur: any) => ({
              roles: {
                name: ur.roles?.name || '',
                description: ur.roles?.description || null
              }
            })),
            facilities: profile.facilities ? {
              id: profile.facilities.id,
              name: profile.facilities.name,
              facility_type: profile.facilities.facility_type
            } : null
          };
        });

        console.log('✅ Unified user data processed:', transformedData.length);
        return transformedData;
      } catch (error) {
        console.error('❌ Error in unified user data fetch:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 30000,
    meta: {
      description: 'Fetches unified user data with roles and facilities',
      dataSource: 'profiles table with separate role queries',
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
      dataSource: 'profiles table with separate role queries',
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
