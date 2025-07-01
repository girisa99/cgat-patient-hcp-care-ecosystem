
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Focused hook for API services data fetching
 */
export const useApiServicesData = () => {
  return useQuery({
    queryKey: ['api-services'],
    queryFn: async () => {
      console.log('🔍 Fetching API services data via template...');
      
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching API services:', error);
        throw error;
      }

      console.log('✅ API services data fetched:', data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 30000,
    meta: {
      description: 'Fetches API integration services data',
      dataSource: 'api_integration_registry table',
      requiresAuth: true
    }
  });
};
