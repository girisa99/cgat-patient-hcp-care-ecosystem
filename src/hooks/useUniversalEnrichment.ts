/**
 * useUniversalEnrichment — Product-agnostic content enrichment hook
 * 
 * Provides script richness (product context, brand, audience, regional scripts,
 * product knowledge, AI prompt context) to ANY Genie product. Each product passes
 * its own session context; the hook returns enrichment data + a ready-made
 * `additionalContext` string that plugs directly into `universalScriptGeneratorService`.
 * 
 * Consolidates data from:
 * - marketing_products (via useContentPool)
 * - marketing_brand_assets (via useContentPool)
 * - marketing_audiences (via useContentPool)
 * - regional_narration_scripts (via useContentPool)
 * - product_knowledge_registry (direct query, cached)
 * 
 * Supported products: Spark, Mind, Deck, Cast, Vibe, Arc, Hub
 * 
 * @example
 * const { enrichmentContext, additionalContext } = useUniversalEnrichment({
 *   productId: selectedProduct.id,
 *   region: 'INDIA_SOUTH_TA',
 *   language: 'ta',
 *   audienceFramework: 'StoryBrand',
 * });
 * generateUniversalScript({ ...req, additionalContext });
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useContentPool } from './useContentPool';
import type { ContentPoolContext } from './useContentPool';
import { supabase } from '@/integrations/supabase/client';
import { GENIE_PRODUCTS, type GenieProduct } from '@/constants/genie-products';

// ─── TYPES ─────────────────────────────────────────────────────────────────

export interface UniversalEnrichmentOptions {
  /** Product ID (UUID) from the content pool */
  productId?: string;
  /** Product name to resolve to productId (e.g. "Genie Spark"). Used when UUID is unknown. */
  productName?: string;
  /** Region code (e.g. "MENA_UAE", "CJK_JP", "EU_FRANCE") */
  region?: string;
  /** BCP47 language code (default: "en") */
  language?: string;
  /** Audience messaging framework (e.g. "StoryBrand", "PAS", "AIDA") */
  audienceFramework?: string;
  /** Content style/tone override */
  contentStyle?: string;
  /** Subscriber user ID — loads subscriber-specific product knowledge alongside defaults */
  userId?: string;
  /** Google Places enrichment data — pass from fetchLocalBusinessEnrichment() */
  googlePlaces?: GooglePlacesEnrichment;
}

export interface ProductKnowledgeContext {
  valueProposition?: string;
  positioningStatement?: string;
  tagline?: string;
  elevatorPitch?: string;
  painPoints: string[];
  keyBenefits: string[];
  useCases: string[];
  differentiators: string[];
  competitiveEdge?: string;
  regionalPositioning?: Record<string, unknown>;
  regionalPainPoints?: Record<string, unknown>;
  regionalBenefits?: Record<string, unknown>;
  /** Source: 'db' from product_knowledge_registry, 'static' from GENIE_PRODUCTS, 'merged' from both */
  source?: 'db' | 'static' | 'merged';
}

/** Google Places live business data — REAL data from Google Places API */
export interface GooglePlacesEnrichment {
  businessName: string;
  address: string;
  rating: number | null;
  totalReviews: number;
  placeId: string;
  businessTypes: string[];
  website: string | null;
  phoneNumber: string | null;
  openingHours: string[] | null;
  topReviews: Array<{ author: string; rating: number; text: string }>;
  editorialSummary: string | null;
  competitorInsights: Array<{ name: string; snippet: string }>;
  mapsUrl: string | null;
}

export interface EnrichmentContext {
  product?: {
    name: string;
    tagline: string;
    category: string;
    features: string[];
    primaryColor: string;
    secondaryColor: string;
  };
  brand?: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  audience?: {
    label: string;
    industry: string;
    description: string;
    painPoints: string[];
    messagingAngles: string[];
  };
  regional?: {
    region: string;
    language: string;
    approvedScript?: string;
    scriptStatus: 'approved' | 'draft' | 'pending';
    ttsProvider?: string;
  };
  /** Product knowledge from product_knowledge_registry */
  knowledge?: ProductKnowledgeContext;
  /** Google Places live business data — enriches content with REAL reviews, hours, competitors */
  googlePlaces?: GooglePlacesEnrichment;
}

export interface UniversalEnrichmentResult {
  /** Structured enrichment data for UI display */
  enrichmentContext: EnrichmentContext;
  /** Pre-formatted string for universalScriptGeneratorService.additionalContext */
  additionalContext: string;
  /** Quick status flags for UI badges */
  status: {
    hasProductContext: boolean;
    hasBrandContext: boolean;
    hasAudienceContext: boolean;
    hasRegionalScript: boolean;
    hasProductKnowledge: boolean;
    approvedScriptCount: number;
  };
  /** Content pool loading state */
  isLoading: boolean;
  /** Whether content pool data is available */
  isAvailable: boolean;
  /** Selected product name (convenience) */
  productName?: string;
}

// ─── PRODUCT KNOWLEDGE QUERY (single source — replaces duplicate queries) ──

async function fetchProductKnowledge(productId: string, userId?: string): Promise<ProductKnowledgeContext | null> {
  try {
    let query = supabase
      .from('product_knowledge_registry')
      .select('value_proposition, positioning_statement, tagline, elevator_pitch, pain_points, key_benefits, use_cases, differentiators, competitive_edge, regional_positioning, regional_pain_points, regional_benefits, website_url')
      .eq('product_id', productId)
      .eq('is_current', true)
      .eq('status', 'active');

    const { data, error } = await query.maybeSingle();

    if (error || !data) return null;

    return {
      valueProposition: data.value_proposition ?? undefined,
      positioningStatement: data.positioning_statement ?? undefined,
      tagline: data.tagline ?? undefined,
      elevatorPitch: data.elevator_pitch ?? undefined,
      painPoints: (data.pain_points as string[]) || [],
      keyBenefits: (data.key_benefits as string[]) || [],
      useCases: (data.use_cases as string[]) || [],
      differentiators: (data.differentiators as string[]) || [],
      competitiveEdge: data.competitive_edge ?? undefined,
      regionalPositioning: (data.regional_positioning as Record<string, unknown>) || {},
      regionalPainPoints: (data.regional_pain_points as Record<string, unknown>) || {},
      regionalBenefits: (data.regional_benefits as Record<string, unknown>) || {},
      source: 'db',
    };
  } catch {
    console.warn('[UniversalEnrichment] Failed to load product knowledge');
    return null;
  }
}

// ─── STATIC PRODUCT KNOWLEDGE (from GENIE_PRODUCTS constants) ──────────────

/**
 * Build ProductKnowledgeContext from the static GENIE_PRODUCTS registry.
 * Works for all 7 products without requiring any DB entry.
 * Used as fallback when no product_knowledge_registry row exists, and
 * merged with DB data when both are available.
 */
function buildStaticProductKnowledge(productKey: string): ProductKnowledgeContext | null {
  // Try exact match first, then fuzzy match on name
  const entry = GENIE_PRODUCTS[productKey as GenieProduct];
  if (!entry) {
    // Try matching by name (e.g. "Genie Spark" → spark)
    const match = Object.values(GENIE_PRODUCTS).find(
      p => p.name.toLowerCase() === productKey.toLowerCase()
        || p.id === productKey.toLowerCase(),
    );
    if (!match) return null;
    return staticEntryToKnowledge(match);
  }
  return staticEntryToKnowledge(entry);
}

function staticEntryToKnowledge(entry: (typeof GENIE_PRODUCTS)[GenieProduct]): ProductKnowledgeContext {
  return {
    tagline: entry.tagline,
    valueProposition: entry.description,
    positioningStatement: `${entry.name}: ${entry.tagline} — ${entry.description}`,
    elevatorPitch: `${entry.name} is the ${entry.tagline.toLowerCase()} solution. ${entry.description}`,
    painPoints: [],
    keyBenefits: entry.features.slice(0, 5),
    useCases: entry.pipelineCategories,
    differentiators: entry.capabilities,
    competitiveEdge: `Part of the Genie Suite ecosystem with ${entry.capabilities.length} cross-functional capabilities`,
    source: 'static',
  };
}

/**
 * Merge DB knowledge with static knowledge.
 * DB values take priority; static fills gaps.
 */
function mergeKnowledge(
  dbKnowledge: ProductKnowledgeContext | null,
  staticKnowledge: ProductKnowledgeContext | null,
): ProductKnowledgeContext | null {
  if (!dbKnowledge && !staticKnowledge) return null;
  if (!dbKnowledge) return staticKnowledge;
  if (!staticKnowledge) return dbKnowledge;

  return {
    valueProposition: dbKnowledge.valueProposition || staticKnowledge.valueProposition,
    positioningStatement: dbKnowledge.positioningStatement || staticKnowledge.positioningStatement,
    tagline: dbKnowledge.tagline || staticKnowledge.tagline,
    elevatorPitch: dbKnowledge.elevatorPitch || staticKnowledge.elevatorPitch,
    painPoints: dbKnowledge.painPoints.length > 0 ? dbKnowledge.painPoints : staticKnowledge.painPoints,
    keyBenefits: dbKnowledge.keyBenefits.length > 0 ? dbKnowledge.keyBenefits : staticKnowledge.keyBenefits,
    useCases: dbKnowledge.useCases.length > 0 ? dbKnowledge.useCases : staticKnowledge.useCases,
    differentiators: dbKnowledge.differentiators.length > 0 ? dbKnowledge.differentiators : staticKnowledge.differentiators,
    competitiveEdge: dbKnowledge.competitiveEdge || staticKnowledge.competitiveEdge,
    regionalPositioning: {
      ...(staticKnowledge.regionalPositioning || {}),
      ...(dbKnowledge.regionalPositioning || {}),
    },
    regionalPainPoints: {
      ...(staticKnowledge.regionalPainPoints || {}),
      ...(dbKnowledge.regionalPainPoints || {}),
    },
    regionalBenefits: {
      ...(staticKnowledge.regionalBenefits || {}),
      ...(dbKnowledge.regionalBenefits || {}),
    },
    source: 'merged',
  };
}

/**
 * Fetch ALL Genie Suite product knowledge as a single context block.
 * Used when enrichment needs full ecosystem awareness (e.g. Ask Genie,
 * cross-product recommendations, subscriber onboarding).
 */
export function getAllGenieProductsKnowledge(): Record<string, ProductKnowledgeContext> {
  const result: Record<string, ProductKnowledgeContext> = {};
  for (const key of ['spark', 'mind', 'vibe', 'deck', 'hub', 'cast'] as GenieProduct[]) {
    const knowledge = buildStaticProductKnowledge(key);
    if (knowledge) result[key] = knowledge;
  }
  return result;
}

/**
 * Format ALL 7 products' knowledge into a single AI context string.
 * Useful for Ask Genie to recommend the right product for a task.
 */
export function formatAllProductsForAI(): string {
  const all = getAllGenieProductsKnowledge();
  const lines: string[] = ['=== Genie Suite Products ==='];
  for (const [key, k] of Object.entries(all)) {
    const product = GENIE_PRODUCTS[key as GenieProduct];
    lines.push(`\n[${product.name}] ${product.tagline}`);
    lines.push(`  ${k.valueProposition}`);
    if (k.keyBenefits.length) lines.push(`  Features: ${k.keyBenefits.join(', ')}`);
    if (k.differentiators.length) lines.push(`  Capabilities: ${k.differentiators.join(', ')}`);
  }
  return lines.join('\n');
}

// ─── PURE FUNCTION: Build enrichment from pool ─────────────────────────────

export function buildEnrichmentContext(
  pool: ContentPoolContext,
  productId?: string,
  region?: string,
  language?: string,
  audienceFramework?: string,
  knowledge?: ProductKnowledgeContext | null,
  googlePlaces?: GooglePlacesEnrichment,
): EnrichmentContext {
  const product = productId ? pool.getProductById(productId) : undefined;
  const brandAssets = productId ? pool.getBrandAssetsForProduct(productId) : [];
  const primaryAsset = brandAssets.find(a => a.is_primary) || brandAssets[0];
  const selectedAudience = audienceFramework
    ? pool.getAudienceByFramework(audienceFramework)[0]
    : pool.audiences[0];
  const regionalScript = productId && region
    ? pool.getScriptForRegion(productId, region)
    : undefined;

  return {
    product: product ? {
      name: product.name,
      tagline: product.tagline || '',
      category: product.category || '',
      features: product.features || [],
      primaryColor: product.primary_color || '',
      secondaryColor: product.secondary_color || '',
    } : undefined,

    brand: product ? {
      logoUrl: primaryAsset?.asset_url,
      primaryColor: product.primary_color || '',
      secondaryColor: product.secondary_color || '',
    } : undefined,

    audience: selectedAudience ? {
      label: selectedAudience.label,
      industry: selectedAudience.industry,
      description: selectedAudience.description || '',
      painPoints: selectedAudience.pain_points || [],
      messagingAngles: selectedAudience.messaging_angles || [],
    } : undefined,

    regional: {
      region: region || 'global',
      language: language || 'en',
      approvedScript: regionalScript?.content,
      scriptStatus: (regionalScript?.status as 'approved' | 'draft' | 'pending') || 'pending',
      ttsProvider: regionalScript?.llm_provider,
    },

    knowledge: knowledge || undefined,

    googlePlaces: googlePlaces || undefined,
  };
}

/**
 * Format enrichment context into a string for AI script generation.
 * Plugs directly into `ScriptGenerationRequest.additionalContext`.
 * 
 * This is the SINGLE source of truth for AI prompt enrichment.
 * Do NOT build inline enrichment strings elsewhere — import this instead.
 */
export function formatEnrichmentForAI(
  ctx: EnrichmentContext,
  contentStyle?: string,
): string {
  const parts: string[] = [];

  // Product basics
  if (ctx.product) {
    parts.push(`Product: ${ctx.product.name}`);
    if (ctx.product.tagline) parts.push(`Tagline: ${ctx.product.tagline}`);
    if (ctx.product.category) parts.push(`Category: ${ctx.product.category}`);
    if (ctx.product.features?.length) {
      parts.push(`Key Features: ${ctx.product.features.join(', ')}`);
    }
  }

  // Product knowledge (from product_knowledge_registry)
  if (ctx.knowledge) {
    if (ctx.knowledge.valueProposition) {
      parts.push(`Value Proposition: ${ctx.knowledge.valueProposition}`);
    }
    if (ctx.knowledge.positioningStatement) {
      parts.push(`Positioning: ${ctx.knowledge.positioningStatement}`);
    }
    if (ctx.knowledge.painPoints?.length) {
      parts.push(`Pain Points Solved: ${ctx.knowledge.painPoints.join(', ')}`);
    }
    if (ctx.knowledge.keyBenefits?.length) {
      parts.push(`Key Benefits: ${ctx.knowledge.keyBenefits.join(', ')}`);
    }
    if (ctx.knowledge.useCases?.length) {
      parts.push(`Use Cases: ${ctx.knowledge.useCases.join(', ')}`);
    }
    if (ctx.knowledge.differentiators?.length) {
      parts.push(`Differentiators: ${ctx.knowledge.differentiators.join(', ')}`);
    }
    if (ctx.knowledge.competitiveEdge) {
      parts.push(`Competitive Edge: ${ctx.knowledge.competitiveEdge}`);
    }
  }

  // Audience
  if (ctx.audience) {
    parts.push(`Target Audience: ${ctx.audience.label} (${ctx.audience.industry})`);
    if (ctx.audience.painPoints?.length) {
      parts.push(`Audience Pain Points: ${ctx.audience.painPoints.join(', ')}`);
    }
    if (ctx.audience.messagingAngles?.length) {
      parts.push(`Messaging Angles: ${ctx.audience.messagingAngles.join(', ')}`);
    }
  }

  // Regional
  if (ctx.regional) {
    parts.push(`Region: ${ctx.regional.region}`);
    parts.push(`Language: ${ctx.regional.language}`);
    if (ctx.regional.approvedScript) {
      parts.push(`Approved Regional Script:\n${ctx.regional.approvedScript}`);
    }
  }

  // Google Places live data (REAL business data — reviews, hours, competitors)
  if (ctx.googlePlaces) {
    const gp = ctx.googlePlaces;
    parts.push(`\n=== REAL BUSINESS DATA (Google Places) ===`);
    parts.push(`Business: ${gp.businessName}`);
    parts.push(`Location: ${gp.address}`);
    if (gp.rating != null) {
      parts.push(`Rating: ${gp.rating}★ (${gp.totalReviews} reviews)`);
    }
    if (gp.openingHours?.length) {
      parts.push(`Hours: ${gp.openingHours.join(', ')}`);
    }
    if (gp.editorialSummary) {
      parts.push(`About: ${gp.editorialSummary}`);
    }
    if (gp.topReviews.length > 0) {
      parts.push(`Customer Quotes:`);
      for (const r of gp.topReviews.slice(0, 3)) {
        parts.push(`  - "${r.text}" — ${r.author} (${r.rating}★)`);
      }
    }
    if (gp.competitorInsights.length > 0) {
      parts.push(`Nearby Competitors:`);
      for (const c of gp.competitorInsights.slice(0, 3)) {
        parts.push(`  - ${c.name}: ${c.snippet}`);
      }
    }
    if (gp.website) {
      parts.push(`Website: ${gp.website}`);
    }
    parts.push(`=== END REAL BUSINESS DATA ===`);
  }

  if (contentStyle) {
    parts.push(`Content Style: ${contentStyle}`);
  }

  return parts.join('\n');
}

// ─── HOOK ──────────────────────────────────────────────────────────────────

export function useUniversalEnrichment(
  options: UniversalEnrichmentOptions,
): UniversalEnrichmentResult {
  const { pool, isLoading: poolLoading } = useContentPool();
  const {
    productId: explicitProductId,
    productName,
    region = 'global',
    language = 'en',
    audienceFramework = 'StoryBrand',
    contentStyle,
    userId,
    googlePlaces,
  } = options;

  // Resolve productName → productId if UUID not provided
  const productId = useMemo(() => {
    if (explicitProductId) return explicitProductId;
    if (!productName || !pool) return undefined;
    const match = pool.products.find(
      p => p.name.toLowerCase() === productName.toLowerCase(),
    );
    return match?.id;
  }, [explicitProductId, productName, pool]);

  // Fetch product knowledge from DB (cached, deduplicated via react-query)
  const { data: dbKnowledge, isLoading: knowledgeLoading } = useQuery({
    queryKey: ['product_knowledge', productId, userId],
    queryFn: () => fetchProductKnowledge(productId!, userId),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
  });

  // Resolve static product key for GENIE_PRODUCTS fallback
  const staticProductKey = useMemo(() => {
    if (productName) {
      // "Genie Spark" → "spark"
      const lower = productName.toLowerCase().replace('genie ', '');
      if (GENIE_PRODUCTS[lower as GenieProduct]) return lower;
    }
    // Try resolving from pool product name
    if (productId && pool) {
      const p = pool.getProductById(productId);
      if (p?.name) {
        const lower = p.name.toLowerCase().replace('genie ', '');
        if (GENIE_PRODUCTS[lower as GenieProduct]) return lower;
      }
    }
    return undefined;
  }, [productId, productName, pool]);

  // Merge DB knowledge with static knowledge (DB takes priority, static fills gaps)
  const mergedKnowledge = useMemo(() => {
    const staticK = staticProductKey ? buildStaticProductKnowledge(staticProductKey) : null;
    return mergeKnowledge(dbKnowledge ?? null, staticK);
  }, [dbKnowledge, staticProductKey]);

  const enrichmentContext = useMemo<EnrichmentContext>(() => {
    if (!pool) return { regional: { region, language, scriptStatus: 'pending' } };
    return buildEnrichmentContext(pool, productId, region, language, audienceFramework, mergedKnowledge, googlePlaces);
  }, [pool, productId, region, language, audienceFramework, mergedKnowledge, googlePlaces]);

  const additionalContext = useMemo(
    () => formatEnrichmentForAI(enrichmentContext, contentStyle),
    [enrichmentContext, contentStyle],
  );

  const status = useMemo(() => ({
    hasProductContext: !!enrichmentContext.product,
    hasBrandContext: !!enrichmentContext.brand,
    hasAudienceContext: !!enrichmentContext.audience,
    hasRegionalScript: !!enrichmentContext.regional?.approvedScript,
    hasProductKnowledge: !!enrichmentContext.knowledge,
    hasGooglePlaces: !!enrichmentContext.googlePlaces,
    approvedScriptCount: pool
      ? pool.regionalScripts.filter(s => s.status === 'approved').length
      : 0,
  }), [enrichmentContext, pool]);

  return {
    enrichmentContext,
    additionalContext,
    status,
    isLoading: poolLoading || knowledgeLoading,
    isAvailable: !!pool,
    productName: enrichmentContext.product?.name,
  };
}
