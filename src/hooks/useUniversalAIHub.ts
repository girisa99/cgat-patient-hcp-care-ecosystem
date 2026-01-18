/**
 * useUniversalAIHub Hook
 * 
 * Single React hook for ALL AI capabilities across the Genie Suite.
 * Consolidates: LLM, Translation, Vision/OCR, TTS/STT, Image/Video Gen, Music/SFX, NLP
 */

import { useState, useCallback, useMemo } from 'react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { UniversalAIHub, getUniversalAIHub } from '@/services/ai-hub/UniversalAIHub';
import { getProvidersForCapability } from '@/services/ai-hub/providerRegistry';
import type {
  AICapability,
  AIProviderKey,
  AIRequestContext,
  AIHubConfig,
  AIHubState,
  LLMRequest, LLMResponse,
  ChatRequest, ChatResponse, ChatMessage,
  TranslationRequest, TranslationResponse,
  VisionRequest, VisionResponse,
  TTSRequest, TTSResponse,
  STTRequest, STTResponse,
  ImageGenRequest, ImageGenResponse,
  VideoGenRequest, VideoGenResponse,
  MusicGenRequest, MusicGenResponse,
  SFXGenRequest, SFXGenResponse,
  NLPRequest, NLPResponse,
  AgentWorkflowRequest, AgentWorkflowResponse,
  GenieProduct,
} from '@/services/ai-hub/types';

// ============================================
// HOOK OPTIONS
// ============================================

export interface UseUniversalAIHubOptions {
  product?: GenieProduct;
  config?: Partial<AIHubConfig>;
  preferredProviders?: Partial<Record<AICapability, AIProviderKey>>;
  costSensitive?: boolean;
  qualityFirst?: boolean;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useUniversalAIHub(options: UseUniversalAIHubOptions = {}) {
  const { 
    product = 'spark', 
    config, 
    preferredProviders,
    costSensitive = false,
    qualityFirst = false,
  } = options;
  
  const { showError, showSuccess, showInfo } = useMasterToast();

  const [state, setState] = useState<AIHubState>({
    isLoading: false,
    error: null,
    lastCapability: null,
    lastProvider: null,
    configuredProviders: new Set(),
  });

  // Get hub instance
  const hub = useMemo(() => {
    const hubConfig: Partial<AIHubConfig> = {
      ...config,
      costSensitive,
      qualityFirst,
    };
    if (preferredProviders) {
      hubConfig.defaultProviders = preferredProviders;
    }
    return getUniversalAIHub(hubConfig);
  }, [config, preferredProviders, costSensitive, qualityFirst]);

  // Create context for operations
  const createContext = useCallback((
    overrides?: Partial<AIRequestContext>
  ): AIRequestContext => ({
    product,
    correlationId: crypto.randomUUID(),
    costSensitive,
    qualityFirst,
    ...overrides,
  }), [product, costSensitive, qualityFirst]);

  // Generic executor with state management
  const execute = useCallback(async <T>(
    capability: AICapability,
    operation: () => Promise<T>,
    options?: { silent?: boolean }
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, lastCapability: capability }));

    try {
      const result = await operation();
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      if (!options?.silent) {
        showError(`${capability} Failed`, errorMessage);
      }
      return null;
    }
  }, [showError]);

  // ============================================
  // LLM / CHAT OPERATIONS
  // ============================================

  const generateResponse = useCallback(async (
    request: LLMRequest,
    options?: { silent?: boolean; context?: Partial<AIRequestContext> }
  ): Promise<LLMResponse | null> => {
    return execute('llm', () => hub.generateResponse(request, createContext(options?.context)), options);
  }, [hub, createContext, execute]);

  const chat = useCallback(async (
    request: ChatRequest,
    options?: { silent?: boolean; context?: Partial<AIRequestContext> }
  ): Promise<ChatResponse | null> => {
    return execute('llm', () => hub.chat(request, createContext(options?.context)), options);
  }, [hub, createContext, execute]);

  // Simple chat helper
  const sendMessage = useCallback(async (
    message: string,
    conversationHistory: ChatMessage[] = [],
    options?: { provider?: AIProviderKey; systemPrompt?: string }
  ): Promise<string | null> => {
    const messages: ChatMessage[] = [
      ...(options?.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
      ...conversationHistory,
      { role: 'user' as const, content: message },
    ];
    
    const response = await chat({ messages, provider: options?.provider });
    return response?.content || null;
  }, [chat]);

  // ============================================
  // TRANSLATION OPERATIONS
  // ============================================

  const translate = useCallback(async (
    request: TranslationRequest,
    options?: { silent?: boolean; context?: Partial<AIRequestContext> }
  ): Promise<TranslationResponse | null> => {
    const result = await execute('translation', () => hub.translate(request, createContext(options?.context)), options);
    if (result && !options?.silent) {
      showSuccess('Translation Complete', 
        `${result.metadata.wordCount} words translated with ${(result.confidence.overall * 100).toFixed(0)}% confidence`);
    }
    return result;
  }, [hub, createContext, execute, showSuccess]);

  // Simple translate helper
  const translateText = useCallback(async (
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'auto',
    options?: { provider?: AIProviderKey; domain?: TranslationRequest['domain'] }
  ): Promise<string | null> => {
    const response = await translate({
      text,
      sourceLanguage,
      targetLanguage,
      provider: options?.provider,
      domain: options?.domain,
    }, { silent: true });
    return response?.translatedText || null;
  }, [translate]);

  // ============================================
  // VISION / OCR OPERATIONS
  // ============================================

  const analyzeImage = useCallback(async (
    request: VisionRequest,
    options?: { silent?: boolean; context?: Partial<AIRequestContext> }
  ): Promise<VisionResponse | null> => {
    return execute('vision', () => hub.analyzeImage(request, createContext(options?.context)), options);
  }, [hub, createContext, execute]);

  const performOCR = useCallback(async (
    request: Omit<VisionRequest, 'operation'>,
    options?: { silent?: boolean; context?: Partial<AIRequestContext> }
  ): Promise<VisionResponse | null> => {
    const result = await execute('ocr', () => hub.performOCR({ ...request, operation: 'ocr' }, createContext(options?.context)), options);
    if (result && !options?.silent) {
      showSuccess('OCR Complete', 
        `Extracted text with ${(result.confidence.overall * 100).toFixed(0)}% confidence`);
    }
    return result;
  }, [hub, createContext, execute, showSuccess]);

  // ============================================
  // TTS / STT OPERATIONS
  // ============================================

  const generateSpeech = useCallback(async (
    request: TTSRequest,
    options?: { silent?: boolean; context?: Partial<AIRequestContext> }
  ): Promise<TTSResponse | null> => {
    const result = await execute('tts', () => hub.generateSpeech(request, createContext(options?.context)), options);
    if (result && !options?.silent) {
      showSuccess('Speech Generated', 
        `${result.metadata.characterCount} characters, ${result.duration.toFixed(1)}s duration`);
    }
    return result;
  }, [hub, createContext, execute, showSuccess]);

  const transcribeAudio = useCallback(async (
    request: STTRequest,
    options?: { silent?: boolean; context?: Partial<AIRequestContext> }
  ): Promise<STTResponse | null> => {
    const result = await execute('stt', () => hub.transcribeAudio(request, createContext(options?.context)), options);
    if (result && !options?.silent) {
      showSuccess('Transcription Complete', 
        `${result.metadata.wordCount} words transcribed`);
    }
    return result;
  }, [hub, createContext, execute, showSuccess]);

  // ============================================
  // IMAGE / VIDEO GENERATION
  // ============================================

  const generateImage = useCallback(async (
    request: ImageGenRequest,
    options?: { silent?: boolean; context?: Partial<AIRequestContext> }
  ): Promise<ImageGenResponse | null> => {
    const result = await execute('image_gen', () => hub.generateImage(request, createContext(options?.context)), options);
    if (result && !options?.silent) {
      showSuccess('Image Generated', `${result.images.length} image(s) created`);
    }
    return result;
  }, [hub, createContext, execute, showSuccess]);

  const generateVideo = useCallback(async (
    request: VideoGenRequest,
    options?: { silent?: boolean; context?: Partial<AIRequestContext> }
  ): Promise<VideoGenResponse | null> => {
    showInfo('Generating Video', 'This may take a minute...');
    const result = await execute('video_gen', () => hub.generateVideo(request, createContext(options?.context)), options);
    if (result && !options?.silent) {
      showSuccess('Video Generated', `${result.duration}s video created`);
    }
    return result;
  }, [hub, createContext, execute, showSuccess, showInfo]);

  // ============================================
  // MUSIC / SFX GENERATION
  // ============================================

  const generateMusic = useCallback(async (
    request: MusicGenRequest,
    options?: { silent?: boolean; context?: Partial<AIRequestContext> }
  ): Promise<MusicGenResponse | null> => {
    showInfo('Generating Music', 'Creating your track...');
    const result = await execute('music_gen', () => hub.generateMusic(request, createContext(options?.context)), options);
    if (result && !options?.silent) {
      showSuccess('Music Generated', `${result.duration}s track created`);
    }
    return result;
  }, [hub, createContext, execute, showSuccess, showInfo]);

  const generateSFX = useCallback(async (
    request: SFXGenRequest,
    options?: { silent?: boolean; context?: Partial<AIRequestContext> }
  ): Promise<SFXGenResponse | null> => {
    const result = await execute('sfx_gen', () => hub.generateSFX(request, createContext(options?.context)), options);
    if (result && !options?.silent) {
      showSuccess('Sound Effect Generated', `${result.duration}s effect created`);
    }
    return result;
  }, [hub, createContext, execute, showSuccess]);

  // ============================================
  // NLP OPERATIONS
  // ============================================

  const processNLP = useCallback(async (
    request: NLPRequest,
    options?: { silent?: boolean; context?: Partial<AIRequestContext> }
  ): Promise<NLPResponse | null> => {
    return execute('nlp', () => hub.processNLP(request, createContext(options?.context)), options);
  }, [hub, createContext, execute]);

  // NLP helpers
  const extractEntities = useCallback(async (text: string, domain?: string) => {
    const result = await processNLP({ text, operations: ['entity_extraction'], domain }, { silent: true });
    return result?.entities || [];
  }, [processNLP]);

  const analyzeSentiment = useCallback(async (text: string) => {
    const result = await processNLP({ text, operations: ['sentiment_analysis'] }, { silent: true });
    return result?.sentiment || null;
  }, [processNLP]);

  const summarize = useCallback(async (text: string) => {
    const result = await processNLP({ text, operations: ['summarization'] }, { silent: true });
    return result?.summary || null;
  }, [processNLP]);

  // ============================================
  // AGENT WORKFLOW OPERATIONS
  // ============================================

  const generateAgentWorkflow = useCallback(async (
    request: AgentWorkflowRequest,
    options?: { silent?: boolean; context?: Partial<AIRequestContext> }
  ): Promise<AgentWorkflowResponse | null> => {
    const result = await execute('llm', () => hub.generateAgentWorkflow(request, createContext(options?.context)), options);
    if (result && !options?.silent) {
      showSuccess('Agent Workflow Generated', 'Workflow created successfully');
    }
    return result;
  }, [hub, createContext, execute, showSuccess]);

  // ============================================
  // UTILITIES
  // ============================================

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const getAvailableProviders = useCallback((capability: AICapability) => {
    return getProvidersForCapability(capability);
  }, []);

  const setPreferredProvider = useCallback((capability: AICapability, provider: AIProviderKey) => {
    hub.updateConfig({
      defaultProviders: {
        ...hub.getConfig().defaultProviders,
        [capability]: provider,
      },
    });
  }, [hub]);

  // ============================================
  // RETURN HOOK VALUE
  // ============================================

  return {
    // State
    ...state,
    
    // LLM / Chat
    generateResponse,
    chat,
    sendMessage,
    
    // Translation
    translate,
    translateText,
    
    // Vision / OCR
    analyzeImage,
    performOCR,
    
    // TTS / STT
    generateSpeech,
    transcribeAudio,
    
    // Image / Video Generation
    generateImage,
    generateVideo,
    
    // Music / SFX Generation
    generateMusic,
    generateSFX,
    
    // NLP
    processNLP,
    extractEntities,
    analyzeSentiment,
    summarize,
    
    // Agent Workflows
    generateAgentWorkflow,
    
    // Utilities
    clearError,
    getAvailableProviders,
    setPreferredProvider,
    getConfig: () => hub.getConfig(),
    getProviderRegistry: () => hub.getProviderRegistry(),
  };
}

export default useUniversalAIHub;
