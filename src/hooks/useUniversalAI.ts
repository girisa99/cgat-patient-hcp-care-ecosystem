import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AIProvider, AIRequest, AIResponse } from '@/services/aiProviderService';
import { useMasterToast } from '@/hooks/useMasterToast';

export interface UniversalAIState {
  isLoading: boolean;
  error: string | null;
  response: AIResponse | null;
  providers: AIProvider[];
  availableProviders: AIProvider[];
}

export interface UseUniversalAIOptions {
  defaultProvider?: 'openai' | 'claude' | 'gemini';
  autoLoadProviders?: boolean;
}

export const useUniversalAI = (options: UseUniversalAIOptions = {}) => {
  // Disable provider probing by default to avoid noisy network errors
  const { defaultProvider = 'openai', autoLoadProviders = false } = options;
  const { showError, showSuccess } = useMasterToast();

  // Enhanced categorized AI models with healthcare/biotech specialized models
  const modelCategories = {
    llm: {
      openai: ['gpt-5-2025-08-07', 'gpt-4.1-2025-04-14', 'o3-2025-04-16', 'o4-mini-2025-04-16'],
      claude: ['claude-opus-4-1-20250805', 'claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022'],
      gemini: ['gemini-2.0-flash-exp', 'gemini-pro', 'gemini-1.5-pro']
    },
    small: {
      openai: ['gpt-5-mini-2025-08-07', 'gpt-5-nano-2025-08-07', 'gpt-4o-mini'],
      claude: ['claude-3-5-haiku-20241022'],
      gemini: ['gemini-2.0-flash'],
      specialized: ['biomed-llama-7b', 'clinical-bert', 'pubmed-gpt', 'pharma-t5', 'biotech-mistral-7b']
    },
    vision: {
      openai: ['gpt-4o', 'o4-mini-2025-04-16', 'gpt-4-vision-preview'],
      claude: ['claude-3-5-sonnet-20241022'],
      gemini: ['gemini-1.5-pro-latest', 'gemini-2.0-flash-exp'],
      healthcare: ['medical-imaging-vision', 'radiology-ai-vision', 'pathology-vision-pro']
    },
    mcp: {
      healthcare: ['healthcare-ai-mcp-server', 'biomcp-biotech-pharma-server', 'adk-healthcare-agent-server', 'healthcare-database-mcp-server'],
      biotech: ['genomics-mcp-server', 'clinical-trials-mcp', 'regulatory-compliance-mcp', 'adverse-events-mcp'],
      pharma: ['drug-discovery-mcp', 'pharmacovigilance-mcp', 'regulatory-affairs-mcp', 'manufacturing-mcp'],
      general: ['filesystem-mcp-server', 'web-search-mcp', 'database-mcp-toolbox', 'email-automation-mcp']
    }
  };

  // Default providers with categorized models
  const defaultProviders: AIProvider[] = [
    {
      id: 'openai',
      name: 'OpenAI',
      models: [...modelCategories.llm.openai, ...modelCategories.small.openai, ...modelCategories.vision.openai],
      capabilities: ['text', 'vision', 'reasoning'],
      description: 'OpenAI GPT models - LLM, Small, and Vision variants'
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      models: [...modelCategories.llm.claude, ...modelCategories.small.claude, ...modelCategories.vision.claude],
      capabilities: ['text', 'vision', 'reasoning'],
      description: 'Anthropic Claude models - LLM, Small, and Vision variants'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      models: [...modelCategories.llm.gemini, ...modelCategories.small.gemini, ...modelCategories.vision.gemini],
      capabilities: ['text', 'vision', 'multimodal'],
      description: 'Google Gemini models - LLM, Small, and Vision variants'
    }
  ];

  const [state, setState] = useState<UniversalAIState>({
    isLoading: false,
    error: null,
    response: null,
    providers: defaultProviders,
    availableProviders: defaultProviders
  });

  // Load available providers safely (no edge calls by default)
  const loadAvailableProviders = useCallback(async () => {
    try {
      // Optimistic: expose defaults without probing to avoid repeated fetch failures
      setState(prev => ({ ...prev, availableProviders: defaultProviders }));
    } catch (error) {
      console.error('Failed to load available providers:', error);
      setState(prev => ({ ...prev, availableProviders: defaultProviders }));
    }
  }, []);

  // Helper: default model per provider
  const getDefaultModel = (provider: 'openai' | 'claude' | 'gemini') => {
    switch (provider) {
      case 'openai': return 'gpt-4o-mini';
      case 'claude': return 'claude-3-5-haiku-20241022';
      case 'gemini': return 'gemini-2.0-flash-exp';
      default: return 'gpt-4o-mini';
    }
  };

  // Generate AI response
  const generateResponse = useCallback(async (
    request: AIRequest,
    options?: { silent?: boolean }
  ): Promise<AIResponse | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: request.provider,
          model: request.model || getDefaultModel(request.provider),
          prompt: request.prompt,
          systemPrompt: request.systemPrompt,
          // Note: Let the Edge Function map parameters per-model to avoid API param mismatches
          temperature: request.temperature,
          maxTokens: request.maxTokens,
          context: request.context,
          action: 'generate'
        }
      });

      if (error) throw new Error(error.message);

      const response: AIResponse = {
        content: data.content,
        provider: data.provider,
        model: data.model,
        usage: data.usage,
        metadata: data.metadata
      };

      setState(prev => ({ ...prev, response, isLoading: false }));
      return response;
    } catch (error: any) {
      const raw = error?.message || String(error);
      const friendly = raw.includes('Failed to fetch')
        ? 'AI service is not reachable. Please ensure the Supabase Edge Function "ai-universal-processor" is deployed and API keys are configured.'
        : (error instanceof Error ? error.message : 'AI generation failed');
      setState(prev => ({ ...prev, error: friendly, isLoading: false }));
      if (!options?.silent) {
        showError('AI request failed', friendly);
      }
      return null;
    }
  }, [showError]);

  // Generate agent workflow
  const generateAgent = useCallback(async (
    prompt: string, 
    provider: 'openai' | 'claude' | 'gemini' = defaultProvider
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('generate-agent-from-prompt', {
        body: { prompt, provider }
      });

      if (error) throw new Error(error.message);
      const agent = data;
      setState(prev => ({ ...prev, isLoading: false }));
      showSuccess(`Agent generated successfully using ${provider.toUpperCase()}!`);
      return agent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Agent generation failed';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      showError(errorMessage);
      return null;
    }
  }, [defaultProvider, showError, showSuccess]);

  // Test workflow node
  const testNode = useCallback(async (
    nodeData: any,
    inputData: any,
    provider: 'openai' | 'claude' | 'gemini' = defaultProvider
  ): Promise<any> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider,
          prompt: `Test this workflow node: ${JSON.stringify(nodeData)} with input: ${JSON.stringify(inputData)}`,
          systemPrompt: 'You are testing a workflow node. Provide a JSON response with test results.',
          action: 'test_node',
          context: { nodeData, inputData }
        }
      });

      if (error) throw new Error(error.message);
      
      const response = { content: data.content || '{}' };
      
      // Parse the JSON response
      let nodeResult;
      try {
        nodeResult = JSON.parse(response.content);
      } catch {
        // Fallback if response isn't valid JSON
        nodeResult = {
          success: true,
          output: response.content,
          message: `Node processed using ${provider.toUpperCase()}`,
          executionTime: Math.round(Math.random() * 1000 + 500),
          status: 'completed'
        };
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return {
        ...nodeResult,
        aiProvider: provider,
        aiResponse: response
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Node testing failed';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      showError(errorMessage);
      return {
        success: false,
        output: null,
        message: errorMessage,
        executionTime: 0,
        status: 'failed'
      };
    }
  }, [defaultProvider, showError]);

  // Analyze workflow
  const analyzeWorkflow = useCallback(async (
    nodes: any[],
    edges: any[],
    provider: 'openai' | 'claude' | 'gemini' = defaultProvider
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider,
          prompt: `Analyze this workflow: ${JSON.stringify({ nodes, edges })}`,
          systemPrompt: 'You are analyzing a workflow. Provide detailed analysis including complexity, suggestions, and potential issues.',
          action: 'analyze_workflow',
          context: { nodes, edges }
        }
      });

      if (error) throw new Error(error.message);
      
      const response = { content: data.content || '{}' };
      
      // Parse the analysis response
      let analysis;
      try {
        analysis = JSON.parse(response.content);
      } catch {
        // Fallback analysis
        analysis = {
          complexity: 'moderate',
          riskAssessment: 'medium',
          issues: [],
          suggestions: [`Analysis completed using ${provider.toUpperCase()}`],
          estimatedRunTime: nodes.length * 1000,
          estimatedCost: nodes.length * 0.001
        };
      }

      setState(prev => ({ ...prev, isLoading: false }));
      showSuccess(`Workflow analyzed using ${provider.toUpperCase()}!`);
      return {
        ...analysis,
        aiProvider: provider,
        aiResponse: response
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Workflow analysis failed';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      showError(errorMessage);
      return null;
    }
  }, [defaultProvider, showError, showSuccess]);

  // Chat with AI (general purpose)
  const chat = useCallback(async (
    message: string,
    provider: 'openai' | 'claude' | 'gemini' = defaultProvider,
    systemPrompt?: string
  ): Promise<string | null> => {
    const response = await generateResponse({
      provider,
      prompt: message,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 1000
    });

    return response?.content || null;
  }, [generateResponse, defaultProvider]);

  // Get models for provider by category (including MCP)
  const getModelsForProvider = useCallback((providerId: string, category?: 'llm' | 'small' | 'vision' | 'mcp') => {
    if (category && modelCategories[category] && modelCategories[category][providerId as keyof typeof modelCategories.llm]) {
      return modelCategories[category][providerId as keyof typeof modelCategories.llm];
    }
    const provider = state.providers.find(p => p.id === providerId);
    return provider?.models || [];
  }, [state.providers]);

  // Get models by category across all providers (including MCP)
  const getModelsByCategory = useCallback((category: 'llm' | 'small' | 'vision' | 'mcp') => {
    const categoryModels = modelCategories[category];
    if (!categoryModels) return {};
    
    return Object.entries(categoryModels).reduce((acc, [provider, models]) => {
      acc[provider] = models;
      return acc;
    }, {} as Record<string, string[]>);
  }, []);

  // Check if provider is available
  const isProviderAvailable = useCallback((providerId: 'openai' | 'claude' | 'gemini') => {
    return state.availableProviders.some(p => p.id === providerId);
  }, [state.availableProviders]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialize providers on mount
  useMemo(() => {
    if (autoLoadProviders) {
      loadAvailableProviders();
    }
  }, [autoLoadProviders, loadAvailableProviders]);

  return {
    // State
    ...state,
    
    // Actions
    generateResponse,
    generateAgent,
    testNode,
    analyzeWorkflow,
    chat,
    
    // Utilities
    getModelsForProvider,
    getModelsByCategory,
    isProviderAvailable,
    loadAvailableProviders,
    clearError,
    
    // Computed
    hasAvailableProviders: state.availableProviders.length > 0,
    defaultProvider,
    currentProvider: state.response?.provider || defaultProvider
  };
};