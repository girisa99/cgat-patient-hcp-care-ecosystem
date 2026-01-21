/**
 * Universal Media Adapter Types
 * 
 * Shared types for OCR, TTS/STT, Image Generation, and NLP operations
 * across the Genie Suite (Spark, Mind, Vibe, Arc, Deck, Hub)
 */

// ============================================
// PROVIDER TYPES
// ============================================

export type OCRProvider = 
  | 'google_vision'      // Google Cloud Vision API
  | 'azure_doc_intel'    // Azure Document Intelligence (Form Recognizer)
  | 'azure_cv'           // Azure Computer Vision (general OCR)
  | 'alibaba_qwen_vl'    // Alibaba Qwen-VL (vision-language)
  | 'tesseract'          // Open-source fallback
  | 'aws_textract';      // AWS Textract (future)

export type TTSProvider = 
  | 'azure'              // Azure Cognitive Services TTS
  | 'elevenlabs'         // ElevenLabs
  | 'openai'             // OpenAI TTS
  | 'google'             // Google Cloud TTS
  | 'alibaba_voice'      // Alibaba DashScope Voice
  | 'amazon_polly';      // AWS Polly (future)

export type STTProvider = 
  | 'azure'              // Azure Speech-to-Text
  | 'openai_whisper'     // OpenAI Whisper
  | 'google'             // Google Cloud STT
  | 'alibaba_voice'      // Alibaba DashScope STT
  | 'aws_transcribe';    // AWS Transcribe (future)

export type ImageGenProvider = 
  | 'modelslab_flux'     // ModelsLab FLUX Pro (PRIMARY - best quality)
  | 'modelslab_sdxl'     // ModelsLab SDXL
  | 'modelslab_realistic'// ModelsLab Realistic Vision
  | 'gemini_nano_banana' // Google Gemini 2.5 Flash Image
  | 'gemini_3_pro'       // Google Gemini 3 Pro Image
  | 'openai_dalle'       // OpenAI DALL-E 3
  | 'alibaba_wanx'       // Alibaba Wanx
  | 'stability'          // Stability AI
  | 'huggingface'        // HuggingFace models
  | 'replicate';         // Replicate

export type VideoGenProvider =
  | 'modelslab_animatediff' // ModelsLab AnimateDiff (PRIMARY)
  | 'modelslab_svd'         // ModelsLab Stable Video Diffusion
  | 'gemini_veo'            // Google Gemini Veo
  | 'alibaba_wanx_video'    // Alibaba Wanx Video
  | 'alibaba_wan_animate'   // Alibaba WAN 2.2 Animate (Avatar/Lip-sync)
  | 'azure_video'           // Azure Video AI
  | 'deepseek_video'        // DeepSeek Video Generation
  | 'replicate';            // Replicate (Runway-style)

export type SFXGenProvider =
  | 'elevenlabs'         // ElevenLabs SFX
  | 'modelslab_audio';   // ModelsLab Audio

export type NLPProvider = 
  | 'gemini'             // Google Gemini
  | 'claude'             // Anthropic Claude
  | 'openai'             // OpenAI GPT
  | 'deepseek'           // DeepSeek (Chinese/technical specialist)
  | 'alibaba_qwen';      // Alibaba Qwen LLM

export type MediaCapability = 'ocr' | 'tts' | 'stt' | 'image_gen' | 'video_gen' | 'sfx_gen' | 'nlp' | 'avatar' | 'lipsync' | 'character_animation';

// ============================================
// CONFIDENCE SCORING
// ============================================

export interface ConfidenceScore {
  overall: number;        // 0-1 aggregate score
  breakdown: {
    accuracy: number;     // How accurate the result is
    completeness: number; // How complete the extraction/generation
    quality: number;      // Quality of output
    reliability: number;  // Provider reliability factor
  };
  provider: string;
  processingTimeMs: number;
  warnings?: string[];
}

// ============================================
// OCR TYPES
// ============================================

export interface OCRRequest {
  input: string | Blob;           // URL, base64, or Blob
  inputType: 'url' | 'base64' | 'blob';
  provider?: OCRProvider;
  documentType?: 'general' | 'invoice' | 'receipt' | 'prescription' | 'form' | 'id_card' | 'medical';
  language?: string;
  extractStructure?: boolean;     // Extract tables, forms, etc.
  handwritingMode?: boolean;
  options?: {
    detectOrientation?: boolean;
    enhanceImage?: boolean;
    outputFormat?: 'text' | 'json' | 'hocr';
  };
}

export interface OCRResult {
  text: string;
  confidence: ConfidenceScore;
  language?: string;
  detectedLanguage?: string;
  structure?: {
    pages?: OCRPage[];
    tables?: OCRTable[];
    keyValuePairs?: Record<string, string>;
    entities?: ExtractedEntity[];
  };
  provider: OCRProvider;
  fallbackUsed?: OCRProvider;
  metadata: {
    pageCount?: number;
    wordCount: number;
    characterCount: number;
    processingTimeMs: number;
  };
}

export interface OCRPage {
  pageNumber: number;
  text: string;
  lines: { text: string; confidence: number; boundingBox?: number[] }[];
  words: { text: string; confidence: number; boundingBox?: number[] }[];
}

export interface OCRTable {
  rows: number;
  columns: number;
  cells: { row: number; col: number; text: string; confidence: number }[];
}

export interface ExtractedEntity {
  type: string;
  value: string;
  confidence: number;
  startIndex?: number;
  endIndex?: number;
}

// ============================================
// TTS/STT TYPES
// ============================================

export interface TTSRequest {
  text: string;
  provider?: TTSProvider;
  voice?: string;
  language?: string;
  speed?: number;           // 0.5 - 2.0
  pitch?: number;           // -20 to 20
  style?: string;           // Azure styles: cheerful, sad, newscast, etc.
  outputFormat?: 'mp3' | 'wav' | 'ogg';
  options?: {
    ssml?: boolean;
    stability?: number;     // ElevenLabs
    similarityBoost?: number;
  };
}

export interface TTSResult {
  audioUrl: string;
  audioBlob?: Blob;
  duration: number;
  confidence: ConfidenceScore;
  provider: TTSProvider;
  voice: string;
  metadata: {
    characterCount: number;
    estimatedCost: number;
    format: string;
  };
}

export interface STTRequest {
  audio: string | Blob;     // URL, base64, or Blob
  inputType: 'url' | 'base64' | 'blob';
  provider?: STTProvider;
  language?: string;
  options?: {
    punctuation?: boolean;
    profanityFilter?: boolean;
    speakerDiarization?: boolean;
    wordTimestamps?: boolean;
  };
}

export interface STTResult {
  text: string;
  confidence: ConfidenceScore;
  language?: string;
  detectedLanguage?: string;
  words?: { word: string; startTime: number; endTime: number; confidence: number }[];
  speakers?: { speakerId: string; text: string; startTime: number; endTime: number }[];
  provider: STTProvider;
  metadata: {
    durationSeconds: number;
    wordCount: number;
    processingTimeMs: number;
  };
}

// ============================================
// IMAGE GENERATION TYPES
// ============================================

export interface ImageGenRequest {
  prompt: string;
  provider?: ImageGenProvider;
  style?: string;
  size?: '512x512' | '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'high' | 'hd';
  numberOfImages?: number;
  negativePrompt?: string;
  referenceImage?: string;  // For image-to-image
  options?: {
    seed?: number;
    steps?: number;
    guidanceScale?: number;
  };
}

export interface ImageGenResult {
  images: GeneratedImage[];
  confidence: ConfidenceScore;
  provider: ImageGenProvider;
  metadata: {
    promptUsed: string;
    revisedPrompt?: string;
    processingTimeMs: number;
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
// NLP TYPES
// ============================================

export interface NLPRequest {
  text: string;
  provider?: NLPProvider;
  operations: NLPOperation[];
  language?: string;
  domain?: 'general' | 'medical' | 'legal' | 'technical' | 'financial';
  options?: {
    maxEntities?: number;
    includeConfidence?: boolean;
  };
}

export type NLPOperation = 
  | 'entity_extraction'
  | 'sentiment_analysis'
  | 'summarization'
  | 'keyword_extraction'
  | 'classification'
  | 'language_detection';

export interface NLPResult {
  entities?: ExtractedEntity[];
  sentiment?: {
    score: number;        // -1 to 1
    label: 'positive' | 'negative' | 'neutral' | 'mixed';
    confidence: number;
  };
  summary?: string;
  keywords?: { keyword: string; score: number }[];
  classification?: { label: string; confidence: number }[];
  language?: { detected: string; confidence: number };
  confidence: ConfidenceScore;
  provider: NLPProvider;
  metadata: {
    operationsPerformed: NLPOperation[];
    processingTimeMs: number;
  };
}

// ============================================
// PROVIDER CONFIGURATION
// ============================================

export interface MediaProviderConfig {
  id: string;
  name: string;
  capabilities: MediaCapability[];
  secretKey: string;       // Reference to secret name (not the actual key)
  isConfigured: boolean;
  priority: number;        // Lower = higher priority for fallback
  costPerUnit: number;
  rateLimit?: number;
  supportedLanguages?: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface MediaAdapterConfig {
  defaultOCRProvider: OCRProvider;
  defaultTTSProvider: TTSProvider;
  defaultSTTProvider: STTProvider;
  defaultImageGenProvider: ImageGenProvider;
  defaultVideoGenProvider: VideoGenProvider;
  defaultSFXGenProvider: SFXGenProvider;
  defaultNLPProvider: NLPProvider;
  fallbackChain: {
    ocr: OCRProvider[];
    tts: TTSProvider[];
    stt: STTProvider[];
    imageGen: ImageGenProvider[];
    videoGen: VideoGenProvider[];
    sfxGen: SFXGenProvider[];
    nlp: NLPProvider[];
  };
  enableFallback: boolean;
  maxRetries: number;
  timeoutMs: number;
}

// ============================================
// GENIE PRODUCT CONTEXT
// ============================================

export type GenieProduct = 'spark' | 'mind' | 'vibe' | 'arc' | 'deck' | 'hub' | 'ask_genie';

export interface MediaRequestContext {
  product: GenieProduct;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}
