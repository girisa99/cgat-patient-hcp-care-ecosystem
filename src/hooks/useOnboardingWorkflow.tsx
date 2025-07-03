
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/DatabaseAuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface WorkflowStep {
  id?: string;
  onboarding_id: string;
  step_name: string;
  step_type: string;
  step_order: number;
  assigned_to?: string;
  due_date?: string;
  status: string;
  completion_date?: string;
  required_documents: string[];
  approval_level?: string;
  escalation_rules: any;
  dependencies: string[];
}

export const useOnboardingWorkflow = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getWorkflowSteps = (onboardingId: string) => {
    return useQuery({
      queryKey: ['workflow-steps', onboardingId],
      queryFn: async () => {
        if (!onboardingId) return [];
        
        const { data, error } = await supabase
          .from('onboarding_workflow_steps')
          .select(`
            *,
            assigned_user:assigned_to(
              first_name,
              last_name,
              email
            )
          `)
          .eq('onboarding_id', onboardingId)
          .order('step_order');

        if (error) throw error;
        return data || [];
      },
      enabled: !!onboardingId,
    });
  };

  const initializeWorkflow = useMutation({
    mutationFn: async (onboardingId: string) => {
      const { error } = await supabase.rpc('initialize_onboarding_workflow', {
        p_onboarding_id: onboardingId
      });

      if (error) throw error;
      return true;
    },
    onSuccess: (_, onboardingId) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-steps', onboardingId] });
      toast({
        title: "Success",
        description: "Workflow initialized successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Error initializing workflow:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initialize workflow",
        variant: "destructive",
      });
    },
  });

  const updateWorkflowStep = useMutation({
    mutationFn: async ({ 
      stepId, 
      updates, 
      onboardingId 
    }: { 
      stepId: string; 
      updates: Partial<WorkflowStep>; 
      onboardingId: string;
    }) => {
      const { data, error } = await supabase
        .from('onboarding_workflow_steps')
        .update(updates)
        .eq('id', stepId)
        .select()
        .single();

      if (error) throw error;

      // Log audit trail
      await supabase.rpc('log_onboarding_audit', {
        p_onboarding_id: onboardingId,
        p_action_type: 'WORKFLOW_STEP_UPDATED',
        p_action_description: `Workflow step "${data.step_name}" updated`,
        p_section_affected: 'workflow',
        p_new_values: updates,
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-steps', data.onboarding_id] });
      toast({
        title: "Success",
        description: "Workflow step updated successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Error updating workflow step:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update workflow step",
        variant: "destructive",
      });
    },
  });

  return {
    getWorkflowSteps,
    initializeWorkflow: initializeWorkflow.mutate,
    updateWorkflowStep: updateWorkflowStep.mutate,
    isInitializing: initializeWorkflow.isPending,
    isUpdating: updateWorkflowStep.isPending,
  };
};
