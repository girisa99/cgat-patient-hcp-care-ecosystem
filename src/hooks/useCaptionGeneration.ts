/**
 * useCaptionGeneration - P3-QW-02: AI Caption Generation
 * 
 * Features:
 * - Multi-platform caption generation
 * - Tone/style customization
 * - Hashtag suggestions
 * - Label Studio training integration
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLSUniversalOptional } from '@/components/label-studio/LSUniversalProvider';

// ============================================================================
// TYPES
// ============================================================================

export type CaptionTone = 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational' | 'promotional';
export type CaptionPlatform = 'youtube' | 'tiktok' | 'instagram' | 'linkedin' | 'twitter' | 'facebook';
export type CaptionLength = 'short' | 'medium' | 'long';

export interface CaptionConfig {
  title: string;
  description?: string;
  transcript?: string;
  keywords?: string[];
  tone: CaptionTone;
  platform: CaptionPlatform;
  length: CaptionLength;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  includeCTA?: boolean;
  ctaType?: 'subscribe' | 'follow' | 'link' | 'engage' | 'custom';
  customCTA?: string;
  brandVoice?: string;
}

export interface GeneratedCaption {
  id: string;
  platform: CaptionPlatform;
  caption: string;
  hashtags: string[];
  characterCount: number;
  wordCount: number;
  estimatedEngagement: number;
  tone: CaptionTone;
  hasCTA: boolean;
  hasEmojis: boolean;
}

export interface CaptionVariant {
  id: string;
  captions: GeneratedCaption[];
  generatedAt: string;
}

// Platform character limits
const PLATFORM_LIMITS: Record<CaptionPlatform, number> = {
  youtube: 5000,
  tiktok: 2200,
  instagram: 2200,
  linkedin: 3000,
  twitter: 280,
  facebook: 63206,
};

// ============================================================================
// HOOK
// ============================================================================

export function useCaptionGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<GeneratedCaption[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<GeneratedCaption | null>(null);
  
  const ls = useLSUniversalOptional();

  // Capture for Label Studio training
  const captureForTraining = useCallback((
    config: CaptionConfig,
    caption: GeneratedCaption,
    userAction: 'generated' | 'selected' | 'edited' | 'rejected',
    editedContent?: string
  ) => {
    if (!ls?.isEnabled) return;

    ls.captureData({
      type: 'content_generation',
      source: 'production',
      platform: 'desktop',
      data: {
        config: {
          tone: config.tone,
          platform: config.platform,
          length: config.length,
          includeHashtags: config.includeHashtags,
          includeEmojis: config.includeEmojis,
        },
        caption: {
          id: caption.id,
          characterCount: caption.characterCount,
          hashtagCount: caption.hashtags.length,
          estimatedEngagement: caption.estimatedEngagement,
        },
        userAction,
        editedContent: editedContent?.substring(0, 500),
        wasEdited: !!editedContent && editedContent !== caption.caption,
      },
      labels: {
        user_accepted: userAction === 'selected',
        required_editing: userAction === 'edited',
      },
    });
  }, [ls]);

  // Generate captions
  const generateCaptions = useCallback(async (
    config: CaptionConfig
  ): Promise<GeneratedCaption[] | null> => {
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-caption-generator', {
        body: {
          action: 'generate',
          ...config,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to generate captions');

      const captions: GeneratedCaption[] = data.captions || [];
      setGeneratedCaptions(captions);

      if (captions.length > 0) {
        setSelectedCaption(captions[0]);
        captureForTraining(config, captions[0], 'generated');
      }

      toast.success(`Generated ${captions.length} caption variants`);
      return captions;

    } catch (err) {
      console.error('Caption generation failed:', err);
      toast.error('Failed to generate captions');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [captureForTraining]);

  // Select a caption
  const selectCaption = useCallback((captionId: string, config?: CaptionConfig) => {
    const caption = generatedCaptions.find(c => c.id === captionId);
    if (caption) {
      setSelectedCaption(caption);
      if (config) {
        captureForTraining(config, caption, 'selected');
      }
      toast.success('Caption selected');
    }
  }, [generatedCaptions, captureForTraining]);

  // Edit and save caption
  const saveEditedCaption = useCallback((
    captionId: string,
    editedContent: string,
    config?: CaptionConfig
  ) => {
    const caption = generatedCaptions.find(c => c.id === captionId);
    if (caption && config) {
      captureForTraining(config, caption, 'edited', editedContent);
    }
  }, [generatedCaptions, captureForTraining]);

  // Get optimized caption for platform
  const optimizeForPlatform = useCallback(async (
    caption: string,
    targetPlatform: CaptionPlatform
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-caption-generator', {
        body: {
          action: 'optimize',
          caption,
          platform: targetPlatform,
          maxLength: PLATFORM_LIMITS[targetPlatform],
        },
      });

      if (error) throw error;
      return data.optimizedCaption || null;

    } catch (err) {
      console.error('Caption optimization failed:', err);
      return null;
    }
  }, []);

  // Suggest hashtags
  const suggestHashtags = useCallback(async (
    content: string,
    platform: CaptionPlatform,
    count: number = 10
  ): Promise<string[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-caption-generator', {
        body: {
          action: 'hashtags',
          content,
          platform,
          count,
        },
      });

      if (error) throw error;
      return data.hashtags || [];

    } catch (err) {
      console.error('Hashtag suggestion failed:', err);
      return [];
    }
  }, []);

  return {
    // State
    isGenerating,
    generatedCaptions,
    selectedCaption,
    
    // Actions
    generateCaptions,
    selectCaption,
    saveEditedCaption,
    optimizeForPlatform,
    suggestHashtags,
    
    // Constants
    platformLimits: PLATFORM_LIMITS,
  };
}

export default useCaptionGeneration;
