/**
 * useVibeThumbnails - Generate and manage thumbnails for Vibe recordings
 * 
 * Uses auto-thumbnail-generator edge function for:
 * - Extracting best frames from videos
 * - AI-powered thumbnail generation
 * - Platform-specific thumbnail optimization
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ThumbnailStyle = 'youtube' | 'tiktok' | 'instagram' | 'podcast' | 'webinar' | 'custom';

export interface ThumbnailSuggestion {
  timestamp: number;
  score: number;
  reason: string;
}

export interface GeneratedThumbnail {
  thumbnailUrl: string;
  prompt: string;
  style: ThumbnailStyle;
  dimensions: { width: number; height: number };
}

export interface ThumbnailAnalysis {
  suggestions: ThumbnailSuggestion[];
  recommendedStyle: ThumbnailStyle;
  colorPalette: string[];
}

interface UseVibeThumbnailsReturn {
  isGenerating: boolean;
  isAnalyzing: boolean;
  lastThumbnail: GeneratedThumbnail | null;
  analysis: ThumbnailAnalysis | null;
  
  // Actions
  generateThumbnail: (options: {
    title?: string;
    description?: string;
    style?: ThumbnailStyle;
    videoUrl?: string;
    customPrompt?: string;
    branding?: {
      logoUrl?: string;
      primaryColor?: string;
      overlayText?: string;
    };
  }) => Promise<GeneratedThumbnail | null>;
  
  analyzeForThumbnail: (options: {
    title?: string;
    description?: string;
    style?: ThumbnailStyle;
    videoUrl?: string;
  }) => Promise<ThumbnailAnalysis | null>;
  
  extractBestFrame: (options: {
    videoUrl: string;
    timestamp?: number;
  }) => Promise<{ frameUrl: string; timestamp: number; quality: number } | null>;
  
  captureFrameFromVideo: (videoElement: HTMLVideoElement) => Promise<string | null>;
}

/**
 * Capture a frame from a video element as base64 image
 */
export function captureVideoFrame(video: HTMLVideoElement, quality = 0.92): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  } catch (err) {
    console.error('Failed to capture video frame:', err);
    return null;
  }
}

/**
 * Get best frame timestamp suggestion for a video (using heuristics)
 * Videos typically have good thumbnails at 10-30% of their duration
 */
export function suggestFrameTimestamp(durationSeconds: number): number {
  // For short videos (< 30s), use around 25%
  // For longer videos, use around 15%
  const percentage = durationSeconds < 30 ? 0.25 : 0.15;
  return Math.floor(durationSeconds * percentage);
}

export function useVibeThumbnails(): UseVibeThumbnailsReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastThumbnail, setLastThumbnail] = useState<GeneratedThumbnail | null>(null);
  const [analysis, setAnalysis] = useState<ThumbnailAnalysis | null>(null);

  const generateThumbnail = useCallback(async (options: {
    title?: string;
    description?: string;
    style?: ThumbnailStyle;
    videoUrl?: string;
    customPrompt?: string;
    branding?: {
      logoUrl?: string;
      primaryColor?: string;
      overlayText?: string;
    };
  }): Promise<GeneratedThumbnail | null> => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('auto-thumbnail-generator', {
        body: {
          action: 'generate',
          title: options.title,
          description: options.description,
          style: options.style || 'youtube',
          videoUrl: options.videoUrl,
          customPrompt: options.customPrompt,
          branding: options.branding,
        },
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate thumbnail');
      }

      const thumbnail: GeneratedThumbnail = {
        thumbnailUrl: data.thumbnailUrl,
        prompt: data.prompt,
        style: data.style,
        dimensions: data.dimensions,
      };
      
      setLastThumbnail(thumbnail);
      return thumbnail;
    } catch (err) {
      console.error('Thumbnail generation failed:', err);
      toast.error('Failed to generate thumbnail');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const analyzeForThumbnail = useCallback(async (options: {
    title?: string;
    description?: string;
    style?: ThumbnailStyle;
    videoUrl?: string;
  }): Promise<ThumbnailAnalysis | null> => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('auto-thumbnail-generator', {
        body: {
          action: 'analyze',
          title: options.title,
          description: options.description,
          style: options.style,
          videoUrl: options.videoUrl,
        },
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze for thumbnail');
      }

      const result: ThumbnailAnalysis = {
        suggestions: data.suggestions,
        recommendedStyle: data.recommendedStyle,
        colorPalette: data.colorPalette,
      };
      
      setAnalysis(result);
      return result;
    } catch (err) {
      console.error('Thumbnail analysis failed:', err);
      toast.error('Failed to analyze content');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const extractBestFrame = useCallback(async (options: {
    videoUrl: string;
    timestamp?: number;
  }): Promise<{ frameUrl: string; timestamp: number; quality: number } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('auto-thumbnail-generator', {
        body: {
          action: 'extract_frame',
          videoUrl: options.videoUrl,
          frameTimestamp: options.timestamp,
        },
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to extract frame');
      }

      return {
        frameUrl: data.frameUrl,
        timestamp: data.timestamp,
        quality: data.quality,
      };
    } catch (err) {
      console.error('Frame extraction failed:', err);
      toast.error('Failed to extract video frame');
      return null;
    }
  }, []);

  const captureFrameFromVideo = useCallback(async (videoElement: HTMLVideoElement): Promise<string | null> => {
    return captureVideoFrame(videoElement);
  }, []);

  return {
    isGenerating,
    isAnalyzing,
    lastThumbnail,
    analysis,
    generateThumbnail,
    analyzeForThumbnail,
    extractBestFrame,
    captureFrameFromVideo,
  };
}
