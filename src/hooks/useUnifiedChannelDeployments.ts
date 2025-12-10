/**
 * USE UNIFIED CHANNEL DEPLOYMENTS HOOK
 * Single hook for managing channel deployments with engine integration
 */
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  unifiedChannelDeploymentService,
  ChannelDeployment,
  FullDeploymentView,
  ChannelType,
  CHANNEL_CONFIGS,
} from '@/services/unifiedChannelDeploymentService';
import { useMasterToast } from './useMasterToast';

export const useUnifiedChannelDeployments = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();
  const [realtimeDeployments, setRealtimeDeployments] = useState<ChannelDeployment[]>([]);

  // Fetch all deployments with details
  const {
    data: deploymentsWithDetails,
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ['channel-deployments-with-details'],
    queryFn: () => unifiedChannelDeploymentService.getAllDeploymentsWithDetails(),
    staleTime: 30000,
  });

  // Fetch deployments for specific agent
  const {
    data: agentDeployments,
    isLoading: isLoadingAgent,
    refetch: refetchAgent,
  } = useQuery({
    queryKey: ['agent-deployments', agentId],
    queryFn: () => unifiedChannelDeploymentService.getDeploymentsForAgent(agentId!),
    enabled: !!agentId,
    staleTime: 30000,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = unifiedChannelDeploymentService.subscribeToDeployments((deployments) => {
      setRealtimeDeployments(deployments);
      queryClient.invalidateQueries({ queryKey: ['channel-deployments-with-details'] });
      if (agentId) {
        queryClient.invalidateQueries({ queryKey: ['agent-deployments', agentId] });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [agentId, queryClient]);

  // Deploy to channel mutation
  const deployMutation = useMutation({
    mutationFn: async (params: {
      agentId: string;
      channelType: ChannelType;
      channelId?: string;
      config?: Partial<ChannelDeployment['deployment_config']>;
      engineId?: string;
    }) => {
      return unifiedChannelDeploymentService.deployToChannel(params);
    },
    onSuccess: (deployment) => {
      if (deployment) {
        queryClient.invalidateQueries({ queryKey: ['channel-deployments-with-details'] });
        queryClient.invalidateQueries({ queryKey: ['agent-deployments'] });
        showSuccess('Deployed', `Agent deployed to ${deployment.channel_type}`);
      }
    },
    onError: (error) => {
      showError('Deployment failed', String(error));
    },
  });

  // Activate deployment mutation
  const activateMutation = useMutation({
    mutationFn: (deploymentId: string) => unifiedChannelDeploymentService.activateDeployment(deploymentId),
    onSuccess: (success, deploymentId) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['channel-deployments-with-details'] });
        showSuccess('Activated', 'Deployment is now active');
      }
    },
  });

  // Pause deployment mutation
  const pauseMutation = useMutation({
    mutationFn: (deploymentId: string) => unifiedChannelDeploymentService.pauseDeployment(deploymentId),
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['channel-deployments-with-details'] });
        showSuccess('Paused', 'Deployment is now paused');
      }
    },
  });

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (params: {
      deploymentId: string;
      config: Partial<ChannelDeployment['deployment_config']>;
    }) => {
      return unifiedChannelDeploymentService.updateDeploymentConfig(params.deploymentId, params.config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-deployments-with-details'] });
      showSuccess('Updated', 'Configuration updated');
    },
  });

  // Health check mutation
  const healthCheckMutation = useMutation({
    mutationFn: (deploymentId: string) => unifiedChannelDeploymentService.runHealthCheck(deploymentId),
    onSuccess: (result, deploymentId) => {
      queryClient.invalidateQueries({ queryKey: ['channel-deployments-with-details'] });
    },
  });

  // Remove deployment mutation
  const removeMutation = useMutation({
    mutationFn: (deploymentId: string) => unifiedChannelDeploymentService.removeDeployment(deploymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-deployments-with-details'] });
      queryClient.invalidateQueries({ queryKey: ['agent-deployments'] });
      showSuccess('Removed', 'Deployment removed');
    },
    onError: (error) => {
      showError('Failed to remove', String(error));
    },
  });

  // Helper: Get deployments by status
  const getDeploymentsByStatus = useCallback((status: ChannelDeployment['deployment_status']) => {
    return deploymentsWithDetails?.filter(d => d.deployment.deployment_status === status) || [];
  }, [deploymentsWithDetails]);

  // Helper: Get deployments by channel type
  const getDeploymentsByChannel = useCallback((channelType: ChannelType) => {
    return deploymentsWithDetails?.filter(d => d.deployment.channel_type === channelType) || [];
  }, [deploymentsWithDetails]);

  // Helper: Get active deployments count
  const activeDeploymentsCount = deploymentsWithDetails?.filter(
    d => d.deployment.deployment_status === 'active'
  ).length || 0;

  // Helper: Get healthy deployments count
  const healthyDeploymentsCount = deploymentsWithDetails?.filter(
    d => d.deployment.health_status === 'healthy'
  ).length || 0;

  // Generate snippet
  const generateSnippet = useCallback((
    deployment: ChannelDeployment,
    format: 'javascript' | 'react' | 'curl' = 'javascript'
  ) => {
    return unifiedChannelDeploymentService.generateDeploymentSnippet(deployment, format);
  }, []);

  return {
    // Data
    deploymentsWithDetails,
    agentDeployments,
    realtimeDeployments,
    channelConfigs: CHANNEL_CONFIGS,

    // Stats
    activeDeploymentsCount,
    healthyDeploymentsCount,
    totalDeployments: deploymentsWithDetails?.length || 0,

    // Loading states
    isLoadingAll,
    isLoadingAgent,

    // Actions
    deploy: (params: Parameters<typeof deployMutation.mutate>[0]) => deployMutation.mutateAsync(params),
    activate: (deploymentId: string) => activateMutation.mutateAsync(deploymentId),
    pause: (deploymentId: string) => pauseMutation.mutateAsync(deploymentId),
    updateConfig: (deploymentId: string, config: Partial<ChannelDeployment['deployment_config']>) =>
      updateConfigMutation.mutateAsync({ deploymentId, config }),
    runHealthCheck: (deploymentId: string) => healthCheckMutation.mutateAsync(deploymentId),
    remove: (deploymentId: string) => removeMutation.mutateAsync(deploymentId),

    // Helpers
    getDeploymentsByStatus,
    getDeploymentsByChannel,
    generateSnippet,

    // Refresh
    refetchAll,
    refetchAgent,

    // Mutation states
    isDeploying: deployMutation.isPending,
    isActivating: activateMutation.isPending,
    isPausing: pauseMutation.isPending,
    isUpdating: updateConfigMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
};
