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

// ─── TYPES ─────────────────────────────────────────────────────────────────

export interface UniversalEnrichmentOptions {
  /** Product ID from the content pool */
  productId?: string;
  /** Region code (e.g. "MENA_UAE", "CJK_JP", "EU_FRANCE") */
  region?: string;
  /** BCP47 language code (default: "en") */
  language?: string;
  /** Audience messaging framework (e.g. "StoryBrand", "PAS", "AIDA") */
  audienceFramework?: string;
  /** Content style/tone override */
  contentStyle?: string;
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

async function fetchProductKnowledge(productId: string): Promise<ProductKnowledgeContext | null> {
  try {
    const { data, error } = await supabase
      .from('product_knowledge_registry')
      .select('value_proposition, positioning_statement, tagline, elevator_pitch, pain_points, key_benefits, use_cases, differentiators, competitive_edge, regional_positioning, regional_pain_points, regional_benefits')
      .eq('product_id', productId)
      .eq('is_current', true)
      .eq('status', 'active')
      .maybeSingle();

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
    };
  } catch {
    console.warn('[UniversalEnrichment] Failed to load product knowledge');
    return null;
  }
}

// ─── PURE FUNCTION: Build enrichment from pool ─────────────────────────────

export function buildEnrichmentContext(
  pool: ContentPoolContext,
  productId?: string,
  region?: string,
  language?: string,
  audienceFramework?: string,
  knowledge?: ProductKnowledgeContext | null,
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
    productId,
    region = 'global',
    language = 'en',
    audienceFramework = 'StoryBrand',
    contentStyle,
  } = options;

  // Fetch product knowledge (cached, deduplicated via react-query)
  const { data: knowledge, isLoading: knowledgeLoading } = useQuery({
    queryKey: ['product_knowledge', productId],
    queryFn: () => fetchProductKnowledge(productId!),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
  });

  const enrichmentContext = useMemo<EnrichmentContext>(() => {
    if (!pool) return { regional: { region, language, scriptStatus: 'pending' } };
    return buildEnrichmentContext(pool, productId, region, language, audienceFramework, knowledge);
  }, [pool, productId, region, language, audienceFramework, knowledge]);

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
