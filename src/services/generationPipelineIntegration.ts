/**
 * Generation Pipeline Integration Service
 * 
 * Bridges all routing, quality, and compliance services into the 8-step wizard
 * and generation pipeline (Step 7 pre-generation validation)
 */

import {
  selectLLM,
  selectTTS,
  selectSTT,
  selectTranslation,
  getUnifiedRouting,
  REGIONAL_CONTEXT_PROMPTS,
  type UnifiedRoutingConfig,
  type UnifiedRoutingResult,
  type TaskType,
  type QualityTier
} from './unifiedRoutingLogic';

import {
  getLLMQualityForLanguage,
  getTTSQualityForLanguage,
  getProviderRecommendation,
  validateTestCriteria,
  assessQualityScore,
  type LLMQualityBenchmark,
  type TTSQualityBenchmark,
  type ProviderRecommendation
} from './qualityBenchmarkService';

import {
  getRegionFromCountry,
  getPrivacyPolicy,
  getContentPolicy,
  type ComplianceRegion
} from './regionalComplianceRegistry';

import {
  enhancedContentModeration,
  type ModerationResult
} from './enhancedContentModerationService';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface GenerationPipelineConfig {
  // User context
  userRegion: string;
  userLanguage: string;
  userTier: 'free' | 'starter' | 'pro' | 'enterprise';
  
  // Task context
  taskType: TaskType;
  inputSource: string;
  outputType: string;
  
  // Languages
  sourceLanguage?: string;
  targetLanguages?: string[];
  
  // Quality preferences
  prioritize: 'quality' | 'speed' | 'cost';
  requireRealtime?: boolean;
}

export interface PipelineValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  
  // Routing decisions
  routing: UnifiedRoutingResult;
  
  // Quality predictions
  qualityPredictions: {
    llm: LLMQualityBenchmark | null;
    tts: TTSQualityBenchmark | null;
    recommendation: ProviderRecommendation;
  };
  
  // Compliance status
  compliance: {
    region: ComplianceRegion;
    isRTL: boolean;
    consentRequired: string[];
    contentRestrictions: string[];
  };
  
  // Cost estimates
  costEstimate: {
    llmCost: number;
    ttsCost: number;
    translationCost: number;
    total: number;
    vsBaseline: string;
  };
  
  // Regional context
  contextPrompt: string | null;
  formalityLevel: string | null;
}

export interface ContentValidationResult {
  passed: boolean;
  moderation: ModerationResult;
  blockedReasons: string[];
  warnings: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRE-GENERATION VALIDATION (Step 7)
// ═══════════════════════════════════════════════════════════════════════════════

export function validateGenerationPipeline(
  config: GenerationPipelineConfig
): PipelineValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Get unified routing
  const routingConfig: UnifiedRoutingConfig = {
    region: config.userRegion,
    language: config.userLanguage,
    taskType: config.taskType,
    qualityTier: mapTierToQuality(config.userTier),
    requiresRealtime: config.requireRealtime,
    sourceLang: config.sourceLanguage,
    targetLang: config.targetLanguages?.[0]
  };
  
  const routing = getUnifiedRouting(routingConfig);

  // 2. Get quality predictions
  const llmQuality = getLLMQualityForLanguage(config.userLanguage);
  const ttsQuality = getTTSQualityForLanguage(config.userLanguage);
  const recommendation = getProviderRecommendation(
    config.userLanguage,
    'llm',
    config.prioritize
  );

  // 3. Check quality warnings
  if (llmQuality && llmQuality.avoid.length > 0) {
    warnings.push(`Avoid these LLM providers for ${llmQuality.language}: ${llmQuality.avoid.join(', ')}`);
  }
  if (llmQuality?.notes) {
    warnings.push(llmQuality.notes);
  }

  // 4. Check tier compatibility
  if (!validateTierAccess(config.userTier, routing.llm.zone)) {
    errors.push(`Feature requires higher tier. Current: ${config.userTier}`);
  }

  // 5. Get compliance info
  const complianceRegion = getRegionFromCountry(config.userRegion);
  const contentPolicy = getContentPolicy(complianceRegion);
  const privacyPolicy = getPrivacyPolicy(complianceRegion);

  // Build content restrictions from content policy
  const contentRestrictions: string[] = [];
  if (!contentPolicy.adultContentAllowed) contentRestrictions.push('adult_content');
  if (contentPolicy.politicalContentRestricted) contentRestrictions.push('political_content');
  if (!contentPolicy.alcoholContentAllowed) contentRestrictions.push('alcohol');
  if (!contentPolicy.gamblingContentAllowed) contentRestrictions.push('gambling');
  if (contentPolicy.religiousSensitivity === 'strict') contentRestrictions.push('religious_content');
  if (contentPolicy.lgbtqContentRestricted) contentRestrictions.push('lgbtq_content');

  // 6. Get regional context
  const contextPromptData = REGIONAL_CONTEXT_PROMPTS[config.userRegion];

  // 7. Build result
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    routing,
    qualityPredictions: {
      llm: llmQuality,
      tts: ttsQuality,
      recommendation
    },
    compliance: {
      region: complianceRegion,
      isRTL: routing.isRTL,
      consentRequired: privacyPolicy.requiresExplicitConsent 
        ? ['cookies', 'dataProcessing', 'marketing'] 
        : ['basic'],
      contentRestrictions
    },
    costEstimate: {
      llmCost: routing.llm.cost,
      ttsCost: routing.tts.cost,
      translationCost: routing.translation?.cost || 0,
      total: routing.costEstimate.totalPerPipeline,
      vsBaseline: routing.costEstimate.vsBaseline
    },
    contextPrompt: contextPromptData?.contextPrompt || null,
    formalityLevel: contextPromptData?.formalityLevel || null
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT VALIDATION (Pre-Generation)
// ═══════════════════════════════════════════════════════════════════════════════

export async function validateContent(
  content: string,
  region: string,
  contentType: string
): Promise<ContentValidationResult> {
  const blockedReasons: string[] = [];
  const warnings: string[] = [];

  // Run content moderation using moderateContent method
  const moderation = await enhancedContentModeration.moderateContent(content, 'text');

  // Check for blocking violations
  const hasAutoBlock = moderation.violations.some(v => v.autoBlock);
  if (hasAutoBlock) {
    blockedReasons.push(...moderation.violations.filter(v => v.autoBlock).map(v => v.description));
  }

  // Collect warnings
  if (moderation.warnings.length > 0) {
    warnings.push(...moderation.warnings.map(w => w.message));
  }

  // Check regional flags
  if (moderation.regionalFlags.length > 0) {
    warnings.push(...moderation.regionalFlags.map(f => f.description));
  }

  return {
    passed: moderation.isAllowed && !hasAutoBlock,
    moderation,
    blockedReasons,
    warnings
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER SELECTION FOR WIZARD STEPS
// ═══════════════════════════════════════════════════════════════════════════════

export interface StepProviderConfig {
  step: number;
  stepName: string;
  providers: {
    llm: { provider: string; model: string; reason: string };
    tts?: { provider: string; voice: string; reason: string };
    translation?: { provider: string; reason: string };
  };
  qualityScore: number;
  estimatedCredits: number;
}

export function getProvidersForWizardStep(
  step: number,
  region: string,
  language: string,
  tier: 'free' | 'starter' | 'pro' | 'enterprise'
): StepProviderConfig {
  const llmRouting = selectLLM(region, getTaskTypeForStep(step));
  const ttsRouting = selectTTS(region, language, mapTierToQuality(tier));
  
  const llmQuality = getLLMQualityForLanguage(language);
  const qualityScore = llmQuality?.qualityScore || 75;

  const creditMultiplier = { free: 1, starter: 1, pro: 2.5, enterprise: 5 };
  const baseCredits = getBaseCreditsForStep(step);
  
  return {
    step,
    stepName: getStepName(step),
    providers: {
      llm: {
        provider: llmRouting.primary.split('-')[0],
        model: llmRouting.primary,
        reason: `Best for ${language} in ${llmRouting.zone} zone`
      },
      tts: step >= 5 ? {
        provider: ttsRouting.provider,
        voice: ttsRouting.voiceOptions[0] || 'default',
        reason: `${ttsRouting.quality} quality for ${language}`
      } : undefined,
      translation: step >= 6 ? {
        provider: selectTranslation('en', language).provider,
        reason: `Optimized for ${language} translation`
      } : undefined
    },
    qualityScore,
    estimatedCredits: baseCredits * creditMultiplier[tier]
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENERATION REQUEST BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

export interface EnhancedGenerationRequest {
  // Original request data
  originalRequest: Record<string, any>;
  
  // Injected routing
  routing: {
    llm: { primary: string; fallback: string; zone: string };
    tts: { provider: string; voice: string };
    translation: { provider: string } | null;
  };
  
  // Regional context
  regionalContext: {
    contextPrompt: string;
    formalityLevel: string;
    isRTL: boolean;
    dialectHints?: string;
  };
  
  // Quality gates
  qualityGates: {
    minQualityScore: number;
    maxLatencyMs: number;
    fallbackEnabled: boolean;
  };
  
  // Compliance
  compliance: {
    region: string;
    contentRestrictions: string[];
    sanitizePII: boolean;
  };
}

export function buildEnhancedGenerationRequest(
  originalRequest: Record<string, any>,
  config: GenerationPipelineConfig
): EnhancedGenerationRequest {
  const validation = validateGenerationPipeline(config);
  const contextPrompt = REGIONAL_CONTEXT_PROMPTS[config.userRegion];

  return {
    originalRequest,
    routing: {
      llm: {
        primary: validation.routing.llm.primary,
        fallback: validation.routing.llm.fallback,
        zone: validation.routing.llm.zone
      },
      tts: {
        provider: validation.routing.tts.provider,
        voice: validation.routing.tts.voiceOptions[0] || 'default'
      },
      translation: config.targetLanguages?.length ? {
        provider: validation.routing.translation?.provider || 'google-translate'
      } : null
    },
    regionalContext: {
      contextPrompt: contextPrompt?.contextPrompt || 'Generate professional content.',
      formalityLevel: contextPrompt?.formalityLevel || 'formal',
      isRTL: validation.routing.isRTL,
      dialectHints: contextPrompt?.specialInstructions
    },
    qualityGates: {
      minQualityScore: config.prioritize === 'quality' ? 85 : 70,
      maxLatencyMs: config.prioritize === 'speed' ? 5000 : 15000,
      fallbackEnabled: true
    },
    compliance: {
      region: config.userRegion,
      contentRestrictions: validation.compliance.contentRestrictions,
      sanitizePII: true
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function mapTierToQuality(tier: string): QualityTier {
  const map: Record<string, QualityTier> = {
    free: 'budget',
    starter: 'standard',
    pro: 'premium',
    enterprise: 'premium'
  };
  return map[tier] || 'standard';
}

function validateTierAccess(userTier: string, zone: string): boolean {
  // DeepSeek zone is available to all tiers
  if (zone === 'deepseek') return true;
  
  const tierOrder = ['free', 'starter', 'pro', 'enterprise'];
  const userIndex = tierOrder.indexOf(userTier);
  
  // Premium zones require pro+
  if (['claude', 'gpt4'].includes(zone)) {
    return userIndex >= 2; // pro or enterprise
  }
  
  return true;
}

function getTaskTypeForStep(step: number): TaskType {
  const stepTaskMap: Record<number, TaskType> = {
    0: 'general',
    1: 'general',
    2: 'analysis',
    3: 'analysis',
    4: 'creative',
    5: 'creative',
    6: 'general',
    7: 'general'
  };
  return stepTaskMap[step] || 'general';
}

function getBaseCreditsForStep(step: number): number {
  const creditMap: Record<number, number> = {
    0: 0,
    1: 1,
    2: 2,
    3: 2,
    4: 3,
    5: 5,
    6: 10,
    7: 5
  };
  return creditMap[step] || 1;
}

function getStepName(step: number): string {
  const names: Record<number, string> = {
    0: 'Unified Input',
    1: 'Language & Region',
    2: 'Industry & Segment',
    3: 'Framework Selection',
    4: 'Design & Template',
    5: 'Visual Features',
    6: 'Agent & Voice Orchestration',
    7: 'Generate & Publish'
  };
  return names[step] || `Step ${step}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MONITORING & QUALITY TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

export interface GenerationQualityLog {
  sessionId: string;
  region: string;
  language: string;
  llmProvider: string;
  ttsProvider: string;
  qualityScore: number;
  latencyMs: number;
  regenerationCount: number;
  userRating?: number;
  timestamp: string;
}

export function createQualityLog(
  sessionId: string,
  config: GenerationPipelineConfig,
  routing: UnifiedRoutingResult,
  latencyMs: number
): GenerationQualityLog {
  return {
    sessionId,
    region: config.userRegion,
    language: config.userLanguage,
    llmProvider: routing.llm.primary,
    ttsProvider: routing.tts.provider,
    qualityScore: routing.costEstimate.totalPerPipeline < 0.1 ? 85 : 90,
    latencyMs,
    regenerationCount: 0,
    timestamp: new Date().toISOString()
  };
}

// Export convenience function for Step 7 integration
export function getStep7ValidationSummary(
  region: string,
  language: string,
  tier: 'free' | 'starter' | 'pro' | 'enterprise'
): {
  routing: string;
  quality: string;
  cost: string;
  warnings: string[];
} {
  const config: GenerationPipelineConfig = {
    userRegion: region,
    userLanguage: language,
    userTier: tier,
    taskType: 'general',
    inputSource: 'prompt',
    outputType: 'presentation',
    prioritize: 'quality'
  };

  const validation = validateGenerationPipeline(config);

  return {
    routing: `${validation.routing.llm.zone.toUpperCase()} Zone: ${validation.routing.llm.primary}`,
    quality: `${validation.qualityPredictions.llm?.qualityScore || 75}% predicted quality`,
    cost: `${validation.costEstimate.total.toFixed(4)} per pipeline (${validation.costEstimate.vsBaseline} vs baseline)`,
    warnings: validation.warnings
  };
}
