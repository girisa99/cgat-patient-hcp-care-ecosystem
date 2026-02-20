/**
 * Enrichment Services — Barrel Export
 * 
 * Centralized export for all content enrichment utilities used across
 * the 7 Genie products (Spark, Mind, Deck, Cast, Vibe, Arc, Hub).
 * 
 * SINGLE SOURCE OF TRUTH for:
 * - Product context (marketing_products)
 * - Brand assets (marketing_brand_assets)
 * - Audience personas (marketing_audiences)
 * - Regional scripts (regional_narration_scripts)
 * - Product knowledge (product_knowledge_registry)
 * - AI prompt formatting
 * 
 * Usage:
 *   import { useUniversalEnrichment, formatEnrichmentForAI } from '@/services/enrichment';
 */

// Universal hook (product-agnostic — works for all 7 products)
export {
  useUniversalEnrichment,
  buildEnrichmentContext,
  formatEnrichmentForAI,
  getAllGenieProductsKnowledge,
  formatAllProductsForAI,
  type UniversalEnrichmentOptions,
  type EnrichmentContext,
  type UniversalEnrichmentResult,
  type ProductKnowledgeContext,
} from '@/hooks/useUniversalEnrichment';

// Enrichment status UI component
export { EnrichmentStatusBadge } from '@/components/genie-studio/EnrichmentStatusBadge';

/**
 * Merge user-provided targetAudience with enrichment context.
 * Shared utility — use everywhere instead of inlining.
 */
export function mergeAudienceWithEnrichment(
  audience?: string,
  enrichmentContext?: string,
): string | undefined {
  if (audience && enrichmentContext) {
    return `${audience}\n\n--- Product & Brand Context ---\n${enrichmentContext}`;
  }
  return audience || enrichmentContext || undefined;
}

// Scene-level enrichment (for products with scene/blueprint models: Cast, Spark)
export {
  useSceneEnrichment,
  type UseSceneEnrichmentOptions,
} from '@/hooks/useSceneEnrichment';

// Content pool scene enricher (pure functions — delegates to buildEnrichmentContext)
export {
  enrichSceneWithContext,
  enrichScenesWithContext,
  generateAIPromptContext,
  getScriptForScene,
  getEnrichmentSummary,
  type EnrichedBlueprintScene,
} from '@/services/contentPoolSceneEnricher';

// Content pool data layer (raw data access)
export {
  useContentPool,
  type ContentPoolContext,
  type ContentPoolProduct,
  type ContentPoolBrandAsset,
  type ContentPoolAudience,
  type ContentPoolRegionalScript,
  type ContentPoolTTSAudio,
} from '@/hooks/useContentPool';
