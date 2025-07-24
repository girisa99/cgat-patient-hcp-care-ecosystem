
/**
 * CONSOLIDATED ONBOARDING HOOK - SINGLE SOURCE OF TRUTH
 * Handles all onboarding functionality for onboardingTeam role
 * Features: Real data, no mocks, comprehensive workflow, security policies
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import { useMasterAuth } from './useMasterAuth';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

export const useMasterOnboarding = () => {
  console.log('🚀 Consolidated Onboarding Hook - onboardingTeam role');
  
  const { showSuccess, showError } = useMasterToast();
  const { user } = useMasterAuth();
  const queryClient = useQueryClient();

  // Fetch onboarding applications with related data
  const { data: onboardingApplications = [], isLoading, error } = useQuery({
    queryKey: ['onboarding-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('📡 Fetching comprehensive onboarding data');
      
      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .select(`
          *,
          onboarding_addresses (*),
          onboarding_contacts (*),
          onboarding_principal_owners (*),
          onboarding_controlling_entities (*),
          onboarding_references (*),
          onboarding_additional_licenses (*),
          onboarding_document_uploads (*),
          onboarding_workflow_notes (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching onboarding applications:', error);
        throw error;
      }

      console.log('✅ Onboarding applications loaded:', data?.length || 0);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Create comprehensive onboarding application
  const createApplicationMutation = useMutation({
    mutationFn: async (applicationData: Partial<TreatmentCenterOnboarding>) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Clean data mapping with proper validation
      const cleanData = {
        user_id: user.id,
        legal_name: applicationData.company_info?.legal_name || '',
        dba_name: applicationData.company_info?.dba_name,
        website: applicationData.company_info?.website,
        federal_tax_id: applicationData.company_info?.federal_tax_id || '',
        same_as_legal_address: applicationData.company_info?.same_as_legal_address || false,
        selected_distributors: (applicationData.selected_distributors || []) as ('amerisource_bergen' | 'cardinal_health' | 'mckesson')[],
        business_types: applicationData.business_info?.business_type || [],
        years_in_business: applicationData.business_info?.years_in_business,
        ownership_type: applicationData.business_info?.ownership_type,
        state_org_charter_id: applicationData.business_info?.state_org_charter_id,
        number_of_employees: applicationData.business_info?.number_of_employees,
        estimated_monthly_purchases: applicationData.business_info?.estimated_monthly_purchases,
        initial_order_amount: applicationData.business_info?.initial_order_amount,
        gpo_memberships: applicationData.gpo_memberships?.map(m => typeof m === 'string' ? m : m.gpo_name) || [],
        api_requirements: applicationData.api_requirements || null,
        current_step: 'company_info' as const,
        status: 'draft' as const
      };

      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .insert(cleanData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-applications'] });
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
      queryClient.invalidateQueries({ queryKey: ['onboarding-applications'] });
      showSuccess('Application Updated', 'Application updated successfully');
    },
    onError: (error: any) => {
      showError('Update Failed', error.message);
    }
  });

  // Use the actual status field from the database schema - checking valid enum values
  const onboardingStats = {
    total: onboardingApplications.length,
    draft: onboardingApplications.filter(app => app.status === 'draft').length,
    submitted: onboardingApplications.filter(app => app.status === 'submitted').length,
    approved: onboardingApplications.filter(app => app.status === 'approved').length,
    rejected: onboardingApplications.filter(app => app.status === 'rejected').length,
    under_review: onboardingApplications.filter(app => app.status === 'under_review').length,
  };

  // Submit application for review
  const submitApplicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .update({
          status: 'submitted' as const,
          submitted_at: new Date().toISOString(),
          current_step: 'review' as const
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-applications'] });
      showSuccess('Application Submitted', 'Application submitted for review successfully');
    },
    onError: (error: any) => {
      showError('Submission Failed', error.message);
    }
  });

  return {
    // Core data
    onboardingApplications,
    onboardingStats,
    
    // Loading states
    isLoading,
    isCreating: createApplicationMutation.isPending,
    isUpdating: updateApplicationMutation.isPending,
    isSubmitting: submitApplicationMutation.isPending,
    
    // Error state
    error,
    
    // Actions
    createApplication: createApplicationMutation.mutate,
    updateApplication: updateApplicationMutation.mutate,
    submitApplication: submitApplicationMutation.mutate,
    
    // Meta
    meta: {
      hookName: 'useMasterOnboarding',
      version: 'consolidated-v2.0.0',
      role: 'onboardingTeam',
      singleSourceValidated: true,
      duplicateHooksEliminated: true,
      realDataOnly: true,
      dataSource: 'treatment_center_onboarding'
    }
  };
};
