/**
 * useSceneEnrichment - Hook for enriching scenes with Content Pool context
 * 
 * Integrates with:
 * - useContentPool: Product, brand, audience, script data
 * - useGenieCastSession: Selected product, region, language
 * - useVideoBlueprints: Blueprint scenes
 * 
 * Returns: Enriched scenes ready for editing and AI processing
 */

import { useMemo } from 'react';
import { useContentPool } from './useContentPool';
import { useGenieCastSession } from './useGenieCastSession';
import type { BlueprintScene } from './useVideoBlueprints';
import {
  enrichScenesWithContext,
  generateAIPromptContext,
  type EnrichedBlueprintScene,
} from '@/services/contentPoolSceneEnricher';

interface UseSceneEnrichmentOptions {
  scenes: BlueprintScene[];
  productId?: string;
  region?: string;
  language?: string;
  audienceFramework?: string;
  videoStyle?: string;
}

export function useSceneEnrichment(options: UseSceneEnrichmentOptions) {
  const { pool, isLoading: contentPoolLoading } = useContentPool();
  const { session } = useGenieCastSession();

  const {
    scenes,
    productId = session?.selectedProductId || undefined,
    region = session?.selectedRegion || 'global',
    language = 'en',
    audienceFramework = 'StoryBrand', // Default to StoryBrand framework
    videoStyle = session?.selectedStyles?.[0],
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
