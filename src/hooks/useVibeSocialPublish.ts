/**
 * useVibeSocialPublish - Social media publishing for Vibe recordings
 * 
 * Uses social-publish edge function with n8n webhook support
 * Supports: YouTube, TikTok, Instagram, Twitter/X, LinkedIn, Facebook
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { VibeRecording } from './useVibeRecordingPersistence';

export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'linkedin' | 'facebook';
export type ContentType = 'video' | 'image' | 'text' | 'carousel';

export interface SocialPublishOptions {
  platform: SocialPlatform;
  caption: string;
  hashtags?: string[];
  scheduledAt?: string; // ISO date string for scheduled posts
  visibility?: 'public' | 'private' | 'unlisted';
  metadata?: {
    title?: string;
    description?: string;
    categoryId?: string;
    tags?: string[];
  };
}

export interface PublishResult {
  success: boolean;
  platform: SocialPlatform;
  postId?: string;
  postUrl?: string;
  status: 'published' | 'scheduled' | 'failed';
  scheduledAt?: string;
  publishedAt?: string;
  error?: string;
}

export interface N8nWebhookConfig {
  webhookUrl: string;
  enabled: boolean;
}

interface UseVibeSocialPublishReturn {
  isPublishing: boolean;
  publishResults: PublishResult[];
  n8nConfig: N8nWebhookConfig | null;
  
  // Publish to a single platform
  publishTo: (
    recording: VibeRecording,
    options: SocialPublishOptions
  ) => Promise<PublishResult>;
  
  // Publish to multiple platforms at once
  publishToMultiple: (
    recording: VibeRecording,
    platforms: SocialPublishOptions[]
  ) => Promise<PublishResult[]>;
  
  // Configure n8n webhook for custom automation
  setN8nWebhook: (config: N8nWebhookConfig) => void;
  
  // Trigger n8n workflow with recording data
  triggerN8nWorkflow: (recording: VibeRecording, additionalData?: Record<string, unknown>) => Promise<boolean>;
  
  // Get suggested hashtags for a recording
  suggestHashtags: (title: string, description?: string) => string[];
  
  // Get platform-specific character limits
  getCharacterLimit: (platform: SocialPlatform) => number;
}

// Platform character limits for captions
const PLATFORM_LIMITS: Record<SocialPlatform, number> = {
  youtube: 5000,
  tiktok: 2200,
  instagram: 2200,
  twitter: 280,
  linkedin: 3000,
  facebook: 63206,
};

// Common hashtags for different content types
const CONTENT_HASHTAGS: Record<string, string[]> = {
  video: ['#video', '#content', '#creator'],
  podcast: ['#podcast', '#audio', '#episode'],
  tutorial: ['#tutorial', '#howto', '#learn'],
  interview: ['#interview', '#conversation', '#guests'],
  healthcare: ['#healthcare', '#health', '#wellness', '#medical'],
};

export function useVibeSocialPublish(): UseVibeSocialPublishReturn {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<PublishResult[]>([]);
  const [n8nConfig, setN8nConfigState] = useState<N8nWebhookConfig | null>(null);

  const publishTo = useCallback(async (
    recording: VibeRecording,
    options: SocialPublishOptions
  ): Promise<PublishResult> => {
    setIsPublishing(true);
    
    try {
      const contentType: ContentType = 
        recording.recording_type === 'photo' ? 'image' : 
        recording.recording_type === 'audio' ? 'video' : 'video';

      const { data, error } = await supabase.functions.invoke('social-publish', {
        body: {
          platform: options.platform,
          contentType,
          mediaUrl: recording.file_url,
          caption: options.caption,
          hashtags: options.hashtags,
          scheduledAt: options.scheduledAt,
          metadata: {
            title: options.metadata?.title || recording.title,
            description: options.metadata?.description,
            thumbnailUrl: recording.thumbnail_url,
            visibility: options.visibility || 'public',
            categoryId: options.metadata?.categoryId,
            tags: options.metadata?.tags,
          },
        },
      });

      if (error) throw error;

      const result: PublishResult = {
        success: data.success,
        platform: options.platform,
        postId: data.postId,
        postUrl: data.postUrl,
        status: data.status,
        scheduledAt: data.scheduledAt,
        publishedAt: data.publishedAt,
      };

      setPublishResults(prev => [...prev, result]);
      toast.success(`${options.scheduledAt ? 'Scheduled' : 'Published'} to ${options.platform}`);
      return result;
    } catch (err: unknown) {
      console.error(`Publish to ${options.platform} failed:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Publish failed';
      
      const result: PublishResult = {
        success: false,
        platform: options.platform,
        status: 'failed',
        error: errorMessage,
      };
      
      setPublishResults(prev => [...prev, result]);
      toast.error(`Failed to publish to ${options.platform}`);
      return result;
    } finally {
      setIsPublishing(false);
    }
  }, []);

  const publishToMultiple = useCallback(async (
    recording: VibeRecording,
    platforms: SocialPublishOptions[]
  ): Promise<PublishResult[]> => {
    setIsPublishing(true);
    
    try {
      const results = await Promise.all(
        platforms.map(platform => publishTo(recording, platform))
      );
      return results;
    } finally {
      setIsPublishing(false);
    }
  }, [publishTo]);

  const setN8nWebhook = useCallback((config: N8nWebhookConfig) => {
    setN8nConfigState(config);
    // Persist to localStorage for session persistence
    localStorage.setItem('vibe_n8n_config', JSON.stringify(config));
  }, []);

  const triggerN8nWorkflow = useCallback(async (
    recording: VibeRecording,
    additionalData?: Record<string, unknown>
  ): Promise<boolean> => {
    // Try to load from localStorage if not set
    const config = n8nConfig || (() => {
      const stored = localStorage.getItem('vibe_n8n_config');
      return stored ? JSON.parse(stored) : null;
    })();

    if (!config?.enabled || !config?.webhookUrl) {
      console.log('n8n webhook not configured');
      return false;
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // n8n webhooks may not have CORS configured
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: 'genie_vibe',
          recording: {
            id: recording.id,
            title: recording.title,
            type: recording.recording_type,
            fileUrl: recording.file_url,
            thumbnailUrl: recording.thumbnail_url,
            durationSeconds: recording.duration_seconds,
            status: recording.status,
          },
          ...additionalData,
        }),
      });

      // With no-cors, we can't read the response, but the request was sent
      toast.success('Workflow triggered - check n8n for status');
      return true;
    } catch (err) {
      console.error('n8n workflow trigger failed:', err);
      toast.error('Failed to trigger n8n workflow');
      return false;
    }
  }, [n8nConfig]);

  const suggestHashtags = useCallback((title: string, description?: string): string[] => {
    const text = `${title} ${description || ''}`.toLowerCase();
    const hashtags: string[] = [];
    
    // Add content type hashtags
    if (text.includes('podcast') || text.includes('episode')) {
      hashtags.push(...CONTENT_HASHTAGS.podcast);
    } else if (text.includes('tutorial') || text.includes('how to')) {
      hashtags.push(...CONTENT_HASHTAGS.tutorial);
    } else if (text.includes('interview')) {
      hashtags.push(...CONTENT_HASHTAGS.interview);
    } else {
      hashtags.push(...CONTENT_HASHTAGS.video);
    }
    
    // Add healthcare hashtags if relevant
    if (text.includes('health') || text.includes('patient') || text.includes('medical') || text.includes('therapy')) {
      hashtags.push(...CONTENT_HASHTAGS.healthcare);
    }
    
    // Extract potential hashtags from title (words > 4 chars)
    const words = title.split(/\s+/);
    words.forEach(word => {
      const clean = word.replace(/[^a-zA-Z]/g, '');
      if (clean.length > 4 && !hashtags.includes(`#${clean.toLowerCase()}`)) {
        hashtags.push(`#${clean.toLowerCase()}`);
      }
    });
    
    // Return unique hashtags, max 10
    return [...new Set(hashtags)].slice(0, 10);
  }, []);

  const getCharacterLimit = useCallback((platform: SocialPlatform): number => {
    return PLATFORM_LIMITS[platform] || 2000;
  }, []);

  return {
    isPublishing,
    publishResults,
    n8nConfig,
    publishTo,
    publishToMultiple,
    setN8nWebhook,
    triggerN8nWorkflow,
    suggestHashtags,
    getCharacterLimit,
  };
}
