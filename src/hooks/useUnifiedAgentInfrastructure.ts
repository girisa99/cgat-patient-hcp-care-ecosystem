/**
 * USE UNIFIED AGENT INFRASTRUCTURE HOOK
 * React hook for accessing the unified agent infrastructure hub
 * Connects P0-P3, MCP SDK, enrollment, channels in one interface
 */
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  agentInfrastructureHub, 
  UnifiedAgentConfig, 
  InfrastructureStatus 
} from '@/services/agentInfrastructureHub';
import { MCPBridgeConfig } from '@/services/enrollmentMCPBridge';
import { useMasterToast } from './useMasterToast';

export const useUnifiedAgentInfrastructure = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(agentId);

  // Check infrastructure health
  const {
    data: infrastructureStatus,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ['infrastructure-status'],
    queryFn: () => agentInfrastructureHub.checkInfrastructureHealth(),
    staleTime: 60000,
    refetchInterval: 300000, // Check every 5 minutes
  });

  // Get infrastructure stats
  const {
    data: infrastructureStats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['infrastructure-stats'],
    queryFn: () => agentInfrastructureHub.getInfrastructureStats(),
    staleTime: 30000,
  });

  // Load all unified configs
  const {
    data: allConfigs,
    isLoading: configsLoading,
    refetch: refetchConfigs,
  } = useQuery({
    queryKey: ['all-unified-configs'],
    queryFn: () => agentInfrastructureHub.getAllUnifiedConfigs(),
    staleTime: 30000,
  });

  // Load specific agent config
  const {
    data: currentConfig,
    isLoading: currentConfigLoading,
    refetch: refetchCurrentConfig,
  } = useQuery({
    queryKey: ['unified-config', selectedAgentId],
    queryFn: () => agentInfrastructureHub.loadUnifiedConfig(selectedAgentId!),
    enabled: !!selectedAgentId,
    staleTime: 30000,
  });

  // Initialize agent mutation
  const initializeMutation = useMutation({
    mutationFn: async (params: Parameters<typeof agentInfrastructureHub.initializeAgent>[0]) => {
      return agentInfrastructureHub.initializeAgent(params);
    },
    onSuccess: (result) => {
      if (result.success && result.config) {
        queryClient.invalidateQueries({ queryKey: ['all-unified-configs'] });
        queryClient.invalidateQueries({ queryKey: ['infrastructure-stats'] });
        setSelectedAgentId(result.config.agentId);
        showSuccess('Agent initialized', `${result.config.name} is ready`);
      } else {
        showError('Initialization failed', result.error);
      }
    },
    onError: (error) => {
      showError('Initialization failed', String(error));
    },
  });

  // Update agent mutation
  const updateMutation = useMutation({
    mutationFn: async (params: {
      agentId: string;
      updates: Parameters<typeof agentInfrastructureHub.updateAgentConfig>[1];
    }) => {
      return agentInfrastructureHub.updateAgentConfig(params.agentId, params.updates);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['unified-config', selectedAgentId] });
        queryClient.invalidateQueries({ queryKey: ['all-unified-configs'] });
        showSuccess('Configuration updated');
      } else {
        showError('Update failed', result.error);
      }
    },
  });

  // Execute MCP tool mutation
  const executeMCPToolMutation = useMutation({
    mutationFn: async (params: {
      toolName: string;
      toolParams: Record<string, any>;
      context?: { enrollmentId?: string; sectionName?: string };
    }) => {
      if (!selectedAgentId) throw new Error('No agent selected');
      return agentInfrastructureHub.executeMCPTool(
        selectedAgentId,
        params.toolName,
        params.toolParams,
        params.context
      );
    },
    onSuccess: (result) => {
      if (!result.success) {
        showError('Tool execution failed', result.error);
      }
    },
  });

  // Helper to check if infrastructure is healthy
  const isInfrastructureHealthy = useCallback((): boolean => {
    if (!infrastructureStatus) return false;
    return Object.values(infrastructureStatus).every(status => status === 'connected');
  }, [infrastructureStatus]);

  // Helper to get unhealthy components
  const getUnhealthyComponents = useCallback((): string[] => {
    if (!infrastructureStatus) return [];
    return Object.entries(infrastructureStatus)
      .filter(([, status]) => status !== 'connected')
      .map(([component]) => component);
  }, [infrastructureStatus]);

  // Select agent and load config
  const selectAgent = useCallback((agentId: string) => {
    setSelectedAgentId(agentId);
  }, []);

  // Get MCP bridge for current agent
  const getMCPBridge = useCallback(() => {
    if (!selectedAgentId) return undefined;
    return agentInfrastructureHub.getMCPBridge(selectedAgentId);
  }, [selectedAgentId]);

  return {
    // Infrastructure status
    infrastructureStatus,
    infrastructureStats,
    isInfrastructureHealthy,
    getUnhealthyComponents,
    statusLoading,
    statsLoading,

    // All configs
    allConfigs,
    configsLoading,

    // Current agent
    selectedAgentId,
    currentConfig,
    currentConfigLoading,
    selectAgent,

    // Actions
    initializeAgent: (params: Parameters<typeof agentInfrastructureHub.initializeAgent>[0]) =>
      initializeMutation.mutateAsync(params),
    updateAgent: (updates: Parameters<typeof agentInfrastructureHub.updateAgentConfig>[1]) => {
      if (!selectedAgentId) return Promise.reject('No agent selected');
      return updateMutation.mutateAsync({ agentId: selectedAgentId, updates });
    },
    executeMCPTool: (
      toolName: string,
      toolParams: Record<string, any>,
      context?: { enrollmentId?: string; sectionName?: string }
    ) => executeMCPToolMutation.mutateAsync({ toolName, toolParams, context }),

    // Get MCP bridge
    getMCPBridge,

    // Refresh
    refetchStatus,
    refetchStats,
    refetchConfigs,
    refetchCurrentConfig,

    // Mutation states
    isInitializing: initializeMutation.isPending,
    isUpdating: updateMutation.isPending,
    isExecutingTool: executeMCPToolMutation.isPending,
  };
};
