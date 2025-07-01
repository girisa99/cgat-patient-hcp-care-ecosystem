
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Core hook for fetching API service data - Following unified pattern
 */
export const useApiServiceData = () => {
  return useQuery({
    queryKey: ['api-services', 'active'],
    queryFn: async () => {
      console.log('🔍 Fetching API services from database...');
      
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching API services:', error);
        throw error;
      }

      console.log('✅ API services fetched successfully:', data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    meta: {
      description: 'Fetches active API services from api_integration_registry table',
      dataSource: 'api_integration_registry table'
    }
  });
};
