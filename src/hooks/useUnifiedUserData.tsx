
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UserWithRoles } from '@/types/userManagement';

export const useUnifiedUserData = () => {
  return useQuery({
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
      return data || [];
    },
    retry: 2,
    staleTime: 30000,
    meta: {
      description: 'Fetches unified user data with roles and facilities',
      dataSource: 'profiles table with joins',
      requiresAuth: true
    }
  });
};
