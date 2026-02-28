/**
 * useLiveVideoPreview - Live Video Generation & Preview Hook
 * 
 * P2 Feature: Real-time video generation preview with AI provider routing
 * 
 * Features:
 * - Generate video previews for scenes using AI providers
 * - Progress tracking per scene and overall
 * - Provider routing based on style intent and region
 * - Thumbnail generation for quick previews
 * - Video assembly preview with JSON2Video
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { styleIntentResolver, type StyleIntent, type RegionZone } from '@/services/styleIntentResolver';
import type { SceneScript, TemplateMapping } from './useUnifiedAuthoring';
import type { TTSAudioResult } from './useLiveTTSPreview';
import type { ScenePipelineStep } from '@/config/ep04-production-config';

// ============================================
// TYPES
// ============================================

export type VideoGenerationType = 'thumbnail' | 'preview' | 'full';
export type VideoProviderType = 'vertex_veo' | 'sora2' | 'alibaba_wan' | 'modelslab' | 'gemini';

export interface VideoGenerationResult {
  sceneId: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  animatedPreviewUrl?: string;
  provider: string;
  durationSeconds: number;
  resolution: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  error?: string;
}

export interface VideoGenerationProgress {
  totalScenes: number;
  completedScenes: number;
  currentScene: string | null;
  percentage: number;
  status: 'idle' | 'generating' | 'assembling' | 'complete' | 'error';
  estimatedTimeRemaining?: number; // seconds
  error?: string;
}

export interface VideoAssemblyConfig {
  resolution: '720p' | '1080p' | '4k';
  fps: number;
  format: 'mp4' | 'webm';
  includeAudio: boolean;
  transitions: 'none' | 'fade' | 'slide' | 'zoom';
  language?: string;
}

export interface UseLiveVideoPreviewOptions {
  styleIntent?: StyleIntent;
  region?: RegionZone;
  onSceneGenerated?: (result: VideoGenerationResult) => void;
  onAssemblyComplete?: (videoUrl: string) => void;
  onProgress?: (progress: VideoGenerationProgress) => void;
}

/** Result from polling an async job */
export interface AsyncJobStatus {
  taskId: string;
  status: 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  error?: string;
}

export interface UseLiveVideoPreviewReturn {
  // Generation
  generateThumbnailForScene: (scene: SceneScript) => Promise<VideoGenerationResult | null>;
  generatePreviewForScene: (scene: SceneScript, audio?: TTSAudioResult) => Promise<VideoGenerationResult | null>;
  generateAllThumbnails: (scenes: SceneScript[]) => Promise<VideoGenerationResult[]>;
  generateAllPreviews: (scenes: SceneScript[], audioResults?: TTSAudioResult[]) => Promise<VideoGenerationResult[]>;
  cancelGeneration: () => void;

  // Pipeline step dispatch (called by orchestrator)
  generateVideoSteps: (sceneId: string, steps: ScenePipelineStep[]) => Promise<VideoGenerationResult[]>;
  generateLipsyncSteps: (sceneId: string, steps: ScenePipelineStep[], audioUrl?: string) => Promise<VideoGenerationResult[]>;
  pollAsyncJob: (taskId: string, provider: string) => Promise<AsyncJobStatus>;

  // Assembly
  assembleVideo: (
    mapping: TemplateMapping,
    audioResults: TTSAudioResult[],
    config?: Partial<VideoAssemblyConfig>
  ) => Promise<string | null>;

  // Progress
  progress: VideoGenerationProgress;
  isGenerating: boolean;
  isAssembling: boolean;

  // Cache
  videoCache: Map<string, VideoGenerationResult>;
  getCachedVideo: (sceneId: string) => VideoGenerationResult | undefined;
  clearCache: () => void;

  // Provider info
  getResolvedProviders: () => { video: string; image: string };
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useLiveVideoPreview(options: UseLiveVideoPreviewOptions = {}): UseLiveVideoPreviewReturn {
  const {
    styleIntent = 'corporate',
    region = 'global',
    onSceneGenerated,
    onAssemblyComplete,
    onProgress,
  } = options;

  // Progress state
  const [progress, setProgress] = useState<VideoGenerationProgress>({
    totalScenes: 0,
    completedScenes: 0,
    currentScene: null,
    percentage: 0,
    status: 'idle',
  });

  // Video cache
  const [videoCache, setVideoCache] = useState<Map<string, VideoGenerationResult>>(new Map());

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Update progress with callback
  const updateProgress = useCallback((update: Partial<VideoGenerationProgress>) => {
    setProgress(prev => {
      const newProgress = { ...prev, ...update };
      onProgress?.(newProgress);
      return newProgress;
    });
  }, [onProgress]);

  // Get resolved providers for the current style/region
  const getResolvedProviders = useCallback(() => {
    const resolved = styleIntentResolver.resolve(styleIntent, region);
    return {
      video: resolved.videoProvider.primary,
      image: resolved.imageProvider.primary,
    };
  }, [styleIntent, region]);

  // ============================================
  // THUMBNAIL GENERATION
  // ============================================

  const generateThumbnailForScene = useCallback(async (
    scene: SceneScript
  ): Promise<VideoGenerationResult | null> => {
    // Check cache first
    const cached = videoCache.get(`thumb_${scene.sceneId}`);
    if (cached?.thumbnailUrl) {
      return cached;
    }

    try {
      updateProgress({
        currentScene: scene.sceneId,
        status: 'generating',
      });

      const providers = getResolvedProviders();
      const prompt = `Scene thumbnail: ${scene.title}. ${scene.scriptText.slice(0, 200)}`;

      // Use image generation for thumbnails
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt,
          aspectRatio: '16:9',
          style: styleIntent === 'ugc-authentic' ? 'photographic' : 'digital-art',
          provider: providers.image,
        },
      });

      if (error) throw error;

      const result: VideoGenerationResult = {
        sceneId: scene.sceneId,
        thumbnailUrl: data?.imageUrl || data?.url,
        provider: providers.image,
        durationSeconds: scene.durationSeconds,
        resolution: '1280x720',
        status: 'complete',
      };

      // Cache the result
      setVideoCache(prev => new Map(prev).set(`thumb_${scene.sceneId}`, result));
      
      onSceneGenerated?.(result);
      
      updateProgress({
        completedScenes: progress.completedScenes + 1,
        percentage: Math.round(((progress.completedScenes + 1) / progress.totalScenes) * 100),
      });

      return result;
    } catch (error: any) {
      console.error('[LiveVideo] Thumbnail generation failed:', scene.sceneId, error);
      
      const result: VideoGenerationResult = {
        sceneId: scene.sceneId,
        provider: 'error',
        durationSeconds: scene.durationSeconds,
        resolution: '1280x720',
        status: 'failed',
        error: error.message,
      };

      return result;
    }
  }, [videoCache, getResolvedProviders, styleIntent, updateProgress, progress, onSceneGenerated]);

  // ============================================
  // VIDEO PREVIEW GENERATION
  // ============================================

  const generatePreviewForScene = useCallback(async (
    scene: SceneScript,
    audio?: TTSAudioResult
  ): Promise<VideoGenerationResult | null> => {
    // Check cache first
    const cached = videoCache.get(`preview_${scene.sceneId}`);
    if (cached?.animatedPreviewUrl) {
      return cached;
    }

    try {
      updateProgress({
        currentScene: scene.sceneId,
        status: 'generating',
      });

      const providers = getResolvedProviders();
      const prompt = `Marketing video scene: ${scene.title}. ${scene.scriptText.slice(0, 300)}. Professional quality, engaging visuals.`;

      // Generate animated preview using video generator
      const { data, error } = await supabase.functions.invoke('ai-video-generator', {
        body: {
          type: 'video',
          prompt,
          duration: Math.min(scene.durationSeconds, 10), // Cap at 10s for preview
          aspectRatio: '16:9',
          style: styleIntent,
          audioUrl: audio?.audioUrl,
        },
      });

      if (error) throw error;

      const result: VideoGenerationResult = {
        sceneId: scene.sceneId,
        animatedPreviewUrl: data?.videoUrl || data?.url,
        thumbnailUrl: data?.thumbnailUrl,
        provider: providers.video,
        durationSeconds: scene.durationSeconds,
        resolution: '1280x720',
        status: data?.status === 'processing' ? 'processing' : 'complete',
      };

      // Cache the result
      setVideoCache(prev => new Map(prev).set(`preview_${scene.sceneId}`, result));
      
      onSceneGenerated?.(result);

      updateProgress({
        completedScenes: progress.completedScenes + 1,
        percentage: Math.round(((progress.completedScenes + 1) / progress.totalScenes) * 100),
      });

      return result;
    } catch (error: any) {
      console.error('[LiveVideo] Preview generation failed:', scene.sceneId, error);
      
      return {
        sceneId: scene.sceneId,
        provider: 'error',
        durationSeconds: scene.durationSeconds,
        resolution: '1280x720',
        status: 'failed',
        error: error.message,
      };
    }
  }, [videoCache, getResolvedProviders, styleIntent, updateProgress, progress, onSceneGenerated]);

  // ============================================
  // BATCH GENERATION
  // ============================================

  const generateAllThumbnails = useCallback(async (
    scenes: SceneScript[]
  ): Promise<VideoGenerationResult[]> => {
    abortControllerRef.current = new AbortController();
    
    updateProgress({
      totalScenes: scenes.length,
      completedScenes: 0,
      currentScene: null,
      percentage: 0,
      status: 'generating',
    });

    const results: VideoGenerationResult[] = [];
    
    for (let i = 0; i < scenes.length; i++) {
      if (abortControllerRef.current?.signal.aborted) {
        console.log('[LiveVideo] Generation cancelled');
        break;
      }

      const scene = scenes[i];
      const result = await generateThumbnailForScene(scene);
      
      if (result) {
        results.push(result);
      }

      // Rate limiting delay
      if (i < scenes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    updateProgress({
      currentScene: null,
      status: results.length === scenes.length ? 'complete' : 'error',
    });

    if (results.length === scenes.length) {
      toast.success(`Generated ${scenes.length} thumbnails`);
    }

    return results;
  }, [generateThumbnailForScene, updateProgress]);

  const generateAllPreviews = useCallback(async (
    scenes: SceneScript[],
    audioResults?: TTSAudioResult[]
  ): Promise<VideoGenerationResult[]> => {
    abortControllerRef.current = new AbortController();
    
    updateProgress({
      totalScenes: scenes.length,
      completedScenes: 0,
      currentScene: null,
      percentage: 0,
      status: 'generating',
    });

    const results: VideoGenerationResult[] = [];
    
    for (let i = 0; i < scenes.length; i++) {
      if (abortControllerRef.current?.signal.aborted) break;

      const scene = scenes[i];
      const matchingAudio = audioResults?.find(a => a.sceneId === scene.sceneId);
      const result = await generatePreviewForScene(scene, matchingAudio);
      
      if (result) {
        results.push(result);
      }

      // Longer delay for video generation
      if (i < scenes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    updateProgress({
      currentScene: null,
      status: results.length === scenes.length ? 'complete' : 'error',
    });

    return results;
  }, [generatePreviewForScene, updateProgress]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    updateProgress({ status: 'idle', currentScene: null });
  }, [updateProgress]);

  // ============================================
  // VIDEO ASSEMBLY
  // ============================================

  const assembleVideo = useCallback(async (
    mapping: TemplateMapping,
    audioResults: TTSAudioResult[],
    config: Partial<VideoAssemblyConfig> = {}
  ): Promise<string | null> => {
    const assemblyConfig: VideoAssemblyConfig = {
      resolution: config.resolution || '1080p',
      fps: config.fps || 30,
      format: config.format || 'mp4',
      includeAudio: config.includeAudio !== false,
      transitions: config.transitions || 'fade',
      language: config.language,
    };

    updateProgress({
      status: 'assembling',
      currentScene: 'assembly',
    });

    try {
      // Prepare scenes for assembly
      const assemblyScenes = mapping.scenes.map(scene => {
        const cachedVideo = videoCache.get(`preview_${scene.sceneId}`) || 
                           videoCache.get(`thumb_${scene.sceneId}`);
        const audio = audioResults.find(a => a.sceneId === scene.sceneId);

        return {
          sceneId: scene.sceneId,
          title: scene.title,
          duration: scene.durationSeconds,
          visualUrl: cachedVideo?.animatedPreviewUrl || cachedVideo?.thumbnailUrl,
          audioUrl: audio?.audioUrl,
          transition: assemblyConfig.transitions,
        };
      });

      const { data, error } = await supabase.functions.invoke('genie-cast-assembler', {
        body: {
          scenes: assemblyScenes,
          resolution: assemblyConfig.resolution,
          fps: assemblyConfig.fps,
          format: assemblyConfig.format,
          includeAudio: assemblyConfig.includeAudio,
          templateId: mapping.templateId,
          language: assemblyConfig.language || 'en',
        },
      });

      if (error) throw error;

      updateProgress({
        status: 'complete',
        currentScene: null,
        percentage: 100,
      });

      const videoUrl = data?.videoUrl || data?.url;
      
      if (videoUrl) {
        onAssemblyComplete?.(videoUrl);
        toast.success('Video assembly complete!');
      }

      return videoUrl || null;
    } catch (error: any) {
      console.error('[LiveVideo] Assembly failed:', error);
      updateProgress({
        status: 'error',
        error: error.message,
      });
      toast.error(`Assembly failed: ${error.message}`);
      return null;
    }
  }, [videoCache, updateProgress, onAssemblyComplete]);

  // ============================================
  // PIPELINE STEP DISPATCH (called by orchestrator)
  // ============================================

  const generateVideoSteps = useCallback(async (
    sceneId: string,
    steps: ScenePipelineStep[],
  ): Promise<VideoGenerationResult[]> => {
    const videoSteps = steps.filter(s => s.type === 'alibaba-video');
    const results: VideoGenerationResult[] = [];

    for (const step of videoSteps) {
      if (step.type !== 'alibaba-video') continue;
      try {
        const { data, error } = await supabase.functions.invoke('alibaba-video-generator', {
          body: {
            model: step.model,
            prompt: step.prompt,
            referenceImage: step.referenceImage,
          },
        });
        if (error) throw error;

        const result: VideoGenerationResult = {
          sceneId,
          animatedPreviewUrl: data?.videoUrl || data?.url,
          provider: 'alibaba',
          durationSeconds: 10,
          resolution: '1280x720',
          status: data?.taskId ? 'processing' : 'complete',
        };
        setVideoCache(prev => new Map(prev).set(`video_${sceneId}_${results.length}`, result));
        results.push(result);
      } catch (err: any) {
        results.push({
          sceneId,
          provider: 'alibaba',
          durationSeconds: 0,
          resolution: '1280x720',
          status: 'failed',
          error: err.message,
        });
      }
    }
    return results;
  }, []);

  const generateLipsyncSteps = useCallback(async (
    sceneId: string,
    steps: ScenePipelineStep[],
    audioUrl?: string,
  ): Promise<VideoGenerationResult[]> => {
    const lipsyncSteps = steps.filter(s => s.type === 'avatar-lipsync');
    const results: VideoGenerationResult[] = [];

    for (const step of lipsyncSteps) {
      if (step.type !== 'avatar-lipsync') continue;
      try {
        const { data, error } = await supabase.functions.invoke('ai-video-generator', {
          body: {
            type: 'avatar',
            character: step.character,
            provider: step.provider,
            audioUrl,
          },
        });
        if (error) throw error;

        const result: VideoGenerationResult = {
          sceneId,
          animatedPreviewUrl: data?.videoUrl || data?.url,
          provider: step.provider,
          durationSeconds: 10,
          resolution: '1280x720',
          status: data?.taskId ? 'processing' : 'complete',
        };
        setVideoCache(prev => new Map(prev).set(`lipsync_${sceneId}_${results.length}`, result));
        results.push(result);
      } catch (err: any) {
        results.push({
          sceneId,
          provider: step.provider,
          durationSeconds: 0,
          resolution: '1280x720',
          status: 'failed',
          error: err.message,
        });
      }
    }
    return results;
  }, []);

  const pollAsyncJob = useCallback(async (
    taskId: string,
    provider: string,
  ): Promise<AsyncJobStatus> => {
    try {
      const edgeFn = provider.includes('alibaba') || provider.includes('wan')
        ? 'alibaba-video-generator'
        : 'ai-video-generator';

      const { data, error } = await supabase.functions.invoke(edgeFn, {
        body: { action: 'check-status', taskId },
      });
      if (error) throw error;

      return {
        taskId,
        status: data?.status === 'completed' || data?.status === 'success'
          ? 'completed'
          : data?.status === 'failed'
            ? 'failed'
            : 'processing',
        outputUrl: data?.videoUrl || data?.url,
        error: data?.error,
      };
    } catch (err: any) {
      return { taskId, status: 'failed', error: err.message };
    }
  }, []);

  // ============================================
  // CACHE FUNCTIONS
  // ============================================

  const getCachedVideo = useCallback((sceneId: string) => {
    return videoCache.get(`preview_${sceneId}`) || videoCache.get(`thumb_${sceneId}`);
  }, [videoCache]);

  const clearCache = useCallback(() => {
    setVideoCache(new Map());
  }, []);

  return {
    // Generation
    generateThumbnailForScene,
    generatePreviewForScene,
    generateAllThumbnails,
    generateAllPreviews,
    cancelGeneration,

    // Pipeline step dispatch (called by orchestrator)
    generateVideoSteps,
    generateLipsyncSteps,
    pollAsyncJob,

    // Assembly
    assembleVideo,

    // Progress
    progress,
    isGenerating: progress.status === 'generating',
    isAssembling: progress.status === 'assembling',

    // Cache
    videoCache,
    getCachedVideo,
    clearCache,

    // Provider info
    getResolvedProviders,
  };
}

export default useLiveVideoPreview;
