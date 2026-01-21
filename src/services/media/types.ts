/**
 * Universal Media Adapter Types
 * 
 * Shared types for OCR, TTS/STT, Image Generation, Video Generation, and NLP operations
 * across the Genie Suite (Spark, Mind, Vibe, Arc, Deck, Hub, Ask Genie)
 * 
 * Updated: Multi-provider support for AnimateDiff, SVD, Avatar, Lip-Sync
 */

// ============================================
// PROVIDER TYPES - EXPANDED
// ============================================

export type OCRProvider = 
  | 'google_vision'      // Google Cloud Vision API
  | 'azure_doc_intel'    // Azure Document Intelligence (Form Recognizer)
  | 'azure_cv'           // Azure Computer Vision (general OCR)
  | 'alibaba_qwen_vl'    // Alibaba Qwen-VL (vision-language)
  | 'deepseek_ocr'       // DeepSeek Vision OCR (CJK optimized)
  | 'tesseract'          // Open-source fallback
  | 'aws_textract';      // AWS Textract (future)

export type TTSProvider = 
  | 'azure'              // Azure Cognitive Services TTS
  | 'elevenlabs'         // ElevenLabs
  | 'openai'             // OpenAI TTS
  | 'google'             // Google Cloud TTS
  | 'alibaba_voice'      // Alibaba CosyVoice
  | 'deepseek_tts'       // DeepSeek TTS (CJK optimized)
  | 'amazon_polly';      // AWS Polly (future)

export type STTProvider = 
  | 'azure'              // Azure Speech-to-Text
  | 'openai_whisper'     // OpenAI Whisper
  | 'google'             // Google Cloud STT
  | 'alibaba_voice'      // Alibaba Paraformer STT
  | 'deepseek_stt'       // DeepSeek STT (CJK optimized)
  | 'aws_transcribe';    // AWS Transcribe (future)

export type ImageGenProvider = 
  | 'modelslab_flux'     // ModelsLab FLUX Pro (PRIMARY - best quality)
  | 'modelslab_sdxl'     // ModelsLab SDXL
  | 'modelslab_realistic'// ModelsLab Realistic Vision
  | 'gemini_nano_banana' // Google Gemini 2.5 Flash Image
  | 'gemini_3_pro'       // Google Gemini 3 Pro Image
  | 'openai_dalle'       // OpenAI DALL-E 3
  | 'alibaba_wanx'       // Alibaba Wanx
  | 'deepseek_image'     // DeepSeek Image (CJK optimized)
  | 'azure_image'        // Azure DALL-E (enterprise)
  | 'stability'          // Stability AI
  | 'huggingface'        // HuggingFace models
  | 'replicate';         // Replicate

// Video providers - Multi-provider AnimateDiff/SVD support
export type VideoGenProvider =
  // AnimateDiff - Multi-Provider
  | 'modelslab_animatediff'   // ModelsLab AnimateDiff (PRIMARY)
  | 'alibaba_animatediff'     // Alibaba AnimateDiff
  | 'azure_animatediff'       // Azure AnimateDiff
  | 'deepseek_animatediff'    // DeepSeek AnimateDiff
  | 'google_animatediff'      // Google Veo AnimateDiff
  | 'replicate_animatediff'   // Replicate AnimateDiff
  // SVD - Multi-Provider
  | 'modelslab_svd'           // ModelsLab SVD (PRIMARY)
  | 'alibaba_svd'             // Alibaba WAN SVD
  | 'azure_svd'               // Azure Video AI SVD
  | 'deepseek_svd'            // DeepSeek SVD
  | 'google_svd'              // Google Veo SVD
  | 'replicate_svd'           // Replicate SVD
  // Avatar & Lip-Sync
  | 'alibaba_wan_animate'     // Alibaba WAN 2.2 Animate (PRIMARY for avatar)
  | 'azure_video'             // Azure Video AI (Viseme lip-sync)
  | 'deepseek_video'          // DeepSeek Video
  // Premium Providers
  | 'gemini_veo'              // Google Gemini Veo
  | 'openai_sora'             // OpenAI Sora
  | 'runway_gen3'             // Runway Gen-3 Alpha
  | 'pika_labs'               // Pika Labs
  // Regional/Budget
  | 'alibaba_wanx_video'      // Alibaba Wanx Video
  | 'replicate';              // Replicate (general)

export type SFXGenProvider =
  | 'elevenlabs'         // ElevenLabs SFX
  | 'modelslab_audio';   // ModelsLab Audio

export type NLPProvider = 
  | 'gemini'             // Google Gemini
  | 'claude'             // Anthropic Claude
  | 'openai'             // OpenAI GPT
  | 'deepseek'           // DeepSeek (Chinese/technical specialist)
  | 'alibaba_qwen';      // Alibaba Qwen LLM

// Expanded capabilities for multi-provider routing
export type MediaCapability = 
  | 'ocr' 
  | 'tts' 
  | 'stt' 
  | 'image_gen' 
  | 'video_gen' 
  | 'sfx_gen' 
  | 'nlp' 
  | 'avatar' 
  | 'lipsync' 
  | 'character_animation'
  // Expanded capabilities for provider matching
  | 'voice_clone'        // ElevenLabs, Alibaba CosyVoice
  | 'realtime_stt'       // Azure, Google real-time STT
  | 'music_gen'          // ModelsLab MusicGen
  | 'text_to_video'      // Text prompt to video
  | 'image_to_video'     // Image animation to video
  | 'animatediff'        // AnimateDiff capability
  | 'svd';               // Stable Video Diffusion capability

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
// VIDEO GENERATION TYPES
// ============================================

export interface VideoGenRequest {
  prompt: string;
  provider?: VideoGenProvider;
  referenceImage?: string;    // For image-to-video
  duration?: number;          // Seconds
  resolution?: '480p' | '720p' | '1080p' | '4k';
  style?: string;
  mode?: 'text_to_video' | 'image_to_video' | 'avatar' | 'lipsync';
  options?: {
    seed?: number;
    motionStrength?: number;
    fps?: number;
  };
}

export interface VideoGenResult {
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  confidence: ConfidenceScore;
  provider: VideoGenProvider;
  metadata: {
    promptUsed: string;
    resolution: string;
    fps: number;
    processingTimeMs: number;
    estimatedCost: number;
  };
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
// PROVIDER CONFIGURATION - EXTENDED
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
  // Extended scoring metrics
  qualityScore?: number;   // 0-100
  speedScore?: number;     // 0-100
  reliabilityScore?: number; // 0-100
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

// ============================================
// PROVIDER SCORING & RECOMMENDATION
// ============================================

export interface ProviderScore {
  providerId: string;
  overallScore: number;    // 0-100 weighted average
  qualityScore: number;
  speedScore: number;
  costScore: number;
  reliabilityScore: number;
  contextBonuses: {
    languageBonus: number;
    complianceBonus: number;
    regionalBonus: number;
  };
  recommendation: 'primary' | 'fallback' | 'budget' | 'premium';
  reasons: string[];
}

export interface ProviderRecommendation {
  primary: ProviderScore;
  alternatives: ProviderScore[];
  fallbackChain: string[];
  context: {
    language?: string;
    industry?: string;
    priority: 'quality' | 'speed' | 'budget' | 'balanced';
  };
}
