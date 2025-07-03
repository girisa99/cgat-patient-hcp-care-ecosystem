import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingData = () => {
  return useQuery({
    queryKey: ['onboarding-workflows-real'],
    queryFn: async () => {
      console.log('🔍 Fetching real onboarding applications from database...');
      
      // Use the real onboarding_applications table
      const { data, error } = await supabase
        .from('onboarding_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching onboarding applications:', error);
        throw error;
      }

      console.log('✅ Real onboarding applications fetched:', data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 60000,
    refetchOnWindowFocus: false
  });
};
