/**
 * Shared AI Providers Configuration
 * 
 * SINGLE SOURCE OF TRUTH for AI provider selection across all 8 Genie Suite products:
 * Spark, Mind, Deck, Hub, Vibe, Cast, Ask Genie, and Genie Suite umbrella.
 * 
 * Follows "Zone suggests, user overrides freely" + "Both" (global + per-template) model.
 * Zone defaults are auto-suggested but any provider can be freely toggled by users.
 */

// ============================================
// TYPES
// ============================================

export type AIProviderCategory = 'video' | 'tts' | 'llm' | 'image' | '3d' | 'avatar' | 'audio';

export interface AIProviderEntry {
  value: string;
  label: string;
  icon: string;
  category: AIProviderCategory;
  priority: number;
  /** True if this is a zone-suggested default (pre-selected for new templates) */
  isDefault: boolean;
  /** Which regional zones this provider is optimized for */
  zones?: string[];
}

// ============================================
// CATEGORY METADATA (for UI grouping)
// ============================================

export const AI_PROVIDER_CATEGORIES: Record<AIProviderCategory, { label: string; icon: string; description: string }> = {
  video:  { label: 'Video Generation',  icon: '🎬', description: 'Text/Image to video generation' },
  tts:    { label: 'Text-to-Speech',    icon: '🔊', description: 'Voice synthesis and narration' },
  llm:    { label: 'Language Models',    icon: '🧠', description: 'Text generation and reasoning' },
  image:  { label: 'Image Generation',  icon: '🖼️', description: 'Text/prompt to image generation' },
  '3d':   { label: '3D / VR / AR',      icon: '🧊', description: '3D model and scene generation' },
  avatar: { label: 'Avatar / Presenter', icon: '👤', description: 'Digital humans and presenters' },
  audio:  { label: 'Audio / Music',     icon: '🎵', description: 'Music, SFX, and voice cloning' },
};

// ============================================
// MASTER PROVIDER REGISTRY
// ============================================

export const AI_PROVIDERS_REGISTRY: AIProviderEntry[] = [
  // VIDEO GENERATION - Veo 3 → Sora 2 → Wan 2.6
  { value: 'vertex_veo3', label: 'Vertex Veo 3', icon: '🎬', category: 'video', priority: 1, isDefault: true, zones: ['global'] },
  { value: 'sora2', label: 'Sora 2', icon: '🌟', category: 'video', priority: 2, isDefault: false, zones: ['western'] },
  { value: 'alibaba_wan26', label: 'Alibaba Wan 2.6', icon: '🌊', category: 'video', priority: 3, isDefault: false, zones: ['cjk'] },
  { value: 'modelslab', label: 'ModelsLab AnimateDiff', icon: '🎞️', category: 'video', priority: 4, isDefault: false },
  { value: 'replicate_svd', label: 'Replicate SVD', icon: '📹', category: 'video', priority: 5, isDefault: false },

  // TTS - Azure Neural (Primary) → Qwen3-TTS (CJK)
  { value: 'azure_neural', label: 'Azure Neural TTS', icon: '🔊', category: 'tts', priority: 1, isDefault: true, zones: ['western', 'europe', 'mena', 'india', 'latam', 'africa'] },
  { value: 'alibaba_qwen3_tts', label: 'Alibaba Qwen3-TTS', icon: '🗣️', category: 'tts', priority: 1, isDefault: false, zones: ['cjk'] },
  { value: 'elevenlabs', label: 'ElevenLabs', icon: '🎙️', category: 'tts', priority: 3, isDefault: false },
  { value: 'google_tts', label: 'Google Cloud TTS', icon: '📢', category: 'tts', priority: 4, isDefault: false },
  { value: 'amazon_polly', label: 'Amazon Polly', icon: '🔈', category: 'tts', priority: 5, isDefault: false },
  { value: 'openai_tts', label: 'OpenAI TTS', icon: '🎤', category: 'tts', priority: 6, isDefault: false },

  // LLM - Gemini 3 → GPT-4o → Claude → Qwen → DeepSeek
  { value: 'gemini3_pro', label: 'Gemini 3.0 Pro', icon: '🔮', category: 'llm', priority: 1, isDefault: true, zones: ['global'] },
  { value: 'openai_gpt4o', label: 'OpenAI GPT-4o', icon: '🧠', category: 'llm', priority: 2, isDefault: false },
  { value: 'claude_35', label: 'Claude 3.5 Sonnet', icon: '🎭', category: 'llm', priority: 3, isDefault: false },
  { value: 'alibaba_qwen', label: 'Alibaba Qwen-Max', icon: '🌊', category: 'llm', priority: 4, isDefault: false, zones: ['cjk'] },
  { value: 'deepseek_v3', label: 'DeepSeek V3', icon: '🔍', category: 'llm', priority: 5, isDefault: false },
  { value: 'gemini3_flash', label: 'Gemini 3.0 Flash', icon: '⚡', category: 'llm', priority: 6, isDefault: false },

  // IMAGE - Gemini 3 Pro → Imagen 3 → FLUX Pro
  { value: 'gemini3_image', label: 'Gemini 3 Pro Image', icon: '🖼️', category: 'image', priority: 1, isDefault: true },
  { value: 'vertex_imagen3', label: 'Vertex Imagen 3', icon: '🎨', category: 'image', priority: 2, isDefault: false },
  { value: 'flux_pro', label: 'FLUX Pro', icon: '✨', category: 'image', priority: 3, isDefault: false },
  { value: 'stability_sdxl', label: 'Stability SDXL', icon: '🌈', category: 'image', priority: 4, isDefault: false },
  { value: 'midjourney', label: 'Midjourney', icon: '🎆', category: 'image', priority: 5, isDefault: false },
  { value: 'openai_dalle', label: 'OpenAI DALL-E 3', icon: '🖌️', category: 'image', priority: 6, isDefault: false },

  // 3D/VR/AR - Meshy AI (Primary) → Alibaba 3D
  { value: 'meshy_ai', label: 'Meshy AI', icon: '🧊', category: '3d', priority: 1, isDefault: true },
  { value: 'alibaba_3d', label: 'Alibaba 3D', icon: '🔺', category: '3d', priority: 2, isDefault: false, zones: ['cjk'] },
  { value: 'rodin_gen1', label: 'Rodin Gen-1', icon: '🗿', category: '3d', priority: 3, isDefault: false },
  { value: 'tripo3d', label: 'Tripo3D AI', icon: '🔷', category: '3d', priority: 4, isDefault: false },
  { value: 'modelslab_3d', label: 'ModelsLab 3D', icon: '📦', category: '3d', priority: 5, isDefault: false },

  // AVATAR - Wan 2.2 S2V → OmniAvatar → HeyGen
  { value: 'alibaba_wan22', label: 'Alibaba Wan 2.2 S2V', icon: '👤', category: 'avatar', priority: 1, isDefault: true },
  { value: 'omni_avatar', label: 'OmniAvatar', icon: '🧑', category: 'avatar', priority: 2, isDefault: false },
  { value: 'tao_avatar', label: 'TaoAvatar', icon: '👥', category: 'avatar', priority: 3, isDefault: false, zones: ['cjk'] },
  { value: 'heygen', label: 'HeyGen', icon: '🎭', category: 'avatar', priority: 4, isDefault: false },
  { value: 'synthesia', label: 'Synthesia', icon: '📺', category: 'avatar', priority: 5, isDefault: false },
  { value: 'd_id', label: 'D-ID', icon: '🖥️', category: 'avatar', priority: 6, isDefault: false },

  // AUDIO - Voice Cloning, Music, SFX
  { value: 'suno_music', label: 'Suno AI Music', icon: '🎵', category: 'audio', priority: 1, isDefault: false },
  { value: 'udio_music', label: 'Udio Music', icon: '🎶', category: 'audio', priority: 2, isDefault: false },
  { value: 'elevenlabs_clone', label: 'ElevenLabs Voice Clone', icon: '🔊', category: 'audio', priority: 3, isDefault: false },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/** Get zone-suggested default provider values (pre-selected for new templates) */
export function getDefaultZoneProviders(): string[] {
  return AI_PROVIDERS_REGISTRY
    .filter(p => p.isDefault)
    .map(p => p.value);
}

/** Get providers filtered by category */
export function getProvidersByCategory(category: AIProviderCategory): AIProviderEntry[] {
  return AI_PROVIDERS_REGISTRY
    .filter(p => p.category === category)
    .sort((a, b) => a.priority - b.priority);
}

/** Get providers optimized for a specific zone */
export function getProvidersForZone(zone: string): AIProviderEntry[] {
  return AI_PROVIDERS_REGISTRY
    .filter(p => p.zones?.includes(zone) || p.zones?.includes('global'))
    .sort((a, b) => a.priority - b.priority);
}

/** Check if a provider is a zone-suggested default */
export function isZoneDefault(providerValue: string): boolean {
  const provider = AI_PROVIDERS_REGISTRY.find(p => p.value === providerValue);
  return provider?.isDefault ?? false;
}

/** Get all unique categories present in the registry */
export function getAvailableCategories(): AIProviderCategory[] {
  const categories = new Set(AI_PROVIDERS_REGISTRY.map(p => p.category));
  return Array.from(categories);
}

/** 
 * Merge global preferences with per-template overrides.
 * Per-template overrides take precedence.
 */
export function mergeProviderPreferences(
  globalProviders: string[],
  templateProviders?: string[]
): string[] {
  if (templateProviders && templateProviders.length > 0) {
    return templateProviders;
  }
  return globalProviders.length > 0 ? globalProviders : getDefaultZoneProviders();
}
