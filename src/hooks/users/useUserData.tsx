
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserWithRoles } from '@/types/userManagement';
import { createUserQueryKey, USER_ERROR_MESSAGES } from '@/utils/userDataHelpers';

/**
 * Consolidated hook for fetching user data from auth.users via edge function
 */
export const useUserData = () => {
  return useQuery({
    queryKey: createUserQueryKey('all'),
    queryFn: async (): Promise<UserWithRoles[]> => {
      console.log('🔍 Fetching users via consolidated edge function...');
      
      try {
        const { data: response, error } = await supabase.functions.invoke('manage-user-profiles', {
          body: { action: 'list' }
        });

        if (error) {
          console.error('❌ Error from edge function:', error);
          throw new Error(`${USER_ERROR_MESSAGES.EDGE_FUNCTION_ERROR}: ${error.message}`);
        }

        if (!response?.success) {
          console.error('❌ Function returned error:', response?.error);
          throw new Error(response?.error || USER_ERROR_MESSAGES.FETCH_FAILED);
        }

        const users = response.data || [];
        console.log('✅ Users fetched successfully via consolidated hook:', users.length);
        return users;
        
      } catch (err: any) {
        console.error('❌ Error fetching users:', err);
        throw new Error(`${USER_ERROR_MESSAGES.FETCH_FAILED}: ${err.message}`);
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 60000,
    gcTime: 300000,
  });
};
