/**
 * Audio Playback Hook - Handles voiceover, music, and TTS playback
 */

import { useState, useCallback, useRef } from 'react';
import type { AudioState, AudioTabType } from '../types';

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

  const voiceoverRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const ttsRef = useRef<HTMLAudioElement | null>(null);

  const playVoiceover = useCallback((url: string) => {
    // Stop existing
    if (voiceoverRef.current) {
      voiceoverRef.current.pause();
    }
    
    const audio = new Audio(url);
    audio.volume = state.voiceoverVolume / 100;
    voiceoverRef.current = audio;
    
    audio.onplay = () => setIsPlaying(prev => ({ ...prev, voiceover: true }));
    audio.onpause = () => setIsPlaying(prev => ({ ...prev, voiceover: false }));
    audio.onended = () => setIsPlaying(prev => ({ ...prev, voiceover: false }));
    
    audio.play().catch(console.error);
    setState(prev => ({ ...prev, voiceoverAudio: audio }));
  }, [state.voiceoverVolume]);

  const stopVoiceover = useCallback(() => {
    if (voiceoverRef.current) {
      voiceoverRef.current.pause();
      voiceoverRef.current.currentTime = 0;
    }
    setIsPlaying(prev => ({ ...prev, voiceover: false }));
  }, []);

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
    if (ttsRef.current) {
      ttsRef.current.pause();
    }
    
    audio.volume = state.ttsVolume / 100;
    ttsRef.current = audio;
    
    audio.onplay = () => setIsPlaying(prev => ({ ...prev, tts: true }));
    audio.onpause = () => setIsPlaying(prev => ({ ...prev, tts: false }));
    audio.onended = () => setIsPlaying(prev => ({ ...prev, tts: false }));
    
    audio.play().catch(console.error);
    setState(prev => ({ ...prev, ttsAudio: audio }));
  }, [state.ttsVolume]);

  const stopTTS = useCallback(() => {
    if (ttsRef.current) {
      ttsRef.current.pause();
      ttsRef.current.currentTime = 0;
    }
    setIsPlaying(prev => ({ ...prev, tts: false }));
  }, []);

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
