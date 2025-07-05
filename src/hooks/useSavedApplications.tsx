
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

export const useSavedApplications = () => {
  const { user } = useMasterAuth();

  const { data: savedApplications, isLoading, error, refetch } = useQuery({
    queryKey: ['saved-onboarding-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['draft', 'submitted'])
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved applications:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  const getMostRecentDraft = () => {
    if (!savedApplications?.length) return null;
    return savedApplications.find(app => app.status === 'draft') || null;
  };

  const getApplicationByStatus = (status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected') => {
    if (!savedApplications?.length) return [];
    return savedApplications.filter(app => app.status === status);
  };

  return {
    savedApplications: savedApplications || [],
    isLoading,
    error,
    refetch,
    getMostRecentDraft,
    getApplicationByStatus,
  };
};
