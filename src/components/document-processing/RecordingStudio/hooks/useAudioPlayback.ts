/**
 * Audio Playback Hook - Handles voiceover, music, and TTS playback
 * Provides audio time tracking for teleprompter sync
 * Includes automatic music ducking when voice is playing
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
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
    musicVolume: 30, // Lower default for background music
    ttsVolume: 100,
    musicLoop: true,
  });
  
  const [activeTab, setActiveTab] = useState<AudioTabType>('voiceover');
  const [isPlaying, setIsPlaying] = useState<{ voiceover: boolean; music: boolean; tts: boolean }>({
    voiceover: false,
    music: false,
    tts: false,
  });
  
  // Music ducking settings
  const [duckingEnabled, setDuckingEnabled] = useState(true);
  const normalMusicVolumeRef = useRef(0.3); // 30%
  const duckedMusicVolumeRef = useRef(0.08); // 8% when voice plays

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
  const duckTransitionRef = useRef<number | null>(null);

  // Apply music ducking with smooth transition
  const applyDucking = useCallback((voicePlaying: boolean) => {
    if (!musicRef.current || !duckingEnabled) return;
    
    const targetVolume = voicePlaying ? duckedMusicVolumeRef.current : normalMusicVolumeRef.current;
    const currentVolume = musicRef.current.volume;
    
    // Cancel previous transition
    if (duckTransitionRef.current) {
      cancelAnimationFrame(duckTransitionRef.current);
    }
    
    // Smooth volume transition
    const step = (targetVolume - currentVolume) / 10;
    let currentStep = 0;
    
    const transition = () => {
      if (!musicRef.current || currentStep >= 10) {
        if (musicRef.current) musicRef.current.volume = targetVolume;
        return;
      }
      
      musicRef.current.volume = currentVolume + (step * currentStep);
      currentStep++;
      duckTransitionRef.current = requestAnimationFrame(transition);
    };
    
    transition();
    console.log('[AudioDucking] Voice playing:', voicePlaying, 'Target volume:', targetVolume);
  }, [duckingEnabled]);

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

  const stopTimeTracking = useCallback((resetTime = true) => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
    if (resetTime) {
      setAudioTimeInfo({ currentTime: 0, duration: 0, isPlaying: false });
    } else {
      setAudioTimeInfo(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  // Pause TTS (keep position for resume)
  const pauseTTS = useCallback(() => {
    if (ttsRef.current) {
      ttsRef.current.pause();
    }
    setIsPlaying(prev => ({ ...prev, tts: false }));
    stopTimeTracking(false); // Don't reset time
    applyDucking(false);
  }, [stopTimeTracking, applyDucking]);

  // Resume TTS from where it was paused
  const resumeTTS = useCallback(() => {
    if (ttsRef.current && ttsRef.current.src) {
      ttsRef.current.play().then(() => {
        console.log('[useAudioPlayback] TTS resumed');
        setIsPlaying(prev => ({ ...prev, tts: true }));
        startTimeTracking(ttsRef.current!);
        applyDucking(true);
      }).catch((err) => {
        console.error('[useAudioPlayback] TTS resume failed:', err);
      });
    }
  }, [startTimeTracking, applyDucking]);

  // Pause voiceover (keep position for resume)
  const pauseVoiceover = useCallback(() => {
    if (voiceoverRef.current) {
      voiceoverRef.current.pause();
    }
    setIsPlaying(prev => ({ ...prev, voiceover: false }));
    stopTimeTracking(false); // Don't reset time
    applyDucking(false);
  }, [stopTimeTracking, applyDucking]);

  // Resume voiceover from where it was paused
  const resumeVoiceover = useCallback(() => {
    if (voiceoverRef.current && voiceoverRef.current.src) {
      voiceoverRef.current.play().then(() => {
        console.log('[useAudioPlayback] Voiceover resumed');
        setIsPlaying(prev => ({ ...prev, voiceover: true }));
        startTimeTracking(voiceoverRef.current!);
        applyDucking(true);
      }).catch((err) => {
        console.error('[useAudioPlayback] Voiceover resume failed:', err);
      });
    }
  }, [startTimeTracking, applyDucking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (duckTransitionRef.current) {
        cancelAnimationFrame(duckTransitionRef.current);
      }
    };
  }, []);

  const playVoiceover = useCallback((url: string) => {
    console.log('[useAudioPlayback] playVoiceover called with URL:', url.substring(0, 60));
    
    // Stop ALL audio first to prevent overlap
    if (voiceoverRef.current) voiceoverRef.current.pause();
    if (ttsRef.current) ttsRef.current.pause();
    
    const audio = new Audio(url);
    audio.volume = state.voiceoverVolume / 100;
    voiceoverRef.current = audio;
    
    audio.onplay = () => {
      console.log('[useAudioPlayback] Voiceover started playing');
      setIsPlaying(prev => ({ ...prev, voiceover: true, tts: false }));
      startTimeTracking(audio);
      applyDucking(true); // Duck music when voice starts
    };
    audio.onpause = () => {
      setIsPlaying(prev => ({ ...prev, voiceover: false }));
      applyDucking(false); // Restore music volume
    };
    audio.onended = () => {
      console.log('[useAudioPlayback] Voiceover ended');
      setIsPlaying(prev => ({ ...prev, voiceover: false }));
      stopTimeTracking();
      applyDucking(false); // Restore music volume
    };
    audio.onloadedmetadata = () => {
      console.log('[useAudioPlayback] Voiceover loaded, duration:', audio.duration);
      setAudioTimeInfo(prev => ({ ...prev, duration: audio.duration }));
    };
    audio.onerror = (e) => {
      console.error('[useAudioPlayback] Voiceover playback error:', e);
    };
    
    audio.play().catch((err) => {
      console.error('[useAudioPlayback] Voiceover play() failed:', err);
    });
    setState(prev => ({ ...prev, voiceoverAudio: audio }));
  }, [state.voiceoverVolume, startTimeTracking, stopTimeTracking, applyDucking]);

  const stopVoiceover = useCallback(() => {
    if (voiceoverRef.current) {
      voiceoverRef.current.pause();
      voiceoverRef.current.currentTime = 0;
    }
    setIsPlaying(prev => ({ ...prev, voiceover: false }));
    stopTimeTracking();
    applyDucking(false); // Restore music volume
  }, [stopTimeTracking, applyDucking]);

  const playMusic = useCallback((url: string) => {
    console.log('[useAudioPlayback] playMusic called with URL:', url.substring(0, 60));
    
    if (musicRef.current) {
      musicRef.current.pause();
    }
    
    const audio = new Audio(url);
    // Check if voice is currently playing to set initial volume
    const voicePlaying = isPlaying.voiceover || isPlaying.tts;
    const initialVolume = duckingEnabled && voicePlaying 
      ? duckedMusicVolumeRef.current 
      : normalMusicVolumeRef.current;
    
    audio.volume = initialVolume;
    audio.loop = state.musicLoop;
    musicRef.current = audio;
    
    audio.onplay = () => {
      console.log('[useAudioPlayback] Music started playing');
      setIsPlaying(prev => ({ ...prev, music: true }));
    };
    audio.onpause = () => setIsPlaying(prev => ({ ...prev, music: false }));
    audio.onended = () => {
      if (!state.musicLoop) {
        console.log('[useAudioPlayback] Music ended (not looping)');
        setIsPlaying(prev => ({ ...prev, music: false }));
      }
    };
    audio.onerror = (e) => {
      console.error('[useAudioPlayback] Music playback error:', e);
    };
    
    audio.play().catch((err) => {
      console.error('[useAudioPlayback] Music play() failed:', err);
    });
    setState(prev => ({ ...prev, musicAudio: audio }));
  }, [state.musicLoop, isPlaying.voiceover, isPlaying.tts, duckingEnabled]);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
    setIsPlaying(prev => ({ ...prev, music: false }));
  }, []);

  const playTTS = useCallback((urlOrAudio: string | HTMLAudioElement) => {
    // Support both URL strings and HTMLAudioElement for backward compatibility
    let audio: HTMLAudioElement;
    
    if (typeof urlOrAudio === 'string') {
      // Validate URL before creating Audio element
      if (!urlOrAudio || urlOrAudio.trim() === '') {
        console.error('[useAudioPlayback] playTTS: Empty URL provided');
        return;
      }
      audio = new Audio(urlOrAudio);
    } else {
      audio = urlOrAudio;
    }
    
    console.log('[useAudioPlayback] playTTS called:', typeof urlOrAudio === 'string' ? 'URL' : 'HTMLAudioElement', 
      ', src:', audio.src?.substring(0, 80) || 'no src');
    
    // Stop voiceover and existing TTS to prevent overlap
    if (voiceoverRef.current) voiceoverRef.current.pause();
    if (ttsRef.current) ttsRef.current.pause();
    
    audio.volume = state.ttsVolume / 100;
    ttsRef.current = audio;
    
    audio.onplay = () => {
      console.log('[useAudioPlayback] TTS started playing');
      setIsPlaying(prev => ({ ...prev, tts: true, voiceover: false }));
      startTimeTracking(audio);
      applyDucking(true); // Duck music when TTS starts
    };
    audio.onpause = () => {
      setIsPlaying(prev => ({ ...prev, tts: false }));
      applyDucking(false); // Restore music volume
    };
    audio.onended = () => {
      console.log('[useAudioPlayback] TTS ended');
      setIsPlaying(prev => ({ ...prev, tts: false }));
      stopTimeTracking();
      applyDucking(false); // Restore music volume
    };
    audio.onloadedmetadata = () => {
      console.log('[useAudioPlayback] TTS loaded, duration:', audio.duration);
      setAudioTimeInfo(prev => ({ ...prev, duration: audio.duration }));
    };
    audio.onerror = (e) => {
      console.error('[useAudioPlayback] TTS playback error:', e, 'src:', audio.src?.substring(0, 80));
      setIsPlaying(prev => ({ ...prev, tts: false }));
      // Try to get more error details
      const mediaError = audio.error;
      if (mediaError) {
        console.error('[useAudioPlayback] MediaError code:', mediaError.code, 'message:', mediaError.message);
        // MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED = 4 (usually 404 or invalid format)
        // MediaError.MEDIA_ERR_NETWORK = 2 (network error)
        if (mediaError.code === 4 || mediaError.code === 2) {
          toast.error('Audio file not found - this TTS may need to be regenerated in GenieStudio');
        } else {
          toast.error('Failed to play audio: ' + (mediaError.message || 'Unknown error'));
        }
      }
    };
    
    // Add canplay event to ensure audio is ready
    audio.oncanplay = () => {
      console.log('[useAudioPlayback] TTS can play, attempting playback');
    };
    
    audio.play().then(() => {
      console.log('[useAudioPlayback] TTS play() promise resolved');
    }).catch((err) => {
      console.error('[useAudioPlayback] TTS play() failed:', err.name, err.message);
      setIsPlaying(prev => ({ ...prev, tts: false }));
      if (err.name === 'NotSupportedError' || err.name === 'NotAllowedError') {
        toast.error('Could not play audio - file may be missing or corrupted');
      }
    });
    setState(prev => ({ ...prev, ttsAudio: audio }));
  }, [state.ttsVolume, startTimeTracking, stopTimeTracking, applyDucking]);

  const stopTTS = useCallback(() => {
    if (ttsRef.current) {
      ttsRef.current.pause();
      ttsRef.current.currentTime = 0;
    }
    setIsPlaying(prev => ({ ...prev, tts: false }));
    stopTimeTracking();
    applyDucking(false); // Restore music volume
  }, [stopTimeTracking, applyDucking]);

  const stopAll = useCallback(() => {
    console.log('[AudioPlayback] stopAll called - stopping all audio');
    
    // Stop managed audio
    stopVoiceover();
    stopMusic();
    stopTTS();
    
    // Also forcefully stop any audio elements that might exist in refs
    if (voiceoverRef.current) {
      try {
        voiceoverRef.current.pause();
        voiceoverRef.current.currentTime = 0;
        voiceoverRef.current.src = '';
        voiceoverRef.current = null;
      } catch (e) { /* ignore */ }
    }
    if (musicRef.current) {
      try {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
        musicRef.current.src = '';
        musicRef.current = null;
      } catch (e) { /* ignore */ }
    }
    if (ttsRef.current) {
      try {
        ttsRef.current.pause();
        ttsRef.current.currentTime = 0;
        ttsRef.current.src = '';
        ttsRef.current = null;
      } catch (e) { /* ignore */ }
    }
    
    // Stop any orphaned audio elements in the document
    try {
      const allAudio = document.querySelectorAll('audio');
      allAudio.forEach((audio) => {
        if (!audio.paused) {
          console.log('[AudioPlayback] Stopping orphaned audio:', audio.src?.substring(0, 50));
          audio.pause();
          audio.currentTime = 0;
        }
      });
    } catch (e) {
      console.warn('[AudioPlayback] Error cleaning up orphaned audio:', e);
    }
    
    console.log('[AudioPlayback] All audio stopped');
  }, [stopVoiceover, stopMusic, stopTTS]);

  const setVoiceoverVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, voiceoverVolume: volume }));
    if (voiceoverRef.current) {
      voiceoverRef.current.volume = volume / 100;
    }
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, musicVolume: volume }));
    normalMusicVolumeRef.current = volume / 100;
    // Only update if voice not playing (otherwise ducking controls it)
    if (musicRef.current && !isPlaying.voiceover && !isPlaying.tts) {
      musicRef.current.volume = volume / 100;
    }
  }, [isPlaying.voiceover, isPlaying.tts]);

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

  const toggleDucking = useCallback(() => {
    setDuckingEnabled(prev => !prev);
  }, []);

  return {
    ...state,
    activeTab,
    isPlaying,
    audioTimeInfo, // Expose for teleprompter sync
    duckingEnabled,
    // Expose audio element refs for recording mix
    audioElements: {
      voiceover: voiceoverRef.current,
      music: musicRef.current,
      tts: ttsRef.current,
    },
    setActiveTab,
    playVoiceover,
    stopVoiceover,
    pauseVoiceover,
    resumeVoiceover,
    playMusic,
    stopMusic,
    playTTS,
    stopTTS,
    pauseTTS,
    resumeTTS,
    stopAll,
    setVoiceoverVolume,
    setMusicVolume,
    setTTSVolume,
    toggleMusicLoop,
    toggleDucking,
  };
}
