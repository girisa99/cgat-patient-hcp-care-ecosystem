/**
 * Presentation to Video Hook
 * React hook for converting presentations to videos with TTS
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  presentationToVideoService,
  VideoGenerationConfig,
  VideoGenerationResult,
  PublishTarget,
  PublishResult,
  SlideForVideo,
  VOICE_OPTIONS,
} from '@/services/presentationToVideoService';

export interface UsePresentationToVideoReturn {
  isGenerating: boolean;
  isPublishing: boolean;
  progress: number;
  currentStep: string;
  result: VideoGenerationResult | null;
  publishResults: PublishResult[];
  
  // Actions
  generateVideo: (config: VideoGenerationConfig) => Promise<VideoGenerationResult>;
  generateSlideAudio: (slide: SlideForVideo, provider: string, voiceId: string) => Promise<string | null>;
  generateBackgroundMusic: (style: 'corporate' | 'upbeat' | 'calm', duration: number) => Promise<string | null>;
  publishToTargets: (videoUrl: string, targets: PublishTarget[]) => Promise<PublishResult[]>;
  
  // Voice options
  getVoiceOptions: (provider: 'openai' | 'elevenlabs' | 'amazon-polly') => typeof VOICE_OPTIONS.openai;
  
  // Reset
  reset: () => void;
}

export function usePresentationToVideo(): UsePresentationToVideoReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<VideoGenerationResult | null>(null);
  const [publishResults, setPublishResults] = useState<PublishResult[]>([]);

  const generateVideo = useCallback(async (config: VideoGenerationConfig): Promise<VideoGenerationResult> => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('Preparing slides...');

    try {
      const totalSlides = config.slides.length;
      let processedSlides = 0;

      // Process slides with progress updates
      setCurrentStep('Generating voiceovers...');
      
      const slideAudios: VideoGenerationResult['slideAudios'] = [];
      let totalDuration = 0;

      for (const slide of config.slides) {
        const narration = presentationToVideoService.generateSlideNarration(slide);
        
        if (narration.trim()) {
          const audioResult = await presentationToVideoService.generateSlideVoiceover(
            narration,
            config.voiceProvider,
            config.voiceId,
            config.voiceSpeed || 1.0
          );

          if (audioResult) {
            const audioUrl = `data:audio/mpeg;base64,${audioResult.audioContent}`;
            const duration = Math.max(audioResult.duration, config.slideDuration || 5);
            
            slideAudios.push({
              slideId: slide.id,
              audioUrl,
              duration,
            });
            
            totalDuration += duration;
          }
        }

        processedSlides++;
        setProgress((processedSlides / totalSlides) * 80);
      }

      // Generate background music if requested
      let backgroundMusicUrl: string | undefined;
      if (config.backgroundMusic && config.musicStyle && config.musicStyle !== 'none') {
        setCurrentStep('Generating background music...');
        setProgress(85);
        
        backgroundMusicUrl = await presentationToVideoService.generateBackgroundMusic(
          config.musicStyle,
          totalDuration
        ) || undefined;
      }

      setCurrentStep('Finalizing video...');
      setProgress(95);

      const videoResult: VideoGenerationResult = {
        success: true,
        slideAudios,
        audioUrl: backgroundMusicUrl,
        duration: totalDuration,
        metadata: {
          totalDuration,
          slideCount: config.slides.length,
          resolution: config.resolution || '1080p',
          voiceProvider: config.voiceProvider,
        },
      };

      setResult(videoResult);
      setProgress(100);
      setCurrentStep('Complete!');
      
      toast.success(`Video generated! Duration: ${Math.ceil(totalDuration)} seconds`);
      
      return videoResult;
    } catch (error) {
      console.error('[usePresentationToVideo] Error:', error);
      const errorResult: VideoGenerationResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate video',
      };
      setResult(errorResult);
      toast.error('Failed to generate video');
      return errorResult;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateSlideAudio = useCallback(async (
    slide: SlideForVideo,
    provider: string,
    voiceId: string
  ): Promise<string | null> => {
    try {
      const narration = presentationToVideoService.generateSlideNarration(slide);
      
      if (!narration.trim()) return null;

      const result = await presentationToVideoService.generateSlideVoiceover(
        narration,
        provider as 'openai' | 'elevenlabs' | 'amazon-polly',
        voiceId
      );

      if (result) {
        return `data:audio/mpeg;base64,${result.audioContent}`;
      }
      return null;
    } catch (error) {
      console.error('[usePresentationToVideo] Error generating slide audio:', error);
      return null;
    }
  }, []);

  const generateBackgroundMusic = useCallback(async (
    style: 'corporate' | 'upbeat' | 'calm',
    duration: number
  ): Promise<string | null> => {
    try {
      return await presentationToVideoService.generateBackgroundMusic(style, duration);
    } catch (error) {
      console.error('[usePresentationToVideo] Error generating music:', error);
      return null;
    }
  }, []);

  const publishToTargets = useCallback(async (
    videoUrl: string,
    targets: PublishTarget[]
  ): Promise<PublishResult[]> => {
    setIsPublishing(true);
    setPublishResults([]);

    try {
      const results: PublishResult[] = [];

      for (const target of targets) {
        setCurrentStep(`Publishing to ${target.platform}...`);
        const result = await presentationToVideoService.publishVideo(videoUrl, target);
        results.push(result);
        setPublishResults(prev => [...prev, result]);

        if (result.success) {
          toast.success(`Published to ${target.platform}`);
        } else {
          toast.error(`Failed to publish to ${target.platform}`);
        }
      }

      return results;
    } finally {
      setIsPublishing(false);
      setCurrentStep('');
    }
  }, []);

  const getVoiceOptions = useCallback((provider: 'openai' | 'elevenlabs' | 'amazon-polly') => {
    return VOICE_OPTIONS[provider];
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setIsPublishing(false);
    setProgress(0);
    setCurrentStep('');
    setResult(null);
    setPublishResults([]);
  }, []);

  return {
    isGenerating,
    isPublishing,
    progress,
    currentStep,
    result,
    publishResults,
    generateVideo,
    generateSlideAudio,
    generateBackgroundMusic,
    publishToTargets,
    getVoiceOptions,
    reset,
  };
}

export { VOICE_OPTIONS };
