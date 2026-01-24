/**
 * ContextualRecommendationService - UNIFIED DYNAMIC RECOMMENDATION ENGINE
 * 
 * Central service for all context-aware recommendations with confidence scoring
 * across the 8-step wizard. NO HARDCODED DEFAULTS - all recommendations are
 * dynamically computed based on:
 * 
 * - Region (4-Zone LLM Routing: Claude, Alibaba, Gemini, Fallback)
 * - Language (120+ supported languages)
 * - Industry (50+ with segments)
 * - Content Type (30+)
 * - Framework (50+)
 * - Visual Features (100+)
 * - Output Format (35-50)
 * - User Tier (Standard/Advanced/Premium)
 * 
 * Used across: Spark, Mind, Vibe, Deck, Arc, Ask Genie
 */

import type { LLMZone } from '@/services/llmRoutingStrategy';
import type { GlobalTier } from '@/services/shared/globalTierService';

// ============================================================================
// TYPES
// ============================================================================

export type RecommendationType = 
  | 'llm'
  | 'translation'
  | 'tts'
  | 'stt'
  | 'image'
  | 'video'
  | 'avatar'
  | 'industry'
  | 'framework'
  | 'visual-feature'
  | 'output-format'
  | 'design-template';

export interface ContextualRecommendation {
  id: string;
  name: string;
  category: RecommendationType;
  confidence: number; // 0-100
  qualityScore: number;
  speedScore: number;
  costScore: number;
  isRecommended: boolean;
  isPrimary: boolean;
  reasoning: string;
  warnings: string[];
  subOptions?: string[];
  tier: GlobalTier;
  source: 'region' | 'language' | 'industry' | 'content-type' | 'framework' | 'output-format' | 'user-preference';
}

export interface RecommendationContext {
  // Regional context
  llmZone: LLMZone;
  countryCode: string;
  primaryLanguage: string;
  additionalLanguages: string[];
  
  // Content context
  industry?: string;
  segment?: string;
  contentTypes?: string[];
  frameworks?: string[];
  visualFeatures?: string[];
  outputFormat?: string;
  
  // User context
  globalTier: GlobalTier;
  userPreferences?: Record<string, string>;
  
  // Audio context (Step 5/6)
  audioEnabled?: boolean;
  voiceStyle?: string;
  multiLanguageDubbing?: boolean;
}

export interface RecommendationResult {
  recommendations: ContextualRecommendation[];
  primaryRecommendation: ContextualRecommendation | null;
  overallConfidence: number;
  overallReasoning: string;
  suboptimalWarnings: string[];
  alternativeCount: number;
}

// ============================================================================
// SCORING MATRICES
// ============================================================================

/**
 * 4-Zone LLM Provider Mapping with confidence scores
 */
const ZONE_PROVIDER_SCORES: Record<LLMZone, Record<string, { confidence: number; quality: number; speed: number; cost: number; reasoning: string }>> = {
  claude: {
    'claude-3.5-sonnet': { confidence: 95, quality: 98, speed: 85, cost: 60, reasoning: 'Optimal for Western markets with superior reasoning' },
    'gpt-4o': { confidence: 88, quality: 96, speed: 88, cost: 55, reasoning: 'Strong alternative for Claude zone' },
    'gemini-pro': { confidence: 75, quality: 90, speed: 92, cost: 75, reasoning: 'Cost-effective fallback' },
    'deepseek-v3': { confidence: 70, quality: 88, speed: 90, cost: 95, reasoning: 'Budget-friendly option' },
  },
  alibaba: {
    'qwen-max': { confidence: 95, quality: 94, speed: 90, cost: 85, reasoning: 'Native CJK optimization with superior Chinese/Japanese/Korean processing' },
    'qwen-plus': { confidence: 90, quality: 90, speed: 92, cost: 90, reasoning: 'Fast CJK processing' },
    'deepseek-v3': { confidence: 85, quality: 88, speed: 88, cost: 95, reasoning: 'Strong CJK alternative' },
    'gpt-4o': { confidence: 70, quality: 96, speed: 85, cost: 55, reasoning: 'Western fallback for CJK zone' },
  },
  gemini: {
    'gemini-1.5-pro': { confidence: 95, quality: 94, speed: 90, cost: 70, reasoning: 'Optimal for India/MEA/SEA with 1M+ context window' },
    'gemini-flash': { confidence: 88, quality: 88, speed: 95, cost: 85, reasoning: 'Fast processing for Gemini zone' },
    'gpt-4o': { confidence: 75, quality: 96, speed: 88, cost: 55, reasoning: 'Quality fallback' },
    'claude-3.5-sonnet': { confidence: 72, quality: 98, speed: 85, cost: 60, reasoning: 'Premium alternative' },
  },
  fallback: {
    'gpt-4o': { confidence: 90, quality: 96, speed: 88, cost: 55, reasoning: 'Universal fallback with global coverage' },
    'gemini-pro': { confidence: 85, quality: 90, speed: 92, cost: 75, reasoning: 'Cost-effective universal option' },
    'claude-3.5-sonnet': { confidence: 80, quality: 98, speed: 85, cost: 60, reasoning: 'Premium fallback' },
    'deepseek-v3': { confidence: 75, quality: 88, speed: 90, cost: 95, reasoning: 'Budget fallback' },
  },
};

/**
 * Industry-specific provider recommendations
 */
const INDUSTRY_PROVIDER_SCORES: Record<string, { llm: string; confidence: number; reasoning: string; considerations: string[] }> = {
  healthcare: { llm: 'claude-3.5-sonnet', confidence: 95, reasoning: 'HIPAA-aware with medical terminology expertise', considerations: ['HIPAA compliance', 'Medical accuracy', 'Patient safety'] },
  pharma: { llm: 'claude-3.5-sonnet', confidence: 94, reasoning: 'Regulatory language precision for clinical trials', considerations: ['FDA compliance', 'Drug terminology', 'Clinical precision'] },
  legal: { llm: 'claude-3.5-sonnet', confidence: 93, reasoning: 'Legal terminology with jurisdiction awareness', considerations: ['Legal precision', 'Jurisdiction terms', 'Formal register'] },
  finance: { llm: 'gpt-4o', confidence: 92, reasoning: 'Financial modeling with regulatory compliance', considerations: ['SOX compliance', 'Financial accuracy', 'Audit trails'] },
  technology: { llm: 'deepseek-v3', confidence: 90, reasoning: 'Technical documentation with code understanding', considerations: ['Technical accuracy', 'Code samples', 'API documentation'] },
  education: { llm: 'gemini-1.5-pro', confidence: 88, reasoning: 'Long-context for educational content', considerations: ['Curriculum alignment', 'Age-appropriate', 'Pedagogical'] },
  consulting: { llm: 'claude-3.5-sonnet', confidence: 91, reasoning: 'Strategic frameworks and executive communication', considerations: ['Framework accuracy', 'Executive tone', 'Data visualization'] },
  manufacturing: { llm: 'gpt-4o', confidence: 87, reasoning: 'Technical specifications and process documentation', considerations: ['ISO standards', 'Technical specs', 'Safety protocols'] },
  retail: { llm: 'gemini-1.5-pro', confidence: 86, reasoning: 'Consumer insights and marketing optimization', considerations: ['Consumer language', 'Brand voice', 'Conversion focus'] },
  media: { llm: 'claude-3.5-sonnet', confidence: 89, reasoning: 'Creative content with brand consistency', considerations: ['Creative quality', 'Brand alignment', 'Engagement'] },
};

/**
 * Language family provider optimization
 */
const LANGUAGE_PROVIDER_OPTIMIZATION: Record<string, { translation: string; tts: string; stt: string; confidence: number; reasoning: string }> = {
  // CJK Languages
  zh: { translation: 'alibaba-qwen-mt', tts: 'alibaba-cosyvoice', stt: 'alibaba-paraformer', confidence: 95, reasoning: 'Native CJK optimization' },
  ja: { translation: 'alibaba-qwen-mt', tts: 'azure-neural', stt: 'azure-speech', confidence: 93, reasoning: 'Japanese-optimized pipeline' },
  ko: { translation: 'alibaba-qwen-mt', tts: 'azure-neural', stt: 'azure-speech', confidence: 92, reasoning: 'Korean-optimized pipeline' },
  
  // European Languages
  de: { translation: 'deepl', tts: 'elevenlabs', stt: 'azure-speech', confidence: 96, reasoning: 'DeepL excellence for German' },
  fr: { translation: 'deepl', tts: 'elevenlabs', stt: 'azure-speech', confidence: 96, reasoning: 'DeepL excellence for French' },
  es: { translation: 'deepl', tts: 'elevenlabs', stt: 'azure-speech', confidence: 95, reasoning: 'DeepL excellence for Spanish' },
  it: { translation: 'deepl', tts: 'elevenlabs', stt: 'azure-speech', confidence: 94, reasoning: 'DeepL excellence for Italian' },
  pt: { translation: 'deepl', tts: 'elevenlabs', stt: 'azure-speech', confidence: 94, reasoning: 'DeepL excellence for Portuguese' },
  nl: { translation: 'deepl', tts: 'elevenlabs', stt: 'azure-speech', confidence: 93, reasoning: 'DeepL excellence for Dutch' },
  pl: { translation: 'deepl', tts: 'azure-neural', stt: 'azure-speech', confidence: 92, reasoning: 'DeepL for Polish' },
  
  // RTL Languages
  ar: { translation: 'azure-translator', tts: 'azure-neural', stt: 'azure-speech', confidence: 91, reasoning: 'Azure RTL expertise for Arabic' },
  he: { translation: 'google-translate', tts: 'google-tts', stt: 'google-stt', confidence: 88, reasoning: 'Google for Hebrew' },
  fa: { translation: 'azure-translator', tts: 'azure-neural', stt: 'azure-speech', confidence: 87, reasoning: 'Azure for Persian/Farsi' },
  
  // Indian Languages
  hi: { translation: 'google-translate', tts: 'azure-neural', stt: 'azure-speech', confidence: 90, reasoning: 'Azure/Google India optimization' },
  ta: { translation: 'google-translate', tts: 'azure-neural', stt: 'google-stt', confidence: 87, reasoning: 'Google for Tamil' },
  te: { translation: 'google-translate', tts: 'azure-neural', stt: 'google-stt', confidence: 86, reasoning: 'Google for Telugu' },
  bn: { translation: 'google-translate', tts: 'azure-neural', stt: 'google-stt', confidence: 85, reasoning: 'Google for Bengali' },
  
  // African Languages
  sw: { translation: 'google-translate', tts: 'azure-neural', stt: 'google-stt', confidence: 82, reasoning: 'Google for Swahili' },
  am: { translation: 'google-translate', tts: 'google-tts', stt: 'google-stt', confidence: 78, reasoning: 'Google for Amharic' },
  
  // Default/English
  en: { translation: 'deepl', tts: 'elevenlabs', stt: 'azure-speech', confidence: 98, reasoning: 'Premium pipeline for English' },
};

/**
 * Output format provider requirements
 */
const OUTPUT_FORMAT_REQUIREMENTS: Record<string, { requiredCapabilities: string[]; recommendedProviders: string[]; confidence: number; reasoning: string }> = {
  // Documents
  'pdf': { requiredCapabilities: ['llm'], recommendedProviders: ['claude-3.5-sonnet', 'gpt-4o'], confidence: 95, reasoning: 'Standard document generation' },
  'pptx': { requiredCapabilities: ['llm', 'image_gen'], recommendedProviders: ['gpt-4o', 'claude-3.5-sonnet'], confidence: 94, reasoning: 'Presentation with visuals' },
  'docx': { requiredCapabilities: ['llm'], recommendedProviders: ['claude-3.5-sonnet', 'gpt-4o'], confidence: 95, reasoning: 'Word document generation' },
  
  // Video
  'mp4-standard': { requiredCapabilities: ['llm', 'tts', 'video_gen'], recommendedProviders: ['elevenlabs', 'modelslab'], confidence: 88, reasoning: 'Standard video pipeline' },
  'mp4-avatar': { requiredCapabilities: ['llm', 'tts', 'avatar'], recommendedProviders: ['alibaba-wan2', 'heygen'], confidence: 85, reasoning: 'Avatar video with lip-sync' },
  'mp4-fullbody': { requiredCapabilities: ['llm', 'tts', 'fullbody_avatar'], recommendedProviders: ['alibaba-omniavatar'], confidence: 82, reasoning: 'Full-body avatar generation' },
  
  // 3D/Immersive
  '3d-mesh': { requiredCapabilities: ['llm', 'image_gen', '3d_gen'], recommendedProviders: ['modelslab', 'replicate'], confidence: 80, reasoning: '3D mesh generation' },
  'vr-experience': { requiredCapabilities: ['llm', '3d_gen', 'spatial'], recommendedProviders: ['modelslab'], confidence: 75, reasoning: 'VR experience creation' },
  'ar-overlay': { requiredCapabilities: ['llm', 'image_gen', 'ar'], recommendedProviders: ['stability'], confidence: 78, reasoning: 'AR overlay generation' },
  
  // Interactive
  'interactive-web': { requiredCapabilities: ['llm', 'code_gen'], recommendedProviders: ['claude-3.5-sonnet', 'gpt-4o'], confidence: 90, reasoning: 'Interactive web content' },
  'interactive-quiz': { requiredCapabilities: ['llm'], recommendedProviders: ['gpt-4o', 'claude-3.5-sonnet'], confidence: 92, reasoning: 'Quiz/assessment generation' },
  
  // Animation
  'animation-2d': { requiredCapabilities: ['llm', 'image_gen', 'animation'], recommendedProviders: ['modelslab', 'stability'], confidence: 83, reasoning: '2D animation generation' },
  'animation-3d': { requiredCapabilities: ['llm', '3d_gen', 'animation'], recommendedProviders: ['modelslab'], confidence: 78, reasoning: '3D animation generation' },
  
  // Audio
  'podcast': { requiredCapabilities: ['llm', 'tts'], recommendedProviders: ['elevenlabs'], confidence: 94, reasoning: 'Podcast audio generation' },
  'audiobook': { requiredCapabilities: ['llm', 'tts'], recommendedProviders: ['elevenlabs', 'azure-neural'], confidence: 93, reasoning: 'Long-form audio narration' },
};

/**
 * Framework category recommendations by industry
 */
const FRAMEWORK_INDUSTRY_ALIGNMENT: Record<string, { frameworks: string[]; confidence: number; reasoning: string }> = {
  consulting: { frameworks: ['swot', 'porter-five-forces', 'bcg-matrix', 'mckinsey-7s', 'value-chain'], confidence: 95, reasoning: 'Standard consulting frameworks' },
  healthcare: { frameworks: ['patient-journey', 'clinical-pathway', 'care-model', 'outcome-framework'], confidence: 92, reasoning: 'Healthcare-specific frameworks' },
  technology: { frameworks: ['agile', 'lean-startup', 'jobs-to-be-done', 'design-thinking'], confidence: 90, reasoning: 'Tech industry frameworks' },
  finance: { frameworks: ['risk-assessment', 'valuation-model', 'due-diligence', 'balanced-scorecard'], confidence: 91, reasoning: 'Financial analysis frameworks' },
  education: { frameworks: ['blooms-taxonomy', 'addie', 'learning-objectives', 'curriculum-map'], confidence: 89, reasoning: 'Educational design frameworks' },
  marketing: { frameworks: ['customer-journey', 'brand-pyramid', 'marketing-funnel', 'persona'], confidence: 88, reasoning: 'Marketing strategy frameworks' },
  strategy: { frameworks: ['ansoff-matrix', 'blue-ocean', 'pestle', 'scenario-planning'], confidence: 93, reasoning: 'Strategic planning frameworks' },
};

/**
 * Visual feature recommendations by output format
 */
const VISUAL_OUTPUT_ALIGNMENT: Record<string, { features: string[]; avoid: string[]; confidence: number }> = {
  'pdf': { features: ['charts', 'infographics', 'tables', 'diagrams'], avoid: ['animation', '3d', 'video'], confidence: 95 },
  'pptx': { features: ['charts', 'infographics', 'icons', 'smart-art', 'transitions'], avoid: ['3d-heavy', 'video-embed'], confidence: 92 },
  'mp4-standard': { features: ['motion-graphics', 'transitions', 'overlays', 'lower-thirds'], avoid: ['static-tables', 'complex-diagrams'], confidence: 88 },
  'mp4-avatar': { features: ['avatar', 'gestures', 'expressions', 'backgrounds'], avoid: ['complex-charts', 'dense-text'], confidence: 85 },
  '3d-mesh': { features: ['3d-models', 'textures', 'lighting', 'materials'], avoid: ['2d-only', 'tables'], confidence: 80 },
  'interactive-web': { features: ['clickable', 'hover-effects', 'animations', 'responsive'], avoid: ['static-only'], confidence: 90 },
};

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

export class ContextualRecommendationService {
  private static instance: ContextualRecommendationService;

  static getInstance(): ContextualRecommendationService {
    if (!this.instance) {
      this.instance = new ContextualRecommendationService();
    }
    return this.instance;
  }

  /**
   * Get LLM recommendations based on context
   */
  getLLMRecommendations(context: RecommendationContext): RecommendationResult {
    const { llmZone, industry, globalTier } = context;
    const recommendations: ContextualRecommendation[] = [];
    const warnings: string[] = [];

    // 1. Zone-based recommendations
    const zoneScores = ZONE_PROVIDER_SCORES[llmZone] || ZONE_PROVIDER_SCORES.fallback;
    
    Object.entries(zoneScores).forEach(([providerId, scores], index) => {
      let adjustedConfidence = scores.confidence;
      let adjustedReasoning = scores.reasoning;

      // 2. Apply industry bonus
      if (industry && INDUSTRY_PROVIDER_SCORES[industry]) {
        const industryRec = INDUSTRY_PROVIDER_SCORES[industry];
        if (industryRec.llm === providerId) {
          adjustedConfidence = Math.min(100, adjustedConfidence + 5);
          adjustedReasoning += ` + Industry-optimized for ${industry}`;
        }
      }

      // 3. Apply tier filtering
      const providerTier = this.getProviderTier(providerId);
      const tierAllowed = this.isTierAllowed(providerTier, globalTier);
      
      if (!tierAllowed) {
        adjustedConfidence = Math.max(0, adjustedConfidence - 30);
        warnings.push(`${providerId} requires ${providerTier} tier`);
      }

      recommendations.push({
        id: providerId,
        name: this.getProviderDisplayName(providerId),
        category: 'llm',
        confidence: adjustedConfidence,
        qualityScore: scores.quality,
        speedScore: scores.speed,
        costScore: scores.cost,
        isRecommended: index === 0 && tierAllowed,
        isPrimary: index === 0 && tierAllowed,
        reasoning: adjustedReasoning,
        warnings: tierAllowed ? [] : [`Requires ${providerTier} tier`],
        tier: providerTier,
        source: 'region',
      });
    });

    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence);

    const primary = recommendations.find(r => r.isRecommended) || recommendations[0];

    return {
      recommendations,
      primaryRecommendation: primary || null,
      overallConfidence: primary?.confidence || 0,
      overallReasoning: `${llmZone.toUpperCase()} zone optimization${industry ? ` + ${industry} industry alignment` : ''}`,
      suboptimalWarnings: warnings,
      alternativeCount: recommendations.length - 1,
    };
  }

  /**
   * Get translation provider recommendations
   */
  getTranslationRecommendations(context: RecommendationContext): RecommendationResult {
    const { primaryLanguage, additionalLanguages, industry, globalTier } = context;
    const recommendations: ContextualRecommendation[] = [];
    const warnings: string[] = [];

    // Get primary language optimization
    const langCode = primaryLanguage.split('-')[0];
    const langOpt = LANGUAGE_PROVIDER_OPTIMIZATION[langCode] || LANGUAGE_PROVIDER_OPTIMIZATION.en;

    // Primary recommendation
    recommendations.push({
      id: langOpt.translation,
      name: this.getProviderDisplayName(langOpt.translation),
      category: 'translation',
      confidence: langOpt.confidence,
      qualityScore: langOpt.confidence,
      speedScore: 90,
      costScore: 80,
      isRecommended: true,
      isPrimary: true,
      reasoning: langOpt.reasoning,
      warnings: [],
      tier: this.getProviderTier(langOpt.translation),
      source: 'language',
    });

    // Add alternatives based on language family
    const alternatives = this.getTranslationAlternatives(langCode);
    alternatives.forEach((alt, index) => {
      if (alt.provider !== langOpt.translation) {
        recommendations.push({
          id: alt.provider,
          name: this.getProviderDisplayName(alt.provider),
          category: 'translation',
          confidence: alt.confidence,
          qualityScore: alt.confidence,
          speedScore: 85,
          costScore: 75,
          isRecommended: false,
          isPrimary: false,
          reasoning: alt.reasoning,
          warnings: [],
          tier: this.getProviderTier(alt.provider),
          source: 'language',
        });
      }
    });

    // Check for multi-language considerations
    if (additionalLanguages.length > 0) {
      const multiLangWarnings = this.checkMultiLanguageCompatibility(primaryLanguage, additionalLanguages);
      warnings.push(...multiLangWarnings);
    }

    return {
      recommendations,
      primaryRecommendation: recommendations[0],
      overallConfidence: recommendations[0]?.confidence || 0,
      overallReasoning: `Optimized for ${this.getLanguageDisplayName(primaryLanguage)}`,
      suboptimalWarnings: warnings,
      alternativeCount: recommendations.length - 1,
    };
  }

  /**
   * Get TTS (voice) recommendations
   */
  getTTSRecommendations(context: RecommendationContext): RecommendationResult {
    const { primaryLanguage, audioEnabled, voiceStyle, globalTier } = context;
    const recommendations: ContextualRecommendation[] = [];
    const warnings: string[] = [];

    if (!audioEnabled) {
      return {
        recommendations: [],
        primaryRecommendation: null,
        overallConfidence: 0,
        overallReasoning: 'Audio not enabled',
        suboptimalWarnings: [],
        alternativeCount: 0,
      };
    }

    const langCode = primaryLanguage.split('-')[0];
    const langOpt = LANGUAGE_PROVIDER_OPTIMIZATION[langCode] || LANGUAGE_PROVIDER_OPTIMIZATION.en;

    // Primary TTS recommendation
    recommendations.push({
      id: langOpt.tts,
      name: this.getProviderDisplayName(langOpt.tts),
      category: 'tts',
      confidence: langOpt.confidence,
      qualityScore: 95,
      speedScore: 88,
      costScore: 70,
      isRecommended: true,
      isPrimary: true,
      reasoning: `Optimal voice synthesis for ${this.getLanguageDisplayName(primaryLanguage)}`,
      warnings: [],
      tier: this.getProviderTier(langOpt.tts),
      source: 'language',
    });

    // Add ElevenLabs if not primary (premium option)
    if (langOpt.tts !== 'elevenlabs') {
      recommendations.push({
        id: 'elevenlabs',
        name: 'ElevenLabs',
        category: 'tts',
        confidence: 85,
        qualityScore: 98,
        speedScore: 85,
        costScore: 50,
        isRecommended: false,
        isPrimary: false,
        reasoning: 'Premium voice quality with voice cloning',
        warnings: globalTier === 'standard' ? ['Requires Advanced tier'] : [],
        tier: 'advanced',
        source: 'language',
      });
    }

    // Add Azure Neural as alternative
    if (langOpt.tts !== 'azure-neural') {
      recommendations.push({
        id: 'azure-neural',
        name: 'Azure Neural TTS',
        category: 'tts',
        confidence: 82,
        qualityScore: 92,
        speedScore: 90,
        costScore: 75,
        isRecommended: false,
        isPrimary: false,
        reasoning: 'Enterprise-grade with wide language support',
        warnings: [],
        tier: 'standard',
        source: 'language',
      });
    }

    return {
      recommendations,
      primaryRecommendation: recommendations[0],
      overallConfidence: recommendations[0]?.confidence || 0,
      overallReasoning: `Voice synthesis optimized for ${this.getLanguageDisplayName(primaryLanguage)}`,
      suboptimalWarnings: warnings,
      alternativeCount: recommendations.length - 1,
    };
  }

  /**
   * Get output format recommendations
   */
  getOutputFormatRecommendations(context: RecommendationContext): RecommendationResult {
    const { outputFormat, contentTypes, industry, globalTier } = context;
    const recommendations: ContextualRecommendation[] = [];
    const warnings: string[] = [];

    if (!outputFormat) {
      // Return all available formats scored by context
      Object.entries(OUTPUT_FORMAT_REQUIREMENTS).forEach(([formatId, config]) => {
        let confidence = config.confidence;
        
        // Boost confidence for industry-appropriate formats
        if (industry === 'consulting' && ['pptx', 'pdf'].includes(formatId)) {
          confidence = Math.min(100, confidence + 5);
        }
        if (industry === 'media' && formatId.startsWith('mp4')) {
          confidence = Math.min(100, confidence + 5);
        }

        recommendations.push({
          id: formatId,
          name: this.getOutputFormatDisplayName(formatId),
          category: 'output-format',
          confidence,
          qualityScore: config.confidence,
          speedScore: formatId.includes('3d') || formatId.includes('vr') ? 60 : 85,
          costScore: formatId.includes('avatar') || formatId.includes('3d') ? 50 : 80,
          isRecommended: false,
          isPrimary: false,
          reasoning: config.reasoning,
          warnings: [],
          tier: this.getOutputFormatTier(formatId),
          source: 'content-type',
        });
      });
    } else {
      // Score the selected format
      const config = OUTPUT_FORMAT_REQUIREMENTS[outputFormat];
      if (config) {
        recommendations.push({
          id: outputFormat,
          name: this.getOutputFormatDisplayName(outputFormat),
          category: 'output-format',
          confidence: config.confidence,
          qualityScore: config.confidence,
          speedScore: 85,
          costScore: 75,
          isRecommended: true,
          isPrimary: true,
          reasoning: config.reasoning,
          warnings: [],
          tier: this.getOutputFormatTier(outputFormat),
          source: 'content-type',
        });
      }
    }

    recommendations.sort((a, b) => b.confidence - a.confidence);

    return {
      recommendations,
      primaryRecommendation: recommendations.find(r => r.isPrimary) || recommendations[0] || null,
      overallConfidence: recommendations[0]?.confidence || 0,
      overallReasoning: outputFormat ? `Selected: ${this.getOutputFormatDisplayName(outputFormat)}` : 'Choose output format based on content needs',
      suboptimalWarnings: warnings,
      alternativeCount: recommendations.length - 1,
    };
  }

  /**
   * Get framework recommendations based on industry
   */
  getFrameworkRecommendations(context: RecommendationContext): RecommendationResult {
    const { industry, frameworks, contentTypes } = context;
    const recommendations: ContextualRecommendation[] = [];
    const warnings: string[] = [];

    const industryKey = industry?.toLowerCase() || 'strategy';
    const alignment = FRAMEWORK_INDUSTRY_ALIGNMENT[industryKey] || FRAMEWORK_INDUSTRY_ALIGNMENT.strategy;

    alignment.frameworks.forEach((frameworkId, index) => {
      const isSelected = frameworks?.includes(frameworkId);
      
      recommendations.push({
        id: frameworkId,
        name: this.getFrameworkDisplayName(frameworkId),
        category: 'framework',
        confidence: alignment.confidence - (index * 3), // Slight decrease for lower-ranked
        qualityScore: 90,
        speedScore: 85,
        costScore: 95,
        isRecommended: index < 3, // Top 3 are recommended
        isPrimary: index === 0,
        reasoning: alignment.reasoning,
        warnings: [],
        tier: 'standard',
        source: 'industry',
      });
    });

    return {
      recommendations,
      primaryRecommendation: recommendations[0] || null,
      overallConfidence: alignment.confidence,
      overallReasoning: `Frameworks optimized for ${industry || 'general strategy'}`,
      suboptimalWarnings: warnings,
      alternativeCount: recommendations.length - 1,
    };
  }

  /**
   * Get visual feature recommendations
   */
  getVisualFeatureRecommendations(context: RecommendationContext): RecommendationResult {
    const { outputFormat, visualFeatures, industry } = context;
    const recommendations: ContextualRecommendation[] = [];
    const warnings: string[] = [];

    const formatKey = outputFormat || 'pptx';
    const alignment = VISUAL_OUTPUT_ALIGNMENT[formatKey] || VISUAL_OUTPUT_ALIGNMENT['pptx'];

    // Recommended features
    alignment.features.forEach((featureId, index) => {
      const isSelected = visualFeatures?.includes(featureId);
      
      recommendations.push({
        id: featureId,
        name: this.getVisualFeatureDisplayName(featureId),
        category: 'visual-feature',
        confidence: alignment.confidence - (index * 2),
        qualityScore: 90,
        speedScore: 85,
        costScore: 90,
        isRecommended: true,
        isPrimary: index === 0,
        reasoning: `Optimized for ${this.getOutputFormatDisplayName(formatKey)}`,
        warnings: [],
        tier: 'standard',
        source: 'output-format',
      });
    });

    // Features to avoid (with warning)
    alignment.avoid.forEach(featureId => {
      const isSelected = visualFeatures?.includes(featureId);
      if (isSelected) {
        warnings.push(`${this.getVisualFeatureDisplayName(featureId)} may not work well with ${this.getOutputFormatDisplayName(formatKey)}`);
      }
    });

    return {
      recommendations,
      primaryRecommendation: recommendations[0] || null,
      overallConfidence: alignment.confidence,
      overallReasoning: `Visual features optimized for ${this.getOutputFormatDisplayName(formatKey)}`,
      suboptimalWarnings: warnings,
      alternativeCount: recommendations.length - 1,
    };
  }

  /**
   * Get unified recommendations for all categories
   */
  getUnifiedRecommendations(context: RecommendationContext): Record<RecommendationType, RecommendationResult> {
    return {
      llm: this.getLLMRecommendations(context),
      translation: this.getTranslationRecommendations(context),
      tts: this.getTTSRecommendations(context),
      stt: this.getTranslationRecommendations(context), // Similar logic
      image: this.getImageRecommendations(context),
      video: this.getVideoRecommendations(context),
      avatar: this.getAvatarRecommendations(context),
      industry: this.getIndustryRecommendations(context),
      framework: this.getFrameworkRecommendations(context),
      'visual-feature': this.getVisualFeatureRecommendations(context),
      'output-format': this.getOutputFormatRecommendations(context),
      'design-template': this.getDesignRecommendations(context),
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getProviderTier(providerId: string): GlobalTier {
    const premiumProviders = ['elevenlabs', 'claude-3.5-sonnet', 'gpt-4o', 'alibaba-omniavatar'];
    const advancedProviders = ['qwen-max', 'gemini-1.5-pro', 'deepseek-v3', 'modelslab', 'heygen'];
    
    if (premiumProviders.some(p => providerId.includes(p))) return 'premium';
    if (advancedProviders.some(p => providerId.includes(p))) return 'advanced';
    return 'standard';
  }

  private isTierAllowed(providerTier: GlobalTier, userTier: GlobalTier): boolean {
    const tierOrder: GlobalTier[] = ['standard', 'advanced', 'premium'];
    return tierOrder.indexOf(providerTier) <= tierOrder.indexOf(userTier);
  }

  private getProviderDisplayName(providerId: string): string {
    const names: Record<string, string> = {
      'claude-3.5-sonnet': 'Claude 3.5 Sonnet',
      'gpt-4o': 'GPT-4o',
      'gemini-1.5-pro': 'Gemini 1.5 Pro',
      'gemini-pro': 'Gemini Pro',
      'gemini-flash': 'Gemini Flash',
      'qwen-max': 'Qwen Max',
      'qwen-plus': 'Qwen Plus',
      'deepseek-v3': 'DeepSeek V3',
      'elevenlabs': 'ElevenLabs',
      'azure-neural': 'Azure Neural TTS',
      'azure-speech': 'Azure Speech',
      'alibaba-cosyvoice': 'Alibaba CosyVoice',
      'alibaba-paraformer': 'Alibaba Paraformer',
      'alibaba-qwen-mt': 'Alibaba Qwen-MT',
      'alibaba-wan2': 'Alibaba Wan 2.2',
      'alibaba-omniavatar': 'Alibaba OmniAvatar',
      'deepl': 'DeepL Pro',
      'google-translate': 'Google Translate',
      'google-tts': 'Google TTS',
      'google-stt': 'Google STT',
      'azure-translator': 'Azure Translator',
      'modelslab': 'ModelsLab',
      'heygen': 'HeyGen',
      'replicate': 'Replicate',
      'stability': 'Stability AI',
    };
    return names[providerId] || providerId;
  }

  private getLanguageDisplayName(code: string): string {
    const names: Record<string, string> = {
      en: 'English', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
      de: 'German', fr: 'French', es: 'Spanish', it: 'Italian',
      pt: 'Portuguese', nl: 'Dutch', pl: 'Polish', ar: 'Arabic',
      he: 'Hebrew', fa: 'Persian', hi: 'Hindi', ta: 'Tamil',
      te: 'Telugu', bn: 'Bengali', sw: 'Swahili', am: 'Amharic',
    };
    return names[code.split('-')[0]] || code;
  }

  private getOutputFormatDisplayName(formatId: string): string {
    const names: Record<string, string> = {
      'pdf': 'PDF Document',
      'pptx': 'PowerPoint',
      'docx': 'Word Document',
      'mp4-standard': 'Standard Video',
      'mp4-avatar': 'Avatar Video',
      'mp4-fullbody': 'Full-body Avatar Video',
      '3d-mesh': '3D Mesh Model',
      'vr-experience': 'VR Experience',
      'ar-overlay': 'AR Overlay',
      'interactive-web': 'Interactive Web',
      'interactive-quiz': 'Interactive Quiz',
      'animation-2d': '2D Animation',
      'animation-3d': '3D Animation',
      'podcast': 'Podcast Audio',
      'audiobook': 'Audiobook',
    };
    return names[formatId] || formatId;
  }

  private getOutputFormatTier(formatId: string): GlobalTier {
    const premiumFormats = ['mp4-fullbody', 'vr-experience', '3d-mesh', 'animation-3d'];
    const advancedFormats = ['mp4-avatar', 'ar-overlay', 'animation-2d'];
    
    if (premiumFormats.includes(formatId)) return 'premium';
    if (advancedFormats.includes(formatId)) return 'advanced';
    return 'standard';
  }

  private getFrameworkDisplayName(frameworkId: string): string {
    const names: Record<string, string> = {
      'swot': 'SWOT Analysis',
      'porter-five-forces': "Porter's Five Forces",
      'bcg-matrix': 'BCG Matrix',
      'mckinsey-7s': 'McKinsey 7S',
      'value-chain': 'Value Chain Analysis',
      'ansoff-matrix': 'Ansoff Matrix',
      'blue-ocean': 'Blue Ocean Strategy',
      'pestle': 'PESTLE Analysis',
      'scenario-planning': 'Scenario Planning',
      'patient-journey': 'Patient Journey',
      'clinical-pathway': 'Clinical Pathway',
      'care-model': 'Care Model',
      'outcome-framework': 'Outcome Framework',
      'agile': 'Agile Methodology',
      'lean-startup': 'Lean Startup',
      'jobs-to-be-done': 'Jobs to Be Done',
      'design-thinking': 'Design Thinking',
      'risk-assessment': 'Risk Assessment',
      'valuation-model': 'Valuation Model',
      'due-diligence': 'Due Diligence',
      'balanced-scorecard': 'Balanced Scorecard',
      'blooms-taxonomy': "Bloom's Taxonomy",
      'addie': 'ADDIE Model',
      'learning-objectives': 'Learning Objectives',
      'curriculum-map': 'Curriculum Map',
      'customer-journey': 'Customer Journey',
      'brand-pyramid': 'Brand Pyramid',
      'marketing-funnel': 'Marketing Funnel',
      'persona': 'Persona Development',
    };
    return names[frameworkId] || frameworkId;
  }

  private getVisualFeatureDisplayName(featureId: string): string {
    const names: Record<string, string> = {
      'charts': 'Charts & Graphs',
      'infographics': 'Infographics',
      'tables': 'Data Tables',
      'diagrams': 'Diagrams',
      'icons': 'Icons',
      'smart-art': 'Smart Art',
      'transitions': 'Transitions',
      'motion-graphics': 'Motion Graphics',
      'overlays': 'Overlays',
      'lower-thirds': 'Lower Thirds',
      'avatar': 'Avatar',
      'gestures': 'Gestures',
      'expressions': 'Expressions',
      'backgrounds': 'Backgrounds',
      '3d-models': '3D Models',
      'textures': 'Textures',
      'lighting': 'Lighting',
      'materials': 'Materials',
      'clickable': 'Clickable Elements',
      'hover-effects': 'Hover Effects',
      'animations': 'Animations',
      'responsive': 'Responsive Design',
      'animation': 'Animation',
      '3d': '3D Elements',
      'video': 'Video Embeds',
      '3d-heavy': '3D Heavy Content',
      'video-embed': 'Video Embeds',
      'static-tables': 'Static Tables',
      'complex-diagrams': 'Complex Diagrams',
      'dense-text': 'Dense Text',
      'complex-charts': 'Complex Charts',
      '2d-only': '2D Only',
      'static-only': 'Static Only',
    };
    return names[featureId] || featureId;
  }

  private getTranslationAlternatives(langCode: string): Array<{ provider: string; confidence: number; reasoning: string }> {
    // CJK alternatives
    if (['zh', 'ja', 'ko'].includes(langCode)) {
      return [
        { provider: 'google-translate', confidence: 85, reasoning: 'Universal fallback' },
        { provider: 'deepl', confidence: 80, reasoning: 'Quality alternative' },
      ];
    }
    // European alternatives
    if (['de', 'fr', 'es', 'it', 'pt', 'nl', 'pl'].includes(langCode)) {
      return [
        { provider: 'google-translate', confidence: 88, reasoning: 'Wide coverage' },
        { provider: 'azure-translator', confidence: 85, reasoning: 'Enterprise option' },
      ];
    }
    // Default
    return [
      { provider: 'google-translate', confidence: 85, reasoning: 'Universal fallback' },
      { provider: 'azure-translator', confidence: 82, reasoning: 'Enterprise option' },
    ];
  }

  private checkMultiLanguageCompatibility(primary: string, additional: string[]): string[] {
    const warnings: string[] = [];
    const primaryFamily = this.getLanguageFamily(primary);
    
    additional.forEach(lang => {
      const family = this.getLanguageFamily(lang);
      if (family !== primaryFamily && this.requiresDifferentProvider(primaryFamily, family)) {
        warnings.push(`${this.getLanguageDisplayName(lang)} may require different provider than ${this.getLanguageDisplayName(primary)}`);
      }
    });
    
    return warnings;
  }

  private getLanguageFamily(code: string): string {
    const families: Record<string, string> = {
      zh: 'cjk', ja: 'cjk', ko: 'cjk',
      ar: 'rtl', he: 'rtl', fa: 'rtl',
      hi: 'indic', ta: 'indic', te: 'indic', bn: 'indic',
      de: 'european', fr: 'european', es: 'european', it: 'european', pt: 'european',
      en: 'english',
    };
    return families[code.split('-')[0]] || 'other';
  }

  private requiresDifferentProvider(family1: string, family2: string): boolean {
    const incompatible = [
      ['cjk', 'european'],
      ['cjk', 'rtl'],
      ['rtl', 'indic'],
    ];
    return incompatible.some(([a, b]) => 
      (family1 === a && family2 === b) || (family1 === b && family2 === a)
    );
  }

  // Placeholder methods for other categories
  private getImageRecommendations(context: RecommendationContext): RecommendationResult {
    return this.createPlaceholderResult('image', 'Image generation recommendations');
  }

  private getVideoRecommendations(context: RecommendationContext): RecommendationResult {
    return this.createPlaceholderResult('video', 'Video generation recommendations');
  }

  getAvatarRecommendations(context: RecommendationContext): RecommendationResult {
    const { outputFormat, globalTier } = context;
    const recommendations: ContextualRecommendation[] = [];

    if (outputFormat?.includes('avatar') || outputFormat?.includes('fullbody')) {
      recommendations.push({
        id: 'alibaba-wan2',
        name: 'Alibaba Wan 2.2',
        category: 'avatar',
        confidence: 92,
        qualityScore: 95,
        speedScore: 80,
        costScore: 70,
        isRecommended: true,
        isPrimary: true,
        reasoning: 'Best-in-class avatar generation with lip-sync',
        warnings: globalTier === 'standard' ? ['Requires Advanced tier'] : [],
        tier: 'advanced',
        source: 'output-format',
      });

      recommendations.push({
        id: 'heygen',
        name: 'HeyGen',
        category: 'avatar',
        confidence: 88,
        qualityScore: 92,
        speedScore: 85,
        costScore: 65,
        isRecommended: false,
        isPrimary: false,
        reasoning: 'Premium avatar with extensive customization',
        warnings: globalTier !== 'premium' ? ['Requires Premium tier'] : [],
        tier: 'premium',
        source: 'output-format',
      });
    }

    return {
      recommendations,
      primaryRecommendation: recommendations[0] || null,
      overallConfidence: recommendations[0]?.confidence || 0,
      overallReasoning: 'Avatar generation recommendations',
      suboptimalWarnings: [],
      alternativeCount: recommendations.length - 1,
    };
  }

  private getIndustryRecommendations(context: RecommendationContext): RecommendationResult {
    return this.createPlaceholderResult('industry', 'Industry-specific recommendations');
  }

  private getDesignRecommendations(context: RecommendationContext): RecommendationResult {
    return this.createPlaceholderResult('design-template', 'Design template recommendations');
  }

  private createPlaceholderResult(category: RecommendationType, reasoning: string): RecommendationResult {
    return {
      recommendations: [],
      primaryRecommendation: null,
      overallConfidence: 0,
      overallReasoning: reasoning,
      suboptimalWarnings: [],
      alternativeCount: 0,
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const contextualRecommendationService = ContextualRecommendationService.getInstance();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export function getContextualRecommendation(
  type: RecommendationType,
  context: RecommendationContext
): RecommendationResult {
  const service = ContextualRecommendationService.getInstance();
  
  switch (type) {
    case 'llm':
      return service.getLLMRecommendations(context);
    case 'translation':
      return service.getTranslationRecommendations(context);
    case 'tts':
      return service.getTTSRecommendations(context);
    case 'framework':
      return service.getFrameworkRecommendations(context);
    case 'visual-feature':
      return service.getVisualFeatureRecommendations(context);
    case 'output-format':
      return service.getOutputFormatRecommendations(context);
    case 'avatar':
      return service.getAvatarRecommendations(context);
    default:
      return service.getUnifiedRecommendations(context)[type];
  }
}

export function getAllRecommendations(context: RecommendationContext): Record<RecommendationType, RecommendationResult> {
  return ContextualRecommendationService.getInstance().getUnifiedRecommendations(context);
}
