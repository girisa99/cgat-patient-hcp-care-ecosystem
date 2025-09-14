/**
 * ENHANCED GENIE CONVERSATION HOOK
 * Integrates Feature Integration Engine and Enhanced AI Service
 * Provides advanced conversation management with multi-provider fallback
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import { ConversationMessage } from './useConversationState';
import { enhancedAIService, EnhancedAIRequest } from '@/services/enhancedAIService';
import { useGenieState } from './useGenieState';

interface EnhancedGenieConversationState {
  id: string;
  messages: ConversationMessage[];
  isActive: boolean;
  selectedModels: string[];
  enabledFeatures: string[];
  mode: 'system' | 'single' | 'multi';
  medicalContext: boolean;
  selectedMCPTools: string[];
  knowledgeBase: string;
  processingMetadata?: {
    lastProcessingTime: number;
    featuresUsed: string[];
    contextSources: string[];
    confidence: number;
    providerHealth: any;
  };
}

export const useEnhancedGenieConversation = () => {
  const [conversation, setConversation] = useState<EnhancedGenieConversationState>({
    id: `genie_enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    messages: [],
    isActive: false,
    selectedModels: ['gpt-4o-mini'],
    enabledFeatures: [],
    mode: 'single',
    medicalContext: false,
    selectedMCPTools: [],
    knowledgeBase: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<any[]>([]);
  
  const { showError, showSuccess } = useMasterToast();
  const { updateSession, currentSession } = useGenieState();
  
  // Prevent duplicate error toasts
  const errorShownRef = useRef<Set<string>>(new Set());
  const lastProcessingTimeRef = useRef<number>(0);

  // Load provider status on mount
  useEffect(() => {
    loadProviderStatus();
  }, []);

  const loadProviderStatus = useCallback(async () => {
    try {
      const status = await enhancedAIService.getProviderStatus();
      setProviderStatus(status);
      
      // Update conversation metadata
      setConversation(prev => ({
        ...prev,
        processingMetadata: {
          ...prev.processingMetadata,
          providerHealth: status.reduce((acc, provider) => {
            acc[provider.id] = provider.available;
            return acc;
          }, {} as any)
        } as any
      }));
    } catch (error) {
      console.error('Failed to load provider status:', error);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isActive: true,
    }));

    setIsLoading(true);
    setError(null);

    try {
      console.log('🤖 Enhanced Genie processing message:', {
        selectedModels: conversation.selectedModels,
        enabledFeatures: conversation.enabledFeatures,
        mode: conversation.mode,
        featureEngineEnabled: conversation.enabledFeatures.length > 0
      });

      // Determine primary provider and model
      const primaryModel = conversation.selectedModels[0] || 'gpt-4o-mini';
      let provider: 'openai' | 'claude' | 'gemini' = 'openai';
      
      if (primaryModel.includes('claude')) {
        provider = 'claude';
      } else if (primaryModel.includes('gemini')) {
        provider = 'gemini';
      }

      // Build enhanced AI request
      const aiRequest: EnhancedAIRequest = {
        prompt: content.trim(),
        provider,
        model: primaryModel,
        temperature: 0.7,
        maxTokens: 1000,
        enabledFeatures: conversation.enabledFeatures,
        medicalContext: conversation.medicalContext,
        selectedMCPTools: conversation.selectedMCPTools,
        knowledgeBase: conversation.knowledgeBase,
        useFeatureEngine: conversation.enabledFeatures.length > 0,
        fallbackEnabled: true // Enable provider fallback
      };

      const startTime = Date.now();

      // Handle multi-model mode
      if (conversation.mode === 'multi' && conversation.selectedModels.length > 1) {
        console.log('🔀 Multi-model mode: Processing with multiple providers');
        
        const responses = await Promise.allSettled(
          conversation.selectedModels.map(async (model, index) => {
            const modelProvider = model.includes('claude') ? 'claude' : 
                                  model.includes('gemini') ? 'gemini' : 'openai';
            
            return enhancedAIService.generateResponse({
              ...aiRequest,
              provider: modelProvider,
              model,
              useFeatureEngine: index === 0 // Only use feature engine for first model
            });
          })
        );

        // Process successful responses
        responses.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const response = result.value;
            const assistantMessage: ConversationMessage = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: response.content,
              timestamp: new Date().toISOString(),
              provider: response.provider as any,
              model: response.model
            };

            setConversation(prev => ({
              ...prev,
              messages: [...prev.messages, assistantMessage],
            }));
          } else {
            console.warn(`Model ${index + 1} failed:`, result.reason);
          }
        });

        // Update processing metadata from first successful response
        const firstSuccess = responses.find(r => r.status === 'fulfilled');
        if (firstSuccess && firstSuccess.status === 'fulfilled') {
          updateProcessingMetadata(firstSuccess.value.processingMetadata);
        }

      } else {
        // Single model mode with enhanced processing
        const response = await enhancedAIService.generateResponse(aiRequest);

        const assistantMessage: ConversationMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
          provider: response.provider as any,
          model: response.model
        };

        setConversation(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }));

        // Update processing metadata
        updateProcessingMetadata(response.processingMetadata);

        // Show feature usage feedback
        if (response.processingMetadata?.featuresUsed?.length) {
          showSuccess(
            `Enhanced with: ${response.processingMetadata.featuresUsed.join(', ')}`,
            `Processing time: ${response.processingMetadata.processingTime}ms`
          );
        }
      }

      // Auto-save conversation if session exists
      if (currentSession) {
        try {
          await updateSession(currentSession.conversation_id, {
            messages: [...conversation.messages, userMessage],
            configuration_snapshot: {
              mode: conversation.mode,
              selectedModels: conversation.selectedModels,
              enabledFeatures: conversation.enabledFeatures,
              selectedMCPTools: conversation.selectedMCPTools,
              medicalContext: conversation.medicalContext
            }
          });
        } catch (saveError) {
          console.warn('Failed to auto-save conversation:', saveError);
        }
      }

    } catch (error) {
      console.error('❌ Enhanced Genie error:', error);
      
      let errorMessage = 'Failed to generate response';
      
      if (error instanceof Error) {
        if (error.message.includes('All AI providers failed')) {
          errorMessage = 'All AI services are currently unavailable. Please try again later.';
        } else if (error.message.includes('API key not configured')) {
          errorMessage = 'AI service configuration error. Please contact support.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to AI services. Please check your connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      // Show error toast only once per unique error
      const errorKey = errorMessage.substring(0, 50);
      if (!errorShownRef.current.has(errorKey)) {
        showError(errorMessage);
        errorShownRef.current.add(errorKey);
      }
      
      // Add error message to conversation
      const errorResponse: ConversationMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date().toISOString(),
      };

      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, errorResponse],
      }));
    } finally {
      setIsLoading(false);
    }
  }, [
    conversation.selectedModels, 
    conversation.enabledFeatures, 
    conversation.mode,
    conversation.medicalContext,
    conversation.selectedMCPTools,
    conversation.knowledgeBase,
    conversation.messages,
    currentSession,
    updateSession,
    showError,
    showSuccess
  ]);

  const updateProcessingMetadata = useCallback((metadata: any) => {
    if (!metadata) return;
    
    lastProcessingTimeRef.current = metadata.processingTime || 0;
    
    setConversation(prev => ({
      ...prev,
      processingMetadata: {
        lastProcessingTime: metadata.processingTime || 0,
        featuresUsed: metadata.featuresUsed || [],
        contextSources: metadata.contextSources || [],
        confidence: metadata.confidence || 0.5,
        providerHealth: prev.processingMetadata?.providerHealth || {}
      }
    }));
  }, []);

  const updateConfiguration = useCallback((updates: Partial<EnhancedGenieConversationState>) => {
    setConversation(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConversation = useCallback(() => {
    setConversation(prev => ({
      ...prev,
      id: `genie_enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      messages: [],
      isActive: false
    }));
    setError(null);
    errorShownRef.current.clear();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    errorShownRef.current.clear();
  }, []);

  const testProvider = useCallback(async (provider: 'openai' | 'claude' | 'gemini') => {
    try {
      const success = await enhancedAIService.testProvider(provider);
      if (success) {
        showSuccess(`Provider ${provider} is working correctly`);
      } else {
        showError(`Provider ${provider} test failed`);
      }
      await loadProviderStatus(); // Refresh status
      return success;
    } catch (error) {
      showError(`Failed to test provider ${provider}`);
      return false;
    }
  }, [showSuccess, showError, loadProviderStatus]);

  return {
    conversation,
    isLoading,
    error,
    providerStatus,
    sendMessage,
    updateConfiguration,
    resetConversation,
    clearError,
    testProvider,
    loadProviderStatus,
    processingTime: lastProcessingTimeRef.current
  };
};