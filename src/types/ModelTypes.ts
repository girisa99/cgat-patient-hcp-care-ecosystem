/**
 * Model Types and Configuration
 * Supports both Large Language Models (API-based) and Small Language Models (local/edge)
 */

export type ModelProvider = 'openai' | 'anthropic' | 'huggingface' | 'local' | 'ollama' | 'webllm';

export type ModelSize = 'small' | 'medium' | 'large' | 'xl';

export type ModelCapability = 'text' | 'chat' | 'code' | 'medical' | 'embeddings' | 'classification';

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

export const ALL_MODELS = [...SMALL_LANGUAGE_MODELS, ...LARGE_LANGUAGE_MODELS];