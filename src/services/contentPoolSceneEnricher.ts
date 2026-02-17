/**
 * Content Pool Scene Enricher (P5)
 * 
 * Injects product-specific context into blueprint scenes:
 * - Product metadata (name, tagline, features, category)
 * - Brand assets (logos per product)
 * - Audience personas (pain points, messaging angles)
 * - Approved regional scripts (if available)
 * 
 * Aligned to actual DB schema for marketing_products, marketing_brand_assets,
 * marketing_audiences tables.
 */

import type { BlueprintScene } from '@/hooks/useVideoBlueprints';
import type { ContentPoolContext, ContentPoolProduct, ContentPoolAudience } from '@/hooks/useContentPool';

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
}

export function enrichSceneWithContext(
  scene: BlueprintScene,
  contentPool: ContentPoolContext,
  productId?: string,
  region?: string,
  language?: string,
  audienceFramework?: string
): EnrichedBlueprintScene {
  const product = productId ? contentPool.getProductById(productId) : null;
  const brandAssets = productId ? contentPool.getBrandAssetsForProduct(productId) : [];
  const primaryAsset = brandAssets.find(a => a.is_primary) || brandAssets[0];
  const audiences = contentPool.audiences;
  const selectedAudience = audienceFramework
    ? contentPool.getAudienceByFramework(audienceFramework)[0]
    : audiences[0];
  const regionalScript = productId && region
    ? contentPool.getScriptForRegion(productId, region)
    : null;

  return {
    ...scene,
    
    productContext: product ? {
      productId: product.id,
      productName: product.name,
      tagline: product.tagline || '',
      category: product.category || '',
      features: product.features || [],
      primaryColor: product.primary_color || '',
      secondaryColor: product.secondary_color || '',
      icon: product.icon || '',
    } : undefined,
    
    brandContext: product ? {
      logoUrl: primaryAsset?.asset_url,
      primaryColor: product.primary_color || '',
      secondaryColor: product.secondary_color || '',
    } : undefined,
    
    audienceContext: selectedAudience ? {
      label: selectedAudience.label,
      industry: selectedAudience.industry,
      description: selectedAudience.description || '',
      painPoints: selectedAudience.pain_points || [],
      messagingAngles: selectedAudience.messaging_angles || [],
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
      audience: selectedAudience?.label || 'General Audience',
      framework: selectedAudience?.messaging_angles?.[0] || 'StoryBrand',
      region: region || 'global',
      tone: product?.category || 'professional',
    },
  };
}

export function enrichScenesWithContext(
  scenes: BlueprintScene[],
  contentPool: ContentPoolContext,
  productId?: string,
  region?: string,
  language?: string,
  audienceFramework?: string
): EnrichedBlueprintScene[] {
  return scenes.map(scene =>
    enrichSceneWithContext(scene, contentPool, productId, region, language, audienceFramework)
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
