/**
 * Audio Playback Hook - Handles voiceover, music, and TTS playback
 * Provides audio time tracking for teleprompter sync
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AudioState, AudioTabType } from '../types';

interface AudioTimeInfo {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

export function useAudioPlayback() {
  const [state, setState] = useState<AudioState>({
    voiceoverAudio: null,
    musicAudio: null,
    ttsAudio: null,
    voiceoverVolume: 100,
    musicVolume: 50,
    ttsVolume: 100,
    musicLoop: true,
  });
  
  const [activeTab, setActiveTab] = useState<AudioTabType>('voiceover');
  const [isPlaying, setIsPlaying] = useState<{ voiceover: boolean; music: boolean; tts: boolean }>({
    voiceover: false,
    music: false,
    tts: false,
  });

  // Audio time tracking for teleprompter sync
  const [audioTimeInfo, setAudioTimeInfo] = useState<AudioTimeInfo>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
  });

  const voiceoverRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const ttsRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateIntervalRef = useRef<number | null>(null);

  // Update audio time info for teleprompter sync
  const startTimeTracking = useCallback((audio: HTMLAudioElement) => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }
    
    timeUpdateIntervalRef.current = window.setInterval(() => {
      if (audio && !audio.paused) {
        setAudioTimeInfo({
          currentTime: audio.currentTime,
          duration: audio.duration || 0,
          isPlaying: !audio.paused,
        });
      }
    }, 50); // Update every 50ms for smooth sync
  }, []);

  const stopTimeTracking = useCallback(() => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
    setAudioTimeInfo({ currentTime: 0, duration: 0, isPlaying: false });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  const playVoiceover = useCallback((url: string) => {
    // Stop ALL audio first to prevent overlap
    if (voiceoverRef.current) voiceoverRef.current.pause();
    if (ttsRef.current) ttsRef.current.pause();
    
    const audio = new Audio(url);
    audio.volume = state.voiceoverVolume / 100;
    voiceoverRef.current = audio;
    
    audio.onplay = () => {
      setIsPlaying(prev => ({ ...prev, voiceover: true, tts: false }));
      startTimeTracking(audio);
    };
    audio.onpause = () => setIsPlaying(prev => ({ ...prev, voiceover: false }));
    audio.onended = () => {
      setIsPlaying(prev => ({ ...prev, voiceover: false }));
      stopTimeTracking();
    };
    audio.onloadedmetadata = () => {
      setAudioTimeInfo(prev => ({ ...prev, duration: audio.duration }));
    };
    
    audio.play().catch(console.error);
    setState(prev => ({ ...prev, voiceoverAudio: audio }));
  }, [state.voiceoverVolume, startTimeTracking, stopTimeTracking]);

  const stopVoiceover = useCallback(() => {
    if (voiceoverRef.current) {
      voiceoverRef.current.pause();
      voiceoverRef.current.currentTime = 0;
    }
    setIsPlaying(prev => ({ ...prev, voiceover: false }));
    stopTimeTracking();
  }, [stopTimeTracking]);

  const playMusic = useCallback((url: string) => {
    if (musicRef.current) {
      musicRef.current.pause();
    }
    
    const audio = new Audio(url);
    audio.volume = state.musicVolume / 100;
    audio.loop = state.musicLoop;
    musicRef.current = audio;
    
    audio.onplay = () => setIsPlaying(prev => ({ ...prev, music: true }));
    audio.onpause = () => setIsPlaying(prev => ({ ...prev, music: false }));
    audio.onended = () => {
      if (!state.musicLoop) {
        setIsPlaying(prev => ({ ...prev, music: false }));
      }
    };
    
    audio.play().catch(console.error);
    setState(prev => ({ ...prev, musicAudio: audio }));
  }, [state.musicVolume, state.musicLoop]);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
    setIsPlaying(prev => ({ ...prev, music: false }));
  }, []);

  const playTTS = useCallback((audio: HTMLAudioElement) => {
    // Stop voiceover and existing TTS to prevent overlap
    if (voiceoverRef.current) voiceoverRef.current.pause();
    if (ttsRef.current) ttsRef.current.pause();
    
    audio.volume = state.ttsVolume / 100;
    ttsRef.current = audio;
    
    audio.onplay = () => {
      setIsPlaying(prev => ({ ...prev, tts: true, voiceover: false }));
      startTimeTracking(audio);
    };
    audio.onpause = () => setIsPlaying(prev => ({ ...prev, tts: false }));
    audio.onended = () => {
      setIsPlaying(prev => ({ ...prev, tts: false }));
      stopTimeTracking();
    };
    audio.onloadedmetadata = () => {
      setAudioTimeInfo(prev => ({ ...prev, duration: audio.duration }));
    };
    
    audio.play().catch(console.error);
    setState(prev => ({ ...prev, ttsAudio: audio }));
  }, [state.ttsVolume, startTimeTracking, stopTimeTracking]);

  const stopTTS = useCallback(() => {
    if (ttsRef.current) {
      ttsRef.current.pause();
      ttsRef.current.currentTime = 0;
    }
    setIsPlaying(prev => ({ ...prev, tts: false }));
    stopTimeTracking();
  }, [stopTimeTracking]);

  const stopAll = useCallback(() => {
    stopVoiceover();
    stopMusic();
    stopTTS();
  }, [stopVoiceover, stopMusic, stopTTS]);

  const setVoiceoverVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, voiceoverVolume: volume }));
    if (voiceoverRef.current) {
      voiceoverRef.current.volume = volume / 100;
    }
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, musicVolume: volume }));
    if (musicRef.current) {
      musicRef.current.volume = volume / 100;
    }
  }, []);

  const setTTSVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, ttsVolume: volume }));
    if (ttsRef.current) {
      ttsRef.current.volume = volume / 100;
    }
  }, []);

  const toggleMusicLoop = useCallback(() => {
    setState(prev => {
      const newLoop = !prev.musicLoop;
      if (musicRef.current) {
        musicRef.current.loop = newLoop;
      }
      return { ...prev, musicLoop: newLoop };
    });
  }, []);

  return {
    ...state,
    activeTab,
    isPlaying,
    audioTimeInfo, // Expose for teleprompter sync
    // Expose audio element refs for recording mix
    audioElements: {
      voiceover: voiceoverRef.current,
      music: musicRef.current,
      tts: ttsRef.current,
    },
    setActiveTab,
    playVoiceover,
    stopVoiceover,
    playMusic,
    stopMusic,
    playTTS,
    stopTTS,
    stopAll,
    setVoiceoverVolume,
    setMusicVolume,
    setTTSVolume,
    toggleMusicLoop,
  };
}
