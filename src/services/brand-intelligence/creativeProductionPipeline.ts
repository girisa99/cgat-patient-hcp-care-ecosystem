/**
 * Universal Creative Production Pipeline
 *
 * Standardizes ALL content production across GenieSuite — from a simple text prompt
 * to a full cinematic production. Handles every input combination:
 *   - Text → AI images/video
 *   - Image → AI-enhanced or AI-generated variations
 *   - Video → AI-enhanced, re-narrated, or style-transferred
 *   - URL → scraped, narrated, visualized
 *   - Screenshot → original, AI-enhanced, or fully AI-replaced
 *   - Any combination of the above
 *
 * User always has the choice:
 *   1. Use original asset as-is
 *   2. Enhance original with AI (upscale, color grade, animate, add effects)
 *   3. Generate fully new AI asset inspired by original
 *   4. Mix: some scenes original, some enhanced, some AI-generated
 *
 * Works for: product demos, marketing videos, walkthroughs, tutorials,
 * training content, social media, presentations — any use case.
 */

// ─── Input Types ─────────────────────────────────────────────────────────────
// Every possible input a user can provide to start a production.

export type InputSourceType =
  | 'text'              // Plain text prompt, script, or description
  | 'image'             // Single image (photo, screenshot, design)
  | 'image_sequence'    // Multiple images in order (storyboard, slides)
  | 'video'             // Existing video file
  | 'audio'             // Voice recording, music, narration
  | 'url'               // Web page to capture/scrape
  | 'screenshot'        // App/product screenshot
  | 'presentation'      // PPT/PDF slides
  | 'document'          // PDF, Word doc, text file
  | 'brand_assets'      // Logo, brand colors, fonts package
  | 'data'              // CSV, JSON, spreadsheet for data visualization
  | 'mixed';            // Combination of above

export interface PipelineInput {
  id: string;
  type: InputSourceType;
  source: string;                    // URL, file path, or inline content
  metadata: {
    title?: string;
    description?: string;
    language?: string;
    duration?: number;               // seconds, for audio/video
    dimensions?: { width: number; height: number };
    mimeType?: string;
    fileSize?: number;
  };
  processingHints: {
    isProductScreenshot?: boolean;    // Triggers product demo pipeline
    isMarketingAsset?: boolean;      // Triggers brand-aware processing
    containsText?: boolean;          // Text extraction needed
    containsFaces?: boolean;         // Face detection for avatars
    containsUI?: boolean;            // UI element detection for walkthroughs
    isConfidential?: boolean;        // Don't send to external APIs
  };
  userPreference: AssetHandling;     // How user wants this input treated
}

// ─── Asset Handling ──────────────────────────────────────────────────────────
// The user's choice for how each asset is processed.

export type AssetHandling =
  | 'original'          // Use exactly as-is, no AI modification
  | 'enhance'           // AI-enhance the original (upscale, color, effects)
  | 'ai_generate'       // Generate entirely new AI asset inspired by this
  | 'hybrid'            // Mix: use original as base, overlay AI elements
  | 'auto';             // Let the pipeline decide based on quality/context

export interface AssetEnhancementOptions {
  // For images
  upscale?: boolean;                 // AI upscale resolution
  upscaleTarget?: '2x' | '4x' | '8x';
  colorGrade?: boolean;              // AI color correction
  colorGradeStyle?: string;          // 'cinematic', 'vibrant', 'muted', 'brand_match'
  removeBackground?: boolean;
  addMotion?: boolean;               // Image-to-video (subtle motion)
  motionStyle?: 'ken_burns' | 'parallax' | 'gentle_zoom' | 'pan' | 'float';
  styleTransfer?: string;            // 'pixar', 'disney', 'anime', 'watercolor', etc.

  // For video
  stabilize?: boolean;
  deNoise?: boolean;
  frameInterpolation?: boolean;      // Smooth slow-mo
  relight?: boolean;                 // AI relighting
  addSubtitles?: boolean;
  addOverlays?: boolean;             // Brand watermark, lower thirds
  speedAdjust?: number;              // 0.5x to 2x

  // For screenshots
  annotate?: boolean;                // Auto-detect UI elements, add callouts
  animateUI?: boolean;               // Animate clicks, scrolls, transitions
  addCursor?: boolean;               // Simulated cursor movement
  highlightElements?: string[];      // CSS selectors or region descriptions to highlight
  deviceFrame?: 'none' | 'iphone' | 'android' | 'macbook' | 'browser' | 'tablet';

  // For text
  visualize?: boolean;               // Convert text to visual (infographic, slides)
  narrate?: boolean;                 // Generate voiceover from text
  illustrate?: boolean;              // Generate illustrations for text

  // For URLs
  captureMode?: 'screenshot' | 'scroll_capture' | 'video_recording' | 'extract_content';
  captureDelay?: number;             // Wait for page load
  captureViewport?: { width: number; height: number };
}

// ─── Output Specification ────────────────────────────────────────────────────

export type OutputFormat =
  | 'video_mp4'         // Standard video
  | 'video_webm'        // Web-optimized video
  | 'gif'               // Animated GIF
  | 'image_sequence'    // Frame sequence (PNG/JPG)
  | 'presentation'      // PPT/Google Slides
  | 'social_reel'       // Vertical 9:16 short-form
  | 'social_story'      // 15-sec story format
  | 'social_post'       // Square 1:1
  | 'banner'            // Wide format for ads
  | 'thumbnail'         // Thumbnail image
  | 'audio_only'        // Narration/podcast
  | 'interactive';      // HTML5 interactive

export type AspectRatio =
  | '16:9'    // Landscape (YouTube, presentations)
  | '9:16'    // Vertical (Reels, TikTok, Stories)
  | '1:1'     // Square (Instagram, LinkedIn)
  | '4:3'     // Classic (presentations)
  | '21:9'    // Ultra-wide (cinematic)
  | '4:5'     // Portrait (Facebook, Instagram)
  | 'custom';

export type QualityTier =
  | 'preview'       // Fast, low-res, for review (5-15 sec generation)
  | 'standard'      // Good quality for most uses (30-60 sec)
  | 'production'    // High quality for final delivery (2-5 min)
  | 'cinematic';    // Maximum quality, broadcast-ready (10-30 min)

export interface OutputSpec {
  format: OutputFormat;
  aspectRatio: AspectRatio;
  resolution: { width: number; height: number };
  quality: QualityTier;
  fps: 24 | 30 | 60;
  maxDuration?: number;              // seconds
  codec?: string;
  bitrate?: string;
  deliverables: OutputDeliverable[];
}

export interface OutputDeliverable {
  platform: string;                  // 'youtube', 'instagram', 'linkedin', 'whatsapp', 'website', 'email'
  format: OutputFormat;
  aspectRatio: AspectRatio;
  maxFileSize?: string;              // '25MB', '100MB'
  autoResize: boolean;
  addWatermark: boolean;
}

// ─── Scene Architecture ──────────────────────────────────────────────────────
// Every production is a sequence of scenes. Each scene can mix original + AI content.

export interface ProductionScene {
  id: string;
  order: number;
  title: string;
  description: string;

  // Timing
  duration: { min: number; target: number; max: number }; // seconds
  transitionIn: TransitionType;
  transitionOut: TransitionType;

  // Input layer — what the user provided for this scene
  inputs: SceneInput[];

  // Visual layer — what we generate/show
  visual: SceneVisualSpec;

  // Audio layer — narration, music, SFX
  audio: SceneAudioSpec;

  // Text overlay layer — titles, captions, callouts
  textOverlays: SceneTextOverlay[];

  // User control
  userApproval: 'auto' | 'review_required' | 'approved' | 'rejected';
  userNotes?: string;

  // Generation status
  status: 'planned' | 'generating' | 'review' | 'approved' | 'rendering' | 'complete' | 'failed';
  generatedAssets: GeneratedAsset[];
}

export interface SceneInput {
  inputId: string;                   // Reference to PipelineInput
  handling: AssetHandling;
  enhancement: AssetEnhancementOptions;
  cropRegion?: { x: number; y: number; w: number; h: number };
  startTime?: number;                // For video/audio inputs
  endTime?: number;
}

export interface SceneVisualSpec {
  primarySource: 'user_input' | 'ai_generated' | 'hybrid' | 'screen_recording' | 'animation';
  style: string;                     // References CreativeStyleFamily
  aiGenerationPrompt?: string;       // For fully AI-generated visuals
  characterSpecs?: CharacterInScene[];
  backgroundSpec?: string;
  lightingMood?: string;
  cameraMovement?: 'static' | 'pan' | 'zoom_in' | 'zoom_out' | 'orbit' | 'tracking' | 'dolly';
  colorGrading?: string;
}

export interface CharacterInScene {
  characterId: string;               // Reference to character from CreativeStylesRegistry
  action: string;                    // "talking", "pointing", "walking", "reacting"
  expression: string;                // "happy", "surprised", "explaining", "laughing"
  position: 'left' | 'center' | 'right' | 'background';
  lipSync: boolean;                  // Sync mouth to narration
  dialogue?: string;
}

export interface SceneAudioSpec {
  narration?: {
    text: string;
    voice: string;                   // Voice ID
    language: string;
    speed: number;
    emotion: string;                 // 'neutral', 'enthusiastic', 'calm', 'dramatic'
  };
  music?: {
    prompt: string;                  // ElevenLabs music gen prompt
    genre: string;
    bpm: number;
    volume: number;                  // 0-1 (relative to narration)
    fadeIn: number;                  // seconds
    fadeOut: number;
  };
  sfx?: Array<{
    name: string;
    trigger: string;                 // 'on_transition', 'at_2s', 'on_click'
    volume: number;
  }>;
}

export interface SceneTextOverlay {
  text: string;
  position: 'top' | 'center' | 'bottom' | 'lower_third' | 'custom';
  style: 'title' | 'subtitle' | 'caption' | 'callout' | 'label' | 'stat';
  animation: 'fade' | 'slide_up' | 'type' | 'pop' | 'none';
  startTime: number;                 // seconds from scene start
  duration: number;                  // seconds
  language?: string;                 // For multi-language overlays
}

export type TransitionType =
  | 'cut'
  | 'crossfade'
  | 'fade_black'
  | 'fade_white'
  | 'slide_left'
  | 'slide_right'
  | 'zoom_through'
  | 'morph'
  | 'glitch'
  | 'wipe'
  | 'iris'
  | 'none';

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video' | 'audio' | 'animation' | '3d_model';
  provider: string;                  // 'meshy', 'alibaba_wan', 'elevenlabs', 'dalle', 'midjourney', etc.
  modelId: string;
  prompt: string;
  url: string;
  thumbnailUrl?: string;
  metadata: Record<string, unknown>;
  cost: { tokens: number; usd: number };
  generatedAt: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'revision';
}

// ─── Production Modes ────────────────────────────────────────────────────────
// How the user wants to work through the production.

export type ProductionMode =
  | 'instant'           // One prompt → full video, no stopping (nano/micro businesses)
  | 'guided'            // Step-by-step wizard, preview at each stage
  | 'plan_first'        // Generate full plan, user approves, then generate all
  | 'scene_by_scene'    // Generate one scene at a time, user approves each
  | 'full_control';     // Every element individually controlled (enterprise)

export interface ProductionPlan {
  id: string;
  title: string;
  description: string;

  // Context
  brandProfileId?: string;           // Links to BrandIntelligenceProfile
  regionCode: string;
  language: string;
  targetAudience: string;

  // Mode
  mode: ProductionMode;
  creativeStyle: string;             // 'pixar_3d', 'disney_2d', 'anime', 'corporate', etc.

  // Use case
  useCase: ProductionUseCase;

  // Scenes
  scenes: ProductionScene[];

  // Global settings
  globalAudio: {
    backgroundMusic: SceneAudioSpec['music'];
    masterVolume: number;
  };
  globalVisual: {
    colorPalette: string[];
    fontFamily: string;
    watermark?: string;
  };

  // Inputs
  inputs: PipelineInput[];

  // Output
  outputs: OutputSpec[];

  // Pipeline routing
  pipeline: PipelineRoute[];

  // Status
  status: 'draft' | 'planning' | 'approved' | 'generating' | 'review' | 'rendering' | 'complete' | 'failed';
  totalEstimatedTokens: number;
  totalEstimatedCostUsd: number;
  totalEstimatedDuration: number;    // seconds of final video
  totalEstimatedGenerationTime: number; // minutes to generate
}

export type ProductionUseCase =
  | 'product_demo'         // Software walkthrough, app demo
  | 'product_marketing'    // Product launch, feature announcement
  | 'explainer'            // How it works, concept explanation
  | 'tutorial'             // Step-by-step how-to
  | 'training'             // Employee/customer training
  | 'testimonial'          // Customer story, case study
  | 'social_content'       // Short-form social media
  | 'pitch_deck'           // Investor/sales pitch as video
  | 'brand_story'          // Brand narrative, company intro
  | 'event_promo'          // Event/webinar promotion
  | 'internal_comms'       // Team update, all-hands
  | 'news_update'          // Industry news, market update
  | 'comparison'           // Product comparison, vs competitor
  | 'announcement'         // New feature, partnership, milestone
  | 'cultural_showcase'    // Regional/cultural content showcase
  | 'nano_business_promo'  // Simple promo for street vendors, food carts
  | 'custom';

// ─── Pipeline Routing ────────────────────────────────────────────────────────
// How each step in production routes to specific AI providers.

export interface PipelineRoute {
  step: PipelineStep;
  provider: string;
  modelId: string;
  fallbackProvider?: string;
  fallbackModelId?: string;
  estimatedTokens: number;
  estimatedCostUsd: number;
  estimatedTimeSeconds: number;
  config: Record<string, unknown>;
}

export type PipelineStep =
  // Text processing
  | 'script_generation'       // Text → script with scenes
  | 'script_translation'      // Script → translated script
  | 'script_transcreation'    // Script → culturally adapted script
  | 'prompt_enrichment'       // Base prompt → culturally enriched prompt

  // Image generation/processing
  | 'text_to_image'           // Text → image
  | 'image_to_image'          // Image → enhanced/styled image
  | 'image_upscale'           // Image → higher resolution
  | 'image_background_remove' // Image → transparent background
  | 'image_style_transfer'    // Image → different artistic style
  | 'image_to_3d'             // Image → 3D model
  | 'screenshot_annotate'     // Screenshot → annotated with callouts
  | 'screenshot_animate'      // Screenshot → animated walkthrough

  // Video generation/processing
  | 'text_to_video'           // Text → video clip
  | 'image_to_video'          // Image → animated video
  | 'video_to_video'          // Video → enhanced/styled video
  | 'video_upscale'           // Video → higher resolution
  | 'video_style_transfer'    // Video → different visual style
  | 'video_stabilize'         // Shaky → stable video
  | 'video_interpolate'       // Low FPS → high FPS smooth video
  | 'screen_recording_enhance'// Raw screen recording → polished demo

  // Character/Avatar
  | 'character_generate'      // Description → character model
  | 'avatar_generate'         // Photo → realistic avatar
  | 'lip_sync'                // Audio + face → lip-synced video
  | 'expression_animate'      // Character + emotion → animated expression
  | 'full_body_animate'       // Character + action → full body animation

  // Audio
  | 'text_to_speech'          // Text → narration
  | 'voice_clone'             // Sample → cloned voice
  | 'music_generate'          // Prompt → background music
  | 'sfx_generate'            // Description → sound effect
  | 'audio_enhance'           // Raw audio → clean enhanced audio

  // 3D
  | '3d_model_generate'       // Text/image → 3D model
  | '3d_scene_render'         // 3D scene → rendered video
  | '3d_animate'              // 3D model → animated sequence

  // Assembly
  | 'scene_composite'         // Layer visual + audio + text → scene
  | 'scene_transition'        // Add transitions between scenes
  | 'final_render'            // All scenes → final video
  | 'format_export';          // Final → multiple platform formats

// ─── Provider Configuration ──────────────────────────────────────────────────

export interface PipelineProviderConfig {
  id: string;
  name: string;
  capabilities: PipelineStep[];
  models: Array<{
    id: string;
    name: string;
    tier: QualityTier;
    costPerToken: number;
    avgGenerationTime: number;       // seconds
    maxResolution?: { width: number; height: number };
    maxDuration?: number;            // seconds
    supportedStyles?: string[];
  }>;
  regionAvailability: string[];      // Region codes where available
  fallbackPriority: number;          // Lower = higher priority
}

export const PIPELINE_PROVIDERS: PipelineProviderConfig[] = [
  // ─── Image Generation ───
  {
    id: 'meshy',
    name: 'Meshy',
    capabilities: ['text_to_image', 'image_to_3d', '3d_model_generate', '3d_scene_render', '3d_animate'],
    models: [
      { id: 'meshy-6', name: 'Meshy 6', tier: 'production', costPerToken: 0.02, avgGenerationTime: 30,
        maxResolution: { width: 2048, height: 2048 }, supportedStyles: ['3d_realistic', '3d_cartoon', '3d_anime'] },
    ],
    regionAvailability: ['*'],
    fallbackPriority: 1,
  },
  {
    id: 'dalle',
    name: 'DALL-E',
    capabilities: ['text_to_image', 'image_to_image', 'image_style_transfer'],
    models: [
      { id: 'dall-e-3', name: 'DALL-E 3', tier: 'production', costPerToken: 0.04, avgGenerationTime: 15,
        maxResolution: { width: 1024, height: 1792 }, supportedStyles: ['photorealistic', 'illustration', 'digital_art'] },
    ],
    regionAvailability: ['*'],
    fallbackPriority: 2,
  },
  {
    id: 'flux',
    name: 'Flux',
    capabilities: ['text_to_image', 'image_to_image', 'image_style_transfer'],
    models: [
      { id: 'flux-1.1-pro', name: 'Flux 1.1 Pro', tier: 'production', costPerToken: 0.03, avgGenerationTime: 10,
        maxResolution: { width: 2048, height: 2048 }, supportedStyles: ['photorealistic', 'artistic', 'anime', 'pixel_art'] },
      { id: 'alibaba-flux-merged', name: 'Alibaba Flux Merged', tier: 'standard', costPerToken: 0.015, avgGenerationTime: 8,
        maxResolution: { width: 1024, height: 1024 }, supportedStyles: ['general', 'character'] },
    ],
    regionAvailability: ['*'],
    fallbackPriority: 3,
  },

  // ─── Video Generation ───
  {
    id: 'alibaba',
    name: 'Alibaba Wan',
    capabilities: ['text_to_video', 'image_to_video', 'lip_sync', 'avatar_generate', 'full_body_animate'],
    models: [
      { id: 'wan2.6-t2v', name: 'Wan 2.6 Text-to-Video', tier: 'production', costPerToken: 0.05, avgGenerationTime: 120,
        maxResolution: { width: 1280, height: 720 }, maxDuration: 10, supportedStyles: ['realistic', 'animated', 'cinematic'] },
      { id: 'wan2.6-i2v', name: 'Wan 2.6 Image-to-Video', tier: 'production', costPerToken: 0.04, avgGenerationTime: 90,
        maxResolution: { width: 1280, height: 720 }, maxDuration: 10, supportedStyles: ['realistic', 'animated'] },
      { id: 'wanx-v2.1', name: 'WanX v2.1', tier: 'standard', costPerToken: 0.03, avgGenerationTime: 60,
        maxResolution: { width: 1024, height: 576 }, maxDuration: 6, supportedStyles: ['general'] },
      { id: 'wan2.2-lipsync', name: 'Wan 2.2 Lip Sync', tier: 'production', costPerToken: 0.06, avgGenerationTime: 45,
        supportedStyles: ['realistic_lipsync'] },
      { id: 'omniavatar', name: 'OmniAvatar', tier: 'production', costPerToken: 0.08, avgGenerationTime: 60,
        supportedStyles: ['realistic_avatar', 'stylized_avatar'] },
    ],
    regionAvailability: ['*'],
    fallbackPriority: 1,
  },
  {
    id: 'runway',
    name: 'Runway',
    capabilities: ['text_to_video', 'image_to_video', 'video_to_video', 'video_style_transfer', 'video_upscale'],
    models: [
      { id: 'gen-3-alpha', name: 'Gen-3 Alpha', tier: 'cinematic', costPerToken: 0.08, avgGenerationTime: 180,
        maxResolution: { width: 1920, height: 1080 }, maxDuration: 10, supportedStyles: ['cinematic', 'realistic', 'artistic'] },
    ],
    regionAvailability: ['*'],
    fallbackPriority: 2,
  },
  {
    id: 'kling',
    name: 'Kling',
    capabilities: ['text_to_video', 'image_to_video', 'lip_sync'],
    models: [
      { id: 'kling-v1.6', name: 'Kling v1.6', tier: 'production', costPerToken: 0.04, avgGenerationTime: 120,
        maxResolution: { width: 1920, height: 1080 }, maxDuration: 10, supportedStyles: ['cinematic', 'realistic'] },
    ],
    regionAvailability: ['*'],
    fallbackPriority: 3,
  },
  {
    id: 'minimax',
    name: 'MiniMax Hailuo',
    capabilities: ['text_to_video', 'image_to_video'],
    models: [
      { id: 'hailuo-video', name: 'Hailuo Video', tier: 'standard', costPerToken: 0.03, avgGenerationTime: 90,
        maxResolution: { width: 1280, height: 720 }, maxDuration: 6, supportedStyles: ['general', 'animated'] },
    ],
    regionAvailability: ['*'],
    fallbackPriority: 4,
  },

  // ─── Audio ───
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    capabilities: ['text_to_speech', 'voice_clone', 'music_generate', 'sfx_generate', 'audio_enhance'],
    models: [
      { id: 'eleven-turbo-v2.5', name: 'Turbo v2.5', tier: 'standard', costPerToken: 0.015, avgGenerationTime: 3 },
      { id: 'eleven-multilingual-v2', name: 'Multilingual v2', tier: 'production', costPerToken: 0.03, avgGenerationTime: 5 },
      { id: 'eleven-music-gen', name: 'Music Gen', tier: 'production', costPerToken: 0.02, avgGenerationTime: 15 },
    ],
    regionAvailability: ['*'],
    fallbackPriority: 1,
  },

  // ─── 3D ───
  {
    id: 'meshy_3d',
    name: 'Meshy 3D',
    capabilities: ['3d_model_generate', '3d_scene_render', '3d_animate', 'image_to_3d'],
    models: [
      { id: 'meshy-6-3d', name: 'Meshy 6 3D', tier: 'production', costPerToken: 0.05, avgGenerationTime: 60 },
    ],
    regionAvailability: ['*'],
    fallbackPriority: 1,
  },

  // ─── Screenshot/UI Processing ───
  {
    id: 'screenshot_processor',
    name: 'Built-in Screenshot Processor',
    capabilities: ['screenshot_annotate', 'screenshot_animate', 'screen_recording_enhance'],
    models: [
      { id: 'annotator-v1', name: 'Auto Annotator', tier: 'standard', costPerToken: 0.005, avgGenerationTime: 5 },
      { id: 'ui-animator-v1', name: 'UI Animator', tier: 'standard', costPerToken: 0.01, avgGenerationTime: 15 },
    ],
    regionAvailability: ['*'],
    fallbackPriority: 1,
  },
];

// ─── Use Case Templates ──────────────────────────────────────────────────────
// Pre-built production templates for common use cases.

export interface UseCaseTemplate {
  useCase: ProductionUseCase;
  name: string;
  description: string;
  suggestedInputs: InputSourceType[];
  suggestedMode: ProductionMode;
  suggestedQuality: QualityTier;
  typicalSceneCount: { min: number; max: number };
  typicalDuration: { min: number; max: number }; // seconds
  defaultAssetHandling: AssetHandling;
  sceneTemplates: Array<{
    title: string;
    description: string;
    suggestedVisual: SceneVisualSpec['primarySource'];
    suggestedDuration: number;
    suggestedTransition: TransitionType;
  }>;
  suggestedPipeline: PipelineStep[];
  supportedStyles: string[];
  tierAvailability: ('nano' | 'micro' | 'small' | 'medium' | 'large' | 'enterprise')[];
}

export const USE_CASE_TEMPLATES: UseCaseTemplate[] = [
  {
    useCase: 'product_demo',
    name: 'Product Demo / Walkthrough',
    description: 'Show how your product works — from screenshots or screen recordings to polished demo video',
    suggestedInputs: ['screenshot', 'image_sequence', 'video', 'url'],
    suggestedMode: 'guided',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 5, max: 15 },
    typicalDuration: { min: 60, max: 300 },
    defaultAssetHandling: 'enhance',
    sceneTemplates: [
      { title: 'Hook / Problem Statement', description: 'Show the pain point your product solves', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Product Introduction', description: 'First look at the product — logo, UI overview', suggestedVisual: 'user_input', suggestedDuration: 8, suggestedTransition: 'slide_left' },
      { title: 'Feature Walkthrough 1', description: 'Show the primary feature in action', suggestedVisual: 'hybrid', suggestedDuration: 20, suggestedTransition: 'cut' },
      { title: 'Feature Walkthrough 2', description: 'Show the secondary feature', suggestedVisual: 'hybrid', suggestedDuration: 20, suggestedTransition: 'cut' },
      { title: 'Feature Walkthrough 3', description: 'Show the tertiary feature', suggestedVisual: 'hybrid', suggestedDuration: 20, suggestedTransition: 'cut' },
      { title: 'Results / Impact', description: 'Show the outcome — dashboard, metrics, success', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'CTA', description: 'Call to action — try it, sign up, learn more', suggestedVisual: 'ai_generated', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'screenshot_annotate', 'screenshot_animate', 'text_to_speech', 'music_generate', 'scene_composite', 'final_render'],
    supportedStyles: ['corporate_clean', 'startup_dynamic', 'pixar_3d', 'minimal_modern', 'tech_futuristic'],
    tierAvailability: ['small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'nano_business_promo',
    name: 'Quick Business Promo',
    description: 'Simple, effective promo for any business — food cart, shop, service provider. One prompt, done.',
    suggestedInputs: ['text', 'image'],
    suggestedMode: 'instant',
    suggestedQuality: 'standard',
    typicalSceneCount: { min: 3, max: 6 },
    typicalDuration: { min: 15, max: 45 },
    defaultAssetHandling: 'auto',
    sceneTemplates: [
      { title: 'Business Introduction', description: 'Show what you do — name, location, vibe', suggestedVisual: 'hybrid', suggestedDuration: 5, suggestedTransition: 'fade_black' },
      { title: 'What You Offer', description: 'Show your best products/services', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'slide_left' },
      { title: 'Why Choose You', description: 'Your special sauce — what makes you different', suggestedVisual: 'ai_generated', suggestedDuration: 8, suggestedTransition: 'crossfade' },
      { title: 'Come Visit / Order', description: 'Where to find you, how to order', suggestedVisual: 'hybrid', suggestedDuration: 7, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'scene_composite', 'final_render'],
    supportedStyles: ['vibrant_street', 'warm_homestyle', 'modern_clean', 'cultural_rich', 'playful_fun'],
    tierAvailability: ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'product_marketing',
    name: 'Product Marketing Video',
    description: 'Professional marketing video — launch, feature announce, brand story',
    suggestedInputs: ['text', 'image', 'video', 'brand_assets', 'screenshot'],
    suggestedMode: 'plan_first',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 7, max: 20 },
    typicalDuration: { min: 30, max: 180 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Attention Grabber', description: 'Bold opening — statistic, question, or dramatic visual', suggestedVisual: 'ai_generated', suggestedDuration: 5, suggestedTransition: 'none' },
      { title: 'The Problem', description: 'Paint the pain point vividly', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'The Solution', description: 'Introduce your product as the answer', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'zoom_through' },
      { title: 'How It Works', description: 'Show the product in action — 3-5 key features', suggestedVisual: 'hybrid', suggestedDuration: 30, suggestedTransition: 'slide_left' },
      { title: 'Social Proof', description: 'Testimonials, stats, logos, awards', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Differentiator', description: 'Why this vs alternatives — the unique advantage', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'CTA', description: 'Clear call to action with urgency', suggestedVisual: 'ai_generated', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'character_generate', 'lip_sync', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['pixar_3d', 'disney_2d', 'anime', 'corporate_premium', 'startup_bold', 'cultural_rich', 'cinematic_dramatic'],
    tierAvailability: ['small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'explainer',
    name: 'Explainer Video',
    description: 'Explain a concept, process, or product clearly — with characters, animation, or mixed media',
    suggestedInputs: ['text', 'image', 'presentation', 'document'],
    suggestedMode: 'guided',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 5, max: 12 },
    typicalDuration: { min: 60, max: 180 },
    defaultAssetHandling: 'ai_generate',
    sceneTemplates: [
      { title: 'The Question', description: 'Pose the question your audience has', suggestedVisual: 'ai_generated', suggestedDuration: 8, suggestedTransition: 'crossfade' },
      { title: 'Context Setting', description: 'Brief background — why this matters', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'slide_left' },
      { title: 'Step 1', description: 'First part of the explanation', suggestedVisual: 'ai_generated', suggestedDuration: 20, suggestedTransition: 'slide_left' },
      { title: 'Step 2', description: 'Second part', suggestedVisual: 'ai_generated', suggestedDuration: 20, suggestedTransition: 'slide_left' },
      { title: 'Step 3', description: 'Third part', suggestedVisual: 'ai_generated', suggestedDuration: 20, suggestedTransition: 'slide_left' },
      { title: 'Summary', description: 'Recap key points visually', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Next Steps', description: 'What to do with this knowledge', suggestedVisual: 'ai_generated', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'character_generate', 'text_to_image', 'image_to_video', 'text_to_speech', 'lip_sync', 'music_generate', 'scene_composite', 'final_render'],
    supportedStyles: ['pixar_3d', 'disney_2d', 'anime', 'whiteboard', 'infographic_motion', 'cultural_storytelling', 'flat_design'],
    tierAvailability: ['micro', 'small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'cultural_showcase',
    name: 'Cultural / Regional Showcase',
    description: 'Showcase content adapted for specific regions — with local characters, music, humor, and messaging',
    suggestedInputs: ['text', 'image', 'brand_assets'],
    suggestedMode: 'plan_first',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 5, max: 15 },
    typicalDuration: { min: 30, max: 120 },
    defaultAssetHandling: 'ai_generate',
    sceneTemplates: [
      { title: 'Cultural Opening', description: 'Region-specific visual hook — familiar setting, local vibe', suggestedVisual: 'ai_generated', suggestedDuration: 8, suggestedTransition: 'crossfade' },
      { title: 'Local Problem', description: 'Pain point framed in local context', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'slide_left' },
      { title: 'Solution in Context', description: 'Product shown in the local environment', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'zoom_through' },
      { title: 'Local Impact', description: 'How it changes life/business locally', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Cultural CTA', description: 'Call to action in local language with cultural nuance', suggestedVisual: 'ai_generated', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'script_transcreation', 'prompt_enrichment', 'character_generate', 'text_to_image', 'image_to_video', 'text_to_speech', 'lip_sync', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['pixar_3d_regional', 'disney_2d_regional', 'anime_regional', 'cultural_illustration', 'documentary', 'vibrant_street'],
    tierAvailability: ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'],
  },
];

// ─── Pipeline Routing Logic ──────────────────────────────────────────────────

export function getProviderForStep(
  step: PipelineStep,
  quality: QualityTier,
  regionCode?: string,
): PipelineProviderConfig | undefined {
  const candidates = PIPELINE_PROVIDERS
    .filter(p => p.capabilities.includes(step))
    .filter(p => p.regionAvailability.includes('*') || (regionCode && p.regionAvailability.includes(regionCode)))
    .sort((a, b) => a.fallbackPriority - b.fallbackPriority);

  if (candidates.length === 0) return undefined;

  // For cinematic quality, prefer highest quality model
  if (quality === 'cinematic') {
    const cinematic = candidates.find(p =>
      p.models.some(m => m.tier === 'cinematic' || m.tier === 'production')
    );
    return cinematic || candidates[0];
  }

  return candidates[0];
}

export function getModelForStep(
  provider: PipelineProviderConfig,
  quality: QualityTier,
): PipelineProviderConfig['models'][0] | undefined {
  // Find best matching model for the quality tier
  const exact = provider.models.find(m => m.tier === quality);
  if (exact) return exact;

  // Fall back to nearest tier
  const tierOrder: QualityTier[] = ['preview', 'standard', 'production', 'cinematic'];
  const targetIdx = tierOrder.indexOf(quality);
  for (let i = targetIdx; i >= 0; i--) {
    const fallback = provider.models.find(m => m.tier === tierOrder[i]);
    if (fallback) return fallback;
  }

  return provider.models[0];
}

export function buildPipelineForUseCase(
  useCase: ProductionUseCase,
  quality: QualityTier,
  regionCode: string,
  inputs: PipelineInput[],
): PipelineRoute[] {
  const template = USE_CASE_TEMPLATES.find(t => t.useCase === useCase);
  if (!template) return [];

  const routes: PipelineRoute[] = [];
  for (const step of template.suggestedPipeline) {
    const provider = getProviderForStep(step, quality, regionCode);
    if (!provider) continue;

    const model = getModelForStep(provider, quality);
    if (!model) continue;

    const fallbackProvider = PIPELINE_PROVIDERS
      .filter(p => p.capabilities.includes(step) && p.id !== provider.id)
      .sort((a, b) => a.fallbackPriority - b.fallbackPriority)[0];

    routes.push({
      step,
      provider: provider.id,
      modelId: model.id,
      fallbackProvider: fallbackProvider?.id,
      fallbackModelId: fallbackProvider ? getModelForStep(fallbackProvider, quality)?.id : undefined,
      estimatedTokens: model.costPerToken * 1000, // rough estimate
      estimatedCostUsd: model.costPerToken * (quality === 'cinematic' ? 5 : quality === 'production' ? 2 : 1),
      estimatedTimeSeconds: model.avgGenerationTime,
      config: {},
    });
  }

  return routes;
}

export function getUseCaseTemplate(useCase: ProductionUseCase): UseCaseTemplate | undefined {
  return USE_CASE_TEMPLATES.find(t => t.useCase === useCase);
}

export function getTemplatesForTier(tier: string): UseCaseTemplate[] {
  return USE_CASE_TEMPLATES.filter(t => t.tierAvailability.includes(tier as UseCaseTemplate['tierAvailability'][0]));
}

export function estimateProductionCost(plan: ProductionPlan): { tokens: number; usd: number; minutes: number } {
  let totalTokens = 0;
  let totalUsd = 0;
  let totalSeconds = 0;

  for (const route of plan.pipeline) {
    totalTokens += route.estimatedTokens;
    totalUsd += route.estimatedCostUsd;
    totalSeconds += route.estimatedTimeSeconds;
  }

  // Multiply by scene count
  const sceneMultiplier = plan.scenes.length;
  return {
    tokens: Math.ceil(totalTokens * sceneMultiplier),
    usd: Math.round(totalUsd * sceneMultiplier * 100) / 100,
    minutes: Math.ceil((totalSeconds * sceneMultiplier) / 60),
  };
}
