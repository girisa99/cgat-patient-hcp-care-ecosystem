/**
 * Enrichment Services — Barrel Export
 * 
 * Centralized export for all content enrichment utilities used across
 * the 7 Genie products (Spark, Mind, Deck, Cast, Vibe, Arc, Hub).
 * 
 * Usage:
 *   import { useUniversalEnrichment, buildEnrichmentContext } from '@/services/enrichment';
 */

// Universal hook (product-agnostic)
export {
  useUniversalEnrichment,
  buildEnrichmentContext,
  formatEnrichmentForAI,
  type UniversalEnrichmentOptions,
  type EnrichmentContext,
  type UniversalEnrichmentResult,
} from '@/hooks/useUniversalEnrichment';

// Scene-level enrichment (for products with scene/blueprint models)
export {
  useSceneEnrichment,
  type UseSceneEnrichmentOptions,
} from '@/hooks/useSceneEnrichment';

// Content pool scene enricher (pure functions)
export {
  enrichSceneWithContext,
  enrichScenesWithContext,
  generateAIPromptContext,
  getScriptForScene,
  getEnrichmentSummary,
  type EnrichedBlueprintScene,
} from '@/services/contentPoolSceneEnricher';

// Content pool data layer
export {
  useContentPool,
  type ContentPoolContext,
  type ContentPoolProduct,
  type ContentPoolBrandAsset,
  type ContentPoolAudience,
  type ContentPoolRegionalScript,
  type ContentPoolTTSAudio,
} from '@/hooks/useContentPool';
