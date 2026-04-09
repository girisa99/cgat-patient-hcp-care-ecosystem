/**
 * MAGIC CLIPS HOOK
 * 
 * Generates platform-specific short-form clips from source videos.
 * Used across Vibe, Deck, and Production Hub for social distribution.
 * 
 * Features:
 * - Auto-generates 15s/30s/60s clips per platform
 * - Supports all major social platforms (YouTube, LinkedIn, TikTok, Instagram, Facebook, X)
 * - Integrates with RunPod FFmpeg for timeline-based editing
 * - Tracks credit consumption per generation
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

// Platform specifications for clip generation
export const PLATFORM_SPECS = {
  youtube_shorts: {
    id: 'youtube_shorts',
    name: 'YouTube Shorts',
    aspectRatio: '9:16',
    maxDuration: 60,
    recommendedDuration: 45,
    dimensions: { width: 1080, height: 1920 },
    icon: '📺',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    aspectRatio: '16:9',
    maxDuration: 120,
    recommendedDuration: 60,
    dimensions: { width: 1920, height: 1080 },
    icon: '💼',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    aspectRatio: '9:16',
    maxDuration: 60,
    recommendedDuration: 30,
    dimensions: { width: 1080, height: 1920 },
    icon: '🎵',
  },
  instagram_reels: {
    id: 'instagram_reels',
    name: 'Instagram Reels',
    aspectRatio: '9:16',
    maxDuration: 90,
    recommendedDuration: 30,
    dimensions: { width: 1080, height: 1920 },
    icon: '📸',
  },
  facebook_reels: {
    id: 'facebook_reels',
    name: 'Facebook Reels',
    aspectRatio: '9:16',
    maxDuration: 90,
    recommendedDuration: 30,
    dimensions: { width: 1080, height: 1920 },
    icon: '👥',
  },
  x_video: {
    id: 'x_video',
    name: 'X (Twitter)',
    aspectRatio: '16:9',
    maxDuration: 140,
    recommendedDuration: 45,
    dimensions: { width: 1280, height: 720 },
    icon: '🐦',
  },
} as const;

export type PlatformId = keyof typeof PLATFORM_SPECS;

export interface MagicClipRequest {
  sourceVideoUrl: string;
  platform: PlatformId;
  language: string;
  title?: string;
  startTime?: number; // optional: specify start point in seconds
  endTime?: number;   // optional: specify end point
  includeSubtitles?: boolean;
  subtitleLanguage?: string;
}

export interface MagicClipResult {
  platform: PlatformId;
  clipUrl: string;
  thumbnailUrl?: string;
  duration: number;
  status: 'completed' | 'pending' | 'failed';
  error?: string;
}

export interface MagicClipsState {
  isGenerating: boolean;
  progress: number;
  currentPlatform: PlatformId | null;
  results: MagicClipResult[];
  errors: string[];
}

/**
 * Hook for generating magic clips for social platforms
 */
export const useMagicClips = () => {
  const { showSuccess, showError } = useMasterToast();
  
  const [state, setState] = useState<MagicClipsState>({
    isGenerating: false,
    progress: 0,
    currentPlatform: null,
    results: [],
    errors: [],
  });

  /**
   * Generate a single clip for a specific platform
   */
  const generateClip = useCallback(async (request: MagicClipRequest): Promise<MagicClipResult | null> => {
    const platform = PLATFORM_SPECS[request.platform];
    
    setState(prev => ({
      ...prev,
      isGenerating: true,
      currentPlatform: request.platform,
    }));

    try {
      const { data, error } = await supabase.functions.invoke('magic-clips-generator', {
        body: {
          sourceVideoUrl: request.sourceVideoUrl,
          platform: request.platform,
          language: request.language,
          title: request.title,
          startTime: request.startTime,
          endTime: request.endTime,
          includeSubtitles: request.includeSubtitles ?? true,
          subtitleLanguage: request.subtitleLanguage || request.language,
          aspectRatio: platform.aspectRatio,
          dimensions: platform.dimensions,
          maxDuration: platform.maxDuration,
        },
      });

      if (error) throw new Error(error.message);

      const result: MagicClipResult = {
        platform: request.platform,
        clipUrl: data?.clipUrl || '',
        thumbnailUrl: data?.thumbnailUrl,
        duration: data?.duration || platform.recommendedDuration,
        status: data?.pending ? 'pending' : 'completed',
      };

      setState(prev => ({
        ...prev,
        results: [...prev.results, result],
      }));

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Clip generation failed';
      setState(prev => ({
        ...prev,
        errors: [...prev.errors, `${platform.name}: ${errorMsg}`],
      }));
      return null;
    }
  }, []);

  /**
   * Generate clips for multiple platforms at once
   */
  const generateBatchClips = useCallback(async (
    sourceVideoUrl: string,
    platforms: PlatformId[],
    language: string,
    title?: string
  ): Promise<MagicClipResult[]> => {
    setState({
      isGenerating: true,
      progress: 0,
      currentPlatform: null,
      results: [],
      errors: [],
    });

    const results: MagicClipResult[] = [];
    
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      setState(prev => ({
        ...prev,
        progress: Math.round((i / platforms.length) * 100),
        currentPlatform: platform,
      }));

      const result = await generateClip({
        sourceVideoUrl,
        platform,
        language,
        title,
      });

      if (result) {
        results.push(result);
      }
    }

    setState(prev => ({
      ...prev,
      isGenerating: false,
      progress: 100,
      currentPlatform: null,
    }));

    const successCount = results.filter(r => r.status === 'completed').length;
    if (successCount > 0) {
      showSuccess(`Generated ${successCount} magic clip${successCount > 1 ? 's' : ''}`);
    }

    return results;
  }, [generateClip, showSuccess]);

  /**
   * Generate clips for ALL platforms at once
   */
  const generateAllPlatformClips = useCallback(async (
    sourceVideoUrl: string,
    language: string,
    title?: string
  ): Promise<MagicClipResult[]> => {
    const allPlatforms = Object.keys(PLATFORM_SPECS) as PlatformId[];
    return generateBatchClips(sourceVideoUrl, allPlatforms, language, title);
  }, [generateBatchClips]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      progress: 0,
      currentPlatform: null,
      results: [],
      errors: [],
    });
  }, []);

  return {
    // State
    isGenerating: state.isGenerating,
    progress: state.progress,
    currentPlatform: state.currentPlatform,
    results: state.results,
    errors: state.errors,
    
    // Actions
    generateClip,
    generateBatchClips,
    generateAllPlatformClips,
    reset,
    
    // Constants
    PLATFORM_SPECS,
  };
};

export default useMagicClips;
