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
  type UniversalEnrichmentOptions,
  type EnrichmentContext,
  type UniversalEnrichmentResult,
  type ProductKnowledgeContext,
} from '@/hooks/useUniversalEnrichment';

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
