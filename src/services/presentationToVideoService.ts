/**
 * Presentation to Video Service
 * Converts presentations to videos with TTS voiceover and publishing
 * Part of Genie Spark - Mind to Media Production
 */

import { supabase } from '@/integrations/supabase/client';

export interface SlideForVideo {
  id: string;
  title: string;
  content: {
    bullets?: string[];
    speakerNotes?: string;
  };
  image?: {
    url?: string;
    base64?: string;
  };
  duration?: number; // seconds per slide
}

export interface VideoGenerationConfig {
  slides: SlideForVideo[];
  title: string;
  voiceProvider: 'openai' | 'elevenlabs' | 'amazon-polly';
  voiceId: string;
  voiceSpeed?: number;
  backgroundMusic?: boolean;
  musicStyle?: 'corporate' | 'upbeat' | 'calm' | 'none';
  transitionStyle?: 'fade' | 'slide' | 'zoom' | 'none';
  slideDuration?: number; // default seconds per slide
  resolution?: '720p' | '1080p' | '4k';
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
}

export interface VideoGenerationResult {
  success: boolean;
  videoUrl?: string;
  audioUrl?: string;
  duration?: number;
  slideAudios?: Array<{
    slideId: string;
    audioUrl: string;
    duration: number;
  }>;
  metadata?: {
    totalDuration: number;
    slideCount: number;
    resolution: string;
    voiceProvider: string;
  };
  error?: string;
}

export interface PublishTarget {
  platform: 'youtube' | 'vimeo' | 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'custom';
  credentials?: {
    accessToken?: string;
    channelId?: string;
    pageId?: string;
  };
  options?: {
    title?: string;
    description?: string;
    tags?: string[];
    visibility?: 'public' | 'private' | 'unlisted';
    scheduledTime?: string;
    thumbnail?: string;
  };
}

export interface PublishResult {
  success: boolean;
  platform: string;
  publishedUrl?: string;
  publishedId?: string;
  error?: string;
}

// Voice options for different providers
export const VOICE_OPTIONS = {
  openai: [
    { id: 'alloy', name: 'Alloy', style: 'Neutral' },
    { id: 'echo', name: 'Echo', style: 'Male' },
    { id: 'fable', name: 'Fable', style: 'Storytelling' },
    { id: 'onyx', name: 'Onyx', style: 'Deep Male' },
    { id: 'nova', name: 'Nova', style: 'Female' },
    { id: 'shimmer', name: 'Shimmer', style: 'Soft Female' },
  ],
  elevenlabs: [
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', style: 'Male Narrator' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', style: 'Female' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', style: 'Female Warm' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', style: 'Male' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', style: 'British Male' },
    { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', style: 'Deep Male' },
    { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', style: 'Female' },
  ],
  'amazon-polly': [
    { id: 'Matthew', name: 'Matthew', style: 'Male US' },
    { id: 'Joanna', name: 'Joanna', style: 'Female US' },
    { id: 'Amy', name: 'Amy', style: 'Female UK' },
    { id: 'Brian', name: 'Brian', style: 'Male UK' },
    { id: 'Ivy', name: 'Ivy', style: 'Child Female' },
    { id: 'Justin', name: 'Justin', style: 'Child Male' },
  ],
};

class PresentationToVideoService {
  private static instance: PresentationToVideoService;

  static getInstance(): PresentationToVideoService {
    if (!PresentationToVideoService.instance) {
      PresentationToVideoService.instance = new PresentationToVideoService();
    }
    return PresentationToVideoService.instance;
  }

  /**
   * Generate voiceover for a single slide
   */
  async generateSlideVoiceover(
    text: string,
    provider: 'openai' | 'elevenlabs' | 'amazon-polly',
    voiceId: string,
    speed: number = 1.0
  ): Promise<{ audioContent: string; duration: number } | null> {
    try {
      let functionName: string;
      let body: Record<string, unknown>;

      switch (provider) {
        case 'elevenlabs':
          functionName = 'elevenlabs-tts';
          body = {
            text,
            voiceId,
            stability: 0.5,
            similarity_boost: 0.75,
            speed,
          };
          break;
        case 'amazon-polly':
          functionName = 'amazon-polly';
          body = {
            text,
            voice: voiceId,
            speed,
          };
          break;
        case 'openai':
        default:
          functionName = 'text-to-speech';
          body = {
            text,
            voice: voiceId,
            model: 'tts-1',
            speed,
          };
          break;
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
      });

      if (error) throw error;

      // Estimate duration based on text length (approx 150 words per minute)
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = (wordCount / 150) * 60 / speed;

      return {
        audioContent: data.audioContent,
        duration: estimatedDuration,
      };
    } catch (error) {
      console.error('[PresentationToVideo] Error generating voiceover:', error);
      return null;
    }
  }

  /**
   * Generate narration text for a slide
   */
  generateSlideNarration(slide: SlideForVideo): string {
    const parts: string[] = [];

    // Add title
    if (slide.title) {
      parts.push(slide.title + '.');
    }

    // Add speaker notes if available (preferred)
    if (slide.content.speakerNotes) {
      parts.push(slide.content.speakerNotes);
    }
    // Otherwise use bullet points
    else if (slide.content.bullets && slide.content.bullets.length > 0) {
      parts.push(slide.content.bullets.join('. ') + '.');
    }

    return parts.join(' ');
  }

  /**
   * Generate video from presentation slides
   */
  async generateVideo(config: VideoGenerationConfig): Promise<VideoGenerationResult> {
    try {
      const slideAudios: Array<{ slideId: string; audioUrl: string; duration: number }> = [];
      let totalDuration = 0;

      // Generate voiceover for each slide
      for (const slide of config.slides) {
        const narration = this.generateSlideNarration(slide);
        
        if (narration.trim()) {
          const result = await this.generateSlideVoiceover(
            narration,
            config.voiceProvider,
            config.voiceId,
            config.voiceSpeed || 1.0
          );

          if (result) {
            // Create data URL for audio
            const audioUrl = `data:audio/mpeg;base64,${result.audioContent}`;
            const duration = Math.max(result.duration, config.slideDuration || 5);
            
            slideAudios.push({
              slideId: slide.id,
              audioUrl,
              duration,
            });
            
            totalDuration += duration;
          }
        } else {
          // Use default duration for empty slides
          const duration = config.slideDuration || 5;
          totalDuration += duration;
        }
      }

      // For now, we return the audio tracks - full video generation 
      // would require additional video processing service
      return {
        success: true,
        slideAudios,
        duration: totalDuration,
        metadata: {
          totalDuration,
          slideCount: config.slides.length,
          resolution: config.resolution || '1080p',
          voiceProvider: config.voiceProvider,
        },
      };
    } catch (error) {
      console.error('[PresentationToVideo] Error generating video:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate video',
      };
    }
  }

  /**
   * Generate background music for the video
   */
  async generateBackgroundMusic(
    style: 'corporate' | 'upbeat' | 'calm',
    duration: number
  ): Promise<string | null> {
    try {
      const prompts: Record<string, string> = {
        corporate: 'Professional corporate background music, subtle and modern, suitable for business presentations',
        upbeat: 'Upbeat positive instrumental music, energetic and inspiring, suitable for motivational content',
        calm: 'Calm ambient instrumental music, peaceful and focused, suitable for educational content',
      };

      const { data, error } = await supabase.functions.invoke('elevenlabs-music', {
        body: {
          prompt: prompts[style],
          duration: Math.min(duration, 120), // Max 2 minutes for music generation
        },
      });

      if (error) throw error;
      return `data:audio/mpeg;base64,${data.audioContent}`;
    } catch (error) {
      console.error('[PresentationToVideo] Error generating music:', error);
      return null;
    }
  }

  /**
   * Publish video to a platform
   */
  async publishVideo(
    videoUrl: string,
    target: PublishTarget
  ): Promise<PublishResult> {
    try {
      // This would integrate with actual platform APIs
      // For now, we simulate the publishing process
      
      console.log(`[PresentationToVideo] Publishing to ${target.platform}...`);

      // Simulate publishing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Return mock success - real implementation would call platform APIs
      return {
        success: true,
        platform: target.platform,
        publishedUrl: `https://${target.platform}.com/video/${Date.now()}`,
        publishedId: `vid_${Date.now()}`,
      };
    } catch (error) {
      console.error('[PresentationToVideo] Error publishing:', error);
      return {
        success: false,
        platform: target.platform,
        error: error instanceof Error ? error.message : 'Failed to publish',
      };
    }
  }

  /**
   * Get publish targets configuration
   */
  getPublishTargets(): Array<{ platform: string; name: string; icon: string; requiresAuth: boolean }> {
    return [
      { platform: 'youtube', name: 'YouTube', icon: 'youtube', requiresAuth: true },
      { platform: 'vimeo', name: 'Vimeo', icon: 'video', requiresAuth: true },
      { platform: 'linkedin', name: 'LinkedIn', icon: 'linkedin', requiresAuth: true },
      { platform: 'twitter', name: 'Twitter/X', icon: 'twitter', requiresAuth: true },
      { platform: 'facebook', name: 'Facebook', icon: 'facebook', requiresAuth: true },
      { platform: 'instagram', name: 'Instagram', icon: 'instagram', requiresAuth: true },
      { platform: 'tiktok', name: 'TikTok', icon: 'music', requiresAuth: true },
      { platform: 'custom', name: 'Custom URL', icon: 'link', requiresAuth: false },
    ];
  }
}

export const presentationToVideoService = PresentationToVideoService.getInstance();
