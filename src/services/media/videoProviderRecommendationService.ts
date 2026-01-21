/**
 * Video Provider Recommendation Service
 * 
 * Multi-provider support for AnimateDiff, SVD, and animation models
 * with intelligent scoring, pairing, and user feedback integration.
 * 
 * Providers: ModelsLab, Alibaba, Azure, Google, DeepSeek, Replicate
 */

import { VideoGenProvider } from './types';

// =============================================================================
// VIDEO MODEL TYPES - Multi-Provider Support
// =============================================================================

export type VideoModelType = 
  | 'animatediff'
  | 'svd'
  | 'wan_animate'
  | 'veo'
  | 'avatar'
  | 'lipsync'
  | 'text_to_video'
  | 'image_to_video';

export interface VideoProviderScore {
  providerId: VideoGenProvider;
  providerName: string;
  modelType: VideoModelType;
  
  // Scores (0-100)
  qualityScore: number;
  speedScore: number;
  costScore: number;
  reliabilityScore: number;
  
  // Computed
  overallScore: number;
  tier: 1 | 2 | 3;
  
  // Metadata
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  
  // User feedback
  likes: number;
  dislikes: number;
  userRating: number; // 0-5
  
  // Pairing info
  recommendedPairings: VideoGenProvider[];
  fallbackProviders: VideoGenProvider[];
}

export interface VideoRecommendation {
  primary: VideoProviderScore;
  alternatives: VideoProviderScore[];
  reasoning: string;
  pairingAdvice: string;
  contextScore: number; // 0-100 match with user context
}

// =============================================================================
// MULTI-PROVIDER MODEL MATRIX
// =============================================================================

// AnimateDiff is available across multiple providers
export const ANIMATEDIFF_PROVIDERS: Record<string, VideoProviderScore> = {
  modelslab: {
    providerId: 'modelslab_animatediff',
    providerName: 'ModelsLab AnimateDiff',
    modelType: 'animatediff',
    qualityScore: 88,
    speedScore: 75,
    costScore: 80,
    reliabilityScore: 90,
    overallScore: 83,
    tier: 1,
    strengths: ['Multiple styles', 'Async processing', 'LoRA support', 'Best documentation'],
    weaknesses: ['Short duration (3-10s)', 'Queue delays'],
    bestFor: ['Marketing videos', 'Social media', 'Product demos'],
    likes: 0,
    dislikes: 0,
    userRating: 4.2,
    recommendedPairings: ['alibaba_wan_animate', 'replicate'],
    fallbackProviders: ['replicate', 'alibaba_wanx_video'],
  },
  alibaba: {
    providerId: 'alibaba_wanx_video',
    providerName: 'Alibaba Wanx AnimateDiff',
    modelType: 'animatediff',
    qualityScore: 82,
    speedScore: 85,
    costScore: 95,
    reliabilityScore: 85,
    overallScore: 87,
    tier: 2,
    strengths: ['Very low cost', 'Fast processing', 'CJK optimized', 'Motion transfer'],
    weaknesses: ['Lower resolution', 'Limited styles'],
    bestFor: ['Chinese content', 'High volume', 'Budget projects'],
    likes: 0,
    dislikes: 0,
    userRating: 3.8,
    recommendedPairings: ['alibaba_wan_animate', 'deepseek_video'],
    fallbackProviders: ['modelslab_animatediff', 'replicate'],
  },
  replicate: {
    providerId: 'replicate',
    providerName: 'Replicate AnimateDiff',
    modelType: 'animatediff',
    qualityScore: 85,
    speedScore: 70,
    costScore: 75,
    reliabilityScore: 80,
    overallScore: 77,
    tier: 2,
    strengths: ['Open source models', 'Custom weights', 'Community models'],
    weaknesses: ['Cold start delays', 'Variable pricing'],
    bestFor: ['Custom styles', 'Experimentation', 'Research'],
    likes: 0,
    dislikes: 0,
    userRating: 3.9,
    recommendedPairings: ['modelslab_animatediff', 'alibaba_wanx_video'],
    fallbackProviders: ['modelslab_animatediff', 'alibaba_wanx_video'],
  },
  azure: {
    providerId: 'azure_video',
    providerName: 'Azure Video Animator',
    modelType: 'animatediff',
    qualityScore: 90,
    speedScore: 65,
    costScore: 60,
    reliabilityScore: 95,
    overallScore: 77,
    tier: 2,
    strengths: ['Enterprise SLA', 'HIPAA compliant', 'Stable API'],
    weaknesses: ['Higher cost', 'Complex setup'],
    bestFor: ['Enterprise', 'Healthcare', 'Compliance-required'],
    likes: 0,
    dislikes: 0,
    userRating: 4.0,
    recommendedPairings: ['azure_video', 'gemini_veo'],
    fallbackProviders: ['modelslab_animatediff', 'gemini_veo'],
  },
  deepseek: {
    providerId: 'deepseek_video',
    providerName: 'DeepSeek Video Animation',
    modelType: 'animatediff',
    qualityScore: 80,
    speedScore: 80,
    costScore: 98,
    reliabilityScore: 75,
    overallScore: 83,
    tier: 3,
    strengths: ['Lowest cost', 'Vision understanding', 'Technical content'],
    weaknesses: ['Newer model', 'Less tested'],
    bestFor: ['Technical videos', 'Chinese content', 'Budget projects'],
    likes: 0,
    dislikes: 0,
    userRating: 3.5,
    recommendedPairings: ['alibaba_wanx_video', 'alibaba_wan_animate'],
    fallbackProviders: ['alibaba_wanx_video', 'modelslab_animatediff'],
  },
  google: {
    providerId: 'gemini_veo',
    providerName: 'Google Veo Animation',
    modelType: 'animatediff',
    qualityScore: 92,
    speedScore: 60,
    costScore: 50,
    reliabilityScore: 88,
    overallScore: 72,
    tier: 2,
    strengths: ['High quality', 'Longer duration', 'Google ecosystem'],
    weaknesses: ['Limited availability', 'Higher cost'],
    bestFor: ['Premium content', 'Google Cloud users', 'Long-form video'],
    likes: 0,
    dislikes: 0,
    userRating: 4.1,
    recommendedPairings: ['azure_video', 'modelslab_animatediff'],
    fallbackProviders: ['modelslab_animatediff', 'replicate'],
  },
};

// SVD (Stable Video Diffusion) across multiple providers
export const SVD_PROVIDERS: Record<string, VideoProviderScore> = {
  modelslab: {
    providerId: 'modelslab_svd',
    providerName: 'ModelsLab SVD',
    modelType: 'svd',
    qualityScore: 90,
    speedScore: 70,
    costScore: 75,
    reliabilityScore: 88,
    overallScore: 81,
    tier: 1,
    strengths: ['High quality', 'Smooth motion', 'Image-to-video', 'Motion control'],
    weaknesses: ['Slower processing', '4s max duration'],
    bestFor: ['Product videos', 'Art animation', 'Cinematic shots'],
    likes: 0,
    dislikes: 0,
    userRating: 4.3,
    recommendedPairings: ['modelslab_animatediff', 'replicate'],
    fallbackProviders: ['replicate', 'alibaba_wan_animate'],
  },
  replicate: {
    providerId: 'replicate',
    providerName: 'Replicate SVD',
    modelType: 'svd',
    qualityScore: 88,
    speedScore: 65,
    costScore: 70,
    reliabilityScore: 78,
    overallScore: 75,
    tier: 2,
    strengths: ['Multiple SVD variants', 'XT model support', 'Custom configs'],
    weaknesses: ['Cold starts', 'Queue times'],
    bestFor: ['Custom workflows', 'Research', 'Experimentation'],
    likes: 0,
    dislikes: 0,
    userRating: 3.8,
    recommendedPairings: ['modelslab_svd', 'alibaba_wan_animate'],
    fallbackProviders: ['modelslab_svd', 'alibaba_wan_animate'],
  },
  alibaba: {
    providerId: 'alibaba_wan_animate',
    providerName: 'Alibaba WAN SVD',
    modelType: 'svd',
    qualityScore: 85,
    speedScore: 80,
    costScore: 92,
    reliabilityScore: 82,
    overallScore: 85,
    tier: 2,
    strengths: ['Low cost', 'Fast', 'CJK optimized', 'Character animation'],
    weaknesses: ['Limited documentation', 'Regional focus'],
    bestFor: ['Character animation', 'Asian content', 'High volume'],
    likes: 0,
    dislikes: 0,
    userRating: 3.9,
    recommendedPairings: ['alibaba_wanx_video', 'deepseek_video'],
    fallbackProviders: ['modelslab_svd', 'replicate'],
  },
  azure: {
    providerId: 'azure_video',
    providerName: 'Azure SVD',
    modelType: 'svd',
    qualityScore: 88,
    speedScore: 60,
    costScore: 55,
    reliabilityScore: 95,
    overallScore: 74,
    tier: 2,
    strengths: ['Enterprise ready', 'Compliance', 'SLA guarantees'],
    weaknesses: ['Higher cost', 'Setup complexity'],
    bestFor: ['Enterprise', 'Healthcare', 'Regulated industries'],
    likes: 0,
    dislikes: 0,
    userRating: 4.0,
    recommendedPairings: ['gemini_veo', 'modelslab_svd'],
    fallbackProviders: ['modelslab_svd', 'gemini_veo'],
  },
  deepseek: {
    providerId: 'deepseek_video',
    providerName: 'DeepSeek Video SVD',
    modelType: 'svd',
    qualityScore: 78,
    speedScore: 82,
    costScore: 98,
    reliabilityScore: 72,
    overallScore: 82,
    tier: 3,
    strengths: ['Cheapest option', 'Vision understanding', 'Technical content'],
    weaknesses: ['New model', 'Less established'],
    bestFor: ['Budget projects', 'Technical demos', 'Prototyping'],
    likes: 0,
    dislikes: 0,
    userRating: 3.4,
    recommendedPairings: ['alibaba_wan_animate', 'alibaba_wanx_video'],
    fallbackProviders: ['alibaba_wan_animate', 'modelslab_svd'],
  },
  google: {
    providerId: 'gemini_veo',
    providerName: 'Google Veo SVD',
    modelType: 'svd',
    qualityScore: 94,
    speedScore: 55,
    costScore: 45,
    reliabilityScore: 85,
    overallScore: 70,
    tier: 2,
    strengths: ['Premium quality', 'Longer videos', 'Google integration'],
    weaknesses: ['Higher cost', 'Limited API access'],
    bestFor: ['High-end production', 'Google Cloud workflows', 'Long-form'],
    likes: 0,
    dislikes: 0,
    userRating: 4.2,
    recommendedPairings: ['azure_video', 'modelslab_svd'],
    fallbackProviders: ['modelslab_svd', 'azure_video'],
  },
};

// =============================================================================
// RECOMMENDATION ENGINE
// =============================================================================

export interface RecommendationContext {
  industry?: string;
  contentType?: string;
  language?: string;
  budget?: 'low' | 'medium' | 'high';
  priority?: 'quality' | 'speed' | 'cost';
  duration?: number; // seconds
  targetAudience?: string;
  tier?: 1 | 2 | 3;
}

class VideoProviderRecommendationService {
  private feedbackCache: Map<string, { likes: number; dislikes: number }> = new Map();

  /**
   * Get recommendations for AnimateDiff across all providers
   */
  getAnimateDiffRecommendations(context: RecommendationContext): VideoRecommendation {
    return this.getRecommendations('animatediff', ANIMATEDIFF_PROVIDERS, context);
  }

  /**
   * Get recommendations for SVD across all providers
   */
  getSVDRecommendations(context: RecommendationContext): VideoRecommendation {
    return this.getRecommendations('svd', SVD_PROVIDERS, context);
  }

  /**
   * Get recommendations for any video model type
   */
  getRecommendations(
    modelType: VideoModelType,
    providers: Record<string, VideoProviderScore>,
    context: RecommendationContext
  ): VideoRecommendation {
    const scored = this.scoreProviders(Object.values(providers), context);
    const sorted = scored.sort((a, b) => b.contextScore - a.contextScore);
    
    const primary = sorted[0];
    const alternatives = sorted.slice(1, 4);
    
    return {
      primary: primary.provider,
      alternatives: alternatives.map(a => a.provider),
      reasoning: this.generateReasoning(primary.provider, context),
      pairingAdvice: this.generatePairingAdvice(primary.provider),
      contextScore: primary.contextScore,
    };
  }

  /**
   * Score providers based on context
   */
  private scoreProviders(
    providers: VideoProviderScore[],
    context: RecommendationContext
  ): Array<{ provider: VideoProviderScore; contextScore: number }> {
    return providers.map(provider => {
      let score = provider.overallScore;
      
      // Apply priority weighting
      if (context.priority === 'quality') {
        score = (provider.qualityScore * 0.5) + (provider.overallScore * 0.5);
      } else if (context.priority === 'speed') {
        score = (provider.speedScore * 0.5) + (provider.overallScore * 0.5);
      } else if (context.priority === 'cost') {
        score = (provider.costScore * 0.5) + (provider.overallScore * 0.5);
      }
      
      // Budget adjustments
      if (context.budget === 'low' && provider.costScore > 80) {
        score += 10;
      } else if (context.budget === 'high' && provider.qualityScore > 90) {
        score += 10;
      }
      
      // Language/region bonuses
      if (context.language?.startsWith('zh') || context.language?.startsWith('ja') || context.language?.startsWith('ko')) {
        if (provider.providerId.includes('alibaba') || provider.providerId.includes('deepseek')) {
          score += 15; // CJK bonus
        }
      }
      
      // Industry bonuses
      if (context.industry === 'healthcare' && provider.providerId === 'azure_video') {
        score += 20; // HIPAA compliance
      }
      if (context.industry === 'technology' && provider.providerId === 'deepseek_video') {
        score += 10; // Technical content
      }
      
      // Tier filtering
      if (context.tier && provider.tier > context.tier) {
        score -= 20; // Penalize providers above requested tier
      }
      
      // User feedback influence
      const feedback = this.feedbackCache.get(provider.providerId);
      if (feedback) {
        const ratio = feedback.likes / Math.max(1, feedback.likes + feedback.dislikes);
        score += (ratio - 0.5) * 10; // +/- 5 points based on feedback
      }
      
      return { provider, contextScore: Math.min(100, Math.max(0, score)) };
    });
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(provider: VideoProviderScore, context: RecommendationContext): string {
    const reasons: string[] = [];
    
    if (context.priority === 'quality' && provider.qualityScore >= 90) {
      reasons.push(`High quality output (${provider.qualityScore}/100)`);
    }
    if (context.priority === 'speed' && provider.speedScore >= 80) {
      reasons.push(`Fast processing (${provider.speedScore}/100)`);
    }
    if (context.priority === 'cost' && provider.costScore >= 85) {
      reasons.push(`Cost-effective (${provider.costScore}/100)`);
    }
    if (context.language?.startsWith('zh') && provider.bestFor.includes('Chinese content')) {
      reasons.push('Optimized for Chinese/CJK content');
    }
    if (provider.strengths.length > 0) {
      reasons.push(`Strengths: ${provider.strengths.slice(0, 2).join(', ')}`);
    }
    
    return reasons.length > 0 
      ? reasons.join('. ') + '.'
      : `${provider.providerName} is a reliable choice for ${provider.modelType} generation.`;
  }

  /**
   * Generate pairing advice
   */
  private generatePairingAdvice(provider: VideoProviderScore): string {
    const pairings = provider.recommendedPairings;
    if (pairings.length === 0) return 'No specific pairing recommendations.';
    
    return `Consider pairing with ${pairings.slice(0, 2).join(' or ')} for fallback and variety.`;
  }

  /**
   * Record user feedback (like/dislike)
   */
  recordFeedback(providerId: string, isLike: boolean): void {
    const current = this.feedbackCache.get(providerId) || { likes: 0, dislikes: 0 };
    if (isLike) {
      current.likes++;
    } else {
      current.dislikes++;
    }
    this.feedbackCache.set(providerId, current);
  }

  /**
   * Get all providers for a model type
   */
  getAllProviders(modelType: VideoModelType): VideoProviderScore[] {
    switch (modelType) {
      case 'animatediff':
        return Object.values(ANIMATEDIFF_PROVIDERS);
      case 'svd':
        return Object.values(SVD_PROVIDERS);
      default:
        return [...Object.values(ANIMATEDIFF_PROVIDERS), ...Object.values(SVD_PROVIDERS)];
    }
  }

  /**
   * Get provider comparison matrix
   */
  getComparisonMatrix(modelType: VideoModelType): {
    providers: VideoProviderScore[];
    metrics: Array<{
      metric: string;
      values: Record<string, number>;
    }>;
  } {
    const providers = this.getAllProviders(modelType);
    
    return {
      providers,
      metrics: [
        {
          metric: 'Quality',
          values: Object.fromEntries(providers.map(p => [p.providerId, p.qualityScore])),
        },
        {
          metric: 'Speed',
          values: Object.fromEntries(providers.map(p => [p.providerId, p.speedScore])),
        },
        {
          metric: 'Cost',
          values: Object.fromEntries(providers.map(p => [p.providerId, p.costScore])),
        },
        {
          metric: 'Reliability',
          values: Object.fromEntries(providers.map(p => [p.providerId, p.reliabilityScore])),
        },
        {
          metric: 'User Rating',
          values: Object.fromEntries(providers.map(p => [p.providerId, p.userRating * 20])), // Convert to 0-100
        },
      ],
    };
  }
}

export const videoProviderRecommendationService = new VideoProviderRecommendationService();
export default videoProviderRecommendationService;
