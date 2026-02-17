import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface AIModelConfig {
  id?: string;
  name: string;
  provider: string;
  model_id: string;
  model_type: string;
  configuration?: any;
  performance_tier?: string;
  cost_per_request?: number;
  max_concurrent_requests?: number;
  is_active?: boolean;
}

export const useAIModelManager = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch available AI models
  const { data: aiModels, isLoading } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_model_configs')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch AI model integrations
  const { data: modelIntegrations, isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ['ai-model-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_model_integrations')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Create AI model configuration
  const createModelConfig = useMutation({
    mutationFn: async (modelData: Omit<AIModelConfig, 'id'>) => {
      const { data, error } = await supabase
        .from('ai_model_configs')
        .insert({
          name: modelData.name,
          provider: modelData.provider,
          model_id: modelData.model_id,
          model_type: modelData.model_type,
          configuration: modelData.configuration || {},
          performance_tier: modelData.performance_tier || 'standard',
          cost_per_request: modelData.cost_per_request || 0.0,
          max_concurrent_requests: modelData.max_concurrent_requests || 10,
          is_active: modelData.is_active !== false
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
      showSuccess('AI model configuration created successfully');
    },
    onError: (error) => {
      showError('Failed to create AI model configuration: ' + error.message);
    }
  });

  // Update AI model configuration
  const updateModelConfig = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AIModelConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from('ai_model_configs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
      showSuccess('AI model configuration updated successfully');
    },
    onError: (error) => {
      showError('Failed to update AI model configuration: ' + error.message);
    }
  });

  // Get model by ID
  const getModelById = (modelId: string) => {
    return aiModels?.find(model => model.id === modelId);
  };

  // Get models by provider
  const getModelsByProvider = (provider: string) => {
    return aiModels?.filter(model => model.provider === provider) || [];
  };

  // Get recommended models for specific use cases
  const getRecommendedModels = (useCase: 'chat' | 'completion' | 'embedding' | 'vision' | 'code') => {
    const recommendations = {
      chat: ['gpt-4o-mini', 'gpt-4o', 'claude-3-haiku', 'claude-3-sonnet'],
      completion: ['gpt-4o-mini', 'claude-3-haiku', 'gemini-pro'],
      embedding: ['text-embedding-3-small', 'text-embedding-ada-002'],
      vision: ['gpt-4o', 'claude-3-sonnet', 'gemini-1.5-pro-latest'],
      code: ['gpt-4o', 'claude-3-sonnet', 'codellama']
    };

    return aiModels?.filter(model => 
      recommendations[useCase]?.some(rec => model.model_id.includes(rec))
    ) || [];
  };

  return {
    aiModels,
    modelIntegrations,
    isLoading,
    isLoadingIntegrations,
    createModelConfig: createModelConfig.mutate,
    updateModelConfig: updateModelConfig.mutate,
    getModelById,
    getModelsByProvider,
    getRecommendedModels,
    isCreating: createModelConfig.isPending,
    isUpdating: updateModelConfig.isPending,
  };
};