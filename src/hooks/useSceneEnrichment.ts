/**
 * useSceneEnrichment - Hook for enriching scenes with Content Pool context
 * 
 * PRODUCT-AGNOSTIC: Works with ANY Genie product (Spark, Mind, Deck, Cast,
 * Vibe, Arc, Hub). Pass session context explicitly — no product-specific
 * hook dependency.
 * 
 * Integrates with:
 * - useContentPool: Product, brand, audience, script data
 * - Blueprint scenes (any product's scene format)
 * 
 * Returns: Enriched scenes ready for editing and AI processing
 */

import { useMemo } from 'react';
import { useContentPool } from './useContentPool';
import type { BlueprintScene } from './useVideoBlueprints';
import {
  enrichScenesWithContext,
  generateAIPromptContext,
  type EnrichedBlueprintScene,
} from '@/services/contentPoolSceneEnricher';

export interface UseSceneEnrichmentOptions {
  /** Scenes to enrich (from any product's blueprint/slide/scene system) */
  scenes: BlueprintScene[];
  /** Product ID from content pool */
  productId?: string;
  /** Region code (e.g. "INDIA_SOUTH_TA", "MENA_UAE") */
  region?: string;
  /** BCP47 language code */
  language?: string;
  /** Audience messaging framework (e.g. "StoryBrand", "PAS") */
  audienceFramework?: string;
  /** Video/presentation style */
  videoStyle?: string;
}

export function useSceneEnrichment(options: UseSceneEnrichmentOptions) {
  const { pool, isLoading: contentPoolLoading } = useContentPool();

  const {
    scenes,
    productId,
    region = 'global',
    language = 'en',
    audienceFramework = 'StoryBrand',
    videoStyle,
  } = options;

  // Enrich scenes with content pool context
  const enrichedScenes = useMemo<EnrichedBlueprintScene[]>(() => {
    if (!pool || !scenes || scenes.length === 0) {
      return scenes as EnrichedBlueprintScene[];
    }

    return enrichScenesWithContext(
      scenes,
      pool,
      productId,
      region,
      language,
      audienceFramework
    );
  }, [scenes, pool, productId, region, language, audienceFramework]);

  // Generate AI prompt context from enriched scenes
  const aiPromptContext = useMemo(() => {
    if (enrichedScenes.length === 0) return '';
    return generateAIPromptContext(enrichedScenes, videoStyle);
  }, [enrichedScenes, videoStyle]);

  // Compute enrichment summary (for UI display)
  const enrichmentStatus = useMemo(() => {
    if (!enrichedScenes[0]) {
      return {
        hasProductContext: false,
        hasBrandContext: false,
        hasAudienceContext: false,
        hasRegionalContext: false,
        approvedScriptCount: 0,
      };
    }

    const first = enrichedScenes[0];
    return {
      hasProductContext: !!first.productContext,
      hasBrandContext: !!first.brandContext,
      hasAudienceContext: !!first.audienceContext,
      hasRegionalContext: !!first.regionalContext,
      approvedScriptCount: enrichedScenes.filter(
        s => s.regionalContext?.scriptStatus === 'approved'
      ).length,
    };
  }, [enrichedScenes]);

  return {
    enrichedScenes,
    aiPromptContext,
    enrichmentStatus,
    isLoading: contentPoolLoading,
    contentPoolAvailable: !!pool,
    selectedProductName: pool?.getProductById(productId || '')?.name,
  };
}
