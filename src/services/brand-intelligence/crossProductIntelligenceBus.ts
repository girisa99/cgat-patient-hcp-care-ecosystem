/**
 * Cross-Product Intelligence Bus
 *
 * The central nervous system of GenieSuite — connects brand intelligence,
 * regional context, creative styles, and production pipeline across all 6 products.
 *
 * When a user sets up their brand profile ONCE, every product automatically knows:
 * - What tone to use (Spark)
 * - What strategy frameworks apply (Mind)
 * - What slide style to use (Deck)
 * - What video style, characters, music to use (Cast)
 * - What animation style to use (Vibe)
 * - What approval workflow to follow (Arc)
 *
 * This bus also feeds the production pipeline — ensuring every generated asset
 * is brand-aware, region-aware, and culturally appropriate.
 */

import type {
  BrandIntelligenceProfile,
  BusinessTier,
  MarketingFramework,
  STORMFramework,
} from './brandIntelligenceEngine';
import { BUSINESS_TIER_CONFIG, createDefaultProfile, inferBusinessTier } from './brandIntelligenceEngine';
import type { InformalBusinessArchetype } from './informalEconomyProfiles';
import { findArchetypesByRegion, findArchetypesByType } from './informalEconomyProfiles';
import type {
  ProductionPlan,
  ProductionMode,
  ProductionUseCase,
  PipelineInput,
  OutputSpec,
  QualityTier,
} from './creativeProductionPipeline';
import { buildPipelineForUseCase, getUseCaseTemplate, getTemplatesForTier } from './creativeProductionPipeline';
import type { CreativeStyleFamily, CreativeStyleProfile } from './castCreativeStylesRegistry';
import {
  enrichPromptWithRegion,
  getRegionalMusicPrompt,
  getRegionalNarrativeStyle,
  getRegionalCompanionCreature,
  CREATIVE_STYLES,
} from './castCreativeStylesRegistry';

// ─── Bus Message Types ───────────────────────────────────────────────────────
// Messages that flow through the bus between products.

export type BusMessageType =
  | 'brand_context'          // Full brand profile for product configuration
  | 'regional_context'       // Regional/cultural adaptation settings
  | 'content_request'        // Request to generate content
  | 'content_ready'          // Content generated, available for next product
  | 'approval_request'       // Content needs approval before proceeding
  | 'approval_response'      // Approval granted/denied
  | 'style_directive'        // Visual/audio style instructions
  | 'pipeline_status'        // Generation progress update
  | 'error'                  // Error in pipeline
  | 'handoff';               // Content being passed from one product to another

export type GenieSuiteProduct = 'spark' | 'mind' | 'deck' | 'cast' | 'vibe' | 'arc';

export interface BusMessage {
  id: string;
  type: BusMessageType;
  source: GenieSuiteProduct | 'bus' | 'user';
  target: GenieSuiteProduct | 'all' | 'pipeline';
  payload: Record<string, unknown>;
  brandProfileId?: string;
  regionCode?: string;
  timestamp: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

// ─── Product Context ─────────────────────────────────────────────────────────
// What each product receives from the bus.

export interface SparkContext {
  brandName: string;
  tone: string;
  readingLevel: string;
  forbiddenWords: string[];
  requiredDisclosures: string[];
  templatePreferences: string[];
  contentTypes: string[];
  primaryLanguage: string;
  outputLanguages: string[];
  regionCode: string;
  culturalRegister: string;
  seasonalEvents: string[];
  messagingPillars: BrandIntelligenceProfile['marketing']['messagingPillars'];
  valueProposition: BrandIntelligenceProfile['marketing']['valueProposition'];
  targetAudience: string;
  callToAction: BrandIntelligenceProfile['contentStrategy']['callToAction'];
}

export interface MindContext {
  brandName: string;
  businessTier: BusinessTier;
  activeFrameworks: MarketingFramework[];
  strategyDepth: string;
  focusAreas: string[];
  budgetConstraint: string;
  timeHorizon: string;
  competitivePosition: BrandIntelligenceProfile['marketing']['competitivePosition'];
  targetMarkets: string[];
  regionCode: string;
  industryContext: string;
  audienceSize: string;
}

export interface DeckContext {
  brandName: string;
  brandColors: string[];
  fontFamily: string;
  logoUrl?: string;
  slideStyle: string;
  maxSlides: number;
  includeDataViz: boolean;
  audienceType: string;
  regionCode: string;
  presentationLanguage: string;
  messagingPillars: BrandIntelligenceProfile['marketing']['messagingPillars'];
}

export interface CastContext {
  brandName: string;
  brandColors: string[];
  logoUrl?: string;
  logoVariants?: Record<string, string>;
  videoStyle: string;
  creativeStyleFamily: CreativeStyleFamily;
  maxDuration: number;
  avatarPreference: string;
  musicMood: string;
  subtitlesRequired: boolean;
  outputLanguages: string[];
  regionCode: string;
  culturalElements: Record<string, unknown>;
  companionCreature?: Record<string, unknown>;
  narrativeStyle: Record<string, unknown>;
  musicConfig: Record<string, unknown>;
  humorType: string;
  lipSyncLanguages: string[];
  characterWardrobe: Record<string, string>;
}

export interface VibeContext {
  brandName: string;
  brandColors: string[];
  animationStyle: string;
  motionIntensity: number;
  colorPalette: string[];
  regionalStyle?: string;
  regionCode: string;
  lightingStyle: string;
  particleEffects: boolean;
}

export interface ArcContext {
  brandName: string;
  workflowComplexity: string;
  automationLevel: string;
  approvalChain: string[];
  publishTargets: string[];
  regionCode: string;
  complianceRequirements: string[];
}

// ─── Intelligence Bus Core ───────────────────────────────────────────────────

export class IntelligenceBus {
  private brandProfile: BrandIntelligenceProfile | null = null;
  private regionCode: string = 'NAM_US';
  private messageLog: BusMessage[] = [];
  private listeners: Map<string, ((msg: BusMessage) => void)[]> = new Map();

  // ─── Profile Management ─────────────────────────

  setBrandProfile(profile: BrandIntelligenceProfile): void {
    this.brandProfile = profile;
    this.broadcast({
      id: `bus-${Date.now()}`,
      type: 'brand_context',
      source: 'bus',
      target: 'all',
      payload: { profile },
      brandProfileId: profile.id,
      regionCode: this.regionCode,
      timestamp: new Date().toISOString(),
      priority: 'high',
    });
  }

  setRegion(regionCode: string): void {
    this.regionCode = regionCode;
    this.broadcast({
      id: `bus-${Date.now()}`,
      type: 'regional_context',
      source: 'bus',
      target: 'all',
      payload: { regionCode },
      brandProfileId: this.brandProfile?.id,
      regionCode,
      timestamp: new Date().toISOString(),
      priority: 'high',
    });
  }

  getBrandProfile(): BrandIntelligenceProfile | null {
    return this.brandProfile;
  }

  getRegionCode(): string {
    return this.regionCode;
  }

  // ─── Product Context Extraction ─────────────────
  // Each product gets exactly the context it needs — no more, no less.

  getSparkContext(): SparkContext | null {
    if (!this.brandProfile) return null;
    const p = this.brandProfile;
    return {
      brandName: p.identity.businessName,
      tone: `${p.voice.primary}, ${p.voice.secondary}`,
      readingLevel: p.voice.readingLevel,
      forbiddenWords: p.productDirectives.spark.forbiddenWords,
      requiredDisclosures: p.productDirectives.spark.requiredDisclosures,
      templatePreferences: p.productDirectives.spark.templatePreferences,
      contentTypes: p.contentStrategy.contentTypes,
      primaryLanguage: p.identity.originLanguage,
      outputLanguages: p.identity.operatingLanguages,
      regionCode: this.regionCode,
      culturalRegister: p.voice.culturalRegister,
      seasonalEvents: p.contentStrategy.seasonalEvents,
      messagingPillars: p.marketing.messagingPillars,
      valueProposition: p.marketing.valueProposition,
      targetAudience: p.audience.totalAddressableMarket,
      callToAction: p.contentStrategy.callToAction,
    };
  }

  getMindContext(): MindContext | null {
    if (!this.brandProfile) return null;
    const p = this.brandProfile;
    return {
      brandName: p.identity.businessName,
      businessTier: p.identity.businessTier,
      activeFrameworks: p.marketing.activeFrameworks,
      strategyDepth: p.productDirectives.mind.strategyDepth,
      focusAreas: p.productDirectives.mind.focusAreas,
      budgetConstraint: p.productDirectives.mind.budgetConstraint,
      timeHorizon: p.productDirectives.mind.timeHorizon,
      competitivePosition: p.marketing.competitivePosition,
      targetMarkets: p.identity.primaryMarkets,
      regionCode: this.regionCode,
      industryContext: `${p.identity.industry} / ${p.identity.subIndustry || 'general'}`,
      audienceSize: p.audience.totalAddressableMarket,
    };
  }

  getDeckContext(): DeckContext | null {
    if (!this.brandProfile) return null;
    const p = this.brandProfile;
    return {
      brandName: p.identity.businessName,
      brandColors: [p.visual.primaryColor, p.visual.secondaryColor, p.visual.accentColor],
      fontFamily: p.visual.fontFamily,
      logoUrl: p.visual.logoUrl,
      slideStyle: p.productDirectives.deck.slideStyle,
      maxSlides: p.productDirectives.deck.maxSlides,
      includeDataViz: p.productDirectives.deck.includeDataViz,
      audienceType: p.productDirectives.deck.audienceType,
      regionCode: this.regionCode,
      presentationLanguage: p.identity.originLanguage,
      messagingPillars: p.marketing.messagingPillars,
    };
  }

  getCastContext(): CastContext | null {
    if (!this.brandProfile) return null;
    const p = this.brandProfile;

    // Get regional enrichments
    const narrativeStyle = getRegionalNarrativeStyle(this.regionCode) || {
      approach: 'direct', humorStyle: 'situational', formalityLevel: 3, emotionalTone: 'professional',
    };
    const musicConfig = getRegionalMusicPrompt(this.regionCode);
    const companion = getRegionalCompanionCreature(this.regionCode);

    // Find regional variant for wardrobe
    const regionalVariant = CREATIVE_STYLES
      .flatMap(s => Object.values(s.regionalVariants))
      .find(v => v.regionCode === this.regionCode);

    return {
      brandName: p.identity.businessName,
      brandColors: [p.visual.primaryColor, p.visual.secondaryColor, p.visual.accentColor],
      logoUrl: p.visual.logoUrl,
      logoVariants: p.visual.logoVariants,
      videoStyle: p.productDirectives.cast.videoStyle,
      creativeStyleFamily: 'pixar_3d', // Default, user can override
      maxDuration: p.productDirectives.cast.maxDuration,
      avatarPreference: p.productDirectives.cast.avatarPreference,
      musicMood: p.productDirectives.cast.musicMood,
      subtitlesRequired: p.productDirectives.cast.subtitlesRequired,
      outputLanguages: p.productDirectives.cast.outputLanguages,
      regionCode: this.regionCode,
      culturalElements: regionalVariant?.culturalElements || {},
      companionCreature: companion || undefined,
      narrativeStyle,
      musicConfig,
      humorType: narrativeStyle.humorStyle,
      lipSyncLanguages: p.productDirectives.cast.outputLanguages,
      characterWardrobe: regionalVariant?.wardrobe || { traditional: '', modern: '', business: '' },
    };
  }

  getVibeContext(): VibeContext | null {
    if (!this.brandProfile) return null;
    const p = this.brandProfile;

    const regionalVariant = CREATIVE_STYLES
      .flatMap(s => Object.values(s.regionalVariants))
      .find(v => v.regionCode === this.regionCode);

    return {
      brandName: p.identity.businessName,
      brandColors: [p.visual.primaryColor, p.visual.secondaryColor, p.visual.accentColor],
      animationStyle: p.productDirectives.vibe.animationStyle,
      motionIntensity: p.productDirectives.vibe.motionIntensity,
      colorPalette: regionalVariant?.colorOverrides || p.productDirectives.vibe.colorPalette,
      regionalStyle: p.productDirectives.vibe.regionalStyle,
      regionCode: this.regionCode,
      lightingStyle: regionalVariant?.lightingOverride || 'neutral_studio',
      particleEffects: true,
    };
  }

  getArcContext(): ArcContext | null {
    if (!this.brandProfile) return null;
    const p = this.brandProfile;
    return {
      brandName: p.identity.businessName,
      workflowComplexity: p.productDirectives.arc.workflowComplexity,
      automationLevel: p.productDirectives.arc.automationLevel,
      approvalChain: p.productDirectives.arc.approvalChain,
      publishTargets: p.productDirectives.arc.publishTargets,
      regionCode: this.regionCode,
      complianceRequirements: [], // Populated from regional compliance registry
    };
  }

  // ─── Production Plan Builder ────────────────────
  // Build a complete production plan from brand context + user input.

  buildProductionPlan(params: {
    title: string;
    useCase: ProductionUseCase;
    inputs: PipelineInput[];
    style?: CreativeStyleFamily;
    quality?: QualityTier;
    mode?: ProductionMode;
    language?: string;
    targetAudience?: string;
  }): ProductionPlan {
    const profile = this.brandProfile;
    const tier = profile?.identity.businessTier || 'small';
    const tierConfig = BUSINESS_TIER_CONFIG[tier];

    // Determine production mode based on tier
    const mode = params.mode ||
      (tier === 'nano' ? 'instant' :
       tier === 'micro' ? 'guided' :
       tier === 'small' ? 'guided' :
       tier === 'medium' ? 'plan_first' :
       'scene_by_scene');

    // Determine quality based on tier
    const quality = params.quality ||
      (tier === 'nano' || tier === 'micro' ? 'standard' :
       tier === 'enterprise' ? 'cinematic' : 'production');

    // Get use case template
    const template = getUseCaseTemplate(params.useCase);
    const language = params.language || profile?.identity.originLanguage || 'en';

    // Build pipeline routes
    const pipeline = buildPipelineForUseCase(params.useCase, quality, this.regionCode, params.inputs);

    // Build scenes from template
    const scenes = (template?.sceneTemplates || []).map((st, idx) => ({
      id: `scene-${idx + 1}`,
      order: idx + 1,
      title: st.title,
      description: st.description,
      duration: { min: st.suggestedDuration * 0.7, target: st.suggestedDuration, max: st.suggestedDuration * 1.5 },
      transitionIn: idx === 0 ? 'fade_black' as const : st.suggestedTransition,
      transitionOut: 'none' as const,
      inputs: [],
      visual: {
        primarySource: st.suggestedVisual,
        style: params.style || 'pixar_3d',
      },
      audio: {
        narration: {
          text: '',
          voice: '',
          language,
          speed: 1.0,
          emotion: 'neutral',
        },
      },
      textOverlays: [],
      userApproval: mode === 'instant' ? 'auto' as const : 'review_required' as const,
      status: 'planned' as const,
      generatedAssets: [],
    }));

    // Estimate costs
    const sceneCount = scenes.length;
    const estimatedTokens = pipeline.reduce((sum, r) => sum + r.estimatedTokens, 0) * sceneCount;
    const estimatedCost = pipeline.reduce((sum, r) => sum + r.estimatedCostUsd, 0) * sceneCount;
    const estimatedGenTime = pipeline.reduce((sum, r) => sum + r.estimatedTimeSeconds, 0) * sceneCount;

    // Get music config from region
    const musicConfig = getRegionalMusicPrompt(this.regionCode);

    return {
      id: `plan-${Date.now()}`,
      title: params.title,
      description: template?.description || params.title,
      brandProfileId: profile?.id,
      regionCode: this.regionCode,
      language,
      targetAudience: params.targetAudience || profile?.audience.totalAddressableMarket || '',
      mode,
      creativeStyle: params.style || 'pixar_3d',
      useCase: params.useCase,
      scenes,
      globalAudio: {
        backgroundMusic: {
          prompt: musicConfig.prompt,
          genre: musicConfig.genre,
          bpm: musicConfig.bpm,
          volume: 0.3,
          fadeIn: 2,
          fadeOut: 3,
        },
        masterVolume: 0.8,
      },
      globalVisual: {
        colorPalette: profile ? [profile.visual.primaryColor, profile.visual.secondaryColor, profile.visual.accentColor] : ['#6366F1', '#EC4899', '#10B981'],
        fontFamily: profile?.visual.fontFamily || 'Inter',
        watermark: profile?.visual.logoUrl,
      },
      inputs: params.inputs,
      outputs: [{
        format: 'video_mp4',
        aspectRatio: '16:9',
        resolution: { width: 1920, height: 1080 },
        quality,
        fps: 30,
        deliverables: [],
      }],
      pipeline,
      status: 'draft',
      totalEstimatedTokens: estimatedTokens,
      totalEstimatedCostUsd: Math.round(estimatedCost * 100) / 100,
      totalEstimatedDuration: scenes.reduce((sum, s) => sum + s.duration.target, 0),
      totalEstimatedGenerationTime: Math.ceil(estimatedGenTime / 60),
    };
  }

  // ─── Quick Prompt → Full Production ─────────────
  // For nano/micro businesses: one sentence → full video plan.

  quickPromptToPlan(prompt: string, language: string = 'en'): ProductionPlan {
    const tier = this.brandProfile?.identity.businessTier || inferBusinessTier(prompt);
    const useCase: ProductionUseCase = tier === 'nano' || tier === 'micro' ? 'nano_business_promo' : 'product_marketing';

    const input: PipelineInput = {
      id: `input-${Date.now()}`,
      type: 'text',
      source: prompt,
      metadata: { language },
      processingHints: {},
      userPreference: 'auto',
    };

    return this.buildProductionPlan({
      title: prompt.slice(0, 60),
      useCase,
      inputs: [input],
      language,
      mode: tier === 'nano' ? 'instant' : 'guided',
      quality: tier === 'nano' || tier === 'micro' ? 'standard' : 'production',
    });
  }

  // ─── Enrich Prompt with Full Context ────────────
  // Takes a simple prompt and enriches it with brand + region + style context.

  enrichPrompt(basePrompt: string, style?: CreativeStyleFamily): string {
    let enriched = basePrompt;

    // Add brand context
    if (this.brandProfile) {
      const brand = this.brandProfile;
      enriched = `[Brand: ${brand.identity.businessName}] [Industry: ${brand.identity.industry}] [Tone: ${brand.voice.primary}] ${enriched}`;
    }

    // Add regional context
    enriched = enrichPromptWithRegion(enriched, this.regionCode);

    // Add style context
    if (style) {
      const styleProfile = CREATIVE_STYLES.find(s => s.family === style);
      if (styleProfile) {
        enriched = `${styleProfile.promptConfig.stylePrefix}. ${enriched}. ${styleProfile.promptConfig.qualityModifiers}`;
      }
    }

    return enriched;
  }

  // ─── Get Available Options for Tier ─────────────

  getAvailableUseCases(): ProductionUseCase[] {
    const tier = this.brandProfile?.identity.businessTier || 'small';
    return getTemplatesForTier(tier).map(t => t.useCase);
  }

  getAvailableStyles(): CreativeStyleFamily[] {
    return CREATIVE_STYLES.map(s => s.family);
  }

  getRegionalArchetypes(): InformalBusinessArchetype[] {
    return findArchetypesByRegion(this.regionCode);
  }

  // ─── Event System ───────────────────────────────

  on(event: BusMessageType, callback: (msg: BusMessage) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: BusMessageType, callback: (msg: BusMessage) => void): void {
    const list = this.listeners.get(event);
    if (list) {
      this.listeners.set(event, list.filter(cb => cb !== callback));
    }
  }

  private broadcast(message: BusMessage): void {
    this.messageLog.push(message);
    const listeners = this.listeners.get(message.type) || [];
    for (const cb of listeners) {
      cb(message);
    }
  }

  getMessageLog(): BusMessage[] {
    return [...this.messageLog];
  }
}

// ─── Singleton Instance ──────────────────────────────────────────────────────

let busInstance: IntelligenceBus | null = null;

export function getIntelligenceBus(): IntelligenceBus {
  if (!busInstance) {
    busInstance = new IntelligenceBus();
  }
  return busInstance;
}

export function resetIntelligenceBus(): void {
  busInstance = null;
}
