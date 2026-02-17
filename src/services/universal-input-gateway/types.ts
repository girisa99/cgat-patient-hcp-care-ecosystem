/**
 * Universal Input Gateway (UIG) - Type Definitions
 * 
 * Standardized interfaces for multi-modal input processing across the Genie ecosystem.
 * Supports Text, Image, Video, Audio, URL, Document, and Screen Recording inputs.
 */

import type { IndustryId, FrameworkId, VisualFeatureId, OutputFormatId } from '@/components/ai-hub/provider-matrix/generation-coverage/types';

// ==========================================
// INPUT TYPES
// ==========================================

export type InputType = 
  | 'text'
  | 'image' 
  | 'video'
  | 'audio'
  | 'url'
  | 'document'
  | 'screen';

export type InputMode = 'auto' | 'hybrid' | 'custom';

export type ProcessingStatus = 
  | 'idle'
  | 'detecting'
  | 'uploading'
  | 'processing'
  | 'analyzing'
  | 'complete'
  | 'error';

// ==========================================
// RAW INPUT (Before Processing)
// ==========================================

export interface RawInput {
  type: InputType;
  source: File | Blob | string | MediaStream;
  fileName?: string;
  mimeType?: string;
  size?: number;
}

// ==========================================
// EXTRACTED CONTENT
// ==========================================

export interface ExtractedContent {
  // Text content (always present after processing)
  text: string;
  markdown?: string;
  
  // Structured data (if applicable)
  tables?: Array<{
    headers: string[];
    rows: string[][];
  }>;
  lists?: string[][];
  headings?: Array<{
    level: number;
    text: string;
  }>;
  
  // Media references
  images?: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  
  // Code blocks (for technical content)
  codeBlocks?: Array<{
    language: string;
    code: string;
  }>;
}

// ==========================================
// AI-ENHANCED METADATA
// ==========================================

export interface InputAnalysis {
  // Detected language
  language: {
    code: string;
    name: string;
    confidence: number;
  };
  
  // Content classification
  contentType: {
    primary: string; // 'technical', 'marketing', 'educational', 'financial', etc.
    secondary?: string;
    confidence: number;
  };
  
  // Sentiment and tone
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  tone: string[]; // ['professional', 'informative', 'persuasive']
  
  // Key entities
  entities: Array<{
    text: string;
    type: 'person' | 'organization' | 'location' | 'product' | 'date' | 'metric' | 'other';
  }>;
  
  // Topics and keywords
  topics: string[];
  keywords: string[];
  
  // Metrics
  wordCount: number;
  readingTime: number; // minutes
  complexity: 'simple' | 'moderate' | 'complex' | 'technical';
}

// ==========================================
// COMPATIBILITY HINTS (Auto-Suggestions)
// ==========================================

export interface CompatibilityHints {
  // Recommended context selections
  industries: Array<{
    id: IndustryId;
    name: string;
    confidence: number;
    reason: string;
  }>;
  
  frameworks: Array<{
    id: FrameworkId;
    name: string;
    confidence: number;
    reason: string;
  }>;
  
  visualFeatures: Array<{
    id: VisualFeatureId;
    name: string;
    confidence: number;
    reason: string;
  }>;
  
  outputFormats: Array<{
    id: OutputFormatId;
    name: string;
    confidence: number;
    reason: string;
  }>;
  
  // Template suggestions
  templates: Array<{
    id: string;
    name: string;
    confidence: number;
    reason: string;
  }>;
  
  // Warnings for incompatible combinations
  warnings: Array<{
    type: 'compatibility' | 'quality' | 'performance';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

// ==========================================
// MEDIA-SPECIFIC METADATA
// ==========================================

export interface MediaMetadata {
  // Common
  duration?: number; // seconds (for audio/video)
  fileSize: number;
  mimeType: string;
  
  // Image specific
  dimensions?: {
    width: number;
    height: number;
  };
  
  // Audio specific
  audioChannels?: number;
  sampleRate?: number;
  
  // Video specific
  frameRate?: number;
  hasAudio?: boolean;
  
  // Document specific
  pageCount?: number;
  author?: string;
  createdDate?: string;
  
  // URL specific
  url?: string;
  domain?: string;
  title?: string;
  description?: string;
  ogImage?: string;
}

// ==========================================
// TRANSCRIPTION (Audio/Video)
// ==========================================

export interface Transcription {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
    confidence: number;
  }>;
  language: string;
  provider: string; // 'whisper', 'gemini', 'azure', etc.
}

// ==========================================
// STANDARDIZED INPUT (Final Output)
// ==========================================

export interface StandardizedInput {
  // Unique identifier
  id: string;
  
  // Input classification
  type: InputType;
  mode: InputMode;
  
  // Raw source reference
  raw: {
    source: File | Blob | string;
    fileName?: string;
    mimeType?: string;
  };
  
  // Extracted content
  content: ExtractedContent;
  
  // Transcription (for audio/video)
  transcription?: Transcription;
  
  // Media metadata
  metadata: MediaMetadata;
  
  // AI analysis
  analysis?: InputAnalysis;
  
  // Auto-suggestions for downstream steps
  compatibility: CompatibilityHints;
  
  // Processing info
  processing: {
    status: ProcessingStatus;
    startedAt: Date;
    completedAt?: Date;
    duration?: number; // ms
    provider?: string;
    errors?: string[];
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// ADAPTER INTERFACE
// ==========================================

export interface InputAdapter {
  type: InputType;
  supportedMimeTypes: string[];
  
  // Check if this adapter can handle the input
  canHandle(input: RawInput): boolean;
  
  // Process the input and return standardized result
  process(input: RawInput, options?: ProcessingOptions): Promise<StandardizedInput>;
  
  // Validate the input before processing
  validate(input: RawInput): { valid: boolean; errors: string[] };
}

export interface ProcessingOptions {
  // Mode selection
  mode: InputMode;
  
  // Skip AI analysis (faster, but no suggestions)
  skipAnalysis?: boolean;
  
  // Transcription options
  transcriptionProvider?: 'whisper' | 'gemini' | 'azure';
  transcriptionLanguage?: string;
  
  // Content extraction options
  extractTables?: boolean;
  extractImages?: boolean;
  ocrEnabled?: boolean;
  
  // Quality vs speed tradeoff
  quality?: 'fast' | 'balanced' | 'high';
  
  // Progress callback
  onProgress?: (progress: number, status: string) => void;
}

// ==========================================
// GATEWAY INTERFACE
// ==========================================

export interface UniversalInputGatewayConfig {
  // Default mode
  defaultMode: InputMode;
  
  // Auto-detection settings
  autoDetect: boolean;
  
  // Processing defaults
  defaultOptions: Partial<ProcessingOptions>;
  
  // Adapter overrides
  adapterOverrides?: Partial<Record<InputType, InputAdapter>>;
}

export interface GatewayResult {
  success: boolean;
  input?: StandardizedInput;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
