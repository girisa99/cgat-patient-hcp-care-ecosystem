/**
 * USE DEPLOYMENT FEATURES HOOK
 * P3: React hook for managing deployment-specific feature configurations
 */
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  deploymentFeaturePersistence, 
  DeploymentFeatureConfig,
  DeploymentWithFeatures 
} from '@/services/deploymentFeaturePersistence';
import { EnrollmentAgentConfig } from './useEnrollmentAgentConfig';
import { useMasterToast } from './useMasterToast';

interface UseDeploymentFeaturesOptions {
  deploymentId?: string;
  autoSave?: boolean;
  autoSaveDebounce?: number;
}

export const useDeploymentFeatures = (options: UseDeploymentFeaturesOptions = {}) => {
  const { deploymentId, autoSave = false, autoSaveDebounce = 2000 } = options;
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();
  const [pendingChanges, setPendingChanges] = useState<Partial<DeploymentFeatureConfig> | null>(null);

  // Query for single deployment features
  const {
    data: featureConfig,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['deployment-features', deploymentId],
    queryFn: () => deploymentFeaturePersistence.loadDeploymentFeatures(deploymentId!),
    enabled: !!deploymentId,
    staleTime: 30000,
  });

  // Query for all deployments
  const {
    data: allDeployments,
    isLoading: deploymentsLoading,
    refetch: refetchDeployments,
  } = useQuery({
    queryKey: ['all-deployments-with-features'],
    queryFn: () => deploymentFeaturePersistence.getAllDeploymentsWithFeatures(),
    staleTime: 60000,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (config: Partial<DeploymentFeatureConfig>) => {
      if (!deploymentId) throw new Error('No deployment ID');
      return deploymentFeaturePersistence.saveDeploymentFeatures(deploymentId, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment-features', deploymentId] });
      queryClient.invalidateQueries({ queryKey: ['all-deployments-with-features'] });
      showSuccess('Features saved', 'Deployment configuration updated');
    },
    onError: (error) => {
      showError('Save failed', String(error));
    },
  });

  // Save enrollment config mutation
  const saveEnrollmentMutation = useMutation({
    mutationFn: async (config: EnrollmentAgentConfig) => {
      if (!deploymentId) throw new Error('No deployment ID');
      return deploymentFeaturePersistence.saveEnrollmentConfig(deploymentId, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment-features', deploymentId] });
      showSuccess('Enrollment config saved');
    },
    onError: (error) => {
      showError('Save failed', String(error));
    },
  });

  // Create deployment mutation
  const createMutation = useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      initialConfig: Partial<DeploymentFeatureConfig>;
      agentId?: string;
    }) => {
      return deploymentFeaturePersistence.createDeploymentWithFeatures(
        params.name,
        params.description,
        params.initialConfig,
        params.agentId
      );
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['all-deployments-with-features'] });
        showSuccess('Deployment created');
      } else {
        showError('Create failed', result.error);
      }
    },
  });

  // Clone deployment mutation
  const cloneMutation = useMutation({
    mutationFn: async (params: { sourceId: string; newName: string }) => {
      return deploymentFeaturePersistence.cloneDeployment(params.sourceId, params.newName);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['all-deployments-with-features'] });
        showSuccess('Deployment cloned');
      } else {
        showError('Clone failed', result.error);
      }
    },
  });

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || !pendingChanges || !deploymentId) return;

    const timer = setTimeout(() => {
      saveMutation.mutate(pendingChanges);
      setPendingChanges(null);
    }, autoSaveDebounce);

    return () => clearTimeout(timer);
  }, [pendingChanges, autoSave, autoSaveDebounce, deploymentId]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!deploymentId) return;

    const unsubscribe = deploymentFeaturePersistence.subscribeToDeploymentChanges(
      deploymentId,
      (newConfig) => {
        queryClient.setQueryData(['deployment-features', deploymentId], newConfig);
      }
    );

    return unsubscribe;
  }, [deploymentId, queryClient]);

  // Update features (with optional auto-save)
  const updateFeatures = useCallback((updates: Partial<DeploymentFeatureConfig>) => {
    if (autoSave) {
      setPendingChanges(prev => ({ ...prev, ...updates }));
    }
    // Optimistic update
    queryClient.setQueryData(['deployment-features', deploymentId], (old: any) => ({
      ...old,
      ...updates,
    }));
  }, [autoSave, deploymentId, queryClient]);

  // Toggle a single feature
  const toggleFeature = useCallback((featureId: string) => {
    const currentFeatures = featureConfig?.enabled_features || [];
    const newFeatures = currentFeatures.includes(featureId)
      ? currentFeatures.filter(f => f !== featureId)
      : [...currentFeatures, featureId];
    
    updateFeatures({ enabled_features: newFeatures });
  }, [featureConfig?.enabled_features, updateFeatures]);

  // Save immediately
  const saveNow = useCallback(async () => {
    if (!deploymentId) return { success: false, error: 'No deployment ID' };
    
    const configToSave = pendingChanges || featureConfig;
    if (!configToSave) return { success: false, error: 'No config to save' };
    
    const result = await deploymentFeaturePersistence.saveDeploymentFeatures(deploymentId, configToSave);
    if (result.success) {
      setPendingChanges(null);
      refetch();
    }
    return result;
  }, [deploymentId, pendingChanges, featureConfig, refetch]);

  return {
    // Current deployment features
    featureConfig,
    isLoading,
    error,
    hasPendingChanges: !!pendingChanges,

    // All deployments
    allDeployments,
    deploymentsLoading,

    // Actions
    updateFeatures,
    toggleFeature,
    saveNow,
    saveEnrollmentConfig: (config: EnrollmentAgentConfig) => saveEnrollmentMutation.mutateAsync(config),
    createDeployment: (params: {
      name: string;
      description: string;
      initialConfig: Partial<DeploymentFeatureConfig>;
      agentId?: string;
    }) => createMutation.mutateAsync(params),
    cloneDeployment: (sourceId: string, newName: string) => 
      cloneMutation.mutateAsync({ sourceId, newName }),

    // Refresh
    refetch,
    refetchDeployments,

    // Mutation states
    isSaving: saveMutation.isPending || saveEnrollmentMutation.isPending,
    isCreating: createMutation.isPending,
    isCloning: cloneMutation.isPending,
  };
};
