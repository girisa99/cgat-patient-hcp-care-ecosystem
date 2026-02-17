/**
 * Universal AI Hub - Provider Registry
 * 
 * Complete capability matrix for all AI providers
 * Used across Genie Suite: Spark, Mind, Vibe, Arc, Deck, Hub, Ask Genie
 */

// ============================================
// CAPABILITY TYPES
// ============================================

export type AICapability = 
  | 'llm'           // Large Language Model (chat, reasoning)
  | 'translation'   // Text translation
  | 'ocr'           // Optical Character Recognition
  | 'tts'           // Text-to-Speech
  | 'stt'           // Speech-to-Text
  | 'realtime_stt'  // Real-time Speech-to-Text (<100ms latency)
  | 'image_gen'     // Image generation
  | 'video_gen'     // Video generation
  | 'music_gen'     // Music generation
  | 'sfx_gen'       // Sound effects generation
  | 'vision'        // Image understanding/analysis
  | 'nlp'           // NLP (entity extraction, sentiment, etc.)
  | 'avatar'        // AI Avatar generation
  | '3d_gen';       // 3D model generation

export type AIProviderKey = 
  // Core 15 Ecosystem - Actually Configured Providers (Updated 2026-01-30)
  | 'openai'      // GPT-5, DALL-E 3, Whisper, TTS
  | 'claude'      // Claude 4 Sonnet - Claude Zone (West)
  | 'gemini'      // Gemini 3 Pro - Gemini Zone (India/SEA/Africa)
  | 'deepgram'    // Real-time STT (<100ms) - Primary STT across all zones
  | 'deepseek'    // DeepSeek V3 - Cost-efficient fallback
  | 'alibaba'     // Qwen-Max, Qwen3-TTS, WAN 2.2 - Alibaba Zone (CJK)
  | 'azure'       // Azure Neural TTS, Visemes, Form Recognizer, Translator
  | 'modelslab'   // FLUX Pro, AnimateDiff, 3D Mesh
  | 'meshy'       // High-fidelity 3D, PBR textures, Rigging
  | 'replicate'   // Open-source models, TripoSR (Image-to-3D)
  | 'elevenlabs'  // Premium TTS, Voice Cloning, SFX, Music
  | 'sora2api'    // Primary video generation - Cinematic/Realistic
  | 'deepl'       // European languages, Context-aware translation
  // Legacy/Deprecated (route to Core 15)
  | 'aws'         // Not required - Route to Azure
  | 'google'      // Route to Gemini
  | 'stability'   // Route to ModelsLab
  | 'huggingface';// Route to Replicate

// ============================================
// PROVIDER DEFINITION
// ============================================

export interface AIProviderDefinition {
  id: AIProviderKey;
  name: string;
  description: string;
  secretKeys: string[];              // Required secret keys
  capabilities: AICapability[];
  capabilityDetails: Partial<Record<AICapability, CapabilityDetail>>;
  priority: number;                  // Global priority (lower = higher priority)
  costTier: 'free' | 'low' | 'medium' | 'high' | 'premium';
  status: 'active' | 'beta' | 'deprecated' | 'future';
}

export interface CapabilityDetail {
  models: string[];
  strengths: string[];
  weaknesses: string[];
  supportedLanguages?: string[];
  priority: number;                  // Capability-specific priority
  costPerUnit: number;
  rateLimit?: number;
  notes?: string;
}

// ============================================
// COMPLETE PROVIDER REGISTRY
// ============================================

export const AI_PROVIDER_REGISTRY: Record<AIProviderKey, AIProviderDefinition> = {
  // ============================================
  // TIER 1: PRIMARY PROVIDERS
  // ============================================
  
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI GPT models, DALL-E, Whisper, TTS, Sora',
    secretKeys: ['OPENAI_API_KEY'],
    capabilities: ['llm', 'translation', 'tts', 'stt', 'image_gen', 'video_gen', 'vision', 'nlp'],
    priority: 1,
    costTier: 'high',
    status: 'active',
    capabilityDetails: {
      llm: {
        models: ['gpt-5', 'gpt-5-mini', 'gpt-4o', 'gpt-4o-mini', 'o3', 'o4-mini'],
        strengths: ['Versatile', 'Function calling', 'JSON mode', 'Strong reasoning'],
        weaknesses: ['Higher cost', 'Rate limits'],
        priority: 1,
        costPerUnit: 0.00003,
      },
      translation: {
        models: ['gpt-4o', 'gpt-4o-mini'],
        strengths: ['Context-aware', 'Handles idioms well', 'Good for creative content'],
        weaknesses: ['Slower than dedicated services', 'Higher cost'],
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'],
        priority: 3,
        costPerUnit: 0.00003,
      },
      tts: {
        models: ['tts-1', 'tts-1-hd'],
        strengths: ['Simple API', 'Good quality', 'Fast'],
        weaknesses: ['Limited voice options', 'No SSML'],
        priority: 3,
        costPerUnit: 0.000015,
      },
      stt: {
        models: ['whisper-1'],
        strengths: ['Excellent accuracy', 'Many languages', 'Handles accents well'],
        weaknesses: ['File size limits', 'No real-time'],
        priority: 1,
        costPerUnit: 0.0001,
      },
      image_gen: {
        models: ['dall-e-3', 'dall-e-2', 'gpt-image-1'],
        strengths: ['Excellent text rendering', 'High quality', 'Prompt refinement'],
        weaknesses: ['Expensive', 'No editing API'],
        priority: 2,
        costPerUnit: 0.04,
      },
      video_gen: {
        models: ['sora-1.0-turbo', 'sora', 'animatediff-openai'],
        strengths: ['High quality', 'Long duration', 'Complex scenes', 'AnimateDiff support'],
        weaknesses: ['Very expensive', 'API availability varies'],
        priority: 1,
        costPerUnit: 0.50,
        notes: 'Sora for premium, falls back to ModelsLab AnimateDiff',
      },
      vision: {
        models: ['gpt-4o', 'gpt-4-vision-preview'],
        strengths: ['Excellent understanding', 'Multi-image', 'OCR capable'],
        weaknesses: ['Higher cost'],
        priority: 1,
        costPerUnit: 0.00003,
      },
      nlp: {
        models: ['gpt-4o', 'gpt-4o-mini'],
        strengths: ['Versatile', 'Good for structured extraction'],
        weaknesses: ['Cost'],
        priority: 2,
        costPerUnit: 0.00003,
      },
    },
  },

  claude: {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'Claude models - excellent for nuanced text, literary translation',
    secretKeys: ['ANTHROPIC_API_KEY'],
    capabilities: ['llm', 'translation', 'vision', 'nlp'],
    priority: 2,
    costTier: 'high',
    status: 'active',
    capabilityDetails: {
      llm: {
        models: ['claude-opus-4', 'claude-sonnet-4', 'claude-3-5-sonnet', 'claude-3-5-haiku'],
        strengths: ['Best for nuance', 'Long context (200k)', 'Instruction following', 'Safety'],
        weaknesses: ['Higher cost', 'No function calling (tools instead)'],
        priority: 2,
        costPerUnit: 0.00003,
      },
      translation: {
        models: ['claude-3-5-sonnet', 'claude-sonnet-4'],
        strengths: ['Literary translation', 'European languages', 'Preserves tone/style', 'Nuanced'],
        weaknesses: ['Slower', 'Higher cost than dedicated services'],
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh'],
        priority: 2, // Great for literary/nuanced content
        costPerUnit: 0.00003,
        notes: 'Excellent for literary, marketing, and nuanced translations',
      },
      vision: {
        models: ['claude-3-5-sonnet', 'claude-sonnet-4'],
        strengths: ['Detailed analysis', 'Document understanding', 'Chart reading'],
        weaknesses: ['No OCR-specific mode'],
        priority: 2,
        costPerUnit: 0.00003,
      },
      nlp: {
        models: ['claude-3-5-sonnet'],
        strengths: ['Nuanced understanding', 'Complex entity extraction'],
        weaknesses: ['Cost'],
        priority: 1,
        costPerUnit: 0.00003,
      },
    },
  },

  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google Gemini models - multimodal, fast, excellent context window',
    secretKeys: ['GEMINI_API_KEY', 'GOOGLE_API_KEY'], // Either key works
    capabilities: ['llm', 'translation', 'ocr', 'tts', 'stt', 'image_gen', 'vision', 'nlp'],
    priority: 1,
    costTier: 'medium',
    status: 'active',
    capabilityDetails: {
      llm: {
        models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-3-pro-preview'],
        strengths: ['Fast', 'Multimodal native', 'Long context (1M)', 'Cost efficient'],
        weaknesses: ['Less consistent than GPT-4 on some tasks'],
        priority: 1,
        costPerUnit: 0.00001,
      },
      translation: {
        models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
        strengths: ['Fast', 'Good quality', '100+ languages', 'Context-aware'],
        weaknesses: ['Less nuanced than Claude for literary'],
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru', 'th', 'vi'],
        priority: 1,
        costPerUnit: 0.00001,
      },
      ocr: {
        models: ['gemini-2.5-flash', 'gemini-1.5-pro'],
        strengths: ['Vision-native OCR', 'Understands context', 'Handles handwriting'],
        weaknesses: ['Not as structured as Form Recognizer'],
        priority: 2,
        costPerUnit: 0.00001,
      },
      tts: {
        models: ['gemini-tts'],
        strengths: ['Via Google Cloud', 'WaveNet voices', 'Many languages'],
        weaknesses: ['Requires separate Google Cloud TTS key'],
        priority: 3,
        costPerUnit: 0.000016,
      },
      stt: {
        models: ['gemini-stt'],
        strengths: ['Via Google Cloud', 'Real-time', 'Speaker diarization'],
        weaknesses: ['Complex setup'],
        priority: 3,
        costPerUnit: 0.000024,
      },
      image_gen: {
        models: ['gemini-2.5-flash-image', 'gemini-3-pro-image'],
        strengths: ['Fast', 'Good quality', 'Edit capability', 'Via Lovable AI'],
        weaknesses: ['Base64 output can be large'],
        priority: 1,
        costPerUnit: 0.002,
      },
      vision: {
        models: ['gemini-2.5-flash', 'gemini-1.5-pro'],
        strengths: ['Native multimodal', 'Fast', 'Good understanding'],
        weaknesses: ['Occasional hallucinations on details'],
        priority: 1,
        costPerUnit: 0.00001,
      },
      nlp: {
        models: ['gemini-2.5-flash'],
        strengths: ['Fast', 'Good for structured extraction'],
        weaknesses: ['Less nuanced than Claude'],
        priority: 1,
        costPerUnit: 0.00001,
      },
    },
  },

  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek models - excellent for Chinese, technical, code-mixed content',
    secretKeys: ['DEEPSEEK_API_KEY'],
    capabilities: ['llm', 'translation', 'ocr', 'vision', 'nlp'],
    priority: 3,
    costTier: 'low',
    status: 'active',
    capabilityDetails: {
      llm: {
        models: ['deepseek-chat', 'deepseek-coder', 'deepseek-math'],
        strengths: ['Best for Chinese', 'Technical content', 'Code', 'Very low cost'],
        weaknesses: ['Less strong on Western languages'],
        priority: 3,
        costPerUnit: 0.000005,
      },
      translation: {
        models: ['deepseek-chat'],
        strengths: ['Excellent Chinese↔English', 'Technical documents', 'Code comments'],
        weaknesses: ['Limited for other language pairs'],
        supportedLanguages: ['zh', 'en', 'ja', 'ko'],
        priority: 1, // Best for Chinese
        costPerUnit: 0.000005,
        notes: 'Use for Chinese/CJK content, technical docs, code-mixed text',
      },
      ocr: {
        models: ['deepseek-vl'],
        strengths: ['Vision-language model', 'Good for Chinese documents', 'Technical diagrams'],
        weaknesses: ['Limited compared to dedicated OCR'],
        priority: 4,
        costPerUnit: 0.00001,
        notes: 'OCR via DeepSeek-VL vision model',
      },
      vision: {
        models: ['deepseek-vl', 'deepseek-vl2'],
        strengths: ['Good for technical diagrams', 'Chinese text in images'],
        weaknesses: ['Less general than GPT-4V'],
        priority: 3,
        costPerUnit: 0.00001,
      },
      nlp: {
        models: ['deepseek-chat'],
        strengths: ['Technical entity extraction', 'Chinese NER'],
        weaknesses: ['Limited for other domains'],
        priority: 4,
        costPerUnit: 0.000005,
      },
    },
  },

  alibaba: {
    id: 'alibaba',
    name: 'Alibaba DashScope',
    description: 'Alibaba Qwen models - full-stack AI with CJK focus',
    secretKeys: ['ALIBABA_API_KEY'],
    capabilities: ['llm', 'translation', 'ocr', 'tts', 'stt', 'image_gen', 'video_gen', 'vision', 'nlp'],
    priority: 4,
    costTier: 'low',
    status: 'active',
    capabilityDetails: {
      llm: {
        models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen2.5-72b'],
        strengths: ['Excellent CJK', 'Low cost', 'Fast', 'Full-stack provider'],
        weaknesses: ['Less strong on European languages'],
        priority: 4,
        costPerUnit: 0.00001,
      },
      translation: {
        models: ['qwen-mt'],
        strengths: ['Best for CJK languages', 'Low cost', 'Fast'],
        weaknesses: ['Less nuanced for European'],
        supportedLanguages: ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'th', 'vi'],
        priority: 1, // Best for CJK
        costPerUnit: 0.000005,
      },
      ocr: {
        models: ['qwen-vl-max', 'qwen-vl-plus'],
        strengths: ['Excellent for CJK', 'Document understanding', 'Tables'],
        weaknesses: ['Newer service'],
        priority: 3,
        costPerUnit: 0.00001,
      },
      tts: {
        models: ['qwen3-tts-flash', 'sambert'],
        strengths: ['Excellent Chinese voices', 'Voice cloning', 'Low cost'],
        weaknesses: ['Fewer English voices'],
        priority: 4,
        costPerUnit: 0.00001,
      },
      stt: {
        models: ['paraformer', 'paraformer-realtime'],
        strengths: ['Best for Chinese dialects', 'Real-time', 'Low cost'],
        weaknesses: ['Limited language support'],
        priority: 4,
        costPerUnit: 0.00001,
      },
      image_gen: {
        models: ['wanx-v1', 'wanx-lite'],
        strengths: ['Low cost', 'Good for Asian aesthetics', 'Multiple styles'],
        weaknesses: ['Less consistent than DALL-E'],
        priority: 4,
        costPerUnit: 0.005,
      },
      video_gen: {
        models: ['wanx-video'],
        strengths: ['Low cost', 'Good quality', 'Available now'],
        weaknesses: ['Shorter duration than Sora'],
        priority: 2,
        costPerUnit: 0.05,
        notes: 'Good fallback for video generation',
      },
      vision: {
        models: ['qwen-vl-max', 'qwen-vl-plus'],
        strengths: ['Good for CJK text', 'Document analysis'],
        weaknesses: ['Less general than GPT-4V'],
        priority: 4,
        costPerUnit: 0.00001,
      },
      nlp: {
        models: ['qwen-max', 'qwen-plus'],
        strengths: ['CJK entity extraction', 'Low cost'],
        weaknesses: ['Less nuanced for English'],
        priority: 4,
        costPerUnit: 0.00001,
      },
    },
  },

  azure: {
    id: 'azure',
    name: 'Azure Cognitive Services',
    description: 'Microsoft Azure AI - enterprise-grade, HIPAA compliant (Speech, Form Recognizer, Translate)',
    // NOTE: We do NOT use Azure OpenAI - we use OpenAI API directly
    secretKeys: ['AZURE_SPEECH_KEY', 'AZURE_FORM_RECOGNIZER_KEY', 'MICROSOFT_TRANSLATE_API_KEY'],
    capabilities: ['translation', 'ocr', 'tts', 'stt', 'vision', 'nlp'],
    priority: 2,
    costTier: 'medium',
    status: 'active',
    capabilityDetails: {
      translation: {
        models: ['microsoft-translator'],
        strengths: ['135+ languages', 'Enterprise-grade', 'Custom translator'],
        weaknesses: ['Less context-aware than LLMs'],
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru', 'nl', 'pl'],
        priority: 2,
        costPerUnit: 0.00001,
      },
      ocr: {
        models: ['document-intelligence', 'form-recognizer', 'computer-vision'],
        strengths: ['Best for forms/invoices', 'Structured extraction', 'Key-value pairs', 'Enterprise'],
        weaknesses: ['Limited handwriting'],
        priority: 1, // Best for structured documents
        costPerUnit: 0.001,
      },
      tts: {
        models: ['neural-tts'],
        strengths: ['400+ voices', 'Speaking styles', 'SSML support', 'Visemes (lip-sync)', 'Multilingual'],
        weaknesses: ['Complex pricing'],
        priority: 1, // Best for TTS variety and enterprise
        costPerUnit: 0.000016,
      },
      stt: {
        models: ['speech-to-text'],
        strengths: ['Real-time', 'Batch', 'Custom models', 'Many languages'],
        weaknesses: ['Requires region config'],
        priority: 2,
        costPerUnit: 0.00001,
      },
      vision: {
        models: ['computer-vision', 'document-intelligence'],
        strengths: ['OCR', 'Object detection', 'Image analysis'],
        weaknesses: ['Less reasoning than GPT-4V'],
        priority: 2,
        costPerUnit: 0.001,
      },
      nlp: {
        models: ['language-service'],
        strengths: ['Entity recognition', 'Sentiment', 'PII detection', 'Healthcare NLP'],
        weaknesses: ['Less flexible than LLM-based'],
        priority: 3,
        costPerUnit: 0.001,
      },
    },
  },

  // ============================================
  // TIER 2: SPECIALIZED PROVIDERS
  // ============================================

  aws: {
    id: 'aws',
    name: 'AWS AI Services',
    description: 'Amazon Web Services AI - enterprise fallback',
    secretKeys: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    capabilities: ['llm', 'translation', 'ocr', 'tts', 'stt', 'image_gen', 'vision', 'nlp'],
    priority: 90, // Fallback priority
    costTier: 'medium',
    status: 'future', // Not fully implemented yet
    capabilityDetails: {
      llm: {
        models: ['bedrock-claude', 'bedrock-titan', 'bedrock-llama'],
        strengths: ['Enterprise', 'Multiple models via Bedrock', 'Private'],
        weaknesses: ['Complex setup', 'Requires AWS account'],
        priority: 90,
        costPerUnit: 0.00003,
        notes: 'Future: AWS Bedrock integration',
      },
      translation: {
        models: ['amazon-translate'],
        strengths: ['75+ languages', 'High-volume', 'Custom terminology'],
        weaknesses: ['Less context-aware'],
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'],
        priority: 90,
        costPerUnit: 0.000015,
      },
      ocr: {
        models: ['textract'],
        strengths: ['Excellent table extraction', 'Forms', 'AWS integration'],
        weaknesses: ['Limited language support'],
        priority: 90,
        costPerUnit: 0.0015,
      },
      tts: {
        models: ['polly'],
        strengths: ['Neural voices', 'SSML', 'AWS integration'],
        weaknesses: ['Less natural than ElevenLabs'],
        priority: 90,
        costPerUnit: 0.000016,
      },
      stt: {
        models: ['transcribe'],
        strengths: ['Custom vocabulary', 'Medical transcription', 'Real-time'],
        weaknesses: ['AWS lock-in'],
        priority: 90,
        costPerUnit: 0.000024,
      },
      image_gen: {
        models: ['bedrock-titan-image', 'bedrock-sdxl'],
        strengths: ['Via Bedrock', 'Enterprise'],
        weaknesses: ['Complex setup'],
        priority: 90,
        costPerUnit: 0.01,
      },
      vision: {
        models: ['rekognition'],
        strengths: ['Object detection', 'Face analysis', 'Content moderation'],
        weaknesses: ['Less reasoning than LLM-based'],
        priority: 90,
        costPerUnit: 0.001,
      },
      nlp: {
        models: ['comprehend', 'comprehend-medical'],
        strengths: ['Entity recognition', 'Medical NLP', 'PII detection'],
        weaknesses: ['Less flexible'],
        priority: 90,
        costPerUnit: 0.001,
      },
    },
  },

  deepl: {
    id: 'deepl',
    name: 'DeepL',
    description: 'DeepL - translation only, highest quality for European languages',
    secretKeys: ['DEEPL_API_KEY'],
    capabilities: ['translation'],
    priority: 1,
    costTier: 'medium',
    status: 'active',
    capabilityDetails: {
      translation: {
        models: ['deepl-pro'],
        strengths: ['Highest quality for EU languages', 'Formality control', 'Glossary support'],
        weaknesses: ['Limited to 36 languages', 'No CJK expertise'],
        supportedLanguages: ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'zh'],
        priority: 1, // Best for EU translation quality
        costPerUnit: 0.00002,
        notes: 'Use for high-quality European language translation',
      },
    },
  },

  elevenlabs: {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'ElevenLabs - TTS, Music, and Sound Effects',
    secretKeys: ['ELEVENLABS_API_KEY'],
    capabilities: ['tts', 'music_gen', 'sfx_gen'],
    priority: 1,
    costTier: 'high',
    status: 'active',
    capabilityDetails: {
      tts: {
        models: ['eleven_multilingual_v2', 'eleven_turbo_v2'],
        strengths: ['Most natural sounding', 'Voice cloning', 'Excellent emotion'],
        weaknesses: ['Higher cost', 'Fewer languages than Azure'],
        priority: 1, // Best TTS quality
        costPerUnit: 0.00003,
      },
      music_gen: {
        models: ['music-v1'],
        strengths: ['Studio quality', 'Various genres', 'Text prompts'],
        weaknesses: ['Cost', 'Duration limits'],
        priority: 1,
        costPerUnit: 0.01,
        notes: 'Generate original music from text descriptions',
      },
      sfx_gen: {
        models: ['sound-generation'],
        strengths: ['High quality', 'Fast', 'Up to 22 seconds'],
        weaknesses: ['Duration limits'],
        priority: 1,
        costPerUnit: 0.005,
        notes: 'Generate sound effects from text descriptions',
      },
    },
  },

  google: {
    id: 'google',
    name: 'Google Cloud AI',
    description: 'Google Cloud AI services (separate from Gemini)',
    secretKeys: ['GOOGLE_API_KEY', 'GOOGLE_CLOUD_KEY'],
    capabilities: ['llm', 'translation', 'ocr', 'tts', 'stt', 'image_gen', 'video_gen', 'vision', 'nlp'],
    priority: 3,
    costTier: 'medium',
    status: 'active',
    capabilityDetails: {
      translation: {
        models: ['google-translate'],
        strengths: ['249+ languages', 'Fast', 'Free tier', 'Reliable'],
        weaknesses: ['Less context-aware than LLMs'],
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru', 'th', 'vi'],
        priority: 1,
        costPerUnit: 0.00002,
      },
      ocr: {
        models: ['cloud-vision'],
        strengths: ['100+ languages', 'Fast', 'Good handwriting', 'Document AI'],
        weaknesses: ['Less structured than Azure Form Recognizer'],
        priority: 1,
        costPerUnit: 0.0015,
      },
      tts: {
        models: ['cloud-tts', 'wavenet'],
        strengths: ['WaveNet voices', 'SSML support', 'Many languages'],
        weaknesses: ['Less natural than ElevenLabs'],
        priority: 2,
        costPerUnit: 0.000016,
      },
      stt: {
        models: ['speech-to-text'],
        strengths: ['Real-time', 'Speaker diarization', 'Punctuation'],
        weaknesses: ['Complex pricing'],
        priority: 2,
        costPerUnit: 0.000024,
      },
      image_gen: {
        models: ['imagen-3'],
        strengths: ['High quality', 'Good text rendering'],
        weaknesses: ['Limited access'],
        priority: 3,
        costPerUnit: 0.02,
      },
      video_gen: {
        models: ['veo'],
        strengths: ['High quality', 'Long duration'],
        weaknesses: ['Limited access', 'Expensive'],
        priority: 2,
        costPerUnit: 0.20,
        notes: 'Google Veo - separate from Gemini',
      },
      vision: {
        models: ['cloud-vision'],
        strengths: ['Object detection', 'OCR', 'Label detection'],
        weaknesses: ['Less reasoning than LLM-based'],
        priority: 2,
        costPerUnit: 0.0015,
      },
      nlp: {
        models: ['natural-language'],
        strengths: ['Entity extraction', 'Sentiment', 'Syntax analysis'],
        weaknesses: ['Less flexible than LLMs'],
        priority: 3,
        costPerUnit: 0.001,
      },
      llm: {
        models: ['palm-2'],
        strengths: ['Google quality'],
        weaknesses: ['Use Gemini instead via Lovable AI'],
        priority: 5,
        costPerUnit: 0.00001,
        notes: 'Prefer Gemini via Lovable AI Gateway',
      },
    },
  },

  replicate: {
    id: 'replicate',
    name: 'Replicate',
    description: 'Replicate - open-source models, image & video generation',
    secretKeys: ['REPLICATE_API_TOKEN'],
    capabilities: ['image_gen', 'video_gen'],
    priority: 5,
    costTier: 'low',
    status: 'active',
    capabilityDetails: {
      image_gen: {
        models: ['flux-schnell', 'flux-dev', 'sdxl'],
        strengths: ['Many models', 'Pay-per-use', 'Open source'],
        weaknesses: ['Cold start delays', 'Variable quality'],
        priority: 5,
        costPerUnit: 0.002,
      },
      video_gen: {
        models: ['minimax-video-01', 'runway-gen3', 'kling'],
        strengths: ['Multiple models', 'Good quality', 'Available now'],
        weaknesses: ['Cold start', 'Quality varies by model'],
        priority: 3,
        costPerUnit: 0.05,
        notes: 'Good fallback for video generation',
      },
    },
  },

  stability: {
    id: 'stability',
    name: 'Stability AI',
    description: 'Stability AI - Stable Diffusion models',
    secretKeys: ['STABILITY_API_KEY'],
    capabilities: ['image_gen'],
    priority: 6,
    costTier: 'low',
    status: 'active',
    capabilityDetails: {
      image_gen: {
        models: ['stable-diffusion-xl', 'stable-diffusion-3', 'sd3-turbo'],
        strengths: ['Fine control', 'Inpainting', 'ControlNet', 'Low cost'],
        weaknesses: ['Complex API', 'Text rendering less good'],
        priority: 4,
        costPerUnit: 0.002,
      },
    },
  },

  huggingface: {
    id: 'huggingface',
    name: 'HuggingFace',
    description: 'HuggingFace Inference API - open source models',
    secretKeys: ['HUGGINGFACE_TOKEN'],
    capabilities: ['image_gen', 'llm', 'nlp'],
    priority: 7,
    costTier: 'free',
    status: 'active',
    capabilityDetails: {
      image_gen: {
        models: ['FLUX.1-schnell', 'stable-diffusion-xl'],
        strengths: ['Open models', 'Free tier', 'Customizable'],
        weaknesses: ['Rate limits', 'Variable quality'],
        priority: 6,
        costPerUnit: 0.001,
      },
      llm: {
        models: ['mistral-7b', 'llama-3', 'phi-3'],
        strengths: ['Open source', 'Free tier', 'Privacy'],
        weaknesses: ['Smaller models', 'Rate limits'],
        priority: 8,
        costPerUnit: 0.0001,
      },
      nlp: {
        models: ['bert', 'roberta', 'distilbert'],
        strengths: ['Free', 'Fast', 'Specialized models'],
        weaknesses: ['Less capable than LLMs'],
        priority: 7,
        costPerUnit: 0.0001,
      },
    },
  },

  // ============================================
  // MODELSLAB - UNIFIED MULTI-MODAL HUB
  // ============================================
  modelslab: {
    id: 'modelslab',
    name: 'ModelsLab',
    description: 'Unified hub for Image/Video/Audio/3D/Training - hosts Stable Diffusion, FLUX, Midjourney-style, CivitAI models',
    secretKeys: ['MODELSLAB_API_KEY'],
    capabilities: ['image_gen', 'video_gen', 'music_gen', 'sfx_gen', 'tts', 'llm'],
    priority: 2,
    costTier: 'low',
    status: 'active',
    capabilityDetails: {
      image_gen: {
        models: [
          'stable-diffusion-xl', 'stable-diffusion-3', 'sd-turbo',
          'flux-schnell', 'flux-dev', 'flux-pro',
          'midjourney-style', 'realistic-vision', 'dreamshaper',
          'anything-v5', 'deliberate', 'protogen'
        ],
        strengths: ['10,000+ models', 'CivitAI integration', 'Midjourney-style', 'ControlNet', 'Inpainting', 'Low cost'],
        weaknesses: ['API complexity for advanced features'],
        priority: 1, // Primary for image generation
        costPerUnit: 0.002,
        notes: 'Best unified option - replaces Stability AI direct, Midjourney needs, Ideogram, Leonardo',
      },
      video_gen: {
        models: ['animatediff', 'stable-video-diffusion', 'text2video', 'img2video'],
        strengths: ['Multiple approaches', 'AnimateDiff support', 'Low cost'],
        weaknesses: ['Shorter clips than Sora'],
        priority: 1, // Primary for video
        costPerUnit: 0.01,
      },
      music_gen: {
        models: ['musicgen', 'riffusion', 'audioldm'],
        strengths: ['Music generation', 'Sound effects', 'Affordable'],
        weaknesses: ['Not as refined as Suno'],
        priority: 2,
        costPerUnit: 0.005,
      },
      sfx_gen: {
        models: ['audioldm', 'bark'],
        strengths: ['Sound effects', 'Ambient sounds'],
        weaknesses: ['Limited compared to dedicated services'],
        priority: 2,
        costPerUnit: 0.003,
      },
      tts: {
        models: ['voice-clone', 'bark-tts', 'tortoise-tts'],
        strengths: ['Voice cloning', 'Multiple styles'],
        weaknesses: ['Not as polished as ElevenLabs'],
        priority: 4, // ElevenLabs is preferred for TTS
        costPerUnit: 0.002,
      },
      llm: {
        models: ['llama-3', 'mistral', 'qwen'],
        strengths: ['Open models', 'Fine-tuning available'],
        weaknesses: ['Smaller than GPT-5/Claude'],
        priority: 6,
        costPerUnit: 0.0001,
      },
    },
  },

  // ============================================
  // MESHY AI - HIGH-FIDELITY 3D SPECIALIST
  // ============================================
  meshy: {
    id: 'meshy',
    name: 'Meshy AI',
    description: 'High-fidelity 3D generation - PBR textures, Auto-rigging, USDZ/GLTF export',
    secretKeys: ['MESHY_API_KEY'],
    capabilities: ['image_gen', 'video_gen'], // Using existing types for 3D
    priority: 3,
    costTier: 'medium',
    status: 'active',
    capabilityDetails: {
      image_gen: {
        models: ['meshy-text-to-3d', 'meshy-image-to-3d', 'meshy-text-to-texture'],
        strengths: [
          'High-fidelity 3D mesh generation',
          'PBR (Physically Based Rendering) textures',
          'Auto-rigging for animation',
          'Multiple export formats (USDZ, GLTF, GLB, FBX, OBJ)',
          'Image-to-3D conversion',
          'Stylized and realistic modes',
          '4 concurrent tasks + 5 free retries (Pro tier)'
        ],
        weaknesses: ['400 assets/month on Pro', 'Specialized for 3D only'],
        priority: 1, // Primary for high-fidelity 3D
        costPerUnit: 0.05,
        notes: 'Best for e-commerce product visualization, gaming assets, AR/VR, and metaverse content',
      },
      video_gen: {
        models: ['meshy-3d-animation'],
        strengths: ['Animated 3D with rigging', 'Character turntables', '360° product views'],
        weaknesses: ['Limited to 3D animation only'],
        priority: 3,
        costPerUnit: 0.10,
        notes: 'For animated 3D assets - use ModelsLab AnimateDiff for 2D video',
      },
    },
  },

  // ============================================
  // NEW PROVIDERS - Added 2026-01-30
  // ============================================

  deepgram: {
    id: 'deepgram',
    name: 'Deepgram',
    description: 'Deepgram - Real-time STT with <100ms latency, best accuracy',
    secretKeys: ['DEEPGRAM_API_KEY'],
    capabilities: ['stt', 'realtime_stt'],
    priority: 1,
    costTier: 'medium',
    status: 'active',
    capabilityDetails: {
      stt: {
        models: ['nova-2', 'nova-2-general', 'nova-2-meeting', 'nova-2-phonecall'],
        strengths: ['<100ms latency', '36+ languages', 'Real-time streaming', 'Best accuracy', 'Speaker diarization'],
        weaknesses: ['No batch processing for large files'],
        priority: 1, // Primary STT provider
        costPerUnit: 0.0043,
        notes: 'Primary STT for all real-time use cases across all zones',
      },
      realtime_stt: {
        models: ['nova-2-streaming'],
        strengths: ['<100ms latency', 'WebSocket streaming', 'Interim results'],
        weaknesses: ['Requires streaming connection'],
        priority: 1,
        costPerUnit: 0.0043,
      },
    },
  },

  // ============================================
  // SORA2API - PRIMARY VIDEO GENERATION (CONFIGURED)
  // ============================================
  sora2api: {
    id: 'sora2api',
    name: 'Sora2API',
    description: 'Sora2API - Primary video generation via sora2api.org',
    secretKeys: ['SORA2API_KEY'],
    capabilities: ['video_gen'],
    priority: 1,
    costTier: 'medium',
    status: 'active',
    capabilityDetails: {
      video_gen: {
        models: ['sora-1.0-turbo', 'sora-1.0'],
        strengths: ['Cinematic quality', 'Realistic scenes', 'Commercial video', 'Documentary style', 'Film quality'],
        weaknesses: ['Processing time', 'Cost per generation'],
        priority: 1, // PRIMARY for video generation
        costPerUnit: 0.10,
        notes: 'Primary video provider - cinematic, realistic, commercial, documentary, film_quality, stock_footage',
      },
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all providers that support a given capability
 */
export function getProvidersForCapability(capability: AICapability): AIProviderDefinition[] {
  return Object.values(AI_PROVIDER_REGISTRY)
    .filter(p => p.capabilities.includes(capability) && p.status !== 'deprecated')
    .sort((a, b) => {
      // Sort by capability-specific priority if available, else global priority
      const aDetail = a.capabilityDetails[capability];
      const bDetail = b.capabilityDetails[capability];
      const aPriority = aDetail?.priority ?? a.priority;
      const bPriority = bDetail?.priority ?? b.priority;
      return aPriority - bPriority;
    });
}

/**
 * Get recommended provider for a capability based on context
 */
export function getRecommendedProvider(
  capability: AICapability,
  context?: {
    language?: string;
    domain?: string;
    costSensitive?: boolean;
    qualityFirst?: boolean;
  }
): AIProviderKey | null {
  const providers = getProvidersForCapability(capability);
  if (providers.length === 0) return null;

  // Language-based recommendations
  if (context?.language) {
    const lang = context.language.toLowerCase();
    
    // CJK languages
    if (['zh', 'ja', 'ko', 'chinese', 'japanese', 'korean'].some(l => lang.includes(l))) {
      const cjkProviders = ['alibaba', 'deepseek', 'google'];
      const match = providers.find(p => cjkProviders.includes(p.id));
      if (match) return match.id;
    }
    
    // European languages
    if (['de', 'fr', 'es', 'it', 'nl', 'pl', 'german', 'french', 'spanish'].some(l => lang.includes(l))) {
      if (capability === 'translation') {
        const euProvider = providers.find(p => p.id === 'deepl');
        if (euProvider) return euProvider.id;
      }
    }
  }

  // Cost-sensitive
  if (context?.costSensitive) {
    const lowCostProviders = providers.filter(p => p.costTier === 'free' || p.costTier === 'low');
    if (lowCostProviders.length > 0) return lowCostProviders[0].id;
  }

  // Quality first
  if (context?.qualityFirst) {
    const premiumProviders = providers.filter(p => p.costTier === 'premium' || p.costTier === 'high');
    if (premiumProviders.length > 0) return premiumProviders[0].id;
  }

  // Default to first (highest priority)
  return providers[0].id;
}

/**
 * Get fallback chain for a capability
 */
export function getFallbackChain(capability: AICapability): AIProviderKey[] {
  return getProvidersForCapability(capability).map(p => p.id);
}

/**
 * Check if a provider is configured (has required secrets)
 */
export function getProviderSecretKeys(providerId: AIProviderKey): string[] {
  return AI_PROVIDER_REGISTRY[providerId]?.secretKeys || [];
}
