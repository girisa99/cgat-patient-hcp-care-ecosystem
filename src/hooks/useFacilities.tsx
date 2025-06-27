
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFacilities = () => {
  const {
    data: facilities,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      console.log('🔍 Fetching facilities...');
      
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Error fetching facilities:', error);
        throw error;
      }

      console.log('✅ Facilities fetched successfully:', data.length);
      return data;
    },
    retry: 1,
    staleTime: 300000, // 5 minutes
  });

  return {
    facilities,
    isLoading,
    error,
    refetch
  };
};
