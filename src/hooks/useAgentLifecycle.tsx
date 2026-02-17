import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

export interface AgentLifecycleState {
  id: string;
  agent_id: string;
  status: 'draft' | 'testing' | 'staging' | 'production' | 'retired';
  version: string;
  change_summary?: string;
  deployment_config: any;
  rollback_config: any;
  health_check_config: any;
  created_by?: string;
  created_at: string;
  deployed_at?: string;
  retired_at?: string;
  metadata: any;
}

export const useAgentLifecycle = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();

  // Fetch lifecycle states for a specific agent or all agents
  const { data: lifecycleStates = [], isLoading } = useQuery({
    queryKey: ['agent-lifecycle', agentId],
    queryFn: async () => {
      console.log('🔄 Fetching agent lifecycle states for:', agentId || 'all agents');
      
      let query = supabase
        .from('agent_lifecycle_states')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (agentId) {
        query = query.eq('agent_id', agentId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching lifecycle states:', error);
        throw error;
      }
      
      console.log('✅ Lifecycle states loaded:', data?.length || 0);
      return data as AgentLifecycleState[];
    }
  });

  // Transition agent to new lifecycle state
  const transitionStateMutation = useMutation({
    mutationFn: async ({
      agentId,
      newStatus,
      version,
      changeSummary,
      deploymentConfig = {},
      healthCheckConfig = {}
    }: {
      agentId: string;
      newStatus: AgentLifecycleState['status'];
      version?: string;
      changeSummary?: string;
      deploymentConfig?: any;
      healthCheckConfig?: any;
    }) => {
      console.log('🔄 Transitioning agent lifecycle:', { agentId, newStatus, version });
      
      // Create new lifecycle state
      const { data: newState, error: stateError } = await supabase
        .from('agent_lifecycle_states')
        .insert({
          agent_id: agentId,
          status: newStatus,
          version: version || '1.0.0',
          change_summary: changeSummary,
          deployment_config: deploymentConfig,
          health_check_config: healthCheckConfig,
          deployed_at: newStatus === 'production' ? new Date().toISOString() : null,
          retired_at: newStatus === 'retired' ? new Date().toISOString() : null,
          metadata: {
            transition_timestamp: new Date().toISOString(),
            previous_states_count: lifecycleStates.length
          }
        })
        .select()
        .single();

      if (stateError) throw stateError;

      // Update agent status
      const { error: agentError } = await supabase
        .from('agents')
        .update({ 
          status: newStatus === 'production' ? 'deployed' : newStatus 
        })
        .eq('id', agentId);

      if (agentError) throw agentError;

      // Log audit trail
      await supabase
        .from('agent_audit_logs')
        .insert({
          agent_id: agentId,
          action_type: newStatus === 'production' ? 'deployed' : 'updated',
          action_description: `Agent transitioned to ${newStatus} status${version ? ` (v${version})` : ''}`,
          after_state: {
            status: newStatus,
            version: version,
            change_summary: changeSummary
          },
          execution_context: {
            lifecycle_transition: true,
            deployment_config: deploymentConfig
          }
        });

      return newState;
    },
    onSuccess: (_, { newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['agent-lifecycle'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      showSuccess('Lifecycle Updated', `Agent successfully transitioned to ${newStatus}`);
    },
    onError: (error: any) => {
      console.error('❌ Lifecycle transition error:', error);
      showError('Lifecycle Error', error.message || 'Failed to transition agent lifecycle');
    }
  });

  // Rollback to previous state
  const rollbackMutation = useMutation({
    mutationFn: async (targetStateId: string) => {
      const targetState = lifecycleStates.find(state => state.id === targetStateId);
      if (!targetState) throw new Error('Target state not found');

      // Apply rollback configuration
      if (targetState.rollback_config && Object.keys(targetState.rollback_config).length > 0) {
        // Implement rollback logic here
        console.log('🔄 Applying rollback configuration:', targetState.rollback_config);
      }

      // Create rollback state entry
      const { data, error } = await supabase
        .from('agent_lifecycle_states')
        .insert({
          agent_id: targetState.agent_id,
          status: targetState.status,
          version: targetState.version,
          change_summary: `Rollback to version ${targetState.version}`,
          deployment_config: targetState.deployment_config,
          rollback_config: targetState.rollback_config,
          health_check_config: targetState.health_check_config,
          metadata: {
            rollback_from: lifecycleStates[0]?.id,
            rollback_to: targetStateId,
            rollback_timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-lifecycle'] });
      showSuccess('Rollback Complete', 'Agent successfully rolled back to previous state');
    },
    onError: (error: any) => {
      showError('Rollback Failed', error.message || 'Failed to rollback agent');
    }
  });

  // Get current lifecycle state
  const getCurrentState = () => {
    return lifecycleStates[0]; // Most recent state
  };

  // Get lifecycle history
  const getLifecycleHistory = () => {
    return lifecycleStates.slice(1); // All except current
  };

  // Check if transition is allowed
  const canTransitionTo = (targetStatus: AgentLifecycleState['status']) => {
    const currentStatus = getCurrentState()?.status || 'draft';
    
    const allowedTransitions: Record<string, string[]> = {
      draft: ['testing'],
      testing: ['draft', 'staging'],
      staging: ['testing', 'production'],
      production: ['staging', 'retired'],
      retired: []
    };

    return allowedTransitions[currentStatus]?.includes(targetStatus) || false;
  };

  return {
    // Data
    lifecycleStates,
    currentState: getCurrentState(),
    lifecycleHistory: getLifecycleHistory(),
    
    // Loading states
    isLoading,
    isTransitioning: transitionStateMutation.isPending,
    isRollingBack: rollbackMutation.isPending,
    
    // Actions
    transitionState: transitionStateMutation.mutate,
    rollbackToState: rollbackMutation.mutate,
    
    // Utilities
    canTransitionTo,
    
    // Meta
    meta: {
      totalStates: lifecycleStates.length,
      dataSource: 'agent_lifecycle_states',
      hookVersion: 'lifecycle-v1.0.0'
    }
  };
};