
/**
 * Unified User Data Hook
 * 
 * This hook provides a single, consistent way to access user data across
 * all areas of the application (Users, Patients, Facilities, Onboarding, Modules).
 * 
 * CRITICAL: All user data comes from auth.users table via manage-user-profiles edge function.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  UserWithRoles, 
  validateUserData, 
  createUserQueryKey,
  USER_ERROR_MESSAGES,
  getPatientUsers,
  getHealthcareStaff,
  getAdminUsers
} from '@/utils/userDataHelpers';

/**
 * Central hook for all user data operations
 * This replaces multiple separate hooks with inconsistent patterns
 */
export const useUnifiedUserData = () => {
  const { toast } = useToast();

  const {
    data: allUsers,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: createUserQueryKey('all'),
    queryFn: async (): Promise<UserWithRoles[]> => {
      console.log('🔍 Fetching all users from auth.users table via edge function...');
      
      try {
        // CRITICAL: Use edge function to fetch from auth.users table
        const { data: response, error } = await supabase.functions.invoke('manage-user-profiles', {
          body: { action: 'list' }
        });

        if (error) {
          console.error('❌ Error calling manage-user-profiles function:', error);
          throw new Error(`${USER_ERROR_MESSAGES.EDGE_FUNCTION_ERROR}: ${error.message}`);
        }

        if (!response?.success) {
          console.error('❌ Function returned error:', response?.error);
          throw new Error(response?.error || USER_ERROR_MESSAGES.FETCH_FAILED);
        }

        const users = response.data || [];
        console.log('✅ All users fetched from auth.users:', users.length);

        // Validate each user record
        const validatedUsers = users.filter((user: any) => {
          try {
            validateUserData(user);
            return true;
          } catch (error) {
            console.error('❌ User data validation failed:', error, user);
            return false;
          }
        });

        console.log('✅ Validated users:', validatedUsers.length);
        return validatedUsers;
      } catch (err: any) {
        console.error('❌ Critical error in user data fetch:', err);
        throw new Error(`${USER_ERROR_MESSAGES.FETCH_FAILED}: ${err.message}`);
      }
    },
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    meta: {
      description: 'Fetches all users from auth.users table via edge function',
      dataSource: 'auth.users (via manage-user-profiles edge function)'
    }
  });

  // Derived data using helper functions
  const patients = allUsers ? getPatientUsers(allUsers) : [];
  const healthcareStaff = allUsers ? getHealthcareStaff(allUsers) : [];
  const adminUsers = allUsers ? getAdminUsers(allUsers) : [];

  return {
    // Raw data
    allUsers,
    isLoading,
    error,
    refetch,
    
    // Filtered data
    patients,
    healthcareStaff,
    adminUsers,
    
    // Metadata
    meta: {
      totalUsers: allUsers?.length || 0,
      patientCount: patients.length,
      staffCount: healthcareStaff.length,
      adminCount: adminUsers.length,
      dataSource: 'auth.users via manage-user-profiles edge function',
      lastFetch: new Date().toISOString()
    }
  };
};

/**
 * Specialized hook for patient data only
 * Uses the unified data source but filters for patients
 */
export const usePatientData = () => {
  const { patients, isLoading, error, refetch, meta } = useUnifiedUserData();
  
  return {
    patients,
    isLoading,
    error,
    refetch,
    meta: {
      ...meta,
      focusArea: 'patients'
    }
  };
};

/**
 * Specialized hook for healthcare staff data
 */
export const useHealthcareStaffData = () => {
  const { healthcareStaff, isLoading, error, refetch, meta } = useUnifiedUserData();
  
  return {
    healthcareStaff,
    isLoading,
    error,
    refetch,
    meta: {
      ...meta,
      focusArea: 'healthcare-staff'
    }
  };
};

/**
 * Specialized hook for admin users data
 */
export const useAdminUserData = () => {
  const { adminUsers, isLoading, error, refetch, meta } = useUnifiedUserData();
  
  return {
    adminUsers,
    isLoading,
    error,
    refetch,
    meta: {
      ...meta,
      focusArea: 'admin-users'
    }
  };
};
