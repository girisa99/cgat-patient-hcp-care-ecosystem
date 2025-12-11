/**
 * Agent Lifecycle Management Hook
 * Manages agent states from creation through retirement
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

export type AgentLifecycleStatus = 
  | 'draft' 
  | 'configured' 
  | 'testing' 
  | 'deploying' 
  | 'deployed' 
  | 'active' 
  | 'paused' 
  | 'degraded' 
  | 'retiring' 
  | 'retired';

export interface AgentLifecycleState {
  id: string;
  agent_id: string;
  status: AgentLifecycleStatus;
  version: string;
  deployed_at?: string;
  retired_at?: string;
  deployment_config?: Record<string, any>;
  health_check_config?: Record<string, any>;
  rollback_config?: Record<string, any>;
  change_summary?: string;
  metadata?: Record<string, any>;
  created_at: string;
  created_by?: string;
}

export interface LifecycleTransition {
  from: AgentLifecycleStatus;
  to: AgentLifecycleStatus;
  timestamp: string;
  reason?: string;
  triggeredBy?: string;
}

export const useAgentLifecycle = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();
  const [transitions, setTransitions] = useState<LifecycleTransition[]>([]);

  // Fetch current lifecycle state
  const { data: lifecycleState, isLoading } = useQuery({
    queryKey: ['agent-lifecycle', agentId],
    queryFn: async () => {
      if (!agentId) return null;
      
      const { data, error } = await supabase
        .from('agent_lifecycle_states')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as AgentLifecycleState | null;
    },
    enabled: !!agentId
  });

  // Fetch lifecycle history
  const { data: lifecycleHistory = [] } = useQuery({
    queryKey: ['agent-lifecycle-history', agentId],
    queryFn: async () => {
      if (!agentId) return [];
      
      const { data, error } = await supabase
        .from('agent_lifecycle_states')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as AgentLifecycleState[];
    },
    enabled: !!agentId
  });

  // Valid state transitions
  const validTransitions: Record<AgentLifecycleStatus, AgentLifecycleStatus[]> = {
    draft: ['configured', 'retired'],
    configured: ['testing', 'draft', 'retired'],
    testing: ['deploying', 'configured', 'retired'],
    deploying: ['deployed', 'testing', 'retired'],
    deployed: ['active', 'paused', 'retiring'],
    active: ['paused', 'degraded', 'retiring'],
    paused: ['active', 'retiring'],
    degraded: ['active', 'paused', 'retiring'],
    retiring: ['retired'],
    retired: []
  };

  // Check if transition is valid
  const canTransition = useCallback((from: AgentLifecycleStatus, to: AgentLifecycleStatus): boolean => {
    return validTransitions[from]?.includes(to) ?? false;
  }, []);

  // Transition lifecycle state
  const transitionMutation = useMutation({
    mutationFn: async ({
      newStatus,
      reason,
      config
    }: {
      newStatus: AgentLifecycleStatus;
      reason?: string;
      config?: Record<string, any>;
    }) => {
      if (!agentId) throw new Error('Agent ID required');
      
      const currentStatus = lifecycleState?.status || 'draft';
      
      if (!canTransition(currentStatus, newStatus)) {
        throw new Error(`Invalid transition from ${currentStatus} to ${newStatus}`);
      }

      // Increment version
      const currentVersion = lifecycleState?.version || '0.0.0';
      const [major, minor, patch] = currentVersion.split('.').map(Number);
      const newVersion = newStatus === 'deployed' 
        ? `${major}.${minor + 1}.0`
        : `${major}.${minor}.${patch + 1}`;

      const { data, error } = await supabase
        .from('agent_lifecycle_states')
        .insert({
          agent_id: agentId,
          status: newStatus,
          version: newVersion,
          deployed_at: newStatus === 'deployed' ? new Date().toISOString() : null,
          retired_at: newStatus === 'retired' ? new Date().toISOString() : null,
          deployment_config: config?.deployment || lifecycleState?.deployment_config,
          health_check_config: config?.healthCheck || lifecycleState?.health_check_config,
          rollback_config: { previousVersion: currentVersion, previousStatus: currentStatus },
          change_summary: reason,
          metadata: { transitionedFrom: currentStatus }
        })
        .select()
        .single();

      if (error) throw error;

      // Record transition
      setTransitions(prev => [...prev, {
        from: currentStatus,
        to: newStatus,
        timestamp: new Date().toISOString(),
        reason
      }]);

      // Update agent status in main table
      await supabase
        .from('agents')
        .update({ 
          status: newStatus === 'active' ? 'deployed' : newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', agentId);

      return data;
    },
    onSuccess: (_, { newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['agent-lifecycle', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agent-lifecycle-history', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      showSuccess('Lifecycle Updated', `Agent transitioned to ${newStatus}`);
    },
    onError: (error: any) => {
      showError('Transition Failed', error.message);
    }
  });

  // Rollback to previous state
  const rollbackMutation = useMutation({
    mutationFn: async () => {
      if (!lifecycleState?.rollback_config) {
        throw new Error('No rollback configuration available');
      }

      const { previousVersion, previousStatus } = lifecycleState.rollback_config as any;
      
      return transitionMutation.mutateAsync({
        newStatus: previousStatus,
        reason: `Rollback from ${lifecycleState.version} to ${previousVersion}`
      });
    },
    onSuccess: () => {
      showSuccess('Rollback Complete', 'Agent rolled back to previous state');
    },
    onError: (error: any) => {
      showError('Rollback Failed', error.message);
    }
  });

  // Health check
  const performHealthCheck = useCallback(async () => {
    if (!agentId) return null;

    const { data, error } = await supabase
      .from('agent_health_checks')
      .insert({
        agent_id: agentId,
        check_type: 'lifecycle_health',
        health_status: 'healthy',
        check_result: {
          timestamp: new Date().toISOString(),
          currentState: lifecycleState?.status,
          version: lifecycleState?.version
        }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [agentId, lifecycleState]);

  return {
    lifecycleState,
    lifecycleHistory,
    transitions,
    isLoading,
    canTransition,
    transition: transitionMutation.mutate,
    rollback: rollbackMutation.mutate,
    performHealthCheck,
    isTransitioning: transitionMutation.isPending,
    isRollingBack: rollbackMutation.isPending
  };
};
