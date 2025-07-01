
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UserWithRoles } from '@/types/userManagement';
import { userHasRole, getPatientUsers, getHealthcareStaff, getAdminUsers } from '@/utils/userDataHelpers';

export const useUnifiedUserData = () => {
  const query = useQuery({
    queryKey: ['unified-users'],
    queryFn: async (): Promise<UserWithRoles[]> => {
      console.log('🔍 Fetching unified user data via edge function...');
      
      try {
        // Use the edge function to get all users from auth.users
        const { data: response, error } = await supabase.functions.invoke('manage-user-profiles', {
          body: { action: 'list' }
        });

        if (error) {
          console.error('❌ Error from edge function:', error);
          throw new Error(`Edge function error: ${error.message}`);
        }

        if (!response?.success) {
          console.error('❌ Function returned error:', response?.error);
          throw new Error(response?.error || 'Failed to fetch users from edge function');
        }

        const users = response.data || [];
        console.log('✅ Users fetched from auth.users via edge function:', users.length);
        console.log('📊 User data sample:', users.slice(0, 2)); // Log first 2 users for debugging

        // Transform the data to match UserWithRoles interface
        const transformedData: UserWithRoles[] = users.map((user: any) => {
          return {
            id: user.id,
            email: user.email || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.phone || '',
            created_at: user.created_at || new Date().toISOString(),
            updated_at: user.updated_at,
            facility_id: user.facility_id,
            user_roles: user.user_roles || [],
            facilities: user.facilities || null
          };
        });

        console.log('✅ Unified user data processed:', transformedData.length);
        console.log('📈 Users by type:', {
          total: transformedData.length,
          withRoles: transformedData.filter(u => u.user_roles && u.user_roles.length > 0).length,
          withFacilities: transformedData.filter(u => u.facilities).length
        });
        
        return transformedData;
      } catch (error) {
        console.error('❌ Error in unified user data fetch:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 30000,
    meta: {
      description: 'Fetches unified user data from auth.users via edge function',
      dataSource: 'auth.users table via manage-user-profiles edge function',
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
      dataSource: 'auth.users table via edge function',
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
