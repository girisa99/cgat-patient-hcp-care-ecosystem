/**
 * Music Composer Agent Hook
 * AI-powered music composition using ElevenLabs Music API
 * Generates custom background music, soundscapes, and SFX based on video context
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export type MusicStyle = 
  | 'cinematic' 
  | 'corporate' 
  | 'upbeat' 
  | 'ambient' 
  | 'dramatic' 
  | 'inspirational'
  | 'electronic'
  | 'acoustic'
  | 'jazz'
  | 'classical'
  | 'lofi'
  | 'epic';

export type MusicMood = 
  | 'happy' 
  | 'sad' 
  | 'tense' 
  | 'relaxing' 
  | 'energetic' 
  | 'mysterious'
  | 'romantic'
  | 'dark'
  | 'hopeful'
  | 'peaceful';

export type AudioType = 'music' | 'sfx' | 'ambient' | 'transition';

export interface MusicRequest {
  type: AudioType;
  style?: MusicStyle;
  mood?: MusicMood;
  prompt?: string;
  duration: number; // seconds
  bpm?: number;
  key?: string;
  instruments?: string[];
  videoContext?: {
    sceneDescriptions?: string[];
    emotions?: string[];
    pacing?: 'slow' | 'medium' | 'fast';
  };
}

export interface GeneratedAudio {
  id: string;
  type: AudioType;
  audioUrl: string;
  audioBlob: Blob;
  duration: number;
  prompt: string;
  style?: MusicStyle;
  mood?: MusicMood;
  metadata: {
    generatedAt: string;
    provider: 'elevenlabs';
    bpm?: number;
    key?: string;
  };
}

export interface ComposerPreset {
  id: string;
  name: string;
  description: string;
  style: MusicStyle;
  mood: MusicMood;
  instruments?: string[];
  bpm?: number;
}

// Pre-defined composer presets
export const COMPOSER_PRESETS: ComposerPreset[] = [
  {
    id: 'corporate-upbeat',
    name: 'Corporate Upbeat',
    description: 'Professional, positive background for business videos',
    style: 'corporate',
    mood: 'energetic',
    instruments: ['piano', 'synth', 'light percussion'],
    bpm: 120,
  },
  {
    id: 'cinematic-epic',
    name: 'Cinematic Epic',
    description: 'Grand, sweeping music for trailers and intros',
    style: 'cinematic',
    mood: 'hopeful',
    instruments: ['orchestra', 'strings', 'brass', 'percussion'],
    bpm: 90,
  },
  {
    id: 'lofi-chill',
    name: 'Lo-Fi Chill',
    description: 'Relaxed beats for vlogs and casual content',
    style: 'lofi',
    mood: 'relaxing',
    instruments: ['piano', 'vinyl crackle', 'soft drums'],
    bpm: 75,
  },
  {
    id: 'ambient-peaceful',
    name: 'Ambient Peaceful',
    description: 'Calm soundscape for meditation and nature content',
    style: 'ambient',
    mood: 'peaceful',
    instruments: ['pad synth', 'nature sounds', 'soft bells'],
    bpm: 60,
  },
  {
    id: 'electronic-energetic',
    name: 'Electronic Energy',
    description: 'High-energy EDM for sports and action content',
    style: 'electronic',
    mood: 'energetic',
    instruments: ['synth', 'bass', 'drums', 'arpeggios'],
    bpm: 140,
  },
  {
    id: 'acoustic-warm',
    name: 'Acoustic Warmth',
    description: 'Organic, heartfelt music for personal stories',
    style: 'acoustic',
    mood: 'romantic',
    instruments: ['acoustic guitar', 'piano', 'strings'],
    bpm: 85,
  },
  {
    id: 'dramatic-tension',
    name: 'Dramatic Tension',
    description: 'Suspenseful music for documentaries and drama',
    style: 'dramatic',
    mood: 'tense',
    instruments: ['strings', 'low brass', 'timpani'],
    bpm: 70,
  },
  {
    id: 'inspirational-uplifting',
    name: 'Inspirational Uplift',
    description: 'Motivational music for success stories',
    style: 'inspirational',
    mood: 'hopeful',
    instruments: ['piano', 'strings', 'soft drums', 'choir'],
    bpm: 100,
  },
];

interface UseMusicComposerAgentReturn {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  generatedAudio: GeneratedAudio[];
  currentAudio: GeneratedAudio | null;
  isPlaying: boolean;
  error: string | null;
  
  // Generation
  generateMusic: (request: MusicRequest) => Promise<GeneratedAudio | null>;
  generateFromPreset: (presetId: string, duration: number, context?: MusicRequest['videoContext']) => Promise<GeneratedAudio | null>;
  generateSFX: (prompt: string, duration?: number) => Promise<GeneratedAudio | null>;
  generateAmbient: (description: string, duration: number) => Promise<GeneratedAudio | null>;
  generateTransition: (fromMood: MusicMood, toMood: MusicMood, duration?: number) => Promise<GeneratedAudio | null>;
  
  // AI-assisted
  suggestMusicFromVideo: (sceneDescriptions: string[], emotions: string[]) => Promise<ComposerPreset[]>;
  generatePromptFromContext: (context: MusicRequest['videoContext']) => string;
  
  // Playback
  playAudio: (audio: GeneratedAudio) => void;
  pauseAudio: () => void;
  stopAudio: () => void;
  
  // Download
  downloadAudio: (audio: GeneratedAudio, filename?: string) => void;
  
  // History
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  
  // Presets
  getPresets: () => ComposerPreset[];
  getPresetById: (id: string) => ComposerPreset | undefined;
}

export const useMusicComposerAgent = (): UseMusicComposerAgentReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio[]>([]);
  const [currentAudio, setCurrentAudio] = useState<GeneratedAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Build prompt from request
  const buildMusicPrompt = (request: MusicRequest): string => {
    const parts: string[] = [];

    if (request.prompt) {
      parts.push(request.prompt);
    }

    if (request.style) {
      parts.push(`${request.style} style`);
    }

    if (request.mood) {
      parts.push(`${request.mood} mood`);
    }

    if (request.instruments?.length) {
      parts.push(`featuring ${request.instruments.join(', ')}`);
    }

    if (request.bpm) {
      parts.push(`${request.bpm} BPM`);
    }

    if (request.key) {
      parts.push(`in ${request.key}`);
    }

    if (request.videoContext) {
      if (request.videoContext.pacing) {
        parts.push(`${request.videoContext.pacing} pacing`);
      }
      if (request.videoContext.emotions?.length) {
        parts.push(`conveying ${request.videoContext.emotions.join(' and ')}`);
      }
    }

    return parts.join(', ') || 'background music';
  };

  // Generate music
  const generateMusic = useCallback(async (request: MusicRequest): Promise<GeneratedAudio | null> => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setCurrentStep('Preparing composition...');

    try {
      const prompt = buildMusicPrompt(request);
      setProgress(20);
      setCurrentStep('Composing music...');

      // Call ElevenLabs music API via edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/music-composer-agent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: 'generate',
            type: request.type,
            prompt,
            duration: request.duration,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Generation failed: ${response.status}`);
      }

      setProgress(80);
      setCurrentStep('Processing audio...');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const generated: GeneratedAudio = {
        id: `audio-${Date.now()}`,
        type: request.type,
        audioUrl,
        audioBlob,
        duration: request.duration,
        prompt,
        style: request.style,
        mood: request.mood,
        metadata: {
          generatedAt: new Date().toISOString(),
          provider: 'elevenlabs',
          bpm: request.bpm,
          key: request.key,
        },
      };

      setGeneratedAudio(prev => [generated, ...prev]);
      setCurrentAudio(generated);
      setProgress(100);
      setCurrentStep('Complete');

      toast.success('Music generated successfully!');
      return generated;

    } catch (err: any) {
      setError(err.message || 'Music generation failed');
      toast.error('Music generation failed: ' + err.message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Generate from preset
  const generateFromPreset = useCallback(async (
    presetId: string, 
    duration: number,
    context?: MusicRequest['videoContext']
  ): Promise<GeneratedAudio | null> => {
    const preset = COMPOSER_PRESETS.find(p => p.id === presetId);
    if (!preset) {
      toast.error('Preset not found');
      return null;
    }

    return generateMusic({
      type: 'music',
      style: preset.style,
      mood: preset.mood,
      instruments: preset.instruments,
      bpm: preset.bpm,
      duration,
      videoContext: context,
    });
  }, [generateMusic]);

  // Generate SFX
  const generateSFX = useCallback(async (prompt: string, duration: number = 5): Promise<GeneratedAudio | null> => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setCurrentStep('Generating sound effect...');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/music-composer-agent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: 'generate_sfx',
            prompt,
            duration,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`SFX generation failed: ${response.status}`);
      }

      setProgress(80);
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const generated: GeneratedAudio = {
        id: `sfx-${Date.now()}`,
        type: 'sfx',
        audioUrl,
        audioBlob,
        duration,
        prompt,
        metadata: {
          generatedAt: new Date().toISOString(),
          provider: 'elevenlabs',
        },
      };

      setGeneratedAudio(prev => [generated, ...prev]);
      setCurrentAudio(generated);
      setProgress(100);

      toast.success('Sound effect generated!');
      return generated;

    } catch (err: any) {
      setError(err.message);
      toast.error('SFX generation failed: ' + err.message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Generate ambient soundscape
  const generateAmbient = useCallback(async (description: string, duration: number): Promise<GeneratedAudio | null> => {
    return generateMusic({
      type: 'ambient',
      style: 'ambient',
      mood: 'peaceful',
      prompt: `ambient soundscape: ${description}`,
      duration,
    });
  }, [generateMusic]);

  // Generate transition music
  const generateTransition = useCallback(async (
    fromMood: MusicMood, 
    toMood: MusicMood, 
    duration: number = 5
  ): Promise<GeneratedAudio | null> => {
    return generateMusic({
      type: 'transition',
      prompt: `smooth musical transition from ${fromMood} to ${toMood} mood`,
      duration,
    });
  }, [generateMusic]);

  // Suggest music based on video context
  const suggestMusicFromVideo = useCallback(async (
    sceneDescriptions: string[], 
    emotions: string[]
  ): Promise<ComposerPreset[]> => {
    // Simple keyword matching for suggestions
    const suggestions: ComposerPreset[] = [];
    
    const combinedText = [...sceneDescriptions, ...emotions].join(' ').toLowerCase();

    // Score each preset based on keyword matches
    const scored = COMPOSER_PRESETS.map(preset => {
      let score = 0;
      
      // Check style keywords
      if (combinedText.includes(preset.style)) score += 3;
      if (combinedText.includes(preset.mood)) score += 3;
      
      // Check common associations
      if (combinedText.includes('business') && preset.style === 'corporate') score += 2;
      if (combinedText.includes('nature') && preset.style === 'ambient') score += 2;
      if (combinedText.includes('action') && preset.style === 'electronic') score += 2;
      if (combinedText.includes('story') && preset.style === 'acoustic') score += 2;
      if (combinedText.includes('trailer') && preset.style === 'cinematic') score += 2;
      
      // Emotion matches
      if (emotions.includes('happy') && preset.mood === 'happy') score += 2;
      if (emotions.includes('sad') && preset.mood === 'sad') score += 2;
      if (emotions.includes('tense') && preset.mood === 'tense') score += 2;

      return { preset, score };
    });

    // Return top 3 suggestions
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.preset);
  }, []);

  // Generate prompt from video context
  const generatePromptFromContext = useCallback((context: MusicRequest['videoContext']): string => {
    if (!context) return 'background music';

    const parts: string[] = [];

    if (context.sceneDescriptions?.length) {
      parts.push(`music for scenes showing: ${context.sceneDescriptions.slice(0, 3).join(', ')}`);
    }

    if (context.emotions?.length) {
      parts.push(`conveying ${context.emotions.join(' and ')}`);
    }

    if (context.pacing) {
      const pacingMap = {
        slow: 'slow, contemplative tempo',
        medium: 'moderate, flowing tempo',
        fast: 'upbeat, energetic tempo',
      };
      parts.push(pacingMap[context.pacing]);
    }

    return parts.join(', ') || 'background music';
  }, []);

  // Playback controls
  const playAudio = useCallback((audio: GeneratedAudio) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const newAudio = new Audio(audio.audioUrl);
    audioRef.current = newAudio;
    
    newAudio.onended = () => setIsPlaying(false);
    newAudio.play();
    setIsPlaying(true);
    setCurrentAudio(audio);
  }, []);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  // Download audio
  const downloadAudio = useCallback((audio: GeneratedAudio, filename?: string) => {
    const name = filename || `${audio.type}-${audio.id}.mp3`;
    const link = document.createElement('a');
    link.href = audio.audioUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded: ${name}`);
  }, []);

  // History management
  const clearHistory = useCallback(() => {
    generatedAudio.forEach(audio => {
      URL.revokeObjectURL(audio.audioUrl);
    });
    setGeneratedAudio([]);
    setCurrentAudio(null);
  }, [generatedAudio]);

  const removeFromHistory = useCallback((id: string) => {
    setGeneratedAudio(prev => {
      const audio = prev.find(a => a.id === id);
      if (audio) {
        URL.revokeObjectURL(audio.audioUrl);
      }
      return prev.filter(a => a.id !== id);
    });
    if (currentAudio?.id === id) {
      setCurrentAudio(null);
    }
  }, [currentAudio]);

  // Preset getters
  const getPresets = useCallback(() => COMPOSER_PRESETS, []);
  const getPresetById = useCallback((id: string) => COMPOSER_PRESETS.find(p => p.id === id), []);

  return {
    isGenerating,
    progress,
    currentStep,
    generatedAudio,
    currentAudio,
    isPlaying,
    error,
    generateMusic,
    generateFromPreset,
    generateSFX,
    generateAmbient,
    generateTransition,
    suggestMusicFromVideo,
    generatePromptFromContext,
    playAudio,
    pauseAudio,
    stopAudio,
    downloadAudio,
    clearHistory,
    removeFromHistory,
    getPresets,
    getPresetById,
  };
};

export default useMusicComposerAgent;
