/**
 * Universal Media Adapter
 * 
 * Unified service for OCR, TTS/STT, Image Generation, and NLP operations
 * with dynamic provider selection, fallback chains, and confidence scoring.
 * 
 * Works across all Genie Suite products: Spark, Mind, Vibe, Arc, Deck, Hub, Ask Genie
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  OCRRequest, OCRResult, OCRProvider,
  TTSRequest, TTSResult, TTSProvider,
  STTRequest, STTResult, STTProvider,
  ImageGenRequest, ImageGenResult, ImageGenProvider,
  NLPRequest, NLPResult, NLPProvider,
  ConfidenceScore,
  MediaAdapterConfig,
  MediaRequestContext,
  MediaProviderConfig,
} from './types';
import {
  OCR_PROVIDERS,
  TTS_PROVIDERS,
  STT_PROVIDERS,
  IMAGE_GEN_PROVIDERS,
  NLP_PROVIDERS,
  DEFAULT_ADAPTER_CONFIG,
  getFallbackChain,
  getProviderById,
} from './providerConfig';

// ============================================
// UNIVERSAL MEDIA ADAPTER CLASS
// ============================================

export class UniversalMediaAdapter {
  private config: MediaAdapterConfig;
  private configuredProviders: Set<string> = new Set();

  constructor(config: Partial<MediaAdapterConfig> = {}) {
    this.config = { ...DEFAULT_ADAPTER_CONFIG, ...config };
  }

  // ============================================
  // PROVIDER AVAILABILITY
  // ============================================

  /**
   * Check which providers are configured (have API keys)
   */
  async checkConfiguredProviders(): Promise<Set<string>> {
    // This would ideally check against secrets, but we'll use a simplified approach
    // The actual key validation happens in edge functions
    const knownConfigured = new Set<string>([
      'tesseract', // Always available
      'gemini_nano_banana', // Via Lovable AI
      'gemini_3_pro', // Via Lovable AI
      'gemini', // Via Lovable AI for NLP
    ]);

    // Check for known secrets - these would be validated at runtime
    const secretMappings: Record<string, string[]> = {
      'GOOGLE_API_KEY': ['google_vision', 'google'],
      'AZURE_FORM_RECOGNIZER_KEY': ['azure_doc_intel'],
      'AZURE_COGNITIVE_KEY': ['azure_cv'],
      'AZURE_SPEECH_KEY': ['azure'],
      'ALIBABA_API_KEY': ['alibaba_qwen_vl', 'alibaba_voice', 'alibaba_wanx', 'alibaba_qwen'],
      'ELEVENLABS_API_KEY': ['elevenlabs'],
      'OPENAI_API_KEY': ['openai', 'openai_whisper', 'openai_dalle'],
      'DEEPSEEK_API_KEY': ['deepseek'],
      'HUGGINGFACE_TOKEN': ['huggingface'],
      'REPLICATE_API_TOKEN': ['replicate'],
      'STABILITY_API_KEY': ['stability'],
      'ANTHROPIC_API_KEY': ['claude'],
    };

    // In a real implementation, we'd check Supabase secrets
    // For now, we return the known configured set
    this.configuredProviders = knownConfigured;
    return this.configuredProviders;
  }

  /**
   * Get best available provider for a capability
   */
  async getBestProvider(
    capability: 'ocr' | 'tts' | 'stt' | 'image_gen' | 'nlp',
    preferredProvider?: string
  ): Promise<string | null> {
    await this.checkConfiguredProviders();
    
    const fallbackChain = getFallbackChain(capability, this.config);
    
    // If preferred provider is available, use it
    if (preferredProvider && this.configuredProviders.has(preferredProvider)) {
      return preferredProvider;
    }

    // Find first available provider in fallback chain
    for (const provider of fallbackChain) {
      if (this.configuredProviders.has(provider)) {
        return provider;
      }
    }

    return null;
  }

  // ============================================
  // OCR OPERATIONS
  // ============================================

  /**
   * Perform OCR with automatic provider selection and fallback
   */
  async performOCR(
    request: OCRRequest,
    context?: MediaRequestContext
  ): Promise<OCRResult> {
    const startTime = Date.now();
    const provider = request.provider || await this.getBestProvider('ocr') as OCRProvider;
    
    if (!provider) {
      throw new Error('No OCR provider available');
    }

    let lastError: Error | null = null;
    const fallbackChain = this.config.enableFallback 
      ? getFallbackChain('ocr', this.config) 
      : [provider];

    for (const currentProvider of fallbackChain) {
      try {
        const result = await this.executeOCR(request, currentProvider as OCRProvider);
        result.fallbackUsed = currentProvider !== provider ? currentProvider as OCRProvider : undefined;
        result.metadata.processingTimeMs = Date.now() - startTime;
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`OCR provider ${currentProvider} failed:`, lastError.message);
        continue;
      }
    }

    throw lastError || new Error('All OCR providers failed');
  }

  private async executeOCR(request: OCRRequest, provider: OCRProvider): Promise<OCRResult> {
    const { data, error } = await supabase.functions.invoke('universal-media-processor', {
      body: {
        operation: 'ocr',
        provider,
        input: request.input,
        inputType: request.inputType,
        documentType: request.documentType,
        language: request.language,
        extractStructure: request.extractStructure,
        handwritingMode: request.handwritingMode,
        options: request.options,
      },
    });

    if (error) throw new Error(error.message);
    return data as OCRResult;
  }

  // ============================================
  // TTS OPERATIONS
  // ============================================

  /**
   * Generate speech from text with automatic provider selection
   */
  async generateSpeech(
    request: TTSRequest,
    context?: MediaRequestContext
  ): Promise<TTSResult> {
    const startTime = Date.now();
    const provider = request.provider || await this.getBestProvider('tts') as TTSProvider;
    
    if (!provider) {
      throw new Error('No TTS provider available');
    }

    let lastError: Error | null = null;
    const fallbackChain = this.config.enableFallback 
      ? getFallbackChain('tts', this.config) 
      : [provider];

    for (const currentProvider of fallbackChain) {
      try {
        const result = await this.executeTTS(request, currentProvider as TTSProvider);
        result.confidence.processingTimeMs = Date.now() - startTime;
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`TTS provider ${currentProvider} failed:`, lastError.message);
        continue;
      }
    }

    throw lastError || new Error('All TTS providers failed');
  }

  private async executeTTS(request: TTSRequest, provider: TTSProvider): Promise<TTSResult> {
    // Route to appropriate edge function based on provider
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
        options: request.options,
      },
    });

    if (error) throw new Error(error.message);
    return this.normalizeTTSResult(data, provider);
  }

  private normalizeTTSResult(data: any, provider: TTSProvider): TTSResult {
    return {
      audioUrl: data.audioUrl || data.audio_url,
      audioBlob: data.audioBlob,
      duration: data.duration || 0,
      confidence: this.createConfidenceScore(0.9, provider, data.processingTimeMs || 0),
      provider,
      voice: data.voice || 'default',
      metadata: {
        characterCount: data.characterCount || data.charactersProcessed || 0,
        estimatedCost: data.estimatedCost || 0,
        format: data.format || 'mp3',
      },
    };
  }

  // ============================================
  // STT OPERATIONS
  // ============================================

  /**
   * Transcribe audio to text
   */
  async transcribeAudio(
    request: STTRequest,
    context?: MediaRequestContext
  ): Promise<STTResult> {
    const startTime = Date.now();
    const provider = request.provider || await this.getBestProvider('stt') as STTProvider;
    
    if (!provider) {
      throw new Error('No STT provider available');
    }

    let lastError: Error | null = null;
    const fallbackChain = this.config.enableFallback 
      ? getFallbackChain('stt', this.config) 
      : [provider];

    for (const currentProvider of fallbackChain) {
      try {
        const result = await this.executeSTT(request, currentProvider as STTProvider);
        result.metadata.processingTimeMs = Date.now() - startTime;
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`STT provider ${currentProvider} failed:`, lastError.message);
        continue;
      }
    }

    throw lastError || new Error('All STT providers failed');
  }

  private async executeSTT(request: STTRequest, provider: STTProvider): Promise<STTResult> {
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
    return data as STTResult;
  }

  // ============================================
  // IMAGE GENERATION OPERATIONS
  // ============================================

  /**
   * Generate images from text prompts
   */
  async generateImage(
    request: ImageGenRequest,
    context?: MediaRequestContext
  ): Promise<ImageGenResult> {
    const startTime = Date.now();
    const provider = request.provider || await this.getBestProvider('image_gen') as ImageGenProvider;
    
    if (!provider) {
      throw new Error('No image generation provider available');
    }

    let lastError: Error | null = null;
    const fallbackChain = this.config.enableFallback 
      ? getFallbackChain('image_gen', this.config) 
      : [provider];

    for (const currentProvider of fallbackChain) {
      try {
        const result = await this.executeImageGen(request, currentProvider as ImageGenProvider);
        result.metadata.processingTimeMs = Date.now() - startTime;
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Image gen provider ${currentProvider} failed:`, lastError.message);
        continue;
      }
    }

    throw lastError || new Error('All image generation providers failed');
  }

  private async executeImageGen(request: ImageGenRequest, provider: ImageGenProvider): Promise<ImageGenResult> {
    // For Gemini providers, use Lovable AI Gateway
    if (provider === 'gemini_nano_banana' || provider === 'gemini_3_pro') {
      return this.executeGeminiImageGen(request, provider);
    }

    const { data, error } = await supabase.functions.invoke('ai-image-generator', {
      body: {
        prompt: request.prompt,
        provider: this.mapImageProviderToEdgeFunction(provider),
        model: this.getImageModel(provider),
        size: request.size || '1024x1024',
        quality: request.quality || 'standard',
        n: request.numberOfImages || 1,
        negativePrompt: request.negativePrompt,
        referenceImage: request.referenceImage,
        options: request.options,
      },
    });

    if (error) throw new Error(error.message);
    return this.normalizeImageGenResult(data, provider, request.prompt);
  }

  private async executeGeminiImageGen(request: ImageGenRequest, provider: ImageGenProvider): Promise<ImageGenResult> {
    const model = provider === 'gemini_3_pro' 
      ? 'google/gemini-3-pro-image-preview' 
      : 'google/gemini-2.5-flash-image-preview';

    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'image_generation',
        model,
        prompt: request.prompt,
        modalities: ['image', 'text'],
      },
    });

    if (error) throw new Error(error.message);

    // Extract image from Gemini response
    const images = data.images || [];
    return {
      images: images.map((img: any) => ({
        url: img.image_url?.url || img.url || '',
        base64: img.base64,
        width: 1024,
        height: 1024,
        format: 'png',
      })),
      confidence: this.createConfidenceScore(0.9, provider, 0),
      provider,
      metadata: {
        promptUsed: request.prompt,
        revisedPrompt: data.revisedPrompt,
        processingTimeMs: 0,
        estimatedCost: provider === 'gemini_3_pro' ? 0.004 : 0.002,
      },
    };
  }

  private mapImageProviderToEdgeFunction(provider: ImageGenProvider): string {
    const mapping: Record<string, string> = {
      openai_dalle: 'openai',
      alibaba_wanx: 'alibaba',
      stability: 'stability',
      huggingface: 'huggingface',
      replicate: 'replicate',
    };
    return mapping[provider] || provider;
  }

  private getImageModel(provider: ImageGenProvider): string {
    const models: Record<string, string> = {
      openai_dalle: 'dall-e-3',
      alibaba_wanx: 'wanx-v1',
      stability: 'stable-diffusion-xl',
      huggingface: 'black-forest-labs/FLUX.1-schnell',
      replicate: 'black-forest-labs/flux-schnell',
    };
    return models[provider] || 'default';
  }

  private normalizeImageGenResult(data: any, provider: ImageGenProvider, prompt: string): ImageGenResult {
    const images = Array.isArray(data.images) ? data.images : [{ url: data.imageUrl || data.image_url }];
    return {
      images: images.map((img: any) => ({
        url: img.url || img.imageUrl || '',
        base64: img.base64,
        width: img.width || 1024,
        height: img.height || 1024,
        format: img.format || 'png',
      })),
      confidence: this.createConfidenceScore(0.85, provider, 0),
      provider,
      metadata: {
        promptUsed: prompt,
        revisedPrompt: data.revisedPrompt,
        processingTimeMs: 0,
        estimatedCost: 0.01,
      },
    };
  }

  // ============================================
  // NLP OPERATIONS
  // ============================================

  /**
   * Perform NLP operations (entity extraction, sentiment, etc.)
   */
  async processNLP(
    request: NLPRequest,
    context?: MediaRequestContext
  ): Promise<NLPResult> {
    const startTime = Date.now();
    const provider = request.provider || await this.getBestProvider('nlp') as NLPProvider;
    
    if (!provider) {
      throw new Error('No NLP provider available');
    }

    let lastError: Error | null = null;
    const fallbackChain = this.config.enableFallback 
      ? getFallbackChain('nlp', this.config) 
      : [provider];

    for (const currentProvider of fallbackChain) {
      try {
        const result = await this.executeNLP(request, currentProvider as NLPProvider);
        result.metadata.processingTimeMs = Date.now() - startTime;
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`NLP provider ${currentProvider} failed:`, lastError.message);
        continue;
      }
    }

    throw lastError || new Error('All NLP providers failed');
  }

  private async executeNLP(request: NLPRequest, provider: NLPProvider): Promise<NLPResult> {
    // Route NLP through ai-universal-processor (uses existing LLM infrastructure)
    const systemPrompt = this.buildNLPSystemPrompt(request.operations, request.domain);
    
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'nlp',
        provider: this.mapNLPProviderToUniversalAI(provider),
        prompt: request.text,
        systemPrompt,
        operations: request.operations,
        language: request.language,
        domain: request.domain,
        options: request.options,
      },
    });

    if (error) throw new Error(error.message);
    return this.normalizeNLPResult(data, provider, request.operations);
  }

  private mapNLPProviderToUniversalAI(provider: NLPProvider): string {
    const mapping: Record<string, string> = {
      gemini: 'gemini',
      claude: 'claude',
      openai: 'openai',
      deepseek: 'deepseek',
      alibaba_qwen: 'qwen',
    };
    return mapping[provider] || 'gemini';
  }

  private buildNLPSystemPrompt(operations: string[], domain?: string): string {
    const operationInstructions = operations.map(op => {
      switch (op) {
        case 'entity_extraction':
          return 'Extract all named entities (people, organizations, locations, dates, medical terms, etc.)';
        case 'sentiment_analysis':
          return 'Analyze the overall sentiment (positive/negative/neutral/mixed) with confidence score';
        case 'summarization':
          return 'Provide a concise summary of the main points';
        case 'keyword_extraction':
          return 'Extract key terms and phrases with relevance scores';
        case 'classification':
          return 'Classify the content into relevant categories';
        case 'language_detection':
          return 'Detect the language of the text';
        default:
          return '';
      }
    }).filter(Boolean).join('\n- ');

    const domainContext = domain ? `\nDomain context: ${domain}. Use domain-specific terminology and understanding.` : '';

    return `You are an expert NLP processor. Perform the following operations on the provided text and return results in JSON format:
- ${operationInstructions}${domainContext}

Return a JSON object with keys matching the requested operations.`;
  }

  private normalizeNLPResult(data: any, provider: NLPProvider, operations: string[]): NLPResult {
    return {
      entities: data.entities,
      sentiment: data.sentiment,
      summary: data.summary,
      keywords: data.keywords,
      classification: data.classification,
      language: data.language,
      confidence: this.createConfidenceScore(0.85, provider, 0),
      provider,
      metadata: {
        operationsPerformed: operations as any[],
        processingTimeMs: 0,
      },
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private createConfidenceScore(
    overall: number,
    provider: string,
    processingTimeMs: number,
    warnings?: string[]
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
      warnings,
    };
  }

  /**
   * Get all available providers for a capability
   */
  getAvailableProviders(capability: 'ocr' | 'tts' | 'stt' | 'image_gen' | 'nlp'): MediaProviderConfig[] {
    switch (capability) {
      case 'ocr':
        return Object.values(OCR_PROVIDERS).filter(p => this.configuredProviders.has(p.id));
      case 'tts':
        return Object.values(TTS_PROVIDERS).filter(p => this.configuredProviders.has(p.id));
      case 'stt':
        return Object.values(STT_PROVIDERS).filter(p => this.configuredProviders.has(p.id));
      case 'image_gen':
        return Object.values(IMAGE_GEN_PROVIDERS).filter(p => this.configuredProviders.has(p.id));
      case 'nlp':
        return Object.values(NLP_PROVIDERS).filter(p => this.configuredProviders.has(p.id));
      default:
        return [];
    }
  }

  /**
   * Update adapter configuration
   */
  updateConfig(config: Partial<MediaAdapterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): MediaAdapterConfig {
    return { ...this.config };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let adapterInstance: UniversalMediaAdapter | null = null;

export function getUniversalMediaAdapter(config?: Partial<MediaAdapterConfig>): UniversalMediaAdapter {
  if (!adapterInstance) {
    adapterInstance = new UniversalMediaAdapter(config);
  } else if (config) {
    adapterInstance.updateConfig(config);
  }
  return adapterInstance;
}

export default UniversalMediaAdapter;
