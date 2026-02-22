/**
 * UNIFIED COMPOSITION STUDIO TYPES
 *
 * Types for flexible mix-and-match content generation:
 * - Chapter-based composition (each chapter can have different elements)
 * - Scene-level creative freedom: each scene can have its own style, layers, B-roll
 * - Multi-output: one project → video + podcast + slides + shorts simultaneously
 * - Multi-language support
 * - Preview system
 * - Extended publishing destinations (YouTube, LinkedIn, TikTok, etc.)
 * - AI recommendations that SUGGEST but NEVER restrict user choices
 */

export type CompositionElementType =
  | 'video'           // Pure AI-generated video
  | 'avatar'          // AI avatar (talking head)
  | '3d'              // 3D model/scene
  | 'animation'       // Animated graphics/kinetic typography
  | 'static'          // Static image/slide
  | 'screen_recording'// Screen capture
  | 'cinematic'       // Cinematic film-quality video
  | 'vr_360'          // VR/360-degree immersive
  | 'ar_overlay'      // AR overlay / spatial
  | 'broll'           // B-roll / stock footage
  | 'slide'           // Presentation slide
  | 'custom';         // User uploaded

export type VoiceoverType =
  | 'none'            // No voiceover
  | 'tts'             // Text-to-speech
  | 'voice_clone'     // Cloned voice
  | 'recorded'        // User recorded
  | 'lipsync';        // Lip-synced to avatar

export type AvatarStyle = 
  | 'professional_western'
  | 'professional_mena'
  | 'professional_cjk'
  | 'professional_south_asian'
  | 'professional_latam'
  | 'casual'
  | 'custom';

export type Resolution = '720p' | '1080p' | '4k';

// Extended publishing destinations
export type PublishingDestination =
  | 'landing_page'     // Main website landing
  | 'website'          // General website
  | 'blog'             // Blog post embed
  | 'youtube'          // YouTube
  | 'linkedin'         // LinkedIn Personal
  | 'linkedin_company' // LinkedIn Company Page
  | 'facebook'         // Facebook
  | 'instagram'        // Instagram (Reels/Stories)
  | 'tiktok'           // TikTok
  | 'twitter'          // Twitter/X
  | 'download'         // Direct download
  | 'storage'          // Cloud storage only
  | 'multi_platform';  // Multi-platform distribution (all connected)

export interface PublishingPlatformConfig {
  id: PublishingDestination;
  label: string;
  icon: string;
  supportsVideo: boolean;
  supportedAspectRatios: string[];
  maxDuration?: number; // in seconds
  requiresAuth: boolean;
  category: 'website' | 'social' | 'local';
}

export const PUBLISHING_PLATFORMS: PublishingPlatformConfig[] = [
  // Website destinations
  { id: 'landing_page', label: 'Landing Page', icon: 'Globe', supportsVideo: true, supportedAspectRatios: ['16:9', '1:1'], requiresAuth: false, category: 'website' },
  { id: 'website', label: 'Website', icon: 'Layout', supportsVideo: true, supportedAspectRatios: ['16:9', '1:1', '4:3'], requiresAuth: false, category: 'website' },
  { id: 'blog', label: 'Blog', icon: 'FileText', supportsVideo: true, supportedAspectRatios: ['16:9'], requiresAuth: false, category: 'website' },
  
  // Social platforms
  { id: 'youtube', label: 'YouTube', icon: 'Youtube', supportsVideo: true, supportedAspectRatios: ['16:9', '9:16'], maxDuration: 3600, requiresAuth: true, category: 'social' },
  { id: 'linkedin', label: 'LinkedIn Personal', icon: 'Linkedin', supportsVideo: true, supportedAspectRatios: ['16:9', '1:1', '9:16'], maxDuration: 600, requiresAuth: true, category: 'social' },
  { id: 'linkedin_company', label: 'LinkedIn Company', icon: 'Building2', supportsVideo: true, supportedAspectRatios: ['16:9', '1:1', '9:16'], maxDuration: 600, requiresAuth: true, category: 'social' },
  { id: 'facebook', label: 'Facebook', icon: 'Facebook', supportsVideo: true, supportedAspectRatios: ['16:9', '1:1', '9:16'], maxDuration: 240, requiresAuth: true, category: 'social' },
  { id: 'instagram', label: 'Instagram', icon: 'Instagram', supportsVideo: true, supportedAspectRatios: ['1:1', '9:16', '4:5'], maxDuration: 90, requiresAuth: true, category: 'social' },
  { id: 'tiktok', label: 'TikTok', icon: 'Music2', supportsVideo: true, supportedAspectRatios: ['9:16'], maxDuration: 180, requiresAuth: true, category: 'social' },
  { id: 'twitter', label: 'Twitter/X', icon: 'Twitter', supportsVideo: true, supportedAspectRatios: ['16:9', '1:1'], maxDuration: 140, requiresAuth: true, category: 'social' },
  
  // Local/storage
  { id: 'download', label: 'Download', icon: 'Download', supportsVideo: true, supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3'], requiresAuth: false, category: 'local' },
  { id: 'storage', label: 'Cloud Storage', icon: 'Cloud', supportsVideo: true, supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3'], requiresAuth: false, category: 'local' },
  { id: 'multi_platform', label: 'Multi-Platform', icon: 'Grid', supportsVideo: true, supportedAspectRatios: ['16:9', '9:16', '1:1'], requiresAuth: true, category: 'social' },
];

// ─── Scene-Level Creative Freedom Types ──────────────────────────────────────

/** Visual style presets — user picks any, AI recommends but never restricts */
export type SceneStyle =
  | 'cinematic'        // Film-quality, widescreen, dramatic lighting
  | 'corporate'        // Clean, professional, minimal
  | 'playful'          // Bright colors, dynamic, energetic
  | 'documentary'      // Authentic, raw, interview-style
  | 'minimalist'       // White space, typography-focused
  | 'retro'            // Vintage aesthetics, film grain
  | 'futuristic'       // Sci-fi, holographic, neon
  | 'hand_drawn'       // Sketch, whiteboard, illustration
  | 'collage'          // Mixed media, layered elements
  | 'street'           // Urban, gritty, authentic
  | 'luxury'           // Premium, gold accents, slow motion
  | 'cultural'         // Region-specific visual language
  | 'custom';          // User-defined style prompt

/** B-roll configuration for a scene */
export interface SceneBRoll {
  id: string;
  source: 'stock' | 'ai_generated' | 'uploaded' | 'screen_capture';
  url?: string;
  prompt?: string;           // For AI-generated B-roll
  searchQuery?: string;      // For stock footage search
  provider?: 'pexels' | 'unsplash' | 'storyblocks' | 'ai';
  startTime?: number;        // Overlay start (seconds into scene)
  endTime?: number;          // Overlay end
  position?: 'fullscreen' | 'pip_topleft' | 'pip_topright' | 'pip_bottomleft' | 'pip_bottomright' | 'split_left' | 'split_right';
  opacity?: number;          // 0-1
  volume?: number;           // 0-1 (if b-roll has audio)
}

/** A single visual layer within a scene (scenes can have multiple layers) */
export interface SceneVisualLayer {
  id: string;
  order: number;             // Layer stacking order (0 = bottom)
  type: CompositionElementType;
  config: ChapterVisual;     // Reuses existing visual config
  opacity?: number;          // Layer opacity 0-1
  blendMode?: 'normal' | 'overlay' | 'multiply' | 'screen';
  startTime?: number;        // When this layer appears (seconds into scene)
  endTime?: number;          // When this layer disappears
  position?: 'full' | 'left' | 'right' | 'top' | 'bottom' | 'pip';
}

/** Output format variant — one scene can produce multiple outputs */
export type SceneOutputFormat =
  | 'video_16_9'      // Standard landscape video
  | 'video_9_16'      // Vertical (TikTok, Reels, Shorts)
  | 'video_1_1'       // Square (Instagram, LinkedIn)
  | 'video_4_5'       // Portrait (Instagram feed)
  | 'audio_only'      // Extract audio track only
  | 'slide_image'     // Static slide export
  | 'thumbnail'       // Thumbnail frame extraction
  | 'audiogram'       // Waveform animation + audio
  | 'gif'             // Animated GIF excerpt
  | '3d_model'        // 3D model file export
  | 'vr_scene'        // VR-ready scene export
  | 'ar_asset';       // AR-ready asset export

/** Scene-level style variant — same content, different visual treatment */
export interface SceneStyleVariant {
  id: string;
  name: string;
  style: SceneStyle;
  stylePrompt?: string;      // Custom style prompt override
  colorPalette?: string[];   // Scene-specific brand colors
  fontFamily?: string;
  musicMood?: string;        // Music mood override for this variant
  previewUrl?: string;       // Generated preview for this variant
  isSelected?: boolean;      // Whether this is the active variant
}

/** Extended chapter with scene-level creative freedom */
export interface CompositionScene extends CompositionChapter {
  // Multi-layer visual composition
  visualLayers?: SceneVisualLayer[];

  // B-roll overlays
  bRoll?: SceneBRoll[];

  // Per-scene style (overrides project-level)
  sceneStyle?: SceneStyle;
  stylePrompt?: string;

  // Style variants — user can generate multiple looks and pick
  styleVariants?: SceneStyleVariant[];

  // Per-scene output format overrides (e.g., this scene vertical, next landscape)
  outputFormats?: SceneOutputFormat[];

  // Scene-level transcreation overrides
  transcreationOverrides?: {
    regionCode?: string;
    wardrobeStyle?: string;
    companionStyle?: string;
    musicGenre?: string;
    settingDescription?: string;
    culturalNotes?: string;
  };

  // Thumbnail config for this scene
  thumbnailConfig?: {
    autoGenerate: boolean;
    customUrl?: string;
    frameTimestamp?: number;   // Specific frame to use
    style?: 'text_overlay' | 'clean' | 'branded';
    textOverlay?: string;
  };

  // Caption/subtitle overrides per scene
  captionOverrides?: {
    enabled: boolean;
    style?: 'standard' | 'karaoke' | 'animated' | 'minimal';
    position?: 'bottom' | 'top' | 'center';
    fontSize?: 'small' | 'medium' | 'large';
  };

  // Whether this scene should be extractable as a standalone clip
  isClipCandidate?: boolean;
  clipMetadata?: {
    suggestedPlatforms: string[];
    viralScore?: number;
    hookStrength?: number;
  };

  // Version history for this scene
  versionHistory?: Array<{
    id: string;
    timestamp: string;
    changeType: 'script' | 'visual' | 'audio' | 'style' | 'broll' | 'full';
    previousState: Partial<CompositionScene>;
    description: string;
  }>;
}

/** Multi-output project configuration */
export interface MultiOutputConfig {
  /** Enabled output formats for this project */
  enabledOutputs: SceneOutputFormat[];

  /** Per-format settings */
  formatSettings: Record<string, {
    resolution?: Resolution;
    aspectRatio?: string;
    maxDuration?: number;
    includeScenes?: string[];  // Scene IDs to include (subset)
    excludeScenes?: string[];  // Scene IDs to exclude
  }>;

  /** Whether to generate all formats simultaneously */
  parallelGeneration: boolean;
}

/** AI recommendation (suggests, never restricts) */
export interface SceneRecommendation {
  id: string;
  type: 'style' | 'broll' | 'duration' | 'transition' | 'music' | 'format' | 'caption' | 'thumbnail' | 'clip' | 'reorder' | 'add_scene' | 'transcreation';
  sceneId?: string;
  title: string;
  description: string;
  confidence: number;         // 0-1 how confident the AI is
  reason: string;             // Why this is recommended
  action: Record<string, unknown>;  // Data to apply if accepted
  dismissed?: boolean;        // User can dismiss
  applied?: boolean;          // User accepted
}

export interface ChapterVoiceover {
  type: VoiceoverType;
  text: string;
  language: string;
  voiceId?: string;
  voiceProvider?: 'elevenlabs' | 'azure' | 'alibaba' | 'google';
  audioUrl?: string;
  audioBase64?: string;
  duration?: number;
  
  // Speed control
  speed?: 'slow' | 'normal' | 'fast';
  
  // For uploaded recordings
  uploadedAudioUrl?: string;
  uploadedFileName?: string;
  
  // For voice cloning
  voiceCloneSampleUrl?: string;
  voiceCloneSampleName?: string;
}

export interface ChapterVisual {
  type: CompositionElementType;
  
  // For video/animation
  prompt?: string;
  videoUrl?: string;
  
  // For avatar
  avatarStyle?: AvatarStyle;
  avatarModel?: string;
  enableLipSync?: boolean;
  
  // For 3D
  meshPrompt?: string;
  modelUrl?: string;
  
  // For static
  imageUrl?: string;
  
  // Common
  duration?: number;
  transitionIn?: 'fade' | 'slide' | 'zoom' | 'none';
  transitionOut?: 'fade' | 'slide' | 'zoom' | 'none';
}

export interface ChapterBackgroundMusic {
  enabled: boolean;
  source?: 'generate' | 'upload';
  genre?: string;
  volume?: number;
  prompt?: string;
  uploadedUrl?: string;
  uploadedFileName?: string;
}

export interface ChapterSFX {
  enabled: boolean;
  prompt?: string;
  audioUrl?: string;
}

export interface CompositionChapter {
  id: string;
  order: number;
  title: string;
  duration: number; // in seconds
  
  // Visual layer (what you see)
  visual: ChapterVisual;
  
  // Audio layer (what you hear)
  voiceover: ChapterVoiceover;
  backgroundMusic?: ChapterBackgroundMusic;
  sfx?: ChapterSFX;
  
  // Generation state
  status: 'draft' | 'generating' | 'complete' | 'error';
  progress?: number;
  error?: string;
  
  // Preview URLs per language
  previewUrls: Record<string, string>;
}

export interface CompositionProject {
  id: string;
  name: string;
  description?: string;

  // Target configuration
  targetLanguages: string[];
  primaryLanguage: string;
  resolution: Resolution;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';

  // Chapters (backward-compatible) — use `scenes` for new scene-level features
  chapters: CompositionChapter[];

  // Scenes with full creative freedom (superset of chapters)
  scenes?: CompositionScene[];

  // Global settings
  globalSettings: {
    defaultAvatarStyle?: AvatarStyle;
    defaultVoiceProvider?: string;
    defaultSceneStyle?: SceneStyle;
    brandColors?: string[];
    logoUrl?: string;
    watermarkEnabled?: boolean;
  };

  // Multi-output configuration
  multiOutput?: MultiOutputConfig;

  // Output destinations - now supports multiple
  destination: PublishingDestination;
  destinations?: PublishingDestination[];
  placement?: string; // For landing page (hero, product_demo, etc.)

  // AI recommendations (suggest, never restrict)
  recommendations?: SceneRecommendation[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'draft' | 'in_progress' | 'ready' | 'published';

  // Publishing history
  publishedAt?: Date;
  publishedTo?: PublishingDestination[];
  publishedUrls?: Record<PublishingDestination, string>;
}

// For ContentLibrary - saved compositions
export interface SavedComposition extends CompositionProject {
  thumbnailUrl?: string;
  viewCount?: number;
  lastPublished?: Date;
}

export interface LanguageConfig {
  code: string;
  name: string;
  zone: 'West/EU' | 'MENA' | 'India/SEA' | 'CJK' | 'Africa' | 'Fallback';
  voiceProvider: 'elevenlabs' | 'azure' | 'alibaba' | 'google';
  defaultVoiceId: string;
  isRTL: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', zone: 'West/EU', voiceProvider: 'elevenlabs', defaultVoiceId: 'rachel', isRTL: false },
  { code: 'es', name: 'Spanish', zone: 'West/EU', voiceProvider: 'elevenlabs', defaultVoiceId: 'matilda', isRTL: false },
  { code: 'fr', name: 'French', zone: 'West/EU', voiceProvider: 'elevenlabs', defaultVoiceId: 'charlotte', isRTL: false },
  { code: 'de', name: 'German', zone: 'West/EU', voiceProvider: 'azure', defaultVoiceId: 'de-DE-ConradNeural', isRTL: false },
  { code: 'pt', name: 'Portuguese', zone: 'West/EU', voiceProvider: 'azure', defaultVoiceId: 'pt-BR-AntonioNeural', isRTL: false },
  { code: 'ar', name: 'Arabic', zone: 'MENA', voiceProvider: 'azure', defaultVoiceId: 'ar-SA-HamedNeural', isRTL: true },
  { code: 'hi', name: 'Hindi', zone: 'India/SEA', voiceProvider: 'azure', defaultVoiceId: 'hi-IN-MadhurNeural', isRTL: false },
  { code: 'zh', name: 'Chinese', zone: 'CJK', voiceProvider: 'alibaba', defaultVoiceId: 'zhixiaobai', isRTL: false },
  { code: 'ja', name: 'Japanese', zone: 'CJK', voiceProvider: 'alibaba', defaultVoiceId: 'sicheng', isRTL: false },
  { code: 'ko', name: 'Korean', zone: 'CJK', voiceProvider: 'azure', defaultVoiceId: 'ko-KR-InJoonNeural', isRTL: false },
  { code: 'ru', name: 'Russian', zone: 'West/EU', voiceProvider: 'azure', defaultVoiceId: 'ru-RU-DmitryNeural', isRTL: false },
  { code: 'id', name: 'Indonesian', zone: 'India/SEA', voiceProvider: 'azure', defaultVoiceId: 'id-ID-ArdiNeural', isRTL: false },
  { code: 'vi', name: 'Vietnamese', zone: 'India/SEA', voiceProvider: 'azure', defaultVoiceId: 'vi-VN-NamMinhNeural', isRTL: false },
  { code: 'th', name: 'Thai', zone: 'India/SEA', voiceProvider: 'azure', defaultVoiceId: 'th-TH-NiwatNeural', isRTL: false },
];

export const ELEMENT_PROVIDERS: Record<CompositionElementType, string[]> = {
  video: ['ModelsLab', 'Alibaba Wan2.2', 'Replicate'],
  avatar: ['Alibaba OmniAvatar', 'Alibaba Wan2.2-S2V', 'Alibaba TaoAvatar'],
  '3d': ['Meshy AI', 'ModelsLab 3D', 'Alibaba 3D Generator'],
  animation: ['ModelsLab AnimateDiff', 'Alibaba Wan2.2-Animate'],
  static: ['FLUX', 'DALL-E 3'],
  cinematic: ['Veo3', 'Alibaba Wan2.6', 'ModelsLab'],
  vr_360: ['ModelsLab 360', 'Replicate'],
  ar_overlay: ['Alibaba AR', 'ModelsLab'],
  broll: ['Pexels', 'Unsplash', 'Storyblocks', 'AI Generated'],
  slide: ['Google Slides', 'PowerPoint', 'AI Generated'],
  screen_recording: ['Native'],
  custom: ['User Upload'],
};

export const DEFAULT_CHAPTERS: Omit<CompositionChapter, 'id'>[] = [
  {
    order: 1,
    title: 'Opening',
    duration: 30,
    visual: { type: 'animation', prompt: 'Magical genie lamp emerging from smoke' },
    voiceover: { type: 'tts', text: 'Welcome to Genie Suite...', language: 'en' },
    status: 'draft',
    previewUrls: {},
  },
  {
    order: 2,
    title: 'Product Overview',
    duration: 45,
    visual: { type: 'avatar', avatarStyle: 'professional_western', enableLipSync: true },
    voiceover: { type: 'lipsync', text: 'Let me show you what Genie can do...', language: 'en' },
    status: 'draft',
    previewUrls: {},
  },
  {
    order: 3,
    title: 'Feature Showcase',
    duration: 60,
    visual: { type: '3d', meshPrompt: 'Holographic interface with floating product icons' },
    voiceover: { type: 'tts', text: 'Explore our powerful features...', language: 'en' },
    status: 'draft',
    previewUrls: {},
  },
  {
    order: 4,
    title: 'Call to Action',
    duration: 20,
    visual: { type: 'video', prompt: 'Cinematic brand outro with logo reveal' },
    voiceover: { type: 'tts', text: 'Start your journey today...', language: 'en' },
    status: 'draft',
    previewUrls: {},
  },
];
