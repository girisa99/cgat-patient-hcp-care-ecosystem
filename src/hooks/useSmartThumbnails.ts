/**
 * useSmartThumbnails - P3 Smart Thumbnail Generation with Label Studio Integration
 * 
 * Enhanced thumbnail generation with:
 * - AI-powered thumbnail suggestions
 * - A/B testing variants
 * - Label Studio training data capture
 * - Platform-specific optimization
 * - Performance prediction
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLSUniversalOptional } from '@/components/label-studio/LSUniversalProvider';
import { useVibeThumbnails, ThumbnailStyle, GeneratedThumbnail, ThumbnailAnalysis } from './useVibeThumbnails';

// ============================================================================
// TYPES
// ============================================================================

export interface SmartThumbnailVariant {
  id: string;
  thumbnailUrl: string;
  style: ThumbnailStyle;
  prompt: string;
  dimensions: { width: number; height: number };
  predictedCTR: number;
  confidenceScore: number;
  features: {
    hasFace: boolean;
    hasText: boolean;
    hasEmoji: boolean;
    primaryColors: string[];
    emotionalTone: 'excited' | 'curious' | 'professional' | 'casual' | 'dramatic';
  };
  platformOptimization: {
    platform: 'youtube' | 'tiktok' | 'instagram' | 'linkedin' | 'twitter';
    score: number;
    recommendations: string[];
  }[];
}

export interface ThumbnailABTest {
  id: string;
  variants: SmartThumbnailVariant[];
  selectedVariantId: string | null;
  startedAt: string;
  completedAt: string | null;
  metrics: {
    impressions: Record<string, number>;
    clicks: Record<string, number>;
    ctr: Record<string, number>;
  };
}

export interface SmartThumbnailConfig {
  title: string;
  description?: string;
  videoUrl?: string;
  targetPlatforms: ('youtube' | 'tiktok' | 'instagram' | 'linkedin' | 'twitter')[];
  style?: ThumbnailStyle;
  generateVariants?: number;
  enableABTest?: boolean;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    overlayText?: string;
    fontFamily?: string;
  };
  contentAnalysis?: {
    transcript?: string;
    keyMoments?: { timestamp: number; description: string }[];
    emotions?: string[];
  };
}

export interface SmartThumbnailResult {
  variants: SmartThumbnailVariant[];
  bestVariant: SmartThumbnailVariant;
  analysis: ThumbnailAnalysis | null;
  abTest?: ThumbnailABTest;
  generationTime: number;
}

// ============================================================================
// HOOK
// ============================================================================

export function useSmartThumbnails() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<SmartThumbnailVariant[]>([]);
  const [activeABTest, setActiveABTest] = useState<ThumbnailABTest | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<SmartThumbnailVariant | null>(null);
  
  const ls = useLSUniversalOptional();
  const baseThumbnails = useVibeThumbnails();
  const generationStartTime = useRef<number>(0);

  // Capture thumbnail generation for Label Studio training
  const captureForTraining = useCallback((
    config: SmartThumbnailConfig,
    result: SmartThumbnailResult,
    userSelection?: string
  ) => {
    if (!ls?.isEnabled) return;

    ls.captureData({
      type: 'thumbnail_quality',
      source: 'production',
      platform: 'desktop',
      data: {
        config: {
          title: config.title,
          platforms: config.targetPlatforms,
          style: config.style,
          variantCount: config.generateVariants,
        },
        variants: result.variants.map(v => ({
          id: v.id,
          style: v.style,
          predictedCTR: v.predictedCTR,
          features: v.features,
        })),
        bestVariantId: result.bestVariant.id,
        userSelectedId: userSelection,
        generationTimeMs: result.generationTime,
        matchedPrediction: userSelection === result.bestVariant.id,
      },
      labels: userSelection ? {
        user_selection_matches_prediction: userSelection === result.bestVariant.id,
      } : undefined,
    });
  }, [ls]);

  // Capture A/B test results for training
  const captureABTestResult = useCallback((
    test: ThumbnailABTest,
    winningVariantId: string
  ) => {
    if (!ls?.isEnabled) return;

    ls.captureData({
      type: 'thumbnail_quality',
      source: 'production',
      platform: 'desktop',
      data: {
        category: 'ab_test_results',
        testId: test.id,
        variantCount: test.variants.length,
        metrics: test.metrics,
        winningVariantId,
        variants: test.variants.map(v => ({
          id: v.id,
          predictedCTR: v.predictedCTR,
          actualCTR: test.metrics.ctr[v.id] || 0,
          predictionAccuracy: 1 - Math.abs((v.predictedCTR - (test.metrics.ctr[v.id] || 0)) / v.predictedCTR),
        })),
      },
      labels: {
        prediction_accurate: test.variants.find(v => v.id === winningVariantId)?.id === 
          test.variants.sort((a, b) => b.predictedCTR - a.predictedCTR)[0]?.id,
      },
    });
  }, [ls]);

  // Generate smart thumbnails with variants
  const generateSmartThumbnails = useCallback(async (
    config: SmartThumbnailConfig
  ): Promise<SmartThumbnailResult | null> => {
    setIsGenerating(true);
    generationStartTime.current = Date.now();

    try {
      const variantCount = config.generateVariants || 3;
      const generatedVariants: SmartThumbnailVariant[] = [];

      // Generate multiple variants in parallel
      const generateVariant = async (
        index: number,
        style: ThumbnailStyle
      ): Promise<SmartThumbnailVariant | null> => {
        const result = await baseThumbnails.generateThumbnail({
          title: config.title,
          description: config.description,
          style,
          videoUrl: config.videoUrl,
          branding: config.branding,
        });

        if (!result) return null;

        // Simulate AI analysis for variant features
        const features = analyzeVariantFeatures(config, style, index);
        const platformScores = analyzePlatformOptimization(style, config.targetPlatforms);

        return {
          id: `variant-${Date.now()}-${index}`,
          thumbnailUrl: result.thumbnailUrl,
          style: result.style,
          prompt: result.prompt,
          dimensions: result.dimensions,
          predictedCTR: calculatePredictedCTR(features, platformScores),
          confidenceScore: 0.7 + Math.random() * 0.25,
          features,
          platformOptimization: platformScores,
        };
      };

      // Determine styles to generate
      const stylesToGenerate: ThumbnailStyle[] = [];
      if (config.style) {
        stylesToGenerate.push(config.style);
      }
      
      // Add platform-specific styles
      config.targetPlatforms.forEach(platform => {
        const mappedStyle = mapPlatformToStyle(platform);
        if (!stylesToGenerate.includes(mappedStyle)) {
          stylesToGenerate.push(mappedStyle);
        }
      });

      // Fill remaining with variations
      while (stylesToGenerate.length < variantCount) {
        stylesToGenerate.push(stylesToGenerate[0] || 'youtube');
      }

      // Generate variants in parallel
      const variantPromises = stylesToGenerate
        .slice(0, variantCount)
        .map((style, index) => generateVariant(index, style));

      const results = await Promise.all(variantPromises);
      results.forEach(v => {
        if (v) generatedVariants.push(v);
      });

      if (generatedVariants.length === 0) {
        throw new Error('Failed to generate any thumbnail variants');
      }

      // Sort by predicted CTR
      generatedVariants.sort((a, b) => b.predictedCTR - a.predictedCTR);

      // Get analysis
      const analysis = await baseThumbnails.analyzeForThumbnail({
        title: config.title,
        description: config.description,
        style: config.style,
        videoUrl: config.videoUrl,
      });

      const generationTime = Date.now() - generationStartTime.current;

      // Create A/B test if enabled
      let abTest: ThumbnailABTest | undefined;
      if (config.enableABTest && generatedVariants.length > 1) {
        abTest = {
          id: `ab-test-${Date.now()}`,
          variants: generatedVariants,
          selectedVariantId: null,
          startedAt: new Date().toISOString(),
          completedAt: null,
          metrics: {
            impressions: {},
            clicks: {},
            ctr: {},
          },
        };
        setActiveABTest(abTest);
      }

      const result: SmartThumbnailResult = {
        variants: generatedVariants,
        bestVariant: generatedVariants[0],
        analysis,
        abTest,
        generationTime,
      };

      setVariants(generatedVariants);
      setSelectedVariant(generatedVariants[0]);

      // Capture for training
      captureForTraining(config, result);

      toast.success(`Generated ${generatedVariants.length} thumbnail variants`);
      return result;

    } catch (err) {
      console.error('Smart thumbnail generation failed:', err);
      toast.error('Failed to generate smart thumbnails');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [baseThumbnails, captureForTraining]);

  // Select a variant (captures for training)
  const selectVariant = useCallback((variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      
      // Capture selection for training
      if (ls?.isEnabled && variants.length > 0) {
        const bestPredicted = [...variants].sort((a, b) => b.predictedCTR - a.predictedCTR)[0];
        
        ls.captureData({
          type: 'thumbnail_quality',
          source: 'production',
          platform: 'desktop',
          data: {
            variantId,
            wasTopPrediction: variant.id === bestPredicted.id,
            selectedPredictedCTR: variant.predictedCTR,
            topPredictedCTR: bestPredicted.predictedCTR,
            variantRank: variants.findIndex(v => v.id === variantId) + 1,
            totalVariants: variants.length,
          },
          labels: {
            user_selected_top_prediction: variant.id === bestPredicted.id,
          },
        });
      }

      toast.success('Thumbnail selected');
    }
  }, [variants, ls]);

  // Complete A/B test with metrics
  const completeABTest = useCallback((
    testId: string,
    metrics: ThumbnailABTest['metrics'],
    winningVariantId: string
  ) => {
    if (!activeABTest || activeABTest.id !== testId) return;

    const completedTest: ThumbnailABTest = {
      ...activeABTest,
      selectedVariantId: winningVariantId,
      completedAt: new Date().toISOString(),
      metrics,
    };

    setActiveABTest(completedTest);
    captureABTestResult(completedTest, winningVariantId);

    toast.success('A/B test completed');
  }, [activeABTest, captureABTestResult]);

  // Get variant recommendations for a platform
  const getRecommendationsForPlatform = useCallback((
    variantId: string,
    platform: 'youtube' | 'tiktok' | 'instagram' | 'linkedin' | 'twitter'
  ): string[] => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return [];

    const platformOpt = variant.platformOptimization.find(p => p.platform === platform);
    return platformOpt?.recommendations || [];
  }, [variants]);

  return {
    // State
    isGenerating,
    variants,
    selectedVariant,
    activeABTest,
    
    // Actions
    generateSmartThumbnails,
    selectVariant,
    completeABTest,
    getRecommendationsForPlatform,
    
    // Base thumbnail actions
    ...baseThumbnails,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapPlatformToStyle(
  platform: 'youtube' | 'tiktok' | 'instagram' | 'linkedin' | 'twitter'
): ThumbnailStyle {
  const mapping: Record<string, ThumbnailStyle> = {
    youtube: 'youtube',
    tiktok: 'tiktok',
    instagram: 'instagram',
    linkedin: 'webinar',
    twitter: 'custom',
  };
  return mapping[platform] || 'youtube';
}

function analyzeVariantFeatures(
  config: SmartThumbnailConfig,
  style: ThumbnailStyle,
  variantIndex: number
): SmartThumbnailVariant['features'] {
  // Simulate AI feature detection
  const emotions: SmartThumbnailVariant['features']['emotionalTone'][] = 
    ['excited', 'curious', 'professional', 'casual', 'dramatic'];
  
  const colorPalettes = [
    ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    ['#6C5CE7', '#A29BFE', '#FD79A8'],
    ['#00B894', '#00CEC9', '#0984E3'],
    ['#FDCB6E', '#E17055', '#D63031'],
    ['#2D3436', '#636E72', '#B2BEC3'],
  ];

  return {
    hasFace: Math.random() > 0.3,
    hasText: config.branding?.overlayText ? true : Math.random() > 0.5,
    hasEmoji: style === 'tiktok' || style === 'instagram' ? Math.random() > 0.4 : Math.random() > 0.7,
    primaryColors: colorPalettes[variantIndex % colorPalettes.length],
    emotionalTone: emotions[variantIndex % emotions.length],
  };
}

function analyzePlatformOptimization(
  style: ThumbnailStyle,
  targetPlatforms: SmartThumbnailConfig['targetPlatforms']
): SmartThumbnailVariant['platformOptimization'] {
  return targetPlatforms.map(platform => {
    const baseScore = style === mapPlatformToStyle(platform) ? 85 : 60;
    const score = Math.min(100, baseScore + Math.floor(Math.random() * 15));
    
    const recommendations = getRecommendationsForStyle(style, platform);
    
    return {
      platform,
      score,
      recommendations,
    };
  });
}

function getRecommendationsForStyle(
  style: ThumbnailStyle,
  platform: 'youtube' | 'tiktok' | 'instagram' | 'linkedin' | 'twitter'
): string[] {
  const recommendations: Record<string, Record<string, string[]>> = {
    youtube: {
      youtube: ['Great match! Consider adding bold text overlay', 'Use contrasting colors for text'],
      tiktok: ['Crop to vertical 9:16 for TikTok', 'Add trendy filters'],
      instagram: ['Ensure readable at small sizes', 'Consider carousel version'],
      linkedin: ['Add professional context', 'Include your logo'],
      twitter: ['Optimize for timeline preview', 'Keep text minimal'],
    },
    tiktok: {
      youtube: ['Expand to horizontal 16:9', 'Add more context text'],
      tiktok: ['Perfect fit! Consider trending stickers', 'Add motion elements'],
      instagram: ['Works well for Stories', 'Adjust for Reels'],
      linkedin: ['May appear too casual', 'Consider professional variant'],
      twitter: ['Good for engagement', 'Crop for timeline'],
    },
    instagram: {
      youtube: ['Expand to landscape', 'Add title text'],
      tiktok: ['Already mobile-friendly', 'Add trending audio cue'],
      instagram: ['Optimized! Check grid preview', 'Consider filter consistency'],
      linkedin: ['Add professional messaging', 'Consider thought leadership angle'],
      twitter: ['Works well! Keep it visual', 'Add subtle branding'],
    },
  };

  return recommendations[style]?.[platform] || ['Optimize dimensions for platform', 'Add platform-specific elements'];
}

function calculatePredictedCTR(
  features: SmartThumbnailVariant['features'],
  platformScores: SmartThumbnailVariant['platformOptimization']
): number {
  let baseCTR = 3.0; // Base CTR percentage

  // Feature boosts
  if (features.hasFace) baseCTR += 1.5;
  if (features.hasText) baseCTR += 0.8;
  if (features.hasEmoji) baseCTR += 0.5;
  
  // Emotional tone boosts
  const emotionBoosts: Record<string, number> = {
    excited: 1.2,
    curious: 1.0,
    dramatic: 0.8,
    casual: 0.5,
    professional: 0.3,
  };
  baseCTR += emotionBoosts[features.emotionalTone] || 0;

  // Platform optimization average
  const avgPlatformScore = platformScores.reduce((sum, p) => sum + p.score, 0) / platformScores.length;
  baseCTR *= (avgPlatformScore / 100);

  // Add some variance
  baseCTR += (Math.random() - 0.5) * 0.5;

  return Math.max(1, Math.min(15, baseCTR));
}

export default useSmartThumbnails;
