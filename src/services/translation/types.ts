/**
 * Translation Service Types
 * Extracted for cross-ecosystem reusability in Genie Suite (Hub, Mind, Spark, Vibe)
 */

// ============================================
// PROVIDER TYPES
// ============================================

export type TranslationProvider = 
  | 'google_translate'
  | 'deepl'
  | 'microsoft'
  | 'amazon'
  | 'ai_gemini'
  | 'ai_gpt'
  | 'ai_gpt_mini'
  | 'ai_claude'
  | 'ai_claude_35'
  | 'meta_nllb'
  | 'qwen_mt'
  | 'deepseek';  // DeepSeek - excellent for Chinese, code-mixed content

export type ContentType = 
  | 'general' 
  | 'legal' 
  | 'medical' 
  | 'technical' 
  | 'marketing' 
  | 'creative' 
  | 'educational'
  | 'presentation';

export type LanguageFamily = 
  | 'european' 
  | 'asian_cjk' 
  | 'asian_sea' 
  | 'middle_eastern' 
  | 'african' 
  | 'indian'
  | 'rare';

export type ImpactLevel = 
  | 'major_improvement' 
  | 'improvement' 
  | 'neutral' 
  | 'degradation' 
  | 'major_degradation';

export type IndustrySegment = 
  | 'healthcare' 
  | 'legal' 
  | 'finance' 
  | 'technology' 
  | 'ecommerce' 
  | 'education' 
  | 'government' 
  | 'media' 
  | 'hospitality';

// ============================================
// PROVIDER CONFIGURATION
// ============================================

export interface TranslationProviderConfig {
  id: TranslationProvider;
  name: string;
  description: string;
  icon: string;
  tier: 'fast' | 'balanced' | 'premium' | 'enterprise' | 'specialized';
  supportedLanguages: number;
  strengths: string[];
  weaknesses: string[];
  costPerChar: number;
  avgConfidence: number;
  speedRating: number;
  qualityRating: number;
  features: {
    formality: boolean;
    glossary: boolean;
    domainAdaptation: boolean;
    contextAware: boolean;
    batchSupport: boolean;
    realtime: boolean;
    rareLangSupport: boolean;
  };
  bestFor: string[];
  languageFamilyStrength: LanguageFamily[];
  contentTypeStrength: ContentType[];
  languagePairs: { source: string[]; target: string[] };
}

// ============================================
// RECOMMENDATION TYPES
// ============================================

export interface LanguagePairRecommendation {
  sourceLanguage: string;
  targetLanguage: string;
  recommendedProvider: TranslationProvider;
  alternativeProviders: TranslationProvider[];
  confidenceScore: number;
  reasoning: string;
  considerations: string[];
  contentTypeBonus: Partial<Record<ContentType, TranslationProvider>>;
}

export interface IndustryRecommendation {
  segment: IndustrySegment;
  name: string;
  description: string;
  primaryProvider: TranslationProvider;
  alternativeProviders: TranslationProvider[];
  reasoning: string;
  languageOverrides: Array<{
    languages: string[];
    provider: TranslationProvider;
    reason: string;
  }>;
}

// ============================================
// TRANSLATION REQUEST/RESPONSE
// ============================================

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider?: TranslationProvider;
  context?: string;
  formality?: 'formal' | 'informal' | 'neutral';
  glossary?: Record<string, string>;
  domain?: ContentType;
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
    modelUsed?: string;
  };
  warnings?: string[];
}

export interface BatchTranslationRequest {
  texts: string[];
  sourceLanguage: string;
  targetLanguages: string[];
  provider?: TranslationProvider;
  context?: string;
  contentType?: ContentType;
}

export interface BatchTranslationResult {
  translations: Map<string, TranslationResult[]>;
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
// SELECTION IMPACT TYPES
// ============================================

export interface ProviderSelectionImpact {
  selectedProvider: TranslationProvider;
  recommendedProvider: TranslationProvider;
  selectedConfidence: number;
  recommendedConfidence: number;
  confidenceDelta: number;
  deltaPercentage: number;
  impactLevel: ImpactLevel;
  impactDescription: string;
  riskFactors: string[];
  opportunities: string[];
  qualityPrediction: QualityPrediction;
  userChoiceValid: boolean;
  systemPrompt: string;
}

export interface QualityPrediction {
  expectedAccuracy: number;
  fluencyScore: number;
  terminologyScore: number;
  contextRetention: number;
  overallQuality: 'excellent' | 'good' | 'acceptable' | 'fair' | 'poor';
  confidenceInterval: { low: number; high: number };
}

// ============================================
// SYSTEM PROMPT TYPES
// ============================================

export interface ProviderSystemPrompt {
  provider: TranslationProvider;
  basePrompt: string;
  languagePairPrompts: Record<string, string>;
  contentTypePrompts: Record<ContentType, string>;
  optimizationTips: string[];
}

// ============================================
// AGENT EXECUTION (for live display)
// ============================================

export interface AgentExecutionStatus {
  agentId: string;
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentTask?: string;
  startTime?: Date;
  endTime?: Date;
  result?: TranslationResult;
  error?: string;
}

// ============================================
// SUPPORTED LANGUAGES
// ============================================

export interface SupportedLanguage {
  code: string;
  name: string;
  flag: string;
  family: LanguageFamily;
}
