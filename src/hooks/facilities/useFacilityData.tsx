
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Facility } from '@/types/database';

export const useFacilityData = () => {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: async (): Promise<Facility[]> => {
      console.log('🔍 Fetching facilities from database...');
      
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching facilities:', error);
        throw error;
      }

      console.log('✅ Facilities fetched successfully:', data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 60000
  });
};
