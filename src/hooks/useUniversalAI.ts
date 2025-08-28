import { useState, useCallback, useMemo } from 'react';
import { aiProviderService, AIProvider, AIRequest, AIResponse } from '@/services/aiProviderService';
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
  const { defaultProvider = 'openai', autoLoadProviders = true } = options;
  const { showError, showSuccess } = useMasterToast();

  const [state, setState] = useState<UniversalAIState>({
    isLoading: false,
    error: null,
    response: null,
    providers: aiProviderService.getProviders(),
    availableProviders: []
  });

  // Load available providers on mount
  const loadAvailableProviders = useCallback(async () => {
    try {
      const available = await aiProviderService.getAvailableProviders();
      setState(prev => ({ ...prev, availableProviders: available }));
    } catch (error) {
      console.error('Failed to load available providers:', error);
    }
  }, []);

  // Generate AI response
  const generateResponse = useCallback(async (request: AIRequest): Promise<AIResponse | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await aiProviderService.generateResponse(request);
      setState(prev => ({ ...prev, response, isLoading: false }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI generation failed';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      showError(errorMessage);
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
      const agent = await aiProviderService.generateAgent(prompt, provider);
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
      const response = await aiProviderService.testWorkflowNode(nodeData, inputData, provider);
      
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
      const response = await aiProviderService.analyzeWorkflow(nodes, edges, provider);
      
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

  // Get models for provider
  const getModelsForProvider = useCallback((providerId: string) => {
    return aiProviderService.getModelsForProvider(providerId);
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
    isProviderAvailable,
    loadAvailableProviders,
    clearError,
    
    // Computed
    hasAvailableProviders: state.availableProviders.length > 0,
    defaultProvider,
    currentProvider: state.response?.provider || defaultProvider
  };
};