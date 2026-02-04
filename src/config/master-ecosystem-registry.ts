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
  // TIER 1: PRIMARY PROVIDERS (Core Infrastructure)
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
    strengths: ['GPT-4o', 'Whisper STT', 'DALL-E 3', 'Sora', 'Function calling'],
    models: ['gpt-4o', 'gpt-4o-mini', 'o3', 'whisper-1', 'tts-1-hd', 'dall-e-3', 'sora-1.0-turbo'],
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
    qualityScore: 92,
    speedScore: 90,
    strengths: ['1M context', 'Native multimodal', 'Fast', 'Veo 3 video'],
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-3-pro-preview'],
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
    models: ['nova-2', 'nova-2-streaming'],
    wiredToGenieCast: true, // Video captioning, STT for voice input
  },
  {
    id: 'sora2api',
    name: 'Sora2API',
    tier: 'primary',
    status: 'active',
    capabilities: ['video_gen'],
    secretKey: 'SORA2API_KEY',
    zones: ['claude', 'fallback'],
    costTier: 'medium',
    qualityScore: 96,
    speedScore: 60,
    strengths: ['Cinematic quality', 'Realistic scenes', 'Film quality', 'Documentary style'],
    models: ['sora-1.0-turbo', 'sora-1.0'],
    wiredToGenieCast: true, // Documentary, micro-drama, narrative styles
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: SPECIALIZED PROVIDERS (Domain Excellence)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'alibaba',
    name: 'Alibaba DashScope',
    tier: 'specialized',
    status: 'active',
    capabilities: ['llm', 'tts', 'stt', 'video_gen', 'avatar', 'lipsync', 'image_gen', 'vision', 'nlp'],
    secretKey: 'ALIBABA_API_KEY',
    zones: ['alibaba'],
    costTier: 'low',
    qualityScore: 88,
    speedScore: 85,
    strengths: ['CJK optimized', 'WAN 2.6 video', 'CosyVoice TTS', 'Paraformer STT', 'Avatar S2V'],
    models: ['qwen-max', 'wan2.6-t2v', 'wan2.2-s2v', 'cosyvoice', 'paraformer'],
    wiredToGenieCast: true,
  },
  {
    id: 'azure',
    name: 'Azure Cognitive Services',
    tier: 'specialized',
    status: 'active',
    capabilities: ['tts', 'stt', 'ocr', 'translation', 'visemes', 'nlp', 'vision'],
    secretKey: 'AZURE_SPEECH_KEY',
    zones: ['gemini', 'claude', 'fallback'],
    costTier: 'medium',
    qualityScore: 92,
    speedScore: 80,
    strengths: ['400+ voices', 'Viseme lip-sync', 'HIPAA compliant', 'Form Recognizer'],
    models: ['neural-tts', 'document-intelligence', 'speech-to-text'],
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
    strengths: ['Most natural TTS', 'Voice cloning', 'Sound effects', 'Music generation'],
    models: ['eleven_multilingual_v2', 'eleven_turbo_v2', 'sound-generation'],
    wiredToGenieCast: true,
  },
  {
    id: 'modelslab',
    name: 'ModelsLab',
    tier: 'specialized',
    status: 'active',
    capabilities: ['image_gen', 'video_gen', '3d_gen', 'music_gen', 'sfx_gen'],
    secretKey: 'MODELSLAB_API_KEY',
    zones: ['claude', 'gemini', 'alibaba', 'fallback'],
    costTier: 'low',
    qualityScore: 88,
    speedScore: 80,
    strengths: ['10,000+ models', 'FLUX Pro', 'AnimateDiff', 'CivitAI integration', 'Low cost'],
    models: ['flux-pro', 'flux-schnell', 'stable-diffusion-xl', 'animatediff'],
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
    strengths: ['High-fidelity 3D', 'PBR textures', 'Auto-rigging', 'USDZ/GLTF export'],
    models: ['meshy-text-to-3d', 'meshy-image-to-3d', 'meshy-text-to-texture'],
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
    strengths: ['Best EU translation', 'Formality control', 'Glossary support'],
    models: ['deepl-pro'],
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
    strengths: ['Timeline-based assembly', 'TTS integration', 'Multi-layer composition'],
    models: ['render-api'],
    wiredToGenieCast: true,
  },
  {
    id: 'vertex_ai',
    name: 'Google Vertex AI',
    tier: 'specialized',
    status: 'active',
    capabilities: ['video_gen', 'image_gen'],
    secretKey: 'GOOGLE_VERTEX_SERVICE_ACCOUNT',
    zones: ['gemini', 'claude', 'fallback'],
    costTier: 'high',
    qualityScore: 96,
    speedScore: 65,
    strengths: ['Veo 3.1 video', 'Imagen 3.0 image', '4K output', 'Long duration'],
    models: ['veo-3.1-generate', 'imagen-3.0-generate-002'],
    wiredToGenieCast: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 3: FALLBACK PROVIDERS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'deepseek',
    name: 'DeepSeek',
    tier: 'fallback',
    status: 'active',
    capabilities: ['llm', 'translation', 'vision', 'nlp'],
    secretKey: 'DEEPSEEK_API_KEY',
    zones: ['alibaba', 'fallback'],
    costTier: 'low',
    qualityScore: 85,
    speedScore: 85,
    strengths: ['Ultra low cost', 'Best Chinese', 'Technical content', 'Code'],
    models: ['deepseek-chat', 'deepseek-coder', 'deepseek-vl'],
    wiredToGenieCast: true, // Alibaba zone fallback LLM, CJK translation
  },
  {
    id: 'replicate',
    name: 'Replicate',
    tier: 'fallback',
    status: 'active',
    capabilities: ['image_gen', 'video_gen', '3d_gen'],
    secretKey: 'REPLICATE_API_TOKEN',
    zones: ['fallback'],
    costTier: 'low',
    qualityScore: 85,
    speedScore: 65,
    strengths: ['Open-source models', 'TripoSR', 'SVD', 'Pay-per-use'],
    models: ['flux-schnell', 'stable-video-diffusion', 'triposr'],
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
    strengths: ['249+ languages', 'Document AI', 'Cloud Vision', 'WaveNet'],
    models: ['google-translate', 'cloud-vision', 'cloud-tts'],
    wiredToGenieCast: true,
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    tier: 'fallback',
    status: 'fallback',
    capabilities: ['llm', 'image_gen', 'nlp'],
    secretKey: 'HUGGINGFACE_TOKEN',
    zones: ['fallback'],
    costTier: 'free',
    qualityScore: 75,
    speedScore: 60,
    strengths: ['Open source', 'Free tier', 'Customizable', 'Privacy'],
    models: ['FLUX.1-schnell', 'mistral-7b', 'llama-3'],
    wiredToGenieCast: true, // Free tier fallback, FLUX.1-schnell for images
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
// MARKETING PIPELINES (25 Marketing-Specific + Integration)
// =============================================================================

export const MASTER_MARKETING_PIPELINES: PipelineEntry[] = [
  // CREATE Tab Pipelines
  { id: 'social-post-generator', name: 'Social Post Generator', category: 'marketing_specific', description: 'Generate social media posts from content', providers: ['openai', 'claude'], tabMapping: 'CREATE', isActive: true, priority: 1 },
  { id: 'carousel-to-video', name: 'Carousel to Video', category: 'marketing_specific', description: 'Convert carousel posts to video format', providers: ['modelslab', 'alibaba'], tabMapping: 'CREATE', isActive: false, priority: 2 },
  { id: 'text-to-sfx', name: 'Text to SFX', category: 'marketing_specific', description: 'Generate sound effects from descriptions', providers: ['elevenlabs', 'modelslab'], tabMapping: 'CREATE', isActive: false, priority: 3 },
  { id: 'brand-asset-generator', name: 'Brand Asset Generator', category: 'marketing_specific', description: 'Generate brand visual assets', providers: ['modelslab', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 4 },
  { id: 'hook-generator', name: 'Hook Generator', category: 'marketing_specific', description: 'Create attention-grabbing hooks', providers: ['claude', 'openai'], tabMapping: 'CREATE', isActive: true, priority: 5 },
  
  // PRODUCE Tab Pipelines
  { id: 'ad-generator', name: 'Ad Generator', category: 'marketing_base', description: 'Create advertising content', providers: ['modelslab', 'vertex-ai'], tabMapping: 'PRODUCE', isActive: true, priority: 1 },
  { id: 'email-campaign-generator', name: 'Email Campaign Generator', category: 'marketing_specific', description: 'Generate email marketing campaigns', providers: ['claude', 'openai'], tabMapping: 'PRODUCE', isActive: true, priority: 2 },
  { id: 'competitor-to-comparison', name: 'Competitor to Comparison', category: 'marketing_specific', description: 'Create competitor comparison videos', providers: ['claude', 'vertex-ai'], tabMapping: 'PRODUCE', isActive: false, priority: 3 },
  { id: 'case-study-to-video', name: 'Case Study to Video', category: 'marketing_specific', description: 'Transform case studies into videos', providers: ['vertex-ai', 'alibaba'], tabMapping: 'PRODUCE', isActive: false, priority: 4 },
  { id: 'testimonial-to-video', name: 'Testimonial to Video', category: 'marketing_specific', description: 'Convert testimonials to video format', providers: ['alibaba', 'modelslab'], tabMapping: 'PRODUCE', isActive: false, priority: 5 },
  { id: 'video-dubbing', name: 'Video Dubbing', category: 'marketing_specific', description: 'Multi-language video dubbing', providers: ['elevenlabs', 'azure'], tabMapping: 'PRODUCE', isActive: false, priority: 6 },
  { id: 'script-to-video', name: 'Script to Video', category: 'marketing_specific', description: 'Convert scripts to complete videos', providers: ['vertex-ai', 'modelslab'], tabMapping: 'PRODUCE', isActive: true, priority: 7 },
  
  // MANAGE Tab Pipelines
  { id: 'video-shorts', name: 'Video Shorts', category: 'marketing_specific', description: 'Generate short-form content from long videos', providers: ['modelslab', 'gemini'], tabMapping: 'MANAGE', isActive: false, priority: 1 },
  { id: 'video-thumbnail', name: 'Video Thumbnail', category: 'marketing_specific', description: 'Auto-generate video thumbnails', providers: ['modelslab', 'openai'], tabMapping: 'MANAGE', isActive: false, priority: 2 },
  { id: 'video-captioning', name: 'Video Captioning', category: 'marketing_specific', description: 'Add captions and subtitles', providers: ['deepgram', 'azure'], tabMapping: 'MANAGE', isActive: false, priority: 3 },
  { id: 'video-enhance', name: 'Video Enhance', category: 'marketing_specific', description: 'AI video enhancement and upscaling', providers: ['replicate', 'modelslab'], tabMapping: 'MANAGE', isActive: false, priority: 4 },
  { id: 'content-repurposer', name: 'Content Repurposer', category: 'repurposing', description: 'Repurpose content across formats', providers: ['claude', 'gemini'], tabMapping: 'MANAGE', isActive: true, priority: 5 },
  { id: 'analytics-report-generator', name: 'Analytics Report Generator', category: 'marketing_specific', description: 'Generate performance reports', providers: ['claude', 'openai'], tabMapping: 'MANAGE', isActive: true, priority: 6 },
  
  // PUBLISH Tab Pipelines
  { id: 'landing-page-generator', name: 'Landing Page Generator', category: 'marketing_specific', description: 'Generate landing page content', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 1 },
  { id: 'event-to-promo', name: 'Event to Promo', category: 'marketing_specific', description: 'Create event promotional content', providers: ['modelslab', 'vertex-ai'], tabMapping: 'PUBLISH', isActive: false, priority: 2 },
  { id: 'social-scheduler', name: 'Social Scheduler', category: 'marketing_specific', description: 'Schedule and optimize social posts', providers: ['openai', 'claude'], tabMapping: 'PUBLISH', isActive: true, priority: 3 },
  { id: 'seo-optimizer', name: 'SEO Optimizer', category: 'marketing_specific', description: 'Optimize content for search engines', providers: ['claude', 'gemini'], tabMapping: 'PUBLISH', isActive: true, priority: 4 },
  { id: 'distribution-optimizer', name: 'Distribution Optimizer', category: 'marketing_specific', description: 'Optimize content distribution', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 5 },
  { id: 'ab-test-generator', name: 'A/B Test Generator', category: 'marketing_specific', description: 'Generate content variations for testing', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: false, priority: 6 },
  { id: 'press-release-generator', name: 'Press Release Generator', category: 'marketing_specific', description: 'Generate press releases', providers: ['claude', 'openai'], tabMapping: 'PUBLISH', isActive: true, priority: 7 },
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
    name: 'Claude Zone (Western)',
    regions: ['US', 'UK', 'EU', 'Brazil', 'Israel', 'South Africa'],
    primaryLLM: 'claude',
    primaryTTS: 'elevenlabs',
    primaryTranslation: 'deepl',
    languages: ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl'],
  },
  alibaba: {
    name: 'Alibaba Zone (CJK/MENA)',
    regions: ['Japan', 'Korea', 'China', 'HK', 'Taiwan', 'MEA'],
    primaryLLM: 'alibaba',
    primaryTTS: 'alibaba',
    primaryTranslation: 'alibaba',
    languages: ['zh', 'ja', 'ko', 'ar', 'he', 'fa'],
  },
  gemini: {
    name: 'Gemini Zone (South Asia/SEA/Africa)',
    regions: ['India', 'Pakistan', 'SEA', 'Africa'],
    primaryLLM: 'gemini',
    primaryTTS: 'azure',
    primaryTranslation: 'google',
    languages: ['hi', 'bn', 'ur', 'te', 'ta', 'th', 'vi', 'id', 'sw', 'yo'],
  },
  fallback: {
    name: 'Global Fallback',
    regions: ['Other'],
    primaryLLM: 'openai',
    primaryTTS: 'elevenlabs',
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
