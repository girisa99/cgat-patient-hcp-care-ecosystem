/**
 * Multi-Agent Canvas Integration
 * Connects A2A Protocol, Multi-Agent Orchestration, and Agentic AI
 * with Canvas, Builder, AI Assist, and Deployment systems
 */

import { useCallback } from 'react';
import { useA2AProtocol } from '@/hooks/useA2AProtocol';
import { useMultiAgentOrchestration } from '@/hooks/useMultiAgentOrchestration';
import { useAgenticAI } from '@/hooks/useAgenticAI';
import { useAgentLifecycle } from '@/hooks/useAgentLifecycle';
import { useAgentDeploymentBridge } from '@/hooks/useAgentDeploymentBridge';
import { useAgentPerformanceMonitoring } from '@/hooks/useAgentPerformanceMonitoring';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

export interface MultiAgentDeploymentConfig {
  agentIds: string[];
  channels: string[];
  orchestrationPattern: 'hierarchical' | 'peer-to-peer' | 'swarm' | 'pipeline';
  supervisorAgentId?: string;
  sharedTools: string[];
  teamName: string;
}

export interface CanvasAgentNode {
  id: string;
  type: string;
  agentId?: string;
  configuration?: Record<string, any>;
  position: { x: number; y: number };
}

export const useMultiAgentCanvasIntegration = (primaryAgentId?: string) => {
  const { showSuccess, showError } = useMasterToast();
  
  // Core hooks
  const a2a = useA2AProtocol(primaryAgentId);
  const orchestration = useMultiAgentOrchestration();
  const agentic = useAgenticAI(primaryAgentId);
  const lifecycle = useAgentLifecycle(primaryAgentId);
  const deploymentBridge = useAgentDeploymentBridge(primaryAgentId);
  const performance = useAgentPerformanceMonitoring(primaryAgentId);

  /**
   * Deploy multiple agents across multiple channels as a coordinated team
   */
  const deployMultiAgentTeam = useCallback(async (config: MultiAgentDeploymentConfig) => {
    try {
      // 1. Create the agent team
      const teamResult = await new Promise<any>((resolve, reject) => {
        orchestration.createTeam({
          name: config.teamName,
          pattern: config.orchestrationPattern,
          memberIds: config.agentIds,
          supervisorId: config.supervisorAgentId
        }, {
          onSuccess: resolve,
          onError: reject
        });
      });

      // 2. Deploy each agent to all specified channels
      const deploymentResults = [];
      
      for (const agentId of config.agentIds) {
        for (const channelType of config.channels) {
          const { error } = await supabase
            .from('agent_channel_deployments')
            .upsert({
              agent_id: agentId,
              channel_id: `${channelType}-${agentId}`,
              channel_type: channelType,
              deployment_status: 'active',
              deployed_at: new Date().toISOString(),
              deployment_config: {
                team_id: teamResult?.id,
                orchestration_pattern: config.orchestrationPattern,
                is_supervisor: agentId === config.supervisorAgentId,
                shared_tools: config.sharedTools,
                team_members: config.agentIds
              }
            }, { onConflict: 'agent_id,channel_id' });

          if (error) throw error;
          
          deploymentResults.push({
            agentId,
            channelType,
            status: 'deployed'
          });
        }

        // Update agent status
        await supabase
          .from('agents')
          .update({
            status: 'active',
            deployment_config: {
              team_id: teamResult?.id,
              channels: config.channels,
              orchestration_pattern: config.orchestrationPattern
            }
          })
          .eq('id', agentId);
      }

      // 3. Log deployment metrics
      await supabase.from('agent_performance_metrics').insert({
        agent_id: primaryAgentId || config.agentIds[0],
        metric_type: 'multi_agent_deployment',
        metric_value: config.agentIds.length,
        metadata: {
          team_id: teamResult?.id,
          channels: config.channels,
          pattern: config.orchestrationPattern,
          deployments: deploymentResults
        }
      });

      showSuccess('Team Deployed', `${config.agentIds.length} agents deployed to ${config.channels.length} channels`);
      
      return {
        teamId: teamResult?.id,
        deployments: deploymentResults,
        success: true
      };
    } catch (error: any) {
      showError('Deployment Failed', error.message);
      throw error;
    }
  }, [orchestration, primaryAgentId, showSuccess, showError]);

  /**
   * Create agent nodes on canvas that are A2A-aware
   */
  const createA2AAgentNode = useCallback((
    agentId: string,
    position: { x: number; y: number },
    role: 'supervisor' | 'worker' | 'specialist' = 'worker'
  ): CanvasAgentNode => {
    return {
      id: `a2a-agent-${agentId}-${Date.now()}`,
      type: 'a2a_agent',
      agentId,
      configuration: {
        role,
        a2aEnabled: true,
        capabilities: [],
        endpoints: {
          http: `/api/agents/${agentId}`,
          websocket: `/ws/agents/${agentId}`,
          sse: `/api/agents/${agentId}/stream`
        }
      },
      position
    };
  }, []);

  /**
   * Execute agentic workflow from canvas
   */
  const executeAgenticWorkflowFromCanvas = useCallback(async (
    goal: string,
    canvasNodes: CanvasAgentNode[]
  ) => {
    // Convert canvas nodes to tool chain if applicable
    const agentNodes = canvasNodes.filter(n => n.agentId);
    
    if (agentNodes.length > 1) {
      // Multi-agent execution via orchestration
      const tasks = agentNodes.map((node, index) => ({
        id: `task_${index}`,
        description: `Execute node ${node.id}: ${goal}`,
        requirements: node.configuration?.capabilities || []
      }));

      // Execute first task - orchestration will handle delegation
      if (orchestration.team) {
        orchestration.assignTask({ task: tasks[0], strategy: 'capability-match' });
      }
    } else {
      // Single agent ReAct execution
      agentic.executeReAct({ goal, maxIterations: 10 });
    }
  }, [orchestration, agentic]);

  /**
   * Handle right-click context menu actions for multi-agent operations
   */
  const getContextMenuActions = useCallback((position: { x: number; y: number }) => {
    return [
      {
        id: 'add-a2a-agent',
        label: 'Add A2A Agent',
        icon: 'Bot',
        action: () => {
          // Will trigger agent selection dialog
          return { type: 'select_agent', position };
        }
      },
      {
        id: 'create-agent-team',
        label: 'Create Agent Team',
        icon: 'Users',
        action: () => {
          return { type: 'create_team', position };
        }
      },
      {
        id: 'add-react-node',
        label: 'Add ReAct Reasoning Node',
        icon: 'Brain',
        action: () => createA2AAgentNode('react-node', position, 'specialist')
      },
      {
        id: 'add-swarm-node',
        label: 'Add Swarm Decision Node',
        icon: 'Network',
        action: () => ({
          id: `swarm-${Date.now()}`,
          type: 'swarm_decision',
          position,
          configuration: {
            consensusThreshold: 0.7,
            votingTimeout: 30000
          }
        })
      },
      {
        id: 'add-tool-chain',
        label: 'Add Tool Chain',
        icon: 'Link',
        action: () => ({
          id: `chain-${Date.now()}`,
          type: 'tool_chain',
          position,
          configuration: {
            tools: [],
            conditions: []
          }
        })
      }
    ];
  }, [createA2AAgentNode]);

  /**
   * AI Assist panel integration - get suggestions based on multi-agent context
   */
  const getAIAssistSuggestions = useCallback(async (
    workflowNodes: CanvasAgentNode[],
    agentContext: { useCase?: string; name?: string }
  ) => {
    const suggestions = [];
    const agentNodes = workflowNodes.filter(n => n.agentId);

    // Suggest team creation if multiple agents
    if (agentNodes.length >= 2) {
      suggestions.push({
        id: 'suggest-team',
        type: 'recommendation',
        title: 'Create Agent Team',
        description: `You have ${agentNodes.length} agents. Consider creating a coordinated team with orchestration patterns.`,
        action: 'create_team'
      });
    }

    // Suggest A2A if not enabled
    const nonA2AAgents = agentNodes.filter(n => !n.configuration?.a2aEnabled);
    if (nonA2AAgents.length > 0) {
      suggestions.push({
        id: 'enable-a2a',
        type: 'improvement',
        title: 'Enable A2A Protocol',
        description: `${nonA2AAgents.length} agents don't have A2A enabled. Enable for better inter-agent communication.`,
        action: 'enable_a2a'
      });
    }

    // Suggest ReAct for complex use cases
    if (['patient-onboarding', 'credentialing', 'npi-registry'].includes(agentContext.useCase || '')) {
      suggestions.push({
        id: 'add-react',
        type: 'recommendation',
        title: 'Add ReAct Reasoning',
        description: 'Complex use case detected. Add ReAct loop for autonomous goal decomposition.',
        action: 'add_react'
      });
    }

    // Performance suggestions
    if (performance.performanceSummary.avgResponseTime > 3000) {
      suggestions.push({
        id: 'performance-warning',
        type: 'warning',
        title: 'High Response Time',
        description: 'Average response time is high. Consider adding caching or parallel execution.',
        action: 'optimize_performance'
      });
    }

    return suggestions;
  }, [performance.performanceSummary]);

  /**
   * Deploy same agent configuration to multiple channels
   */
  const deployToMultipleChannels = useCallback(async (
    agentId: string,
    channels: string[]
  ) => {
    const results = [];
    
    for (const channelType of channels) {
      try {
        const { error } = await supabase
          .from('agent_channel_deployments')
          .upsert({
            agent_id: agentId,
            channel_id: `${channelType}-${agentId}`,
            channel_type: channelType,
            deployment_status: 'active',
            deployed_at: new Date().toISOString()
          }, { onConflict: 'agent_id,channel_id' });

        if (error) throw error;
        
        results.push({ channel: channelType, success: true });
      } catch (error: any) {
        results.push({ channel: channelType, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    showSuccess('Channels Deployed', `Deployed to ${successCount}/${channels.length} channels`);
    
    return results;
  }, [showSuccess]);

  /**
   * Clone and deploy agent to new channel with modified config
   */
  const cloneAgentToChannel = useCallback(async (
    sourceAgentId: string,
    targetChannel: string,
    configOverrides?: Record<string, any>
  ) => {
    try {
      // Get source agent
      const { data: sourceAgent, error: fetchError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', sourceAgentId)
        .single();

      if (fetchError) throw fetchError;

      const sourceConfig = typeof sourceAgent.configuration === 'object' && sourceAgent.configuration !== null 
        ? sourceAgent.configuration 
        : {};

      // Create cloned agent
      const { data: clonedAgent, error: createError } = await supabase
        .from('agents')
        .insert({
          name: `${sourceAgent.name} (${targetChannel})`,
          description: sourceAgent.description,
          use_case: sourceAgent.use_case,
          agent_type: sourceAgent.agent_type,
          model_provider: sourceAgent.model_provider,
          model_name: sourceAgent.model_name,
          system_prompt: sourceAgent.system_prompt,
          configuration: {
            ...sourceConfig,
            ...configOverrides,
            cloned_from: sourceAgentId,
            target_channel: targetChannel
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;

      // Deploy to target channel
      await deployToMultipleChannels(clonedAgent.id, [targetChannel]);

      showSuccess('Agent Cloned', `Agent cloned and deployed to ${targetChannel}`);
      
      return clonedAgent;
    } catch (error: any) {
      showError('Clone Failed', error.message);
      throw error;
    }
  }, [deployToMultipleChannels, showSuccess, showError]);

  return {
    // A2A Protocol
    agentCard: a2a.agentCard,
    discoverAgents: a2a.discoverAgents,
    discoveredAgents: a2a.discoveredAgents,
    sendA2ATask: a2a.sendTask,
    
    // Multi-Agent Orchestration
    team: orchestration.team,
    teams: orchestration.teams,
    createTeam: orchestration.createTeam,
    assignTask: orchestration.assignTask,
    handoffTask: orchestration.handoffTask,
    swarmDecisions: orchestration.swarmDecisions,
    initiateSwarmDecision: orchestration.initiateSwarmDecision,
    
    // Agentic AI
    reactState: agentic.reactState,
    executeReAct: agentic.executeReAct,
    activePlan: agentic.activePlan,
    createPlan: agentic.createPlan,
    executePlan: agentic.executePlan,
    toolChains: agentic.toolChains,
    createToolChain: agentic.createToolChain,
    
    // Lifecycle & Performance
    lifecycleState: lifecycle.lifecycleState,
    transition: lifecycle.transition,
    performanceSummary: performance.performanceSummary,
    performHealthCheck: performance.performHealthCheck,
    
    // Canvas Integration
    createA2AAgentNode,
    executeAgenticWorkflowFromCanvas,
    getContextMenuActions,
    getAIAssistSuggestions,
    
    // Multi-Channel Deployment
    deployMultiAgentTeam,
    deployToMultipleChannels,
    cloneAgentToChannel,
    
    // Loading states
    isDeploying: false,
    isExecuting: agentic.isExecuting || orchestration.isAssigning
  };
};
