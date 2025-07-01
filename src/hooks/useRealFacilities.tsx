
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Facility {
  id: string;
  name: string;
  facility_type: string;
  address?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  npi_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useRealFacilities = () => {
  const { data: facilities, isLoading, error, refetch } = useQuery({
    queryKey: ['real-facilities'],
    queryFn: async (): Promise<Facility[]> => {
      console.log('🏥 Fetching real facilities from database...');
      
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Error fetching facilities:', error);
        throw error;
      }

      console.log('✅ Real facilities fetched successfully:', data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  return {
    facilities: facilities || [],
    isLoading,
    error,
    refetch,
    meta: {
      totalFacilities: facilities?.length || 0,
      dataSource: 'facilities table (real database)',
      lastFetch: new Date().toISOString(),
      version: 'real-data-v1'
    }
  };
};
