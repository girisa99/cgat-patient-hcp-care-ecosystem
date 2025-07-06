
/**
 * MASTER ONBOARDING HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates all onboarding functionality
 * Version: master-onboarding-v1.0.0
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import { useMasterAuth } from './useMasterAuth';

export const useMasterOnboarding = () => {
  console.log('🚀 Master Onboarding Hook - Single source of truth');
  
  const { showSuccess, showError } = useMasterToast();
  const { user } = useMasterAuth();
  const queryClient = useQueryClient();

  const { data: onboardingApplications = [], isLoading, error } = useQuery({
    queryKey: ['master-onboarding'],
    queryFn: async () => {
      console.log('📡 Fetching onboarding applications from real database');
      
      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching onboarding applications:', error);
        throw error;
      }

      console.log('✅ Onboarding applications loaded:', data?.length || 0);
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .insert({
          ...applicationData,
          user_id: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-onboarding'] });
      showSuccess('Application Created', 'Onboarding application created successfully');
    },
    onError: (error: any) => {
      showError('Creation Failed', error.message);
    }
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-onboarding'] });
      showSuccess('Application Updated', 'Application updated successfully');
    },
    onError: (error: any) => {
      showError('Update Failed', error.message);
    }
  });

  // Use the actual status field from the database schema
  const onboardingStats = {
    total: onboardingApplications.length,
    pending: onboardingApplications.filter(app => app.status === 'pending').length,
    approved: onboardingApplications.filter(app => app.status === 'approved').length,
    rejected: onboardingApplications.filter(app => app.status === 'rejected').length,
    inProgress: onboardingApplications.filter(app => app.status === 'in_progress').length,
  };

  return {
    // Core data
    onboardingApplications,
    onboardingStats,
    
    // Loading states
    isLoading,
    isCreating: createApplicationMutation.isPending,
    isUpdating: updateApplicationMutation.isPending,
    
    // Error state
    error,
    
    // Actions
    createApplication: (data: any) => createApplicationMutation.mutate(data),
    updateApplication: (data: { id: string; updates: any }) => updateApplicationMutation.mutate(data),
    
    // Meta
    meta: {
      hookName: 'useMasterOnboarding',
      version: 'master-onboarding-v1.0.0',
      singleSourceValidated: true,
      duplicateHooksEliminated: true,
      dataSource: 'treatment_center_onboarding-table-real-data'
    }
  };
};
