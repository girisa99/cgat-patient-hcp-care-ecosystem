import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

export interface AgentNodeDeployment {
  id: string;
  agent_id: string;
  workflow_node_id: string;
  deployment_status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'paused';
  node_configuration: any;
  agent_configuration: any;
  deployment_metadata: any;
  execution_context: any;
  created_at: string;
  updated_at: string;
  deployed_by?: string;
}

export const useAgentDeploymentBridge = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();

  // Fetch deployments
  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ['agent-node-deployments', agentId],
    queryFn: async () => {
      console.log('🔗 Fetching agent-node deployments for:', agentId || 'all agents');
      
      let query = supabase
        .from('agent_node_deployments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (agentId) {
        query = query.eq('agent_id', agentId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching deployments:', error);
        throw error;
      }
      
      console.log('✅ Agent deployments loaded:', data?.length || 0);
      return data as AgentNodeDeployment[];
    }
  });

  // Deploy agent to workflow node
  const deployToNodeMutation = useMutation({
    mutationFn: async ({
      agentId,
      workflowNodeId,
      nodeConfiguration = {},
      agentConfiguration = {}
    }: {
      agentId: string;
      workflowNodeId: string;
      nodeConfiguration?: any;
      agentConfiguration?: any;
    }) => {
      console.log('🚀 Deploying agent to workflow node:', { agentId, workflowNodeId });

      // Check if deployment already exists
      const { data: existing } = await supabase
        .from('agent_node_deployments')
        .select('*')
        .eq('agent_id', agentId)
        .eq('workflow_node_id', workflowNodeId)
        .single();

      if (existing) {
        throw new Error('Agent is already deployed to this workflow node');
      }

      // Get agent details
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (agentError) throw agentError;

      // Create deployment record
      const { data: deployment, error: deploymentError } = await supabase
        .from('agent_node_deployments')
        .insert({
          agent_id: agentId,
          workflow_node_id: workflowNodeId,
          deployment_status: 'deploying',
          node_configuration: nodeConfiguration,
          agent_configuration: {
            ...agentConfiguration,
            agent_name: agent.name,
            agent_type: agent.agent_type,
            original_config: agent.configuration
          },
          deployment_metadata: {
            deployment_initiated_at: new Date().toISOString(),
            agent_version: '1.0.0',
            node_type: nodeConfiguration.type || 'unknown'
          },
          execution_context: {
            deployment_method: 'bridge_deployment',
            workflow_integration: true
          }
        })
        .select()
        .single();

      if (deploymentError) throw deploymentError;

      // Simulate deployment process (in real implementation, this would trigger actual deployment)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update deployment status to deployed
      const { data: updatedDeployment, error: updateError } = await supabase
        .from('agent_node_deployments')
        .update({
          deployment_status: 'deployed',
          deployment_metadata: Object.assign(
            {},
            deployment.deployment_metadata || {},
            {
              deployment_completed_at: new Date().toISOString(),
              deployment_duration_ms: 2000
            }
          )
        })
        .eq('id', deployment.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Log audit trail
      await supabase
        .from('agent_audit_logs')
        .insert({
          agent_id: agentId,
          action_type: 'deployed',
          action_description: `Agent deployed to workflow node: ${workflowNodeId}`,
          after_state: {
            deployment_status: 'deployed',
            workflow_node_id: workflowNodeId,
            deployment_id: deployment.id
          },
          execution_context: {
            node_deployment: true,
            workflow_node_id: workflowNodeId
          }
        });

      return updatedDeployment;
    },
    onSuccess: (_, { workflowNodeId }) => {
      queryClient.invalidateQueries({ queryKey: ['agent-node-deployments'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      showSuccess('Deployment Complete', `Agent successfully deployed to workflow node ${workflowNodeId}`);
    },
    onError: (error: any) => {
      console.error('❌ Deployment error:', error);
      showError('Deployment Failed', error.message || 'Failed to deploy agent to workflow node');
    }
  });

  // Undeploy agent from workflow node
  const undeployFromNodeMutation = useMutation({
    mutationFn: async (deploymentId: string) => {
      console.log('🔌 Undeploying agent from workflow node:', deploymentId);

      const deployment = deployments.find(d => d.id === deploymentId);
      if (!deployment) throw new Error('Deployment not found');

      // Update deployment status to paused (soft undeploy)
      const { data, error } = await supabase
        .from('agent_node_deployments')
        .update({
          deployment_status: 'paused',
          deployment_metadata: Object.assign(
            {},
            deployment.deployment_metadata || {},
            {
              undeployed_at: new Date().toISOString()
            }
          )
        })
        .eq('id', deploymentId)
        .select()
        .single();

      if (error) throw error;

      // Log audit trail
      await supabase
        .from('agent_audit_logs')
        .insert({
          agent_id: deployment.agent_id,
          action_type: 'paused',
          action_description: `Agent undeployed from workflow node: ${deployment.workflow_node_id}`,
          after_state: {
            deployment_status: 'paused',
            deployment_id: deploymentId
          },
          execution_context: {
            node_undeployment: true
          }
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-node-deployments'] });
      showSuccess('Undeployment Complete', 'Agent successfully undeployed from workflow node');
    },
    onError: (error: any) => {
      showError('Undeployment Failed', error.message || 'Failed to undeploy agent');
    }
  });

  // Get deployments by status
  const getDeploymentsByStatus = (status: AgentNodeDeployment['deployment_status']) => {
    return deployments.filter(d => d.deployment_status === status);
  };

  // Get deployment for specific node
  const getDeploymentForNode = (workflowNodeId: string) => {
    return deployments.find(d => d.workflow_node_id === workflowNodeId);
  };

  // Check if agent is deployed to node
  const isDeployedToNode = (workflowNodeId: string) => {
    const deployment = getDeploymentForNode(workflowNodeId);
    return deployment?.deployment_status === 'deployed';
  };

  return {
    // Data
    deployments,
    deployedNodes: getDeploymentsByStatus('deployed'),
    pendingDeployments: getDeploymentsByStatus('pending'),
    failedDeployments: getDeploymentsByStatus('failed'),
    
    // Loading states
    isLoading,
    isDeploying: deployToNodeMutation.isPending,
    isUndeploying: undeployFromNodeMutation.isPending,
    
    // Actions
    deployToNode: deployToNodeMutation.mutate,
    undeployFromNode: undeployFromNodeMutation.mutate,
    
    // Utilities
    getDeploymentsByStatus,
    getDeploymentForNode,
    isDeployedToNode,
    
    // Meta
    meta: {
      totalDeployments: deployments.length,
      activeDeployments: getDeploymentsByStatus('deployed').length,
      dataSource: 'agent_node_deployments',
      hookVersion: 'deployment-bridge-v1.0.0'
    }
  };
};