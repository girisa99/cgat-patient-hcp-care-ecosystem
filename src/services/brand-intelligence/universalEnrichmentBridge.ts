/**
 * Universal Enrichment Bridge
 *
 * The integration layer that connects ALL intelligence services into a unified
 * enrichment pipeline. Before this bridge, each service was a silo:
 *
 *   Brand Intelligence → knew brand profiles, business tiers, frameworks
 *   Competitive Intelligence → knew competitors, USPs, market segments
 *   Scene Enricher → knew product/audience/regional context for video scenes
 *   AI Routing → knew which model to pick for a query
 *   Creative Styles Registry → knew regional visual/audio preferences
 *   Meeting Intelligence → knew meeting transcripts and action items
 *
 * This bridge wires them together:
 *
 *   User prompt
 *     ↓
 *   [1] Brand context (from IntelligenceBus)
 *     ↓
 *   [2] Competitive context (USPs, differentiators, competitor weaknesses)
 *     ↓
 *   [3] Regional creative context (styles, music, narrative, companion creatures)
 *     ↓
 *   [4] Scene enrichment (product, audience, approved scripts)
 *     ↓
 *   [5] AI model selection (optimal provider for this intent + complexity)
 *     ↓
 *   Fully enriched prompt ready for any GenieSuite product
 *
 * Usage:
 *   const bridge = getEnrichmentBridge();
 *   bridge.initialize(brandProfile, 'NAM_India');
 *
 *   // Enrich any prompt with full cross-service intelligence
 *   const enriched = await bridge.enrichPrompt('Create a 30s promo for my chai stall');
 *
 *   // Get unified context for a specific product
 *   const ctx = await bridge.getUnifiedContext('cast');
 *
 *   // Enrich scenes for video production
 *   const enrichedScenes = bridge.enrichScenesWithFullContext(blueprintScenes, contentPool);
 *
 * Integration with Lovable's useUniversalEnrichment hook:
 *   This bridge is the SERVICE LAYER — it works outside React components.
 *   Lovable's useUniversalEnrichment (src/hooks/useUniversalEnrichment.ts) is the
 *   REACT HOOK layer — it wraps content pool + product knowledge in React Query.
 *   They complement each other:
 *     - Hook: React component → content pool enrichment + product knowledge (DB)
 *     - Bridge: Service layer → brand intelligence + competitive + regional creative + AI routing
 *   Use enrichWithHookContext() to merge both layers.
 */

import type { BrandIntelligenceProfile, BusinessTier, MarketingFramework } from './brandIntelligenceEngine';
import { inferBusinessTier } from './brandIntelligenceEngine';
import type { GenieSuiteProduct, SparkContext, MindContext, DeckContext, CastContext, VibeContext, ArcContext } from './crossProductIntelligenceBus';
import { getIntelligenceBus } from './crossProductIntelligenceBus';
import type { CreativeStyleFamily } from './castCreativeStylesRegistry';
import { enrichPromptWithRegion, getRegionalMusicPrompt, getRegionalNarrativeStyle, getRegionalCompanionCreature } from './castCreativeStylesRegistry';
import type { ProductionPlan, ProductionUseCase, PipelineInput } from './creativeProductionPipeline';
import { estimateProductionCost } from './creativeProductionPipeline';
import { generateScenePrompts, getRecommendedPlatforms } from './castEndToEndPromptEngine';
import { findArchetypesByRegion } from './informalEconomyProfiles';
import type { EnrichedBlueprintScene } from '../contentPoolSceneEnricher';
import { enrichScenesWithContext, generateAIPromptContext } from '../contentPoolSceneEnricher';
import type { EnrichmentContext, ProductKnowledgeContext } from '../../hooks/useUniversalEnrichment';
import { formatEnrichmentForAI, getAllGenieProductsKnowledge } from '../../hooks/useUniversalEnrichment';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CompetitiveEnrichment {
  usps: string[];
  differentiators: string[];
  competitorWeaknesses: string[];
  positioningStatement: string;
  promptFragment: string;
}

export interface RegionalCreativeEnrichment {
  narrativeStyle: ReturnType<typeof getRegionalNarrativeStyle>;
  musicConfig: ReturnType<typeof getRegionalMusicPrompt>;
  companionCreature: ReturnType<typeof getRegionalCompanionCreature>;
  archetypes: ReturnType<typeof findArchetypesByRegion>;
  recommendedPlatforms: string[];
}

export interface UnifiedProductContext {
  product: GenieSuiteProduct;
  brand: {
    name: string;
    tier: BusinessTier;
    industry: string;
    regionCode: string;
  };
  productContext: SparkContext | MindContext | DeckContext | CastContext | VibeContext | ArcContext | null;
  competitive: CompetitiveEnrichment;
  regional: RegionalCreativeEnrichment;
  enrichedPromptPrefix: string;
}

export interface EnrichmentResult {
  originalPrompt: string;
  enrichedPrompt: string;
  brandContext: string;
  competitiveContext: string;
  regionalContext: string;
  productContext: string;
  modelRecommendation: {
    intent: string;
    suggestedProvider: string;
    reasoning: string;
  };
  estimatedCost?: number;
}

export interface BridgeConfig {
  enableCompetitiveEnrichment: boolean;
  enableRegionalEnrichment: boolean;
  enableModelRouting: boolean;
  maxPromptLength: number;
  competitiveContextDepth: 'minimal' | 'standard' | 'deep';
}

const DEFAULT_CONFIG: BridgeConfig = {
  enableCompetitiveEnrichment: true,
  enableRegionalEnrichment: true,
  enableModelRouting: true,
  maxPromptLength: 4000,
  competitiveContextDepth: 'standard',
};

// ─── Universal Enrichment Bridge ────────────────────────────────────────────

export class UniversalEnrichmentBridge {
  private config: BridgeConfig;
  private competitiveCache: CompetitiveEnrichment | null = null;
  private competitiveCacheExpiry: number = 0;

  constructor(config: Partial<BridgeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Initialize ─────────────────────────────────────────────

  /**
   * Set up the bridge with brand profile and region.
   * This feeds the IntelligenceBus which then distributes context to all products.
   */
  initialize(profile: BrandIntelligenceProfile, regionCode?: string): void {
    const bus = getIntelligenceBus();
    bus.setBrandProfile(profile);
    if (regionCode) {
      bus.setRegion(regionCode);
    }
  }

  // ── Competitive Intelligence Integration ───────────────────

  /**
   * Build competitive enrichment context.
   * Fetches USPs, differentiators, and competitor weaknesses from the competitive
   * intelligence service and formats them for prompt injection.
   */
  async getCompetitiveEnrichment(productId?: string): Promise<CompetitiveEnrichment> {
    // Check cache (5 min TTL)
    if (this.competitiveCache && Date.now() < this.competitiveCacheExpiry) {
      return this.competitiveCache;
    }

    try {
      // Dynamic import to avoid circular deps and allow tree-shaking
      const { competitiveIntelligenceService } = await import('../competitiveIntelligenceService');

      const [context, promptEnrichment] = await Promise.all([
        competitiveIntelligenceService.getCompetitiveContext(productId),
        competitiveIntelligenceService.getPromptEnrichment(productId),
      ]);

      const enrichment: CompetitiveEnrichment = {
        usps: context.usps.map(u => u.usp_statement),
        differentiators: context.differentiators.map(d => `${d.feature_name}: ${d.genie_capability}`),
        competitorWeaknesses: context.competitorWeaknesses.flatMap(cw =>
          cw.weaknesses.map(w => `${cw.competitor}: ${w}`)
        ),
        positioningStatement: context.positioningStatement,
        promptFragment: promptEnrichment,
      };

      this.competitiveCache = enrichment;
      this.competitiveCacheExpiry = Date.now() + 5 * 60 * 1000;
      return enrichment;
    } catch {
      // Graceful degradation — competitive intelligence is optional
      return {
        usps: [],
        differentiators: [],
        competitorWeaknesses: [],
        positioningStatement: '',
        promptFragment: '',
      };
    }
  }

  // ── Regional Creative Intelligence ────────────────────────

  /**
   * Gather all regional creative enrichments for the current region.
   */
  getRegionalCreativeEnrichment(regionCode?: string): RegionalCreativeEnrichment {
    const bus = getIntelligenceBus();
    const region = regionCode || bus.getRegionCode();

    return {
      narrativeStyle: getRegionalNarrativeStyle(region),
      musicConfig: getRegionalMusicPrompt(region),
      companionCreature: getRegionalCompanionCreature(region),
      archetypes: findArchetypesByRegion(region),
      recommendedPlatforms: getRecommendedPlatforms(
        bus.getBrandProfile()?.identity.businessTier || 'small'
      ),
    };
  }

  // ── Unified Product Context ───────────────────────────────

  /**
   * Get unified context for a specific product — brand + competitive + regional
   * all merged into one object.
   */
  async getUnifiedContext(product: GenieSuiteProduct, productId?: string): Promise<UnifiedProductContext> {
    const bus = getIntelligenceBus();
    const profile = bus.getBrandProfile();
    const regionCode = bus.getRegionCode();

    // Get product-specific context from bus
    const contextMap: Record<GenieSuiteProduct, () => SparkContext | MindContext | DeckContext | CastContext | VibeContext | ArcContext | null> = {
      spark: () => bus.getSparkContext(),
      mind: () => bus.getMindContext(),
      deck: () => bus.getDeckContext(),
      cast: () => bus.getCastContext(),
      vibe: () => bus.getVibeContext(),
      arc: () => bus.getArcContext(),
    };

    const productContext = contextMap[product]();

    // Get competitive + regional in parallel
    const [competitive, regional] = await Promise.all([
      this.config.enableCompetitiveEnrichment
        ? this.getCompetitiveEnrichment(productId)
        : Promise.resolve<CompetitiveEnrichment>({ usps: [], differentiators: [], competitorWeaknesses: [], positioningStatement: '', promptFragment: '' }),
      Promise.resolve(this.config.enableRegionalEnrichment
        ? this.getRegionalCreativeEnrichment(regionCode)
        : { narrativeStyle: null, musicConfig: { prompt: '', genre: '', bpm: 120 }, companionCreature: null, archetypes: [], recommendedPlatforms: [] } as RegionalCreativeEnrichment),
    ]);

    // Build enriched prompt prefix
    const prefixParts: string[] = [];
    if (profile) {
      prefixParts.push(`[Brand: ${profile.identity.businessName}]`);
      prefixParts.push(`[Industry: ${profile.identity.industry}]`);
      prefixParts.push(`[Tier: ${profile.identity.businessTier}]`);
      prefixParts.push(`[Tone: ${profile.voice.primary}]`);
    }
    prefixParts.push(`[Region: ${regionCode}]`);
    if (competitive.positioningStatement) {
      prefixParts.push(`[Position: ${competitive.positioningStatement}]`);
    }

    return {
      product,
      brand: {
        name: profile?.identity.businessName || 'Unknown',
        tier: profile?.identity.businessTier || 'small',
        industry: profile?.identity.industry || 'general',
        regionCode,
      },
      productContext,
      competitive,
      regional,
      enrichedPromptPrefix: prefixParts.join(' '),
    };
  }

  // ── Prompt Enrichment (Main API) ──────────────────────────

  /**
   * The main enrichment API — takes a raw prompt and returns a fully enriched
   * prompt with brand, competitive, regional, and product context layered in.
   */
  async enrichPrompt(
    prompt: string,
    options: {
      product?: GenieSuiteProduct;
      productId?: string;
      style?: CreativeStyleFamily;
      includeCompetitive?: boolean;
      includeRegional?: boolean;
    } = {}
  ): Promise<EnrichmentResult> {
    const bus = getIntelligenceBus();
    const profile = bus.getBrandProfile();
    const regionCode = bus.getRegionCode();

    // Layer 1: Brand context
    let brandContext = '';
    if (profile) {
      brandContext = [
        `Brand: ${profile.identity.businessName}`,
        `Industry: ${profile.identity.industry}/${profile.identity.subIndustry || 'general'}`,
        `Tier: ${profile.identity.businessTier}`,
        `Tone: ${profile.voice.primary}, ${profile.voice.secondary}`,
        `Value Prop: ${profile.marketing.valueProposition}`,
      ].join('. ');
    }

    // Layer 2: Competitive context
    let competitiveContext = '';
    if (options.includeCompetitive !== false && this.config.enableCompetitiveEnrichment) {
      const competitive = await this.getCompetitiveEnrichment(options.productId);
      if (this.config.competitiveContextDepth === 'minimal') {
        competitiveContext = competitive.positioningStatement;
      } else if (this.config.competitiveContextDepth === 'standard') {
        competitiveContext = [
          competitive.positioningStatement,
          competitive.usps.length > 0 ? `USPs: ${competitive.usps.slice(0, 3).join('; ')}` : '',
        ].filter(Boolean).join('. ');
      } else {
        competitiveContext = competitive.promptFragment;
      }
    }

    // Layer 3: Regional context
    let regionalContext = '';
    if (options.includeRegional !== false && this.config.enableRegionalEnrichment) {
      regionalContext = enrichPromptWithRegion('', regionCode).trim();
      const narrative = getRegionalNarrativeStyle(regionCode);
      if (narrative) {
        regionalContext += `. Narrative: ${narrative.approach}, humor: ${narrative.humorStyle}`;
      }
    }

    // Layer 4: Product-specific context
    let productContext = '';
    if (options.product) {
      const ctx = await this.getUnifiedContext(options.product, options.productId);
      if (ctx.productContext && 'tone' in ctx.productContext) {
        productContext = `Content tone: ${(ctx.productContext as SparkContext).tone}`;
      } else if (ctx.productContext && 'slideStyle' in ctx.productContext) {
        productContext = `Slide style: ${(ctx.productContext as DeckContext).slideStyle}`;
      } else if (ctx.productContext && 'videoStyle' in ctx.productContext) {
        productContext = `Video style: ${(ctx.productContext as CastContext).videoStyle}`;
      }
    }

    // Layer 5: Style enrichment
    let styleEnrichedPrompt = prompt;
    if (options.style) {
      styleEnrichedPrompt = bus.enrichPrompt(prompt, options.style);
    }

    // Assemble enriched prompt
    const parts = [
      brandContext ? `[BRAND] ${brandContext}` : '',
      competitiveContext ? `[COMPETITIVE] ${competitiveContext}` : '',
      regionalContext ? `[REGIONAL] ${regionalContext}` : '',
      productContext ? `[PRODUCT] ${productContext}` : '',
      styleEnrichedPrompt,
    ].filter(Boolean);

    let enrichedPrompt = parts.join('\n\n');

    // Trim to max length
    if (enrichedPrompt.length > this.config.maxPromptLength) {
      enrichedPrompt = enrichedPrompt.slice(0, this.config.maxPromptLength - 3) + '...';
    }

    // Layer 6: Model recommendation
    let modelRecommendation = {
      intent: 'general',
      suggestedProvider: 'anthropic',
      reasoning: 'Default provider',
    };

    if (this.config.enableModelRouting) {
      try {
        const { AIRoutingIntelligenceService } = await import('../ai/AIRoutingIntelligenceService');
        const routing = AIRoutingIntelligenceService.getInstance();
        const classification = routing.classifyQuery(prompt);
        const decision = routing.getRoutingDecision(prompt);
        modelRecommendation = {
          intent: classification.intent,
          suggestedProvider: decision.primaryRecommendation?.provider || 'anthropic',
          reasoning: classification.reasoning?.join('; ') || 'Auto-routed',
        };
      } catch {
        // Graceful degradation
      }
    }

    return {
      originalPrompt: prompt,
      enrichedPrompt,
      brandContext,
      competitiveContext,
      regionalContext,
      productContext,
      modelRecommendation,
    };
  }

  // ── Scene Enrichment (Video Production) ───────────────────

  /**
   * Enrich blueprint scenes with full cross-service context:
   * brand + competitive + regional creative + audience + product.
   *
   * This bridges contentPoolSceneEnricher with the Intelligence Bus.
   */
  enrichScenesWithFullContext(
    scenes: Parameters<typeof enrichScenesWithContext>[0],
    contentPool: Parameters<typeof enrichScenesWithContext>[1],
    options: {
      productId?: string;
      region?: string;
      language?: string;
      audienceFramework?: string;
      videoStyle?: string;
    } = {}
  ): { enrichedScenes: EnrichedBlueprintScene[]; aiPromptContext: string; regionalCreative: RegionalCreativeEnrichment } {
    const bus = getIntelligenceBus();
    const region = options.region || bus.getRegionCode();
    const language = options.language || bus.getBrandProfile()?.identity.originLanguage || 'en';

    // Step 1: Base scene enrichment (product, brand, audience, regional scripts)
    const enrichedScenes = enrichScenesWithContext(
      scenes,
      contentPool,
      options.productId,
      region,
      language,
      options.audienceFramework
    );

    // Step 2: Generate AI prompt context
    const aiPromptContext = generateAIPromptContext(enrichedScenes, options.videoStyle);

    // Step 3: Layer regional creative context
    const regionalCreative = this.getRegionalCreativeEnrichment(region);

    return {
      enrichedScenes,
      aiPromptContext,
      regionalCreative,
    };
  }

  // ── Production Plan with Full Intelligence ────────────────

  /**
   * Build a production plan that leverages ALL intelligence sources.
   * Wraps IntelligenceBus.buildProductionPlan with competitive + regional layers.
   */
  async buildIntelligentProductionPlan(params: {
    title: string;
    prompt: string;
    useCase: ProductionUseCase;
    inputs: PipelineInput[];
    style?: CreativeStyleFamily;
    language?: string;
  }): Promise<{
    plan: ProductionPlan;
    enrichedPrompt: EnrichmentResult;
    scenePrompts: ReturnType<typeof generateScenePrompts>;
    regional: RegionalCreativeEnrichment;
    estimatedCost: ReturnType<typeof estimateProductionCost>;
  }> {
    const bus = getIntelligenceBus();

    // Enrich the prompt with full intelligence
    const enrichedPrompt = await this.enrichPrompt(params.prompt, {
      product: 'cast',
      style: params.style,
      includeCompetitive: true,
      includeRegional: true,
    });

    // Build the production plan via bus
    const plan = bus.buildProductionPlan({
      title: params.title,
      useCase: params.useCase,
      inputs: params.inputs,
      style: params.style,
      language: params.language,
    });

    // Generate per-scene prompts
    const profile = bus.getBrandProfile();
    const scenePrompts = generateScenePrompts({
      brandProfile: profile || undefined,
      regionCode: bus.getRegionCode(),
      style: params.style || 'pixar_3d',
      scenes: plan.scenes.map(s => ({
        title: s.title,
        description: s.description,
        narrationText: s.audio?.narration?.text || '',
      })),
      language: params.language || 'en',
    });

    // Get regional enrichments
    const regional = this.getRegionalCreativeEnrichment();

    // Estimate cost
    const estimatedCostResult = estimateProductionCost(
      params.useCase,
      plan.outputs[0]?.quality || 'standard',
      bus.getRegionCode(),
      params.inputs
    );

    return {
      plan,
      enrichedPrompt,
      scenePrompts,
      regional,
      estimatedCost: estimatedCostResult,
    };
  }

  // ── Quick Intelligence Summary ────────────────────────────

  /**
   * Get a quick summary of all available intelligence for the current context.
   * Useful for dashboards and admin panels.
   */
  async getIntelligenceSummary(): Promise<{
    brand: { name: string; tier: BusinessTier; frameworks: MarketingFramework[] } | null;
    region: { code: string; archetypes: number; platforms: string[] };
    competitive: { usps: number; differentiators: number; competitors: number };
    products: GenieSuiteProduct[];
    busMessageCount: number;
  }> {
    const bus = getIntelligenceBus();
    const profile = bus.getBrandProfile();
    const regionCode = bus.getRegionCode();
    const competitive = await this.getCompetitiveEnrichment();
    const regional = this.getRegionalCreativeEnrichment(regionCode);

    return {
      brand: profile ? {
        name: profile.identity.businessName,
        tier: profile.identity.businessTier,
        frameworks: profile.marketing.activeFrameworks,
      } : null,
      region: {
        code: regionCode,
        archetypes: regional.archetypes.length,
        platforms: regional.recommendedPlatforms,
      },
      competitive: {
        usps: competitive.usps.length,
        differentiators: competitive.differentiators.length,
        competitors: competitive.competitorWeaknesses.length,
      },
      products: ['spark', 'mind', 'deck', 'cast', 'vibe', 'arc'] as GenieSuiteProduct[],
      busMessageCount: bus.getMessageLog().length,
    };
  }
  // ── Integration with Lovable's useUniversalEnrichment ──────

  /**
   * Merge the React hook's enrichment context (content pool + product knowledge)
   * with the service layer's intelligence (brand + competitive + regional creative).
   *
   * Call this from a React component after useUniversalEnrichment() returns:
   *
   * @example
   * const { enrichmentContext, additionalContext } = useUniversalEnrichment({ productId, region });
   * const bridge = getEnrichmentBridge();
   * const fullContext = await bridge.enrichWithHookContext(enrichmentContext, prompt);
   */
  async enrichWithHookContext(
    hookContext: EnrichmentContext,
    prompt: string,
    options: {
      product?: GenieSuiteProduct;
      style?: CreativeStyleFamily;
      includeCompetitive?: boolean;
    } = {}
  ): Promise<EnrichmentResult> {
    // Start with the bridge's standard enrichment
    const baseResult = await this.enrichPrompt(prompt, {
      product: options.product,
      style: options.style,
      includeCompetitive: options.includeCompetitive,
    });

    // Layer in the hook's enrichment context (product knowledge, audience, regional scripts)
    const hookAdditionalContext = formatEnrichmentForAI(hookContext);

    // Merge: bridge context + hook context
    const mergedPrompt = [
      baseResult.enrichedPrompt,
      hookAdditionalContext ? `\n[PRODUCT_KNOWLEDGE] ${hookAdditionalContext}` : '',
    ].filter(Boolean).join('\n');

    return {
      ...baseResult,
      enrichedPrompt: mergedPrompt.slice(0, this.config.maxPromptLength),
      productContext: hookAdditionalContext || baseResult.productContext,
    };
  }

  /**
   * Get all Genie product knowledge as a single context block.
   * Delegates to Lovable's getAllGenieProductsKnowledge() for ecosystem awareness.
   */
  getEcosystemKnowledge(): Record<string, ProductKnowledgeContext> {
    return getAllGenieProductsKnowledge();
  }
}

// ─── Singleton ──────────────────────────────────────────────────────────────

let bridgeInstance: UniversalEnrichmentBridge | null = null;

export function getEnrichmentBridge(config?: Partial<BridgeConfig>): UniversalEnrichmentBridge {
  if (!bridgeInstance) {
    bridgeInstance = new UniversalEnrichmentBridge(config);
  }
  return bridgeInstance;
}

export function resetEnrichmentBridge(): void {
  bridgeInstance = null;
}
