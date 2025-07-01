
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingData = () => {
  return useQuery({
    queryKey: ['onboarding-workflows'],
    queryFn: async () => {
      console.log('🔍 Fetching onboarding workflows from database...');
      
      // For now, we'll use the profiles table as a base since there's no dedicated onboarding table
      // This can be updated when proper onboarding tables are created
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);

      if (error) {
        console.error('❌ Error fetching onboarding workflows:', error);
        throw error;
      }

      // Transform profiles into onboarding workflow format
      const workflows = (data || []).map(profile => ({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed Workflow',
        email: profile.email,
        status: 'pending',
        created_at: profile.created_at,
        is_active: true
      }));

      console.log('✅ Onboarding workflows processed:', workflows.length);
      return workflows;
    },
    retry: 2,
    staleTime: 60000
  });
};
