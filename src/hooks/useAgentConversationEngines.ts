/**
 * USE AGENT CONVERSATION ENGINES HOOK
 * Manages agent-conversation engine relationships with real-time status
 */
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  agentConversationEngineService,
  ConversationEngine,
  AgentEngineLink,
  AgentWithEngines,
  ENGINE_TEMPLATES,
} from '@/services/agentConversationEngineService';
import { useMasterToast } from './useMasterToast';

export const useAgentConversationEngines = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();
  const [realTimeStatus, setRealTimeStatus] = useState<AgentWithEngines['real_time_status'] | null>(null);

  // Fetch all engines
  const {
    data: engines,
    isLoading: enginesLoading,
    refetch: refetchEngines,
  } = useQuery({
    queryKey: ['conversation-engines'],
    queryFn: () => agentConversationEngineService.getAllEngines(),
    staleTime: 60000,
  });

  // Fetch all agents with engines
  const {
    data: agentsWithEngines,
    isLoading: agentsLoading,
    refetch: refetchAgents,
  } = useQuery({
    queryKey: ['agents-with-engines'],
    queryFn: () => agentConversationEngineService.getAllAgentsWithEngines(),
    staleTime: 30000,
  });

  // Fetch specific agent with engines
  const {
    data: currentAgentWithEngines,
    isLoading: currentAgentLoading,
    refetch: refetchCurrentAgent,
  } = useQuery({
    queryKey: ['agent-with-engines', agentId],
    queryFn: () => agentConversationEngineService.getAgentWithEngines(agentId!),
    enabled: !!agentId,
    staleTime: 30000,
  });

  // Subscribe to real-time status updates
  useEffect(() => {
    if (!agentId) return;

    const unsubscribe = agentConversationEngineService.subscribeToAgentStatus(
      agentId,
      (status) => {
        setRealTimeStatus(status);
        // Also invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['agent-with-engines', agentId] });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [agentId, queryClient]);

  // Create engine mutation
  const createEngineMutation = useMutation({
    mutationFn: async (params: {
      template?: keyof typeof ENGINE_TEMPLATES;
      custom?: Omit<ConversationEngine, 'id' | 'created_at' | 'is_active'>;
    }) => {
      if (params.template) {
        return agentConversationEngineService.createEngineFromTemplate(params.template);
      } else if (params.custom) {
        return agentConversationEngineService.createEngine(params.custom);
      }
      throw new Error('Must provide template or custom engine');
    },
    onSuccess: (engine) => {
      if (engine) {
        queryClient.invalidateQueries({ queryKey: ['conversation-engines'] });
        showSuccess('Engine created', `${engine.name} is now available`);
      }
    },
    onError: (error) => {
      showError('Failed to create engine', String(error));
    },
  });

  // Link agent to engine mutation
  const linkEngineMutation = useMutation({
    mutationFn: async (params: {
      agentId: string;
      engineId: string;
      role: AgentEngineLink['role'];
      priority?: number;
    }) => {
      return agentConversationEngineService.linkAgentToEngine(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents-with-engines'] });
      queryClient.invalidateQueries({ queryKey: ['agent-with-engines'] });
      showSuccess('Engine linked', 'Agent is now connected to the engine');
    },
    onError: (error) => {
      showError('Failed to link engine', String(error));
    },
  });

  // Create NPI Registry Agent mutation
  const createNPIAgentMutation = useMutation({
    mutationFn: async (params: { name?: string; description?: string }) => {
      return agentConversationEngineService.createNPIRegistryAgent(params);
    },
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries({ queryKey: ['agents-with-engines'] });
        queryClient.invalidateQueries({ queryKey: ['conversation-engines'] });
        showSuccess('NPI Registry Agent created', `Agent ID: ${result.agentId}`);
      }
    },
    onError: (error) => {
      showError('Failed to create NPI agent', String(error));
    },
  });

  // Create Stepwise Enrollment Agent mutation
  const createEnrollmentAgentMutation = useMutation({
    mutationFn: async (params: {
      name?: string;
      description?: string;
      screenMode?: 'single' | 'split' | 'form-specific';
    }) => {
      return agentConversationEngineService.createStepwiseEnrollmentAgent(params);
    },
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries({ queryKey: ['agents-with-engines'] });
        queryClient.invalidateQueries({ queryKey: ['conversation-engines'] });
        showSuccess('Enrollment Agent created', `Agent ID: ${result.agentId}`);
      }
    },
    onError: (error) => {
      showError('Failed to create enrollment agent', String(error));
    },
  });

  // Initialize engines for use case mutation
  const initializeEnginesMutation = useMutation({
    mutationFn: async (params: { agentId: string; useCaseId: string }) => {
      return agentConversationEngineService.initializeEnginesForUseCase(params.agentId, params.useCaseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents-with-engines'] });
      queryClient.invalidateQueries({ queryKey: ['agent-with-engines'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-engines'] });
      showSuccess('Engines initialized', 'Agent is connected to required engines');
    },
    onError: (error) => {
      showError('Failed to initialize engines', String(error));
    },
  });

  // Get engines by type
  const getEnginesByType = useCallback((type: ConversationEngine['engine_type']) => {
    return engines?.filter(e => e.engine_type === type) || [];
  }, [engines]);

  // Get active agents
  const getActiveAgents = useCallback(() => {
    return agentsWithEngines?.filter(a => a.real_time_status.is_running) || [];
  }, [agentsWithEngines]);

  // Get agents by use case
  const getAgentsByUseCase = useCallback((useCase: string) => {
    return agentsWithEngines?.filter(a => a.use_case === useCase) || [];
  }, [agentsWithEngines]);

  return {
    // Data
    engines,
    agentsWithEngines,
    currentAgentWithEngines,
    realTimeStatus: realTimeStatus || currentAgentWithEngines?.real_time_status || null,
    engineTemplates: ENGINE_TEMPLATES,

    // Loading states
    enginesLoading,
    agentsLoading,
    currentAgentLoading,

    // Actions
    createEngine: (params: Parameters<typeof createEngineMutation.mutate>[0]) =>
      createEngineMutation.mutateAsync(params),
    linkEngine: (params: Parameters<typeof linkEngineMutation.mutate>[0]) =>
      linkEngineMutation.mutateAsync(params),
    createNPIAgent: (params: Parameters<typeof createNPIAgentMutation.mutate>[0]) =>
      createNPIAgentMutation.mutateAsync(params),
    createEnrollmentAgent: (params: Parameters<typeof createEnrollmentAgentMutation.mutate>[0]) =>
      createEnrollmentAgentMutation.mutateAsync(params),
    initializeEnginesForUseCase: (agentId: string, useCaseId: string) =>
      initializeEnginesMutation.mutateAsync({ agentId, useCaseId }),

    // Helpers
    getEnginesByType,
    getActiveAgents,
    getAgentsByUseCase,

    // Refresh
    refetchEngines,
    refetchAgents,
    refetchCurrentAgent,

    // Mutation states
    isCreatingEngine: createEngineMutation.isPending,
    isLinkingEngine: linkEngineMutation.isPending,
    isCreatingNPIAgent: createNPIAgentMutation.isPending,
    isCreatingEnrollmentAgent: createEnrollmentAgentMutation.isPending,
    isInitializingEngines: initializeEnginesMutation.isPending,
  };
};
