import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TestDataset {
  id: string;
  name: string;
  dataset_type: 'vision' | 'text' | 'speech' | 'multimodal' | 'labeling';
  description: string;
  data_format: string;
  sample_count: number;
  labels: string[];
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface AIModelConfig {
  id: string;
  name: string;
  model_type: 'vision' | 'text' | 'speech_to_text' | 'text_to_speech' | 'multimodal' | 'embedding';
  provider: 'openai' | 'huggingface' | 'elevenlabs' | 'anthropic' | 'custom';
  model_id: string;
  configuration: Record<string, any>;
  performance_tier: 'lightweight' | 'standard' | 'premium' | 'gpu_intensive';
  cost_per_request: number;
  max_concurrent_requests: number;
  is_active: boolean;
}

export interface AgentTestRun {
  id: string;
  agent_id: string;
  test_dataset_id: string;
  model_config_id: string;
  test_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  start_time: string;
  end_time?: string;
  total_samples: number;
  processed_samples: number;
  success_rate: number;
  avg_response_time_ms: number;
  avg_accuracy: number;
  results: Record<string, any>;
  performance_metrics: Record<string, any>;
}

export const useAIModelTesting = () => {
  const [testDatasets, setTestDatasets] = useState<TestDataset[]>([]);
  const [modelConfigs, setModelConfigs] = useState<AIModelConfig[]>([]);
  const [testRuns, setTestRuns] = useState<AgentTestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch test datasets
  const fetchTestDatasets = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('test_datasets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTestDatasets((data || []) as TestDataset[]);
    } catch (err) {
      console.error('Error fetching test datasets:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Fetch AI model configurations
  const fetchModelConfigs = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('ai_model_configs')
        .select('*')
        .eq('is_active', true)
        .order('performance_tier', { ascending: true });

      if (fetchError) throw fetchError;
      setModelConfigs((data || []) as AIModelConfig[]);
    } catch (err) {
      console.error('Error fetching model configs:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Fetch test runs
  const fetchTestRuns = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('agent_test_runs')
        .select(`
          *,
          agents (
            id, name, description
          ),
          test_datasets (
            id, name, dataset_type
          ),
          ai_model_configs (
            id, name, model_type, provider, performance_tier
          )
        `)
        .order('start_time', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setTestRuns((data || []) as AgentTestRun[]);
    } catch (err) {
      console.error('Error fetching test runs:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Start a new test run
  const startTestRun = async (
    agentId: string,
    testDatasetId: string,
    modelConfigId: string,
    testName: string,
    options?: {
      sampleLimit?: number;
      parallelProcessing?: boolean;
    }
  ) => {
    try {
      setLoading(true);

      const { data, error: runError } = await supabase.functions.invoke('agent-test-runner', {
        body: {
          agentId,
          testDatasetId,
          modelConfigId,
          testName,
          ...options
        }
      });

      if (runError) throw runError;

      await fetchTestRuns(); // Refresh test runs

      toast({
        title: "Test Run Started",
        description: `Test "${testName}" has been initiated successfully.`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start test run';
      setError(errorMessage);
      toast({
        title: "Test Run Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Process single sample for testing
  const processSingleSample = async (
    modelConfig: AIModelConfig,
    inputData: any,
    testContext?: string
  ) => {
    try {
      const { data, error: processError } = await supabase.functions.invoke('ai-model-processor', {
        body: {
          modelType: modelConfig.model_type,
          provider: modelConfig.provider,
          modelId: modelConfig.model_id,
          inputData,
          configuration: modelConfig.configuration
        }
      });

      if (processError) throw processError;

      toast({
        title: "Sample Processed",
        description: `Successfully processed sample using ${modelConfig.name}`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process sample';
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Get test recommendations based on agent and dataset
  const getTestRecommendations = (agentId: string, datasetType: string) => {
    const recommendedModels = modelConfigs.filter(config => {
      // Recommend lightweight models for quick testing
      if (config.performance_tier === 'lightweight') return true;
      
      // Match model type to dataset type
      switch (datasetType) {
        case 'vision':
          return config.model_type === 'vision' || config.model_type === 'multimodal';
        case 'text':
          return config.model_type === 'text';
        case 'speech':
          return config.model_type === 'speech_to_text' || config.model_type === 'text_to_speech';
        case 'multimodal':
          return config.model_type === 'multimodal';
        default:
          return false;
      }
    });

    return {
      lightweightModels: recommendedModels.filter(m => m.performance_tier === 'lightweight'),
      standardModels: recommendedModels.filter(m => m.performance_tier === 'standard'),
      premiumModels: recommendedModels.filter(m => m.performance_tier === 'premium'),
      gpuIntensiveModels: recommendedModels.filter(m => m.performance_tier === 'gpu_intensive')
    };
  };

  // Get performance insights
  const getPerformanceInsights = (testRun: AgentTestRun) => {
    const insights = [];

    if (testRun.success_rate < 70) {
      insights.push({
        type: 'warning',
        message: 'Low success rate detected. Consider model configuration adjustments.'
      });
    }

    if (testRun.avg_response_time_ms > 5000) {
      insights.push({
        type: 'warning',
        message: 'High response times detected. Consider using a lighter model for better performance.'
      });
    }

    if (testRun.avg_accuracy < 60) {
      insights.push({
        type: 'error',
        message: 'Low accuracy scores. Model may not be suitable for this dataset type.'
      });
    }

    if (testRun.success_rate > 90 && testRun.avg_response_time_ms < 2000) {
      insights.push({
        type: 'success',
        message: 'Excellent performance! This configuration is optimal for production.'
      });
    }

    return insights;
  };

  // Calculate cost estimates
  const calculateCostEstimate = (modelConfig: AIModelConfig, sampleCount: number) => {
    const totalCost = modelConfig.cost_per_request * sampleCount;
    const estimatedTime = (sampleCount * 2000) / modelConfig.max_concurrent_requests; // Rough estimate
    
    return {
      totalCost: totalCost.toFixed(4),
      costPerSample: modelConfig.cost_per_request.toFixed(6),
      estimatedTimeMinutes: Math.ceil(estimatedTime / 60000),
      performanceTier: modelConfig.performance_tier
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTestDatasets(),
        fetchModelConfigs(),
        fetchTestRuns()
      ]);
      setLoading(false);
    };

    loadData();

    // Set up real-time subscriptions for test runs
    const testRunsSubscription = supabase
      .channel('agent_test_runs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_test_runs'
        },
        () => {
          fetchTestRuns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(testRunsSubscription);
    };
  }, []);

  return {
    testDatasets,
    modelConfigs,
    testRuns,
    loading,
    error,
    startTestRun,
    processSingleSample,
    getTestRecommendations,
    getPerformanceInsights,
    calculateCostEstimate,
    refetch: () => Promise.all([fetchTestDatasets(), fetchModelConfigs(), fetchTestRuns()])
  };
};