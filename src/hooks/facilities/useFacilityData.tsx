
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ExtendedFacility } from '@/types/database';

/**
 * Focused hook for facility data fetching
 */
export const useFacilityData = () => {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: async (): Promise<ExtendedFacility[]> => {
      console.log('🔍 Fetching facilities data via template...');
      
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching facilities:', error);
        throw error;
      }

      console.log('✅ Facilities data fetched:', data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 30000,
    meta: {
      description: 'Fetches facility data from facilities table',
      dataSource: 'facilities table (direct)',
      requiresAuth: true
    }
  });
};
