/**
 * Audio Generation Config Service
 * 
 * Connects audio configuration from wizard to generation pipeline.
 * Handles voice, music, and SFX settings for presentation/video generation.
 */

import { GlobalTier } from '@/services/shared/globalTierService';

// Regional zone type (matches 5-zone routing architecture)
export type RegionalZone = 'claude_zone' | 'alibaba_zone' | 'arabic_zone' | 'gemini_zone' | 'africa_zone' | 'fallback_zone';

// ==================== TYPES ====================

export interface VoiceConfig {
  enabled: boolean;
  provider: string;
  voiceId: string;
  persona: 'professional' | 'casual' | 'energetic' | 'calm' | 'authoritative';
  speed: number;
  pitch: number;
  stability: number;
  clarity: number;
  backgroundMusic: boolean;
  musicVolume: number;
  pauseBetweenSlides: number;
}

export interface MusicConfig {
  enabled: boolean;
  provider: string;
  genre: string;
  mood: string;
  tempo: 'slow' | 'medium' | 'fast';
  volume: number;
  fadeIn: number;
  fadeOut: number;
  loop: boolean;
}

export interface SFXConfig {
  enabled: boolean;
  provider: string;
  transitionSounds: boolean;
  ambientSounds: boolean;
  volume: number;
}

export interface AudioGenerationConfig {
  voice: VoiceConfig;
  music: MusicConfig;
  sfx: SFXConfig;
  // Regional routing
  languageCode: string;
  regionalZone: RegionalZone;
  // Tier settings
  tier: GlobalTier;
  // Output format
  outputFormat: 'mp3' | 'wav' | 'ogg';
  sampleRate: 22050 | 44100 | 48000;
}

export interface AudioGenerationRequest {
  // Content
  text: string;
  slideIndex?: number;
  duration?: number;
  // Configuration
  config: AudioGenerationConfig;
  // Callbacks
  onProgress?: (progress: number) => void;
}

export interface AudioGenerationResult {
  audioUrl: string;
  duration: number;
  format: string;
  provider: string;
  cost: number;
}

// ==================== DEFAULT CONFIGS ====================

export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  enabled: false,
  provider: 'openai',
  voiceId: 'alloy',
  persona: 'professional',
  speed: 1.0,
  pitch: 0,
  stability: 0.5,
  clarity: 0.75,
  backgroundMusic: false,
  musicVolume: 30,
  pauseBetweenSlides: 1,
};

export const DEFAULT_MUSIC_CONFIG: MusicConfig = {
  enabled: false,
  provider: 'elevenlabs',
  genre: 'corporate',
  mood: 'uplifting',
  tempo: 'medium',
  volume: 25,
  fadeIn: 2,
  fadeOut: 3,
  loop: true,
};

export const DEFAULT_SFX_CONFIG: SFXConfig = {
  enabled: false,
  provider: 'elevenlabs',
  transitionSounds: false,
  ambientSounds: false,
  volume: 50,
};

// ==================== PROVIDER ROUTING ====================

interface ProviderRoute {
  primary: string;
  fallback: string;
  endpoint: string;
}

const VOICE_PROVIDER_ROUTES: Record<RegionalZone, ProviderRoute> = {
  claude_zone: { primary: 'elevenlabs', fallback: 'openai', endpoint: 'multi-provider-tts' },
  alibaba_zone: { primary: 'alibaba', fallback: 'azure', endpoint: 'multi-provider-tts' },
  arabic_zone: { primary: 'azure', fallback: 'google', endpoint: 'multi-provider-tts' },
  gemini_zone: { primary: 'google', fallback: 'azure', endpoint: 'multi-provider-tts' },
  africa_zone: { primary: 'azure', fallback: 'google', endpoint: 'multi-provider-tts' },
  fallback_zone: { primary: 'openai', fallback: 'google', endpoint: 'multi-provider-tts' },
};

const MUSIC_PROVIDER_ROUTES: Record<RegionalZone, ProviderRoute> = {
  claude_zone: { primary: 'elevenlabs', fallback: 'modelslab', endpoint: 'multi-provider-music' },
  alibaba_zone: { primary: 'alibaba', fallback: 'modelslab', endpoint: 'multi-provider-music' },
  arabic_zone: { primary: 'elevenlabs', fallback: 'modelslab', endpoint: 'multi-provider-music' },
  gemini_zone: { primary: 'google-lyria', fallback: 'elevenlabs', endpoint: 'multi-provider-music' }, // Google's zone prefers Google Lyria 2
  africa_zone: { primary: 'elevenlabs', fallback: 'modelslab', endpoint: 'multi-provider-music' },
  fallback_zone: { primary: 'elevenlabs', fallback: 'modelslab', endpoint: 'multi-provider-music' },
};

const SFX_PROVIDER_ROUTES: Record<RegionalZone, ProviderRoute> = {
  claude_zone: { primary: 'elevenlabs', fallback: 'modelslab', endpoint: 'multi-provider-sfx' },
  alibaba_zone: { primary: 'alibaba', fallback: 'modelslab', endpoint: 'multi-provider-sfx' },
  arabic_zone: { primary: 'elevenlabs', fallback: 'modelslab', endpoint: 'multi-provider-sfx' },
  gemini_zone: { primary: 'elevenlabs', fallback: 'modelslab', endpoint: 'multi-provider-sfx' },
  africa_zone: { primary: 'elevenlabs', fallback: 'modelslab', endpoint: 'multi-provider-sfx' },
  fallback_zone: { primary: 'elevenlabs', fallback: 'modelslab', endpoint: 'multi-provider-sfx' },
};

// ==================== SERVICE ====================

class AudioGenerationConfigService {
  /**
   * Build complete audio config from wizard voice config
   */
  buildConfigFromWizard(
    voiceConfig: Partial<VoiceConfig>,
    options: {
      languageCode?: string;
      tier?: GlobalTier;
      includeMusic?: boolean;
      includeSfx?: boolean;
    } = {}
  ): AudioGenerationConfig {
    const { 
      languageCode = 'en-US', 
      tier = 'advanced',
      includeMusic = voiceConfig.backgroundMusic,
      includeSfx = false,
    } = options;

    const regionalZone = this.detectRegionalZone(languageCode);

    return {
      voice: { ...DEFAULT_VOICE_CONFIG, ...voiceConfig },
      music: {
        ...DEFAULT_MUSIC_CONFIG,
        enabled: includeMusic || false,
        volume: voiceConfig.musicVolume || DEFAULT_MUSIC_CONFIG.volume,
      },
      sfx: {
        ...DEFAULT_SFX_CONFIG,
        enabled: includeSfx,
      },
      languageCode,
      regionalZone,
      tier,
      outputFormat: 'mp3',
      sampleRate: tier === 'premium' ? 48000 : 44100,
    };
  }

  /**
   * Detect regional zone from language code
   */
  detectRegionalZone(languageCode: string): RegionalZone {
    const lang = languageCode.toLowerCase().split('-')[0];
    
    // CJK languages -> Alibaba Zone
    if (['zh', 'ja', 'ko'].includes(lang)) {
      return 'alibaba_zone';
    }
    
    // Arabic languages -> Arabic Zone
    if (['ar', 'he', 'fa', 'ur'].includes(lang)) {
      return 'arabic_zone';
    }
    
    // Indian languages -> Gemini Zone
    if (['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml'].includes(lang)) {
      return 'gemini_zone';
    }
    
    // African languages -> Africa Zone
    if (['sw', 'am', 'yo', 'ig', 'zu', 'xh'].includes(lang)) {
      return 'africa_zone';
    }
    
    // European languages -> Claude Zone
    if (['en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'pl', 'ru'].includes(lang)) {
      return 'claude_zone';
    }
    
    return 'fallback_zone';
  }

  /**
   * Get provider route for voice generation
   */
  getVoiceProviderRoute(zone: RegionalZone): ProviderRoute {
    return VOICE_PROVIDER_ROUTES[zone] || VOICE_PROVIDER_ROUTES.fallback_zone;
  }

  /**
   * Get provider route for music generation
   */
  getMusicProviderRoute(zone: RegionalZone): ProviderRoute {
    return MUSIC_PROVIDER_ROUTES[zone] || MUSIC_PROVIDER_ROUTES.fallback_zone;
  }

  /**
   * Get provider route for SFX generation
   */
  getSfxProviderRoute(zone: RegionalZone): ProviderRoute {
    return SFX_PROVIDER_ROUTES[zone] || SFX_PROVIDER_ROUTES.fallback_zone;
  }

  /**
   * Build request payload for voice generation edge function
   */
  buildVoiceRequestPayload(
    text: string,
    config: AudioGenerationConfig
  ): Record<string, unknown> {
    const route = this.getVoiceProviderRoute(config.regionalZone);
    
    return {
      text,
      provider: config.voice.provider || route.primary,
      voiceId: config.voice.voiceId,
      languageCode: config.languageCode,
      tier: config.tier,
      options: {
        speed: config.voice.speed,
        pitch: config.voice.pitch,
        stability: config.voice.stability,
        clarity: config.voice.clarity,
      },
      outputFormat: config.outputFormat,
      sampleRate: config.sampleRate,
      fallbackProvider: route.fallback,
    };
  }

  /**
   * Build request payload for music generation edge function
   */
  buildMusicRequestPayload(
    prompt: string,
    duration: number,
    config: AudioGenerationConfig
  ): Record<string, unknown> {
    const route = this.getMusicProviderRoute(config.regionalZone);
    
    return {
      prompt,
      duration,
      provider: config.music.provider || route.primary,
      genre: config.music.genre,
      mood: config.music.mood,
      tempo: config.music.tempo,
      tier: config.tier,
      outputFormat: config.outputFormat,
      fallbackProvider: route.fallback,
    };
  }

  /**
   * Build request payload for SFX generation edge function
   */
  buildSfxRequestPayload(
    prompt: string,
    duration: number,
    config: AudioGenerationConfig
  ): Record<string, unknown> {
    const route = this.getSfxProviderRoute(config.regionalZone);
    
    return {
      prompt,
      duration,
      provider: config.sfx.provider || route.primary,
      tier: config.tier,
      outputFormat: config.outputFormat,
      fallbackProvider: route.fallback,
    };
  }

  /**
   * Calculate estimated audio generation cost
   */
  calculateEstimatedCost(config: AudioGenerationConfig, totalDurationSeconds: number): {
    voiceCost: number;
    musicCost: number;
    sfxCost: number;
    totalCost: number;
  } {
    const tierMultiplier = config.tier === 'premium' ? 3 : config.tier === 'advanced' ? 1.5 : 1;
    
    // Base costs per minute
    const voiceCostPerMinute = 0.15;
    const musicCostPerMinute = 0.10;
    const sfxCostPerMinute = 0.05;
    
    const minutes = totalDurationSeconds / 60;
    
    const voiceCost = config.voice.enabled ? minutes * voiceCostPerMinute * tierMultiplier : 0;
    const musicCost = config.music.enabled ? minutes * musicCostPerMinute * tierMultiplier : 0;
    const sfxCost = config.sfx.enabled ? minutes * sfxCostPerMinute * tierMultiplier : 0;
    
    return {
      voiceCost: Math.round(voiceCost * 100) / 100,
      musicCost: Math.round(musicCost * 100) / 100,
      sfxCost: Math.round(sfxCost * 100) / 100,
      totalCost: Math.round((voiceCost + musicCost + sfxCost) * 100) / 100,
    };
  }

  /**
   * Validate audio config before generation
   */
  validateConfig(config: AudioGenerationConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (config.voice.enabled) {
      if (!config.voice.voiceId) {
        errors.push('Voice ID is required when voice is enabled');
      }
      if (config.voice.speed < 0.5 || config.voice.speed > 2.0) {
        errors.push('Voice speed must be between 0.5 and 2.0');
      }
    }
    
    if (config.music.enabled) {
      if (config.music.volume < 0 || config.music.volume > 100) {
        errors.push('Music volume must be between 0 and 100');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get voice presets by persona
   */
  getVoicePresets(): Record<VoiceConfig['persona'], Partial<VoiceConfig>> {
    return {
      professional: { speed: 1.0, pitch: 0, stability: 0.7, clarity: 0.8 },
      casual: { speed: 1.1, pitch: 0, stability: 0.5, clarity: 0.7 },
      energetic: { speed: 1.2, pitch: 5, stability: 0.4, clarity: 0.75 },
      calm: { speed: 0.9, pitch: -3, stability: 0.8, clarity: 0.85 },
      authoritative: { speed: 0.95, pitch: -5, stability: 0.75, clarity: 0.9 },
    };
  }

  /**
   * Apply persona preset to voice config
   */
  applyPersonaPreset(config: VoiceConfig, persona: VoiceConfig['persona']): VoiceConfig {
    const presets = this.getVoicePresets();
    return { ...config, ...presets[persona], persona };
  }
}

export const audioGenerationConfigService = new AudioGenerationConfigService();
export default audioGenerationConfigService;
