/**
 * Agent-Node Deployment Bridge Hook
 * Connects agents to workflow nodes for execution
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

export interface AgentNodeDeployment {
  id: string;
  agent_id: string;
  workflow_node_id: string;
  deployment_status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'suspended';
  agent_configuration: Record<string, any>;
  node_configuration: Record<string, any>;
  execution_context?: Record<string, any>;
  deployment_metadata?: Record<string, any>;
  deployed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DeploymentTarget {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  capabilities: string[];
  compatibilityScore: number;
}

export const useAgentDeploymentBridge = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();

  // Fetch agent's node deployments
  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ['agent-node-deployments', agentId],
    queryFn: async () => {
      if (!agentId) return [];
      
      const { data, error } = await supabase
        .from('agent_node_deployments')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AgentNodeDeployment[];
    },
    enabled: !!agentId
  });

  // Fetch compatible nodes for deployment
  const { data: compatibleNodes = [] } = useQuery({
    queryKey: ['compatible-nodes', agentId],
    queryFn: async () => {
      if (!agentId) return [];

      // Get agent capabilities
      const { data: agent } = await supabase
        .from('agents')
        .select('configuration, agent_type, use_case')
        .eq('id', agentId)
        .single();

      // Get workflow nodes
      const { data: nodes } = await supabase
        .from('workflow_node_types')
        .select('*')
        .eq('is_active', true);

      if (!nodes) return [];

      // Calculate compatibility scores
      const agentCapabilities = (agent?.configuration as any)?.capabilities || [];
      
      return nodes.map(node => ({
        nodeId: node.id,
        nodeName: node.type_key,
        nodeType: node.type_key,
        capabilities: (node.capabilities as any)?.actions || [],
        compatibilityScore: calculateCompatibility(agentCapabilities, (node.capabilities as any)?.actions || [])
      })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    },
    enabled: !!agentId
  });

  // Deploy agent to node
  const deployToNodeMutation = useMutation({
    mutationFn: async ({
      nodeId,
      configuration
    }: {
      nodeId: string;
      configuration?: Record<string, any>;
    }) => {
      if (!agentId) throw new Error('Agent ID required');

      // Get agent details
      const { data: agent } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (!agent) throw new Error('Agent not found');

      const agentConfig = typeof agent.configuration === 'object' && agent.configuration !== null ? agent.configuration : {};
      const { data, error } = await supabase
        .from('agent_node_deployments')
        .insert({
          agent_id: agentId,
          workflow_node_id: nodeId,
          deployment_status: 'deploying',
          agent_configuration: {
            ...agentConfig,
            ...configuration?.agent
          },
          node_configuration: configuration?.node || {},
          execution_context: {
            deployedAt: new Date().toISOString(),
            agentType: agent.agent_type,
            useCase: agent.use_case
          },
          deployment_metadata: {
            version: '1.0.0',
            environment: 'production'
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate deployment completion
      setTimeout(async () => {
        await supabase
          .from('agent_node_deployments')
          .update({ 
            deployment_status: 'deployed',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);
        
        queryClient.invalidateQueries({ queryKey: ['agent-node-deployments', agentId] });
      }, 2000);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-node-deployments', agentId] });
      showSuccess('Deployment Started', 'Agent is being deployed to node');
    },
    onError: (error: any) => {
      showError('Deployment Failed', error.message);
    }
  });

  // Undeploy agent from node
  const undeployFromNodeMutation = useMutation({
    mutationFn: async (deploymentId: string) => {
      const { error } = await supabase
        .from('agent_node_deployments')
        .update({ 
          deployment_status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('id', deploymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-node-deployments', agentId] });
      showSuccess('Undeployed', 'Agent removed from node');
    },
    onError: (error: any) => {
      showError('Undeploy Failed', error.message);
    }
  });

  // Update deployment configuration
  const updateDeploymentMutation = useMutation({
    mutationFn: async ({
      deploymentId,
      configuration
    }: {
      deploymentId: string;
      configuration: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from('agent_node_deployments')
        .update({
          agent_configuration: configuration.agent,
          node_configuration: configuration.node,
          updated_at: new Date().toISOString()
        })
        .eq('id', deploymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-node-deployments', agentId] });
      showSuccess('Updated', 'Deployment configuration updated');
    },
    onError: (error: any) => {
      showError('Update Failed', error.message);
    }
  });

  // Execute agent on deployed node
  const executeOnNode = useCallback(async (deploymentId: string, input: any) => {
    const deployment = deployments.find(d => d.id === deploymentId);
    if (!deployment) throw new Error('Deployment not found');

    // Record execution
    const { data, error } = await supabase
      .from('action_execution_logs')
      .insert({
        action_id: deployment.workflow_node_id,
        agent_id: agentId,
        status: 'running',
        input_data: input,
        execution_context: {
          deploymentId,
          nodeId: deployment.workflow_node_id,
          startedAt: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [agentId, deployments]);

  return {
    deployments,
    compatibleNodes,
    isLoading,
    deployToNode: deployToNodeMutation.mutate,
    undeployFromNode: undeployFromNodeMutation.mutate,
    updateDeployment: updateDeploymentMutation.mutate,
    executeOnNode,
    isDeploying: deployToNodeMutation.isPending,
    isUndeploying: undeployFromNodeMutation.isPending
  };
};

// Helper function to calculate compatibility score
function calculateCompatibility(agentCapabilities: string[], nodeActions: string[]): number {
  if (!agentCapabilities.length || !nodeActions.length) return 50;
  
  const matches = agentCapabilities.filter(cap => 
    nodeActions.some(action => 
      action.toLowerCase().includes(cap.toLowerCase()) ||
      cap.toLowerCase().includes(action.toLowerCase())
    )
  );
  
  return Math.round((matches.length / Math.max(agentCapabilities.length, nodeActions.length)) * 100);
}
