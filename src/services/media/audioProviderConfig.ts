/**
 * Audio Provider Configuration
 * 
 * Centralized configuration for OCR, TTS, STT, and SFX providers
 * Separated from image/video for maintainability
 */

import type { 
  MediaProviderConfig, 
  OCRProvider, 
  TTSProvider, 
  STTProvider, 
  SFXGenProvider,
  NLPProvider 
} from './types';

// ============================================
// OCR PROVIDERS
// ============================================

export const OCR_PROVIDERS: Record<OCRProvider, MediaProviderConfig> = {
  google_vision: {
    id: 'google_vision',
    name: 'Google Cloud Vision',
    capabilities: ['ocr'],
    secretKey: 'GOOGLE_API_KEY',
    isConfigured: false,
    priority: 1,
    costPerUnit: 0.0015,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'],
    strengths: ['Excellent for printed text', 'Fast', '100+ languages', 'Good handwriting'],
    weaknesses: ['Complex layouts can be challenging'],
  },
  azure_doc_intel: {
    id: 'azure_doc_intel',
    name: 'Azure Document Intelligence',
    capabilities: ['ocr'],
    secretKey: 'AZURE_FORM_RECOGNIZER_KEY',
    isConfigured: true,
    priority: 2,
    costPerUnit: 0.001,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'nl'],
    strengths: ['Best for invoices/receipts/forms', 'Structured extraction', 'Key-value pairs'],
    weaknesses: ['Limited handwriting support'],
  },
  azure_cv: {
    id: 'azure_cv',
    name: 'Azure Computer Vision',
    capabilities: ['ocr'],
    secretKey: 'AZURE_COGNITIVE_KEY',
    isConfigured: true,
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
    isConfigured: true,
    priority: 4,
    costPerUnit: 0.0005,
    supportedLanguages: ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de'],
    strengths: ['Excellent for CJK languages', 'Vision-language understanding', 'Context-aware'],
    weaknesses: ['Newer service, less documentation'],
  },
  deepseek_ocr: {
    id: 'deepseek_ocr',
    name: 'DeepSeek Vision OCR',
    capabilities: ['ocr'],
    secretKey: 'DEEPSEEK_API_KEY',
    isConfigured: true,
    priority: 5,
    costPerUnit: 0.0003,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['Ultra low cost', 'CJK optimized', 'Vision understanding'],
    weaknesses: ['Limited language support'],
  },
  tesseract: {
    id: 'tesseract',
    name: 'Tesseract OCR',
    capabilities: ['ocr'],
    secretKey: '',
    isConfigured: true, // Always available as fallback
    priority: 99,
    costPerUnit: 0,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'],
    strengths: ['Free', 'Open source', 'Offline capable'],
    weaknesses: ['Lower accuracy', 'No structured extraction', 'Slower'],
  },
  aws_textract: {
    id: 'aws_textract',
    name: 'AWS Textract',
    capabilities: ['ocr'],
    secretKey: 'AWS_ACCESS_KEY_ID',
    isConfigured: false,
    priority: 98,
    costPerUnit: 0.0015,
    supportedLanguages: ['en', 'es', 'de', 'it', 'pt', 'fr'],
    strengths: ['Excellent table extraction', 'Forms', 'AWS integration'],
    weaknesses: ['Limited language support'],
  },
};

// ============================================
// TTS PROVIDERS
// ============================================

export const TTS_PROVIDERS: Record<TTSProvider, MediaProviderConfig> = {
  elevenlabs: {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    capabilities: ['tts', 'voice_clone'],
    secretKey: 'ELEVENLABS_API_KEY',
    isConfigured: true,
    priority: 1, // PRIMARY for English
    costPerUnit: 0.00003,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'hi', 'ar'],
    strengths: ['Most natural sounding', 'Voice cloning', 'Excellent emotion', 'Turbo speed'],
    weaknesses: ['Higher cost', 'Fewer Asian languages'],
  },
  azure: {
    id: 'azure',
    name: 'Azure Neural TTS',
    capabilities: ['tts'],
    secretKey: 'AZURE_SPEECH_KEY',
    isConfigured: true,
    priority: 2,
    costPerUnit: 0.000016,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'],
    strengths: ['Huge voice selection', 'Speaking styles', 'SSML support', 'Multilingual', 'Viseme data'],
    weaknesses: ['Complex pricing tiers'],
  },
  alibaba_voice: {
    id: 'alibaba_voice',
    name: 'Alibaba CosyVoice',
    capabilities: ['tts', 'voice_clone'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: true,
    priority: 3, // PRIMARY for CJK
    costPerUnit: 0.00001,
    supportedLanguages: ['zh', 'en', 'ja', 'ko', 'es'],
    strengths: ['Best for Chinese', 'Low cost', 'Voice cloning', 'CJK dialects'],
    weaknesses: ['Fewer English voices'],
  },
  openai: {
    id: 'openai',
    name: 'OpenAI TTS',
    capabilities: ['tts'],
    secretKey: 'OPENAI_API_KEY',
    isConfigured: true,
    priority: 4,
    costPerUnit: 0.000015,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'ru', 'zh', 'ja', 'ko'],
    strengths: ['Simple API', 'Good quality', 'Fast'],
    weaknesses: ['Limited voice options', 'No SSML'],
  },
  google: {
    id: 'google',
    name: 'Google Cloud TTS',
    capabilities: ['tts'],
    secretKey: 'GOOGLE_API_KEY',
    isConfigured: true,
    priority: 5,
    costPerUnit: 0.000016,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'],
    strengths: ['WaveNet voices', 'SSML support', 'Many languages'],
    weaknesses: ['Less natural than ElevenLabs'],
  },
  deepseek_tts: {
    id: 'deepseek_tts',
    name: 'DeepSeek TTS',
    capabilities: ['tts'],
    secretKey: 'DEEPSEEK_API_KEY',
    isConfigured: true,
    priority: 6,
    costPerUnit: 0.000008,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['Ultra low cost', 'CJK optimized', 'Technical narration'],
    weaknesses: ['Limited voice styles'],
  },
  amazon_polly: {
    id: 'amazon_polly',
    name: 'Amazon Polly',
    capabilities: ['tts'],
    secretKey: 'AWS_ACCESS_KEY_ID',
    isConfigured: false,
    priority: 98,
    costPerUnit: 0.000016,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'],
    strengths: ['Neural voices', 'SSML', 'AWS integration'],
    weaknesses: ['Less natural than ElevenLabs'],
  },
};

// ============================================
// STT PROVIDERS
// ============================================

export const STT_PROVIDERS: Record<STTProvider, MediaProviderConfig> = {
  openai_whisper: {
    id: 'openai_whisper',
    name: 'OpenAI Whisper',
    capabilities: ['stt'],
    secretKey: 'OPENAI_API_KEY',
    isConfigured: true,
    priority: 1, // PRIMARY
    costPerUnit: 0.0001,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'],
    strengths: ['Excellent accuracy', 'Many languages', 'Handles accents well', 'Timestamps'],
    weaknesses: ['File size limits', 'No real-time'],
  },
  azure: {
    id: 'azure',
    name: 'Azure Speech-to-Text',
    capabilities: ['stt', 'realtime_stt'],
    secretKey: 'AZURE_SPEECH_KEY',
    isConfigured: true,
    priority: 2,
    costPerUnit: 0.00001,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'],
    strengths: ['Real-time', 'Batch', 'Custom models', 'Many languages'],
    weaknesses: ['Requires region config'],
  },
  alibaba_voice: {
    id: 'alibaba_voice',
    name: 'Alibaba Paraformer',
    capabilities: ['stt'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: true,
    priority: 3, // PRIMARY for CJK
    costPerUnit: 0.00001,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['Best for Chinese dialects', 'Low cost', 'High accuracy for CJK'],
    weaknesses: ['Limited language support'],
  },
  google: {
    id: 'google',
    name: 'Google Cloud STT',
    capabilities: ['stt', 'realtime_stt'],
    secretKey: 'GOOGLE_API_KEY',
    isConfigured: true,
    priority: 4,
    costPerUnit: 0.000024,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'],
    strengths: ['Real-time', 'Speaker diarization', 'Punctuation'],
    weaknesses: ['Complex setup'],
  },
  deepseek_stt: {
    id: 'deepseek_stt',
    name: 'DeepSeek STT',
    capabilities: ['stt'],
    secretKey: 'DEEPSEEK_API_KEY',
    isConfigured: true,
    priority: 5,
    costPerUnit: 0.000005,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['Ultra low cost', 'CJK optimized'],
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

// ============================================
// SFX GENERATION PROVIDERS (5-Zone Regional)
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
    strengths: ['High quality', 'Text-to-SFX', 'Diverse sounds', 'Western/EU/LatAm'],
    weaknesses: ['Credit-based pricing'],
    regions: ['US', 'UK', 'AU', 'CA', 'NZ', 'DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'PL', 'BR', 'MX', 'AR'],
  },
  alibaba_sfx: {
    id: 'alibaba_sfx',
    name: 'Alibaba Audio SFX',
    capabilities: ['sfx_gen'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: true,
    priority: 2,
    costPerUnit: 0.002,
    supportedLanguages: ['zh', 'ja', 'ko'],
    strengths: ['CJK optimized', 'Low cost', 'Asian sound styles'],
    weaknesses: ['Limited Western styles'],
    regions: ['CN', 'HK', 'TW', 'JP', 'KR', 'SG', 'MO'],
  },
  azure_sfx: {
    id: 'azure_sfx',
    name: 'Azure Audio SFX',
    capabilities: ['sfx_gen'],
    secretKey: 'AZURE_SPEECH_KEY',
    isConfigured: true,
    priority: 3,
    costPerUnit: 0.003,
    supportedLanguages: ['ar', 'he', 'fa'],
    strengths: ['MENA region', 'Arabic styles', 'Enterprise'],
    weaknesses: ['Limited SFX variety'],
    regions: ['SA', 'AE', 'EG', 'MA', 'JO', 'IQ', 'KW', 'QA', 'BH', 'OM'],
  },
  google_sfx: {
    id: 'google_sfx',
    name: 'Google Cloud Audio',
    capabilities: ['sfx_gen'],
    secretKey: 'GOOGLE_API_KEY',
    isConfigured: true,
    priority: 4,
    costPerUnit: 0.002,
    supportedLanguages: ['hi', 'ta', 'te', 'bn', 'id', 'vi', 'th'],
    strengths: ['India/SEA/Africa', 'Wide coverage', 'Reliable'],
    weaknesses: ['Basic SFX quality'],
    regions: ['IN', 'PK', 'BD', 'ID', 'VN', 'TH', 'PH', 'MY', 'NG', 'KE', 'GH'],
  },
  modelslab_audio: {
    id: 'modelslab_audio',
    name: 'ModelsLab Audio',
    capabilities: ['sfx_gen', 'music_gen'],
    secretKey: 'MODELSLAB_API_KEY',
    isConfigured: true,
    priority: 5,
    costPerUnit: 0.003,
    strengths: ['MusicGen', 'Bark model', 'Low cost', 'Fallback'],
    weaknesses: ['Less refined than ElevenLabs'],
  },
};

// ============================================
// MUSIC GENERATION PROVIDERS (5-Zone Regional)
// ============================================

export type MusicGenProvider = 'elevenlabs_music' | 'suno' | 'alibaba_music' | 'modelslab_music';

export const MUSIC_GEN_PROVIDERS: Record<MusicGenProvider, MediaProviderConfig> = {
  elevenlabs_music: {
    id: 'elevenlabs_music',
    name: 'ElevenLabs Music',
    capabilities: ['music_gen'],
    secretKey: 'ELEVENLABS_API_KEY',
    isConfigured: true,
    priority: 1,
    costPerUnit: 0.03,
    strengths: ['High quality', 'Western styles', 'Fast generation'],
    weaknesses: ['Duration limits'],
    regions: ['US', 'UK', 'AU', 'CA', 'NZ', 'DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'PL', 'BR', 'MX', 'AR'],
  },
  suno: {
    id: 'suno',
    name: 'Suno AI',
    capabilities: ['music_gen'],
    secretKey: 'SUNO_API_KEY',
    isConfigured: false,
    priority: 0, // Premium tier
    costPerUnit: 0.10,
    strengths: ['Full songs', 'Vocals', 'Lyrics', 'Premium quality'],
    weaknesses: ['Higher cost', 'Longer generation time'],
  },
  alibaba_music: {
    id: 'alibaba_music',
    name: 'Alibaba Music Generation',
    capabilities: ['music_gen'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: true,
    priority: 2,
    costPerUnit: 0.015,
    supportedLanguages: ['zh', 'ja', 'ko'],
    strengths: ['CJK music styles', 'Traditional Asian', 'Low cost'],
    weaknesses: ['Limited Western genres'],
    regions: ['CN', 'HK', 'TW', 'JP', 'KR', 'SG', 'MO'],
  },
  modelslab_music: {
    id: 'modelslab_music',
    name: 'ModelsLab MusicGen',
    capabilities: ['music_gen'],
    secretKey: 'MODELSLAB_API_KEY',
    isConfigured: true,
    priority: 3,
    costPerUnit: 0.01,
    strengths: ['Cost-effective', 'Wide coverage', 'Fallback option'],
    weaknesses: ['Basic quality'],
  },
};

// ============================================
// NLP PROVIDERS
// ============================================

export const NLP_PROVIDERS: Record<NLPProvider, MediaProviderConfig> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    capabilities: ['nlp'],
    secretKey: 'GEMINI_API_KEY',
    isConfigured: true,
    priority: 1,
    costPerUnit: 0.00001,
    strengths: ['Fast', 'Multimodal', 'Good reasoning'],
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
    isConfigured: true,
    priority: 3,
    costPerUnit: 0.00002,
    strengths: ['GPT-4o', 'Fast', 'Good reasoning'],
    weaknesses: ['Rate limits'],
  },
  alibaba_qwen: {
    id: 'alibaba_qwen',
    name: 'Alibaba Qwen',
    capabilities: ['nlp'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: true,
    priority: 4,
    costPerUnit: 0.000008,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['Best for CJK', 'Low cost', 'Long context'],
    weaknesses: ['Regional focus'],
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek Chat',
    capabilities: ['nlp'],
    secretKey: 'DEEPSEEK_API_KEY',
    isConfigured: true,
    priority: 5,
    costPerUnit: 0.000005,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['Ultra low cost', 'CJK optimized', 'Technical content'],
    weaknesses: ['Newer model'],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getOCRProvider(providerId: OCRProvider): MediaProviderConfig | undefined {
  return OCR_PROVIDERS[providerId];
}

export function getTTSProvider(providerId: TTSProvider): MediaProviderConfig | undefined {
  return TTS_PROVIDERS[providerId];
}

export function getSTTProvider(providerId: STTProvider): MediaProviderConfig | undefined {
  return STT_PROVIDERS[providerId];
}

export function getConfiguredOCRProviders(): MediaProviderConfig[] {
  return Object.values(OCR_PROVIDERS)
    .filter(p => p.isConfigured)
    .sort((a, b) => a.priority - b.priority);
}

export function getConfiguredTTSProviders(): MediaProviderConfig[] {
  return Object.values(TTS_PROVIDERS)
    .filter(p => p.isConfigured)
    .sort((a, b) => a.priority - b.priority);
}

export function getConfiguredSTTProviders(): MediaProviderConfig[] {
  return Object.values(STT_PROVIDERS)
    .filter(p => p.isConfigured)
    .sort((a, b) => a.priority - b.priority);
}

// Get best TTS/STT provider for language
export function getTTSProviderForLanguage(language: string): MediaProviderConfig {
  const cjkLanguages = ['zh', 'ja', 'ko', 'zh-CN', 'zh-TW'];
  if (cjkLanguages.some(l => language.startsWith(l))) {
    return TTS_PROVIDERS.alibaba_voice;
  }
  return TTS_PROVIDERS.elevenlabs;
}

export function getSTTProviderForLanguage(language: string): MediaProviderConfig {
  const cjkLanguages = ['zh', 'ja', 'ko', 'zh-CN', 'zh-TW'];
  if (cjkLanguages.some(l => language.startsWith(l))) {
    return STT_PROVIDERS.alibaba_voice;
  }
  return STT_PROVIDERS.openai_whisper;
}

// Provider tier mapping
export const AUDIO_PROVIDER_TIERS = {
  tts: {
    tier1: ['elevenlabs', 'azure'] as TTSProvider[],
    tier2: ['alibaba_voice', 'openai', 'google'] as TTSProvider[],
    tier3: ['deepseek_tts'] as TTSProvider[],
  },
  stt: {
    tier1: ['openai_whisper', 'azure'] as STTProvider[],
    tier2: ['alibaba_voice', 'google'] as STTProvider[],
    tier3: ['deepseek_stt'] as STTProvider[],
  },
  ocr: {
    tier1: ['azure_doc_intel', 'google_vision'] as OCRProvider[],
    tier2: ['azure_cv', 'alibaba_qwen_vl'] as OCRProvider[],
    tier3: ['deepseek_ocr', 'tesseract'] as OCRProvider[],
  },
};
