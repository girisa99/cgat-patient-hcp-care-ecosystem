/**
 * LIVE VIDEO GENERATION HOOK (v2)
 * 
 * Fixed audio management:
 * - Single audio instance with proper cleanup
 * - Mute control support
 * - Chapter navigation without audio overlap
 * - Uses shared useAudioElement for memory safety
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRegionalDetection } from './useRegionalDetection';
import { createManagedAudio } from './shared/useAudioElement';

export interface ChapterResult {
  chapterId: string;
  title: string;
  audioBase64?: string;
  audioUrl?: string;
  duration: number;
  ttsProvider: string;
  ttsVoice: string;
  zone: string;
  visualType: string;
  providers: string[];
  technicalHighlights: string[];
  error?: string;
}

export interface GenerationResult {
  success: boolean;
  language: string;
  routing: {
    zone: string;
    provider: string;
    voice: string;
  };
  chapters: ChapterResult[];
  totalDuration: number;
  metadata: {
    generatedAt: string;
    totalChapters: number;
    successfulChapters: number;
  };
}

export interface UseLiveVideoGenerationReturn {
  // State
  isGenerating: boolean;
  progress: number;
  currentChapter: string | null;
  result: GenerationResult | null;
  error: string | null;
  
  // Current audio playback
  isPlaying: boolean;
  currentPlayingChapter: number;
  isMuted: boolean;
  
  // Actions
  generateVideo: (language?: string, chapter?: string) => Promise<void>;
  playChapter: (chapterIndex: number) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  stopPlayback: () => void;
  setMuted: (muted: boolean) => void;
  reset: () => void;
  
  // Computed
  chapters: ChapterResult[];
  activeProviders: string[];
}

export const useLiveVideoGeneration = (): UseLiveVideoGenerationReturn => {
  const { selectedRegion } = useRegionalDetection();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingChapter, setCurrentPlayingChapter] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Single audio instance management
  const audioCleanupRef = useRef<(() => void) | null>(null);
  const isPlayingRef = useRef(false);
  
  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioCleanupRef.current) {
        audioCleanupRef.current();
        audioCleanupRef.current = null;
      }
    };
  }, []);
  
  // Stop any current audio
  const stopCurrentAudio = useCallback(() => {
    if (audioCleanupRef.current) {
      audioCleanupRef.current();
      audioCleanupRef.current = null;
    }
    isPlayingRef.current = false;
  }, []);
  
  const generateVideo = useCallback(async (language?: string, chapter = 'all') => {
    const targetLanguage = language || selectedRegion;
    
    // Stop any playing audio first
    stopCurrentAudio();
    setIsPlaying(false);
    
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setCurrentChapter('opening');
    
    try {
      console.log('[LiveVideoGen] Starting generation for:', targetLanguage);
      
      // Simulate progress during API call
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);
      
      const { data, error: fnError } = await supabase.functions.invoke('landing-video-generator', {
        body: { 
          language: targetLanguage, 
          chapter,
          includeAvatar: true,
          include3D: true,
        },
      });
      
      clearInterval(progressInterval);
      
      if (fnError) {
        throw new Error(fnError.message);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }
      
      setResult(data as GenerationResult);
      setProgress(100);
      
      console.log('[LiveVideoGen] Generation complete:', {
        chapters: data.chapters?.length,
        zone: data.routing?.zone,
        provider: data.routing?.provider,
      });
      
    } catch (err) {
      console.error('[LiveVideoGen] Error:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
      setCurrentChapter(null);
    }
  }, [selectedRegion, stopCurrentAudio]);
  
  const playChapter = useCallback((chapterIndex: number) => {
    if (!result?.chapters || chapterIndex >= result.chapters.length) return;
    
    const chapter = result.chapters[chapterIndex];
    
    // Always stop current audio first
    stopCurrentAudio();
    setCurrentPlayingChapter(chapterIndex);
    
    if (!chapter.audioBase64) {
      console.warn('[LiveVideoGen] No audio for chapter:', chapter.chapterId);
      // Still update UI but don't play audio
      setIsPlaying(true);
      isPlayingRef.current = true;
      
      // Auto-advance after estimated duration
      const duration = (chapter.duration || 5) * 1000;
      setTimeout(() => {
        if (isPlayingRef.current) {
          const nextIndex = chapterIndex + 1;
          if (nextIndex < result.chapters.length) {
            playChapter(nextIndex);
          } else {
            setIsPlaying(false);
            isPlayingRef.current = false;
            setCurrentPlayingChapter(0);
          }
        }
      }, duration);
      return;
    }
    
    // Create new managed audio
    const audioUrl = `data:audio/mpeg;base64,${chapter.audioBase64}`;
    
    const { audio, cleanup } = createManagedAudio(audioUrl, {
      volume: isMuted ? 0 : 1,
      onEnded: () => {
        // Auto-play next chapter
        const nextIndex = chapterIndex + 1;
        if (nextIndex < result.chapters.length && isPlayingRef.current) {
          setCurrentPlayingChapter(nextIndex);
          playChapter(nextIndex);
        } else {
          setIsPlaying(false);
          isPlayingRef.current = false;
          setCurrentPlayingChapter(0);
        }
      },
      onError: (err) => {
        console.error('[LiveVideoGen] Audio playback error:', err);
        setIsPlaying(false);
        isPlayingRef.current = false;
      },
    });
    
    audioCleanupRef.current = cleanup;
    
    setIsPlaying(true);
    isPlayingRef.current = true;
    
    audio.play().catch((err) => {
      console.error('[LiveVideoGen] Play failed:', err);
      setIsPlaying(false);
      isPlayingRef.current = false;
    });
  }, [result, isMuted, stopCurrentAudio]);
  
  const pausePlayback = useCallback(() => {
    // We can't pause a data URL audio easily, so just stop
    stopCurrentAudio();
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, [stopCurrentAudio]);
  
  const resumePlayback = useCallback(() => {
    // Resume from current chapter
    if (result && currentPlayingChapter < result.chapters.length) {
      playChapter(currentPlayingChapter);
    }
  }, [result, currentPlayingChapter, playChapter]);
  
  const stopPlayback = useCallback(() => {
    stopCurrentAudio();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentPlayingChapter(0);
  }, [stopCurrentAudio]);
  
  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
    // Note: volume change won't affect currently playing audio
    // User needs to restart chapter for mute to take effect
  }, []);
  
  const reset = useCallback(() => {
    stopPlayback();
    setResult(null);
    setProgress(0);
    setError(null);
  }, [stopPlayback]);
  
  // Computed values
  const chapters = result?.chapters || [];
  const activeProviders = [...new Set(chapters.flatMap(ch => ch.providers))];
  
  return {
    isGenerating,
    progress,
    currentChapter,
    result,
    error,
    isPlaying,
    currentPlayingChapter,
    isMuted,
    generateVideo,
    playChapter,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    setMuted,
    reset,
    chapters,
    activeProviders,
  };
};

export default useLiveVideoGeneration;
