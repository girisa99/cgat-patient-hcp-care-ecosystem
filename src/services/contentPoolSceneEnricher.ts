/**
 * Content Pool Scene Enricher (P5)
 * 
 * Injects product-specific context into blueprint scenes:
 * - Brand assets (logo, colors, typography)
 * - Product metadata (tagline, value propositions, key features)
 * - Approved regional scripts (if available)
 * - Messaging frameworks (AIDA, StoryBrand, JTBD, etc.)
 * - Target audience persona data
 * 
 * Purpose: Ensures all generated scenes maintain brand consistency
 * and product-specific context throughout the production lifecycle.
 */

import type { BlueprintScene } from '@/hooks/useVideoBlueprints';
import type { ContentPoolContext, ContentPoolProduct, ContentPoolBrandAsset, ContentPoolAudience, ContentPoolRegionalScript } from '@/hooks/useContentPool';

export interface EnrichedBlueprintScene extends BlueprintScene {
  // Injected context
  productContext?: {
    productId: string;
    productName: string;
    tagline: string;
    keyFeatures: string[];
    valuePropositions: string[];
    positioningStatement: string;
  };
  
  brandContext?: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontDisplay: string;
    fontBody: string;
    voiceTone: string;
  };
  
  audienceContext?: {
    personaName: string;
    industry: string;
    jobTitle: string;
    painPoints: string[];
    successMetrics: string[];
    preferredFramework: string;
  };
  
  regionalContext?: {
    region: string;
    language: string;
    approvedScript?: string;
    scriptStatus: 'approved' | 'draft' | 'pending';
    ttsProviderRecommended?: string;
  };
  
  // AI prompting context
  enrichedPromptContext?: {
    brand: string;
    audience: string;
    framework: string;
    region: string;
    tone: string;
  };
}

/**
 * Enriches a blueprint scene with product, brand, audience, and regional context
 */
export function enrichSceneWithContext(
  scene: BlueprintScene,
  contentPool: ContentPoolContext,
  productId?: string,
  region?: string,
  language?: string,
  audienceFramework?: string
): EnrichedBlueprintScene {
  
  // 1. Get product context
  const product = productId ? contentPool.getProductById(productId) : null;
  
  // 2. Get brand assets (user's or system default)
  const brandAsset = contentPool.brandAssets;
  
  // 3. Get audience based on framework preference
  const audiences = contentPool.audiences;
  const selectedAudience = audienceFramework
    ? contentPool.getAudienceByFramework(audienceFramework)[0]
    : audiences[0];
  
  // 4. Get regional script if available
  const regionalScript = productId && region
    ? contentPool.getScriptForRegion(productId, region)
    : null;
  
  // 5. Build enriched scene
  const enrichedScene: EnrichedBlueprintScene = {
    ...scene,
    
    productContext: product ? {
      productId: product.id,
      productName: product.name,
      tagline: product.tagline,
      keyFeatures: product.key_features || [],
      valuePropositions: product.value_propositions || [],
      positioningStatement: product.positioning_statement || '',
    } : undefined,
    
    brandContext: brandAsset ? {
      logoUrl: brandAsset.logo_light_url || undefined,
      primaryColor: brandAsset.primary_color,
      secondaryColor: brandAsset.secondary_color,
      accentColor: brandAsset.accent_color,
      fontDisplay: brandAsset.font_family_display,
      fontBody: brandAsset.font_family_body,
      voiceTone: brandAsset.voice_tone,
    } : undefined,
    
    audienceContext: selectedAudience ? {
      personaName: selectedAudience.persona_name,
      industry: selectedAudience.industry,
      jobTitle: selectedAudience.job_title,
      painPoints: selectedAudience.pain_points || [],
      successMetrics: selectedAudience.success_metrics || [],
      preferredFramework: selectedAudience.preferred_framework,
    } : undefined,
    
    regionalContext: {
      region: region || 'global',
      language: language || 'en',
      approvedScript: regionalScript?.content,
      scriptStatus: (regionalScript?.status as 'approved' | 'draft' | 'pending') || 'pending',
      ttsProviderRecommended: regionalScript?.llm_provider,
    },
    
    enrichedPromptContext: {
      brand: product?.name || 'Genie',
      audience: selectedAudience?.persona_name || 'General Audience',
      framework: selectedAudience?.preferred_framework || 'StoryBrand',
      region: region || 'global',
      tone: brandAsset?.voice_tone || 'professional',
    },
  };
  
  return enrichedScene;
}

/**
 * Batch enrich multiple scenes with product context
 */
export function enrichScenesWithContext(
  scenes: BlueprintScene[],
  contentPool: ContentPoolContext,
  productId?: string,
  region?: string,
  language?: string,
  audienceFramework?: string
): EnrichedBlueprintScene[] {
  return scenes.map(scene =>
    enrichSceneWithContext(
      scene,
      contentPool,
      productId,
      region,
      language,
      audienceFramework
    )
  );
}

/**
 * Generate an AI-ready prompt context from enriched scenes
 * Used by AISceneCustomizer to route to LLM with full context
 */
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
    `Voice Tone: ${firstScene.enrichedPromptContext?.tone || 'Professional'}`,
    `Video Style: ${selectedVideoStyle || 'Cinematic'}`,
  ];
  
  if (firstScene.productContext?.keyFeatures?.length) {
    parts.push(`Key Features: ${firstScene.productContext.keyFeatures.join(', ')}`);
  }
  
  if (firstScene.productContext?.valuePropositions?.length) {
    parts.push(`Value Propositions: ${firstScene.productContext.valuePropositions.join(', ')}`);
  }
  
  if (firstScene.audienceContext?.painPoints?.length) {
    parts.push(`Audience Pain Points: ${firstScene.audienceContext.painPoints.join(', ')}`);
  }
  
  return parts.join('\n');
}

/**
 * Extract script template from regional context if available
 * Falls back to blueprint's native template if no regional script exists
 */
export function getScriptForScene(
  scene: EnrichedBlueprintScene,
  useRegionalIfAvailable: boolean = true
): string {
  if (useRegionalIfAvailable && scene.regionalContext?.approvedScript) {
    return scene.regionalContext.approvedScript;
  }
  
  return scene.script_template || '';
}

/**
 * Build a summary of enriched context for UI display
 */
export function getEnrichmentSummary(
  enrichedScene: EnrichedBlueprintScene
): {
  productName?: string;
  brandTone?: string;
  audience?: string;
  region?: string;
  hasApprovedScript: boolean;
} {
  return {
    productName: enrichedScene.productContext?.productName,
    brandTone: enrichedScene.brandContext?.voiceTone,
    audience: enrichedScene.audienceContext?.personaName,
    region: enrichedScene.regionalContext?.region,
    hasApprovedScript: !!enrichedScene.regionalContext?.approvedScript,
  };
}
