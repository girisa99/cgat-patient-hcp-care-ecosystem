
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Facility = Database['public']['Tables']['facilities']['Row'];

export const useFacilities = () => {
  const {
    data: facilities,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['facilities'],
    queryFn: async (): Promise<Facility[]> => {
      console.log('🏥 Fetching facilities...');
      
      try {
        const { data, error } = await supabase
          .from('facilities')
          .select('*')
          .order('name');

        if (error) {
          console.error('❌ Error fetching facilities:', error);
          throw error;
        }

        console.log('✅ Facilities loaded:', data?.length || 0);
        return data || [];
      } catch (err) {
        console.error('❌ Exception fetching facilities:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  return {
    facilities: facilities || [],
    isLoading,
    error,
    refetch
  };
};
