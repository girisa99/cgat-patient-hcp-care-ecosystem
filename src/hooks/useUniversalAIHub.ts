/**
 * useUniversalAIHub Hook
 * 
 * SINGLE SOURCE OF TRUTH for ALL AI capabilities across the Genie Suite.
 * Consolidates: LLM, Translation, Vision/OCR, TTS/STT, Image/Video Gen, Music/SFX, NLP
 * 
 * Integrates with useContextualAIProviders for dynamic provider selection
 * based on Genie product context (Deck, Spark, Mind, Vibe, Arc, Ask Genie).
 * 
 * @example
 * // In Genie Deck (presentation generation)
 * const ai = useUniversalAIHub({ product: 'deck' });
 * const { recommendations } = ai.contextualProviders; // Get best providers for Deck
 * 
 * @example
 * // In Genie Vibe (recording studio)
 * const ai = useUniversalAIHub({ product: 'vibe', scenario: 'tts' });
 * await ai.generateSpeech({ text: "Hello", voice: "nova" });
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { UniversalAIHub, getUniversalAIHub } from '@/services/ai-hub/UniversalAIHub';
import { getProvidersForCapability } from '@/services/ai-hub/providerRegistry';
import { 
  useContextualAIProviders, 
  type GenieProduct as ContextualGenieProduct,
  type TaskScenario,
  type ProviderRecommendation 
} from '@/hooks/useContextualAIProviders';
import { useEcosystemRouting } from '@/hooks/useEcosystemRouting';
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
  /** Optional scenario to filter providers (e.g., 'tts', 'translate', 'image-gen') */
  scenario?: TaskScenario;
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
    scenario,
    config, 
    preferredProviders,
    costSensitive = false,
    qualityFirst = false,
  } = options;
  
  const { showError, showSuccess, showInfo } = useMasterToast();

  // Integrate ecosystem routing with IP-based detection
  const ecosystemRouting = useEcosystemRouting(product as any);

  // Integrate contextual provider selection
  const contextualProviders = useContextualAIProviders(
    product as ContextualGenieProduct,
    scenario
  );

  const [state, setState] = useState<AIHubState>({
    isLoading: false,
    error: null,
    lastCapability: null,
    lastProvider: null,
    configuredProviders: new Set(),
  });

  // Get hub instance with ecosystem routing
  const hub = useMemo(() => {
    const hubConfig: Partial<AIHubConfig> = {
      ...config,
      costSensitive,
      qualityFirst,
    };
    
    // Apply ecosystem routing defaults based on detected region
    if (ecosystemRouting.isDetected && !preferredProviders) {
      hubConfig.defaultProviders = {
        llm: ecosystemRouting.routing.llm as AIProviderKey,
        tts: ecosystemRouting.routing.tts as AIProviderKey,
        stt: ecosystemRouting.routing.stt as AIProviderKey,
        translation: ecosystemRouting.routing.translation as AIProviderKey,
      };
    } else if (preferredProviders) {
      hubConfig.defaultProviders = preferredProviders;
    }
    
    return getUniversalAIHub(hubConfig);
  }, [config, preferredProviders, costSensitive, qualityFirst, ecosystemRouting.isDetected, ecosystemRouting.routing]);

  // Create context for operations with regional info
  const createContext = useCallback((
    overrides?: Partial<AIRequestContext>
  ): AIRequestContext => ({
    product,
    correlationId: crypto.randomUUID(),
    costSensitive,
    qualityFirst,
    regionCode: ecosystemRouting.countryCode,
    zone: ecosystemRouting.zone,
    isRTL: ecosystemRouting.isRTL,
    ...overrides,
  }), [product, costSensitive, qualityFirst, ecosystemRouting.countryCode, ecosystemRouting.zone, ecosystemRouting.isRTL]);

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
    
    // Contextual Provider Selection (integrated from useContextualAIProviders)
    contextualProviders,
    recommendations: contextualProviders.recommendations,
    primaryProvider: contextualProviders.primaryProvider,
    fallbackChain: contextualProviders.fallbackChain,
    getBestProvider: contextualProviders.getBestProvider,
    hasCapability: contextualProviders.hasCapability,
    
    // Ecosystem Routing (4-Zone LLM routing with IP detection)
    ecosystemRouting,
    regionCode: ecosystemRouting.countryCode,
    zone: ecosystemRouting.zone,
    isRTL: ecosystemRouting.isRTL,
    regionalMoat: ecosystemRouting.moat,
  };
}

// Re-export types for convenience
export type { TaskScenario, ProviderRecommendation };
export { useContextualAIProviders };

export default useUniversalAIHub;
