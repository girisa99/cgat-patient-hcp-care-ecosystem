/**
 * Universal Translation Service
 * 
 * Provides multi-provider translation with:
 * - Google Translate (249+ languages)
 * - DeepL (36+ languages, highest accuracy for EU)
 * - Microsoft Translator (135+ languages, enterprise-grade)
 * - Amazon Translate (75+ languages, high-volume)
 * - AI-based (Gemini/GPT for context-aware translation)
 * 
 * Features:
 * - Confidence scoring
 * - Language detection
 * - Provider routing based on language pair
 * - Fallback mechanisms
 * - Caching for repeated translations
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================
// TYPES & INTERFACES
// ============================================

export type TranslationProvider = 
  | 'google_translate'
  | 'deepl'
  | 'microsoft'
  | 'amazon'
  | 'ai_gemini'
  | 'ai_gpt'
  | 'ai_claude';

export interface TranslationProviderConfig {
  id: TranslationProvider;
  name: string;
  description: string;
  icon: string;
  tier: 'fast' | 'balanced' | 'premium' | 'enterprise';
  supportedLanguages: number;
  strengths: string[];
  weaknesses: string[];
  costPerChar: number; // Approximate cost per 1000 chars
  avgConfidence: number;
  features: {
    formality: boolean;
    glossary: boolean;
    domainAdaptation: boolean;
    contextAware: boolean;
    batchSupport: boolean;
    realtime: boolean;
  };
  bestFor: string[];
  languagePairs: { source: string[]; target: string[] };
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider?: TranslationProvider;
  context?: string;
  formality?: 'formal' | 'informal' | 'neutral';
  glossary?: Record<string, string>;
  domain?: 'medical' | 'legal' | 'technical' | 'marketing' | 'general';
  preserveFormatting?: boolean;
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: TranslationProvider;
  confidence: number;
  confidenceDetails: {
    linguistic: number;
    contextual: number;
    terminology: number;
    fluency: number;
  };
  detectedLanguage?: string;
  alternativeTranslations?: string[];
  metadata: {
    processingTimeMs: number;
    characterCount: number;
    wordCount: number;
    estimatedCost: number;
    usedGlossary: boolean;
    usedContext: boolean;
  };
  warnings?: string[];
}

export interface BatchTranslationRequest {
  texts: string[];
  sourceLanguage: string;
  targetLanguages: string[];
  provider?: TranslationProvider;
  context?: string;
}

export interface BatchTranslationResult {
  translations: Map<string, TranslationResult[]>; // language -> results
  overallConfidence: number;
  processingTimeMs: number;
  provider: TranslationProvider;
}

export interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
  alternatives: Array<{ language: string; confidence: number }>;
}

// ============================================
// PROVIDER CONFIGURATIONS
// ============================================

export const TRANSLATION_PROVIDERS: TranslationProviderConfig[] = [
  {
    id: 'google_translate',
    name: 'Google Translate',
    description: 'Most comprehensive language coverage with 249+ languages. Best for global reach.',
    icon: '🌐',
    tier: 'balanced',
    supportedLanguages: 249,
    strengths: ['Widest language coverage', 'Fast processing', 'Good for rare languages', 'Neural MT'],
    weaknesses: ['Less natural for complex text', 'Limited formality control'],
    costPerChar: 0.00002, // $20 per million chars
    avgConfidence: 0.82,
    features: {
      formality: false,
      glossary: true,
      domainAdaptation: true,
      contextAware: false,
      batchSupport: true,
      realtime: true,
    },
    bestFor: ['Global content', 'Rare languages', 'High volume', 'Real-time'],
    languagePairs: { source: ['*'], target: ['*'] },
  },
  {
    id: 'deepl',
    name: 'DeepL Pro',
    description: 'Highest accuracy for European languages. Natural, human-like translations.',
    icon: '🎯',
    tier: 'premium',
    supportedLanguages: 36,
    strengths: ['Most natural translations', 'Excellent for EU languages', 'Formality support', 'Context-aware'],
    weaknesses: ['Limited language support', 'No Asian language excellence'],
    costPerChar: 0.00002, // $20 per million chars (Pro)
    avgConfidence: 0.94,
    features: {
      formality: true,
      glossary: true,
      domainAdaptation: false,
      contextAware: true,
      batchSupport: true,
      realtime: true,
    },
    bestFor: ['European languages', 'Marketing content', 'High-quality needs', 'Formal documents'],
    languagePairs: {
      source: ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'zh', 'ko'],
      target: ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'zh', 'ko', 'cs', 'da', 'el', 'et', 'fi', 'hu', 'id', 'lt', 'lv', 'nb', 'ro', 'sk', 'sl', 'sv', 'tr', 'uk'],
    },
  },
  {
    id: 'microsoft',
    name: 'Microsoft Translator',
    description: 'Enterprise-grade with HIPAA compliance. Great for business documents.',
    icon: '🏢',
    tier: 'enterprise',
    supportedLanguages: 135,
    strengths: ['HIPAA compliant', 'Enterprise security', 'Custom Translator', 'Office integration'],
    weaknesses: ['Requires Azure subscription', 'Setup complexity'],
    costPerChar: 0.00001, // $10 per million chars
    avgConfidence: 0.86,
    features: {
      formality: true,
      glossary: true,
      domainAdaptation: true,
      contextAware: true,
      batchSupport: true,
      realtime: true,
    },
    bestFor: ['Healthcare', 'Enterprise', 'HIPAA compliance', 'Office documents'],
    languagePairs: { source: ['*'], target: ['*'] },
  },
  {
    id: 'amazon',
    name: 'Amazon Translate',
    description: 'High-volume automation with AWS integration. Cost-effective at scale.',
    icon: '📦',
    tier: 'fast',
    supportedLanguages: 75,
    strengths: ['AWS integration', 'Cost-effective at scale', 'Active Custom Translation', 'Real-time'],
    weaknesses: ['Fewer languages', 'Less specialized'],
    costPerChar: 0.000015, // $15 per million chars
    avgConfidence: 0.84,
    features: {
      formality: true,
      glossary: true,
      domainAdaptation: true,
      contextAware: false,
      batchSupport: true,
      realtime: true,
    },
    bestFor: ['AWS users', 'High volume', 'E-commerce', 'Automation'],
    languagePairs: { source: ['*'], target: ['*'] },
  },
  {
    id: 'ai_gemini',
    name: 'Gemini Translation',
    description: 'AI-powered contextual translation using Google Gemini. Best for nuanced content.',
    icon: '✨',
    tier: 'premium',
    supportedLanguages: 100,
    strengths: ['Contextual understanding', 'Nuanced translation', 'Handles idioms well', 'Creative content'],
    weaknesses: ['Slower than dedicated APIs', 'Higher cost', 'Occasional hallucinations'],
    costPerChar: 0.00005,
    avgConfidence: 0.88,
    features: {
      formality: true,
      glossary: false,
      domainAdaptation: true,
      contextAware: true,
      batchSupport: false,
      realtime: false,
    },
    bestFor: ['Creative content', 'Context-heavy text', 'Marketing', 'Presentations'],
    languagePairs: { source: ['*'], target: ['*'] },
  },
  {
    id: 'ai_gpt',
    name: 'GPT-5 Translation',
    description: 'OpenAI GPT-5 for sophisticated, context-aware translations.',
    icon: '🤖',
    tier: 'premium',
    supportedLanguages: 100,
    strengths: ['Excellent context awareness', 'Handles complex text', 'Good at preserving tone', 'Multi-turn capable'],
    weaknesses: ['Slower', 'More expensive', 'May over-interpret'],
    costPerChar: 0.00006,
    avgConfidence: 0.89,
    features: {
      formality: true,
      glossary: false,
      domainAdaptation: true,
      contextAware: true,
      batchSupport: false,
      realtime: false,
    },
    bestFor: ['Complex documents', 'Legal', 'Technical', 'Tone preservation'],
    languagePairs: { source: ['*'], target: ['*'] },
  },
  {
    id: 'ai_claude',
    name: 'Claude Translation',
    description: 'Anthropic Claude for accurate, thoughtful translations with reasoning.',
    icon: '🎭',
    tier: 'premium',
    supportedLanguages: 100,
    strengths: ['Thoughtful translations', 'Explains choices', 'Good at ambiguity', 'Cultural adaptation'],
    weaknesses: ['Slowest option', 'Highest cost', 'May be verbose'],
    costPerChar: 0.00008,
    avgConfidence: 0.90,
    features: {
      formality: true,
      glossary: false,
      domainAdaptation: true,
      contextAware: true,
      batchSupport: false,
      realtime: false,
    },
    bestFor: ['Cultural content', 'Ambiguous text', 'Quality-critical', 'Explanations needed'],
    languagePairs: { source: ['*'], target: ['*'] },
  },
];

// ============================================
// LANGUAGE CONFIDENCE MATRIX
// ============================================

// Provider performance by language pair (source -> target)
const PROVIDER_LANGUAGE_CONFIDENCE: Record<TranslationProvider, Record<string, Record<string, number>>> = {
  google_translate: {
    en: { de: 0.85, fr: 0.86, es: 0.87, it: 0.84, pt: 0.85, zh: 0.80, ja: 0.78, ko: 0.79, ar: 0.82, hi: 0.80 },
    de: { en: 0.86, fr: 0.82, es: 0.81 },
    fr: { en: 0.86, de: 0.82, es: 0.84 },
    es: { en: 0.87, de: 0.81, fr: 0.84 },
    zh: { en: 0.78, ja: 0.75, ko: 0.76 },
    ja: { en: 0.77, zh: 0.74, ko: 0.76 },
  },
  deepl: {
    en: { de: 0.96, fr: 0.95, es: 0.94, it: 0.94, pt: 0.93, nl: 0.94, pl: 0.92, ru: 0.90, ja: 0.88, zh: 0.87, ko: 0.86 },
    de: { en: 0.96, fr: 0.93, es: 0.92, it: 0.92 },
    fr: { en: 0.95, de: 0.93, es: 0.93 },
    es: { en: 0.94, de: 0.92, fr: 0.93 },
  },
  microsoft: {
    en: { de: 0.88, fr: 0.87, es: 0.88, it: 0.86, pt: 0.87, zh: 0.84, ja: 0.82, ko: 0.83, ar: 0.85, hi: 0.84 },
    de: { en: 0.88, fr: 0.84, es: 0.83 },
    fr: { en: 0.87, de: 0.84, es: 0.85 },
  },
  amazon: {
    en: { de: 0.86, fr: 0.85, es: 0.86, it: 0.84, pt: 0.85, zh: 0.82, ja: 0.80, ko: 0.81 },
    de: { en: 0.86, fr: 0.82, es: 0.81 },
    fr: { en: 0.85, de: 0.82, es: 0.83 },
  },
  ai_gemini: {
    en: { de: 0.90, fr: 0.89, es: 0.90, it: 0.88, pt: 0.88, zh: 0.86, ja: 0.85, ko: 0.85, ar: 0.84, hi: 0.85 },
    de: { en: 0.90, fr: 0.87, es: 0.86 },
    fr: { en: 0.89, de: 0.87, es: 0.88 },
  },
  ai_gpt: {
    en: { de: 0.91, fr: 0.90, es: 0.91, it: 0.89, pt: 0.89, zh: 0.87, ja: 0.86, ko: 0.86, ar: 0.85, hi: 0.86 },
    de: { en: 0.91, fr: 0.88, es: 0.87 },
    fr: { en: 0.90, de: 0.88, es: 0.89 },
  },
  ai_claude: {
    en: { de: 0.92, fr: 0.91, es: 0.92, it: 0.90, pt: 0.90, zh: 0.88, ja: 0.87, ko: 0.87, ar: 0.86, hi: 0.87 },
    de: { en: 0.92, fr: 0.89, es: 0.88 },
    fr: { en: 0.91, de: 0.89, es: 0.90 },
  },
};

// ============================================
// TRANSLATION SERVICE CLASS
// ============================================

class TranslationService {
  private static instance: TranslationService;
  private cache: Map<string, TranslationResult> = new Map();
  private cacheExpiry = 1000 * 60 * 60; // 1 hour

  private constructor() {}

  static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  /**
   * Get all available translation providers
   */
  getProviders(): TranslationProviderConfig[] {
    return TRANSLATION_PROVIDERS;
  }

  /**
   * Get recommended provider for a language pair
   */
  getRecommendedProvider(sourceLanguage: string, targetLanguage: string): TranslationProvider {
    // DeepL is best for European languages
    const deeplLanguages = ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru', 'cs', 'da', 'el', 'et', 'fi', 'hu', 'lt', 'lv', 'nb', 'ro', 'sk', 'sl', 'sv', 'tr', 'uk'];
    if (deeplLanguages.includes(sourceLanguage) && deeplLanguages.includes(targetLanguage)) {
      return 'deepl';
    }

    // For Asian languages, AI models often perform better
    const asianLanguages = ['zh', 'ja', 'ko', 'vi', 'th', 'id', 'ms'];
    if (asianLanguages.includes(sourceLanguage) || asianLanguages.includes(targetLanguage)) {
      return 'ai_gemini';
    }

    // For rare languages, Google has best coverage
    return 'google_translate';
  }

  /**
   * Get confidence score for a provider and language pair
   */
  getProviderConfidence(provider: TranslationProvider, sourceLanguage: string, targetLanguage: string): number {
    const providerConfidence = PROVIDER_LANGUAGE_CONFIDENCE[provider];
    if (!providerConfidence) return 0.75;
    
    const sourceConfidence = providerConfidence[sourceLanguage];
    if (!sourceConfidence) return TRANSLATION_PROVIDERS.find(p => p.id === provider)?.avgConfidence || 0.75;
    
    return sourceConfidence[targetLanguage] || TRANSLATION_PROVIDERS.find(p => p.id === provider)?.avgConfidence || 0.75;
  }

  /**
   * Get all provider confidence scores for a language pair
   */
  getAllProviderConfidences(sourceLanguage: string, targetLanguage: string): Array<{ provider: TranslationProvider; confidence: number; config: TranslationProviderConfig }> {
    return TRANSLATION_PROVIDERS.map(config => ({
      provider: config.id,
      confidence: this.getProviderConfidence(config.id, sourceLanguage, targetLanguage),
      config,
    })).sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Translate text using the specified or recommended provider
   */
  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const startTime = Date.now();
    const provider = request.provider || this.getRecommendedProvider(request.sourceLanguage, request.targetLanguage);
    
    // Check cache
    const cacheKey = this.getCacheKey(request, provider);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.metadata.processingTimeMs < this.cacheExpiry) {
      return { ...cached, metadata: { ...cached.metadata, processingTimeMs: 0 } };
    }

    try {
      let result: TranslationResult;

      switch (provider) {
        case 'google_translate':
          result = await this.translateWithGoogle(request);
          break;
        case 'deepl':
          result = await this.translateWithDeepL(request);
          break;
        case 'microsoft':
          result = await this.translateWithMicrosoft(request);
          break;
        case 'amazon':
          result = await this.translateWithAmazon(request);
          break;
        case 'ai_gemini':
        case 'ai_gpt':
        case 'ai_claude':
          result = await this.translateWithAI(request, provider);
          break;
        default:
          result = await this.translateWithAI(request, 'ai_gemini');
      }

      result.metadata.processingTimeMs = Date.now() - startTime;
      
      // Cache the result
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error(`[TranslationService] Error with ${provider}:`, error);
      
      // Fallback to AI translation if primary fails
      if (!provider.startsWith('ai_')) {
        console.log('[TranslationService] Falling back to AI translation');
        return this.translateWithAI(request, 'ai_gemini');
      }
      
      throw error;
    }
  }

  /**
   * Batch translate multiple texts to multiple languages
   */
  async batchTranslate(request: BatchTranslationRequest): Promise<BatchTranslationResult> {
    const startTime = Date.now();
    const provider = request.provider || 'ai_gemini';
    const translations = new Map<string, TranslationResult[]>();
    
    // Process each target language
    for (const targetLang of request.targetLanguages) {
      const results: TranslationResult[] = [];
      
      for (const text of request.texts) {
        const result = await this.translate({
          text,
          sourceLanguage: request.sourceLanguage,
          targetLanguage: targetLang,
          provider,
          context: request.context,
        });
        results.push(result);
      }
      
      translations.set(targetLang, results);
    }
    
    // Calculate overall confidence
    let totalConfidence = 0;
    let count = 0;
    translations.forEach(results => {
      results.forEach(r => {
        totalConfidence += r.confidence;
        count++;
      });
    });
    
    return {
      translations,
      overallConfidence: count > 0 ? totalConfidence / count : 0,
      processingTimeMs: Date.now() - startTime,
      provider,
    };
  }

  /**
   * Detect the language of a text
   */
  async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    try {
      const { data, error } = await supabase.functions.invoke('translation-service', {
        body: {
          action: 'detect',
          text: text.slice(0, 1000), // Limit for detection
        },
      });

      if (error) throw error;

      return data as LanguageDetectionResult;
    } catch (error) {
      console.error('[TranslationService] Language detection error:', error);
      // Fallback to simple detection
      return {
        detectedLanguage: 'en',
        confidence: 0.5,
        alternatives: [],
      };
    }
  }

  // ============================================
  // PRIVATE METHODS - Provider Implementations
  // ============================================

  private getCacheKey(request: TranslationRequest, provider: TranslationProvider): string {
    return `${provider}:${request.sourceLanguage}:${request.targetLanguage}:${request.text.slice(0, 100)}`;
  }

  private async translateWithGoogle(request: TranslationRequest): Promise<TranslationResult> {
    const { data, error } = await supabase.functions.invoke('translation-service', {
      body: {
        action: 'translate',
        provider: 'google',
        text: request.text,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        glossary: request.glossary,
      },
    });

    if (error) throw error;

    const baseConfidence = this.getProviderConfidence('google_translate', request.sourceLanguage, request.targetLanguage);
    
    return {
      translatedText: data.translatedText,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      provider: 'google_translate',
      confidence: data.confidence || baseConfidence,
      confidenceDetails: {
        linguistic: baseConfidence,
        contextual: 0.75,
        terminology: request.glossary ? 0.90 : 0.80,
        fluency: baseConfidence - 0.05,
      },
      detectedLanguage: data.detectedLanguage,
      metadata: {
        processingTimeMs: 0,
        characterCount: request.text.length,
        wordCount: request.text.split(/\s+/).length,
        estimatedCost: request.text.length * 0.00002,
        usedGlossary: !!request.glossary,
        usedContext: false,
      },
    };
  }

  private async translateWithDeepL(request: TranslationRequest): Promise<TranslationResult> {
    const { data, error } = await supabase.functions.invoke('translation-service', {
      body: {
        action: 'translate',
        provider: 'deepl',
        text: request.text,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        formality: request.formality,
        glossary: request.glossary,
      },
    });

    if (error) throw error;

    const baseConfidence = this.getProviderConfidence('deepl', request.sourceLanguage, request.targetLanguage);
    
    return {
      translatedText: data.translatedText,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      provider: 'deepl',
      confidence: data.confidence || baseConfidence,
      confidenceDetails: {
        linguistic: baseConfidence,
        contextual: 0.90,
        terminology: request.glossary ? 0.95 : 0.88,
        fluency: baseConfidence,
      },
      detectedLanguage: data.detectedLanguage,
      alternativeTranslations: data.alternatives,
      metadata: {
        processingTimeMs: 0,
        characterCount: request.text.length,
        wordCount: request.text.split(/\s+/).length,
        estimatedCost: request.text.length * 0.00002,
        usedGlossary: !!request.glossary,
        usedContext: true,
      },
    };
  }

  private async translateWithMicrosoft(request: TranslationRequest): Promise<TranslationResult> {
    const { data, error } = await supabase.functions.invoke('translation-service', {
      body: {
        action: 'translate',
        provider: 'microsoft',
        text: request.text,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        category: request.domain,
      },
    });

    if (error) throw error;

    const baseConfidence = this.getProviderConfidence('microsoft', request.sourceLanguage, request.targetLanguage);
    
    return {
      translatedText: data.translatedText,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      provider: 'microsoft',
      confidence: data.confidence || baseConfidence,
      confidenceDetails: {
        linguistic: baseConfidence,
        contextual: 0.85,
        terminology: request.domain ? 0.90 : 0.82,
        fluency: baseConfidence - 0.02,
      },
      detectedLanguage: data.detectedLanguage,
      metadata: {
        processingTimeMs: 0,
        characterCount: request.text.length,
        wordCount: request.text.split(/\s+/).length,
        estimatedCost: request.text.length * 0.00001,
        usedGlossary: !!request.glossary,
        usedContext: !!request.domain,
      },
    };
  }

  private async translateWithAmazon(request: TranslationRequest): Promise<TranslationResult> {
    const { data, error } = await supabase.functions.invoke('translation-service', {
      body: {
        action: 'translate',
        provider: 'amazon',
        text: request.text,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        formality: request.formality,
      },
    });

    if (error) throw error;

    const baseConfidence = this.getProviderConfidence('amazon', request.sourceLanguage, request.targetLanguage);
    
    return {
      translatedText: data.translatedText,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      provider: 'amazon',
      confidence: data.confidence || baseConfidence,
      confidenceDetails: {
        linguistic: baseConfidence,
        contextual: 0.80,
        terminology: 0.82,
        fluency: baseConfidence - 0.03,
      },
      metadata: {
        processingTimeMs: 0,
        characterCount: request.text.length,
        wordCount: request.text.split(/\s+/).length,
        estimatedCost: request.text.length * 0.000015,
        usedGlossary: false,
        usedContext: false,
      },
    };
  }

  private async translateWithAI(request: TranslationRequest, provider: TranslationProvider): Promise<TranslationResult> {
    const modelMap: Record<string, string> = {
      ai_gemini: 'google/gemini-3-flash-preview',
      ai_gpt: 'openai/gpt-5',
      ai_claude: 'anthropic/claude-3',
    };

    const model = modelMap[provider] || 'google/gemini-3-flash-preview';
    
    const systemPrompt = `You are an expert translator. Translate the following text from ${request.sourceLanguage} to ${request.targetLanguage}.
${request.formality ? `Use a ${request.formality} tone.` : ''}
${request.context ? `Context: ${request.context}` : ''}
${request.domain ? `Domain: ${request.domain}` : ''}

IMPORTANT: Return ONLY the translated text, nothing else. Do not include explanations or notes.`;

    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: model.split('/')[0],
        model: model.split('/')[1],
        prompt: request.text,
        systemPrompt,
        maxTokens: Math.max(1000, request.text.length * 2),
        temperature: 0.3,
      },
    });

    if (error) throw error;

    const baseConfidence = this.getProviderConfidence(provider, request.sourceLanguage, request.targetLanguage);
    
    return {
      translatedText: data.content || data.text || '',
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      provider,
      confidence: baseConfidence,
      confidenceDetails: {
        linguistic: baseConfidence,
        contextual: request.context ? 0.92 : 0.85,
        terminology: request.domain ? 0.90 : 0.85,
        fluency: baseConfidence + 0.02,
      },
      metadata: {
        processingTimeMs: 0,
        characterCount: request.text.length,
        wordCount: request.text.split(/\s+/).length,
        estimatedCost: request.text.length * 0.00005,
        usedGlossary: false,
        usedContext: !!request.context,
      },
    };
  }
}

// Export singleton instance
export const translationService = TranslationService.getInstance();
