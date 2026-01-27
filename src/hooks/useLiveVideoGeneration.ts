/**
 * LIVE VIDEO GENERATION HOOK
 * 
 * Manages live video generation for the landing page using
 * the 6-zone routing infrastructure and full script from genie-studio-video-script.ts
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRegionalDetection } from './useRegionalDetection';

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
  
  // Actions
  generateVideo: (language?: string, chapter?: string) => Promise<void>;
  playChapter: (chapterIndex: number) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  stopPlayback: () => void;
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  
  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  const generateVideo = useCallback(async (language?: string, chapter = 'all') => {
    const targetLanguage = language || selectedRegion;
    
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
      
      // Prepare audio queue
      audioQueueRef.current = (data.chapters || [])
        .filter((ch: ChapterResult) => ch.audioBase64)
        .map((ch: ChapterResult) => `data:audio/mpeg;base64,${ch.audioBase64}`);
      
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
  }, [selectedRegion]);
  
  const playChapter = useCallback((chapterIndex: number) => {
    if (!result?.chapters || chapterIndex >= result.chapters.length) return;
    
    const chapter = result.chapters[chapterIndex];
    if (!chapter.audioBase64) {
      console.warn('[LiveVideoGen] No audio for chapter:', chapter.chapterId);
      return;
    }
    
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Create new audio
    const audioUrl = `data:audio/mpeg;base64,${chapter.audioBase64}`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => {
      // Auto-play next chapter
      const nextIndex = chapterIndex + 1;
      if (nextIndex < result.chapters.length) {
        setCurrentPlayingChapter(nextIndex);
        playChapter(nextIndex);
      } else {
        setIsPlaying(false);
        setCurrentPlayingChapter(0);
      }
    };
    
    audio.onerror = (e) => {
      console.error('[LiveVideoGen] Audio playback error:', e);
      setIsPlaying(false);
    };
    
    setCurrentPlayingChapter(chapterIndex);
    setIsPlaying(true);
    audio.play().catch(console.error);
  }, [result]);
  
  const pausePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);
  
  const resumePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, []);
  
  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentPlayingChapter(0);
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
    generateVideo,
    playChapter,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    reset,
    chapters,
    activeProviders,
  };
};

export default useLiveVideoGeneration;
