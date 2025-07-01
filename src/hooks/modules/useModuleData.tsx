
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Core hook for fetching module data - Following unified pattern
 */
export const useModuleData = () => {
  return useQuery({
    queryKey: ['modules', 'active'],
    queryFn: async () => {
      console.log('🔍 Fetching modules from database...');
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching modules:', error);
        throw error;
      }

      console.log('✅ Modules fetched successfully:', data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    meta: {
      description: 'Fetches active modules from modules table',
      dataSource: 'modules table'
    }
  });
};
