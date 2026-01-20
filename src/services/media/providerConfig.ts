/**
 * Media Provider Configuration
 * 
 * Dynamic provider configuration for UniversalMediaAdapter
 * All provider details loaded from config - NO hardcoding
 */

import type { 
  MediaProviderConfig, 
  MediaAdapterConfig,
  OCRProvider,
  TTSProvider,
  STTProvider,
  ImageGenProvider,
  VideoGenProvider,
  SFXGenProvider,
  NLPProvider 
} from './types';

// ============================================
// PROVIDER REGISTRY
// ============================================

export const OCR_PROVIDERS: Record<OCRProvider, MediaProviderConfig> = {
  google_vision: {
    id: 'google_vision',
    name: 'Google Cloud Vision',
    capabilities: ['ocr'],
    secretKey: 'GOOGLE_API_KEY',
    isConfigured: false, // Will be determined at runtime
    priority: 1,
    costPerUnit: 0.0015, // per page
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'],
    strengths: ['Excellent for printed text', 'Fast', '100+ languages', 'Good handwriting'],
    weaknesses: ['Complex layouts can be challenging'],
  },
  azure_doc_intel: {
    id: 'azure_doc_intel',
    name: 'Azure Document Intelligence',
    capabilities: ['ocr'],
    secretKey: 'AZURE_FORM_RECOGNIZER_KEY',
    isConfigured: false,
    priority: 2,
    costPerUnit: 0.001, // per page for prebuilt
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'nl'],
    strengths: ['Best for invoices/receipts/forms', 'Structured extraction', 'Key-value pairs'],
    weaknesses: ['Limited handwriting support'],
  },
  azure_cv: {
    id: 'azure_cv',
    name: 'Azure Computer Vision',
    capabilities: ['ocr'],
    secretKey: 'AZURE_COGNITIVE_KEY',
    isConfigured: false,
    priority: 3,
    costPerUnit: 0.001,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'],
    strengths: ['General purpose OCR', 'Good for photos', 'Object detection'],
    weaknesses: ['Less structured extraction than Form Recognizer'],
  },
  alibaba_qwen_vl: {
    id: 'alibaba_qwen_vl',
    name: 'Alibaba Qwen-VL',
    capabilities: ['ocr'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: false,
    priority: 4,
    costPerUnit: 0.0005,
    supportedLanguages: ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de'],
    strengths: ['Excellent for CJK languages', 'Vision-language understanding', 'Context-aware'],
    weaknesses: ['Newer service, less documentation'],
  },
  tesseract: {
    id: 'tesseract',
    name: 'Tesseract OCR',
    capabilities: ['ocr'],
    secretKey: '', // No API key needed - local processing
    isConfigured: true, // Always available as fallback
    priority: 99, // Last resort
    costPerUnit: 0,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'],
    strengths: ['Free', 'Open source', 'Offline capable'],
    weaknesses: ['Lower accuracy', 'No structured extraction', 'Slower'],
  },
  aws_textract: {
    id: 'aws_textract',
    name: 'AWS Textract',
    capabilities: ['ocr'],
    secretKey: 'AWS_ACCESS_KEY_ID', // Requires AWS credentials
    isConfigured: false,
    priority: 98, // Future - low priority for now
    costPerUnit: 0.0015,
    supportedLanguages: ['en', 'es', 'de', 'it', 'pt', 'fr'],
    strengths: ['Excellent table extraction', 'Forms', 'AWS integration'],
    weaknesses: ['Limited language support'],
  },
};

export const TTS_PROVIDERS: Record<TTSProvider, MediaProviderConfig> = {
  azure: {
    id: 'azure',
    name: 'Azure Neural TTS',
    capabilities: ['tts'],
    secretKey: 'AZURE_SPEECH_KEY',
    isConfigured: false,
    priority: 1,
    costPerUnit: 0.000016, // per character
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'],
    strengths: ['Huge voice selection', 'Speaking styles', 'SSML support', 'Multilingual'],
    weaknesses: ['Complex pricing tiers'],
  },
  elevenlabs: {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    capabilities: ['tts'],
    secretKey: 'ELEVENLABS_API_KEY',
    isConfigured: false,
    priority: 2,
    costPerUnit: 0.00003, // per character
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'hi', 'ar'],
    strengths: ['Most natural sounding', 'Voice cloning', 'Excellent emotion'],
    weaknesses: ['Higher cost', 'Fewer languages'],
  },
  openai: {
    id: 'openai',
    name: 'OpenAI TTS',
    capabilities: ['tts'],
    secretKey: 'OPENAI_API_KEY',
    isConfigured: false,
    priority: 3,
    costPerUnit: 0.000015, // per character
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'ru', 'zh', 'ja', 'ko'],
    strengths: ['Simple API', 'Good quality', 'Fast'],
    weaknesses: ['Limited voice options', 'No SSML'],
  },
  google: {
    id: 'google',
    name: 'Google Cloud TTS',
    capabilities: ['tts'],
    secretKey: 'GOOGLE_API_KEY',
    isConfigured: false,
    priority: 4,
    costPerUnit: 0.000016,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'],
    strengths: ['WaveNet voices', 'SSML support', 'Many languages'],
    weaknesses: ['Less natural than ElevenLabs'],
  },
  alibaba_voice: {
    id: 'alibaba_voice',
    name: 'Alibaba DashScope Voice',
    capabilities: ['tts'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: false,
    priority: 5,
    costPerUnit: 0.00001,
    supportedLanguages: ['zh', 'en', 'ja', 'ko', 'es'],
    strengths: ['Excellent for Chinese', 'Low cost', 'Voice cloning'],
    weaknesses: ['Fewer English voices'],
  },
  amazon_polly: {
    id: 'amazon_polly',
    name: 'Amazon Polly',
    capabilities: ['tts'],
    secretKey: 'AWS_ACCESS_KEY_ID',
    isConfigured: false,
    priority: 98, // Future
    costPerUnit: 0.000016,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'],
    strengths: ['Neural voices', 'SSML', 'AWS integration'],
    weaknesses: ['Less natural than ElevenLabs'],
  },
};

export const STT_PROVIDERS: Record<STTProvider, MediaProviderConfig> = {
  azure: {
    id: 'azure',
    name: 'Azure Speech-to-Text',
    capabilities: ['stt'],
    secretKey: 'AZURE_SPEECH_KEY',
    isConfigured: false,
    priority: 1,
    costPerUnit: 0.00001, // per second
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'],
    strengths: ['Real-time', 'Batch', 'Custom models', 'Many languages'],
    weaknesses: ['Requires region config'],
  },
  openai_whisper: {
    id: 'openai_whisper',
    name: 'OpenAI Whisper',
    capabilities: ['stt'],
    secretKey: 'OPENAI_API_KEY',
    isConfigured: false,
    priority: 2,
    costPerUnit: 0.0001, // per second
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'],
    strengths: ['Excellent accuracy', 'Many languages', 'Handles accents well'],
    weaknesses: ['File size limits', 'No real-time'],
  },
  google: {
    id: 'google',
    name: 'Google Cloud STT',
    capabilities: ['stt'],
    secretKey: 'GOOGLE_API_KEY',
    isConfigured: false,
    priority: 3,
    costPerUnit: 0.000024, // per second
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'],
    strengths: ['Real-time', 'Speaker diarization', 'Punctuation'],
    weaknesses: ['Complex setup'],
  },
  alibaba_voice: {
    id: 'alibaba_voice',
    name: 'Alibaba DashScope STT',
    capabilities: ['stt'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: false,
    priority: 4,
    costPerUnit: 0.00001,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['Best for Chinese dialects', 'Low cost'],
    weaknesses: ['Limited language support'],
  },
  aws_transcribe: {
    id: 'aws_transcribe',
    name: 'AWS Transcribe',
    capabilities: ['stt'],
    secretKey: 'AWS_ACCESS_KEY_ID',
    isConfigured: false,
    priority: 98,
    costPerUnit: 0.000024,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'],
    strengths: ['Custom vocabulary', 'Medical transcription'],
    weaknesses: ['AWS lock-in'],
  },
};

export const IMAGE_GEN_PROVIDERS: Record<ImageGenProvider, MediaProviderConfig> = {
  // ModelsLab providers - PRIMARY for image generation
  modelslab_flux: {
    id: 'modelslab_flux',
    name: 'ModelsLab FLUX Pro',
    capabilities: ['image_gen'],
    secretKey: 'MODELSLAB_API_KEY',
    isConfigured: true, // Configured per gap analysis
    priority: 1, // PRIMARY
    costPerUnit: 0.003,
    strengths: ['Ultra-high quality', 'FLUX Pro/Dev models', 'Fast', 'Photorealistic', 'CivitAI models'],
    weaknesses: ['Async for complex generations'],
  },
  modelslab_sdxl: {
    id: 'modelslab_sdxl',
    name: 'ModelsLab SDXL',
    capabilities: ['image_gen'],
    secretKey: 'MODELSLAB_API_KEY',
    isConfigured: true,
    priority: 2,
    costPerUnit: 0.002,
    strengths: ['Stable Diffusion XL', 'ControlNet', 'Inpainting', 'Wide style range'],
    weaknesses: ['Slower than FLUX'],
  },
  modelslab_realistic: {
    id: 'modelslab_realistic',
    name: 'ModelsLab Realistic Vision',
    capabilities: ['image_gen'],
    secretKey: 'MODELSLAB_API_KEY',
    isConfigured: true,
    priority: 3,
    costPerUnit: 0.002,
    strengths: ['Photorealistic focus', 'Product shots', 'Portraits'],
    weaknesses: ['Limited artistic styles'],
  },
  gemini_nano_banana: {
    id: 'gemini_nano_banana',
    name: 'Gemini 2.5 Flash Image',
    capabilities: ['image_gen'],
    secretKey: 'LOVABLE_API_KEY',
    isConfigured: true,
    priority: 4,
    costPerUnit: 0.002,
    strengths: ['Fast', 'Good quality', 'Edit capability', 'Via Lovable AI'],
    weaknesses: ['Base64 output (large)'],
  },
  gemini_3_pro: {
    id: 'gemini_3_pro',
    name: 'Gemini 3 Pro Image',
    capabilities: ['image_gen'],
    secretKey: 'LOVABLE_API_KEY',
    isConfigured: true,
    priority: 5,
    costPerUnit: 0.004,
    strengths: ['Highest quality', 'Complex scenes', 'Via Lovable AI'],
    weaknesses: ['Slower', 'Higher cost'],
  },
  openai_dalle: {
    id: 'openai_dalle',
    name: 'OpenAI DALL-E 3',
    capabilities: ['image_gen'],
    secretKey: 'OPENAI_API_KEY',
    isConfigured: true,
    priority: 6,
    costPerUnit: 0.04,
    strengths: ['Excellent text rendering', 'High quality', 'Prompt refinement'],
    weaknesses: ['Expensive', 'No editing'],
  },
  alibaba_wanx: {
    id: 'alibaba_wanx',
    name: 'Alibaba Wanx',
    capabilities: ['image_gen'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: true,
    priority: 7,
    costPerUnit: 0.005,
    strengths: ['Low cost', 'Good for Asian aesthetics', 'Multiple styles', 'CJK text rendering'],
    weaknesses: ['Newer service'],
  },
  stability: {
    id: 'stability',
    name: 'Stability AI SDXL',
    capabilities: ['image_gen'],
    secretKey: 'STABILITY_API_KEY',
    isConfigured: false, // Not configured - use ModelsLab instead
    priority: 90,
    costPerUnit: 0.002,
    strengths: ['Fine control', 'Inpainting', 'ControlNet'],
    weaknesses: ['Use ModelsLab instead - same models, lower cost'],
  },
  huggingface: {
    id: 'huggingface',
    name: 'HuggingFace FLUX',
    capabilities: ['image_gen'],
    secretKey: 'HUGGING_FACE_ACCESS_TOKEN',
    isConfigured: true,
    priority: 8,
    costPerUnit: 0.001,
    strengths: ['Open models', 'Customizable', 'Low cost'],
    weaknesses: ['Variable quality', 'Rate limits'],
  },
  replicate: {
    id: 'replicate',
    name: 'Replicate',
    capabilities: ['image_gen'],
    secretKey: 'REPLICATE_API_TOKEN',
    isConfigured: true,
    priority: 9,
    costPerUnit: 0.002,
    strengths: ['Many models', 'Video capable', 'Pay-per-use'],
    weaknesses: ['Cold start delays'],
  },
};

// ============================================
// VIDEO GENERATION PROVIDERS (NEW)
// ============================================

export const VIDEO_GEN_PROVIDERS: Record<VideoGenProvider, MediaProviderConfig> = {
  modelslab_animatediff: {
    id: 'modelslab_animatediff',
    name: 'ModelsLab AnimateDiff',
    capabilities: ['video_gen'],
    secretKey: 'MODELSLAB_API_KEY',
    isConfigured: true,
    priority: 1, // PRIMARY for video
    costPerUnit: 0.02,
    strengths: ['Text-to-video', 'Image-to-video', 'Multiple styles', 'Async processing'],
    weaknesses: ['Short duration (3-10s)'],
  },
  modelslab_svd: {
    id: 'modelslab_svd',
    name: 'ModelsLab Stable Video Diffusion',
    capabilities: ['video_gen'],
    secretKey: 'MODELSLAB_API_KEY',
    isConfigured: true,
    priority: 2,
    costPerUnit: 0.03,
    strengths: ['Higher quality', 'Smooth motion', 'Image-to-video'],
    weaknesses: ['Slower processing'],
  },
  gemini_veo: {
    id: 'gemini_veo',
    name: 'Google Gemini Veo',
    capabilities: ['video_gen'],
    secretKey: 'GEMINI_API_KEY',
    isConfigured: true,
    priority: 3,
    costPerUnit: 0.05,
    strengths: ['High quality', 'Longer duration', 'Via Google'],
    weaknesses: ['Limited availability'],
  },
  alibaba_wanx_video: {
    id: 'alibaba_wanx_video',
    name: 'Alibaba Wanx Video',
    capabilities: ['video_gen'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: true,
    priority: 4,
    costPerUnit: 0.02,
    strengths: ['Low cost', 'Good for CJK content', 'Fast'],
    weaknesses: ['Lower resolution'],
  },
  replicate: {
    id: 'replicate',
    name: 'Replicate Video',
    capabilities: ['video_gen'],
    secretKey: 'REPLICATE_API_TOKEN',
    isConfigured: true,
    priority: 5,
    costPerUnit: 0.04,
    strengths: ['Runway-style', 'Multiple models'],
    weaknesses: ['Cold start delays'],
  },
};

// ============================================
// SFX GENERATION PROVIDERS (NEW)
// ============================================

export const SFX_GEN_PROVIDERS: Record<SFXGenProvider, MediaProviderConfig> = {
  elevenlabs: {
    id: 'elevenlabs',
    name: 'ElevenLabs SFX',
    capabilities: ['sfx_gen'],
    secretKey: 'ELEVENLABS_API_KEY',
    isConfigured: true,
    priority: 1,
    costPerUnit: 0.005,
    strengths: ['High quality', 'Text-to-SFX', 'Diverse sounds'],
    weaknesses: ['Credit-based pricing'],
  },
  modelslab_audio: {
    id: 'modelslab_audio',
    name: 'ModelsLab Audio',
    capabilities: ['sfx_gen'],
    secretKey: 'MODELSLAB_API_KEY',
    isConfigured: true,
    priority: 2,
    costPerUnit: 0.003,
    strengths: ['MusicGen', 'Bark model', 'Low cost'],
    weaknesses: ['Less refined than ElevenLabs'],
  },
};

export const NLP_PROVIDERS: Record<NLPProvider, MediaProviderConfig> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    capabilities: ['nlp'],
    secretKey: 'LOVABLE_API_KEY',
    isConfigured: false,
    priority: 1,
    costPerUnit: 0.00001, // per 1k tokens
    strengths: ['Fast', 'Via Lovable AI', 'Good reasoning'],
    weaknesses: ['Less nuanced than Claude'],
  },
  claude: {
    id: 'claude',
    name: 'Anthropic Claude',
    capabilities: ['nlp'],
    secretKey: 'ANTHROPIC_API_KEY',
    isConfigured: false,
    priority: 2,
    costPerUnit: 0.00003,
    strengths: ['Best for nuance', 'Long context', 'Instruction following'],
    weaknesses: ['Higher cost'],
  },
  openai: {
    id: 'openai',
    name: 'OpenAI GPT',
    capabilities: ['nlp'],
    secretKey: 'OPENAI_API_KEY',
    isConfigured: false,
    priority: 3,
    costPerUnit: 0.00002,
    strengths: ['Versatile', 'Function calling', 'JSON mode'],
    weaknesses: ['Can be verbose'],
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    capabilities: ['nlp'],
    secretKey: 'DEEPSEEK_API_KEY',
    isConfigured: false,
    priority: 4,
    costPerUnit: 0.000005,
    strengths: ['Best for Chinese', 'Technical content', 'Low cost'],
    weaknesses: ['Fewer general capabilities'],
  },
  alibaba_qwen: {
    id: 'alibaba_qwen',
    name: 'Alibaba Qwen',
    capabilities: ['nlp'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: false,
    priority: 5,
    costPerUnit: 0.00001,
    strengths: ['Good for CJK', 'Multilingual', 'Low cost'],
    weaknesses: ['Less documentation'],
  },
};

// ============================================
// DEFAULT ADAPTER CONFIGURATION
// ============================================

export const DEFAULT_ADAPTER_CONFIG: MediaAdapterConfig = {
  defaultOCRProvider: 'google_vision',
  defaultTTSProvider: 'elevenlabs', // Changed: ElevenLabs as primary (configured)
  defaultSTTProvider: 'openai_whisper',
  defaultImageGenProvider: 'modelslab_flux', // Changed: ModelsLab FLUX as primary
  defaultVideoGenProvider: 'modelslab_animatediff', // NEW: ModelsLab AnimateDiff
  defaultSFXGenProvider: 'elevenlabs', // NEW: ElevenLabs SFX
  defaultNLPProvider: 'gemini',
  fallbackChain: {
    ocr: ['google_vision', 'alibaba_qwen_vl', 'tesseract'], // Removed azure (not configured)
    tts: ['elevenlabs', 'openai', 'google', 'alibaba_voice'], // ElevenLabs first, removed azure
    stt: ['openai_whisper', 'google', 'alibaba_voice'],
    // UPDATED: ModelsLab as PRIMARY for image generation
    imageGen: ['modelslab_flux', 'modelslab_sdxl', 'gemini_nano_banana', 'openai_dalle', 'alibaba_wanx', 'replicate'],
    // NEW: Video generation fallback chain
    videoGen: ['modelslab_animatediff', 'modelslab_svd', 'gemini_veo', 'alibaba_wanx_video', 'replicate'],
    // NEW: SFX generation fallback chain
    sfxGen: ['elevenlabs', 'modelslab_audio'],
    nlp: ['gemini', 'claude', 'openai', 'deepseek', 'alibaba_qwen'],
  },
  enableFallback: true,
  maxRetries: 3,
  timeoutMs: 60000,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all providers for a capability
 */
export function getProvidersForCapability(capability: 'ocr' | 'tts' | 'stt' | 'image_gen' | 'nlp'): MediaProviderConfig[] {
  switch (capability) {
    case 'ocr':
      return Object.values(OCR_PROVIDERS);
    case 'tts':
      return Object.values(TTS_PROVIDERS);
    case 'stt':
      return Object.values(STT_PROVIDERS);
    case 'image_gen':
      return Object.values(IMAGE_GEN_PROVIDERS);
    case 'nlp':
      return Object.values(NLP_PROVIDERS);
    default:
      return [];
  }
}

/**
 * Get provider by ID
 */
export function getProviderById(
  providerId: string, 
  capability: 'ocr' | 'tts' | 'stt' | 'image_gen' | 'nlp'
): MediaProviderConfig | undefined {
  const providers = getProvidersForCapability(capability);
  return providers.find(p => p.id === providerId);
}

/**
 * Get fallback chain for capability
 */
export function getFallbackChain(
  capability: 'ocr' | 'tts' | 'stt' | 'image_gen' | 'nlp',
  config: MediaAdapterConfig = DEFAULT_ADAPTER_CONFIG
): string[] {
  switch (capability) {
    case 'ocr':
      return config.fallbackChain.ocr;
    case 'tts':
      return config.fallbackChain.tts;
    case 'stt':
      return config.fallbackChain.stt;
    case 'image_gen':
      return config.fallbackChain.imageGen;
    case 'nlp':
      return config.fallbackChain.nlp;
    default:
      return [];
  }
}
