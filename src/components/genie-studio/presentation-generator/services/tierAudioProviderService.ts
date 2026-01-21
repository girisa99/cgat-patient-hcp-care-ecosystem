/**
 * Tier-Based Audio Provider Service
 * Routes audio generation (Voice, Music, SFX) based on global tier selection
 * 
 * Tier 1 (Standard): Basic providers - Google, AWS Polly
 * Tier 2 (Advanced): Balanced quality - OpenAI, Azure
 * Tier 3 (Premium): Best quality - ElevenLabs, Premium Azure
 */

export type GlobalTier = 1 | 2 | 3;

export type AudioType = 'voice' | 'music' | 'sfx';

export interface AudioProviderConfig {
  providerId: string;
  providerName: string;
  quality: 'basic' | 'standard' | 'high' | 'premium';
  tier: GlobalTier;
  capabilities: string[];
  costMultiplier: number;
  languagesSupported: number;
  supportsCloning?: boolean;
  maxDuration?: number; // seconds
}

// Voice TTS Providers by Tier
export const VOICE_PROVIDERS_BY_TIER: Record<GlobalTier, AudioProviderConfig[]> = {
  1: [
    {
      providerId: 'google-standard',
      providerName: 'Google Standard TTS',
      quality: 'standard',
      tier: 1,
      capabilities: ['ssml', 'multilingual'],
      costMultiplier: 1,
      languagesSupported: 80,
    },
    {
      providerId: 'aws-polly-standard',
      providerName: 'AWS Polly Standard',
      quality: 'standard',
      tier: 1,
      capabilities: ['ssml', 'lexicons'],
      costMultiplier: 1,
      languagesSupported: 60,
    },
  ],
  2: [
    {
      providerId: 'openai-tts',
      providerName: 'OpenAI TTS',
      quality: 'high',
      tier: 2,
      capabilities: ['neural', 'fast', 'consistent'],
      costMultiplier: 1.5,
      languagesSupported: 57,
    },
    {
      providerId: 'google-wavenet',
      providerName: 'Google WaveNet',
      quality: 'high',
      tier: 2,
      capabilities: ['neural', 'ssml', 'multilingual'],
      costMultiplier: 1.5,
      languagesSupported: 80,
    },
    {
      providerId: 'azure-neural',
      providerName: 'Azure Neural TTS',
      quality: 'high',
      tier: 2,
      capabilities: ['neural', 'custom-voice', 'enterprise'],
      costMultiplier: 1.5,
      languagesSupported: 75,
    },
  ],
  3: [
    {
      providerId: 'elevenlabs',
      providerName: 'ElevenLabs',
      quality: 'premium',
      tier: 3,
      capabilities: ['voice-cloning', 'emotion', 'multilingual', 'ultra-realistic'],
      costMultiplier: 3,
      languagesSupported: 29,
      supportsCloning: true,
    },
    {
      providerId: 'elevenlabs-multilingual',
      providerName: 'ElevenLabs Multilingual v2',
      quality: 'premium',
      tier: 3,
      capabilities: ['voice-cloning', 'emotion', 'multilingual', '29-languages'],
      costMultiplier: 3.5,
      languagesSupported: 29,
      supportsCloning: true,
    },
    {
      providerId: 'azure-neural-hd',
      providerName: 'Azure Neural HD',
      quality: 'premium',
      tier: 3,
      capabilities: ['neural-hd', 'custom-voice', 'enterprise-sla', 'hipaa'],
      costMultiplier: 2.5,
      languagesSupported: 300,
    },
  ],
};

// Music Generation Providers by Tier
export const MUSIC_PROVIDERS_BY_TIER: Record<GlobalTier, AudioProviderConfig[]> = {
  1: [
    {
      providerId: 'basic-loops',
      providerName: 'Royalty-Free Loops',
      quality: 'basic',
      tier: 1,
      capabilities: ['pre-generated', 'royalty-free'],
      costMultiplier: 0.5,
      languagesSupported: 0,
      maxDuration: 60,
    },
  ],
  2: [
    {
      providerId: 'suno-basic',
      providerName: 'Suno Basic',
      quality: 'high',
      tier: 2,
      capabilities: ['ai-generated', 'genre-selection'],
      costMultiplier: 2,
      languagesSupported: 0,
      maxDuration: 120,
    },
    {
      providerId: 'mubert',
      providerName: 'Mubert',
      quality: 'high',
      tier: 2,
      capabilities: ['ai-generated', 'real-time', 'genre-selection'],
      costMultiplier: 1.5,
      languagesSupported: 0,
      maxDuration: 180,
    },
  ],
  3: [
    {
      providerId: 'elevenlabs-music',
      providerName: 'ElevenLabs Music',
      quality: 'premium',
      tier: 3,
      capabilities: ['ai-generated', 'studio-quality', 'custom-prompts'],
      costMultiplier: 4,
      languagesSupported: 0,
      maxDuration: 300,
    },
    {
      providerId: 'suno-pro',
      providerName: 'Suno Pro',
      quality: 'premium',
      tier: 3,
      capabilities: ['ai-generated', 'lyrics', 'full-production'],
      costMultiplier: 3,
      languagesSupported: 0,
      maxDuration: 240,
    },
  ],
};

// SFX Generation Providers by Tier
export const SFX_PROVIDERS_BY_TIER: Record<GlobalTier, AudioProviderConfig[]> = {
  1: [
    {
      providerId: 'freesound',
      providerName: 'Freesound Library',
      quality: 'basic',
      tier: 1,
      capabilities: ['pre-generated', 'royalty-free'],
      costMultiplier: 0,
      languagesSupported: 0,
      maxDuration: 10,
    },
  ],
  2: [
    {
      providerId: 'adobe-enhance',
      providerName: 'Adobe Podcast SFX',
      quality: 'high',
      tier: 2,
      capabilities: ['ai-enhanced', 'variety'],
      costMultiplier: 1.5,
      languagesSupported: 0,
      maxDuration: 15,
    },
  ],
  3: [
    {
      providerId: 'elevenlabs-sfx',
      providerName: 'ElevenLabs Sound Effects',
      quality: 'premium',
      tier: 3,
      capabilities: ['ai-generated', 'text-to-sfx', 'custom-prompts'],
      costMultiplier: 2,
      languagesSupported: 0,
      maxDuration: 22,
    },
  ],
};

// Get providers by audio type and tier
export function getAudioProviders(
  audioType: AudioType,
  tier: GlobalTier
): AudioProviderConfig[] {
  switch (audioType) {
    case 'voice':
      return VOICE_PROVIDERS_BY_TIER[tier] || VOICE_PROVIDERS_BY_TIER[1];
    case 'music':
      return MUSIC_PROVIDERS_BY_TIER[tier] || MUSIC_PROVIDERS_BY_TIER[1];
    case 'sfx':
      return SFX_PROVIDERS_BY_TIER[tier] || SFX_PROVIDERS_BY_TIER[1];
    default:
      return [];
  }
}

// Get default provider for tier
export function getDefaultAudioProvider(
  audioType: AudioType,
  tier: GlobalTier
): AudioProviderConfig | undefined {
  const providers = getAudioProviders(audioType, tier);
  return providers[0];
}

// Get all providers up to and including tier (for compatibility)
export function getProvidersUpToTier(
  audioType: AudioType,
  maxTier: GlobalTier
): AudioProviderConfig[] {
  const allProviders: AudioProviderConfig[] = [];
  for (let t = 1; t <= maxTier; t++) {
    allProviders.push(...getAudioProviders(audioType, t as GlobalTier));
  }
  return allProviders;
}

// Language-voice pairing for regional optimization
export interface LanguageVoicePairing {
  languageCode: string;
  recommendedVoiceProviders: string[];
  fallbackProviders: string[];
  nativeVoiceIds?: Record<string, string>;
}

export const LANGUAGE_VOICE_PAIRINGS: LanguageVoicePairing[] = [
  // CJK Languages - Alibaba/Azure preferred
  { 
    languageCode: 'zh', 
    recommendedVoiceProviders: ['alibaba-cosyvoice', 'azure-neural'],
    fallbackProviders: ['google-wavenet', 'elevenlabs'],
    nativeVoiceIds: { 'alibaba-cosyvoice': 'longxiaochun', 'azure-neural': 'zh-CN-XiaoxiaoNeural' }
  },
  { 
    languageCode: 'ja', 
    recommendedVoiceProviders: ['azure-neural', 'google-wavenet'],
    fallbackProviders: ['elevenlabs', 'openai-tts'],
    nativeVoiceIds: { 'azure-neural': 'ja-JP-NanamiNeural' }
  },
  { 
    languageCode: 'ko', 
    recommendedVoiceProviders: ['azure-neural', 'google-wavenet'],
    fallbackProviders: ['elevenlabs'],
    nativeVoiceIds: { 'azure-neural': 'ko-KR-SunHiNeural' }
  },
  
  // European Languages - ElevenLabs/Google preferred
  { 
    languageCode: 'en', 
    recommendedVoiceProviders: ['elevenlabs', 'openai-tts', 'azure-neural'],
    fallbackProviders: ['google-wavenet', 'aws-polly-standard'],
    nativeVoiceIds: { 'elevenlabs': 'JBFqnCBsd6RMkjVDRZzb', 'openai-tts': 'alloy' }
  },
  { 
    languageCode: 'es', 
    recommendedVoiceProviders: ['elevenlabs', 'azure-neural'],
    fallbackProviders: ['google-wavenet'],
    nativeVoiceIds: { 'azure-neural': 'es-ES-ElviraNeural' }
  },
  { 
    languageCode: 'fr', 
    recommendedVoiceProviders: ['elevenlabs', 'azure-neural'],
    fallbackProviders: ['google-wavenet'],
    nativeVoiceIds: { 'azure-neural': 'fr-FR-DeniseNeural' }
  },
  { 
    languageCode: 'de', 
    recommendedVoiceProviders: ['elevenlabs', 'azure-neural'],
    fallbackProviders: ['google-wavenet'],
    nativeVoiceIds: { 'azure-neural': 'de-DE-KatjaNeural' }
  },
  
  // Arabic - Azure/Google preferred
  { 
    languageCode: 'ar', 
    recommendedVoiceProviders: ['azure-neural', 'google-wavenet'],
    fallbackProviders: ['aws-polly-standard'],
    nativeVoiceIds: { 'azure-neural': 'ar-SA-HamedNeural' }
  },
  
  // Indian Languages - Azure/Google preferred
  { 
    languageCode: 'hi', 
    recommendedVoiceProviders: ['azure-neural', 'google-wavenet'],
    fallbackProviders: ['aws-polly-standard'],
    nativeVoiceIds: { 'azure-neural': 'hi-IN-SwaraNeural' }
  },
];

// Get recommended provider for language
export function getRecommendedVoiceProvider(
  languageCode: string,
  availableTier: GlobalTier
): { providerId: string; voiceId?: string } {
  const pairing = LANGUAGE_VOICE_PAIRINGS.find(p => p.languageCode === languageCode);
  const availableProviders = getProvidersUpToTier('voice', availableTier);
  const availableIds = availableProviders.map(p => p.providerId);
  
  if (pairing) {
    // Find first recommended provider that's available in tier
    const recommendedId = pairing.recommendedVoiceProviders.find(p => availableIds.includes(p));
    if (recommendedId) {
      return { 
        providerId: recommendedId, 
        voiceId: pairing.nativeVoiceIds?.[recommendedId] 
      };
    }
    
    // Try fallback providers
    const fallbackId = pairing.fallbackProviders.find(p => availableIds.includes(p));
    if (fallbackId) {
      return { 
        providerId: fallbackId, 
        voiceId: pairing.nativeVoiceIds?.[fallbackId] 
      };
    }
  }
  
  // Default to first available provider
  const defaultProvider = getDefaultAudioProvider('voice', availableTier);
  return { providerId: defaultProvider?.providerId || 'google-standard' };
}

// Audio config for generation request
export interface TierAudioConfig {
  globalTier: GlobalTier;
  voiceEnabled: boolean;
  voiceProvider: AudioProviderConfig | null;
  voiceId?: string;
  voiceSettings?: {
    speed: number;
    pitch: number;
    stability?: number;
  };
  musicEnabled: boolean;
  musicProvider: AudioProviderConfig | null;
  musicPrompt?: string;
  musicDuration?: number;
  sfxEnabled: boolean;
  sfxProvider: AudioProviderConfig | null;
  sfxPrompts?: string[];
}

// Build audio config based on output type and tier
export function buildTierAudioConfig(
  outputType: string,
  globalTier: GlobalTier,
  userOverrides?: Partial<TierAudioConfig>
): TierAudioConfig {
  // Determine what audio is required based on output type
  const requiresVoice = ['video-full', 'video-intro', '3d-animated', '2d-animated'].includes(outputType);
  const requiresMusic = ['video-full', '3d-animated'].includes(outputType);
  const requiresSfx = ['video-full', 'interactive', '3d-animated'].includes(outputType);
  
  const baseConfig: TierAudioConfig = {
    globalTier,
    voiceEnabled: requiresVoice,
    voiceProvider: requiresVoice ? getDefaultAudioProvider('voice', globalTier) || null : null,
    musicEnabled: requiresMusic,
    musicProvider: requiresMusic ? getDefaultAudioProvider('music', globalTier) || null : null,
    sfxEnabled: requiresSfx,
    sfxProvider: requiresSfx ? getDefaultAudioProvider('sfx', globalTier) || null : null,
  };
  
  // Apply user overrides
  if (userOverrides) {
    return { ...baseConfig, ...userOverrides };
  }
  
  return baseConfig;
}

// Token cost calculation for audio
export function calculateAudioTokenCost(config: TierAudioConfig, slideCount: number): number {
  let totalTokens = 0;
  
  if (config.voiceEnabled && config.voiceProvider) {
    // ~500 tokens per slide for voiceover
    totalTokens += slideCount * 500 * config.voiceProvider.costMultiplier;
  }
  
  if (config.musicEnabled && config.musicProvider) {
    // Fixed 5000 tokens for music generation
    totalTokens += 5000 * config.musicProvider.costMultiplier;
  }
  
  if (config.sfxEnabled && config.sfxProvider) {
    // ~200 tokens per SFX, estimate 3 per presentation
    totalTokens += 600 * config.sfxProvider.costMultiplier;
  }
  
  return Math.ceil(totalTokens);
}

// Export service object
export const tierAudioProviderService = {
  getAudioProviders,
  getDefaultAudioProvider,
  getProvidersUpToTier,
  getRecommendedVoiceProvider,
  buildTierAudioConfig,
  calculateAudioTokenCost,
  VOICE_PROVIDERS_BY_TIER,
  MUSIC_PROVIDERS_BY_TIER,
  SFX_PROVIDERS_BY_TIER,
  LANGUAGE_VOICE_PAIRINGS,
};
