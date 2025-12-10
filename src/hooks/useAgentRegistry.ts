/**
 * USE AGENT REGISTRY HOOK
 * React hook for managing agent registrations across all use cases
 */
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  agentUseCaseRegistry, 
  AgentRegistration, 
  EXTENDED_USE_CASE_TEMPLATES 
} from '@/services/agentUseCaseRegistry';
import { DeploymentFeatureConfig } from '@/services/deploymentFeaturePersistence';
import { useMasterToast } from './useMasterToast';

export const useAgentRegistry = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<string | null>(null);

  // Get all use case templates
  const useCaseTemplates = EXTENDED_USE_CASE_TEMPLATES;

  // Fetch all registered agents
  const {
    data: agents,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['registered-agents'],
    queryFn: () => agentUseCaseRegistry.getAllRegisteredAgents(),
    staleTime: 30000,
  });

  // Register new agent
  const registerMutation = useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      useCaseId: string;
      branding: AgentRegistration['branding'];
      channels?: string[];
      featureConfig?: Partial<DeploymentFeatureConfig>;
    }) => {
      return agentUseCaseRegistry.registerAgent(params);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['registered-agents'] });
        showSuccess('Agent registered', 'New agent created successfully');
      } else {
        showError('Registration failed', result.error);
      }
    },
    onError: (error) => {
      showError('Registration failed', String(error));
    },
  });

  // Update agent config
  const updateMutation = useMutation({
    mutationFn: async (params: {
      agentId: string;
      updates: Parameters<typeof agentUseCaseRegistry.updateAgentConfig>[1];
    }) => {
      return agentUseCaseRegistry.updateAgentConfig(params.agentId, params.updates);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['registered-agents'] });
        showSuccess('Agent updated');
      } else {
        showError('Update failed', result.error);
      }
    },
  });

  // Deploy to channels
  const deployMutation = useMutation({
    mutationFn: async (params: {
      agentId: string;
      channels: { channelType: string; config?: Record<string, any> }[];
    }) => {
      return agentUseCaseRegistry.deployToChannels(params.agentId, params.channels);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['registered-agents'] });
        showSuccess('Deployed to channels');
      } else {
        showError('Deployment failed', result.error);
      }
    },
  });

  // Toggle agent status
  const toggleStatusMutation = useMutation({
    mutationFn: async (params: { agentId: string; activate: boolean }) => {
      return agentUseCaseRegistry.toggleAgentStatus(params.agentId, params.activate);
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['registered-agents'] });
        showSuccess(variables.activate ? 'Agent activated' : 'Agent paused');
      } else {
        showError('Status change failed', result.error);
      }
    },
  });

  // Generate snippet code
  const generateSnippet = useCallback((
    agent: AgentRegistration,
    format: 'javascript' | 'react' | 'python' | 'curl'
  ): string => {
    return agentUseCaseRegistry.generateSnippetCode(agent, format);
  }, []);

  // Get agents by use case
  const getAgentsByUseCase = useCallback((useCaseId: string): AgentRegistration[] => {
    return (agents || []).filter(a => a.use_case_id === useCaseId);
  }, [agents]);

  // Get agents by status
  const getAgentsByStatus = useCallback((status: AgentRegistration['status']): AgentRegistration[] => {
    return (agents || []).filter(a => a.status === status);
  }, [agents]);

  // Get aggregate metrics
  const getAggregateMetrics = useCallback(() => {
    const allAgents = agents || [];
    return {
      totalAgents: allAgents.length,
      activeAgents: allAgents.filter(a => a.status === 'active').length,
      deployedAgents: allAgents.filter(a => a.status === 'deployed' || a.status === 'active').length,
      totalConversations: allAgents.reduce((sum, a) => sum + a.metrics.total_conversations, 0),
      avgSuccessRate: allAgents.length > 0 
        ? allAgents.reduce((sum, a) => sum + a.metrics.success_rate, 0) / allAgents.length 
        : 0,
      byUseCase: useCaseTemplates.map(uc => ({
        useCaseId: uc.id,
        useCaseName: uc.name,
        count: allAgents.filter(a => a.use_case_id === uc.id).length,
      })),
      byStatus: ['draft', 'configured', 'deployed', 'active', 'paused'].map(status => ({
        status,
        count: allAgents.filter(a => a.status === status).length,
      })),
    };
  }, [agents, useCaseTemplates]);

  return {
    // Data
    agents,
    useCaseTemplates,
    selectedUseCaseId,
    isLoading,
    error,

    // Actions
    setSelectedUseCaseId,
    registerAgent: (params: Parameters<typeof registerMutation.mutateAsync>[0]) => 
      registerMutation.mutateAsync(params),
    updateAgent: (agentId: string, updates: Parameters<typeof agentUseCaseRegistry.updateAgentConfig>[1]) =>
      updateMutation.mutateAsync({ agentId, updates }),
    deployToChannels: (agentId: string, channels: { channelType: string; config?: Record<string, any> }[]) =>
      deployMutation.mutateAsync({ agentId, channels }),
    toggleStatus: (agentId: string, activate: boolean) =>
      toggleStatusMutation.mutateAsync({ agentId, activate }),
    generateSnippet,
    refetch,

    // Helpers
    getAgentsByUseCase,
    getAgentsByStatus,
    getAggregateMetrics,
    getUseCaseById: (id: string) => agentUseCaseRegistry.getUseCaseById(id),

    // Mutation states
    isRegistering: registerMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeploying: deployMutation.isPending,
    isTogglingStatus: toggleStatusMutation.isPending,
  };
};
