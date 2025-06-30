
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Module = Database['public']['Tables']['modules']['Row'];

export const useModules = () => {
  const {
    data: modules,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['modules'],
    queryFn: async (): Promise<Module[]> => {
      console.log('⚙️ Fetching modules...');
      
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .order('name');

        if (error) {
          console.error('❌ Error fetching modules:', error);
          throw error;
        }

        console.log('✅ Modules loaded:', data?.length || 0);
        return data || [];
      } catch (err) {
        console.error('❌ Exception fetching modules:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  return {
    modules: modules || [],
    isLoading,
    error,
    refetch
  };
};
