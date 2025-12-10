/**
 * USE UNIFIED AI AGENT HOOK
 * Single hook for all agent types using the same Universal AI infrastructure
 * Supports: Genie AI, Enrollment, Order Status, Treatment Center, Manufacturing
 */
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  unifiedAIConnector,
  UnifiedAIRequest,
  UnifiedAIResponse,
  ScreenMode,
  ConversationContextType,
  ScreenModeConfig,
  USE_CASE_SCREEN_CONFIGS,
} from '@/services/unifiedAIConnector';
import { agentInfrastructureHub, UnifiedAgentConfig } from '@/services/agentInfrastructureHub';
import { useMasterToast } from './useMasterToast';

export interface UseUnifiedAIAgentOptions {
  agentId?: string;
  deploymentId?: string;
  useCaseId: string;
  defaultScreenMode?: ScreenMode;
  defaultProvider?: 'openai' | 'claude' | 'gemini';
  autoInitialize?: boolean;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    screenMode?: ScreenMode;
    mcpToolsUsed?: string[];
    formFieldsUpdated?: string[];
  };
}

export const useUnifiedAIAgent = (options: UseUnifiedAIAgentOptions) => {
  const {
    agentId: initialAgentId,
    deploymentId,
    useCaseId,
    defaultScreenMode,
    defaultProvider = 'gemini',
    autoInitialize = false,
  } = options;

  const queryClient = useQueryClient();
  const { showError, showSuccess } = useMasterToast();

  // State
  const [agentId, setAgentId] = useState<string | undefined>(initialAgentId);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentScreenMode, setCurrentScreenMode] = useState<ScreenMode>(
    defaultScreenMode || USE_CASE_SCREEN_CONFIGS[useCaseId]?.defaultMode || 'default'
  );
  const [formContext, setFormContext] = useState<{
    currentSection?: string;
    completedFields?: string[];
    formData?: Record<string, any>;
  }>({});

  // Get screen mode configuration
  const screenModeConfig: ScreenModeConfig = USE_CASE_SCREEN_CONFIGS[useCaseId] || USE_CASE_SCREEN_CONFIGS.general;

  // Load agent configuration
  const {
    data: agentConfig,
    isLoading: isLoadingConfig,
    refetch: refetchConfig,
  } = useQuery({
    queryKey: ['unified-agent-config', agentId],
    queryFn: () => agentId ? agentInfrastructureHub.loadUnifiedConfig(agentId, deploymentId) : null,
    enabled: !!agentId,
    staleTime: 30000,
  });

  // Initialize agent mutation
  const initializeMutation = useMutation({
    mutationFn: async (params: {
      name: string;
      branding: { brandName: string; primaryColor?: string; logoUrl?: string };
      screenMode?: ScreenMode;
      enabledFeatures?: string[];
      channels?: string[];
    }) => {
      return unifiedAIConnector.initializeUnifiedAgent({
        ...params,
        useCaseId,
        providerConfig: { provider: defaultProvider },
      });
    },
    onSuccess: (result) => {
      if (result.success && result.agentId) {
        setAgentId(result.agentId);
        queryClient.invalidateQueries({ queryKey: ['unified-agent-config'] });
        showSuccess('Agent initialized', `${result.config?.name || 'Agent'} is ready`);
      } else {
        showError('Initialization failed', result.error);
      }
    },
    onError: (error) => {
      showError('Initialization failed', String(error));
    },
  });

  // Generate response mutation
  const generateMutation = useMutation({
    mutationFn: async (params: {
      prompt: string;
      conversationContext?: ConversationContextType;
      streamResponse?: boolean;
    }) => {
      const request: UnifiedAIRequest = {
        agentId,
        deploymentId,
        useCaseId,
        prompt: params.prompt,
        conversationContext: params.conversationContext || getConversationContext(),
        screenMode: currentScreenMode,
        formContext,
        providerConfig: { provider: defaultProvider },
      };

      if (params.streamResponse) {
        setIsStreaming(true);
        let streamedContent = '';
        
        // Add placeholder assistant message
        const assistantMsgId = crypto.randomUUID();
        setMessages(prev => [...prev, {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        }]);

        await unifiedAIConnector.streamResponse(
          request,
          (chunk) => {
            streamedContent += chunk;
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMsgId ? { ...msg, content: streamedContent } : msg
            ));
          },
          (response) => {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMsgId ? { ...msg, content: response.content, metadata: response.metadata } : msg
            ));
            setIsStreaming(false);
          }
        );

        return { content: streamedContent, provider: defaultProvider, model: '' } as UnifiedAIResponse;
      } else {
        return unifiedAIConnector.generateResponse(request);
      }
    },
    onError: (error) => {
      setIsStreaming(false);
      showError('AI generation failed', String(error));
    },
  });

  // Helper to determine conversation context from use case
  const getConversationContext = useCallback((): ConversationContextType => {
    switch (useCaseId) {
      case 'patient_intake': return 'patient_intake';
      case 'enrollment': return 'enrollment_form';
      case 'order_status': return 'order_tracking';
      case 'treatment_center_onboarding': return 'treatment_onboarding';
      case 'manufacturing_onboarding': return 'manufacturing_onboarding';
      default: return 'general';
    }
  }, [useCaseId]);

  // Send message function
  const sendMessage = useCallback(async (
    content: string,
    options?: { streamResponse?: boolean; conversationContext?: ConversationContextType }
  ) => {
    // Add user message
    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Generate response
    const response = await generateMutation.mutateAsync({
      prompt: content,
      streamResponse: options?.streamResponse ?? true,
      conversationContext: options?.conversationContext,
    });

    // Add assistant message if not streaming (streaming adds it automatically)
    if (!options?.streamResponse && response) {
      const assistantMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        metadata: response.metadata,
      };
      setMessages(prev => [...prev, assistantMessage]);
    }

    return response;
  }, [generateMutation]);

  // Update form context
  const updateFormContext = useCallback((updates: {
    currentSection?: string;
    completedFields?: string[];
    formData?: Record<string, any>;
  }) => {
    setFormContext(prev => ({
      ...prev,
      ...updates,
      formData: updates.formData ? { ...prev.formData, ...updates.formData } : prev.formData,
    }));
  }, []);

  // Change screen mode
  const changeScreenMode = useCallback((mode: ScreenMode) => {
    if (screenModeConfig.availableModes.includes(mode)) {
      setCurrentScreenMode(mode);
    }
  }, [screenModeConfig.availableModes]);

  // Execute MCP tool
  const executeMCPTool = useCallback(async (
    toolName: string,
    params: Record<string, any>,
    context?: { enrollmentId?: string; sectionName?: string }
  ) => {
    if (!agentId) {
      showError('No agent', 'Agent not initialized');
      return null;
    }

    const result = await agentInfrastructureHub.executeMCPTool(agentId, toolName, params, context);
    if (!result.success) {
      showError('Tool execution failed', result.error);
    }
    return result;
  }, [agentId, showError]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setFormContext({});
  }, []);

  // Get recommended models
  const getRecommendedModels = useCallback(() => {
    return unifiedAIConnector.getRecommendedModels(useCaseId);
  }, [useCaseId]);

  // Auto-initialize if configured
  useEffect(() => {
    if (autoInitialize && !agentId && !isLoadingConfig) {
      // Auto-initialize with default config
      initializeMutation.mutate({
        name: `${useCaseId} Agent`,
        branding: { brandName: 'Genie AI' },
        screenMode: currentScreenMode,
      });
    }
  }, [autoInitialize, agentId, isLoadingConfig]);

  return {
    // Agent state
    agentId,
    agentConfig,
    isLoadingConfig,
    
    // Conversation
    messages,
    sendMessage,
    clearConversation,
    isStreaming,
    isGenerating: generateMutation.isPending,
    
    // Screen modes
    currentScreenMode,
    screenModeConfig,
    changeScreenMode,
    
    // Form context (for form-specific mode)
    formContext,
    updateFormContext,
    
    // MCP tools
    executeMCPTool,
    
    // Initialization
    initializeAgent: (params: Parameters<typeof initializeMutation.mutate>[0]) => 
      initializeMutation.mutateAsync(params),
    isInitializing: initializeMutation.isPending,
    
    // Utilities
    getRecommendedModels,
    getConversationContext,
    refetchConfig,
    
    // Use case info
    useCaseId,
    conversationContext: getConversationContext(),
  };
};
