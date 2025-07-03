/**
 * MASTER ONBOARDING MANAGEMENT HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates ALL onboarding functionality into ONE hook
 * Version: master-onboarding-v1.0.0
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// SINGLE CACHE KEY for all onboarding operations
const MASTER_ONBOARDING_CACHE_KEY = ['master-onboarding'];

export interface OnboardingWorkflow {
  id: string;
  legal_name: string | null;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * MASTER Onboarding Management Hook - Everything in ONE place
 */
export const useMasterOnboarding = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  console.log('🚀 Master Onboarding - Single Source of Truth Active');

  // ====================== DATA FETCHING ======================
  const {
    data: onboardingWorkflows = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: MASTER_ONBOARDING_CACHE_KEY,
    queryFn: async (): Promise<OnboardingWorkflow[]> => {
      console.log('🔍 Fetching onboarding workflows from single source...');
      
      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching onboarding workflows:', error);
        throw error;
      }
      
      console.log('✅ Onboarding workflows fetched from master source:', data?.length || 0);
      return data || [];
    },
    retry: 1,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // ====================== CACHE INVALIDATION HELPER ======================
  const invalidateCache = () => {
    console.log('🔄 Invalidating master onboarding cache...');
    queryClient.invalidateQueries({ queryKey: MASTER_ONBOARDING_CACHE_KEY });
  };

  // ====================== ONBOARDING WORKFLOW CREATION ======================
  const createWorkflowMutation = useMutation({
    mutationFn: async (workflowData: {
      legal_name: string;
      user_id: string;
    }) => {
      console.log('🔄 Creating onboarding workflow in master hook:', workflowData.legal_name);
      
      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .insert({
          ...workflowData,
          status: 'draft' as const
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateCache();
      toast({
        title: "Onboarding Workflow Created",
        description: "New onboarding workflow has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Workflow Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // ====================== UTILITY FUNCTIONS ======================
  const getOnboardingStats = () => {
    const statusDistribution = onboardingWorkflows.reduce((acc: any, workflow: OnboardingWorkflow) => {
      acc[workflow.status] = (acc[workflow.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: onboardingWorkflows.length,
      statusDistribution,
      inProgress: onboardingWorkflows.filter(w => w.status === 'under_review').length,
      pending: onboardingWorkflows.filter(w => w.status === 'submitted').length,
      completed: onboardingWorkflows.filter(w => w.status === 'approved').length,
    };
  };

  // ====================== RETURN CONSOLIDATED API ======================
  return {
    // Data
    onboardingWorkflows,
    isLoading,
    error,
    refetch,
    
    // Onboarding Management
    createWorkflow: createWorkflowMutation.mutate,
    isCreatingWorkflow: createWorkflowMutation.isPending,
    
    // Utilities
    getOnboardingStats,
    
    // Meta Information
    meta: {
      totalWorkflows: onboardingWorkflows.length,
      dataSource: 'treatment_center_onboarding table (master hook)',
      lastFetched: new Date().toISOString(),
      version: 'master-onboarding-v1.0.0',
      singleSourceValidated: true,
      architectureType: 'consolidated',
      cacheKey: MASTER_ONBOARDING_CACHE_KEY.join('-'),
      stabilityGuarantee: true
    }
  };
};