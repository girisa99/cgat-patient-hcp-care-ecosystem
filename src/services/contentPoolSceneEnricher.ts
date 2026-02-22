/**
 * Content Pool Scene Enricher (P5)
 * 
 * Injects product-specific context into blueprint scenes.
 * 
 * DELEGATES to buildEnrichmentContext() from useUniversalEnrichment
 * to avoid duplicating pool-traversal logic. This file adds the
 * scene-level wrapping (EnrichedBlueprintScene) on top of the
 * universal enrichment layer.
 * 
 * @see src/hooks/useUniversalEnrichment.ts — canonical enrichment logic
 */

import type { BlueprintScene } from '@/hooks/useVideoBlueprints';
import type { ContentPoolContext } from '@/hooks/useContentPool';
import { buildEnrichmentContext, type GooglePlacesEnrichment } from '@/hooks/useUniversalEnrichment';

export interface EnrichedBlueprintScene extends BlueprintScene {
  productContext?: {
    productId: string;
    productName: string;
    tagline: string;
    category: string;
    features: string[];
    primaryColor: string;
    secondaryColor: string;
    icon: string;
  };
  
  brandContext?: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  
  audienceContext?: {
    label: string;
    industry: string;
    description: string;
    painPoints: string[];
    messagingAngles: string[];
  };
  
  regionalContext?: {
    region: string;
    language: string;
    approvedScript?: string;
    scriptStatus: 'approved' | 'draft' | 'pending';
    ttsProviderRecommended?: string;
  };
  
  enrichedPromptContext?: {
    brand: string;
    audience: string;
    framework: string;
    region: string;
    tone: string;
  };

  /** Real-world data from Google Places API — actual reviews, hours, competitors */
  realWorldData?: {
    businessName: string;
    rating: number | null;
    totalReviews: number;
    topReviewQuotes: string[];
    openingHours: string[] | null;
    competitorNames: string[];
    editorialSummary: string | null;
  };
}

/**
 * Enrich a single scene using the universal enrichment layer.
 * Delegates pool traversal to buildEnrichmentContext to avoid duplication.
 */
export function enrichSceneWithContext(
  scene: BlueprintScene,
  contentPool: ContentPoolContext,
  productId?: string,
  region?: string,
  language?: string,
  audienceFramework?: string,
  googlePlaces?: GooglePlacesEnrichment,
): EnrichedBlueprintScene {
  // Delegate to universal enrichment (single source of truth)
  const ctx = buildEnrichmentContext(contentPool, productId, region, language, audienceFramework, undefined, googlePlaces);
  const product = productId ? contentPool.getProductById(productId) : undefined;

  return {
    ...scene,

    productContext: ctx.product && product ? {
      productId: product.id,
      productName: ctx.product.name,
      tagline: ctx.product.tagline,
      category: ctx.product.category,
      features: ctx.product.features,
      primaryColor: ctx.product.primaryColor,
      secondaryColor: ctx.product.secondaryColor,
      icon: product.icon || '',
    } : undefined,

    brandContext: ctx.brand ? {
      logoUrl: ctx.brand.logoUrl,
      primaryColor: ctx.brand.primaryColor,
      secondaryColor: ctx.brand.secondaryColor,
    } : undefined,

    audienceContext: ctx.audience ? {
      label: ctx.audience.label,
      industry: ctx.audience.industry,
      description: ctx.audience.description,
      painPoints: ctx.audience.painPoints,
      messagingAngles: ctx.audience.messagingAngles,
    } : undefined,

    regionalContext: ctx.regional ? {
      region: ctx.regional.region,
      language: ctx.regional.language,
      approvedScript: ctx.regional.approvedScript,
      scriptStatus: ctx.regional.scriptStatus,
      ttsProviderRecommended: ctx.regional.ttsProvider,
    } : undefined,

    enrichedPromptContext: {
      brand: ctx.product?.name || 'Genie',
      audience: ctx.audience?.label || 'General Audience',
      framework: ctx.audience?.messagingAngles?.[0] || 'StoryBrand',
      region: ctx.regional?.region || 'global',
      tone: ctx.product?.category || 'professional',
    },

    realWorldData: ctx.googlePlaces ? {
      businessName: ctx.googlePlaces.businessName,
      rating: ctx.googlePlaces.rating,
      totalReviews: ctx.googlePlaces.totalReviews,
      topReviewQuotes: ctx.googlePlaces.topReviews.map(r => r.text),
      openingHours: ctx.googlePlaces.openingHours,
      competitorNames: ctx.googlePlaces.competitorInsights.map(c => c.name),
      editorialSummary: ctx.googlePlaces.editorialSummary,
    } : undefined,
  };
}

export function enrichScenesWithContext(
  scenes: BlueprintScene[],
  contentPool: ContentPoolContext,
  productId?: string,
  region?: string,
  language?: string,
  audienceFramework?: string,
  googlePlaces?: GooglePlacesEnrichment,
): EnrichedBlueprintScene[] {
  return scenes.map(scene =>
    enrichSceneWithContext(scene, contentPool, productId, region, language, audienceFramework, googlePlaces)
  );
}

export function generateAIPromptContext(
  enrichedScenes: EnrichedBlueprintScene[],
  selectedVideoStyle?: string
): string {
  const firstScene = enrichedScenes[0];
  if (!firstScene) return '';
  
  const parts: string[] = [
    `Product: ${firstScene.enrichedPromptContext?.brand || 'Unknown'}`,
    `Target Audience: ${firstScene.enrichedPromptContext?.audience || 'General'}`,
    `Messaging Framework: ${firstScene.enrichedPromptContext?.framework || 'StoryBrand'}`,
    `Region: ${firstScene.enrichedPromptContext?.region || 'Global'}`,
    `Tone: ${firstScene.enrichedPromptContext?.tone || 'Professional'}`,
    `Video Style: ${selectedVideoStyle || 'Cinematic'}`,
  ];
  
  if (firstScene.productContext?.features?.length) {
    parts.push(`Key Features: ${firstScene.productContext.features.join(', ')}`);
  }
  
  if (firstScene.audienceContext?.painPoints?.length) {
    parts.push(`Audience Pain Points: ${firstScene.audienceContext.painPoints.join(', ')}`);
  }
  
  if (firstScene.audienceContext?.messagingAngles?.length) {
    parts.push(`Messaging Angles: ${firstScene.audienceContext.messagingAngles.join(', ')}`);
  }

  // Include real-world Google Places data in AI prompts
  if (firstScene.realWorldData) {
    const rwd = firstScene.realWorldData;
    parts.push(`\n--- REAL BUSINESS DATA ---`);
    parts.push(`Business: ${rwd.businessName}`);
    if (rwd.rating != null) parts.push(`Google Rating: ${rwd.rating}★ (${rwd.totalReviews} reviews)`);
    if (rwd.editorialSummary) parts.push(`About: ${rwd.editorialSummary}`);
    if (rwd.topReviewQuotes.length > 0) {
      parts.push(`Customer Quotes: ${rwd.topReviewQuotes.slice(0, 2).map(q => `"${q}"`).join('; ')}`);
    }
    if (rwd.openingHours?.length) parts.push(`Hours: ${rwd.openingHours[0]}`);
    if (rwd.competitorNames.length > 0) parts.push(`Nearby Competitors: ${rwd.competitorNames.join(', ')}`);
  }

  return parts.join('\n');
}

export function getScriptForScene(
  scene: EnrichedBlueprintScene,
  useRegionalIfAvailable: boolean = true
): string {
  if (useRegionalIfAvailable && scene.regionalContext?.approvedScript) {
    return scene.regionalContext.approvedScript;
  }
  return scene.script_template || '';
}

export function getEnrichmentSummary(enrichedScene: EnrichedBlueprintScene) {
  return {
    productName: enrichedScene.productContext?.productName,
    category: enrichedScene.productContext?.category,
    audience: enrichedScene.audienceContext?.label,
    region: enrichedScene.regionalContext?.region,
    hasApprovedScript: !!enrichedScene.regionalContext?.approvedScript,
  };
}
