/**
 * Universal AI Hub - Types
 * 
 * Unified types for all AI operations across Genie Suite
 */

import type { AICapability, AIProviderKey } from './providerRegistry';

// Re-export provider types
export type { AICapability, AIProviderKey } from './providerRegistry';

// ============================================
// GENIE PRODUCT CONTEXT
// ============================================

export type GenieProduct = 'spark' | 'mind' | 'vibe' | 'arc' | 'deck' | 'hub' | 'ask_genie';

export interface AIRequestContext {
  product: GenieProduct;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  preferredProvider?: AIProviderKey;
  costSensitive?: boolean;
  qualityFirst?: boolean;
  language?: string;
  domain?: string;
  metadata?: Record<string, any>;
}

// ============================================
// CONFIDENCE SCORING (Unified)
// ============================================

export interface ConfidenceScore {
  overall: number;        // 0-1 aggregate score
  breakdown: {
    accuracy: number;
    completeness: number;
    quality: number;
    reliability: number;
  };
  provider: string;
  model?: string;
  processingTimeMs: number;
  warnings?: string[];
  fallbackUsed?: string;
}

// ============================================
// LLM / CHAT TYPES
// ============================================

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  provider?: AIProviderKey;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  context?: any;
  streaming?: boolean;
}

export interface LLMResponse {
  content: string;
  confidence: ConfidenceScore;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  provider?: AIProviderKey;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}

export interface ChatResponse extends LLMResponse {
  messages: ChatMessage[];
}

// ============================================
// TRANSLATION TYPES
// ============================================

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider?: AIProviderKey;
  formality?: 'formal' | 'informal' | 'neutral';
  domain?: 'general' | 'legal' | 'medical' | 'technical' | 'marketing' | 'creative';
  glossary?: Record<string, string>;
  preserveFormatting?: boolean;
}

export interface TranslationResponse {
  translatedText: string;
  confidence: ConfidenceScore;
  detectedLanguage?: string;
  alternativeTranslations?: string[];
  metadata: {
    characterCount: number;
    wordCount: number;
    estimatedCost: number;
  };
}

// ============================================
// VISION / OCR TYPES
// ============================================

export interface VisionRequest {
  image: string | Blob;     // URL, base64, or Blob
  inputType: 'url' | 'base64' | 'blob';
  provider?: AIProviderKey;
  operation: 'analyze' | 'ocr' | 'describe' | 'extract';
  prompt?: string;          // For analyze/describe
  documentType?: string;    // For OCR
  language?: string;
}

export interface VisionResponse {
  content: string;          // Analysis text or OCR text
  confidence: ConfidenceScore;
  structure?: {
    tables?: any[];
    keyValuePairs?: Record<string, string>;
    entities?: ExtractedEntity[];
  };
  metadata: {
    imageSize?: { width: number; height: number };
    detectedLanguage?: string;
    pageCount?: number;
  };
}

export interface ExtractedEntity {
  type: string;
  value: string;
  confidence: number;
}

// ============================================
// TTS / STT TYPES
// ============================================

export interface TTSRequest {
  text: string;
  provider?: AIProviderKey;
  voice?: string;
  language?: string;
  speed?: number;
  pitch?: number;
  style?: string;
  outputFormat?: 'mp3' | 'wav' | 'ogg';
}

export interface TTSResponse {
  audioUrl: string;
  audioBlob?: Blob;
  duration: number;
  confidence: ConfidenceScore;
  voice: string;
  metadata: {
    characterCount: number;
    estimatedCost: number;
    format: string;
  };
}

export interface STTRequest {
  audio: string | Blob;
  inputType: 'url' | 'base64' | 'blob';
  provider?: AIProviderKey;
  language?: string;
  options?: {
    punctuation?: boolean;
    speakerDiarization?: boolean;
    wordTimestamps?: boolean;
  };
}

export interface STTResponse {
  text: string;
  confidence: ConfidenceScore;
  language?: string;
  words?: { word: string; startTime: number; endTime: number; confidence: number }[];
  speakers?: { speakerId: string; text: string }[];
  metadata: {
    durationSeconds: number;
    wordCount: number;
  };
}

// ============================================
// IMAGE GENERATION TYPES
// ============================================

export interface ImageGenRequest {
  prompt: string;
  provider?: AIProviderKey;
  style?: string;
  size?: '512x512' | '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'high' | 'hd';
  numberOfImages?: number;
  negativePrompt?: string;
  referenceImage?: string;
}

export interface ImageGenResponse {
  images: GeneratedImage[];
  confidence: ConfidenceScore;
  metadata: {
    promptUsed: string;
    revisedPrompt?: string;
    estimatedCost: number;
  };
}

export interface GeneratedImage {
  url: string;
  base64?: string;
  width: number;
  height: number;
  format: string;
}

// ============================================
// VIDEO GENERATION TYPES
// ============================================

export interface VideoGenRequest {
  prompt: string;
  provider?: AIProviderKey;
  duration?: number;        // seconds
  aspectRatio?: '16:9' | '9:16' | '1:1';
  quality?: 'standard' | 'high';
  referenceImage?: string;  // For image-to-video
}

export interface VideoGenResponse {
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  confidence: ConfidenceScore;
  metadata: {
    promptUsed: string;
    estimatedCost: number;
    format: string;
  };
}

// ============================================
// MUSIC / SFX GENERATION TYPES
// ============================================

export interface MusicGenRequest {
  prompt: string;
  provider?: AIProviderKey;
  duration?: number;        // seconds
  genre?: string;
  mood?: string;
}

export interface MusicGenResponse {
  audioUrl: string;
  audioBlob?: Blob;
  duration: number;
  confidence: ConfidenceScore;
  metadata: {
    promptUsed: string;
    estimatedCost: number;
  };
}

export interface SFXGenRequest {
  prompt: string;
  provider?: AIProviderKey;
  duration?: number;        // 0.5-22 seconds for ElevenLabs
  promptInfluence?: number; // 0-1
}

export interface SFXGenResponse {
  audioUrl: string;
  audioBlob?: Blob;
  duration: number;
  confidence: ConfidenceScore;
  metadata: {
    promptUsed: string;
    estimatedCost: number;
  };
}

// ============================================
// VOICE CLONING TYPES
// ============================================

export interface VoiceCloneRequest {
  action: 'create' | 'generate' | 'list' | 'delete';
  provider?: AIProviderKey;
  voiceId?: string;
  name?: string;
  description?: string;
  audioSamples?: string[];  // Base64 encoded audio files for cloning
  text?: string;            // Text to synthesize with cloned voice
  settings?: {
    stability?: number;     // 0-1
    similarity?: number;    // 0-1
    style?: number;         // 0-1
  };
}

export interface VoiceCloneResponse {
  voiceId?: string;
  name?: string;
  status: string;
  audioUrl?: string;
  audioBase64?: string;
  duration?: number;
  voices?: ClonedVoice[];
  confidence: ConfidenceScore;
}

export interface ClonedVoice {
  voiceId: string;
  name: string;
  category: string;
  labels?: Record<string, string>;
}

// ============================================
// TEXT TO VIDEO DIRECT TYPES
// ============================================

export interface TextToVideoRequest {
  prompt: string;
  provider?: AIProviderKey;
  style?: 'cinematic' | 'realistic' | 'animated' | 'documentary';
  duration?: number;        // seconds
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  quality?: 'standard' | 'high' | 'ultra';
  voiceover?: {
    enabled: boolean;
    voice?: string;
    language?: string;
  };
  backgroundMusic?: {
    enabled: boolean;
    style?: string;
  };
}

export interface TextToVideoResponse {
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  confidence: ConfidenceScore;
  metadata: {
    promptUsed: string;
    style: string;
    hasVoiceover: boolean;
    hasBackgroundMusic: boolean;
    estimatedCost: number;
    format: string;
  };
}

// ============================================
// NLP TYPES
// ============================================

export type NLPOperation = 
  | 'entity_extraction'
  | 'sentiment_analysis'
  | 'summarization'
  | 'keyword_extraction'
  | 'classification'
  | 'language_detection';

export interface NLPRequest {
  text: string;
  provider?: AIProviderKey;
  operations: NLPOperation[];
  language?: string;
  domain?: string;
}

export interface NLPResponse {
  entities?: ExtractedEntity[];
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral' | 'mixed';
    confidence: number;
  };
  summary?: string;
  keywords?: { keyword: string; score: number }[];
  classification?: { label: string; confidence: number }[];
  language?: { detected: string; confidence: number };
  confidence: ConfidenceScore;
}

// ============================================
// AGENT WORKFLOW TYPES
// ============================================

export interface AgentWorkflowRequest {
  prompt: string;
  provider?: AIProviderKey;
  includeTemplates?: boolean;
  generateConnections?: boolean;
}

export interface AgentWorkflowResponse {
  workflow: any;
  confidence: ConfidenceScore;
  suggestions?: string[];
}

// ============================================
// UNIVERSAL AI HUB STATE
// ============================================

export interface AIHubState {
  isLoading: boolean;
  error: string | null;
  lastCapability: AICapability | null;
  lastProvider: AIProviderKey | null;
  configuredProviders: Set<AIProviderKey>;
}

export interface AIHubConfig {
  defaultProviders: Partial<Record<AICapability, AIProviderKey>>;
  enableFallback: boolean;
  maxRetries: number;
  timeoutMs: number;
  costSensitive: boolean;
  qualityFirst: boolean;
}
