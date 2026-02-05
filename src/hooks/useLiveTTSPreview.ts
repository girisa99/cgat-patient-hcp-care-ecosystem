/**
 * useLiveTTSPreview - Live TTS Audio Generation & Playback Hook
 * 
 * P2 Feature: Real-time TTS generation with per-scene progress tracking
 * 
 * Features:
 * - Generate TTS audio for individual scenes on-demand
 * - Batch TTS generation for all scenes with progress
 * - Audio playback with pause/resume/stop controls
 * - Regional provider routing via multi-provider-tts
 * - Audio caching to avoid regeneration
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SceneScript, TemplateMapping } from './useUnifiedAuthoring';

// ============================================
// TYPES
// ============================================

export interface TTSAudioResult {
  sceneId: string;
  audioUrl: string;
  audioBase64?: string;
  durationSeconds: number;
  provider: string;
  voice: string;
  zone: string;
}

export interface TTSGenerationProgress {
  totalScenes: number;
  completedScenes: number;
  currentScene: string | null;
  percentage: number;
  status: 'idle' | 'generating' | 'complete' | 'error';
  error?: string;
}

export interface TTSPlaybackState {
  isPlaying: boolean;
  currentSceneId: string | null;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  volume: number;
}

export interface UseLiveTTSPreviewOptions {
  onSceneGenerated?: (result: TTSAudioResult) => void;
  onAllGenerated?: (results: TTSAudioResult[]) => void;
  onPlaybackComplete?: () => void;
  defaultLanguage?: string;
  defaultProvider?: string;
}

export interface UseLiveTTSPreviewReturn {
  // Generation
  generateForScene: (scene: SceneScript, language?: string) => Promise<TTSAudioResult | null>;
  generateForAllScenes: (scenes: SceneScript[], language?: string) => Promise<TTSAudioResult[]>;
  cancelGeneration: () => void;
  
  // Progress
  progress: TTSGenerationProgress;
  isGenerating: boolean;
  
  // Audio cache
  audioCache: Map<string, TTSAudioResult>;
  getCachedAudio: (sceneId: string) => TTSAudioResult | undefined;
  clearCache: () => void;
  
  // Playback
  playScene: (sceneId: string) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  stopPlayback: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  playbackState: TTSPlaybackState;
  
  // Playback chain (auto-play through scenes)
  playAllScenes: (scenes: SceneScript[], startIndex?: number) => void;
  stopAllPlayback: () => void;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useLiveTTSPreview(options: UseLiveTTSPreviewOptions = {}): UseLiveTTSPreviewReturn {
  const {
    onSceneGenerated,
    onAllGenerated,
    onPlaybackComplete,
    defaultLanguage = 'en-US',
    defaultProvider,
  } = options;

  // Generation state
  const [progress, setProgress] = useState<TTSGenerationProgress>({
    totalScenes: 0,
    completedScenes: 0,
    currentScene: null,
    percentage: 0,
    status: 'idle',
  });

  // Audio cache
  const [audioCache, setAudioCache] = useState<Map<string, TTSAudioResult>>(new Map());

  // Playback state
  const [playbackState, setPlaybackState] = useState<TTSPlaybackState>({
    isPlaying: false,
    currentSceneId: null,
    currentTime: 0,
    duration: 0,
    isMuted: false,
    volume: 1,
  });

  // Refs for audio management
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const playbackQueueRef = useRef<SceneScript[]>([]);
  const currentQueueIndexRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ============================================
  // GENERATION FUNCTIONS
  // ============================================

  const generateForScene = useCallback(async (
    scene: SceneScript,
    language?: string
  ): Promise<TTSAudioResult | null> => {
    const text = scene.editedText || scene.scriptText;
    if (!text || text.trim().length === 0) {
      console.warn('[LiveTTS] Empty script text for scene:', scene.sceneId);
      return null;
    }

    // Check cache first
    const cached = audioCache.get(scene.sceneId);
    if (cached) {
      console.log('[LiveTTS] Using cached audio for scene:', scene.sceneId);
      return cached;
    }

    try {
      setProgress(prev => ({
        ...prev,
        currentScene: scene.sceneId,
        status: 'generating',
      }));

      const { data, error } = await supabase.functions.invoke('multi-provider-tts', {
        body: {
          text,
          languageCode: language || defaultLanguage,
          provider: defaultProvider || scene.ttsConfig?.provider,
          voiceId: scene.ttsConfig?.voiceId,
          speed: scene.ttsConfig?.speed || 1.0,
          tier: 'premium',
        },
      });

      if (error) throw error;

      if (!data?.audioContent && !data?.audioUrl) {
        throw new Error('No audio content received');
      }

      const audioUrl = data.audioUrl || `data:audio/mpeg;base64,${data.audioContent}`;

      const result: TTSAudioResult = {
        sceneId: scene.sceneId,
        audioUrl,
        audioBase64: data.audioContent,
        durationSeconds: data.durationSeconds || scene.durationSeconds,
        provider: data.provider || 'unknown',
        voice: data.voice || 'default',
        zone: data.zone || 'global',
      };

      // Cache the result
      setAudioCache(prev => new Map(prev).set(scene.sceneId, result));
      
      onSceneGenerated?.(result);

      if (isMountedRef.current) {
        setProgress(prev => ({
          ...prev,
          completedScenes: prev.completedScenes + 1,
          percentage: Math.round(((prev.completedScenes + 1) / prev.totalScenes) * 100),
        }));
      }

      return result;
    } catch (error: any) {
      console.error('[LiveTTS] Generation failed for scene:', scene.sceneId, error);
      
      if (isMountedRef.current) {
        setProgress(prev => ({
          ...prev,
          status: 'error',
          error: error.message,
        }));
      }
      
      toast.error(`TTS failed for ${scene.title}: ${error.message}`);
      return null;
    }
  }, [audioCache, defaultLanguage, defaultProvider, onSceneGenerated]);

  const generateForAllScenes = useCallback(async (
    scenes: SceneScript[],
    language?: string
  ): Promise<TTSAudioResult[]> => {
    abortControllerRef.current = new AbortController();
    
    setProgress({
      totalScenes: scenes.length,
      completedScenes: 0,
      currentScene: null,
      percentage: 0,
      status: 'generating',
    });

    const results: TTSAudioResult[] = [];
    
    for (let i = 0; i < scenes.length; i++) {
      if (abortControllerRef.current?.signal.aborted) {
        console.log('[LiveTTS] Generation cancelled');
        break;
      }

      const scene = scenes[i];
      const result = await generateForScene(scene, language);
      
      if (result) {
        results.push(result);
      }

      // Small delay between requests to avoid rate limiting
      if (i < scenes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    if (isMountedRef.current) {
      setProgress(prev => ({
        ...prev,
        currentScene: null,
        status: results.length === scenes.length ? 'complete' : 'error',
      }));
    }

    onAllGenerated?.(results);
    
    if (results.length === scenes.length) {
      toast.success(`Generated TTS for all ${scenes.length} scenes`);
    }

    return results;
  }, [generateForScene, onAllGenerated]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setProgress(prev => ({
      ...prev,
      status: 'idle',
      currentScene: null,
    }));
  }, []);

  // ============================================
  // CACHE FUNCTIONS
  // ============================================

  const getCachedAudio = useCallback((sceneId: string) => {
    return audioCache.get(sceneId);
  }, [audioCache]);

  const clearCache = useCallback(() => {
    setAudioCache(new Map());
  }, []);

  // ============================================
  // PLAYBACK FUNCTIONS
  // ============================================

  const stopCurrentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
    }));
  }, []);

  const playScene = useCallback((sceneId: string) => {
    const cached = audioCache.get(sceneId);
    if (!cached) {
      toast.error('Generate TTS first before playing');
      return;
    }

    // Stop any current playback
    stopCurrentAudio();

    // Create new audio element
    const audio = new Audio(cached.audioUrl);
    audio.volume = playbackState.volume;
    audio.muted = playbackState.isMuted;
    
    audio.onloadedmetadata = () => {
      setPlaybackState(prev => ({
        ...prev,
        duration: audio.duration,
      }));
    };

    audio.ontimeupdate = () => {
      if (isMountedRef.current) {
        setPlaybackState(prev => ({
          ...prev,
          currentTime: audio.currentTime,
        }));
      }
    };

    audio.onended = () => {
      if (isMountedRef.current) {
        setPlaybackState(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0,
        }));
        
        // Check if we're in chain playback mode
        if (playbackQueueRef.current.length > 0) {
          const nextIndex = currentQueueIndexRef.current + 1;
          if (nextIndex < playbackQueueRef.current.length) {
            currentQueueIndexRef.current = nextIndex;
            const nextScene = playbackQueueRef.current[nextIndex];
            playScene(nextScene.sceneId);
          } else {
            // Queue finished
            playbackQueueRef.current = [];
            currentQueueIndexRef.current = 0;
            onPlaybackComplete?.();
          }
        }
      }
    };

    audio.onerror = (e) => {
      console.error('[LiveTTS] Playback error:', e);
      if (isMountedRef.current) {
        setPlaybackState(prev => ({
          ...prev,
          isPlaying: false,
        }));
      }
    };

    audioRef.current = audio;
    
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: true,
      currentSceneId: sceneId,
      currentTime: 0,
    }));

    audio.play().catch((err) => {
      console.error('[LiveTTS] Play failed:', err);
      setPlaybackState(prev => ({ ...prev, isPlaying: false }));
    });
  }, [audioCache, playbackState.volume, playbackState.isMuted, stopCurrentAudio, onPlaybackComplete]);

  const pausePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaybackState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const resumePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
      setPlaybackState(prev => ({ ...prev, isPlaying: true }));
    }
  }, []);

  const stopPlayback = useCallback(() => {
    stopCurrentAudio();
    playbackQueueRef.current = [];
    currentQueueIndexRef.current = 0;
    setPlaybackState(prev => ({
      ...prev,
      currentSceneId: null,
    }));
  }, [stopCurrentAudio]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlaybackState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setPlaybackState(prev => ({ ...prev, volume: clampedVolume }));
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
    setPlaybackState(prev => ({ ...prev, isMuted: muted }));
  }, []);

  // Chain playback through all scenes
  const playAllScenes = useCallback((scenes: SceneScript[], startIndex = 0) => {
    // Only include scenes that have cached audio
    const playableScenes = scenes.filter(s => audioCache.has(s.sceneId));
    
    if (playableScenes.length === 0) {
      toast.error('No TTS audio generated yet');
      return;
    }

    playbackQueueRef.current = playableScenes;
    currentQueueIndexRef.current = Math.min(startIndex, playableScenes.length - 1);
    
    const startScene = playbackQueueRef.current[currentQueueIndexRef.current];
    playScene(startScene.sceneId);
  }, [audioCache, playScene]);

  const stopAllPlayback = useCallback(() => {
    stopPlayback();
  }, [stopPlayback]);

  return {
    // Generation
    generateForScene,
    generateForAllScenes,
    cancelGeneration,
    
    // Progress
    progress,
    isGenerating: progress.status === 'generating',
    
    // Cache
    audioCache,
    getCachedAudio,
    clearCache,
    
    // Playback
    playScene,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    seekTo,
    setVolume,
    setMuted,
    playbackState,
    
    // Chain playback
    playAllScenes,
    stopAllPlayback,
  };
}

export default useLiveTTSPreview;
