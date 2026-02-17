/**
 * Video Provider Recommendation Hook
 * 
 * React hook for accessing video provider recommendations with
 * scoring, feedback, and context-aware suggestions.
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  videoProviderRecommendationService,
  VideoModelType,
  VideoProviderScore,
  VideoRecommendation,
  RecommendationContext,
  ANIMATEDIFF_PROVIDERS,
  SVD_PROVIDERS,
} from '@/services/media/videoProviderRecommendationService';
import { toast } from 'sonner';

export interface UseVideoRecommendationsResult {
  // Recommendations
  getAnimateDiffRecommendations: (context?: RecommendationContext) => VideoRecommendation;
  getSVDRecommendations: (context?: RecommendationContext) => VideoRecommendation;
  getRecommendationsForModel: (modelType: VideoModelType, context?: RecommendationContext) => VideoRecommendation;
  
  // All providers
  animatediffProviders: VideoProviderScore[];
  svdProviders: VideoProviderScore[];
  getAllProviders: (modelType: VideoModelType) => VideoProviderScore[];
  
  // Comparison
  getComparisonMatrix: (modelType: VideoModelType) => {
    providers: VideoProviderScore[];
    metrics: Array<{ metric: string; values: Record<string, number> }>;
  };
  
  // Feedback
  recordLike: (providerId: string) => void;
  recordDislike: (providerId: string) => void;
  feedbackStats: Map<string, { likes: number; dislikes: number }>;
  
  // Pairing suggestions
  getPairingAdvice: (providerId: string) => string[];
  getFallbackChain: (providerId: string) => string[];
}

export function useVideoRecommendations(): UseVideoRecommendationsResult {
  const [feedbackStats, setFeedbackStats] = useState<Map<string, { likes: number; dislikes: number }>>(new Map());

  // Memoized provider lists
  const animatediffProviders = useMemo(() => Object.values(ANIMATEDIFF_PROVIDERS), []);
  const svdProviders = useMemo(() => Object.values(SVD_PROVIDERS), []);

  // Get recommendations
  const getAnimateDiffRecommendations = useCallback((context: RecommendationContext = {}) => {
    return videoProviderRecommendationService.getAnimateDiffRecommendations(context);
  }, []);

  const getSVDRecommendations = useCallback((context: RecommendationContext = {}) => {
    return videoProviderRecommendationService.getSVDRecommendations(context);
  }, []);

  const getRecommendationsForModel = useCallback((modelType: VideoModelType, context: RecommendationContext = {}) => {
    switch (modelType) {
      case 'animatediff':
        return getAnimateDiffRecommendations(context);
      case 'svd':
        return getSVDRecommendations(context);
      default:
        return getAnimateDiffRecommendations(context);
    }
  }, [getAnimateDiffRecommendations, getSVDRecommendations]);

  // Get all providers
  const getAllProviders = useCallback((modelType: VideoModelType) => {
    return videoProviderRecommendationService.getAllProviders(modelType);
  }, []);

  // Comparison matrix
  const getComparisonMatrix = useCallback((modelType: VideoModelType) => {
    return videoProviderRecommendationService.getComparisonMatrix(modelType);
  }, []);

  // Feedback handlers
  const recordLike = useCallback((providerId: string) => {
    videoProviderRecommendationService.recordFeedback(providerId, true);
    setFeedbackStats(prev => {
      const next = new Map(prev);
      const current = next.get(providerId) || { likes: 0, dislikes: 0 };
      next.set(providerId, { ...current, likes: current.likes + 1 });
      return next;
    });
    toast.success('Thanks for your feedback! 👍');
  }, []);

  const recordDislike = useCallback((providerId: string) => {
    videoProviderRecommendationService.recordFeedback(providerId, false);
    setFeedbackStats(prev => {
      const next = new Map(prev);
      const current = next.get(providerId) || { likes: 0, dislikes: 0 };
      next.set(providerId, { ...current, dislikes: current.dislikes + 1 });
      return next;
    });
    toast.info('Feedback recorded. We\'ll improve our recommendations.');
  }, []);

  // Pairing advice
  const getPairingAdvice = useCallback((providerId: string): string[] => {
    const allProviders = [...animatediffProviders, ...svdProviders];
    const provider = allProviders.find(p => p.providerId === providerId);
    return provider?.recommendedPairings || [];
  }, [animatediffProviders, svdProviders]);

  // Fallback chain
  const getFallbackChain = useCallback((providerId: string): string[] => {
    const allProviders = [...animatediffProviders, ...svdProviders];
    const provider = allProviders.find(p => p.providerId === providerId);
    return provider?.fallbackProviders || [];
  }, [animatediffProviders, svdProviders]);

  return {
    getAnimateDiffRecommendations,
    getSVDRecommendations,
    getRecommendationsForModel,
    animatediffProviders,
    svdProviders,
    getAllProviders,
    getComparisonMatrix,
    recordLike,
    recordDislike,
    feedbackStats,
    getPairingAdvice,
    getFallbackChain,
  };
}

export default useVideoRecommendations;
