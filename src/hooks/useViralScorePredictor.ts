/**
 * useViralScorePredictor - Hook for AI-powered viral potential analysis
 * Wraps the viral-score-predictor edge function.
 *
 * Supports: predict, analyze_trends, optimize, benchmark
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Platform = 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'linkedin';

interface ContentInput {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  category?: string;
  hashtags?: string[];
}

export interface ViralScorePrediction {
  overallScore: number;
  breakdown: {
    titleScore: number;
    thumbnailScore: number;
    contentScore: number;
    timingScore: number;
    trendAlignment: number;
  };
  prediction: {
    estimatedViews: { low: number; mid: number; high: number };
    estimatedEngagement: number;
    viralProbability: number;
  };
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    score: number;
    recommendation?: string;
  }>;
}

export interface TrendAnalysis {
  currentTrends: Array<{
    trend: string;
    category: string;
    momentum: 'rising' | 'stable' | 'declining';
    relevanceScore: number;
    suggestedAngle: string;
  }>;
  trendingHashtags: string[];
  trendingFormats: string[];
  optimalPostingTimes: Array<{
    day: string;
    time: string;
    engagementMultiplier: number;
  }>;
}

export interface ContentOptimization {
  optimizedTitle: string;
  optimizedDescription: string;
  suggestedHashtags: string[];
  thumbnailSuggestions: string[];
  hookSuggestions: string[];
  ctaSuggestions: string[];
  improvementScore: number;
}

export interface BenchmarkResult {
  percentile: number;
  categoryAverage: number;
  topPerformers: Array<{
    title: string;
    views: number;
    engagement: number;
    whatWorked: string[];
  }>;
  gapsIdentified: string[];
  competitiveAdvantages: string[];
}

export function useViralScorePredictor() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrediction, setLastPrediction] = useState<ViralScorePrediction | null>(null);

  const invoke = useCallback(async (body: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await supabase.functions.invoke('viral-score-predictor', { body });
      if (apiError) throw apiError;
      return data;
    } catch (err: any) {
      const msg = err.message || 'Viral score prediction failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predictViralScore = useCallback(async (
    content: ContentInput,
    platform: Platform,
    targetAudience?: string
  ): Promise<ViralScorePrediction> => {
    const data = await invoke({ action: 'predict', content, platform, targetAudience });
    setLastPrediction(data);
    return data;
  }, [invoke]);

  const analyzeTrends = useCallback(async (
    platform: Platform,
    category?: string
  ): Promise<TrendAnalysis> => {
    const data = await invoke({ action: 'analyze_trends', content: { title: '', category }, platform });
    return data;
  }, [invoke]);

  const optimizeContent = useCallback(async (
    content: ContentInput,
    platform: Platform,
    targetAudience?: string
  ): Promise<ContentOptimization> => {
    const data = await invoke({ action: 'optimize', content, platform, targetAudience });
    return data;
  }, [invoke]);

  const benchmarkContent = useCallback(async (
    content: ContentInput,
    platform: Platform
  ): Promise<BenchmarkResult> => {
    const data = await invoke({ action: 'benchmark', content, platform });
    return data;
  }, [invoke]);

  return {
    predictViralScore,
    analyzeTrends,
    optimizeContent,
    benchmarkContent,
    lastPrediction,
    isLoading,
    error,
  };
}
