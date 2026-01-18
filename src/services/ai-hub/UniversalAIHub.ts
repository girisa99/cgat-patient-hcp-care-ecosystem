/**
 * Universal AI Hub
 * 
 * Single entry point for ALL AI capabilities across the Genie Suite.
 * Consolidates: LLM, Translation, Vision/OCR, TTS/STT, Image/Video Gen, Music/SFX, NLP
 * 
 * Extends useUniversalAI (LLM) + translationService + UniversalMediaAdapter
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  AI_PROVIDER_REGISTRY,
  getProvidersForCapability,
  getRecommendedProvider,
  getFallbackChain,
  type AICapability,
  type AIProviderKey,
} from './providerRegistry';
import type {
  AIRequestContext,
  ConfidenceScore,
  LLMRequest, LLMResponse,
  ChatRequest, ChatResponse,
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
  AIHubConfig,
} from './types';

// ============================================
// DEFAULT CONFIGURATION
// ============================================

const DEFAULT_CONFIG: AIHubConfig = {
  defaultProviders: {
    llm: 'gemini',
    translation: 'google',
    ocr: 'google',
    tts: 'azure',
    stt: 'openai',
    image_gen: 'gemini',
    video_gen: 'replicate',
    music_gen: 'elevenlabs',
    sfx_gen: 'elevenlabs',
    vision: 'gemini',
    nlp: 'gemini',
  },
  enableFallback: true,
  maxRetries: 3,
  timeoutMs: 60000,
  costSensitive: false,
  qualityFirst: false,
};

// ============================================
// UNIVERSAL AI HUB CLASS
// ============================================

export class UniversalAIHub {
  private config: AIHubConfig;
  private configuredProviders: Set<AIProviderKey> = new Set();

  constructor(config: Partial<AIHubConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================
  // PROVIDER MANAGEMENT
  // ============================================

  /**
   * Get best provider for a capability
   */
  async getBestProvider(
    capability: AICapability,
    context?: AIRequestContext
  ): Promise<AIProviderKey> {
    // Check for user preference
    if (context?.preferredProvider) {
      const provider = AI_PROVIDER_REGISTRY[context.preferredProvider];
      if (provider?.capabilities.includes(capability)) {
        return context.preferredProvider;
      }
    }

    // Get recommendation based on context
    const recommended = getRecommendedProvider(capability, {
      language: context?.language,
      domain: context?.domain,
      costSensitive: context?.costSensitive ?? this.config.costSensitive,
      qualityFirst: context?.qualityFirst ?? this.config.qualityFirst,
    });

    return recommended || this.config.defaultProviders[capability] || 'gemini';
  }

  /**
   * Execute with fallback chain
   */
  private async executeWithFallback<T>(
    capability: AICapability,
    executor: (provider: AIProviderKey) => Promise<T>,
    context?: AIRequestContext
  ): Promise<T> {
    const primaryProvider = await this.getBestProvider(capability, context);
    const fallbackChain = this.config.enableFallback 
      ? getFallbackChain(capability) 
      : [primaryProvider];

    let lastError: Error | null = null;

    for (const provider of fallbackChain) {
      try {
        return await executor(provider);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Provider ${provider} failed for ${capability}:`, lastError.message);
        continue;
      }
    }

    throw lastError || new Error(`All providers failed for ${capability}`);
  }

  // ============================================
  // LLM / CHAT OPERATIONS
  // ============================================

  async generateResponse(request: LLMRequest, context?: AIRequestContext): Promise<LLMResponse> {
    return this.executeWithFallback('llm', async (provider) => {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'generate',
          provider: this.mapProviderToEdgeFunction(provider),
          model: request.model,
          prompt: request.prompt,
          systemPrompt: request.systemPrompt,
          temperature: request.temperature ?? 0.7,
          maxTokens: request.maxTokens ?? 1000,
          context: request.context,
        },
      });

      if (error) throw new Error(error.message);

      return {
        content: data.content,
        confidence: this.createConfidence(0.9, provider, Date.now() - startTime),
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
      };
    }, context);
  }

  async chat(request: ChatRequest, context?: AIRequestContext): Promise<ChatResponse> {
    return this.executeWithFallback('llm', async (provider) => {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'chat',
          provider: this.mapProviderToEdgeFunction(provider),
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          maxTokens: request.maxTokens ?? 1000,
        },
      });

      if (error) throw new Error(error.message);

      return {
        content: data.content,
        messages: [...request.messages, { role: 'assistant' as const, content: data.content }],
        confidence: this.createConfidence(0.9, provider, Date.now() - startTime),
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
      };
    }, context);
  }

  // ============================================
  // TRANSLATION OPERATIONS
  // ============================================

  async translate(request: TranslationRequest, context?: AIRequestContext): Promise<TranslationResponse> {
    // Enhance context with language info for better provider selection
    const enhancedContext: AIRequestContext = {
      ...context,
      language: request.sourceLanguage,
      domain: request.domain,
      product: context?.product || 'spark',
    };

    return this.executeWithFallback('translation', async (provider) => {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'translate',
          provider: this.mapProviderToEdgeFunction(provider),
          text: request.text,
          sourceLanguage: request.sourceLanguage,
          targetLanguage: request.targetLanguage,
          formality: request.formality,
          domain: request.domain,
          glossary: request.glossary,
          preserveFormatting: request.preserveFormatting,
        },
      });

      if (error) throw new Error(error.message);

      return {
        translatedText: data.translatedText || data.content,
        confidence: this.createConfidence(
          data.confidence || 0.85, 
          provider, 
          Date.now() - startTime
        ),
        detectedLanguage: data.detectedLanguage,
        alternativeTranslations: data.alternativeTranslations,
        metadata: {
          characterCount: request.text.length,
          wordCount: request.text.split(/\s+/).length,
          estimatedCost: data.estimatedCost || 0,
        },
      };
    }, enhancedContext);
  }

  // ============================================
  // VISION / OCR OPERATIONS
  // ============================================

  async analyzeImage(request: VisionRequest, context?: AIRequestContext): Promise<VisionResponse> {
    return this.executeWithFallback('vision', async (provider) => {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'vision',
          provider: this.mapProviderToEdgeFunction(provider),
          image: request.image,
          inputType: request.inputType,
          operation: request.operation,
          prompt: request.prompt,
          documentType: request.documentType,
          language: request.language,
        },
      });

      if (error) throw new Error(error.message);

      return {
        content: data.content || data.text,
        confidence: this.createConfidence(data.confidence || 0.85, provider, Date.now() - startTime),
        structure: data.structure,
        metadata: {
          detectedLanguage: data.detectedLanguage,
          pageCount: data.pageCount,
        },
      };
    }, context);
  }

  async performOCR(request: VisionRequest, context?: AIRequestContext): Promise<VisionResponse> {
    return this.analyzeImage({ ...request, operation: 'ocr' }, context);
  }

  // ============================================
  // TTS / STT OPERATIONS
  // ============================================

  async generateSpeech(request: TTSRequest, context?: AIRequestContext): Promise<TTSResponse> {
    return this.executeWithFallback('tts', async (provider) => {
      const startTime = Date.now();
      
      // Route to appropriate edge function
      const functionName = provider === 'azure' ? 'azure-tts' : 'universal-media-processor';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: provider === 'azure' ? {
          text: request.text,
          voice: request.voice,
          speed: request.speed,
          pitch: request.pitch,
          style: request.style,
        } : {
          operation: 'tts',
          provider,
          text: request.text,
          voice: request.voice,
          language: request.language,
          speed: request.speed,
          pitch: request.pitch,
          style: request.style,
          outputFormat: request.outputFormat,
        },
      });

      if (error) throw new Error(error.message);

      return {
        audioUrl: data.audioUrl || data.audio_url,
        audioBlob: data.audioBlob,
        duration: data.duration || 0,
        confidence: this.createConfidence(0.9, provider, Date.now() - startTime),
        voice: request.voice || 'default',
        metadata: {
          characterCount: request.text.length,
          estimatedCost: data.estimatedCost || 0,
          format: request.outputFormat || 'mp3',
        },
      };
    }, context);
  }

  async transcribeAudio(request: STTRequest, context?: AIRequestContext): Promise<STTResponse> {
    return this.executeWithFallback('stt', async (provider) => {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('universal-media-processor', {
        body: {
          operation: 'stt',
          provider,
          audio: request.audio,
          inputType: request.inputType,
          language: request.language,
          options: request.options,
        },
      });

      if (error) throw new Error(error.message);

      return {
        text: data.text,
        confidence: this.createConfidence(data.confidence || 0.85, provider, Date.now() - startTime),
        language: data.language,
        words: data.words,
        speakers: data.speakers,
        metadata: {
          durationSeconds: data.durationSeconds || 0,
          wordCount: data.text?.split(/\s+/).length || 0,
        },
      };
    }, context);
  }

  // ============================================
  // IMAGE GENERATION OPERATIONS
  // ============================================

  async generateImage(request: ImageGenRequest, context?: AIRequestContext): Promise<ImageGenResponse> {
    return this.executeWithFallback('image_gen', async (provider) => {
      const startTime = Date.now();
      
      // For Gemini, use Lovable AI Gateway
      if (provider === 'gemini') {
        return this.generateImageWithGemini(request, startTime);
      }

      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt: request.prompt,
          provider: this.mapImageProvider(provider),
          size: request.size || '1024x1024',
          quality: request.quality || 'standard',
          n: request.numberOfImages || 1,
          negativePrompt: request.negativePrompt,
          referenceImage: request.referenceImage,
        },
      });

      if (error) throw new Error(error.message);

      return {
        images: Array.isArray(data.images) 
          ? data.images.map((img: any) => ({
              url: img.url || img.imageUrl,
              base64: img.base64,
              width: 1024,
              height: 1024,
              format: 'png',
            }))
          : [{ url: data.imageUrl, width: 1024, height: 1024, format: 'png' }],
        confidence: this.createConfidence(0.85, provider, Date.now() - startTime),
        metadata: {
          promptUsed: request.prompt,
          revisedPrompt: data.revisedPrompt,
          estimatedCost: 0.02,
        },
      };
    }, context);
  }

  private async generateImageWithGemini(request: ImageGenRequest, startTime: number): Promise<ImageGenResponse> {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'image_generation',
        model: 'google/gemini-2.5-flash-image-preview',
        prompt: request.prompt,
        modalities: ['image', 'text'],
      },
    });

    if (error) throw new Error(error.message);

    const images = data.images || [];
    return {
      images: images.map((img: any) => ({
        url: img.image_url?.url || img.url || '',
        base64: img.base64,
        width: 1024,
        height: 1024,
        format: 'png',
      })),
      confidence: this.createConfidence(0.9, 'gemini', Date.now() - startTime),
      metadata: {
        promptUsed: request.prompt,
        revisedPrompt: data.revisedPrompt,
        estimatedCost: 0.002,
      },
    };
  }

  // ============================================
  // VIDEO GENERATION OPERATIONS
  // ============================================

  async generateVideo(request: VideoGenRequest, context?: AIRequestContext): Promise<VideoGenResponse> {
    return this.executeWithFallback('video_gen', async (provider) => {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('ai-video-generator', {
        body: {
          prompt: request.prompt,
          provider: this.mapVideoProvider(provider),
          duration: request.duration || 5,
          aspectRatio: request.aspectRatio || '16:9',
          quality: request.quality || 'standard',
          referenceImage: request.referenceImage,
        },
      });

      if (error) throw new Error(error.message);

      return {
        videoUrl: data.videoUrl || data.video_url,
        thumbnailUrl: data.thumbnailUrl,
        duration: request.duration || 5,
        confidence: this.createConfidence(0.8, provider, Date.now() - startTime),
        metadata: {
          promptUsed: request.prompt,
          estimatedCost: 0.05,
          format: 'mp4',
        },
      };
    }, context);
  }

  // ============================================
  // MUSIC / SFX GENERATION OPERATIONS
  // ============================================

  async generateMusic(request: MusicGenRequest, context?: AIRequestContext): Promise<MusicGenResponse> {
    return this.executeWithFallback('music_gen', async (provider) => {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-music', {
        body: {
          prompt: request.prompt,
          duration: request.duration || 30,
        },
      });

      if (error) throw new Error(error.message);

      return {
        audioUrl: data.audioUrl || URL.createObjectURL(new Blob([data], { type: 'audio/mpeg' })),
        duration: request.duration || 30,
        confidence: this.createConfidence(0.85, provider, Date.now() - startTime),
        metadata: {
          promptUsed: request.prompt,
          estimatedCost: 0.01,
        },
      };
    }, context);
  }

  async generateSFX(request: SFXGenRequest, context?: AIRequestContext): Promise<SFXGenResponse> {
    return this.executeWithFallback('sfx_gen', async (provider) => {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-sfx', {
        body: {
          prompt: request.prompt,
          duration: request.duration || 5,
          prompt_influence: request.promptInfluence || 0.3,
        },
      });

      if (error) throw new Error(error.message);

      return {
        audioUrl: data.audioUrl || URL.createObjectURL(new Blob([data], { type: 'audio/mpeg' })),
        duration: request.duration || 5,
        confidence: this.createConfidence(0.85, provider, Date.now() - startTime),
        metadata: {
          promptUsed: request.prompt,
          estimatedCost: 0.005,
        },
      };
    }, context);
  }

  // ============================================
  // NLP OPERATIONS
  // ============================================

  async processNLP(request: NLPRequest, context?: AIRequestContext): Promise<NLPResponse> {
    return this.executeWithFallback('nlp', async (provider) => {
      const startTime = Date.now();
      
      const systemPrompt = this.buildNLPSystemPrompt(request.operations, request.domain);
      
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'nlp',
          provider: this.mapProviderToEdgeFunction(provider),
          prompt: request.text,
          systemPrompt,
          operations: request.operations,
          language: request.language,
          domain: request.domain,
        },
      });

      if (error) throw new Error(error.message);

      return {
        entities: data.entities,
        sentiment: data.sentiment,
        summary: data.summary,
        keywords: data.keywords,
        classification: data.classification,
        language: data.language,
        confidence: this.createConfidence(0.85, provider, Date.now() - startTime),
      };
    }, context);
  }

  // ============================================
  // AGENT WORKFLOW OPERATIONS
  // ============================================

  async generateAgentWorkflow(request: AgentWorkflowRequest, context?: AIRequestContext): Promise<AgentWorkflowResponse> {
    return this.executeWithFallback('llm', async (provider) => {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('generate-agent-from-prompt', {
        body: {
          prompt: request.prompt,
          provider: this.mapProviderToEdgeFunction(provider),
          includeTemplates: request.includeTemplates ?? true,
          generateConnections: request.generateConnections ?? true,
        },
      });

      if (error) throw new Error(error.message);

      return {
        workflow: data,
        confidence: this.createConfidence(0.8, provider, Date.now() - startTime),
        suggestions: data.suggestions,
      };
    }, context);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private mapProviderToEdgeFunction(provider: AIProviderKey): string {
    const mapping: Record<string, string> = {
      openai: 'openai',
      claude: 'claude',
      gemini: 'gemini',
      deepseek: 'deepseek',
      alibaba: 'qwen',
      azure: 'azure',
    };
    return mapping[provider] || 'gemini';
  }

  private mapImageProvider(provider: AIProviderKey): string {
    const mapping: Record<string, string> = {
      openai: 'openai',
      alibaba: 'alibaba',
      stability: 'stability',
      huggingface: 'huggingface',
      replicate: 'replicate',
    };
    return mapping[provider] || 'openai';
  }

  private mapVideoProvider(provider: AIProviderKey): string {
    const mapping: Record<string, string> = {
      openai: 'openai',
      alibaba: 'alibaba',
      replicate: 'replicate',
      google: 'google',
    };
    return mapping[provider] || 'replicate';
  }

  private buildNLPSystemPrompt(operations: string[], domain?: string): string {
    const operationInstructions = operations.map(op => {
      switch (op) {
        case 'entity_extraction': return 'Extract all named entities';
        case 'sentiment_analysis': return 'Analyze sentiment (positive/negative/neutral)';
        case 'summarization': return 'Provide a concise summary';
        case 'keyword_extraction': return 'Extract key terms with relevance scores';
        case 'classification': return 'Classify the content';
        case 'language_detection': return 'Detect the language';
        default: return '';
      }
    }).filter(Boolean).join('\n- ');

    return `You are an expert NLP processor. Perform:
- ${operationInstructions}
${domain ? `Domain: ${domain}` : ''}
Return JSON with keys matching the requested operations.`;
  }

  private createConfidence(
    overall: number,
    provider: string,
    processingTimeMs: number,
    fallbackUsed?: string
  ): ConfidenceScore {
    return {
      overall,
      breakdown: {
        accuracy: overall,
        completeness: overall * 0.95,
        quality: overall * 0.9,
        reliability: 0.95,
      },
      provider,
      processingTimeMs,
      fallbackUsed,
    };
  }

  // ============================================
  // PUBLIC UTILITIES
  // ============================================

  getProvidersForCapability(capability: AICapability) {
    return getProvidersForCapability(capability);
  }

  getProviderRegistry() {
    return AI_PROVIDER_REGISTRY;
  }

  updateConfig(config: Partial<AIHubConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): AIHubConfig {
    return { ...this.config };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let hubInstance: UniversalAIHub | null = null;

export function getUniversalAIHub(config?: Partial<AIHubConfig>): UniversalAIHub {
  if (!hubInstance) {
    hubInstance = new UniversalAIHub(config);
  } else if (config) {
    hubInstance.updateConfig(config);
  }
  return hubInstance;
}

export default UniversalAIHub;
