
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ExtendedModule } from '@/types/database';

/**
 * Focused hook for module data fetching
 */
export const useModuleData = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async (): Promise<ExtendedModule[]> => {
      console.log('🔍 Fetching modules data via template...');
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching modules:', error);
        throw error;
      }

      console.log('✅ Modules data fetched:', data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 30000,
    meta: {
      description: 'Fetches module data from modules table',
      dataSource: 'modules table (direct)',
      requiresAuth: true
    }
  });
};
