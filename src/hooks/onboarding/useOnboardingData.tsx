
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Focused hook for onboarding data fetching
 */
export const useOnboardingData = () => {
  return useQuery({
    queryKey: ['onboarding'],
    queryFn: async () => {
      console.log('🔍 Fetching onboarding data via template...');
      
      // For now, return mock data since we don't have a main onboarding table
      // This would be replaced with actual onboarding data fetching
      const mockOnboardingData = [
        {
          id: '1',
          name: 'Healthcare Provider Onboarding',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      console.log('✅ Onboarding data fetched:', mockOnboardingData.length);
      return mockOnboardingData;
    },
    retry: 2,
    staleTime: 30000,
    meta: {
      description: 'Fetches onboarding workflow data',
      dataSource: 'onboarding workflows (mock)',
      requiresAuth: true
    }
  });
};
