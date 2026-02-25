/**
 * Cast Production Bridge — Phase 6A
 *
 * The critical glue between CREATE flow and PRODUCE pipeline.
 * Collects session data from useCreateFlow + IntelligenceBus + enrichment,
 * assembles it into a ProductionInput, and feeds it to pipelineSupervisor.
 *
 * This is the service that makes "Generate Video" actually do something.
 *
 * Flow:
 *   CREATE tab (useCreateFlow session)
 *     → castProductionBridge.buildProductionInput(session, enrichment, brand)
 *     → pipelineSupervisor.startProduction(input)
 *     → edge functions execute (TTS, video, music, quality)
 *     → job status updates flow back to UI
 *
 * B-001: Wire enrichment context into AI generation calls
 * B-002: Enrichment score UI indicators (score calculation here, UI in component)
 * B-003: Optimize token usage per enrichment tier
 * B-004: Brand Intelligence → script injection
 * B-005: Audience context → tone/style adjustment
 * B-006: Competitor analysis → differentiation prompts
 */

import { supabase } from '@/integrations/supabase/client';
import type { ProductionInput, ProductionJob, PipelineTask, OutputPresetConfig } from './pipelineSupervisor';
import { pipelineSupervisor } from './pipelineSupervisor';
import type { BrandIntelligenceProfile, BusinessTier, AudiencePersona } from '../brand-intelligence/brandIntelligenceEngine';
import { BUSINESS_TIER_CONFIG } from '../brand-intelligence/brandIntelligenceEngine';
import { getIntelligenceBus } from '../brand-intelligence/crossProductIntelligenceBus';
import type { ContentFormat, ContentIntent } from '../pipelineOrchestrator';
import { selectChain, buildOrchestrationPlan } from '../pipelineOrchestrator';
import type { ScriptGenerationMode } from '../createFlowOrchestrator';
import { SCRIPT_GEN_MODES } from '../createFlowOrchestrator';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Enrichment context collected from all sources */
export interface EnrichmentContext {
  // Brand Intelligence (B-004)
  brand: {
    name: string;
    industry: string;
    tier: BusinessTier;
    tone: string;
    formality: number;
    culturalRegister: string;
    messagingPillars: Array<{ headline: string; emotionalHook: string; rationalHook: string }>;
    valueProposition: { forCustomer: string; uniqueness: string };
    forbiddenWords: string[];
    requiredDisclosures: string[];
    visualMood: string;
    logoUrl?: string;
    brandColors: string[];
  } | null;

  // Audience Context (B-005)
  audience: {
    primaryPersona: string;
    demographics: string;
    painPoints: string[];
    goals: string[];
    preferredFormats: string[];
    attentionSpan: string;
    languagePreference: string;
    techLevel: number;
  } | null;

  // Competitor Context (B-006)
  competitor: {
    names: string[];
    differentiator: string;
    marketPosition: string;
    uniqueAdvantages: string[];
    vulnerabilities: string[];
    pricePosition: string;
  } | null;

  // Regional Context
  region: {
    code: string;
    zone: string;
    culturalElements: Record<string, unknown>;
    narrativeStyle: string;
    musicMood: string;
  };

  // Google Places (when available)
  googlePlaces: {
    businessName: string;
    address: string;
    rating: number;
    reviewCount: number;
    topReviews: string[];
    hours: string;
    categories: string[];
  } | null;
}

/** Full production request assembled from CREATE flow */
export interface CastProductionRequest {
  // From CREATE flow session
  scriptContent: string;
  scriptTitle: string;
  scriptMode: ScriptGenerationMode;
  intent: ContentIntent;
  selectedFormats: ContentFormat[];

  // Language config
  inputLanguage: string;
  outputLanguages: Array<{ code: string; name?: string; adaptationLevel: 'light' | 'moderate' | 'deep' }>;

  // Style config
  videoStyles: string[];
  scenario: string;
  sceneStyle: string;

  // Enrichment
  enrichment: EnrichmentContext;
  enrichmentScore: number;

  // Production config
  quality: 'preview' | 'standard' | 'production' | 'cinematic';
  avatarGender: string;
  includeMusic: boolean;
  includeCaptions: boolean;
  estimatedDuration?: number;

  // ============================================
  // Extended fields from persistent session (Phase 2)
  // These flow 1:1 from CREATE selections into PRODUCE.
  // ============================================

  // Content discovery (what are we creating?)
  categoryId?: string | null;
  formatId?: string | null;
  subFormatId?: string | null;
  discoveryChainId?: string | null;

  // Platform targeting
  primaryPlatform?: string;
  selectedResolution?: string;
  selectedAspectRatio?: string;

  // Visual configuration (DB-driven)
  visualStyleIds?: string[];               // cast_visual_styles UUIDs
  capabilityIds?: string[];                // cast_production_capabilities UUIDs
  characterIds?: string[];                 // cast_style_characters UUIDs
  characterFramePercent?: number;

  // Production toggles
  lipSyncEnabled?: boolean;
  dubbingEnabled?: boolean;
  selectedAssetSource?: string;
  enrichmentPrompt?: string;

  // Multi-output
  selectedOutputPresets?: string[];

  // Multi-speaker (podcast/dialogue)
  speakerConfig?: Array<{
    id: string;
    name: string;
    role: string;
    voiceProvider: string;
    voiceId: string;
  }> | null;

  // Scene-chapter mapping
  chapterGrouping?: Array<{
    id: string;
    title: string;
    sceneIds: string[];
  }> | null;
}

/** Token budget by tier (B-003) */
const TOKEN_BUDGETS: Record<BusinessTier, { script: number; enrichment: number; total: number }> = {
  nano: { script: 500, enrichment: 200, total: 800 },
  micro: { script: 1000, enrichment: 400, total: 1600 },
  small: { script: 2000, enrichment: 800, total: 3200 },
  medium: { script: 4000, enrichment: 1500, total: 6000 },
  large: { script: 8000, enrichment: 3000, total: 12000 },
  enterprise: { script: 16000, enrichment: 6000, total: 24000 },
};

// ─── Enrichment Assembly (B-001) ────────────────────────────────────────────

/**
 * Collects enrichment from all sources into a unified context.
 * This is the single function that feeds every AI generation call.
 */
export function assembleEnrichmentContext(
  brandProfile: BrandIntelligenceProfile | null,
  regionCode: string,
  googlePlacesData?: Record<string, unknown> | null,
): EnrichmentContext {
  const bus = getIntelligenceBus();

  // B-004: Brand Intelligence extraction
  let brand: EnrichmentContext['brand'] = null;
  if (brandProfile) {
    brand = {
      name: brandProfile.identity.businessName,
      industry: brandProfile.identity.industry,
      tier: brandProfile.identity.businessTier,
      tone: `${brandProfile.voice.primary}, ${brandProfile.voice.secondary}`,
      formality: brandProfile.voice.formalityLevel,
      culturalRegister: brandProfile.voice.culturalRegister,
      messagingPillars: brandProfile.marketing.messagingPillars.map(p => ({
        headline: p.headline,
        emotionalHook: p.emotionalHook,
        rationalHook: p.rationalHook,
      })),
      valueProposition: {
        forCustomer: brandProfile.marketing.valueProposition.forCustomer,
        uniqueness: brandProfile.marketing.valueProposition.uniqueness,
      },
      forbiddenWords: brandProfile.productDirectives?.spark?.forbiddenWords || [],
      requiredDisclosures: brandProfile.productDirectives?.spark?.requiredDisclosures || [],
      visualMood: brandProfile.visual.visualMood,
      logoUrl: brandProfile.visual.logoUrl,
      brandColors: [brandProfile.visual.primaryColor, brandProfile.visual.secondaryColor, brandProfile.visual.accentColor],
    };
  }

  // B-005: Audience context extraction
  let audience: EnrichmentContext['audience'] = null;
  if (brandProfile?.audience?.primaryPersonas?.length) {
    const persona = brandProfile.audience.primaryPersonas[0];
    audience = {
      primaryPersona: persona.name,
      demographics: `${persona.demographics.ageRange[0]}-${persona.demographics.ageRange[1]}, ${persona.demographics.regions.join('/')}`,
      painPoints: persona.psychographics.painPoints,
      goals: persona.psychographics.goals,
      preferredFormats: persona.contentPreferences.preferredFormats,
      attentionSpan: persona.contentPreferences.attentionSpan,
      languagePreference: persona.contentPreferences.languagePreference,
      techLevel: persona.demographics.techSavviness,
    };
  }

  // B-006: Competitor context extraction
  let competitor: EnrichmentContext['competitor'] = null;
  if (brandProfile?.marketing?.competitivePosition) {
    const cp = brandProfile.marketing.competitivePosition;
    competitor = {
      names: cp.competitorNames,
      differentiator: cp.primaryDifferentiator,
      marketPosition: cp.marketPosition,
      uniqueAdvantages: cp.uniqueAdvantages,
      vulnerabilities: cp.vulnerabilities,
      pricePosition: cp.pricePosition,
    };
  }

  // Regional context from bus
  const castContext = bus.getCastContext();
  const region: EnrichmentContext['region'] = {
    code: regionCode,
    zone: regionCode.startsWith('CJK') ? 'cjk' : regionCode.startsWith('MENA') ? 'mena' : regionCode.startsWith('SEA') ? 'sea' : 'western',
    culturalElements: castContext?.culturalElements || {},
    narrativeStyle: castContext?.narrativeStyle ? JSON.stringify(castContext.narrativeStyle) : 'direct',
    musicMood: castContext?.musicMood || 'uplifting',
  };

  // Google Places
  let googlePlaces: EnrichmentContext['googlePlaces'] = null;
  if (googlePlacesData) {
    googlePlaces = {
      businessName: (googlePlacesData.name as string) || '',
      address: (googlePlacesData.address as string) || '',
      rating: (googlePlacesData.rating as number) || 0,
      reviewCount: (googlePlacesData.reviewCount as number) || 0,
      topReviews: (googlePlacesData.reviews as string[]) || [],
      hours: (googlePlacesData.hours as string) || '',
      categories: (googlePlacesData.categories as string[]) || [],
    };
  }

  return { brand, audience, competitor, region, googlePlaces };
}

// ─── Enrichment Score (B-002) ───────────────────────────────────────────────

/**
 * Calculates a 0-100 enrichment score based on how much context is available.
 * Higher score = better AI output quality.
 */
export function calculateEnrichmentScore(enrichment: EnrichmentContext): number {
  let score = 0;
  const maxScore = 100;

  // Brand context (0-35 points)
  if (enrichment.brand) {
    score += 10; // Has brand at all
    if (enrichment.brand.messagingPillars.length > 0) score += 8;
    if (enrichment.brand.valueProposition.forCustomer) score += 7;
    if (enrichment.brand.tone) score += 5;
    if (enrichment.brand.visualMood) score += 5;
  }

  // Audience context (0-25 points)
  if (enrichment.audience) {
    score += 8; // Has audience at all
    if (enrichment.audience.painPoints.length > 0) score += 7;
    if (enrichment.audience.goals.length > 0) score += 5;
    if (enrichment.audience.languagePreference) score += 5;
  }

  // Competitor context (0-15 points)
  if (enrichment.competitor) {
    score += 5;
    if (enrichment.competitor.names.length > 0) score += 5;
    if (enrichment.competitor.differentiator) score += 5;
  }

  // Regional context (0-10 points)
  if (enrichment.region.code !== 'NAM_US') score += 5; // Non-default region
  if (enrichment.region.culturalElements && Object.keys(enrichment.region.culturalElements).length > 0) score += 5;

  // Google Places (0-15 points)
  if (enrichment.googlePlaces) {
    score += 5;
    if (enrichment.googlePlaces.topReviews.length > 0) score += 5;
    if (enrichment.googlePlaces.rating > 0) score += 5;
  }

  return Math.min(score, maxScore);
}

// ─── Token Optimization (B-003) ─────────────────────────────────────────────

/**
 * Builds an optimized prompt that fits within the tier's token budget.
 * Prioritizes: script content > brand context > audience > competitor > regional.
 */
export function buildEnrichedPrompt(
  scriptContent: string,
  enrichment: EnrichmentContext,
  tier: BusinessTier = 'small',
): string {
  const budget = TOKEN_BUDGETS[tier];
  const parts: string[] = [];

  // 1. Script content always included (highest priority)
  const trimmedScript = scriptContent.slice(0, budget.script * 4); // ~4 chars per token
  parts.push(trimmedScript);

  // 2. Brand context (B-004)
  if (enrichment.brand) {
    const brandBlock = [
      `[Brand: ${enrichment.brand.name}]`,
      `[Industry: ${enrichment.brand.industry}]`,
      `[Tone: ${enrichment.brand.tone}, Formality: ${enrichment.brand.formality}/5]`,
      enrichment.brand.valueProposition.forCustomer ? `[Value: ${enrichment.brand.valueProposition.forCustomer}]` : '',
      enrichment.brand.messagingPillars.length > 0
        ? `[Key Message: ${enrichment.brand.messagingPillars[0].headline}]`
        : '',
      enrichment.brand.forbiddenWords.length > 0
        ? `[Avoid: ${enrichment.brand.forbiddenWords.slice(0, 5).join(', ')}]`
        : '',
    ].filter(Boolean).join(' ');
    parts.push(brandBlock);
  }

  // 3. Audience context (B-005)
  if (enrichment.audience) {
    const audienceBlock = [
      `[Audience: ${enrichment.audience.primaryPersona}]`,
      enrichment.audience.painPoints.length > 0
        ? `[Pain Points: ${enrichment.audience.painPoints.slice(0, 3).join('; ')}]`
        : '',
      enrichment.audience.goals.length > 0
        ? `[Goals: ${enrichment.audience.goals.slice(0, 3).join('; ')}]`
        : '',
      `[Attention: ${enrichment.audience.attentionSpan}]`,
    ].filter(Boolean).join(' ');
    parts.push(audienceBlock);
  }

  // 4. Competitor context (B-006) — only for medium+ tiers
  if (enrichment.competitor && ['medium', 'large', 'enterprise'].includes(tier)) {
    const competitorBlock = [
      `[Differentiator: ${enrichment.competitor.differentiator}]`,
      enrichment.competitor.uniqueAdvantages.length > 0
        ? `[Advantages: ${enrichment.competitor.uniqueAdvantages.slice(0, 3).join('; ')}]`
        : '',
      `[Position: ${enrichment.competitor.marketPosition}]`,
    ].filter(Boolean).join(' ');
    parts.push(competitorBlock);
  }

  // 5. Regional context
  if (enrichment.region.code !== 'NAM_US') {
    parts.push(`[Region: ${enrichment.region.code}] [Style: ${enrichment.region.narrativeStyle}]`);
  }

  // 6. Google Places data
  if (enrichment.googlePlaces) {
    const placesBlock = [
      `[Business: ${enrichment.googlePlaces.businessName}]`,
      enrichment.googlePlaces.rating > 0 ? `[Rating: ${enrichment.googlePlaces.rating}/5 (${enrichment.googlePlaces.reviewCount} reviews)]` : '',
      enrichment.googlePlaces.topReviews.length > 0
        ? `[Customer says: "${enrichment.googlePlaces.topReviews[0].slice(0, 100)}"]`
        : '',
    ].filter(Boolean).join(' ');
    parts.push(placesBlock);
  }

  // 7. Disclosures (always last, non-negotiable)
  if (enrichment.brand?.requiredDisclosures?.length) {
    parts.push(`[Required Disclosures: ${enrichment.brand.requiredDisclosures.join('; ')}]`);
  }

  // Trim to total token budget
  const combined = parts.join('\n\n');
  return combined.slice(0, budget.total * 4);
}

// ─── Scene Script Generation ────────────────────────────────────────────────

/**
 * Generates scene-by-scene scripts using ai-universal-processor.
 * Each scene gets enrichment-aware prompts.
 */
export async function generateSceneScripts(
  request: CastProductionRequest,
  sceneCount: number = 6,
): Promise<Array<{ sceneId: string; scriptText: string; visualDirection: string; duration: number }>> {
  const enrichedPrompt = buildEnrichedPrompt(
    request.scriptContent,
    request.enrichment,
    request.enrichment.brand?.tier || 'small',
  );

  const sceneTypes = getSceneTypesForIntent(request.intent, sceneCount);

  const results: Array<{ sceneId: string; scriptText: string; visualDirection: string; duration: number }> = [];

  for (let i = 0; i < sceneCount; i++) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'generate_scene_scripts',
          sceneIndex: i,
          totalScenes: sceneCount,
          sceneType: sceneTypes[i] || 'feature_demo',
          messaging: {
            hook: request.enrichment.brand?.messagingPillars[0]?.headline || request.scriptTitle,
            benefits: request.enrichment.audience?.goals || [],
            cta: request.enrichment.brand?.valueProposition.forCustomer || 'Learn more',
          },
          capabilities: request.videoStyles,
          region: request.enrichment.region.code,
          language: request.inputLanguage,
          enrichedContext: enrichedPrompt,
          intent: request.intent,
          format: request.selectedFormats[0] || 'short_video',
        },
      });

      if (error) throw error;

      results.push({
        sceneId: `scene-${i + 1}`,
        scriptText: data?.scriptText || `Scene ${i + 1}: ${sceneTypes[i] || 'content'}`,
        visualDirection: data?.visualDirection || 'Medium shot, well-lit',
        duration: data?.suggestedDuration || 8,
      });
    } catch (err) {
      // Fallback: generate placeholder scene
      results.push({
        sceneId: `scene-${i + 1}`,
        scriptText: `Scene ${i + 1}: ${sceneTypes[i] || 'content'} — ${request.scriptTitle}`,
        visualDirection: 'Medium shot, professional lighting',
        duration: 8,
      });
    }
  }

  return results;
}

/** Map intent to scene structure */
function getSceneTypesForIntent(intent: ContentIntent, count: number): string[] {
  const templates: Record<string, string[]> = {
    marketing: ['hook', 'problem_statement', 'solution_reveal', 'feature_demo', 'social_proof', 'cta'],
    education: ['hook', 'concept_intro', 'explanation', 'example', 'practice', 'summary'],
    entertainment: ['hook', 'setup', 'development', 'climax', 'resolution', 'outro'],
    news: ['headline', 'context', 'details', 'expert_quote', 'impact', 'next_steps'],
    corporate: ['brand_intro', 'mission', 'capabilities', 'case_study', 'team', 'contact'],
    social: ['hook', 'value_bomb', 'proof', 'cta'],
    podcast: ['intro', 'topic_setup', 'deep_dive', 'guest_insight', 'takeaway', 'outro'],
  };

  const sceneList = templates[intent] || templates.marketing!;
  // Repeat or truncate to match desired count
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(sceneList[i % sceneList.length]);
  }
  return result;
}

// ─── Production Bridge (Main API) ───────────────────────────────────────────

/**
 * Builds a full ProductionInput from CREATE flow session data.
 * This is the main bridge between CREATE and PRODUCE.
 */
export function buildProductionInput(
  request: CastProductionRequest,
  resolvedPresets?: OutputPresetConfig[],
): ProductionInput {
  const enrichedScript = buildEnrichedPrompt(
    request.scriptContent,
    request.enrichment,
    request.enrichment.brand?.tier || 'small',
  );

  // Determine voice provider from region
  const zone = request.enrichment.region.zone;
  const voiceProvider: ProductionInput['voiceProvider'] =
    zone === 'cjk' ? 'alibaba' :
    zone === 'mena' ? 'azure' :
    zone === 'sea' ? 'google' :
    'elevenlabs';

  return {
    scriptContent: enrichedScript,
    voiceProvider,
    language: request.inputLanguage,
    includeMusic: request.includeMusic,
    musicMood: request.enrichment.region.musicMood || 'uplifting',
    includeVideo: true,
    videoStyle: request.videoStyles[0] || 'professional',
    videoDuration: request.estimatedDuration || 60,
    qualityThreshold: request.quality === 'cinematic' ? 90 : request.quality === 'production' ? 75 : 60,
    // Wire output presets into pipeline
    outputPresets: resolvedPresets,
    capabilityIds: request.capabilityIds,
  };
}

/**
 * Resolves output preset IDs from the session into full OutputPresetConfig objects.
 * Fetches preset details from Supabase cast_output_presets table.
 */
export async function resolveOutputPresets(presetIds: string[]): Promise<OutputPresetConfig[]> {
  if (!presetIds || presetIds.length === 0) return [];

  const { data, error } = await supabase
    .from('cast_output_presets')
    .select('*')
    .in('id', presetIds)
    .eq('is_active', true);

  if (error || !data) return [];

  return data.map((p: any) => ({
    presetId: p.id,
    name: p.name,
    width: p.width,
    height: p.height,
    codec: p.codec || 'h264',
    fps: p.fps || 30,
    bitrate: p.bitrate || '8M',
    audioCodec: p.audio_codec || 'aac',
    audioBitrate: p.audio_bitrate || '192k',
    maxFileSizeMb: p.max_file_size_mb || 500,
    encodingProfile: p.encoding_profile || 'high',
    aspectRatio: p.aspect_ratio || '16:9',
  }));
}

/**
 * The main entry point: Takes a CastProductionRequest, starts production,
 * returns a job with real-time status updates.
 */
export async function startCastProduction(
  request: CastProductionRequest,
  callbacks?: {
    onTaskUpdate?: (task: PipelineTask) => void;
    onProgress?: (progress: number) => void;
  },
): Promise<ProductionJob> {
  // Resolve output presets from DB before building pipeline input
  const resolvedPresets = await resolveOutputPresets(request.selectedOutputPresets || []);
  const input = buildProductionInput(request, resolvedPresets);

  // Attach callbacks
  if (callbacks?.onTaskUpdate) input.onTaskUpdate = callbacks.onTaskUpdate;
  if (callbacks?.onProgress) input.onProgress = callbacks.onProgress;

  // Start production via supervisor
  return pipelineSupervisor.startProduction(input);
}

/**
 * Convenience: Build request from CREATE flow hook data.
 * This is what GenieCastHub calls when user clicks "Generate".
 */
export function buildRequestFromSession(
  sessionData: {
    scriptContent: string;
    scriptTitle: string;
    inputMode: ScriptGenerationMode;
    intent: ContentIntent;
    selectedFormats: ContentFormat[];
    inputLanguage: string;
    outputLanguages: Array<{ code: string; adaptationLevel: 'light' | 'moderate' | 'deep' }>;
    videoStyles: string[];
    scenario: string;
    sceneStyle: string;
    enrichmentScore: number;
  },
  enrichment: EnrichmentContext,
  productionConfig: {
    quality: 'standard' | 'production' | 'cinematic';
    avatarGender: string;
    includeMusic: boolean;
    includeCaptions: boolean;
  },
): CastProductionRequest {
  return {
    scriptContent: sessionData.scriptContent,
    scriptTitle: sessionData.scriptTitle,
    scriptMode: sessionData.inputMode,
    intent: sessionData.intent,
    selectedFormats: sessionData.selectedFormats,
    inputLanguage: sessionData.inputLanguage,
    outputLanguages: sessionData.outputLanguages,
    videoStyles: sessionData.videoStyles,
    scenario: sessionData.scenario,
    sceneStyle: sessionData.sceneStyle,
    enrichment,
    enrichmentScore: sessionData.enrichmentScore,
    quality: productionConfig.quality,
    avatarGender: productionConfig.avatarGender,
    includeMusic: productionConfig.includeMusic,
    includeCaptions: productionConfig.includeCaptions,
    estimatedDuration: 60,
  };
}

// ─── Session-Aware Bridge (Phase 2) ──────────────────────────────────────────

/**
 * Builds a CastProductionRequest directly from the persistent GenieCastSessionState.
 * This replaces the old approach of reading from raw localStorage.
 *
 * Usage: GenieCastHub.handleGenerate() calls this with the typed session object.
 */
export function buildRequestFromCastSession(
  session: {
    selectedProductId: string | null;
    selectedIntent: string | null;
    selectedRegion: string;
    selectedCategoryId: string | null;
    selectedFormatId: string | null;
    selectedSubFormatId: string | null;
    discoveryChainId: string | null;
    primaryPlatform: string;
    outputLanguages: string[];
    dubbingSubtitleLanguages: string[];
    selectedVisualStyleIds: string[];
    selectedCapabilityIds: string[];
    selectedCharacterIds: string[];
    characterFramePercent: number;
    avatarGender: string;
    targetDuration: number;
    selectedAssetSource: string;
    lipSyncEnabled: boolean;
    dubbingEnabled: boolean;
    selectedResolution: string;
    selectedAspectRatio: string;
    productionQuality: string;
    enrichmentPrompt: string;
    selectedOutputPresets: string[];
    speakerConfig: Array<{ id: string; name: string; role: string; voiceProvider: string; voiceId: string }> | null;
    chapterGrouping: Array<{ id: string; title: string; sceneIds: string[] }> | null;
    approvedMessaging: { hook?: string; cta?: string; valueProposition?: string } | null;
    selectedTemplate: { id: string; name: string; sceneCount: number; estimatedDuration: number; styleIntent: string } | null;
    templateMapping: { scenes: Array<{ scriptText: string }> } | null;
  },
  enrichment: EnrichmentContext,
): CastProductionRequest {
  // Derive script content from template mapping scenes or enrichment prompt
  const scriptContent = session.templateMapping?.scenes
    ?.map(s => s.scriptText)
    .filter(Boolean)
    .join('\n\n')
    || session.enrichmentPrompt
    || session.approvedMessaging?.hook
    || '';

  const scriptTitle = session.selectedTemplate?.name || 'Untitled Production';

  return {
    scriptContent,
    scriptTitle,
    scriptMode: 'text_to_script',
    intent: (session.selectedIntent as ContentIntent) || 'marketing',
    selectedFormats: session.selectedFormatId ? [session.selectedFormatId as ContentFormat] : ['short_video' as ContentFormat],

    inputLanguage: session.outputLanguages[0] || 'en',
    outputLanguages: session.outputLanguages.map(lang => ({
      code: lang,
      adaptationLevel: 'moderate' as const,
    })),

    videoStyles: session.selectedVisualStyleIds.length > 0
      ? session.selectedVisualStyleIds
      : ['professional'],
    scenario: session.enrichmentPrompt || 'product showcase',
    sceneStyle: session.selectedVisualStyleIds[0] || 'cinematic',

    enrichment,
    enrichmentScore: calculateEnrichmentScore(enrichment),

    quality: (session.productionQuality as CastProductionRequest['quality']) || 'production',
    avatarGender: session.avatarGender || 'female',
    includeMusic: true,
    includeCaptions: true,
    estimatedDuration: session.targetDuration || 60,

    // Extended fields — flow 1:1 from CREATE
    categoryId: session.selectedCategoryId,
    formatId: session.selectedFormatId,
    subFormatId: session.selectedSubFormatId,
    discoveryChainId: session.discoveryChainId,
    primaryPlatform: session.primaryPlatform,
    selectedResolution: session.selectedResolution,
    selectedAspectRatio: session.selectedAspectRatio,
    visualStyleIds: session.selectedVisualStyleIds,
    capabilityIds: session.selectedCapabilityIds,
    characterIds: session.selectedCharacterIds,
    characterFramePercent: session.characterFramePercent,
    lipSyncEnabled: session.lipSyncEnabled,
    dubbingEnabled: session.dubbingEnabled,
    selectedAssetSource: session.selectedAssetSource,
    enrichmentPrompt: session.enrichmentPrompt,
    selectedOutputPresets: session.selectedOutputPresets,
    speakerConfig: session.speakerConfig,
    chapterGrouping: session.chapterGrouping,
  };
}

// Re-export for convenience
export { pipelineSupervisor } from './pipelineSupervisor';
export type { ProductionJob, PipelineTask, ProductionInput, OutputPresetConfig } from './pipelineSupervisor';
