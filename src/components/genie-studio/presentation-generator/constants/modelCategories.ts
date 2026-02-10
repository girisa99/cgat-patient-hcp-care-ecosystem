/**
 * AI Model Categories - Separated by Type with Consistent Tiering
 * Tier 1 (Standard): Fast, cost-effective
 * Tier 2 (Advanced): Balanced quality/speed
 * Tier 3 (Premium): Highest quality, higher cost
 */

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  tier: 1 | 2 | 3;
  description: string;
  capabilities: string[];
  costMultiplier: number;
  quality: number; // 1-10
  speed: number; // 1-10
  isDefault?: boolean;
}

// ==========================================
// IMAGE GENERATION MODELS
// ==========================================
export const IMAGE_MODELS: ModelConfig[] = [
  // Tier 1 - Standard (Fast, Cost-effective)
  {
    id: 'gemini-image',
    name: 'Gemini Imagen',
    provider: 'Google',
    tier: 1,
    description: 'Fast image generation with good quality',
    capabilities: ['Text-to-image', 'Editing', 'Style transfer'],
    costMultiplier: 1.0,
    quality: 7,
    speed: 9,
    isDefault: true
  },
  {
    id: 'modelslab-realvision',
    name: 'ModelsLab RealVision',
    provider: 'ModelsLab',
    tier: 1,
    description: 'Photorealistic images at fast speeds',
    capabilities: ['Photorealistic', 'Portraits', 'Scenes'],
    costMultiplier: 1.0,
    quality: 7,
    speed: 8
  },
  {
    id: 'stability-core',
    name: 'Stability Core',
    provider: 'Stability AI',
    tier: 1,
    description: 'Stable Diffusion core model',
    capabilities: ['Text-to-image', 'Inpainting', 'Outpainting'],
    costMultiplier: 1.0,
    quality: 7,
    speed: 8
  },
  
  // Tier 2 - Advanced (Balanced)
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    tier: 2,
    description: 'High-quality artistic images with great prompt following',
    capabilities: ['Text-to-image', 'Style control', 'Artistic'],
    costMultiplier: 2.0,
    quality: 8,
    speed: 7
  },
  {
    id: 'flux-pro',
    name: 'FLUX Pro',
    provider: 'Black Forest Labs',
    tier: 2,
    description: 'State-of-the-art image generation',
    capabilities: ['Photorealistic', 'Text rendering', 'Detail'],
    costMultiplier: 2.0,
    quality: 9,
    speed: 6
  },
  {
    id: 'modelslab-flux',
    name: 'ModelsLab FLUX',
    provider: 'ModelsLab',
    tier: 2,
    description: 'FLUX model via ModelsLab API',
    capabilities: ['Photorealistic', 'Fast inference', 'Text rendering'],
    costMultiplier: 1.5,
    quality: 8,
    speed: 7
  },
  {
    id: 'civitai-sd-xl',
    name: 'CivitAI SDXL',
    provider: 'CivitAI',
    tier: 2,
    description: 'Community-trained SDXL models',
    capabilities: ['Custom styles', 'Fine-tuned', 'Community models'],
    costMultiplier: 1.5,
    quality: 8,
    speed: 7
  },
  
  // Tier 3 - Premium (Highest Quality)
  {
    id: 'midjourney-v6',
    name: 'Midjourney V6',
    provider: 'Midjourney',
    tier: 3,
    description: 'Premium artistic image generation',
    capabilities: ['Artistic', 'Photorealistic', 'Style control'],
    costMultiplier: 3.0,
    quality: 10,
    speed: 5
  },
  {
    id: 'alibaba-wanx',
    name: 'Alibaba Wanx',
    provider: 'Alibaba',
    tier: 3,
    description: 'Enterprise-grade image generation with CJK support',
    capabilities: ['CJK text', 'Enterprise', 'Multi-language'],
    costMultiplier: 2.5,
    quality: 9,
    speed: 6
  },
  {
    id: 'ideogram-v2',
    name: 'Ideogram V2',
    provider: 'Ideogram',
    tier: 3,
    description: 'Best-in-class text rendering in images',
    capabilities: ['Text rendering', 'Typography', 'Logos'],
    costMultiplier: 2.5,
    quality: 9,
    speed: 6
  }
];

// ==========================================
// VIDEO GENERATION MODELS
// ==========================================
export const VIDEO_MODELS: ModelConfig[] = [
  // ============ ANIMATEDIFF (Multi-Provider) ============
  // Tier 1 - Standard
  {
    id: 'modelslab-animatediff',
    name: 'AnimateDiff',
    provider: 'ModelsLab',
    tier: 1,
    description: 'Fast animated GIFs and short videos',
    capabilities: ['Image-to-video', 'Short clips', 'Loops', 'LoRA support'],
    costMultiplier: 2.0,
    quality: 6,
    speed: 8,
    isDefault: true
  },
  {
    id: 'alibaba-animatediff',
    name: 'AnimateDiff',
    provider: 'Alibaba',
    tier: 2,
    description: 'AnimateDiff optimized for CJK content',
    capabilities: ['Image-to-video', 'CJK optimized', 'Low cost', 'Fast'],
    costMultiplier: 1.2,
    quality: 6,
    speed: 9
  },
  {
    id: 'azure-animatediff',
    name: 'AnimateDiff',
    provider: 'Azure',
    tier: 2,
    description: 'Enterprise AnimateDiff with HIPAA compliance',
    capabilities: ['Image-to-video', 'Enterprise SLA', 'HIPAA compliant'],
    costMultiplier: 2.5,
    quality: 7,
    speed: 6
  },
  {
    id: 'google-animatediff',
    name: 'AnimateDiff',
    provider: 'Google',
    tier: 2,
    description: 'AnimateDiff via Google Veo infrastructure',
    capabilities: ['Image-to-video', 'High quality', 'Google Cloud'],
    costMultiplier: 2.5,
    quality: 8,
    speed: 5
  },
  {
    id: 'deepseek-animatediff',
    name: 'AnimateDiff',
    provider: 'DeepSeek',
    tier: 3,
    description: 'Budget AnimateDiff for technical content',
    capabilities: ['Image-to-video', 'Lowest cost', 'Technical content'],
    costMultiplier: 0.8,
    quality: 5,
    speed: 8
  },
  {
    id: 'replicate-animatediff',
    name: 'AnimateDiff',
    provider: 'Replicate',
    tier: 2,
    description: 'Open source AnimateDiff with custom configs',
    capabilities: ['Image-to-video', 'Custom weights', 'Community models'],
    costMultiplier: 1.5,
    quality: 6,
    speed: 7
  },
  
  // ============ SVD (Multi-Provider) ============
  {
    id: 'modelslab-svd',
    name: 'Stable Video Diffusion',
    provider: 'ModelsLab',
    tier: 1,
    description: 'Image-to-video with motion',
    capabilities: ['Image-to-video', 'Motion control', '4 seconds'],
    costMultiplier: 2.0,
    quality: 7,
    speed: 7
  },
  {
    id: 'alibaba-svd',
    name: 'Stable Video Diffusion',
    provider: 'Alibaba',
    tier: 2,
    description: 'SVD via Alibaba WAN 2.2 with character animation',
    capabilities: ['Image-to-video', 'Character animation', 'CJK optimized'],
    costMultiplier: 1.0,
    quality: 6,
    speed: 8
  },
  {
    id: 'azure-svd',
    name: 'Stable Video Diffusion',
    provider: 'Azure',
    tier: 2,
    description: 'Enterprise SVD with compliance features',
    capabilities: ['Image-to-video', 'Enterprise SLA', 'Compliance'],
    costMultiplier: 2.5,
    quality: 7,
    speed: 6
  },
  {
    id: 'google-svd',
    name: 'Stable Video Diffusion',
    provider: 'Google',
    tier: 2,
    description: 'Premium SVD via Google Veo',
    capabilities: ['Image-to-video', 'Premium quality', 'Longer duration'],
    costMultiplier: 2.5,
    quality: 8,
    speed: 5
  },
  {
    id: 'deepseek-svd',
    name: 'Stable Video Diffusion',
    provider: 'DeepSeek',
    tier: 3,
    description: 'Budget SVD for technical demonstrations',
    capabilities: ['Image-to-video', 'Technical content', 'Lowest cost'],
    costMultiplier: 0.6,
    quality: 5,
    speed: 8
  },
  {
    id: 'replicate-svd',
    name: 'Stable Video Diffusion',
    provider: 'Replicate',
    tier: 2,
    description: 'SVD with SVD-XT and custom configurations',
    capabilities: ['Image-to-video', 'XT model', 'Custom configs'],
    costMultiplier: 1.5,
    quality: 7,
    speed: 6
  },
  
  // ============ AVATAR & LIP-SYNC (Multi-Provider) ============
  {
    id: 'alibaba-wan-animate',
    name: 'WAN 2.2 Animate',
    provider: 'Alibaba',
    tier: 1,
    description: 'AI avatar and lip-sync generation',
    capabilities: ['Avatar', 'Lip-sync', 'Character animation', 'Motion transfer'],
    costMultiplier: 1.0,
    quality: 7,
    speed: 8,
    isDefault: true
  },
  {
    id: 'azure-avatar',
    name: 'Azure Avatar',
    provider: 'Azure',
    tier: 2,
    description: 'Enterprise avatar with viseme lip-sync',
    capabilities: ['Avatar', 'Lip-sync', 'Visemes', 'Neural TTS integration'],
    costMultiplier: 2.5,
    quality: 8,
    speed: 6
  },
  {
    id: 'deepseek-avatar',
    name: 'DeepSeek Avatar',
    provider: 'DeepSeek',
    tier: 3,
    description: 'Budget avatar generation with vision understanding',
    capabilities: ['Avatar', 'Vision', 'Lowest cost'],
    costMultiplier: 0.8,
    quality: 5,
    speed: 8
  },
  
  // Tier 2 - Advanced
  {
    id: 'pika-labs',
    name: 'Pika Labs',
    provider: 'Pika',
    tier: 2,
    description: 'Creative video generation with effects',
    capabilities: ['Text-to-video', 'Effects', 'Style transfer'],
    costMultiplier: 3.0,
    quality: 8,
    speed: 6
  },
  {
    id: 'gemini-veo',
    name: 'Gemini Veo',
    provider: 'Google',
    tier: 2,
    description: 'Google high-quality video generation',
    capabilities: ['Text-to-video', '1080p', 'Long form'],
    costMultiplier: 3.5,
    quality: 8,
    speed: 5
  },
  {
    id: 'kling-ai',
    name: 'Kling AI',
    provider: 'Kuaishou',
    tier: 2,
    description: 'High-fidelity video with motion',
    capabilities: ['Long videos', 'Motion control', 'Characters'],
    costMultiplier: 3.0,
    quality: 8,
    speed: 5
  },
  {
    id: 'alibaba-wanx-video',
    name: 'Alibaba Wanx Video',
    provider: 'Alibaba',
    tier: 2,
    description: 'Enterprise video generation with CJK',
    capabilities: ['CJK support', 'Enterprise', 'Long form'],
    costMultiplier: 3.0,
    quality: 8,
    speed: 5
  },
  
  // Tier 3 - Premium
  {
    id: 'openai-sora',
    name: 'OpenAI Sora',
    provider: 'OpenAI',
    tier: 3,
    description: 'State-of-the-art cinematic video generation',
    capabilities: ['Cinematic', '60s videos', 'Physics-aware'],
    costMultiplier: 5.0,
    quality: 10,
    speed: 3
  },
  {
    id: 'runway-gen3',
    name: 'Runway Gen-3 Alpha',
    provider: 'Runway',
    tier: 3,
    description: 'Professional video generation with control',
    capabilities: ['Professional', 'Motion brush', 'Camera control'],
    costMultiplier: 4.0,
    quality: 9,
    speed: 4
  },
  {
    id: 'luma-dream-machine',
    name: 'Luma Dream Machine',
    provider: 'Luma',
    tier: 3,
    description: 'Fast high-quality realistic videos',
    capabilities: ['Fast generation', 'Realistic', '5s videos'],
    costMultiplier: 4.0,
    quality: 9,
    speed: 6
  }
];

// ==========================================
// 3D GENERATION MODELS
// ==========================================
export const MESH_3D_MODELS: ModelConfig[] = [
  // Tier 1 - Standard
  {
    id: 'point-e',
    name: 'Point-E',
    provider: 'OpenAI',
    tier: 1,
    description: 'Fast 3D point cloud generation',
    capabilities: ['Point clouds', 'Fast', 'Simple objects'],
    costMultiplier: 1.5,
    quality: 5,
    speed: 9,
    isDefault: true
  },
  {
    id: 'shap-e',
    name: 'Shap-E',
    provider: 'OpenAI',
    tier: 1,
    description: '3D mesh from text/images',
    capabilities: ['Text-to-3D', 'Image-to-3D', 'Textured mesh'],
    costMultiplier: 1.5,
    quality: 6,
    speed: 8
  },
  
  // Tier 2 - Advanced
  {
    id: 'modelslab-3d',
    name: 'ModelsLab 3D',
    provider: 'ModelsLab',
    tier: 2,
    description: 'High-quality 3D generation',
    capabilities: ['GLB export', 'Textured', 'Detailed'],
    costMultiplier: 3.0,
    quality: 8,
    speed: 5
  },
  {
    id: 'meshy-ai',
    name: 'Meshy AI',
    provider: 'Meshy',
    tier: 2,
    description: 'Professional 3D asset generation',
    capabilities: ['Game-ready', 'PBR materials', 'Rigging'],
    costMultiplier: 3.0,
    quality: 8,
    speed: 5
  },
  {
    id: 'triposr',
    name: 'TripoSR',
    provider: 'Stability AI',
    tier: 2,
    description: 'Fast single-image 3D reconstruction',
    capabilities: ['Image-to-3D', 'Fast', 'Detailed mesh'],
    costMultiplier: 2.5,
    quality: 7,
    speed: 7
  },
  
  // Tier 3 - Premium
  {
    id: 'rodin-gen1',
    name: 'Rodin Gen-1',
    provider: 'Microsoft',
    tier: 3,
    description: 'High-fidelity 3D avatar and character generation',
    capabilities: ['Avatars', 'Characters', 'Animation-ready'],
    costMultiplier: 4.0,
    quality: 9,
    speed: 4
  },
  {
    id: 'luma-genie',
    name: 'Luma Genie',
    provider: 'Luma',
    tier: 3,
    description: 'Text-to-3D with high detail',
    capabilities: ['High detail', 'Multiple views', 'PBR'],
    costMultiplier: 4.0,
    quality: 9,
    speed: 4
  },
  {
    id: 'csm-3d',
    name: 'CSM 3D',
    provider: 'CSM',
    tier: 3,
    description: 'Image-to-3D with topology control',
    capabilities: ['Topology control', 'Clean mesh', 'Production-ready'],
    costMultiplier: 4.5,
    quality: 10,
    speed: 3
  }
];

// ==========================================
// VOICE/TTS MODELS
// ==========================================
export const VOICE_MODELS: ModelConfig[] = [
  // Tier 1 - Standard
  {
    id: 'google-tts',
    name: 'Google Cloud TTS',
    provider: 'Google',
    tier: 1,
    description: 'Reliable neural TTS with many languages',
    capabilities: ['200+ voices', '40+ languages', 'SSML'],
    costMultiplier: 1.0,
    quality: 7,
    speed: 9,
    isDefault: true
  },
  {
    id: 'amazon-polly',
    name: 'Amazon Polly',
    provider: 'AWS',
    tier: 1,
    description: 'Cloud TTS with neural voices',
    capabilities: ['Neural voices', 'Many languages', 'SSML'],
    costMultiplier: 1.0,
    quality: 7,
    speed: 9
  },
  {
    id: 'openai-tts',
    name: 'OpenAI TTS',
    provider: 'OpenAI',
    tier: 1,
    description: 'Simple, high-quality TTS',
    capabilities: ['6 voices', 'Natural speech', 'Fast'],
    costMultiplier: 1.0,
    quality: 8,
    speed: 9
  },
  
  // Tier 2 - Advanced
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    provider: 'ElevenLabs',
    tier: 2,
    description: 'Premium voice synthesis with cloning',
    capabilities: ['Voice cloning', 'Emotion control', '29 languages'],
    costMultiplier: 2.0,
    quality: 9,
    speed: 7
  },
  {
    id: 'azure-neural',
    name: 'Azure Neural TTS',
    provider: 'Microsoft',
    tier: 2,
    description: 'Enterprise neural voices',
    capabilities: ['400+ voices', 'Custom neural', 'SSML+'],
    costMultiplier: 1.5,
    quality: 8,
    speed: 8
  },
  {
    id: 'alibaba-qwen3-tts',
    name: 'Qwen3-TTS',
    provider: 'Alibaba',
    tier: 2,
    description: 'CJK-optimized voice synthesis',
    capabilities: ['CJK excellence', 'Natural', 'Enterprise'],
    costMultiplier: 1.5,
    quality: 8,
    speed: 7
  },
  
  // Tier 3 - Premium
  {
    id: 'elevenlabs-ultra',
    name: 'ElevenLabs Ultra',
    provider: 'ElevenLabs',
    tier: 3,
    description: 'Highest quality with professional cloning',
    capabilities: ['Pro voice cloning', 'Projects', 'Dubbing'],
    costMultiplier: 3.0,
    quality: 10,
    speed: 6
  },
  {
    id: 'resemble-ai',
    name: 'Resemble AI',
    provider: 'Resemble',
    tier: 3,
    description: 'Real-time voice cloning and synthesis',
    capabilities: ['Real-time', 'Voice cloning', 'API'],
    costMultiplier: 3.0,
    quality: 9,
    speed: 7
  },
  {
    id: 'play-ht-3',
    name: 'PlayHT 3.0',
    provider: 'PlayHT',
    tier: 3,
    description: 'Ultra-realistic voice generation',
    capabilities: ['Ultra-realistic', 'Cloning', 'Emotions'],
    costMultiplier: 2.5,
    quality: 9,
    speed: 7
  }
];

// ==========================================
// SPEECH-TO-TEXT MODELS
// ==========================================
export const STT_MODELS: ModelConfig[] = [
  // Tier 1 - Standard
  {
    id: 'google-stt',
    name: 'Google Cloud STT',
    provider: 'Google',
    tier: 1,
    description: 'Reliable speech recognition',
    capabilities: ['125+ languages', 'Real-time', 'Batch'],
    costMultiplier: 1.0,
    quality: 8,
    speed: 9,
    isDefault: true
  },
  {
    id: 'openai-whisper',
    name: 'Whisper',
    provider: 'OpenAI',
    tier: 1,
    description: 'Open-source multilingual STT',
    capabilities: ['99 languages', 'Translation', 'Timestamps'],
    costMultiplier: 1.0,
    quality: 8,
    speed: 8
  },
  
  // Tier 2 - Advanced
  {
    id: 'azure-speech',
    name: 'Azure Speech',
    provider: 'Microsoft',
    tier: 2,
    description: 'Enterprise speech recognition',
    capabilities: ['Custom models', 'Real-time', 'Batch'],
    costMultiplier: 1.5,
    quality: 9,
    speed: 8
  },
  {
    id: 'alibaba-paraformer',
    name: 'Paraformer',
    provider: 'Alibaba',
    tier: 2,
    description: 'CJK-optimized speech recognition',
    capabilities: ['CJK excellence', 'Fast', 'Accurate'],
    costMultiplier: 1.5,
    quality: 9,
    speed: 8
  },
  {
    id: 'deepgram',
    name: 'Deepgram Nova',
    provider: 'Deepgram',
    tier: 1, // Upgraded: Primary real-time STT provider
    description: 'Ultra-fast real-time transcription (<100ms latency)',
    capabilities: ['Real-time', 'Streaming', 'Diarization', '36+ languages'],
    costMultiplier: 1.2,
    quality: 10,
    speed: 10
  },
  
  // Tier 3 - Premium
  {
    id: 'assembly-ai',
    name: 'AssemblyAI',
    provider: 'AssemblyAI',
    tier: 3,
    description: 'Advanced speech intelligence',
    capabilities: ['Summarization', 'Sentiment', 'Topics'],
    costMultiplier: 2.0,
    quality: 9,
    speed: 8
  },
  {
    id: 'rev-ai',
    name: 'Rev AI',
    provider: 'Rev',
    tier: 3,
    description: 'Human-level accuracy transcription',
    capabilities: ['High accuracy', 'Human review', 'Captions'],
    costMultiplier: 2.5,
    quality: 10,
    speed: 6
  }
];

// ==========================================
// OCR MODELS
// ==========================================
export const OCR_MODELS: ModelConfig[] = [
  // Tier 1 - Standard
  {
    id: 'tesseract',
    name: 'Tesseract OCR',
    provider: 'Open Source',
    tier: 1,
    description: 'Open-source OCR engine',
    capabilities: ['100+ languages', 'PDF', 'Images'],
    costMultiplier: 0.5,
    quality: 6,
    speed: 8,
    isDefault: true
  },
  {
    id: 'google-vision-ocr',
    name: 'Google Vision OCR',
    provider: 'Google',
    tier: 1,
    description: 'Cloud-based OCR with good accuracy',
    capabilities: ['Text detection', 'Document', 'Handwriting'],
    costMultiplier: 1.0,
    quality: 8,
    speed: 8
  },
  
  // Tier 2 - Advanced
  {
    id: 'azure-form-recognizer',
    name: 'Azure Form Recognizer',
    provider: 'Microsoft',
    tier: 2,
    description: 'Document intelligence with structure',
    capabilities: ['Forms', 'Tables', 'Key-value pairs'],
    costMultiplier: 1.5,
    quality: 9,
    speed: 7
  },
  {
    id: 'amazon-textract',
    name: 'Amazon Textract',
    provider: 'AWS',
    tier: 2,
    description: 'ML-powered document analysis',
    capabilities: ['Tables', 'Forms', 'Handwriting'],
    costMultiplier: 1.5,
    quality: 9,
    speed: 7
  },
  
  // Tier 3 - Premium
  {
    id: 'azure-di-prebuilt',
    name: 'Azure Document Intelligence',
    provider: 'Microsoft',
    tier: 3,
    description: 'Pre-built document models',
    capabilities: ['Invoices', 'Receipts', 'ID documents'],
    costMultiplier: 2.0,
    quality: 10,
    speed: 6
  },
  {
    id: 'anthropic-claude-vision',
    name: 'Claude Vision OCR',
    provider: 'Anthropic',
    tier: 3,
    description: 'AI-powered document understanding',
    capabilities: ['Context-aware', 'Complex layouts', 'Analysis'],
    costMultiplier: 2.5,
    quality: 10,
    speed: 5
  }
];

// ==========================================
// TRANSLATION MODELS
// ==========================================
export const TRANSLATION_MODELS: ModelConfig[] = [
  // Tier 1 - Standard
  {
    id: 'google-translate',
    name: 'Google Translate',
    provider: 'Google',
    tier: 1,
    description: 'Fast multilingual translation',
    capabilities: ['133 languages', 'Fast', 'Documents'],
    costMultiplier: 1.0,
    quality: 7,
    speed: 10,
    isDefault: true
  },
  {
    id: 'amazon-translate',
    name: 'Amazon Translate',
    provider: 'AWS',
    tier: 1,
    description: 'Neural machine translation',
    capabilities: ['75 languages', 'Custom terminology', 'Batch'],
    costMultiplier: 1.0,
    quality: 7,
    speed: 9
  },
  
  // Tier 2 - Advanced
  {
    id: 'deepl',
    name: 'DeepL Pro',
    provider: 'DeepL',
    tier: 2,
    description: 'High-quality natural translation',
    capabilities: ['Natural tone', '31 languages', 'Context-aware'],
    costMultiplier: 1.5,
    quality: 9,
    speed: 8
  },
  {
    id: 'azure-translator',
    name: 'Azure Translator',
    provider: 'Microsoft',
    tier: 2,
    description: 'Enterprise translation service',
    capabilities: ['100+ languages', 'Custom models', 'Documents'],
    costMultiplier: 1.5,
    quality: 8,
    speed: 8
  },
  
  // Tier 3 - Premium
  {
    id: 'anthropic-claude-translate',
    name: 'Claude Translation',
    provider: 'Anthropic',
    tier: 3,
    description: 'AI-powered contextual translation',
    capabilities: ['Context-aware', 'Nuanced', 'Creative'],
    costMultiplier: 2.5,
    quality: 10,
    speed: 6
  },
  {
    id: 'gpt-4-translate',
    name: 'GPT-4 Translation',
    provider: 'OpenAI',
    tier: 3,
    description: 'LLM-powered translation with context',
    capabilities: ['Context-aware', 'Tone matching', 'Technical'],
    costMultiplier: 2.5,
    quality: 10,
    speed: 5
  }
];

// ==========================================
// TEXT/LLM MODELS
// ==========================================
export const TEXT_MODELS: ModelConfig[] = [
  // Tier 1 - Standard
  {
    id: 'gemini-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    tier: 1,
    description: 'Fast and efficient text generation',
    capabilities: ['Fast', 'Multi-modal', 'Large context'],
    costMultiplier: 1.0,
    quality: 8,
    speed: 10,
    isDefault: true
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    tier: 1,
    description: 'Cost-effective GPT model',
    capabilities: ['Fast', 'Vision', 'Function calling'],
    costMultiplier: 1.0,
    quality: 8,
    speed: 9
  },
  {
    id: 'claude-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    tier: 1,
    description: 'Fast and intelligent responses',
    capabilities: ['Fast', 'Coding', 'Analysis'],
    costMultiplier: 1.0,
    quality: 8,
    speed: 9
  },
  
  // Tier 2 - Advanced
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    tier: 2,
    description: 'Flagship multi-modal model',
    capabilities: ['Vision', 'Audio', 'Reasoning'],
    costMultiplier: 2.0,
    quality: 9,
    speed: 7
  },
  {
    id: 'claude-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    tier: 2,
    description: 'Balanced intelligence and speed',
    capabilities: ['Coding', 'Analysis', 'Writing'],
    costMultiplier: 2.0,
    quality: 9,
    speed: 7
  },
  {
    id: 'gemini-pro',
    name: 'Gemini 2.0 Pro',
    provider: 'Google',
    tier: 2,
    description: 'Advanced reasoning capabilities',
    capabilities: ['Reasoning', 'Multi-modal', 'Coding'],
    costMultiplier: 2.0,
    quality: 9,
    speed: 7
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    tier: 2,
    description: 'Strong reasoning and coding',
    capabilities: ['Coding', 'Math', 'Reasoning'],
    costMultiplier: 1.5,
    quality: 9,
    speed: 7
  },
  
  // Tier 3 - Premium
  {
    id: 'claude-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    tier: 3,
    description: 'Most capable Claude model',
    capabilities: ['Complex reasoning', 'Long context', 'Creative'],
    costMultiplier: 3.0,
    quality: 10,
    speed: 5
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    tier: 3,
    description: 'Most capable GPT model',
    capabilities: ['128K context', 'Vision', 'Coding'],
    costMultiplier: 3.0,
    quality: 10,
    speed: 5
  },
  {
    id: 'alibaba-qwen-max',
    name: 'Qwen-Max',
    provider: 'Alibaba',
    tier: 3,
    description: 'Enterprise CJK-optimized LLM',
    capabilities: ['CJK excellence', 'Long context', 'Enterprise'],
    costMultiplier: 2.5,
    quality: 9,
    speed: 6
  }
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getModelsByTier(models: ModelConfig[], tier: 1 | 2 | 3): ModelConfig[] {
  return models.filter(m => m.tier === tier);
}

export function getDefaultModel(models: ModelConfig[]): ModelConfig | undefined {
  return models.find(m => m.isDefault) || models[0];
}

export function getModelById(models: ModelConfig[], id: string): ModelConfig | undefined {
  return models.find(m => m.id === id);
}

export function getTierLabel(tier: 1 | 2 | 3): string {
  switch (tier) {
    case 1: return 'Standard';
    case 2: return 'Advanced';
    case 3: return 'Premium';
  }
}

export function getTierColor(tier: 1 | 2 | 3): string {
  switch (tier) {
    case 1: return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 2: return 'bg-blue-100 text-blue-700 border-blue-300';
    case 3: return 'bg-purple-100 text-purple-700 border-purple-300';
  }
}

// All model categories for easy access
export const ALL_MODEL_CATEGORIES = {
  image: IMAGE_MODELS,
  video: VIDEO_MODELS,
  mesh3d: MESH_3D_MODELS,
  voice: VOICE_MODELS,
  stt: STT_MODELS,
  ocr: OCR_MODELS,
  translation: TRANSLATION_MODELS,
  text: TEXT_MODELS
} as const;
