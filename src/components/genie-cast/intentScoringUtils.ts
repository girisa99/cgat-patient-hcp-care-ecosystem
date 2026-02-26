/**
 * Intent-based template recommendation scoring utilities
 * Hybrid scoring: category (35%) + styles (25%) + keywords (40%)
 */

import type { VideoBlueprint } from '@/hooks/useVideoBlueprints';

export interface IntentContext {
  categories: string[];
  keywordMatches: string[];
  stylePreferences: string[];
  durationRange?: { min: number; max: number };
}

export const INTENT_TO_CONTEXT: Record<string, IntentContext> = {
  'product-demo': {
    categories: ['marketing', 'corporate', 'saas'],
    keywordMatches: ['demo', 'product', 'feature', 'showcase'],
    stylePreferences: ['product_demo', 'corporate'],
    durationRange: { min: 30, max: 120 }
  },
  'hero-banner': {
    categories: ['marketing', 'animation', 'image_to_video'],
    keywordMatches: ['hero', 'banner', 'landing', 'hook'],
    stylePreferences: ['hook_videos', 'hero'],
    durationRange: { min: 10, max: 30 }
  },
  'educational': {
    categories: ['educational', 'animation', 'ppt'],
    keywordMatches: ['education', 'tutorial', 'learn', 'explain', 'guide'],
    stylePreferences: ['educational', 'animation_3d_explainer'],
    durationRange: { min: 60, max: 300 }
  },
  'testimonial': {
    categories: ['marketing', 'avatar', 'storytelling'],
    keywordMatches: ['testimonial', 'review', 'customer', 'success', 'avatar'],
    stylePreferences: ['ugc_avatar_photorealistic', 'testimonial'],
    durationRange: { min: 30, max: 90 }
  },
  'case-study': {
    categories: ['corporate', 'storytelling', 'marketing'],
    keywordMatches: ['case study', 'success story', 'results', 'client'],
    stylePreferences: ['smart_storytelling', 'narrative'],
    durationRange: { min: 90, max: 300 }
  },
  'social-short': {
    categories: ['entertainment', 'animation', 'marketing'],
    keywordMatches: ['social', 'short', 'viral', 'tiktok', 'reel'],
    stylePreferences: ['hook_videos', 'entertainment'],
    durationRange: { min: 10, max: 60 }
  },
  'how-to': {
    categories: ['educational', 'animation', 'ppt'],
    keywordMatches: ['how-to', 'tutorial', 'steps', 'guide', 'process'],
    stylePreferences: ['educational', 'process'],
    durationRange: { min: 60, max: 180 }
  },
  'thought-leadership': {
    categories: ['corporate', 'storytelling', 'avatar'],
    keywordMatches: ['thought leader', 'expert', 'insight', 'perspective', 'industry'],
    stylePreferences: ['smart_storytelling', 'avatar'],
    durationRange: { min: 60, max: 120 }
  },
  'explainer': {
    categories: ['educational', 'animation', '3d'],
    keywordMatches: ['explainer', 'explain', 'concept', '3d', 'animation'],
    stylePreferences: ['animation_3d_explainer', 'educational'],
    durationRange: { min: 60, max: 180 }
  },
  'internal-comms': {
    categories: ['corporate', 'announcement', 'ppt'],
    keywordMatches: ['internal', 'announcement', 'update', 'company', 'team'],
    stylePreferences: ['corporate_training', 'announcement'],
    durationRange: { min: 30, max: 120 }
  },
  'event-promo': {
    categories: ['marketing', 'entertainment', 'animation'],
    keywordMatches: ['event', 'promotion', 'promo', 'festival', 'conference'],
    stylePreferences: ['event_recap', 'marketing'],
    durationRange: { min: 15, max: 60 }
  },
  'investor-update': {
    categories: ['corporate', 'ppt', 'storytelling'],
    keywordMatches: ['investor', 'quarterly', 'earnings', 'financial', 'stakeholder'],
    stylePreferences: ['investor_pitch', 'corporate'],
    durationRange: { min: 60, max: 180 }
  },
};

/**
 * Score a blueprint based on intent context
 * Scoring: category match (0-35pts), styles match (0-25pts), keywords (0-40pts), duration (0-5pts)
 */
export const scoreBlueprint = (blueprint: VideoBlueprint, context: IntentContext): number => {
  let score = 0;

  // Category match (0-35 points)
  if (context.categories.some(cat => blueprint.category.toLowerCase().includes(cat))) {
    score += 35;
  }

  // Default styles match (0-25 points)
  const bpStyles = blueprint.default_settings?.videoStyles || [];
  const styleMatches = context.stylePreferences.filter(sp =>
    bpStyles.some(s => typeof s === 'string' ? s.includes(sp) : s.id?.includes(sp))
  ).length;
  if (styleMatches > 0) {
    score += Math.min(25, styleMatches * 12);
  }

  // Keyword match in name/description (0-40 points)
  const text = `${blueprint.name} ${blueprint.description || ''}`.toLowerCase();
  const keywordMatches = context.keywordMatches.filter(kw => text.includes(kw)).length;
  if (keywordMatches > 0) {
    score += Math.min(40, keywordMatches * 10);
  }

  // Duration match bonus (0-5 points)
  if (context.durationRange) {
    if (
      blueprint.estimated_duration_seconds >= context.durationRange.min &&
      blueprint.estimated_duration_seconds <= context.durationRange.max
    ) {
      score += 5;
    }
  }

  return score;
};

/**
 * Get top N templates for an intent, scored by hybrid algorithm
 */
export const getIntentRecommendations = (
  blueprints: VideoBlueprint[],
  intent: string,
  limit: number = 8
): VideoBlueprint[] => {
  const context = INTENT_TO_CONTEXT[intent];
  if (!context) return blueprints.slice(0, limit);

  return blueprints
    .map(bp => ({ bp, score: scoreBlueprint(bp, context) }))
    .sort((a, b) => b.score - a.score || (b.bp.usage_count || 0) - (a.bp.usage_count || 0))
    .slice(0, limit)
    .map(item => item.bp);
};
