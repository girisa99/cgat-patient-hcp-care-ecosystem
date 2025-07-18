/**
 * Model Types and Configuration
 * Supports both Large Language Models (API-based) and Small Language Models (local/edge)
 */

export type ModelProvider = 'openai' | 'anthropic' | 'huggingface' | 'local' | 'ollama' | 'webllm';

export type ModelSize = 'small' | 'medium' | 'large' | 'xl';

export type ModelCapability = 'text' | 'chat' | 'code' | 'medical' | 'embeddings' | 'classification' | 'biotech' | 'pharma' | 'genomics' | 'speech-to-text' | 'text-to-speech';

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  modelId: string; // e.g., 'gpt-4o-mini', 'claude-3-haiku', 'microsoft/DialoGPT-small'
  size: ModelSize;
  capabilities: ModelCapability[];
  maxTokens: number;
  contextWindow: number;
  isLocal: boolean;
  requiresApiKey: boolean;
  costPerToken?: number; // For API models
  description: string;
  tags: string[];
  
  // Performance characteristics
  latency: 'low' | 'medium' | 'high';
  accuracy: 'low' | 'medium' | 'high' | 'very-high';
  
  // Hardware requirements (for local models)
  minRam?: number; // in GB
  preferredDevice?: 'cpu' | 'gpu' | 'webgpu';
  
  // API configuration
  apiEndpoint?: string;
  defaultParams?: Record<string, any>;
}

export interface UserModelPreferences {
  userId: string;
  preferredModels: {
    chat: string;
    code: string;
    medical: string;
    embeddings: string;
    classification: string;
  };
  fallbackStrategy: 'local-first' | 'api-first' | 'cost-optimized' | 'speed-optimized';
  maxCostPerRequest: number;
  allowLocalModels: boolean;
  performancePreference: 'speed' | 'accuracy' | 'cost' | 'privacy';
  autoDownloadModels: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModelRoutingRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    taskType?: ModelCapability[];
    userRole?: string[];
    requestSize?: { min?: number; max?: number };
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
  targetModel: string;
  fallbackModels: string[];
  isActive: boolean;
}

export interface ModelMetrics {
  modelId: string;
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  averageTokensPerRequest: number;
  totalCost: number;
  lastUsed: string;
  errorCount: number;
  userSatisfactionScore: number;
}

// Biotech/Pharma/Life Sciences Small Language Models
export const BIOTECH_PHARMA_MODELS: ModelConfig[] = [
  {
    id: 'hmcp-healthcare',
    name: 'Healthcare Model Context Protocol (HMCP)',
    provider: 'huggingface',
    modelId: 'healthcare/hmcp-foundation',
    size: 'medium',
    capabilities: ['medical', 'biotech', 'pharma', 'text', 'chat'],
    maxTokens: 8192,
    contextWindow: 16384,
    isLocal: true,
    requiresApiKey: false,
    latency: 'medium',
    accuracy: 'very-high',
    minRam: 4,
    preferredDevice: 'webgpu',
    description: 'Healthcare Model Context Protocol - Specialized for biotech/pharma workflows',
    tags: ['healthcare', 'biotech', 'pharma', 'specialized', 'hmcp']
  },
  {
    id: 'mistral-nemo-12b',
    name: 'Mistral Nemo 12B',
    provider: 'huggingface',
    modelId: 'mistralai/Mistral-Nemo-Instruct-2407',
    size: 'large',
    capabilities: ['text', 'chat', 'medical', 'biotech', 'pharma'],
    maxTokens: 8192,
    contextWindow: 128000,
    isLocal: true,
    requiresApiKey: false,
    latency: 'medium',
    accuracy: 'very-high',
    minRam: 8,
    preferredDevice: 'webgpu',
    description: 'Mistral Nemo 12B - Advanced model for complex biotech/pharma reasoning',
    tags: ['mistral', 'large', 'biotech', 'pharma', 'reasoning']
  },
  {
    id: 'qwen2-0.5b',
    name: 'Qwen2 0.5B',
    provider: 'huggingface',
    modelId: 'Qwen/Qwen2-0.5B-Instruct',
    size: 'small',
    capabilities: ['text', 'chat', 'medical'],
    maxTokens: 2048,
    contextWindow: 32768,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'medium',
    minRam: 1,
    preferredDevice: 'cpu',
    description: 'Qwen2 0.5B - Ultra-lightweight model for basic medical queries',
    tags: ['qwen', 'lightweight', 'medical', 'efficient']
  },
  {
    id: 'qwen2-1b',
    name: 'Qwen2 1B',
    provider: 'huggingface',
    modelId: 'Qwen/Qwen2-1.5B-Instruct',
    size: 'small',
    capabilities: ['text', 'chat', 'medical', 'biotech'],
    maxTokens: 4096,
    contextWindow: 32768,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'high',
    minRam: 2,
    preferredDevice: 'webgpu',
    description: 'Qwen2 1B - Efficient model for biotech applications',
    tags: ['qwen', 'biotech', 'efficient', 'medical']
  },
  {
    id: 'qwen2-7b',
    name: 'Qwen2 7B',
    provider: 'huggingface',
    modelId: 'Qwen/Qwen2-7B-Instruct',
    size: 'medium',
    capabilities: ['text', 'chat', 'medical', 'biotech', 'pharma', 'genomics'],
    maxTokens: 8192,
    contextWindow: 32768,
    isLocal: true,
    requiresApiKey: false,
    latency: 'medium',
    accuracy: 'very-high',
    minRam: 6,
    preferredDevice: 'webgpu',
    description: 'Qwen2 7B - Advanced model for complex pharma and genomics tasks',
    tags: ['qwen', 'pharma', 'genomics', 'advanced', 'biotech']
  },
  {
    id: 'llama-3.1-8b',
    name: 'Meta Llama 3.1 8B',
    provider: 'huggingface',
    modelId: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    size: 'medium',
    capabilities: ['text', 'chat', 'medical', 'biotech', 'pharma'],
    maxTokens: 8192,
    contextWindow: 128000,
    isLocal: true,
    requiresApiKey: false,
    latency: 'medium',
    accuracy: 'very-high',
    minRam: 6,
    preferredDevice: 'webgpu',
    description: 'Meta Llama 3.1 8B - Powerful model for biotech and pharma research',
    tags: ['meta', 'llama', 'biotech', 'pharma', 'research']
  },
  {
    id: 'phi-3.5-mini',
    name: 'Microsoft Phi-3.5 Mini',
    provider: 'huggingface',
    modelId: 'microsoft/Phi-3.5-mini-instruct',
    size: 'small',
    capabilities: ['text', 'chat', 'medical', 'biotech'],
    maxTokens: 4096,
    contextWindow: 128000,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'high',
    minRam: 3,
    preferredDevice: 'webgpu',
    description: 'Microsoft Phi-3.5 Mini - Enhanced for medical and biotech applications',
    tags: ['microsoft', 'phi', 'medical', 'biotech', 'efficient']
  },
  {
    id: 'cerebras-gpt',
    name: 'Cerebras-GPT',
    provider: 'huggingface',
    modelId: 'cerebras/Cerebras-GPT-2.7B',
    size: 'medium',
    capabilities: ['text', 'chat', 'medical', 'biotech'],
    maxTokens: 2048,
    contextWindow: 2048,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'high',
    minRam: 3,
    preferredDevice: 'webgpu',
    description: 'Cerebras-GPT - Optimized for biotech and medical reasoning',
    tags: ['cerebras', 'biotech', 'medical', 'optimized']
  },
  {
    id: 'lamini-gpt',
    name: 'LaMini-GPT',
    provider: 'huggingface',
    modelId: 'MBZUAI/LaMini-GPT-124M',
    size: 'small',
    capabilities: ['text', 'chat', 'medical'],
    maxTokens: 1024,
    contextWindow: 1024,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'medium',
    minRam: 1,
    preferredDevice: 'cpu',
    description: 'LaMini-GPT - Lightweight model for basic medical conversations',
    tags: ['lamini', 'lightweight', 'medical', 'basic']
  },
  {
    id: 'mobile-llama',
    name: 'Mobile Llama',
    provider: 'huggingface',
    modelId: 'aaditya/mobile-llama-1b',
    size: 'small',
    capabilities: ['text', 'chat', 'medical'],
    maxTokens: 2048,
    contextWindow: 2048,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'medium',
    minRam: 1,
    preferredDevice: 'cpu',
    description: 'Mobile Llama - Optimized for mobile healthcare applications',
    tags: ['mobile', 'healthcare', 'lightweight', 'portable']
  },
  {
    id: 'stablelm-zephyr',
    name: 'StableLM-Zephyr',
    provider: 'huggingface',
    modelId: 'stabilityai/stablelm-zephyr-3b',
    size: 'small',
    capabilities: ['text', 'chat', 'medical', 'biotech'],
    maxTokens: 4096,
    contextWindow: 4096,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'high',
    minRam: 3,
    preferredDevice: 'webgpu',
    description: 'StableLM-Zephyr - Stable model for biotech applications',
    tags: ['stability', 'zephyr', 'biotech', 'stable']
  },
  {
    id: 'gemma2-2b',
    name: 'Gemma2 2B',
    provider: 'huggingface',
    modelId: 'google/gemma-2-2b-it',
    size: 'small',
    capabilities: ['text', 'chat', 'medical', 'biotech'],
    maxTokens: 8192,
    contextWindow: 8192,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'high',
    minRam: 2,
    preferredDevice: 'webgpu',
    description: 'Gemma2 2B - Google enhanced model for biotech applications',
    tags: ['google', 'gemma2', 'biotech', 'enhanced']
  },
  {
    id: 'minicpm',
    name: 'MiniCPM',
    provider: 'huggingface',
    modelId: 'openbmb/MiniCPM-2B-sft-bf16',
    size: 'small',
    capabilities: ['text', 'chat', 'medical'],
    maxTokens: 4096,
    contextWindow: 4096,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'high',
    minRam: 2,
    preferredDevice: 'webgpu',
    description: 'MiniCPM - Compact model for medical applications',
    tags: ['mini', 'compact', 'medical', 'efficient']
  },
  {
    id: 'openelm',
    name: 'OpenELM',
    provider: 'huggingface',
    modelId: 'apple/OpenELM-1_1B-Instruct',
    size: 'small',
    capabilities: ['text', 'chat', 'medical'],
    maxTokens: 2048,
    contextWindow: 2048,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'medium',
    minRam: 1,
    preferredDevice: 'cpu',
    description: 'OpenELM - Apple efficient language model for medical use',
    tags: ['apple', 'openelm', 'medical', 'efficient']
  }
];

// Small Language Models specifically
export const SMALL_LANGUAGE_MODELS: ModelConfig[] = [
  {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini',
    provider: 'huggingface',
    modelId: 'microsoft/Phi-3-mini-4k-instruct',
    size: 'small',
    capabilities: ['text', 'chat', 'code'],
    maxTokens: 4096,
    contextWindow: 4096,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'high',
    minRam: 2,
    preferredDevice: 'webgpu',
    description: 'Microsoft Phi-3 Mini - High quality small model for chat and code',
    tags: ['microsoft', 'efficient', 'chat', 'code', 'local']
  },
  {
    id: 'llama-3.2-1b',
    name: 'Llama 3.2 1B',
    provider: 'huggingface',
    modelId: 'meta-llama/Llama-3.2-1B-Instruct',
    size: 'small',
    capabilities: ['text', 'chat'],
    maxTokens: 2048,
    contextWindow: 2048,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'medium',
    minRam: 1,
    preferredDevice: 'cpu',
    description: 'Meta Llama 3.2 1B - Ultra-lightweight model for basic chat',
    tags: ['meta', 'lightweight', 'chat', 'local']
  },
  {
    id: 'gemma-2b',
    name: 'Gemma 2B',
    provider: 'huggingface',
    modelId: 'google/gemma-2b-it',
    size: 'small',
    capabilities: ['text', 'chat', 'code'],
    maxTokens: 8192,
    contextWindow: 8192,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'high',
    minRam: 2,
    preferredDevice: 'webgpu',
    description: 'Google Gemma 2B - Efficient instruction-tuned model',
    tags: ['google', 'instruction-tuned', 'efficient', 'local']
  },
  {
    id: 'distilbert-base',
    name: 'DistilBERT Base',
    provider: 'huggingface',
    modelId: 'distilbert-base-uncased',
    size: 'small',
    capabilities: ['embeddings', 'classification'],
    maxTokens: 512,
    contextWindow: 512,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'medium',
    minRam: 0.5,
    preferredDevice: 'cpu',
    description: 'DistilBERT - Fast embeddings and classification model',
    tags: ['bert', 'embeddings', 'classification', 'fast', 'local']
  },
  {
    id: 'tinyllama-1.1b',
    name: 'TinyLlama 1.1B',
    provider: 'huggingface',
    modelId: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
    size: 'small',
    capabilities: ['text', 'chat'],
    maxTokens: 2048,
    contextWindow: 2048,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'medium',
    minRam: 1,
    preferredDevice: 'cpu',
    description: 'TinyLlama 1.1B - Ultra-fast lightweight chat model',
    tags: ['tiny', 'fast', 'chat', 'local', 'lightweight']
  }
];

// Large Language Models (API-based)
export const LARGE_LANGUAGE_MODELS: ModelConfig[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    size: 'medium',
    capabilities: ['text', 'chat', 'code'],
    maxTokens: 16384,
    contextWindow: 128000,
    isLocal: false,
    requiresApiKey: true,
    latency: 'medium',
    accuracy: 'very-high',
    costPerToken: 0.00015,
    description: 'OpenAI GPT-4o Mini - Fast and affordable',
    tags: ['openai', 'fast', 'affordable', 'api']
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    modelId: 'claude-3-haiku-20240307',
    size: 'medium',
    capabilities: ['text', 'chat', 'code'],
    maxTokens: 4096,
    contextWindow: 200000,
    isLocal: false,
    requiresApiKey: true,
    latency: 'low',
    accuracy: 'high',
    costPerToken: 0.00025,
    description: 'Anthropic Claude 3 Haiku - Fast and efficient',
    tags: ['anthropic', 'fast', 'efficient', 'api']
  }
];

// Speech-to-Text and Text-to-Speech Models
export const SPEECH_MODELS: ModelConfig[] = [
  {
    id: 'whisper-large-v3',
    name: 'Whisper Large v3',
    provider: 'openai',
    modelId: 'whisper-1',
    size: 'large',
    capabilities: ['speech-to-text'],
    maxTokens: 4096,
    contextWindow: 4096,
    isLocal: false,
    requiresApiKey: true,
    latency: 'medium',
    accuracy: 'very-high',
    costPerToken: 0.006,
    description: 'OpenAI Whisper - Advanced speech recognition for medical conversations',
    tags: ['openai', 'speech', 'medical', 'transcription', 'multilingual']
  },
  {
    id: 'whisper-small-local',
    name: 'Whisper Small (Local)',
    provider: 'huggingface',
    modelId: 'openai/whisper-small',
    size: 'small',
    capabilities: ['speech-to-text'],
    maxTokens: 4096,
    contextWindow: 4096,
    isLocal: true,
    requiresApiKey: false,
    latency: 'low',
    accuracy: 'high',
    minRam: 2,
    preferredDevice: 'webgpu',
    description: 'Whisper Small - Local speech recognition for privacy-sensitive conversations',
    tags: ['whisper', 'local', 'privacy', 'speech', 'medical']
  },
  {
    id: 'tts-1',
    name: 'OpenAI TTS-1',
    provider: 'openai',
    modelId: 'tts-1',
    size: 'medium',
    capabilities: ['text-to-speech'],
    maxTokens: 4096,
    contextWindow: 4096,
    isLocal: false,
    requiresApiKey: true,
    latency: 'low',
    accuracy: 'very-high',
    costPerToken: 0.015,
    description: 'OpenAI TTS-1 - High-quality text-to-speech for patient communications',
    tags: ['openai', 'tts', 'speech', 'patient', 'communication']
  },
  {
    id: 'tts-1-hd',
    name: 'OpenAI TTS-1 HD',
    provider: 'openai',
    modelId: 'tts-1-hd',
    size: 'large',
    capabilities: ['text-to-speech'],
    maxTokens: 4096,
    contextWindow: 4096,
    isLocal: false,
    requiresApiKey: true,
    latency: 'medium',
    accuracy: 'very-high',
    costPerToken: 0.030,
    description: 'OpenAI TTS-1 HD - Premium quality text-to-speech for professional healthcare communications',
    tags: ['openai', 'tts', 'hd', 'professional', 'healthcare']
  }
];

export const ALL_MODELS = [...BIOTECH_PHARMA_MODELS, ...SMALL_LANGUAGE_MODELS, ...LARGE_LANGUAGE_MODELS, ...SPEECH_MODELS];