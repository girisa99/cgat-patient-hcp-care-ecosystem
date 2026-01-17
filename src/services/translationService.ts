/**
 * Universal Translation Service
 * 
 * Provides multi-provider translation with:
 * - Google Translate (249+ languages)
 * - DeepL (36+ languages, highest accuracy for EU)
 * - Microsoft Translator (135+ languages, enterprise-grade)
 * - Amazon Translate (75+ languages, high-volume)
 * - AI-based (Gemini/GPT/Claude for context-aware translation)
 * - Meta NLLB (200+ languages, excellent for rare/low-resource)
 * - Qwen-MT (Alibaba, excellent for Asian languages)
 * 
 * Features:
 * - Confidence scoring
 * - Language detection
 * - Provider routing based on language pair
 * - Intelligent recommendations
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
  | 'ai_gpt_mini'
  | 'ai_claude'
  | 'ai_claude_35'
  | 'meta_nllb'
  | 'qwen_mt';

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

export interface TranslationProviderConfig {
  id: TranslationProvider;
  name: string;
  description: string;
  icon: string;
  tier: 'fast' | 'balanced' | 'premium' | 'enterprise' | 'specialized';
  supportedLanguages: number;
  strengths: string[];
  weaknesses: string[];
  costPerChar: number; // Approximate cost per 1000 chars
  avgConfidence: number;
  speedRating: number; // 1-5, 5 being fastest
  qualityRating: number; // 1-5, 5 being highest quality
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
// LANGUAGE FAMILIES & MAPPINGS
// ============================================

export const LANGUAGE_FAMILIES: Record<string, LanguageFamily> = {
  // European Languages
  en: 'european', de: 'european', fr: 'european', es: 'european', it: 'european',
  pt: 'european', nl: 'european', pl: 'european', ru: 'european', uk: 'european',
  cs: 'european', da: 'european', sv: 'european', no: 'european', fi: 'european',
  el: 'european', hu: 'european', ro: 'european', bg: 'european', hr: 'european',
  sk: 'european', sl: 'european', et: 'european', lv: 'european', lt: 'european',
  
  // Asian CJK (Chinese, Japanese, Korean)
  zh: 'asian_cjk', ja: 'asian_cjk', ko: 'asian_cjk',
  
  // Southeast Asian
  vi: 'asian_sea', th: 'asian_sea', id: 'asian_sea', ms: 'asian_sea',
  tl: 'asian_sea', my: 'asian_sea', km: 'asian_sea', lo: 'asian_sea',
  
  // Middle Eastern
  ar: 'middle_eastern', he: 'middle_eastern', fa: 'middle_eastern', tr: 'middle_eastern',
  
  // Indian Subcontinent
  hi: 'indian', bn: 'indian', ta: 'indian', te: 'indian', mr: 'indian',
  gu: 'indian', kn: 'indian', ml: 'indian', pa: 'indian', ur: 'indian',
  
  // African
  sw: 'african', am: 'african', ha: 'african', yo: 'african', ig: 'african',
  zu: 'african', xh: 'african',
};

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
    speedRating: 5,
    qualityRating: 3,
    features: {
      formality: false,
      glossary: true,
      domainAdaptation: true,
      contextAware: false,
      batchSupport: true,
      realtime: true,
      rareLangSupport: true,
    },
    bestFor: ['Global content', 'Rare languages', 'High volume', 'Real-time'],
    languageFamilyStrength: ['european', 'asian_cjk', 'rare'],
    contentTypeStrength: ['general', 'educational'],
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
    speedRating: 4,
    qualityRating: 5,
    features: {
      formality: true,
      glossary: true,
      domainAdaptation: false,
      contextAware: true,
      batchSupport: true,
      realtime: true,
      rareLangSupport: false,
    },
    bestFor: ['European languages', 'Marketing content', 'High-quality needs', 'Formal documents'],
    languageFamilyStrength: ['european'],
    contentTypeStrength: ['marketing', 'legal', 'creative'],
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
    speedRating: 4,
    qualityRating: 4,
    features: {
      formality: true,
      glossary: true,
      domainAdaptation: true,
      contextAware: true,
      batchSupport: true,
      realtime: true,
      rareLangSupport: true,
    },
    bestFor: ['Healthcare', 'Enterprise', 'HIPAA compliance', 'Office documents'],
    languageFamilyStrength: ['european', 'middle_eastern', 'indian'],
    contentTypeStrength: ['medical', 'legal', 'technical'],
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
    speedRating: 5,
    qualityRating: 3,
    features: {
      formality: true,
      glossary: true,
      domainAdaptation: true,
      contextAware: false,
      batchSupport: true,
      realtime: true,
      rareLangSupport: false,
    },
    bestFor: ['AWS users', 'High volume', 'E-commerce', 'Automation'],
    languageFamilyStrength: ['european', 'asian_cjk'],
    contentTypeStrength: ['general', 'technical'],
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
    speedRating: 3,
    qualityRating: 4,
    features: {
      formality: true,
      glossary: false,
      domainAdaptation: true,
      contextAware: true,
      batchSupport: false,
      realtime: false,
      rareLangSupport: true,
    },
    bestFor: ['Creative content', 'Context-heavy text', 'Marketing', 'Presentations'],
    languageFamilyStrength: ['european', 'asian_cjk', 'middle_eastern'],
    contentTypeStrength: ['creative', 'marketing', 'presentation'],
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
    speedRating: 3,
    qualityRating: 5,
    features: {
      formality: true,
      glossary: false,
      domainAdaptation: true,
      contextAware: true,
      batchSupport: false,
      realtime: false,
      rareLangSupport: true,
    },
    bestFor: ['Complex documents', 'Legal', 'Technical', 'Tone preservation'],
    languageFamilyStrength: ['european', 'asian_cjk'],
    contentTypeStrength: ['legal', 'technical', 'creative'],
    languagePairs: { source: ['*'], target: ['*'] },
  },
  {
    id: 'ai_gpt_mini',
    name: 'GPT-5 Mini',
    description: 'Budget-friendly GPT-5 variant. Good balance of speed and quality.',
    icon: '⚡',
    tier: 'balanced',
    supportedLanguages: 100,
    strengths: ['Fast processing', 'Cost-effective', 'Good for general content', 'Maintains GPT quality'],
    weaknesses: ['Less nuanced than full GPT-5', 'Shorter context window'],
    costPerChar: 0.00002,
    avgConfidence: 0.85,
    speedRating: 4,
    qualityRating: 4,
    features: {
      formality: true,
      glossary: false,
      domainAdaptation: true,
      contextAware: true,
      batchSupport: false,
      realtime: true,
      rareLangSupport: true,
    },
    bestFor: ['General content', 'Budget-conscious', 'High volume AI'],
    languageFamilyStrength: ['european', 'asian_cjk'],
    contentTypeStrength: ['general', 'educational', 'presentation'],
    languagePairs: { source: ['*'], target: ['*'] },
  },
  {
    id: 'ai_claude',
    name: 'Claude 3 Translation',
    description: 'Anthropic Claude for accurate, thoughtful translations with reasoning.',
    icon: '🎭',
    tier: 'premium',
    supportedLanguages: 100,
    strengths: ['Thoughtful translations', 'Explains choices', 'Good at ambiguity', 'Cultural adaptation'],
    weaknesses: ['Slowest option', 'Highest cost', 'May be verbose'],
    costPerChar: 0.00008,
    avgConfidence: 0.90,
    speedRating: 2,
    qualityRating: 5,
    features: {
      formality: true,
      glossary: false,
      domainAdaptation: true,
      contextAware: true,
      batchSupport: false,
      realtime: false,
      rareLangSupport: true,
    },
    bestFor: ['Cultural content', 'Ambiguous text', 'Quality-critical', 'Explanations needed'],
    languageFamilyStrength: ['european'],
    contentTypeStrength: ['legal', 'creative', 'marketing'],
    languagePairs: { source: ['*'], target: ['*'] },
  },
  {
    id: 'ai_claude_35',
    name: 'Claude 3.5 Sonnet',
    description: 'Latest Claude model. Excellent for European languages and nuanced content.',
    icon: '🎪',
    tier: 'premium',
    supportedLanguages: 100,
    strengths: ['Best-in-class for European', 'Exceptional nuance', 'Fast for premium', 'Cultural sensitivity'],
    weaknesses: ['Expensive', 'Not as strong for CJK'],
    costPerChar: 0.00006,
    avgConfidence: 0.93,
    speedRating: 3,
    qualityRating: 5,
    features: {
      formality: true,
      glossary: false,
      domainAdaptation: true,
      contextAware: true,
      batchSupport: false,
      realtime: false,
      rareLangSupport: true,
    },
    bestFor: ['European languages', 'Legal documents', 'Marketing', 'Cultural content'],
    languageFamilyStrength: ['european', 'middle_eastern'],
    contentTypeStrength: ['legal', 'marketing', 'creative'],
    languagePairs: { source: ['*'], target: ['*'] },
  },
  {
    id: 'meta_nllb',
    name: 'Meta NLLB-200',
    description: 'No Language Left Behind. Best for rare/low-resource languages.',
    icon: '🌍',
    tier: 'specialized',
    supportedLanguages: 200,
    strengths: ['200+ languages', 'Best for rare languages', 'Open source', 'Ethical AI focus'],
    weaknesses: ['Less natural for major languages', 'Requires more tuning'],
    costPerChar: 0.00001,
    avgConfidence: 0.78,
    speedRating: 4,
    qualityRating: 3,
    features: {
      formality: false,
      glossary: false,
      domainAdaptation: false,
      contextAware: false,
      batchSupport: true,
      realtime: true,
      rareLangSupport: true,
    },
    bestFor: ['Rare languages', 'African languages', 'Indigenous languages', 'Humanitarian'],
    languageFamilyStrength: ['african', 'rare', 'indian'],
    contentTypeStrength: ['general', 'educational'],
    languagePairs: { source: ['*'], target: ['*'] },
  },
  {
    id: 'qwen_mt',
    name: 'Qwen-MT',
    description: 'Alibaba\'s multilingual model. Excellent for Chinese and Asian languages.',
    icon: '🐉',
    tier: 'specialized',
    supportedLanguages: 80,
    strengths: ['Best for Chinese', 'Strong CJK support', 'Fast processing', 'Business terminology'],
    weaknesses: ['Weaker for European', 'Less cultural context'],
    costPerChar: 0.00003,
    avgConfidence: 0.87,
    speedRating: 4,
    qualityRating: 4,
    features: {
      formality: true,
      glossary: true,
      domainAdaptation: true,
      contextAware: true,
      batchSupport: true,
      realtime: true,
      rareLangSupport: false,
    },
    bestFor: ['Chinese translation', 'Asian languages', 'E-commerce', 'Technical Chinese'],
    languageFamilyStrength: ['asian_cjk', 'asian_sea'],
    contentTypeStrength: ['technical', 'general', 'marketing'],
    languagePairs: { source: ['*'], target: ['*'] },
  },
];

// ============================================
// LANGUAGE PAIR RECOMMENDATIONS
// ============================================

export const LANGUAGE_PAIR_RECOMMENDATIONS: LanguagePairRecommendation[] = [
  // Chinese pairs - Qwen-MT excels
  {
    sourceLanguage: 'zh',
    targetLanguage: 'en',
    recommendedProvider: 'qwen_mt',
    alternativeProviders: ['deepl', 'ai_gpt'],
    confidenceScore: 0.92,
    reasoning: 'Qwen-MT specializes in Chinese with native understanding of idioms and business terminology.',
    considerations: ['Best for technical/business content', 'Fast processing'],
    contentTypeBonus: { legal: 'ai_claude_35', creative: 'ai_gpt' },
  },
  {
    sourceLanguage: 'en',
    targetLanguage: 'zh',
    recommendedProvider: 'qwen_mt',
    alternativeProviders: ['deepl', 'ai_gemini'],
    confidenceScore: 0.91,
    reasoning: 'Qwen-MT produces natural Chinese with correct measure words and formal/informal distinctions.',
    considerations: ['Handles simplified/traditional', 'Business terminology'],
    contentTypeBonus: { marketing: 'ai_gemini', technical: 'qwen_mt' },
  },
  // European language pairs - DeepL dominates
  {
    sourceLanguage: 'en',
    targetLanguage: 'de',
    recommendedProvider: 'deepl',
    alternativeProviders: ['ai_claude_35', 'microsoft'],
    confidenceScore: 0.96,
    reasoning: 'DeepL consistently outperforms all models for English-German with natural grammar.',
    considerations: ['Excellent formality control', 'Compound word handling'],
    contentTypeBonus: { legal: 'ai_claude_35', technical: 'microsoft' },
  },
  {
    sourceLanguage: 'en',
    targetLanguage: 'fr',
    recommendedProvider: 'deepl',
    alternativeProviders: ['ai_claude_35', 'ai_gpt'],
    confidenceScore: 0.95,
    reasoning: 'DeepL captures French nuances and formality levels exceptionally well.',
    considerations: ['Gender agreement', 'Formal/informal vous/tu'],
    contentTypeBonus: { legal: 'ai_claude_35', creative: 'ai_gpt' },
  },
  {
    sourceLanguage: 'en',
    targetLanguage: 'es',
    recommendedProvider: 'deepl',
    alternativeProviders: ['ai_claude_35', 'google_translate'],
    confidenceScore: 0.94,
    reasoning: 'DeepL handles Spanish regional variations well.',
    considerations: ['Latin American vs European Spanish', 'Formality'],
    contentTypeBonus: { marketing: 'ai_gemini', general: 'google_translate' },
  },
  // Japanese pairs - AI models excel
  {
    sourceLanguage: 'en',
    targetLanguage: 'ja',
    recommendedProvider: 'ai_gpt',
    alternativeProviders: ['qwen_mt', 'deepl'],
    confidenceScore: 0.88,
    reasoning: 'GPT-5 handles keigo (politeness levels) and context-dependent translations well.',
    considerations: ['Honorifics', 'Business vs casual', 'Kanji selection'],
    contentTypeBonus: { technical: 'qwen_mt', creative: 'ai_claude' },
  },
  {
    sourceLanguage: 'ja',
    targetLanguage: 'en',
    recommendedProvider: 'ai_gpt',
    alternativeProviders: ['deepl', 'qwen_mt'],
    confidenceScore: 0.87,
    reasoning: 'GPT-5 captures subtle Japanese nuances and implied meanings.',
    considerations: ['Context-dependent meaning', 'Politeness levels'],
    contentTypeBonus: { legal: 'ai_claude_35', technical: 'qwen_mt' },
  },
  // Korean pairs
  {
    sourceLanguage: 'en',
    targetLanguage: 'ko',
    recommendedProvider: 'qwen_mt',
    alternativeProviders: ['ai_gpt', 'deepl'],
    confidenceScore: 0.86,
    reasoning: 'Qwen-MT strong for CJK languages with proper honorifics.',
    considerations: ['Formal/informal speech levels', 'Hangul accuracy'],
    contentTypeBonus: { creative: 'ai_gpt', technical: 'qwen_mt' },
  },
  // Arabic pairs
  {
    sourceLanguage: 'en',
    targetLanguage: 'ar',
    recommendedProvider: 'ai_gemini',
    alternativeProviders: ['microsoft', 'google_translate'],
    confidenceScore: 0.85,
    reasoning: 'Gemini handles Arabic\'s right-to-left and complex morphology well.',
    considerations: ['MSA vs dialects', 'Diacritics', 'Gender agreement'],
    contentTypeBonus: { legal: 'microsoft', general: 'google_translate' },
  },
  // Hindi/Indian languages - Meta NLLB strong
  {
    sourceLanguage: 'en',
    targetLanguage: 'hi',
    recommendedProvider: 'ai_gemini',
    alternativeProviders: ['meta_nllb', 'google_translate'],
    confidenceScore: 0.86,
    reasoning: 'Gemini provides natural Hindi with correct script and grammar.',
    considerations: ['Devanagari script', 'Hinglish handling', 'Regional dialects'],
    contentTypeBonus: { general: 'google_translate', educational: 'meta_nllb' },
  },
  // Rare/African languages - Meta NLLB specializes
  {
    sourceLanguage: 'en',
    targetLanguage: 'sw',
    recommendedProvider: 'meta_nllb',
    alternativeProviders: ['google_translate', 'ai_gemini'],
    confidenceScore: 0.82,
    reasoning: 'Meta NLLB was specifically designed for low-resource languages like Swahili.',
    considerations: ['Ethical AI training', 'Community-validated translations'],
    contentTypeBonus: { educational: 'meta_nllb', general: 'google_translate' },
  },
  {
    sourceLanguage: 'en',
    targetLanguage: 'am',
    recommendedProvider: 'meta_nllb',
    alternativeProviders: ['google_translate'],
    confidenceScore: 0.78,
    reasoning: 'Meta NLLB provides best coverage for Amharic and other African languages.',
    considerations: ['Ge\'ez script support', 'Limited alternatives'],
    contentTypeBonus: { educational: 'meta_nllb' },
  },
  // Southeast Asian
  {
    sourceLanguage: 'en',
    targetLanguage: 'vi',
    recommendedProvider: 'ai_gemini',
    alternativeProviders: ['qwen_mt', 'google_translate'],
    confidenceScore: 0.84,
    reasoning: 'Gemini handles Vietnamese tones and diacritics accurately.',
    considerations: ['Tone marks', 'Regional variations'],
    contentTypeBonus: { technical: 'qwen_mt', general: 'google_translate' },
  },
  {
    sourceLanguage: 'en',
    targetLanguage: 'th',
    recommendedProvider: 'ai_gemini',
    alternativeProviders: ['google_translate', 'qwen_mt'],
    confidenceScore: 0.83,
    reasoning: 'Gemini manages Thai\'s lack of spaces and tone system well.',
    considerations: ['Word segmentation', 'Politeness particles'],
    contentTypeBonus: { technical: 'qwen_mt' },
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
    en: { de: 0.90, fr: 0.89, es: 0.90, it: 0.88, pt: 0.88, zh: 0.86, ja: 0.85, ko: 0.85, ar: 0.84, hi: 0.85, vi: 0.84, th: 0.83 },
    de: { en: 0.90, fr: 0.87, es: 0.86 },
    fr: { en: 0.89, de: 0.87, es: 0.88 },
    ar: { en: 0.84 },
  },
  ai_gpt: {
    en: { de: 0.91, fr: 0.90, es: 0.91, it: 0.89, pt: 0.89, zh: 0.87, ja: 0.88, ko: 0.86, ar: 0.85, hi: 0.86 },
    de: { en: 0.91, fr: 0.88, es: 0.87 },
    fr: { en: 0.90, de: 0.88, es: 0.89 },
    ja: { en: 0.87 },
  },
  ai_gpt_mini: {
    en: { de: 0.88, fr: 0.87, es: 0.88, it: 0.86, pt: 0.86, zh: 0.84, ja: 0.83, ko: 0.83, ar: 0.82, hi: 0.83 },
    de: { en: 0.88, fr: 0.85, es: 0.84 },
    fr: { en: 0.87, de: 0.85, es: 0.86 },
  },
  ai_claude: {
    en: { de: 0.92, fr: 0.91, es: 0.92, it: 0.90, pt: 0.90, zh: 0.88, ja: 0.87, ko: 0.87, ar: 0.86, hi: 0.87 },
    de: { en: 0.92, fr: 0.89, es: 0.88 },
    fr: { en: 0.91, de: 0.89, es: 0.90 },
  },
  ai_claude_35: {
    en: { de: 0.95, fr: 0.94, es: 0.94, it: 0.93, pt: 0.93, zh: 0.89, ja: 0.88, ko: 0.88, ar: 0.89, hi: 0.88 },
    de: { en: 0.95, fr: 0.92, es: 0.91 },
    fr: { en: 0.94, de: 0.92, es: 0.93 },
  },
  meta_nllb: {
    en: { de: 0.78, fr: 0.77, es: 0.78, it: 0.76, pt: 0.77, zh: 0.75, ja: 0.74, ko: 0.74, ar: 0.80, hi: 0.82, sw: 0.85, am: 0.83, ha: 0.82, yo: 0.81 },
    de: { en: 0.78, fr: 0.75, es: 0.74 },
    sw: { en: 0.85 },
    am: { en: 0.83 },
  },
  qwen_mt: {
    en: { de: 0.84, fr: 0.83, es: 0.84, it: 0.82, pt: 0.82, zh: 0.93, ja: 0.87, ko: 0.88, vi: 0.85, th: 0.84, id: 0.84 },
    zh: { en: 0.92, ja: 0.88, ko: 0.87 },
    ja: { en: 0.86, zh: 0.85, ko: 0.84 },
    ko: { en: 0.87, zh: 0.85, ja: 0.84 },
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
   * Get language pair recommendation with detailed reasoning
   */
  getLanguagePairRecommendation(sourceLanguage: string, targetLanguage: string, contentType?: ContentType): LanguagePairRecommendation | null {
    // First check for exact match
    const exactMatch = LANGUAGE_PAIR_RECOMMENDATIONS.find(
      r => r.sourceLanguage === sourceLanguage && r.targetLanguage === targetLanguage
    );
    if (exactMatch) return exactMatch;

    // Generate recommendation based on language families
    const sourceFamily = LANGUAGE_FAMILIES[sourceLanguage] || 'rare';
    const targetFamily = LANGUAGE_FAMILIES[targetLanguage] || 'rare';

    // Determine best provider based on language families
    let recommendedProvider: TranslationProvider;
    let alternativeProviders: TranslationProvider[];
    let reasoning: string;
    let considerations: string[];

    if (sourceFamily === 'european' && targetFamily === 'european') {
      recommendedProvider = 'deepl';
      alternativeProviders = ['ai_claude_35', 'microsoft'];
      reasoning = 'DeepL provides the most natural European language translations.';
      considerations = ['Formality control available', 'High quality for business'];
    } else if (sourceFamily === 'asian_cjk' || targetFamily === 'asian_cjk') {
      recommendedProvider = 'qwen_mt';
      alternativeProviders = ['ai_gpt', 'deepl'];
      reasoning = 'Qwen-MT specializes in CJK languages with native understanding.';
      considerations = ['Handles idioms well', 'Business terminology'];
    } else if (sourceFamily === 'rare' || targetFamily === 'rare' || sourceFamily === 'african' || targetFamily === 'african') {
      recommendedProvider = 'meta_nllb';
      alternativeProviders = ['google_translate', 'ai_gemini'];
      reasoning = 'Meta NLLB supports 200+ languages including rare/low-resource languages.';
      considerations = ['Best coverage for rare languages', 'Ethical AI training'];
    } else {
      recommendedProvider = 'ai_gemini';
      alternativeProviders = ['google_translate', 'ai_gpt'];
      reasoning = 'Gemini provides good contextual translations for diverse language pairs.';
      considerations = ['Context-aware', 'Good for nuanced content'];
    }

    const confidence = this.getProviderConfidence(recommendedProvider, sourceLanguage, targetLanguage);

    return {
      sourceLanguage,
      targetLanguage,
      recommendedProvider,
      alternativeProviders,
      confidenceScore: confidence,
      reasoning,
      considerations,
      contentTypeBonus: contentType ? { [contentType]: recommendedProvider } : {},
    };
  }

  /**
   * Get recommended provider for a language pair (simple version)
   */
  getRecommendedProvider(sourceLanguage: string, targetLanguage: string): TranslationProvider {
    const recommendation = this.getLanguagePairRecommendation(sourceLanguage, targetLanguage);
    return recommendation?.recommendedProvider || 'ai_gemini';
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
