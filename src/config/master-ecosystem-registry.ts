/**
 * MASTER ECOSYSTEM REGISTRY
 * 
 * SINGLE SOURCE OF TRUTH for all AI providers, video styles, and pipelines
 * across Genie Studio ecosystem (Spark, Mind, Vibe, Arc, Deck, Cast, Hub, Ask Genie)
 * 
 * Features:
 * - 17+ AI Providers with capability matrix
 * - 40+ Video Styles across all industries
 * - 206+ Pipelines with category mapping
 * - 4-Zone Regional Routing configuration
 * - Auto-calculation of metrics
 * 
 * IMPORTANT: Update this registry when adding new providers, styles, or pipelines
 * 
 * Last Updated: 2026-02-04
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ProviderTier = 'primary' | 'specialized' | 'fallback' | 'deprecated';
export type ProviderStatus = 'active' | 'beta' | 'fallback' | 'deprecated' | 'pending';
export type RoutingZone = 'claude' | 'alibaba' | 'gemini' | 'fallback';

export type ProviderCapability = 
  | 'llm' 
  | 'translation' 
  | 'tts' 
  | 'stt' 
  | 'realtime_stt'
  | 'voice_clone'
  | 'image_gen' 
  | 'video_gen' 
  | 'avatar'
  | 'lipsync'
  | '3d_gen'
  | 'vfx'
  | 'ocr'
  | 'vision'
  | 'nlp'
  | 'music_gen'
  | 'sfx_gen'
  | 'visemes'
  | 'video_assembly';

export interface AIProviderEntry {
  id: string;
  name: string;
  tier: ProviderTier;
  status: ProviderStatus;
  capabilities: ProviderCapability[];
  secretKey: string;
  zones: RoutingZone[];
  costTier: 'free' | 'low' | 'medium' | 'high' | 'premium';
  qualityScore: number; // 0-100
  speedScore: number; // 0-100
  strengths: string[];
  models?: string[];
  wiredToGenieCast: boolean;
}

export type VideoStyleCategory = 
  | 'storytelling'
  | 'avatar'
  | 'animation'
  | 'interactive'
  | 'marketing'
  | 'education'
  | 'enterprise'
  | 'ecommerce'
  | 'healthcare'
  | 'entertainment'
  | 'news_media'
  | 'social_platform';

export type VideoStyleId = 
  // Storytelling (6)
  | 'smart_storytelling' | 'hook_videos' | 'micro_drama' 
  | 'documentary' | 'narrative_arc' | 'testimonial'
  // Avatar (7)
  | 'ugc_avatar_photorealistic' | 'ugc_avatar_3d_pixar' | 'ugc_avatar_2d_animated'
  | 'talking_photos' | 'full_body_avatar' | 'digital_twin' | 'mascot_character'
  // Animation (6)
  | 'anime' | 'image_to_life' | 'explainer_3d' 
  | 'motion_graphics' | 'kinetic_typography' | 'whiteboard'
  // Interactive (5)
  | 'educational' | 'interactive_quiz' | 'cta_videos'
  | 'shoppable_video' | 'branching_narrative'
  // Marketing (8)
  | 'social' | 'video_ads' | 'product_demo'
  | 'comparison' | 'case_study' | 'event_promo' | 'behind_scenes' | 'news_update'
  // Enterprise (4)
  | 'corporate_training' | 'internal_comms' | 'investor_update' | 'compliance_training'
  // Healthcare (3)
  | 'patient_education' | 'provider_training' | 'medical_explainer'
  // Entertainment (4)
  | 'gaming_trailer' | 'music_video' | 'short_film' | 'podcast_video';

export interface VideoStyleEntry {
  id: VideoStyleId;
  title: string;
  category: VideoStyleCategory;
  description: string;
  icon: string;
  videoProvider: string;
  avatarProvider?: string;
  animationProvider?: string;
  ttsStyle: string;
  pacing: 'slow' | 'normal' | 'fast' | 'dynamic';
  industries: string[];
  popular?: boolean;
  new?: boolean;
  premium?: boolean;
}

export type PipelineCategory = 
  | 'text_based' | 'audio' | 'image' | 'video' | '3d_vr_ar'
  | 'presentation' | 'social' | 'document' | 'data_viz'
  | 'repurposing' | 'training_ld' | 'marketing_base' | 'localization'
  | 'marketing_specific' | 'creator_enhancement';

export interface PipelineEntry {
  id: string;
  name: string;
  category: PipelineCategory;
  description: string;
  providers: string[];
  tabMapping: 'CREATE' | 'PRODUCE' | 'MANAGE' | 'PUBLISH';
  isActive: boolean;
  priority: number;
}

// =============================================================================
// AI PROVIDERS (17+ Configured Providers)
// =============================================================================

export const MASTER_AI_PROVIDERS: AIProviderEntry[] = [
  // ═══════════════════════════════════════════════════════════════
  // TIER 1: PRIMARY PROVIDERS (Core Infrastructure) - 7 providers
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'openai',
    name: 'OpenAI',
    tier: 'primary',
    status: 'active',
    capabilities: ['llm', 'tts', 'stt', 'image_gen', 'video_gen', 'vision', 'nlp'],
    secretKey: 'OPENAI_API_KEY',
    zones: ['claude', 'fallback'],
    costTier: 'high',
    qualityScore: 95,
    speedScore: 85,
    strengths: ['GPT-4o/o3', 'Whisper STT', 'DALL-E 3', 'Sora 2', 'Function calling'],
    models: ['gpt-4o', 'gpt-4o-mini', 'o3', 'o4-mini', 'whisper-1', 'tts-1-hd', 'dall-e-3', 'sora-2.0-turbo'],
    wiredToGenieCast: true,
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    tier: 'primary',
    status: 'active',
    capabilities: ['llm', 'translation', 'vision', 'nlp'],
    secretKey: 'ANTHROPIC_API_KEY',
    zones: ['claude'],
    costTier: 'high',
    qualityScore: 96,
    speedScore: 80,
    strengths: ['Best for nuance', '200k context', 'Literary translation', 'Safety'],
    models: ['claude-sonnet-4', 'claude-opus-4', 'claude-3-5-sonnet'],
    wiredToGenieCast: true,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    tier: 'primary',
    status: 'active',
    capabilities: ['llm', 'image_gen', 'video_gen', 'translation', 'tts', 'stt', 'ocr', 'vision', 'nlp'],
    secretKey: 'GEMINI_API_KEY',
    zones: ['gemini', 'fallback'],
    costTier: 'medium',
    qualityScore: 94,
    speedScore: 92,
    strengths: ['1M context', 'Native multimodal', 'Fast', 'Gemini 2.5 Flash/Pro'],
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-3-pro-preview', 'gemini-3-flash-preview'],
    wiredToGenieCast: true,
  },
  {
    id: 'deepgram',
    name: 'Deepgram',
    tier: 'primary',
    status: 'active',
    capabilities: ['stt', 'realtime_stt'],
    secretKey: 'DEEPGRAM_API_KEY',
    zones: ['claude', 'gemini', 'alibaba', 'fallback'],
    costTier: 'medium',
    qualityScore: 98,
    speedScore: 99,
    strengths: ['<100ms latency', 'Best STT accuracy', '36+ languages', 'Real-time streaming'],
    models: ['nova-2', 'nova-2-streaming', 'nova-3'],
    wiredToGenieCast: true,
  },
  {
    id: 'sora2api',
    name: 'Sora 2 API',
    tier: 'primary',
    status: 'active',
    capabilities: ['video_gen'],
    secretKey: 'SORA2API_KEY',
    zones: ['claude', 'fallback'],
    costTier: 'high',
    qualityScore: 97,
    speedScore: 60,
    strengths: ['Cinematic quality', 'Realistic scenes', 'Long duration', 'Documentary style'],
    models: ['sora-2.0-turbo', 'sora-2.0', 'sora-1.0-turbo'],
    wiredToGenieCast: true,
  },
  {
    id: 'vertex_ai',
    name: 'Google Vertex AI (Veo/Imagen)',
    tier: 'primary',
    status: 'active',
    capabilities: ['video_gen', 'image_gen'],
    secretKey: 'GOOGLE_VERTEX_SERVICE_ACCOUNT',
    zones: ['gemini', 'claude', 'fallback'],
    costTier: 'high',
    qualityScore: 96,
    speedScore: 65,
    strengths: ['Veo 3.1/3.0 video', 'Imagen 3.0 image', '4K output', 'Long duration', 'Best video quality'],
    models: ['veo-3.1-generate', 'veo-3.0-generate', 'veo-2.0-generate', 'imagen-3.0-generate-002'],
    wiredToGenieCast: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    tier: 'primary',
    status: 'active',
    capabilities: ['llm', 'translation', 'vision', 'nlp'],
    secretKey: 'DEEPSEEK_API_KEY',
    zones: ['alibaba', 'fallback'],
    costTier: 'low',
    qualityScore: 90,
    speedScore: 88,
    strengths: ['Ultra low cost', 'Best Chinese', 'Technical content', 'Code', 'DeepSeek V3'],
    models: ['deepseek-chat', 'deepseek-coder', 'deepseek-vl', 'deepseek-v3'],
    wiredToGenieCast: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: SPECIALIZED PROVIDERS (Domain Excellence) - 12 providers
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'alibaba',
    name: 'Alibaba DashScope',
    tier: 'specialized',
    status: 'active',
    capabilities: ['llm', 'tts', 'stt', 'video_gen', 'avatar', 'lipsync', 'image_gen', 'vision', 'nlp', '3d_gen'],
    secretKey: 'ALIBABA_API_KEY',
    zones: ['alibaba'],
    costTier: 'low',
    qualityScore: 88,
    speedScore: 85,
    strengths: ['CJK optimized', 'WAN 2.6 video', 'Qwen3-TTS', 'Paraformer STT', 'Avatar S2V', 'TaoAvatar'],
    models: ['qwen-max', 'qwen-2.5-72b', 'wan2.6-t2v', 'wan2.6-i2v', 'wan2.2-s2v', 'qwen3-tts', 'paraformer', 'tao-avatar'],
    wiredToGenieCast: true,
  },
  {
    id: 'azure',
    name: 'Azure Cognitive Services',
    tier: 'specialized',
    status: 'active',
    capabilities: ['tts', 'stt', 'ocr', 'translation', 'visemes', 'nlp', 'vision'],
    secretKey: 'AZURE_SPEECH_KEY',
    zones: ['claude', 'alibaba', 'gemini', 'fallback'],  // ALL zones — Azure Neural is PRIMARY TTS globally (Viseme lip-sync)
    costTier: 'medium',
    qualityScore: 92,
    speedScore: 80,
    strengths: ['500+ voices', 'Viseme lip-sync', 'HIPAA compliant', 'Form Recognizer', 'Best for Visemes'],
    models: ['neural-tts', 'document-intelligence', 'speech-to-text', 'azure-translator'],
    wiredToGenieCast: true,
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    tier: 'specialized',
    status: 'active',
    capabilities: ['tts', 'voice_clone', 'sfx_gen', 'music_gen'],
    secretKey: 'ELEVENLABS_API_KEY',
    zones: ['claude', 'fallback'],
    costTier: 'high',
    qualityScore: 98,
    speedScore: 85,
    strengths: ['Most natural TTS', 'Voice cloning', 'Sound effects', 'Music generation', '32 languages'],
    models: ['eleven_multilingual_v2', 'eleven_turbo_v2_5', 'eleven_flash_v2_5', 'sound-generation'],
    wiredToGenieCast: true,
  },
  {
    id: 'modelslab',
    name: 'ModelsLab',
    tier: 'specialized',
    status: 'active',
    capabilities: ['image_gen', 'video_gen', '3d_gen', 'music_gen', 'sfx_gen', 'avatar'],
    secretKey: 'MODELSLAB_API_KEY',
    zones: ['claude', 'gemini', 'alibaba', 'fallback'],
    costTier: 'low',
    qualityScore: 88,
    speedScore: 80,
    strengths: ['10,000+ models', 'FLUX Pro/Schnell', 'AnimateDiff', 'CivitAI integration', 'Low cost', '3D Mesh'],
    models: ['flux-pro', 'flux-schnell', 'flux-dev', 'stable-diffusion-xl', 'animatediff', 'video-lipsync'],
    wiredToGenieCast: true,
  },
  {
    id: 'meshy',
    name: 'Meshy AI',
    tier: 'specialized',
    status: 'active',
    capabilities: ['3d_gen'],
    secretKey: 'MESHY_API_KEY',
    zones: ['claude', 'gemini', 'alibaba', 'fallback'],
    costTier: 'medium',
    qualityScore: 94,
    speedScore: 70,
    strengths: ['High-fidelity 3D', 'PBR textures', 'Auto-rigging', 'USDZ/GLTF export', 'Text-to-3D', 'Image-to-3D'],
    models: ['meshy-4', 'meshy-text-to-3d', 'meshy-image-to-3d', 'meshy-text-to-texture'],
    wiredToGenieCast: true,
  },
  {
    id: 'deepl',
    name: 'DeepL',
    tier: 'specialized',
    status: 'active',
    capabilities: ['translation'],
    secretKey: 'DEEPL_API_KEY',
    zones: ['claude'],
    costTier: 'medium',
    qualityScore: 98,
    speedScore: 90,
    strengths: ['Best EU translation', 'Formality control', 'Glossary support', '30+ languages'],
    models: ['deepl-pro', 'deepl-write'],
    wiredToGenieCast: true,
  },
  {
    id: 'json2video',
    name: 'JSON2Video',
    tier: 'specialized',
    status: 'active',
    capabilities: ['video_assembly'],
    secretKey: 'JSON2VIDEO_API_KEY',
    zones: ['claude', 'gemini', 'alibaba', 'fallback'],
    costTier: 'medium',
    qualityScore: 90,
    speedScore: 75,
    strengths: ['Timeline-based assembly', 'TTS integration', 'Multi-layer composition', 'Template engine'],
    models: ['render-api', 'batch-render'],
    wiredToGenieCast: true,
  },
  {
    id: 'flux',
    name: 'FLUX (Black Forest Labs)',
    tier: 'specialized',
    status: 'active',
    capabilities: ['image_gen'],
    secretKey: 'MODELSLAB_API_KEY', // Uses ModelsLab as gateway
    zones: ['claude', 'gemini', 'fallback'],
    costTier: 'medium',
    qualityScore: 96,
    speedScore: 85,
    strengths: ['Best text rendering', 'Photorealistic', 'FLUX Pro/Dev/Schnell', 'Prompt adherence'],
    models: ['flux-pro', 'flux-dev', 'flux-schnell', 'flux-1.1-pro'],
    wiredToGenieCast: true,
  },
  {
    id: 'amazon_polly',
    name: 'Amazon Polly',
    tier: 'specialized',
    status: 'active',
    capabilities: ['tts'],
    secretKey: 'AWS_ACCESS_KEY_ID',
    zones: ['fallback'],
    costTier: 'low',
    qualityScore: 85,
    speedScore: 90,
    strengths: ['Neural voices', 'SSML support', 'Low cost', 'AWS integration', 'Multiple engines'],
    models: ['neural', 'standard', 'generative'],
    wiredToGenieCast: true,
  },
  {
    id: 'google_tts',
    name: 'Google Cloud TTS',
    tier: 'specialized',
    status: 'active',
    capabilities: ['tts'],
    secretKey: 'GOOGLE_API_KEY',
    zones: ['gemini', 'fallback'],
    costTier: 'medium',
    qualityScore: 90,
    speedScore: 88,
    strengths: ['WaveNet voices', '40+ languages', 'Journey voices', 'Studio quality'],
    models: ['wavenet', 'neural2', 'studio', 'journey'],
    wiredToGenieCast: true,
  },
  {
    id: 'whisper',
    name: 'OpenAI Whisper',
    tier: 'specialized',
    status: 'active',
    capabilities: ['stt'],
    secretKey: 'OPENAI_API_KEY',
    zones: ['claude', 'fallback'],
    costTier: 'medium',
    qualityScore: 95,
    speedScore: 75,
    strengths: ['Excellent accuracy', 'Many languages', 'Handles accents', 'Timestamp support'],
    models: ['whisper-1', 'whisper-large-v3'],
    wiredToGenieCast: true,
  },
  {
    id: 'dalle',
    name: 'DALL-E',
    tier: 'specialized',
    status: 'active',
    capabilities: ['image_gen'],
    secretKey: 'OPENAI_API_KEY',
    zones: ['claude', 'fallback'],
    costTier: 'high',
    qualityScore: 93,
    speedScore: 80,
    strengths: ['Excellent text rendering', 'High quality', 'Prompt refinement', 'Inpainting', 'Outpainting'],
    models: ['dall-e-3', 'gpt-image-1'],
    wiredToGenieCast: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 3: FALLBACK PROVIDERS - 11 providers
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'replicate',
    name: 'Replicate',
    tier: 'fallback',
    status: 'active',
    capabilities: ['image_gen', 'video_gen', '3d_gen', 'avatar', 'lipsync'],
    secretKey: 'REPLICATE_API_TOKEN',
    zones: ['fallback'],
    costTier: 'low',
    qualityScore: 85,
    speedScore: 65,
    strengths: ['Open-source models', 'TripoSR', 'SVD', 'Pay-per-use', 'Sadtalker', 'Wav2Lip'],
    models: ['flux-schnell', 'stable-video-diffusion', 'triposr', 'sadtalker', 'wav2lip'],
    wiredToGenieCast: true,
  },
  {
    id: 'google',
    name: 'Google Cloud AI',
    tier: 'fallback',
    status: 'active',
    capabilities: ['translation', 'ocr', 'tts', 'stt', 'vision', 'nlp'],
    secretKey: 'GOOGLE_API_KEY',
    zones: ['gemini', 'fallback'],
    costTier: 'medium',
    qualityScore: 88,
    speedScore: 85,
    strengths: ['249+ languages', 'Document AI', 'Cloud Vision', 'WaveNet', 'Translate v3'],
    models: ['google-translate-v3', 'cloud-vision', 'cloud-tts', 'cloud-stt'],
    wiredToGenieCast: true,
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    tier: 'fallback',
    status: 'active',
    capabilities: ['llm', 'image_gen', 'nlp', 'stt', 'tts'],
    secretKey: 'HUGGINGFACE_TOKEN',
    zones: ['fallback'],
    costTier: 'free',
    qualityScore: 80,
    speedScore: 60,
    strengths: ['Open source', 'Free tier', 'Customizable', 'Privacy', '500k+ models'],
    models: ['FLUX.1-schnell', 'mistral-7b', 'llama-3', 'whisper-large', 'bark'],
    wiredToGenieCast: true,
  },
  {
    id: 'stability',
    name: 'Stability AI',
    tier: 'fallback',
    status: 'active',
    capabilities: ['image_gen', 'video_gen'],
    secretKey: 'STABILITY_API_KEY',
    zones: ['fallback'],
    costTier: 'medium',
    qualityScore: 88,
    speedScore: 75,
    strengths: ['SD3', 'SVD', 'Image upscaling', 'Inpainting', 'Style transfer'],
    models: ['stable-diffusion-3', 'stable-video-diffusion', 'stable-image-ultra'],
    wiredToGenieCast: true,
  },
  {
    id: 'cohere',
    name: 'Cohere',
    tier: 'fallback',
    status: 'active',
    capabilities: ['llm', 'nlp', 'translation'],
    secretKey: 'COHERE_API_KEY',
    zones: ['fallback'],
    costTier: 'medium',
    qualityScore: 85,
    speedScore: 80,
    strengths: ['Enterprise search', 'RAG optimized', 'Multilingual', 'Command R+'],
    models: ['command-r-plus', 'command-r', 'embed-v3'],
    wiredToGenieCast: true,
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    tier: 'fallback',
    status: 'active',
    capabilities: ['llm', 'nlp'],
    secretKey: 'MISTRAL_API_KEY',
    zones: ['claude', 'fallback'],
    costTier: 'medium',
    qualityScore: 88,
    speedScore: 90,
    strengths: ['Fast inference', 'EU data residency', 'Open weights', 'Codestral'],
    models: ['mistral-large', 'mistral-medium', 'codestral', 'mistral-nemo'],
    wiredToGenieCast: true,
  },
  {
    id: 'anthropic_claude_haiku',
    name: 'Claude Haiku',
    tier: 'fallback',
    status: 'active',
    capabilities: ['llm', 'nlp'],
    secretKey: 'ANTHROPIC_API_KEY',
    zones: ['claude', 'fallback'],
    costTier: 'low',
    qualityScore: 82,
    speedScore: 95,
    strengths: ['Ultra fast', 'Low cost', 'Good for classification', 'Quick tasks'],
    models: ['claude-3-5-haiku', 'claude-3-haiku'],
    wiredToGenieCast: true,
  },
  {
    id: 'groq',
    name: 'Groq',
    tier: 'fallback',
    status: 'active',
    capabilities: ['llm', 'stt'],
    secretKey: 'GROQ_API_KEY',
    zones: ['fallback'],
    costTier: 'low',
    qualityScore: 85,
    speedScore: 99,
    strengths: ['Fastest inference', 'LPU hardware', 'Whisper-large', 'Llama 3.3'],
    models: ['llama-3.3-70b', 'mixtral-8x7b', 'whisper-large-v3'],
    wiredToGenieCast: true,
  },
  {
    id: 'together',
    name: 'Together AI',
    tier: 'fallback',
    status: 'active',
    capabilities: ['llm', 'image_gen'],
    secretKey: 'TOGETHER_API_KEY',
    zones: ['fallback'],
    costTier: 'low',
    qualityScore: 85,
    speedScore: 88,
    strengths: ['Open models', 'FLUX', 'Low cost', 'Fine-tuning'],
    models: ['llama-3.3-70b', 'qwen-2.5-72b', 'flux-schnell'],
    wiredToGenieCast: true,
  },
  {
    id: 'qwen3-tts',
    name: 'Qwen3-TTS (Alibaba)',
    tier: 'fallback',
    status: 'active',
    capabilities: ['tts', 'voice_clone'],
    secretKey: 'ALIBABA_CHINA_API_KEY',
    zones: ['alibaba'],
    costTier: 'low',
    qualityScore: 90,
    speedScore: 85,
    strengths: ['Best CJK TTS', 'Voice cloning', 'Emotion control', 'Low latency'],
    models: ['qwen3-tts-flash', 'qwen2-tts'],
    wiredToGenieCast: true,
  },
  {
    id: 'paraformer',
    name: 'Paraformer (Alibaba)',
    tier: 'fallback',
    status: 'active',
    capabilities: ['stt', 'realtime_stt'],
    secretKey: 'ALIBABA_CHINA_API_KEY',
    zones: ['alibaba'],
    costTier: 'low',
    qualityScore: 92,
    speedScore: 90,
    strengths: ['Best Chinese STT', 'Real-time', 'Dialect support', 'Low cost'],
    models: ['paraformer-v2', 'paraformer-realtime'],
    wiredToGenieCast: true,
  },
];

// =============================================================================
// VIDEO STYLES (40+ Styles Across All Industries)
// =============================================================================

export const MASTER_VIDEO_STYLES: VideoStyleEntry[] = [
  // ═══════════════════════════════════════════════════════════════
  // STORYTELLING (6 styles)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'smart_storytelling',
    title: 'Smart Storytelling',
    category: 'storytelling',
    description: 'AI-driven narrative with emotional arc and dynamic pacing',
    icon: 'BookOpen',
    videoProvider: 'vertex-ai',
    animationProvider: 'modelslab',
    ttsStyle: 'narrative',
    pacing: 'dynamic',
    industries: ['marketing', 'entertainment', 'education'],
    popular: true,
    new: true,
  },
  {
    id: 'hook_videos',
    title: 'Hook Videos',
    category: 'storytelling',
    description: 'High-energy attention-grabbing content for social platforms',
    icon: 'Sparkles',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'energetic',
    pacing: 'fast',
    industries: ['marketing', 'social', 'ecommerce'],
    popular: true,
  },
  {
    id: 'micro_drama',
    title: 'Micro-Drama',
    category: 'storytelling',
    description: 'Short-form dramatic narratives with emotional impact',
    icon: 'Film',
    videoProvider: 'vertex-ai',
    animationProvider: 'modelslab',
    ttsStyle: 'dramatic',
    pacing: 'dynamic',
    industries: ['entertainment', 'marketing', 'education'],
  },
  {
    id: 'documentary',
    title: 'Documentary',
    category: 'storytelling',
    description: 'Informative long-form content with professional narration',
    icon: 'Camera',
    videoProvider: 'sora2api',
    ttsStyle: 'documentary',
    pacing: 'slow',
    industries: ['education', 'enterprise', 'nonprofit'],
    new: true,
  },
  {
    id: 'narrative_arc',
    title: 'Narrative Arc',
    category: 'storytelling',
    description: 'Classic three-act structure for compelling stories',
    icon: 'TrendingUp',
    videoProvider: 'vertex-ai',
    ttsStyle: 'narrative',
    pacing: 'dynamic',
    industries: ['marketing', 'entertainment', 'training'],
  },
  {
    id: 'testimonial',
    title: 'Testimonial',
    category: 'storytelling',
    description: 'Customer success stories with authentic voice',
    icon: 'MessageCircle',
    videoProvider: 'modelslab',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'conversational',
    pacing: 'normal',
    industries: ['marketing', 'ecommerce', 'saas'],
    popular: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // AVATAR & PRESENTERS (7 styles)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ugc_avatar_photorealistic',
    title: 'Photorealistic Avatar',
    category: 'avatar',
    description: 'Hyper-realistic AI presenter with natural lip-sync',
    icon: 'User',
    videoProvider: 'alibaba-wan',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'conversational',
    pacing: 'normal',
    industries: ['marketing', 'training', 'education'],
    popular: true,
  },
  {
    id: 'ugc_avatar_3d_pixar',
    title: '3D Pixar Style',
    category: 'avatar',
    description: '3D cartoon character with expressive animations',
    icon: 'Box',
    videoProvider: 'modelslab',
    avatarProvider: 'meshy-3d',
    animationProvider: 'modelslab',
    ttsStyle: 'friendly',
    pacing: 'normal',
    industries: ['education', 'kids', 'entertainment'],
    new: true,
  },
  {
    id: 'ugc_avatar_2d_animated',
    title: '2D Animated',
    category: 'avatar',
    description: 'Classic 2D cartoon style character',
    icon: 'Palette',
    videoProvider: 'modelslab',
    avatarProvider: 'modelslab-animate',
    animationProvider: 'modelslab',
    ttsStyle: 'animated',
    pacing: 'normal',
    industries: ['education', 'entertainment', 'marketing'],
  },
  {
    id: 'talking_photos',
    title: 'Talking Photos',
    category: 'avatar',
    description: 'Animate any photo with natural speech',
    icon: 'Mic2',
    videoProvider: 'alibaba-wan',
    avatarProvider: 'alibaba-wan2.2-s2v',
    ttsStyle: 'natural',
    pacing: 'normal',
    industries: ['marketing', 'memorial', 'entertainment'],
  },
  {
    id: 'full_body_avatar',
    title: 'Full-Body Avatar',
    category: 'avatar',
    description: 'Complete body animation with gestures and movement',
    icon: 'User',
    videoProvider: 'alibaba-wan',
    avatarProvider: 'alibaba-omniavatar',
    ttsStyle: 'professional',
    pacing: 'normal',
    industries: ['training', 'enterprise', 'education'],
    premium: true,
  },
  {
    id: 'digital_twin',
    title: 'Digital Twin',
    category: 'avatar',
    description: 'Create a digital clone of yourself for content',
    icon: 'UserCheck',
    videoProvider: 'alibaba-wan',
    avatarProvider: 'alibaba-mach',
    ttsStyle: 'natural',
    pacing: 'normal',
    industries: ['creator', 'enterprise', 'influencer'],
    premium: true,
    new: true,
  },
  {
    id: 'mascot_character',
    title: 'Brand Mascot',
    category: 'avatar',
    description: 'Animated brand mascot for consistent identity',
    icon: 'Heart',
    videoProvider: 'modelslab',
    avatarProvider: 'meshy-3d',
    animationProvider: 'modelslab',
    ttsStyle: 'playful',
    pacing: 'normal',
    industries: ['marketing', 'kids', 'ecommerce'],
  },

  // ═══════════════════════════════════════════════════════════════
  // ANIMATION (6 styles)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'anime',
    title: 'Anime Style',
    category: 'animation',
    description: 'Japanese animation aesthetic with dynamic expressions',
    icon: 'Wand2',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab-anime',
    ttsStyle: 'anime_style',
    pacing: 'dynamic',
    industries: ['entertainment', 'gaming', 'youth'],
    popular: true,
  },
  {
    id: 'image_to_life',
    title: 'Image to Life',
    category: 'animation',
    description: 'Animate static images with subtle motion',
    icon: 'Image',
    videoProvider: 'alibaba-wan',
    animationProvider: 'alibaba-wan2.6-i2v',
    ttsStyle: 'ambient',
    pacing: 'slow',
    industries: ['art', 'photography', 'memorial'],
    new: true,
  },
  {
    id: 'explainer_3d',
    title: '3D Explainer',
    category: 'animation',
    description: 'Complex concepts explained with 3D visualization',
    icon: 'Box',
    videoProvider: 'meshy-ai',
    animationProvider: 'modelslab',
    ttsStyle: 'educational',
    pacing: 'normal',
    industries: ['education', 'tech', 'manufacturing'],
  },
  {
    id: 'motion_graphics',
    title: 'Motion Graphics',
    category: 'animation',
    description: 'Professional animated graphics for brand content',
    icon: 'Layers',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'professional',
    pacing: 'dynamic',
    industries: ['marketing', 'enterprise', 'tech'],
    popular: true,
  },
  {
    id: 'kinetic_typography',
    title: 'Kinetic Typography',
    category: 'animation',
    description: 'Animated text that brings words to life',
    icon: 'Type',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'energetic',
    pacing: 'fast',
    industries: ['marketing', 'music', 'social'],
  },
  {
    id: 'whiteboard',
    title: 'Whiteboard Animation',
    category: 'animation',
    description: 'Hand-drawn explanations that unfold in real-time',
    icon: 'PenTool',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'educational',
    pacing: 'normal',
    industries: ['education', 'training', 'nonprofit'],
    popular: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // INTERACTIVE (5 styles)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'educational',
    title: 'Educational',
    category: 'interactive',
    description: 'Structured learning content with clear explanations',
    icon: 'GraduationCap',
    videoProvider: 'vertex-ai',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'educational',
    pacing: 'normal',
    industries: ['education', 'training', 'edtech'],
    popular: true,
  },
  {
    id: 'interactive_quiz',
    title: 'Quiz Overlay',
    category: 'interactive',
    description: 'Videos with embedded questions and assessments',
    icon: 'MousePointer',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'engaging',
    pacing: 'dynamic',
    industries: ['education', 'training', 'marketing'],
    new: true,
  },
  {
    id: 'cta_videos',
    title: 'CTA Videos',
    category: 'interactive',
    description: 'Action-oriented content with clear next steps',
    icon: 'MousePointer',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'persuasive',
    pacing: 'fast',
    industries: ['marketing', 'ecommerce', 'saas'],
  },
  {
    id: 'shoppable_video',
    title: 'Shoppable Video',
    category: 'interactive',
    description: 'Product videos with embedded purchase options',
    icon: 'ShoppingCart',
    videoProvider: 'modelslab',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'persuasive',
    pacing: 'normal',
    industries: ['ecommerce', 'retail', 'fashion'],
    new: true,
    premium: true,
  },
  {
    id: 'branching_narrative',
    title: 'Branching Narrative',
    category: 'interactive',
    description: 'Choose-your-own-adventure style content',
    icon: 'GitBranch',
    videoProvider: 'vertex-ai',
    ttsStyle: 'narrative',
    pacing: 'dynamic',
    industries: ['education', 'training', 'gaming'],
    premium: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // MARKETING (8 styles)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'social',
    title: 'Social Media',
    category: 'marketing',
    description: 'Platform-optimized content for maximum engagement',
    icon: 'Share2',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'trendy',
    pacing: 'fast',
    industries: ['marketing', 'creator', 'brand'],
    popular: true,
  },
  {
    id: 'video_ads',
    title: 'Video Ads',
    category: 'marketing',
    description: 'High-converting advertising content',
    icon: 'Megaphone',
    videoProvider: 'vertex-ai',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'professional',
    pacing: 'dynamic',
    industries: ['marketing', 'ecommerce', 'brand'],
  },
  {
    id: 'product_demo',
    title: 'Product Demo',
    category: 'marketing',
    description: 'Feature-focused product showcases',
    icon: 'Camera',
    videoProvider: 'vertex-ai',
    ttsStyle: 'demo',
    pacing: 'normal',
    industries: ['saas', 'tech', 'ecommerce'],
    popular: true,
  },
  {
    id: 'comparison',
    title: 'Comparison Video',
    category: 'marketing',
    description: 'Side-by-side competitor analysis',
    icon: 'Scale',
    videoProvider: 'modelslab',
    ttsStyle: 'analytical',
    pacing: 'normal',
    industries: ['saas', 'tech', 'ecommerce'],
    new: true,
  },
  {
    id: 'case_study',
    title: 'Case Study',
    category: 'marketing',
    description: 'In-depth success stories with data',
    icon: 'FileText',
    videoProvider: 'vertex-ai',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'professional',
    pacing: 'normal',
    industries: ['saas', 'enterprise', 'consulting'],
  },
  {
    id: 'event_promo',
    title: 'Event Promo',
    category: 'marketing',
    description: 'Engaging event announcements and invitations',
    icon: 'Calendar',
    videoProvider: 'modelslab',
    animationProvider: 'modelslab',
    ttsStyle: 'energetic',
    pacing: 'fast',
    industries: ['events', 'entertainment', 'enterprise'],
  },
  {
    id: 'behind_scenes',
    title: 'Behind the Scenes',
    category: 'marketing',
    description: 'Authentic peek into your process',
    icon: 'Eye',
    videoProvider: 'modelslab',
    ttsStyle: 'conversational',
    pacing: 'normal',
    industries: ['creator', 'brand', 'entertainment'],
  },
  {
    id: 'news_update',
    title: 'News Update',
    category: 'marketing',
    description: 'Professional news and announcement format',
    icon: 'Newspaper',
    videoProvider: 'vertex-ai',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'newscast',
    pacing: 'normal',
    industries: ['media', 'enterprise', 'finance'],
  },

  // ═══════════════════════════════════════════════════════════════
  // ENTERPRISE (4 styles)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'corporate_training',
    title: 'Corporate Training',
    category: 'enterprise',
    description: 'Professional L&D content for organizations',
    icon: 'Building',
    videoProvider: 'vertex-ai',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'professional',
    pacing: 'normal',
    industries: ['enterprise', 'hr', 'training'],
    popular: true,
  },
  {
    id: 'internal_comms',
    title: 'Internal Communications',
    category: 'enterprise',
    description: 'Employee engagement and company updates',
    icon: 'Users',
    videoProvider: 'modelslab',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'conversational',
    pacing: 'normal',
    industries: ['enterprise', 'hr', 'communications'],
  },
  {
    id: 'investor_update',
    title: 'Investor Update',
    category: 'enterprise',
    description: 'Professional investor relations content',
    icon: 'TrendingUp',
    videoProvider: 'vertex-ai',
    ttsStyle: 'professional',
    pacing: 'slow',
    industries: ['finance', 'startup', 'enterprise'],
    premium: true,
  },
  {
    id: 'compliance_training',
    title: 'Compliance Training',
    category: 'enterprise',
    description: 'Regulatory and compliance education',
    icon: 'Shield',
    videoProvider: 'vertex-ai',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'educational',
    pacing: 'normal',
    industries: ['finance', 'healthcare', 'legal'],
    popular: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // HEALTHCARE (3 styles)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'patient_education',
    title: 'Patient Education',
    category: 'healthcare',
    description: 'Clear medical information for patients',
    icon: 'Heart',
    videoProvider: 'vertex-ai',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'caring',
    pacing: 'slow',
    industries: ['healthcare', 'pharma', 'wellness'],
    popular: true,
  },
  {
    id: 'provider_training',
    title: 'Provider Training',
    category: 'healthcare',
    description: 'Medical professional education',
    icon: 'Stethoscope',
    videoProvider: 'vertex-ai',
    avatarProvider: 'alibaba-wan2.2',
    ttsStyle: 'educational',
    pacing: 'normal',
    industries: ['healthcare', 'pharma', 'medical'],
  },
  {
    id: 'medical_explainer',
    title: 'Medical Explainer',
    category: 'healthcare',
    description: '3D medical visualization and explanation',
    icon: 'Activity',
    videoProvider: 'meshy-ai',
    animationProvider: 'modelslab',
    ttsStyle: 'educational',
    pacing: 'normal',
    industries: ['healthcare', 'pharma', 'biotech'],
    new: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // ENTERTAINMENT (4 styles)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'gaming_trailer',
    title: 'Gaming Trailer',
    category: 'entertainment',
    description: 'High-energy game promotional content',
    icon: 'Gamepad',
    videoProvider: 'sora2api',
    animationProvider: 'modelslab',
    ttsStyle: 'epic',
    pacing: 'fast',
    industries: ['gaming', 'entertainment', 'tech'],
    new: true,
  },
  {
    id: 'music_video',
    title: 'Music Video',
    category: 'entertainment',
    description: 'Visual storytelling synced to music',
    icon: 'Music',
    videoProvider: 'sora2api',
    animationProvider: 'modelslab',
    ttsStyle: 'musical',
    pacing: 'dynamic',
    industries: ['music', 'entertainment', 'creator'],
    popular: true,
  },
  {
    id: 'short_film',
    title: 'Short Film',
    category: 'entertainment',
    description: 'Cinematic short-form narrative content',
    icon: 'Clapperboard',
    videoProvider: 'sora2api',
    ttsStyle: 'cinematic',
    pacing: 'dynamic',
    industries: ['entertainment', 'film', 'creator'],
    premium: true,
  },
  {
    id: 'podcast_video',
    title: 'Podcast Video',
    category: 'entertainment',
    description: 'Visual podcast with dynamic elements',
    icon: 'Mic',
    videoProvider: 'modelslab',
    avatarProvider: 'alibaba-wan2.2',
    animationProvider: 'modelslab',
    ttsStyle: 'conversational',
    pacing: 'normal',
    industries: ['podcast', 'creator', 'media'],
    new: true,
  },
];

// =============================================================================
// FULL PIPELINE REGISTRY (206 Pipelines across 21 Categories)
// =============================================================================
// Distribution: SPARK(28) + MIND(30) + VIBE(74) + DECK(34) + ARC(14) + CAST(26) = 206

export const MASTER_MARKETING_PIPELINES: PipelineEntry[] = [
  // ═══════════════════════════════════════════════════════════════
  // SPARK PIPELINES (28 total) - "Ignite your Ideas"
  // ═══════════════════════════════════════════════════════════════
  // Input Processing (8)
  { id: 'pdf-to-script', name: 'PDF to Script', category: 'text_based', description: 'Extract and convert PDF content to scripts', providers: ['claude', 'gemini', 'azure'], tabMapping: 'CREATE', isActive: true, priority: 1 },
  { id: 'doc-to-script', name: 'Document to Script', category: 'text_based', description: 'Convert Word/Google Docs to scripts', providers: ['claude', 'gemini'], tabMapping: 'CREATE', isActive: true, priority: 2 },
  { id: 'ppt-to-script', name: 'PPT to Script', category: 'presentation', description: 'Extract content from presentations', providers: ['gemini', 'azure'], tabMapping: 'CREATE', isActive: true, priority: 3 },
  { id: 'url-to-script', name: 'URL to Script', category: 'text_based', description: 'Scrape and convert web content', providers: ['claude', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 4 },
  { id: 'audio-to-script', name: 'Audio to Script', category: 'audio', description: 'Transcribe audio to script', providers: ['deepgram', 'whisper', 'azure'], tabMapping: 'CREATE', isActive: true, priority: 5 },
  { id: 'video-to-script', name: 'Video to Script', category: 'video', description: 'Extract audio and transcribe from video', providers: ['deepgram', 'whisper'], tabMapping: 'CREATE', isActive: true, priority: 6 },
  { id: 'image-to-script', name: 'Image to Script', category: 'image', description: 'OCR and describe images to script', providers: ['gemini', 'azure', 'claude'], tabMapping: 'CREATE', isActive: true, priority: 7 },
  { id: 'handwriting-to-text', name: 'Handwriting to Text', category: 'text_based', description: 'Convert handwritten notes', providers: ['azure', 'google'], tabMapping: 'CREATE', isActive: true, priority: 8 },
  // Script Generation (12)
  { id: 'idea-to-script', name: 'Idea to Script', category: 'text_based', description: 'Generate script from brief idea', providers: ['claude', 'openai', 'gemini'], tabMapping: 'CREATE', isActive: true, priority: 9 },
  { id: 'topic-to-outline', name: 'Topic to Outline', category: 'text_based', description: 'Create content outline from topic', providers: ['claude', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 10 },
  { id: 'outline-to-script', name: 'Outline to Script', category: 'text_based', description: 'Expand outline to full script', providers: ['claude', 'openai', 'gemini'], tabMapping: 'CREATE', isActive: true, priority: 11 },
  { id: 'blog-to-script', name: 'Blog to Script', category: 'text_based', description: 'Convert blog post to video script', providers: ['claude', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 12 },
  { id: 'research-to-script', name: 'Research to Script', category: 'document', description: 'Transform research papers to scripts', providers: ['claude', 'gemini'], tabMapping: 'CREATE', isActive: true, priority: 13 },
  { id: 'interview-to-script', name: 'Interview to Script', category: 'audio', description: 'Convert interview to narrative script', providers: ['claude', 'deepgram'], tabMapping: 'CREATE', isActive: true, priority: 14 },
  { id: 'data-to-story', name: 'Data to Story', category: 'data_viz', description: 'Transform data into narrative', providers: ['claude', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 15 },
  { id: 'prompt-to-chapter', name: 'Prompt to Chapter', category: 'text_based', description: 'Generate chapter content from prompt', providers: ['claude', 'openai', 'deepseek'], tabMapping: 'CREATE', isActive: true, priority: 16 },
  { id: 'case-study-to-script', name: 'Case Study to Script', category: 'document', description: 'Transform case studies to video scripts', providers: ['claude', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 17 },
  { id: 'faq-to-script', name: 'FAQ to Script', category: 'text_based', description: 'Convert FAQs to explainer scripts', providers: ['claude', 'gemini'], tabMapping: 'CREATE', isActive: true, priority: 18 },
  { id: 'tutorial-generator', name: 'Tutorial Generator', category: 'training_ld', description: 'Generate tutorial scripts', providers: ['claude', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 19 },
  { id: 'story-arc-builder', name: 'Story Arc Builder', category: 'text_based', description: 'Create narrative story arcs', providers: ['claude', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 20 },
  // Content Extraction (8)
  { id: 'entity-extraction', name: 'Entity Extraction', category: 'document', description: 'Extract entities from documents', providers: ['azure', 'claude', 'gemini'], tabMapping: 'CREATE', isActive: true, priority: 21 },
  { id: 'key-points-extraction', name: 'Key Points Extraction', category: 'document', description: 'Extract key points from content', providers: ['claude', 'gemini'], tabMapping: 'CREATE', isActive: true, priority: 22 },
  { id: 'table-extraction', name: 'Table Extraction', category: 'document', description: 'Extract tables from documents', providers: ['azure', 'gemini'], tabMapping: 'CREATE', isActive: true, priority: 23 },
  { id: 'form-data-extraction', name: 'Form Data Extraction', category: 'document', description: 'Extract form fields and values', providers: ['azure', 'google'], tabMapping: 'CREATE', isActive: true, priority: 24 },
  { id: 'invoice-extraction', name: 'Invoice Extraction', category: 'document', description: 'Extract invoice data', providers: ['azure', 'google'], tabMapping: 'CREATE', isActive: true, priority: 25 },
  { id: 'receipt-extraction', name: 'Receipt Extraction', category: 'document', description: 'Extract receipt information', providers: ['azure', 'google'], tabMapping: 'CREATE', isActive: true, priority: 26 },
  { id: 'quote-extraction', name: 'Quote Extraction', category: 'text_based', description: 'Extract notable quotes from content', providers: ['claude', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 27 },
  { id: 'summary-generator', name: 'Summary Generator', category: 'text_based', description: 'Generate content summaries', providers: ['claude', 'gemini', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 28 },
  // ═══════════════════════════════════════════════════════════════
  // MIND PIPELINES (30 total) - "AI That Understands"
  // ═══════════════════════════════════════════════════════════════
  { id: 'script-rewriter', name: 'Script Rewriter', category: 'text_based', description: 'Rewrite and improve scripts', providers: ['claude', 'openai'], tabMapping: 'PRODUCE', isActive: true, priority: 29 },
  { id: 'tone-adjuster', name: 'Tone Adjuster', category: 'text_based', description: 'Adjust script tone and style', providers: ['claude', 'openai'], tabMapping: 'PRODUCE', isActive: true, priority: 30 },
  { id: 'hook-generator', name: 'Hook Generator', category: 'marketing_specific', description: 'Create attention-grabbing hooks', providers: ['claude', 'openai'], tabMapping: 'PRODUCE', isActive: true, priority: 31 },
  { id: 'cta-generator', name: 'CTA Generator', category: 'marketing_specific', description: 'Generate call-to-action content', providers: ['claude', 'openai'], tabMapping: 'PRODUCE', isActive: true, priority: 32 },
  { id: 'script-expander', name: 'Script Expander', category: 'text_based', description: 'Expand brief scripts', providers: ['claude', 'openai', 'gemini'], tabMapping: 'PRODUCE', isActive: true, priority: 33 },
  { id: 'script-condenser', name: 'Script Condenser', category: 'text_based', description: 'Shorten long scripts', providers: ['claude', 'gemini'], tabMapping: 'PRODUCE', isActive: true, priority: 34 },
  { id: 'script-localizer', name: 'Script Localizer', category: 'localization', description: 'Adapt scripts for local markets', providers: ['claude', 'deepl', 'alibaba'], tabMapping: 'PRODUCE', isActive: true, priority: 35 },
  { id: 'text-to-speech', name: 'Text to Speech', category: 'audio', description: 'Convert text to natural speech', providers: ['elevenlabs', 'azure', 'openai'], tabMapping: 'PRODUCE', isActive: true, priority: 36 },
  { id: 'voice-cloning', name: 'Voice Cloning', category: 'audio', description: 'Clone and generate custom voices', providers: ['elevenlabs', 'qwen3-tts'], tabMapping: 'PRODUCE', isActive: true, priority: 37 },
  { id: 'multi-voice-narrator', name: 'Multi-Voice Narrator', category: 'audio', description: 'Generate dialogue with multiple voices', providers: ['elevenlabs', 'azure'], tabMapping: 'PRODUCE', isActive: true, priority: 38 },
  { id: 'emotion-tts', name: 'Emotion TTS', category: 'audio', description: 'TTS with emotional expression', providers: ['elevenlabs', 'azure', 'qwen3-tts'], tabMapping: 'PRODUCE', isActive: true, priority: 39 },
  { id: 'background-music', name: 'Background Music', category: 'audio', description: 'Generate background music', providers: ['elevenlabs', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 40 },
  { id: 'text-to-sfx', name: 'Text to SFX', category: 'audio', description: 'Generate sound effects from text', providers: ['elevenlabs', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 41 },
  { id: 'script-translation', name: 'Script Translation', category: 'localization', description: 'Translate scripts to other languages', providers: ['deepl', 'claude', 'alibaba', 'google'], tabMapping: 'PRODUCE', isActive: true, priority: 42 },
  { id: 'subtitle-translation', name: 'Subtitle Translation', category: 'localization', description: 'Translate subtitles', providers: ['deepl', 'claude', 'alibaba'], tabMapping: 'PRODUCE', isActive: true, priority: 43 },
  { id: 'marketing-localization', name: 'Marketing Localization', category: 'localization', description: 'Localize marketing content', providers: ['claude', 'deepl'], tabMapping: 'PRODUCE', isActive: true, priority: 44 },
  { id: 'cjk-tts', name: 'CJK TTS', category: 'audio', description: 'Specialized TTS for CJK languages', providers: ['qwen3-tts', 'alibaba', 'azure'], tabMapping: 'PRODUCE', isActive: true, priority: 45 },
  { id: 'ssml-generator', name: 'SSML Generator', category: 'audio', description: 'Generate SSML for advanced TTS', providers: ['azure', 'google_tts'], tabMapping: 'PRODUCE', isActive: true, priority: 46 },
  { id: 'jingle-generator', name: 'Jingle Generator', category: 'audio', description: 'Create short music jingles', providers: ['elevenlabs', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 47 },
  { id: 'mood-music', name: 'Mood Music', category: 'audio', description: 'Generate mood-specific music', providers: ['elevenlabs', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 48 },
  { id: 'cultural-adaptation', name: 'Cultural Adaptation', category: 'localization', description: 'Adapt content for cultural context', providers: ['claude', 'openai'], tabMapping: 'PRODUCE', isActive: true, priority: 49 },
  { id: 'rtl-conversion', name: 'RTL Conversion', category: 'localization', description: 'Convert for RTL languages', providers: ['claude', 'alibaba'], tabMapping: 'PRODUCE', isActive: true, priority: 50 },
  { id: 'dialect-adaptation', name: 'Dialect Adaptation', category: 'localization', description: 'Adapt for regional dialects', providers: ['claude', 'alibaba'], tabMapping: 'PRODUCE', isActive: true, priority: 51 },
  { id: 'persona-adapter', name: 'Persona Adapter', category: 'text_based', description: 'Adapt script for different personas', providers: ['claude', 'openai'], tabMapping: 'PRODUCE', isActive: true, priority: 52 },
  { id: 'pronunciation-tuner', name: 'Pronunciation Tuner', category: 'audio', description: 'Fine-tune pronunciation', providers: ['azure', 'elevenlabs'], tabMapping: 'PRODUCE', isActive: true, priority: 53 },
  { id: 'speaking-rate-adjuster', name: 'Speaking Rate Adjuster', category: 'audio', description: 'Adjust speech pacing', providers: ['elevenlabs', 'azure'], tabMapping: 'PRODUCE', isActive: true, priority: 54 },
  { id: 'ambient-soundscape', name: 'Ambient Soundscape', category: 'audio', description: 'Create ambient audio environments', providers: ['elevenlabs', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 55 },
  { id: 'audio-logo', name: 'Audio Logo', category: 'audio', description: 'Generate audio brand identity', providers: ['elevenlabs', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 56 },
  { id: 'script-segmenter', name: 'Script Segmenter', category: 'text_based', description: 'Split scripts into segments', providers: ['claude', 'gemini'], tabMapping: 'PRODUCE', isActive: true, priority: 57 },
  { id: 'script-merger', name: 'Script Merger', category: 'text_based', description: 'Merge multiple scripts', providers: ['claude', 'openai'], tabMapping: 'PRODUCE', isActive: true, priority: 58 },
  // ═══════════════════════════════════════════════════════════════
  // VIBE PIPELINES (74 total) - "Script to Screen"
  // ═══════════════════════════════════════════════════════════════
  { id: 'text-to-video', name: 'Text to Video', category: 'video', description: 'Generate video from text', providers: ['vertex_ai', 'sora2api', 'modelslab', 'alibaba'], tabMapping: 'PRODUCE', isActive: true, priority: 59 },
  { id: 'image-to-video', name: 'Image to Video', category: 'video', description: 'Animate images to video', providers: ['vertex_ai', 'alibaba', 'modelslab', 'replicate'], tabMapping: 'PRODUCE', isActive: true, priority: 60 },
  { id: 'script-to-video', name: 'Script to Video', category: 'video', description: 'Convert scripts to complete videos', providers: ['vertex_ai', 'modelslab', 'sora2api'], tabMapping: 'PRODUCE', isActive: true, priority: 61 },
  { id: 'storyboard-to-video', name: 'Storyboard to Video', category: 'video', description: 'Convert storyboards to video', providers: ['vertex_ai', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 62 },
  { id: 'b-roll-generator', name: 'B-Roll Generator', category: 'video', description: 'Generate supplementary footage', providers: ['vertex_ai', 'modelslab', 'sora2api'], tabMapping: 'PRODUCE', isActive: true, priority: 63 },
  { id: 'video-extend', name: 'Video Extend', category: 'video', description: 'Extend video duration', providers: ['vertex_ai', 'alibaba'], tabMapping: 'PRODUCE', isActive: true, priority: 64 },
  { id: 'video-loop', name: 'Video Loop', category: 'video', description: 'Create seamless video loops', providers: ['modelslab', 'replicate'], tabMapping: 'PRODUCE', isActive: true, priority: 65 },
  { id: 'video-inpainting', name: 'Video Inpainting', category: 'video', description: 'Remove/replace video elements', providers: ['modelslab', 'replicate'], tabMapping: 'PRODUCE', isActive: true, priority: 66 },
  { id: 'video-upscale', name: 'Video Upscale', category: 'video', description: 'Upscale video resolution', providers: ['replicate', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 67 },
  { id: 'video-stabilize', name: 'Video Stabilize', category: 'video', description: 'Stabilize shaky video', providers: ['replicate', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 68 },
  { id: 'animated-explainer', name: 'Animated Explainer', category: 'video', description: 'Create animated explainer videos', providers: ['modelslab', 'vertex_ai'], tabMapping: 'PRODUCE', isActive: true, priority: 69 },
  { id: 'product-showcase', name: 'Product Showcase', category: 'video', description: 'Generate product videos', providers: ['vertex_ai', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 70 },
  { id: 'testimonial-video', name: 'Testimonial Video', category: 'video', description: 'Create testimonial videos', providers: ['alibaba', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 71 },
  { id: 'social-video', name: 'Social Video', category: 'social', description: 'Platform-optimized social videos', providers: ['modelslab', 'vertex_ai'], tabMapping: 'PRODUCE', isActive: true, priority: 72 },
  { id: 'ad-video', name: 'Ad Video', category: 'marketing_base', description: 'Generate advertising videos', providers: ['vertex_ai', 'modelslab', 'sora2api'], tabMapping: 'PRODUCE', isActive: true, priority: 73 },
  { id: 'video-trim', name: 'Video Trim', category: 'video', description: 'Trim video clips', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 74 },
  { id: 'video-merge', name: 'Video Merge', category: 'video', description: 'Merge multiple videos', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 75 },
  { id: 'video-split', name: 'Video Split', category: 'video', description: 'Split video into segments', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 76 },
  { id: 'video-transitions', name: 'Video Transitions', category: 'video', description: 'Add transitions between clips', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 77 },
  { id: 'video-overlay', name: 'Video Overlay', category: 'video', description: 'Add overlays to video', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 78 },
  { id: 'video-text-overlay', name: 'Video Text Overlay', category: 'video', description: 'Add text overlays', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 79 },
  { id: 'video-logo-overlay', name: 'Video Logo Overlay', category: 'video', description: 'Add logo watermarks', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 80 },
  { id: 'video-color-grade', name: 'Video Color Grade', category: 'video', description: 'Apply color grading', providers: ['modelslab', 'replicate'], tabMapping: 'MANAGE', isActive: true, priority: 81 },
  { id: 'video-speed-change', name: 'Video Speed Change', category: 'video', description: 'Adjust video speed', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 82 },
  { id: 'video-resize', name: 'Video Resize', category: 'video', description: 'Resize video dimensions', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 83 },
  { id: 'video-thumbnail', name: 'Video Thumbnail', category: 'video', description: 'Auto-generate video thumbnails', providers: ['modelslab', 'openai', 'gemini'], tabMapping: 'MANAGE', isActive: true, priority: 84 },
  { id: 'audio-mix', name: 'Audio Mix', category: 'audio', description: 'Mix multiple audio tracks', providers: ['json2video', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 85 },
  { id: 'audio-normalize', name: 'Audio Normalize', category: 'audio', description: 'Normalize audio levels', providers: ['json2video', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 86 },
  { id: 'audio-ducking', name: 'Audio Ducking', category: 'audio', description: 'Auto-duck background audio', providers: ['json2video', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 87 },
  { id: 'audio-cleanup', name: 'Audio Cleanup', category: 'audio', description: 'Remove noise and enhance', providers: ['elevenlabs', 'azure'], tabMapping: 'PRODUCE', isActive: true, priority: 88 },
  { id: 'audio-sync', name: 'Audio Sync', category: 'audio', description: 'Sync audio to video', providers: ['json2video', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 89 },
  { id: 'voiceover-overlay', name: 'Voiceover Overlay', category: 'audio', description: 'Add voiceover to video', providers: ['elevenlabs', 'azure', 'json2video'], tabMapping: 'PRODUCE', isActive: true, priority: 90 },
  { id: 'podcast-to-video', name: 'Podcast to Video', category: 'video', description: 'Convert podcast to video', providers: ['modelslab', 'alibaba', 'json2video'], tabMapping: 'PRODUCE', isActive: true, priority: 91 },
  { id: 'webinar-recorder', name: 'Webinar Recorder', category: 'video', description: 'Record and process webinars', providers: ['json2video', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 92 },
  { id: 'interview-to-video', name: 'Interview to Video', category: 'video', description: 'Convert interviews to video', providers: ['alibaba', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 93 },
  { id: 'multi-host-video', name: 'Multi-Host Video', category: 'video', description: 'Multi-person video layout', providers: ['json2video', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 94 },
  { id: 'chapter-marker', name: 'Chapter Marker', category: 'video', description: 'Add chapter markers', providers: ['gemini', 'claude'], tabMapping: 'MANAGE', isActive: true, priority: 95 },
  { id: 'highlight-reel', name: 'Highlight Reel', category: 'video', description: 'Extract video highlights', providers: ['gemini', 'claude', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 96 },
  { id: 'transcript-generator', name: 'Transcript Generator', category: 'audio', description: 'Generate video transcripts', providers: ['deepgram', 'whisper', 'azure'], tabMapping: 'MANAGE', isActive: true, priority: 97 },
  { id: 'speaker-diarization', name: 'Speaker Diarization', category: 'audio', description: 'Identify and label speakers', providers: ['deepgram', 'azure'], tabMapping: 'MANAGE', isActive: true, priority: 98 },
  { id: 'audiogram-generator', name: 'Audiogram Generator', category: 'social', description: 'Create social audiograms', providers: ['json2video', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 99 },
  { id: 'podcast-teaser', name: 'Podcast Teaser', category: 'social', description: 'Create podcast teaser clips', providers: ['modelslab', 'json2video'], tabMapping: 'PRODUCE', isActive: true, priority: 100 },
  { id: 'show-notes-generator', name: 'Show Notes Generator', category: 'text_based', description: 'Generate podcast show notes', providers: ['claude', 'gemini'], tabMapping: 'MANAGE', isActive: true, priority: 101 },
  { id: 'episode-summary', name: 'Episode Summary', category: 'text_based', description: 'Summarize podcast episodes', providers: ['claude', 'gemini'], tabMapping: 'MANAGE', isActive: true, priority: 102 },
  { id: 'q-and-a-extractor', name: 'Q&A Extractor', category: 'text_based', description: 'Extract Q&A from recordings', providers: ['claude', 'gemini', 'deepgram'], tabMapping: 'MANAGE', isActive: true, priority: 103 },
  { id: 'soundbite-extractor', name: 'Soundbite Extractor', category: 'audio', description: 'Extract memorable soundbites', providers: ['gemini', 'claude', 'deepgram'], tabMapping: 'MANAGE', isActive: true, priority: 104 },
  { id: 'video-shorts', name: 'Video Shorts', category: 'social', description: 'Generate short-form content', providers: ['modelslab', 'gemini', 'json2video'], tabMapping: 'MANAGE', isActive: true, priority: 105 },
  { id: 'avatar-generator', name: 'Avatar Generator', category: 'video', description: 'Generate AI avatar videos', providers: ['alibaba', 'modelslab', 'replicate'], tabMapping: 'PRODUCE', isActive: true, priority: 106 },
  { id: 'talking-photo', name: 'Talking Photo', category: 'video', description: 'Animate photos to speak', providers: ['alibaba', 'replicate', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 107 },
  { id: 'lipsync-generator', name: 'Lipsync Generator', category: 'video', description: 'Sync lips to audio', providers: ['alibaba', 'replicate', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 108 },
  { id: 'avatar-customizer', name: 'Avatar Customizer', category: 'video', description: 'Customize avatar appearance', providers: ['alibaba', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 109 },
  { id: 'gesture-generator', name: 'Gesture Generator', category: 'video', description: 'Add avatar gestures', providers: ['alibaba', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 110 },
  { id: 'expression-control', name: 'Expression Control', category: 'video', description: 'Control avatar expressions', providers: ['alibaba', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 111 },
  { id: 'virtual-presenter', name: 'Virtual Presenter', category: 'video', description: 'Full virtual presenter videos', providers: ['alibaba', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 112 },
  { id: 'multi-avatar-scene', name: 'Multi-Avatar Scene', category: 'video', description: 'Multiple avatars in scene', providers: ['alibaba', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 113 },
  { id: 'viseme-generator', name: 'Viseme Generator', category: 'audio', description: 'Generate lip-sync visemes', providers: ['azure', 'alibaba'], tabMapping: 'PRODUCE', isActive: true, priority: 114 },
  { id: 'video-dubbing', name: 'Video Dubbing', category: 'localization', description: 'Dub video to other languages', providers: ['elevenlabs', 'azure', 'alibaba'], tabMapping: 'PRODUCE', isActive: true, priority: 115 },
  { id: 'voice-replacement', name: 'Voice Replacement', category: 'audio', description: 'Replace video voice', providers: ['elevenlabs', 'azure'], tabMapping: 'PRODUCE', isActive: true, priority: 116 },
  { id: 'multi-language-dub', name: 'Multi-Language Dub', category: 'localization', description: 'Dub to multiple languages', providers: ['elevenlabs', 'azure', 'alibaba'], tabMapping: 'PRODUCE', isActive: true, priority: 117 },
  { id: 'accent-converter', name: 'Accent Converter', category: 'audio', description: 'Convert speech accents', providers: ['elevenlabs', 'azure'], tabMapping: 'PRODUCE', isActive: true, priority: 118 },
  { id: 'dub-sync', name: 'Dub Sync', category: 'audio', description: 'Sync dubbed audio to video', providers: ['json2video', 'elevenlabs'], tabMapping: 'PRODUCE', isActive: true, priority: 119 },
  { id: 'subtitle-generator', name: 'Subtitle Generator', category: 'video', description: 'Generate video subtitles', providers: ['deepgram', 'azure', 'whisper'], tabMapping: 'MANAGE', isActive: true, priority: 120 },
  { id: 'caption-burner', name: 'Caption Burner', category: 'video', description: 'Burn captions into video', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 121 },
  { id: 'multi-language-subtitle', name: 'Multi-Language Subtitle', category: 'localization', description: 'Multi-language subtitles', providers: ['deepl', 'azure', 'alibaba'], tabMapping: 'MANAGE', isActive: true, priority: 122 },
  { id: 'video-reverse', name: 'Video Reverse', category: 'video', description: 'Reverse video playback', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 123 },
  { id: 'video-crop', name: 'Video Crop', category: 'video', description: 'Crop video frame', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 124 },
  { id: 'video-rotate', name: 'Video Rotate', category: 'video', description: 'Rotate video', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 125 },
  { id: 'video-preview', name: 'Video Preview', category: 'video', description: 'Generate video previews', providers: ['modelslab', 'json2video'], tabMapping: 'MANAGE', isActive: true, priority: 126 },
  { id: 'audio-fade', name: 'Audio Fade', category: 'audio', description: 'Add fade in/out effects', providers: ['json2video', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 127 },
  { id: 'audio-replace', name: 'Audio Replace', category: 'audio', description: 'Replace video audio track', providers: ['json2video', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 128 },
  { id: 'audio-compression', name: 'Audio Compression', category: 'audio', description: 'Compress audio dynamics', providers: ['json2video', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 129 },
  { id: 'audio-eq', name: 'Audio EQ', category: 'audio', description: 'Equalize audio frequencies', providers: ['json2video', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 130 },
  { id: 'live-stream-processor', name: 'Live Stream Processor', category: 'video', description: 'Process live stream recordings', providers: ['json2video', 'modelslab'], tabMapping: 'MANAGE', isActive: true, priority: 131 },
  { id: 'avatar-outfit-change', name: 'Avatar Outfit Change', category: 'video', description: 'Change avatar clothing', providers: ['alibaba', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 132 },
  // ═══════════════════════════════════════════════════════════════
  // DECK PIPELINES (34 total) - "Ideas to Impact"
  // ═══════════════════════════════════════════════════════════════
  { id: 'script-to-slides', name: 'Script to Slides', category: 'presentation', description: 'Generate slides from scripts', providers: ['claude', 'openai', 'gemini'], tabMapping: 'CREATE', isActive: true, priority: 133 },
  { id: 'pitch-deck-generator', name: 'Pitch Deck Generator', category: 'presentation', description: 'Create investor pitch decks', providers: ['claude', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 134 },
  { id: 'webinar-slides', name: 'Webinar Slides', category: 'presentation', description: 'Generate webinar presentations', providers: ['claude', 'gemini'], tabMapping: 'CREATE', isActive: true, priority: 135 },
  { id: 'training-slides', name: 'Training Slides', category: 'training_ld', description: 'Create training presentations', providers: ['claude', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 136 },
  { id: 'report-to-slides', name: 'Report to Slides', category: 'presentation', description: 'Convert reports to slides', providers: ['claude', 'gemini'], tabMapping: 'CREATE', isActive: true, priority: 137 },
  { id: 'data-to-slides', name: 'Data to Slides', category: 'data_viz', description: 'Visualize data in slides', providers: ['claude', 'openai', 'gemini'], tabMapping: 'CREATE', isActive: true, priority: 138 },
  { id: 'slide-enhancer', name: 'Slide Enhancer', category: 'presentation', description: 'Enhance existing slides', providers: ['claude', 'openai'], tabMapping: 'PRODUCE', isActive: true, priority: 139 },
  { id: 'speaker-notes', name: 'Speaker Notes Generator', category: 'presentation', description: 'Generate speaker notes', providers: ['claude', 'openai'], tabMapping: 'PRODUCE', isActive: true, priority: 140 },
  { id: 'slide-to-video', name: 'Slide to Video', category: 'video', description: 'Convert slides to video', providers: ['json2video', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 141 },
  { id: 'animated-slides', name: 'Animated Slides', category: 'presentation', description: 'Add slide animations', providers: ['json2video', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 142 },
  { id: 'slide-template-generator', name: 'Slide Template Generator', category: 'presentation', description: 'Generate slide templates', providers: ['claude', 'modelslab'], tabMapping: 'CREATE', isActive: true, priority: 143 },
  { id: 'ppt-export', name: 'PPT Export', category: 'presentation', description: 'Export to PowerPoint format', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 144 },
  { id: 'text-to-image', name: 'Text to Image', category: 'image', description: 'Generate images from text', providers: ['flux', 'dalle', 'modelslab', 'vertex_ai'], tabMapping: 'CREATE', isActive: true, priority: 145 },
  { id: 'image-upscale', name: 'Image Upscale', category: 'image', description: 'Upscale image resolution', providers: ['modelslab', 'replicate'], tabMapping: 'MANAGE', isActive: true, priority: 146 },
  { id: 'image-enhance', name: 'Image Enhance', category: 'image', description: 'Enhance image quality', providers: ['modelslab', 'replicate'], tabMapping: 'MANAGE', isActive: true, priority: 147 },
  { id: 'background-remove', name: 'Background Remove', category: 'image', description: 'Remove image backgrounds', providers: ['modelslab', 'replicate'], tabMapping: 'MANAGE', isActive: true, priority: 148 },
  { id: 'image-inpainting', name: 'Image Inpainting', category: 'image', description: 'Edit image regions', providers: ['modelslab', 'replicate', 'dalle'], tabMapping: 'MANAGE', isActive: true, priority: 149 },
  { id: 'image-outpainting', name: 'Image Outpainting', category: 'image', description: 'Extend image boundaries', providers: ['modelslab', 'dalle'], tabMapping: 'MANAGE', isActive: true, priority: 150 },
  { id: 'style-transfer', name: 'Style Transfer', category: 'image', description: 'Apply artistic styles', providers: ['modelslab', 'replicate'], tabMapping: 'PRODUCE', isActive: true, priority: 151 },
  { id: 'brand-asset-generator', name: 'Brand Asset Generator', category: 'image', description: 'Generate brand visual assets', providers: ['flux', 'dalle', 'modelslab'], tabMapping: 'CREATE', isActive: true, priority: 152 },
  { id: 'icon-generator', name: 'Icon Generator', category: 'image', description: 'Generate custom icons', providers: ['flux', 'modelslab'], tabMapping: 'CREATE', isActive: true, priority: 153 },
  { id: 'thumbnail-generator', name: 'Thumbnail Generator', category: 'image', description: 'Generate thumbnails', providers: ['flux', 'modelslab', 'dalle'], tabMapping: 'CREATE', isActive: true, priority: 154 },
  { id: 'text-to-3d', name: 'Text to 3D', category: '3d_vr_ar', description: 'Generate 3D models from text', providers: ['meshy', 'modelslab', 'alibaba'], tabMapping: 'CREATE', isActive: true, priority: 155 },
  { id: 'image-to-3d', name: 'Image to 3D', category: '3d_vr_ar', description: 'Convert images to 3D', providers: ['meshy', 'replicate', 'modelslab'], tabMapping: 'CREATE', isActive: true, priority: 156 },
  { id: '3d-texture-generator', name: '3D Texture Generator', category: '3d_vr_ar', description: 'Generate 3D textures', providers: ['meshy', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 157 },
  { id: '3d-animation', name: '3D Animation', category: '3d_vr_ar', description: 'Animate 3D models', providers: ['meshy', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 158 },
  { id: '3d-rigging', name: '3D Rigging', category: '3d_vr_ar', description: 'Auto-rig 3D models', providers: ['meshy', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 159 },
  { id: '3d-scene-builder', name: '3D Scene Builder', category: '3d_vr_ar', description: 'Build 3D scenes', providers: ['meshy', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 160 },
  { id: '3d-to-video', name: '3D to Video', category: '3d_vr_ar', description: 'Render 3D to video', providers: ['meshy', 'modelslab', 'json2video'], tabMapping: 'PRODUCE', isActive: true, priority: 161 },
  { id: 'product-3d-viewer', name: 'Product 3D Viewer', category: '3d_vr_ar', description: 'Interactive 3D product viewer', providers: ['meshy', 'modelslab'], tabMapping: 'PUBLISH', isActive: true, priority: 162 },
  { id: 'ar-asset-generator', name: 'AR Asset Generator', category: '3d_vr_ar', description: 'Generate AR-ready assets', providers: ['meshy', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 163 },
  { id: 'vr-environment', name: 'VR Environment', category: '3d_vr_ar', description: 'Create VR environments', providers: ['meshy', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 164 },
  { id: '360-video', name: '360 Video', category: '3d_vr_ar', description: 'Generate 360-degree video', providers: ['vertex_ai', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 165 },
  { id: 'hologram-generator', name: 'Hologram Generator', category: '3d_vr_ar', description: 'Create holographic content', providers: ['meshy', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 166 },
  // ═══════════════════════════════════════════════════════════════
  // ARC PIPELINES (14 total) - "Production Journey"
  // ═══════════════════════════════════════════════════════════════
  { id: 'content-calendar', name: 'Content Calendar', category: 'social', description: 'Plan content calendar', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 167 },
  { id: 'social-scheduler', name: 'Social Scheduler', category: 'social', description: 'Schedule social posts', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 168 },
  { id: 'best-time-analyzer', name: 'Best Time Analyzer', category: 'social', description: 'Analyze optimal posting times', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 169 },
  { id: 'batch-scheduler', name: 'Batch Scheduler', category: 'social', description: 'Schedule content in batches', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 170 },
  { id: 'recurring-content', name: 'Recurring Content', category: 'social', description: 'Set up recurring content', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 171 },
  { id: 'campaign-planner', name: 'Campaign Planner', category: 'marketing_base', description: 'Plan marketing campaigns', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 172 },
  { id: 'release-manager', name: 'Release Manager', category: 'social', description: 'Manage content releases', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 173 },
  { id: 'deadline-tracker', name: 'Deadline Tracker', category: 'social', description: 'Track production deadlines', providers: ['claude', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 174 },
  { id: 'review-workflow', name: 'Review Workflow', category: 'social', description: 'Content review workflow', providers: ['claude', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 175 },
  { id: 'approval-system', name: 'Approval System', category: 'social', description: 'Content approval workflow', providers: ['claude', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 176 },
  { id: 'feedback-collector', name: 'Feedback Collector', category: 'social', description: 'Collect and organize feedback', providers: ['claude', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 177 },
  { id: 'version-control', name: 'Version Control', category: 'document', description: 'Track content versions', providers: ['claude', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 178 },
  { id: 'asset-library', name: 'Asset Library', category: 'document', description: 'Manage digital assets', providers: ['claude', 'gemini'], tabMapping: 'MANAGE', isActive: true, priority: 179 },
  { id: 'team-assignment', name: 'Team Assignment', category: 'social', description: 'Assign tasks to team', providers: ['claude', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 180 },
  // ═══════════════════════════════════════════════════════════════
  // CAST PIPELINES (26 total) - "Make It. Show It. Scale It."
  // ═══════════════════════════════════════════════════════════════
  { id: 'youtube-publisher', name: 'YouTube Publisher', category: 'social', description: 'Publish to YouTube', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 181 },
  { id: 'tiktok-publisher', name: 'TikTok Publisher', category: 'social', description: 'Publish to TikTok', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 182 },
  { id: 'instagram-publisher', name: 'Instagram Publisher', category: 'social', description: 'Publish to Instagram', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 183 },
  { id: 'linkedin-publisher', name: 'LinkedIn Publisher', category: 'social', description: 'Publish to LinkedIn', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 184 },
  { id: 'twitter-publisher', name: 'Twitter Publisher', category: 'social', description: 'Publish to Twitter/X', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 185 },
  { id: 'facebook-publisher', name: 'Facebook Publisher', category: 'social', description: 'Publish to Facebook', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 186 },
  { id: 'wechat-publisher', name: 'WeChat Publisher', category: 'social', description: 'Publish to WeChat', providers: ['alibaba', 'deepseek'], tabMapping: 'PUBLISH', isActive: true, priority: 187 },
  { id: 'douyin-publisher', name: 'Douyin Publisher', category: 'social', description: 'Publish to Douyin', providers: ['alibaba', 'deepseek'], tabMapping: 'PUBLISH', isActive: true, priority: 188 },
  { id: 'multi-platform-publish', name: 'Multi-Platform Publish', category: 'social', description: 'Publish to multiple platforms', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 189 },
  { id: 'embed-generator', name: 'Embed Generator', category: 'social', description: 'Generate embed codes', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 190 },
  { id: 'landing-page-generator', name: 'Landing Page Generator', category: 'marketing_specific', description: 'Generate landing pages', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 191 },
  { id: 'email-campaign-publisher', name: 'Email Campaign Publisher', category: 'marketing_specific', description: 'Publish email campaigns', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 192 },
  { id: 'seo-optimizer', name: 'SEO Optimizer', category: 'marketing_specific', description: 'Optimize for search engines', providers: ['claude', 'gemini', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 193 },
  { id: 'hashtag-generator', name: 'Hashtag Generator', category: 'social', description: 'Generate optimal hashtags', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 194 },
  { id: 'caption-generator', name: 'Caption Generator', category: 'social', description: 'Generate social captions', providers: ['claude', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 195 },
  { id: 'ab-test-generator', name: 'A/B Test Generator', category: 'marketing_specific', description: 'Generate content variations', providers: ['claude', 'openai'], tabMapping: 'PRODUCE', isActive: true, priority: 196 },
  { id: 'cta-optimizer', name: 'CTA Optimizer', category: 'marketing_specific', description: 'Optimize calls-to-action', providers: ['claude', 'openai'], tabMapping: 'PRODUCE', isActive: true, priority: 197 },
  { id: 'audience-analyzer', name: 'Audience Analyzer', category: 'marketing_specific', description: 'Analyze target audience', providers: ['claude', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 198 },
  { id: 'competitor-analyzer', name: 'Competitor Analyzer', category: 'marketing_specific', description: 'Analyze competitor content', providers: ['claude', 'gemini'], tabMapping: 'MANAGE', isActive: true, priority: 199 },
  { id: 'trend-analyzer', name: 'Trend Analyzer', category: 'marketing_specific', description: 'Analyze content trends', providers: ['claude', 'gemini'], tabMapping: 'MANAGE', isActive: true, priority: 200 },
  { id: 'performance-dashboard', name: 'Performance Dashboard', category: 'data_viz', description: 'Content performance metrics', providers: ['claude', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 201 },
  { id: 'engagement-analyzer', name: 'Engagement Analyzer', category: 'data_viz', description: 'Analyze content engagement', providers: ['claude', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 202 },
  { id: 'roi-calculator', name: 'ROI Calculator', category: 'data_viz', description: 'Calculate content ROI', providers: ['claude', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 203 },
  { id: 'conversion-tracker', name: 'Conversion Tracker', category: 'data_viz', description: 'Track conversion metrics', providers: ['claude', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 204 },
  { id: 'analytics-report-generator', name: 'Analytics Report Generator', category: 'data_viz', description: 'Generate analytics reports', providers: ['claude', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 205 },
  { id: 'content-repurposer', name: 'Content Repurposer', category: 'repurposing', description: 'Repurpose content across formats', providers: ['claude', 'gemini', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 206 },
];

// =============================================================================
// 4-ZONE REGIONAL ROUTING CONFIGURATION
// =============================================================================

export const ZONE_ROUTING_CONFIG: Record<RoutingZone, {
  name: string;
  regions: string[];
  primaryLLM: string;
  primaryTTS: string;
  primaryTranslation: string;
  languages: string[];
}> = {
  claude: {
    name: 'Claude Zone (Western/EU/LATAM)',
    regions: ['US', 'UK', 'EU', 'Brazil', 'Israel', 'South Africa', 'LATAM'],
    primaryLLM: 'claude',
    primaryTTS: 'azure',        // Azure Neural PRIMARY — superior Viseme data for lip-sync
    primaryTranslation: 'deepl',
    languages: ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl'],
  },
  alibaba: {
    name: 'Alibaba Zone (CJK/MENA)',
    regions: ['Japan', 'Korea', 'China', 'HK', 'Taiwan', 'MEA'],
    primaryLLM: 'alibaba',
    primaryTTS: 'azure',        // Azure Neural PRIMARY for MENA (7 Arabic dialects); Alibaba Qwen3-TTS SECONDARY for CJK
    primaryTranslation: 'alibaba',
    languages: ['zh', 'ja', 'ko', 'ar', 'he', 'fa'],
  },
  gemini: {
    name: 'Gemini Zone (South Asia/SEA/Africa)',
    regions: ['India', 'Pakistan', 'SEA', 'Africa'],
    primaryLLM: 'gemini',
    primaryTTS: 'azure',        // Azure Neural PRIMARY — consistent Viseme data globally
    primaryTranslation: 'google',
    languages: ['hi', 'bn', 'ur', 'te', 'ta', 'th', 'vi', 'id', 'sw', 'yo'],
  },
  fallback: {
    name: 'Global Fallback',
    regions: ['Other'],
    primaryLLM: 'openai',
    primaryTTS: 'azure',        // Azure Neural PRIMARY — ElevenLabs is NEVER primary (premium clone only)
    primaryTranslation: 'google',
    languages: ['en'],
  },
};

// =============================================================================
// CALCULATED METRICS (Auto-Update on Registry Changes)
// =============================================================================

export const calculateEcosystemMetrics = () => {
  const providers = MASTER_AI_PROVIDERS;
  const styles = MASTER_VIDEO_STYLES;
  const pipelines = MASTER_MARKETING_PIPELINES;

  return {
    // Provider Metrics
    providers: {
      total: providers.length,
      active: providers.filter(p => p.status === 'active').length,
      wiredToGenieCast: providers.filter(p => p.wiredToGenieCast).length,
      notWired: providers.filter(p => !p.wiredToGenieCast).map(p => p.id),
      byTier: {
        primary: providers.filter(p => p.tier === 'primary').length,
        specialized: providers.filter(p => p.tier === 'specialized').length,
        fallback: providers.filter(p => p.tier === 'fallback').length,
      },
      capabilities: [...new Set(providers.flatMap(p => p.capabilities))],
    },

    // Video Style Metrics
    videoStyles: {
      total: styles.length,
      byCategory: Object.entries(
        styles.reduce((acc, s) => {
          acc[s.category] = (acc[s.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ),
      popular: styles.filter(s => s.popular).length,
      new: styles.filter(s => s.new).length,
      premium: styles.filter(s => s.premium).length,
      industries: [...new Set(styles.flatMap(s => s.industries))],
    },

    // Pipeline Metrics
    pipelines: {
      total: pipelines.length,
      active: pipelines.filter(p => p.isActive).length,
      notActive: pipelines.filter(p => !p.isActive).map(p => p.id),
      byTab: {
        CREATE: pipelines.filter(p => p.tabMapping === 'CREATE').length,
        PRODUCE: pipelines.filter(p => p.tabMapping === 'PRODUCE').length,
        MANAGE: pipelines.filter(p => p.tabMapping === 'MANAGE').length,
        PUBLISH: pipelines.filter(p => p.tabMapping === 'PUBLISH').length,
      },
    },

    // Zone Configuration
    zones: Object.keys(ZONE_ROUTING_CONFIG).length,

    // Last Updated
    lastUpdated: new Date().toISOString().split('T')[0],
  };
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Get provider by ID */
export const getProvider = (id: string): AIProviderEntry | undefined => 
  MASTER_AI_PROVIDERS.find(p => p.id === id);

/** Get providers by capability */
export const getProvidersByCapability = (capability: ProviderCapability): AIProviderEntry[] =>
  MASTER_AI_PROVIDERS.filter(p => p.capabilities.includes(capability) && p.status === 'active');

/** Get providers for a specific zone */
export const getProvidersForZone = (zone: RoutingZone): AIProviderEntry[] =>
  MASTER_AI_PROVIDERS.filter(p => p.zones.includes(zone) && p.status === 'active');

/** Get video style by ID */
export const getVideoStyle = (id: VideoStyleId): VideoStyleEntry | undefined =>
  MASTER_VIDEO_STYLES.find(s => s.id === id);

/** Get video styles by category */
export const getVideoStylesByCategory = (category: VideoStyleCategory): VideoStyleEntry[] =>
  MASTER_VIDEO_STYLES.filter(s => s.category === category);

/** Get video styles by industry */
export const getVideoStylesByIndustry = (industry: string): VideoStyleEntry[] =>
  MASTER_VIDEO_STYLES.filter(s => s.industries.includes(industry));

/** Get pipelines by tab */
export const getPipelinesByTab = (tab: 'CREATE' | 'PRODUCE' | 'MANAGE' | 'PUBLISH'): PipelineEntry[] =>
  MASTER_MARKETING_PIPELINES.filter(p => p.tabMapping === tab);

/** Get active pipelines */
export const getActivePipelines = (): PipelineEntry[] =>
  MASTER_MARKETING_PIPELINES.filter(p => p.isActive);

/** Get zone for region */
export const getZoneForRegion = (region: string): RoutingZone => {
  for (const [zone, config] of Object.entries(ZONE_ROUTING_CONFIG)) {
    if (config.regions.includes(region)) {
      return zone as RoutingZone;
    }
  }
  return 'fallback';
};

/** Get providers not wired to Genie Cast (gaps) */
export const getUnwiredProviders = (): AIProviderEntry[] =>
  MASTER_AI_PROVIDERS.filter(p => !p.wiredToGenieCast && p.status === 'active');

/** Get inactive pipelines (gaps) */
export const getInactivePipelines = (): PipelineEntry[] =>
  MASTER_MARKETING_PIPELINES.filter(p => !p.isActive);

// Export calculated metrics
export const ECOSYSTEM_METRICS = calculateEcosystemMetrics();
