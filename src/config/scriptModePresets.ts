/**
 * Script Mode Presets Configuration
 * Defines mode-specific settings for voice, TTS, and recording layouts
 */

import type { ScriptMode } from '@/types/projects';

// Voice preset configuration
export interface VoicePreset {
  voiceName: string;
  voiceId: string;
  provider: 'elevenlabs' | 'openai';
  stability: number;
  similarityBoost: number;
  style: number;
  speed: number;
  description: string;
}

// TTS settings per mode
export interface TTSModeSettings {
  defaultVoice: VoicePreset;
  alternativeVoices: VoicePreset[];
  pacing: 'slow' | 'normal' | 'fast';
  pauseDuration: number; // ms between segments
  emphasisLevel: 'subtle' | 'moderate' | 'dramatic';
  backgroundMusicSuggestion: string;
}

// Recording layout configuration
export interface RecordingLayoutPreset {
  layout: 'single' | 'split' | 'grid' | 'focus';
  showTeleprompter: boolean;
  showTimer: boolean;
  showParticipantList: boolean;
  showMediaControls: boolean;
  showVisualCues: boolean;
  panelSizes: {
    script: number;
    preview: number;
    participants: number;
  };
  features: string[];
}

// Complete mode configuration
export interface ScriptModeConfig {
  mode: ScriptMode;
  label: string;
  description: string;
  icon: string;
  color: string;
  tts: TTSModeSettings;
  recordingLayout: RecordingLayoutPreset;
}

// ElevenLabs Voice Presets
const ELEVENLABS_VOICES = {
  // Conversational/Podcast voices
  podcast_host: {
    voiceName: 'Brian',
    voiceId: 'nPczCjzI2devNBz1zQrb',
    provider: 'elevenlabs' as const,
    stability: 0.45,
    similarityBoost: 0.75,
    style: 0.35,
    speed: 1.0,
    description: 'Warm, conversational - ideal for podcast hosts',
  },
  podcast_guest: {
    voiceName: 'Sarah',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    provider: 'elevenlabs' as const,
    stability: 0.5,
    similarityBoost: 0.8,
    style: 0.25,
    speed: 1.0,
    description: 'Natural, engaging - great for interview responses',
  },
  // Professional/Webcast voices
  webcast_presenter: {
    voiceName: 'Daniel',
    voiceId: 'onwK4e9ZLuTAKqWW03F9',
    provider: 'elevenlabs' as const,
    stability: 0.65,
    similarityBoost: 0.7,
    style: 0.15,
    speed: 0.95,
    description: 'Clear, professional - perfect for presentations',
  },
  webcast_narrator: {
    voiceName: 'Alice',
    voiceId: 'Xb7hH8MSUJpSbSDYk0k2',
    provider: 'elevenlabs' as const,
    stability: 0.6,
    similarityBoost: 0.75,
    style: 0.2,
    speed: 0.95,
    description: 'Friendly, articulate - suits business content',
  },
  // Video/Cinematic voices
  video_narrator: {
    voiceName: 'George',
    voiceId: 'JBFqnCBsd6RMkjVDRZzb',
    provider: 'elevenlabs' as const,
    stability: 0.55,
    similarityBoost: 0.85,
    style: 0.4,
    speed: 0.9,
    description: 'Rich, cinematic - great for video narration',
  },
  video_dynamic: {
    voiceName: 'Liam',
    voiceId: 'TX3LPaxmHKxFdv7VOQHJ',
    provider: 'elevenlabs' as const,
    stability: 0.4,
    similarityBoost: 0.8,
    style: 0.5,
    speed: 1.05,
    description: 'Energetic, expressive - suits dynamic content',
  },
  // Audio/Narration voices
  audio_narrator: {
    voiceName: 'Matilda',
    voiceId: 'XrExE9yKIg1WjnnlVkGX',
    provider: 'elevenlabs' as const,
    stability: 0.7,
    similarityBoost: 0.8,
    style: 0.1,
    speed: 0.92,
    description: 'Smooth, consistent - ideal for audiobooks',
  },
  audio_storyteller: {
    voiceName: 'Roger',
    voiceId: 'CwhRBWXzGAHq8TQ4Fs17',
    provider: 'elevenlabs' as const,
    stability: 0.5,
    similarityBoost: 0.85,
    style: 0.6,
    speed: 0.88,
    description: 'Expressive, dramatic - perfect for storytelling',
  },
};

// OpenAI Voice Presets (alternative provider)
const OPENAI_VOICES = {
  conversational: {
    voiceName: 'nova',
    voiceId: 'nova',
    provider: 'openai' as const,
    stability: 0.5,
    similarityBoost: 0.5,
    style: 0,
    speed: 1.0,
    description: 'Warm and natural conversational tone',
  },
  professional: {
    voiceName: 'onyx',
    voiceId: 'onyx',
    provider: 'openai' as const,
    stability: 0.5,
    similarityBoost: 0.5,
    style: 0,
    speed: 0.95,
    description: 'Deep, authoritative professional voice',
  },
  narrator: {
    voiceName: 'fable',
    voiceId: 'fable',
    provider: 'openai' as const,
    stability: 0.5,
    similarityBoost: 0.5,
    style: 0,
    speed: 0.9,
    description: 'Expressive storytelling voice',
  },
};

// Mode-specific configurations
export const SCRIPT_MODE_CONFIGS: Record<ScriptMode, ScriptModeConfig> = {
  podcast: {
    mode: 'podcast',
    label: 'Podcast',
    description: 'Dialogue-focused conversational content with multiple speakers',
    icon: 'Podcast',
    color: 'bg-purple-500',
    tts: {
      defaultVoice: ELEVENLABS_VOICES.podcast_host,
      alternativeVoices: [
        ELEVENLABS_VOICES.podcast_guest,
        OPENAI_VOICES.conversational,
      ],
      pacing: 'normal',
      pauseDuration: 800,
      emphasisLevel: 'moderate',
      backgroundMusicSuggestion: 'Subtle ambient or lo-fi background',
    },
    recordingLayout: {
      layout: 'split',
      showTeleprompter: true,
      showTimer: true,
      showParticipantList: true,
      showMediaControls: true,
      showVisualCues: false,
      panelSizes: {
        script: 40,
        preview: 35,
        participants: 25,
      },
      features: ['speaker-tags', 'turn-taking', 'live-transcription', 'chapter-markers'],
    },
  },
  webcast: {
    mode: 'webcast',
    label: 'Webcast',
    description: 'Presentation-style content with slides and demonstrations',
    icon: 'Tv',
    color: 'bg-blue-500',
    tts: {
      defaultVoice: ELEVENLABS_VOICES.webcast_presenter,
      alternativeVoices: [
        ELEVENLABS_VOICES.webcast_narrator,
        OPENAI_VOICES.professional,
      ],
      pacing: 'slow',
      pauseDuration: 1200,
      emphasisLevel: 'subtle',
      backgroundMusicSuggestion: 'Light corporate or tech-inspired soundtrack',
    },
    recordingLayout: {
      layout: 'focus',
      showTeleprompter: true,
      showTimer: true,
      showParticipantList: false,
      showMediaControls: true,
      showVisualCues: true,
      panelSizes: {
        script: 30,
        preview: 55,
        participants: 15,
      },
      features: ['slide-sync', 'screen-share', 'pointer-overlay', 'qa-queue'],
    },
  },
  video: {
    mode: 'video',
    label: 'Video/Voiceover',
    description: 'Visual content with narration, B-roll, and scene direction',
    icon: 'Video',
    color: 'bg-red-500',
    tts: {
      defaultVoice: ELEVENLABS_VOICES.video_narrator,
      alternativeVoices: [
        ELEVENLABS_VOICES.video_dynamic,
        OPENAI_VOICES.narrator,
      ],
      pacing: 'normal',
      pauseDuration: 600,
      emphasisLevel: 'dramatic',
      backgroundMusicSuggestion: 'Cinematic or emotional score',
    },
    recordingLayout: {
      layout: 'single',
      showTeleprompter: true,
      showTimer: true,
      showParticipantList: false,
      showMediaControls: true,
      showVisualCues: true,
      panelSizes: {
        script: 35,
        preview: 65,
        participants: 0,
      },
      features: ['scene-markers', 'b-roll-preview', 'timing-overlay', 'visual-cues'],
    },
  },
  audio: {
    mode: 'audio',
    label: 'Audio Narration',
    description: 'Pure audio content like audiobooks, voiceovers, and narration',
    icon: 'Mic',
    color: 'bg-green-500',
    tts: {
      defaultVoice: ELEVENLABS_VOICES.audio_narrator,
      alternativeVoices: [
        ELEVENLABS_VOICES.audio_storyteller,
        OPENAI_VOICES.narrator,
      ],
      pacing: 'slow',
      pauseDuration: 1000,
      emphasisLevel: 'moderate',
      backgroundMusicSuggestion: 'Minimal or no background music',
    },
    recordingLayout: {
      layout: 'single',
      showTeleprompter: true,
      showTimer: true,
      showParticipantList: false,
      showMediaControls: true,
      showVisualCues: false,
      panelSizes: {
        script: 60,
        preview: 40,
        participants: 0,
      },
      features: ['waveform-monitor', 'breathing-cues', 'pace-indicator', 'segment-markers'],
    },
  },
};

// Helper to get voice settings for TTS API call
export function getVoiceSettingsForMode(
  mode: ScriptMode,
  voiceOverride?: VoicePreset
): {
  voice: string;
  voiceId: string;
  provider: 'elevenlabs' | 'openai';
  settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    speed: number;
  };
} {
  const config = SCRIPT_MODE_CONFIGS[mode];
  const voice = voiceOverride || config.tts.defaultVoice;

  return {
    voice: voice.voiceName,
    voiceId: voice.voiceId,
    provider: voice.provider,
    settings: {
      stability: voice.stability,
      similarity_boost: voice.similarityBoost,
      style: voice.style,
      speed: voice.speed,
    },
  };
}

// Get all available voices for a mode
export function getVoicesForMode(mode: ScriptMode): VoicePreset[] {
  const config = SCRIPT_MODE_CONFIGS[mode];
  return [config.tts.defaultVoice, ...config.tts.alternativeVoices];
}

// Get recording layout for a mode
export function getRecordingLayoutForMode(mode: ScriptMode): RecordingLayoutPreset {
  return SCRIPT_MODE_CONFIGS[mode].recordingLayout;
}
