/**
 * useUniversalEnrichment — Product-agnostic content enrichment hook
 * 
 * Provides script richness (product context, brand, audience, regional scripts,
 * AI prompt context) to ANY Genie product. Each product passes its own session
 * context; the hook returns enrichment data + a ready-made `additionalContext`
 * string that plugs directly into `universalScriptGeneratorService`.
 * 
 * Supported products: Spark, Mind, Deck, Cast, Vibe, Arc, Hub
 * 
 * @example
 * // In Spark
 * const { enrichmentContext, additionalContext } = useUniversalEnrichment({
 *   productId: selectedProduct.id,
 *   region: 'INDIA_SOUTH_TA',
 *   language: 'ta',
 *   audienceFramework: 'StoryBrand',
 * });
 * 
 * // Feed into script generator
 * generateUniversalScript({ ...req, additionalContext });
 */

import { useMemo } from 'react';
import { useContentPool } from './useContentPool';
import type { ContentPoolContext } from './useContentPool';

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
    approvedScriptCount: number;
  };
  /** Content pool loading state */
  isLoading: boolean;
  /** Whether content pool data is available */
  isAvailable: boolean;
  /** Selected product name (convenience) */
  productName?: string;
}

// ─── PURE FUNCTION: Build enrichment from pool ─────────────────────────────

export function buildEnrichmentContext(
  pool: ContentPoolContext,
  productId?: string,
  region?: string,
  language?: string,
  audienceFramework?: string,
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
  };
}

/**
 * Format enrichment context into a string for AI script generation.
 * Plugs directly into `ScriptGenerationRequest.additionalContext`.
 */
export function formatEnrichmentForAI(
  ctx: EnrichmentContext,
  contentStyle?: string,
): string {
  const parts: string[] = [];

  if (ctx.product) {
    parts.push(`Product: ${ctx.product.name}`);
    if (ctx.product.tagline) parts.push(`Tagline: ${ctx.product.tagline}`);
    if (ctx.product.category) parts.push(`Category: ${ctx.product.category}`);
    if (ctx.product.features?.length) {
      parts.push(`Key Features: ${ctx.product.features.join(', ')}`);
    }
  }

  if (ctx.audience) {
    parts.push(`Target Audience: ${ctx.audience.label} (${ctx.audience.industry})`);
    if (ctx.audience.painPoints?.length) {
      parts.push(`Pain Points: ${ctx.audience.painPoints.join(', ')}`);
    }
    if (ctx.audience.messagingAngles?.length) {
      parts.push(`Messaging Angles: ${ctx.audience.messagingAngles.join(', ')}`);
    }
  }

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
  const { pool, isLoading } = useContentPool();
  const {
    productId,
    region = 'global',
    language = 'en',
    audienceFramework = 'StoryBrand',
    contentStyle,
  } = options;

  const enrichmentContext = useMemo<EnrichmentContext>(() => {
    if (!pool) return { regional: { region, language, scriptStatus: 'pending' } };
    return buildEnrichmentContext(pool, productId, region, language, audienceFramework);
  }, [pool, productId, region, language, audienceFramework]);

  const additionalContext = useMemo(
    () => formatEnrichmentForAI(enrichmentContext, contentStyle),
    [enrichmentContext, contentStyle],
  );

  const status = useMemo(() => ({
    hasProductContext: !!enrichmentContext.product,
    hasBrandContext: !!enrichmentContext.brand,
    hasAudienceContext: !!enrichmentContext.audience,
    hasRegionalScript: !!enrichmentContext.regional?.approvedScript,
    approvedScriptCount: pool
      ? pool.regionalScripts.filter(s => s.status === 'approved').length
      : 0,
  }), [enrichmentContext, pool]);

  return {
    enrichmentContext,
    additionalContext,
    status,
    isLoading,
    isAvailable: !!pool,
    productName: enrichmentContext.product?.name,
  };
}
