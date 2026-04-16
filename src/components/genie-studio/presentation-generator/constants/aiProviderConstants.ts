/**
 * Comprehensive AI Provider Constants
 * Centralized configuration for all AI providers across the ecosystem
 */

export interface AIProviderOption {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  tier: 'tier-1' | 'tier-2' | 'tier-3';
  quality: 'ultra' | 'high' | 'standard' | 'basic';
  category: 'text' | 'image' | 'video' | 'voice' | 'translation' | 'multi-modal';
  capabilities: string[];
  recommended?: boolean;
}

// Text/LLM Providers
export const TEXT_PROVIDERS: AIProviderOption[] = [
  {
    id: 'gemini-3-flash',
    name: 'Google Gemini 3 Flash',
    shortName: 'Gemini 3',
    icon: '✨',
    description: 'Fastest, next-gen reasoning',
    tier: 'tier-1',
    quality: 'ultra',
    category: 'text',
    capabilities: ['reasoning', 'multimodal', 'streaming'],
    recommended: true,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Google Gemini 2.5 Pro',
    shortName: 'Gemini Pro',
    icon: '🌟',
    description: 'Top-tier reasoning & context',
    tier: 'tier-1',
    quality: 'ultra',
    category: 'text',
    capabilities: ['reasoning', 'multimodal', 'large-context'],
  },
  {
    id: 'gpt-5',
    name: 'OpenAI GPT-5',
    shortName: 'GPT-5',
    icon: '🤖',
    description: 'Advanced reasoning & nuance',
    tier: 'tier-1',
    quality: 'ultra',
    category: 'text',
    capabilities: ['reasoning', 'multimodal', 'accuracy'],
  },
  {
    id: 'gpt-5-mini',
    name: 'OpenAI GPT-5 Mini',
    shortName: 'GPT-5 Mini',
    icon: '⚡',
    description: 'Balanced speed & quality',
    tier: 'tier-1',
    quality: 'high',
    category: 'text',
    capabilities: ['fast', 'multimodal'],
  },
  {
    id: 'claude-opus-4-7',
    name: 'Anthropic Claude Opus 4.7',
    shortName: 'Claude Opus',
    icon: '🧠',
    description: 'Deep reasoning & safety',
    tier: 'tier-1',
    quality: 'ultra',
    category: 'text',
    capabilities: ['reasoning', 'safety', 'analysis'],
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Anthropic Claude Sonnet 4.6',
    shortName: 'Claude Sonnet',
    icon: '📝',
    description: 'Fast & capable',
    tier: 'tier-2',
    quality: 'high',
    category: 'text',
    capabilities: ['fast', 'reasoning'],
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    shortName: 'DeepSeek',
    icon: '🔍',
    description: 'Efficient coding & reasoning',
    tier: 'tier-2',
    quality: 'high',
    category: 'text',
    capabilities: ['coding', 'reasoning', 'efficient'],
  },
  {
    id: 'qwen-max',
    name: 'Alibaba Qwen Max',
    shortName: 'Qwen Max',
    icon: '🐼',
    description: 'Best for CJK languages',
    tier: 'tier-2',
    quality: 'high',
    category: 'text',
    capabilities: ['cjk', 'multilingual', 'reasoning'],
  },
  {
    id: 'qwen-plus',
    name: 'Alibaba Qwen Plus',
    shortName: 'Qwen Plus',
    icon: '🎋',
    description: 'Balanced CJK support',
    tier: 'tier-3',
    quality: 'standard',
    category: 'text',
    capabilities: ['cjk', 'fast'],
  },
];

// Image Generation Providers
export const IMAGE_PROVIDERS: AIProviderOption[] = [
  {
    id: 'modelslab-flux',
    name: 'ModelsLab Flux Pro',
    shortName: 'Flux Pro',
    icon: '🎨',
    description: 'Ultra-high quality images',
    tier: 'tier-1',
    quality: 'ultra',
    category: 'image',
    capabilities: ['photorealistic', 'artistic', 'fast'],
    recommended: true,
  },
  {
    id: 'gpt-image-1',
    name: 'OpenAI GPT Image 1',
    shortName: 'GPT Image 1',
    icon: '🖼️',
    description: 'Creative & detailed',
    tier: 'tier-1',
    quality: 'ultra',
    category: 'image',
    capabilities: ['creative', 'detailed', 'text-render'],
  },
  {
    id: 'gemini-imagen',
    name: 'Google Gemini Imagen',
    shortName: 'Imagen',
    icon: '🌈',
    description: 'Integrated text-to-image',
    tier: 'tier-1',
    quality: 'high',
    category: 'image',
    capabilities: ['fast', 'integrated'],
  },
  {
    id: 'stability-sdxl',
    name: 'Stability SDXL',
    shortName: 'SDXL',
    icon: '🎭',
    description: 'Open-source quality',
    tier: 'tier-2',
    quality: 'high',
    category: 'image',
    capabilities: ['open-source', 'customizable'],
  },
  {
    id: 'modelslab-realvis',
    name: 'ModelsLab RealVis',
    shortName: 'RealVis',
    icon: '📸',
    description: 'Photorealistic focus',
    tier: 'tier-2',
    quality: 'high',
    category: 'image',
    capabilities: ['photorealistic'],
  },
  {
    id: 'alibaba-wanx',
    name: 'Alibaba Wanx',
    shortName: 'Wanx',
    icon: '🏮',
    description: 'Asian aesthetic styles',
    tier: 'tier-3',
    quality: 'standard',
    category: 'image',
    capabilities: ['asian-style', 'fast'],
  },
];

// Video Generation Providers
export const VIDEO_PROVIDERS: AIProviderOption[] = [
  {
    id: 'modelslab-video',
    name: 'ModelsLab Video',
    shortName: 'ModelsLab',
    icon: '🎬',
    description: 'Text-to-video generation',
    tier: 'tier-1',
    quality: 'high',
    category: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    recommended: true,
  },
  {
    id: 'runway-gen3',
    name: 'Runway Gen-3',
    shortName: 'Runway',
    icon: '🎥',
    description: 'Premium video synthesis',
    tier: 'tier-1',
    quality: 'ultra',
    category: 'video',
    capabilities: ['high-quality', 'motion-control'],
  },
  {
    id: 'pika-labs',
    name: 'Pika Labs',
    shortName: 'Pika',
    icon: '⚡',
    description: 'Fast video generation',
    tier: 'tier-2',
    quality: 'high',
    category: 'video',
    capabilities: ['fast', 'stylized'],
  },
];

// Voice/TTS Providers
export const VOICE_PROVIDERS: AIProviderOption[] = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    shortName: 'ElevenLabs',
    icon: '🎙️',
    description: 'Premium voices with cloning',
    tier: 'tier-1',
    quality: 'ultra',
    category: 'voice',
    capabilities: ['voice-cloning', 'emotion', 'multilingual'],
    recommended: true,
  },
  {
    id: 'openai-tts',
    name: 'OpenAI TTS',
    shortName: 'OpenAI',
    icon: '🔊',
    description: 'Natural conversational',
    tier: 'tier-1',
    quality: 'high',
    category: 'voice',
    capabilities: ['natural', 'fast', 'consistent'],
  },
  {
    id: 'azure-neural',
    name: 'Azure Neural TTS',
    shortName: 'Azure',
    icon: '📡',
    description: 'Enterprise neural voices',
    tier: 'tier-1',
    quality: 'high',
    category: 'voice',
    capabilities: ['neural', 'custom-voice', 'ssml'],
  },
  {
    id: 'google-tts',
    name: 'Google Cloud TTS',
    shortName: 'Google',
    icon: '☁️',
    description: 'Wide language coverage',
    tier: 'tier-2',
    quality: 'high',
    category: 'voice',
    capabilities: ['multilingual', 'wavenet', 'ssml'],
  },
  {
    id: 'aws-polly',
    name: 'Amazon Polly',
    shortName: 'Polly',
    icon: '📢',
    description: 'Reliable cloud voices',
    tier: 'tier-2',
    quality: 'standard',
    category: 'voice',
    capabilities: ['ssml', 'lexicons', 'neural'],
  },
  {
    id: 'alibaba-tts',
    name: 'Alibaba TTS',
    shortName: 'Alibaba',
    icon: '🐼',
    description: 'Best for CJK languages',
    tier: 'tier-2',
    quality: 'high',
    category: 'voice',
    capabilities: ['cjk', 'natural', 'emotion'],
  },
];

// Translation Providers
export const TRANSLATION_PROVIDERS: AIProviderOption[] = [
  {
    id: 'deepl',
    name: 'DeepL Pro',
    shortName: 'DeepL',
    icon: '🌐',
    description: 'Best for European languages',
    tier: 'tier-1',
    quality: 'ultra',
    category: 'translation',
    capabilities: ['european', 'formal', 'accurate'],
    recommended: true,
  },
  {
    id: 'google-translate',
    name: 'Google Translate',
    shortName: 'Google',
    icon: '🔤',
    description: 'Widest language coverage',
    tier: 'tier-1',
    quality: 'high',
    category: 'translation',
    capabilities: ['wide-coverage', 'fast', 'neural'],
  },
  {
    id: 'azure-translator',
    name: 'Azure Translator',
    shortName: 'Azure',
    icon: '📝',
    description: 'Enterprise translation',
    tier: 'tier-1',
    quality: 'high',
    category: 'translation',
    capabilities: ['enterprise', 'custom-models', 'document'],
  },
  {
    id: 'qwen-mt',
    name: 'Alibaba Qwen MT',
    shortName: 'Qwen MT',
    icon: '🐼',
    description: 'Best for CJK languages',
    tier: 'tier-2',
    quality: 'high',
    category: 'translation',
    capabilities: ['cjk', 'asian', 'accurate'],
  },
  {
    id: 'gemini-translate',
    name: 'Gemini Translation',
    shortName: 'Gemini',
    icon: '✨',
    description: 'Context-aware translation',
    tier: 'tier-2',
    quality: 'high',
    category: 'translation',
    capabilities: ['context-aware', 'nuanced', 'multimodal'],
  },
  {
    id: 'nllb',
    name: 'Meta NLLB',
    shortName: 'NLLB',
    icon: '🌍',
    description: 'Low-resource languages',
    tier: 'tier-3',
    quality: 'standard',
    category: 'translation',
    capabilities: ['low-resource', 'african', 'indian'],
  },
];

// Agent types with their supported providers
export const AGENT_PROVIDER_MAP: Record<string, AIProviderOption[]> = {
  coordinator: TEXT_PROVIDERS.filter(p => ['gemini-3-flash', 'gpt-5', 'claude-opus-4-7'].includes(p.id)),
  slide_generator: TEXT_PROVIDERS,
  image_generator: IMAGE_PROVIDERS,
  translator: TRANSLATION_PROVIDERS,
  content_analyzer: TEXT_PROVIDERS.filter(p => p.tier !== 'tier-3'),
  enhancer: TEXT_PROVIDERS,
  voiceover: VOICE_PROVIDERS,
  video_generator: VIDEO_PROVIDERS,
};

// Get recommended provider for agent type
export function getRecommendedProvider(agentType: string): AIProviderOption | undefined {
  const providers = AGENT_PROVIDER_MAP[agentType] || TEXT_PROVIDERS;
  return providers.find(p => p.recommended) || providers[0];
}

// Get all providers for a category
export function getProvidersByCategory(category: AIProviderOption['category']): AIProviderOption[] {
  switch (category) {
    case 'text': return TEXT_PROVIDERS;
    case 'image': return IMAGE_PROVIDERS;
    case 'video': return VIDEO_PROVIDERS;
    case 'voice': return VOICE_PROVIDERS;
    case 'translation': return TRANSLATION_PROVIDERS;
    default: return TEXT_PROVIDERS;
  }
}

// Tier badge colors - aligned with globalTierService
export const TIER_COLORS: Record<string, string> = {
  'tier-1': 'bg-green-500/10 text-green-600 border-green-500/30',  // Standard = Cost-effective
  'tier-2': 'bg-blue-500/10 text-blue-600 border-blue-500/30',     // Advanced = Balanced
  'tier-3': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', // Premium = High quality
};

// Tier labels - aligned with Standard/Advanced/Premium global tier naming
export const TIER_LABELS: Record<string, string> = {
  'tier-1': 'Standard',   // 1.0x credits
  'tier-2': 'Advanced',   // 2.5x credits  
  'tier-3': 'Premium',    // 5.0x credits
};

// Credit multipliers per tier (for token estimation)
export const TIER_CREDIT_MULTIPLIERS: Record<string, number> = {
  'tier-1': 1.0,
  'tier-2': 2.5,
  'tier-3': 5.0,
};
