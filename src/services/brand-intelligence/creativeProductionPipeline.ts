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
  // ─── Franchise & Expansion Use Cases ──────────────────────────────────────
  | 'franchise_new_location'     // New branch/outlet launch promo
  | 'franchise_menu_expansion'   // New menu items, recipes, product lines
  | 'franchise_territory_pitch'  // Territory expansion pitch for investors/franchisees
  | 'franchise_brand_consistency' // Multi-location brand guidelines video
  | 'market_gap_analysis'        // Competitive landscape + opportunity identification
  // ─── Real Estate & Property Use Cases ─────────────────────────────────────
  | 'realestate_property_showcase'  // Property walkthrough — interior, exterior, 3D model, drone view
  | 'realestate_layout_flyover'     // Land layout / gated community bird's-eye flyover
  | 'realestate_green_sustainable'  // Green building, sustainable living, eco-community showcase
  | 'realestate_container_modular'  // Container homes, modular builds, prefab construction
  // ─── Industry Vertical Showcase ────────────────────────────────────────────
  | 'industry_healthcare'           // Hospital, clinic, wellness facility showcase
  | 'industry_education'            // School, university, e-learning platform showcase
  | 'industry_hospitality'          // Hotel, resort, restaurant ambiance showcase
  | 'industry_manufacturing'        // Factory tour, production process, quality showcase
  // ─── Education-Specific Content Templates ──────────────────────────────────
  | 'edu_course_module'             // Course lesson/module video — structured teaching content
  | 'edu_student_testimonial'       // Student success story / placement highlight
  | 'edu_open_day'                  // Open Day / admission event promotion
  | 'edu_alumni_spotlight'          // Alumni achievement showcase for brand building
  | 'edu_annual_day'               // Annual Day / Convocation / Sports Day highlights
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
      { id: 'meshy-4', name: 'Meshy 4', tier: 'production', costPerToken: 0.02, avgGenerationTime: 30,
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
      { id: 'meshy-4-3d', name: 'Meshy 4 3D', tier: 'production', costPerToken: 0.05, avgGenerationTime: 60 },
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

  // ─── Franchise & Expansion Templates ──────────────────────────────────────

  {
    useCase: 'franchise_new_location',
    name: 'New Location Launch',
    description: 'Announce and promote a new branch, outlet, or franchise location — builds local buzz with regional cultural adaptation',
    suggestedInputs: ['text', 'image', 'brand_assets'],
    suggestedMode: 'guided',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 5, max: 8 },
    typicalDuration: { min: 30, max: 90 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Brand Story Recap', description: 'Quick brand intro — who we are, what we stand for, our legacy', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'crossfade' },
      { title: 'Exciting News', description: 'Announce the new location — address, neighborhood, opening date', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'zoom_through' },
      { title: 'What We Bring', description: 'Highlight signature offerings — best sellers, local specials, what the area was missing', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'slide_left' },
      { title: 'Local Touch', description: 'Show regional adaptation — local flavors, cultural tie-ins, community involvement', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Grand Opening Offer', description: 'Launch promotion — opening day specials, loyalty signup, first-customer perks', suggestedVisual: 'ai_generated', suggestedDuration: 8, suggestedTransition: 'crossfade' },
      { title: 'Find Us', description: 'Map, directions, hours, contact — make it easy to visit', suggestedVisual: 'hybrid', suggestedDuration: 7, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['pixar_3d', 'vibrant_street', 'warm_homestyle', 'modern_clean', 'cultural_rich', 'playful_fun'],
    tierAvailability: ['micro', 'small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'franchise_menu_expansion',
    name: 'Menu / Product Line Expansion',
    description: 'Introduce new menu items, recipes, product lines, or seasonal offerings — with visual storytelling and taste appeal',
    suggestedInputs: ['text', 'image', 'brand_assets'],
    suggestedMode: 'guided',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 5, max: 10 },
    typicalDuration: { min: 30, max: 120 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Teaser Hook', description: 'Create anticipation — "Something new is coming..." with mystery reveal', suggestedVisual: 'ai_generated', suggestedDuration: 6, suggestedTransition: 'crossfade' },
      { title: 'The New Offering', description: 'Grand reveal of new items — close-up visuals, ingredients, preparation process', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'zoom_through' },
      { title: 'The Story Behind It', description: 'Why we created this — inspiration, chef story, customer demand, seasonal tie-in', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Taste & Experience', description: 'Sensory appeal — flavors, textures, pairings, customer reactions', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'slide_left' },
      { title: 'Regional Twist', description: 'How this item adapts to local tastes — regional ingredients, cultural celebration tie-in', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Available Now', description: 'Where to get it — locations, pricing, limited-time notice, ordering channels', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['warm_homestyle', 'vibrant_street', 'modern_clean', 'cultural_rich', 'pixar_3d', 'cinematic_dramatic'],
    tierAvailability: ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'franchise_territory_pitch',
    name: 'Territory Expansion Pitch',
    description: 'Pitch for franchise investors, territory partners, or expansion board — with market data, brand strength, and ROI narrative',
    suggestedInputs: ['text', 'brand_assets', 'data', 'presentation'],
    suggestedMode: 'plan_first',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 8, max: 15 },
    typicalDuration: { min: 60, max: 180 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Brand Heritage', description: 'Established brand story — history, values, growth trajectory', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Market Opportunity', description: 'Target territory analysis — demographics, demand signals, gap in market', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'slide_left' },
      { title: 'Competitive Landscape', description: 'Who else is there, what they lack, our differentiation in this market', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Proven Model', description: 'Existing locations performance — revenue, footfall, customer satisfaction, growth', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'slide_left' },
      { title: 'Franchise Package', description: 'What the franchisee gets — training, supply chain, marketing support, tech stack', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Regional Adaptation', description: 'How the concept adapts — local menu items, cultural sensitivity, regional partnerships', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Financial Projections', description: 'Investment, break-even, ROI timeline, revenue model', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'slide_left' },
      { title: 'Next Steps', description: 'How to join — application process, contact, territory availability map', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'character_generate', 'lip_sync', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['corporate_premium', 'cinematic_dramatic', 'pixar_3d', 'modern_clean', 'startup_bold'],
    tierAvailability: ['small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'franchise_brand_consistency',
    name: 'Multi-Location Brand Guidelines',
    description: 'Training video for franchise operators — brand standards, visual identity, service quality, do\'s and don\'ts across all locations',
    suggestedInputs: ['text', 'brand_assets', 'image_sequence', 'document'],
    suggestedMode: 'plan_first',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 8, max: 15 },
    typicalDuration: { min: 90, max: 300 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Our Brand Promise', description: 'Core values and why consistency matters — the customer expectation', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Visual Identity', description: 'Logo usage, colors, signage, uniforms, packaging — what must stay the same', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'slide_left' },
      { title: 'Service Standards', description: 'Customer interaction, greeting protocol, response times, quality checks', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Menu / Product Standards', description: 'Recipe consistency, portion sizes, presentation standards, quality sourcing', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'slide_left' },
      { title: 'Regional Flex Zone', description: 'What CAN be adapted locally — seasonal items, local partnerships, cultural events', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Common Mistakes', description: 'What to avoid — off-brand examples, quality slips, inconsistency red flags', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Quality Checklist', description: 'Daily/weekly brand consistency checklist for location managers', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'slide_left' },
      { title: 'Support & Resources', description: 'Where to get help — brand portal, marketing kit access, escalation contacts', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'character_generate', 'lip_sync', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['corporate_premium', 'modern_clean', 'pixar_3d', 'infographic_motion', 'flat_design'],
    tierAvailability: ['small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'market_gap_analysis',
    name: 'Market Gap & Opportunity Analysis',
    description: 'Visual analysis of competitive landscape — identify underserved areas, market opportunities, and expansion directions using real business data',
    suggestedInputs: ['text', 'data', 'url'],
    suggestedMode: 'plan_first',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 6, max: 12 },
    typicalDuration: { min: 60, max: 180 },
    defaultAssetHandling: 'ai_generate',
    sceneTemplates: [
      { title: 'Current Position', description: 'Where you are today — locations, market share, customer base, strengths', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Competitive Landscape', description: 'Map the competition — who, where, what they offer, their weaknesses', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'slide_left' },
      { title: 'Market Gaps Identified', description: 'Underserved areas, unmet demands, demographic mismatches, opportunity zones', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'zoom_through' },
      { title: 'Customer Demand Signals', description: 'What customers are asking for — reviews, trends, seasonal patterns, search data', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Expansion Recommendations', description: 'Top 3-5 opportunities ranked by potential — with rationale and risk assessment', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'slide_left' },
      { title: 'Action Plan', description: 'Next steps — which opportunity to pursue first, timeline, investment needed', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['corporate_premium', 'infographic_motion', 'modern_clean', 'data_driven_viz', 'startup_bold'],
    tierAvailability: ['small', 'medium', 'large', 'enterprise'],
  },

  // ─── Real Estate & Property Templates ──────────────────────────────────────

  {
    useCase: 'realestate_property_showcase',
    name: 'Property Showcase & Virtual Tour',
    description: 'Full property walkthrough — room-by-room interior, exterior views, 3D model flythrough, drone aerial shots. For individual homes, apartments, villas, or rental listings.',
    suggestedInputs: ['image_sequence', 'video', 'screenshot', 'text', 'brand_assets'],
    suggestedMode: 'plan_first',
    suggestedQuality: 'cinematic',
    typicalSceneCount: { min: 8, max: 20 },
    typicalDuration: { min: 60, max: 300 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Aerial / Street Approach', description: 'Drone view or street-level approach — neighborhood, surroundings, curb appeal', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Exterior & Architecture', description: 'Full exterior — facade, garden, parking, architectural highlights', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'zoom_through' },
      { title: 'Grand Entrance / Lobby', description: 'First impression — entrance, lobby, foyer, main hallway', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'slide_left' },
      { title: 'Living Areas', description: 'Living room, dining area, family room — space, light, finishes', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Kitchen & Utility', description: 'Kitchen layout, appliances, counter space, pantry, laundry', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'slide_left' },
      { title: 'Bedrooms & Bathrooms', description: 'Master suite, guest rooms, bathrooms — closets, fixtures, views', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Special Features', description: 'Balcony, terrace, pool, gym, home office, smart home tech, garden', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: '3D Floor Plan / Model', description: 'Animated 3D floor plan walkthrough showing spatial layout', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'zoom_through' },
      { title: 'Neighborhood & Amenities', description: 'Schools, hospitals, shopping, transport, parks — proximity highlights', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Pricing & Contact', description: 'Price, EMI options, agent contact, visit scheduling, virtual tour link', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['cinematic_dramatic', 'modern_clean', 'corporate_premium', 'warm_homestyle', 'pixar_3d', 'architectural_viz'],
    tierAvailability: ['small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'realestate_layout_flyover',
    name: 'Land Layout & Community Flyover',
    description: 'Bird\'s-eye view of land layouts, gated communities, township plans, plot divisions. Shows amenities, green spaces, road networks, and 3D building visualizations.',
    suggestedInputs: ['image', 'image_sequence', 'data', 'text', 'brand_assets'],
    suggestedMode: 'plan_first',
    suggestedQuality: 'cinematic',
    typicalSceneCount: { min: 6, max: 15 },
    typicalDuration: { min: 60, max: 240 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Vision Statement', description: 'Developer introduction — vision for the community, brand heritage, track record', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Location & Connectivity', description: 'Map view — city position, highway access, airport distance, metro connectivity', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'zoom_through' },
      { title: 'Master Plan Flyover', description: 'Animated bird\'s-eye flyover of the entire layout — plots, roads, green zones', suggestedVisual: 'ai_generated', suggestedDuration: 20, suggestedTransition: 'zoom_through' },
      { title: 'Residential Zones', description: 'Close-up of residential blocks — villa plots, apartment towers, row houses, their 3D renders', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'slide_left' },
      { title: 'Community Amenities', description: 'Clubhouse, swimming pool, gym, playground, sports courts, jogging track, amphitheater', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Green & Sustainable', description: 'Landscaping, tree-lined avenues, rainwater harvesting, solar panels, green building certifications', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Plot Types & Pricing', description: 'Available plot sizes, configurations, pricing tiers, payment plans', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'slide_left' },
      { title: 'Book Your Plot', description: 'CTA — booking process, site visit scheduling, agent contact, virtual tour', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'character_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['cinematic_dramatic', 'architectural_viz', 'corporate_premium', 'modern_clean', 'pixar_3d'],
    tierAvailability: ['small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'realestate_green_sustainable',
    name: 'Green & Sustainable Living Showcase',
    description: 'Eco-friendly homes, green buildings, sustainable communities — showcase environmental features, certifications, and lifestyle benefits. Reduces pollution narrative.',
    suggestedInputs: ['text', 'image', 'brand_assets'],
    suggestedMode: 'guided',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 6, max: 12 },
    typicalDuration: { min: 45, max: 180 },
    defaultAssetHandling: 'ai_generate',
    sceneTemplates: [
      { title: 'The Problem — Urban Pollution', description: 'Show the environmental challenge — air quality, congestion, heat islands, carbon footprint', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'The Vision — Green Living', description: 'Introduce the sustainable alternative — nature-integrated design, clean air, green spaces', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'zoom_through' },
      { title: 'Sustainable Design', description: 'Green building materials, passive cooling, natural ventilation, cross-ventilation, green roofs', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'slide_left' },
      { title: 'Energy & Water', description: 'Solar panels, EV charging, rainwater harvesting, water recycling, energy rating certifications', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Community & Biodiversity', description: 'Native planting, urban farming, butterfly gardens, composting, community gardens, wildlife corridors', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Health & Lifestyle', description: 'Walking trails, cycling paths, yoga gardens, organic markets, clean air metrics, health benefits', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Certifications & Impact', description: 'LEED, IGBC, carbon offset numbers, trees planted, water saved — quantified impact', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'slide_left' },
      { title: 'Join the Movement', description: 'CTA — live green, invest in sustainability, schedule eco-tour', suggestedVisual: 'ai_generated', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['cinematic_dramatic', 'warm_homestyle', 'documentary', 'pixar_3d', 'modern_clean', 'nature_organic'],
    tierAvailability: ['small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'realestate_container_modular',
    name: 'Container & Modular Home Showcase',
    description: 'Showcase container homes, prefab construction, modular builds, tiny homes, 3D-printed houses — innovative housing solutions with construction process and final walkthrough.',
    suggestedInputs: ['text', 'image', 'image_sequence', 'video', 'brand_assets'],
    suggestedMode: 'guided',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 7, max: 12 },
    typicalDuration: { min: 60, max: 180 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Rethink Housing', description: 'Challenge traditional construction — cost, time, sustainability problems', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'The Innovation', description: 'Introduce the concept — container conversion, modular assembly, 3D printing, or prefab system', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'zoom_through' },
      { title: 'Build Process', description: 'Time-lapse or step-by-step of construction — factory fabrication, transport, assembly on-site', suggestedVisual: 'hybrid', suggestedDuration: 20, suggestedTransition: 'slide_left' },
      { title: 'Interior Reveal', description: 'Room-by-room interior walkthrough — surprising space, smart design, modern finishes', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Exterior & Landscaping', description: 'Exterior design, cladding options, garden integration, multi-unit configurations', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Cost & Timeline', description: 'Price comparison vs traditional — build time, total cost, ROI, financing options', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'slide_left' },
      { title: 'Customization Options', description: 'Layouts, sizes, finishes, add-ons — show configurability and personalization', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Get Started', description: 'CTA — order, customize, schedule site visit, download brochure', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['modern_clean', 'cinematic_dramatic', 'startup_bold', 'pixar_3d', 'industrial_modern', 'documentary'],
    tierAvailability: ['micro', 'small', 'medium', 'large', 'enterprise'],
  },

  // ─── Industry Vertical Templates ───────────────────────────────────────────

  {
    useCase: 'industry_healthcare',
    name: 'Healthcare Facility Showcase',
    description: 'Hospital, clinic, diagnostic center, or wellness facility tour — departments, equipment, doctors, patient experience, certifications.',
    suggestedInputs: ['text', 'image', 'image_sequence', 'video', 'brand_assets'],
    suggestedMode: 'plan_first',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 7, max: 15 },
    typicalDuration: { min: 60, max: 240 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Our Mission', description: 'Healthcare mission — patient-first philosophy, years of service, community trust', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Facility Tour', description: 'Reception, waiting areas, patient rooms, operating theaters, diagnostic labs', suggestedVisual: 'hybrid', suggestedDuration: 20, suggestedTransition: 'slide_left' },
      { title: 'Departments & Specializations', description: 'Key departments — cardiology, orthopedics, pediatrics, etc. with equipment highlights', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Medical Team', description: 'Doctor profiles, credentials, patient testimonials, success stories', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Technology & Equipment', description: 'Advanced diagnostics, AI-assisted imaging, robotic surgery, telemedicine capabilities', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'slide_left' },
      { title: 'Patient Experience', description: 'Appointment booking, insurance processing, comfort amenities, recovery support', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Book Appointment', description: 'CTA — online booking, emergency contact, location map, visiting hours', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'character_generate', 'lip_sync', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['corporate_premium', 'modern_clean', 'warm_homestyle', 'pixar_3d', 'documentary'],
    tierAvailability: ['small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'industry_education',
    name: 'Educational Institution Showcase',
    description: 'School, university, training center, or e-learning platform tour — campus, programs, faculty, student life, outcomes.',
    suggestedInputs: ['text', 'image', 'image_sequence', 'video', 'brand_assets'],
    suggestedMode: 'guided',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 6, max: 12 },
    typicalDuration: { min: 60, max: 180 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Welcome', description: 'Institution introduction — history, values, accreditations, rankings', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Campus Tour', description: 'Buildings, classrooms, labs, library, auditorium, sports facilities', suggestedVisual: 'hybrid', suggestedDuration: 20, suggestedTransition: 'slide_left' },
      { title: 'Programs & Curriculum', description: 'Courses offered, unique programs, industry partnerships, research centers', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Faculty & Mentorship', description: 'Distinguished faculty, student-teacher ratio, mentorship programs', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Student Life', description: 'Clubs, events, hostel, cafeteria, cultural activities, community', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'slide_left' },
      { title: 'Outcomes & Alumni', description: 'Placement rates, salary statistics, notable alumni, success stories', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Apply Now', description: 'CTA — admission process, deadlines, financial aid, campus visit scheduling', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['modern_clean', 'warm_homestyle', 'pixar_3d', 'cultural_rich', 'corporate_premium', 'playful_fun'],
    tierAvailability: ['small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'industry_hospitality',
    name: 'Hospitality & Dining Experience',
    description: 'Hotel, resort, restaurant, or cafe ambiance showcase — rooms, dining, spa, events, cuisine, atmosphere. Multi-sensory storytelling.',
    suggestedInputs: ['text', 'image', 'image_sequence', 'video', 'brand_assets'],
    suggestedMode: 'guided',
    suggestedQuality: 'cinematic',
    typicalSceneCount: { min: 6, max: 15 },
    typicalDuration: { min: 45, max: 180 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Arrival Experience', description: 'First impression — entrance, lobby, reception, welcome ambiance', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Rooms & Suites', description: 'Room tour — bed, bathroom, view, amenities, room types and upgrades', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'zoom_through' },
      { title: 'Dining & Cuisine', description: 'Restaurant, bar, chef, signature dishes, buffet, cooking process', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Wellness & Recreation', description: 'Pool, spa, gym, yoga, activities, entertainment, kids zone', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'slide_left' },
      { title: 'Events & Celebrations', description: 'Banquet halls, wedding venues, conference rooms, special event setups', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Guest Experiences', description: 'Reviews, testimonials, Instagram moments, guest stories', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Book Your Stay', description: 'CTA — rates, packages, seasonal offers, reservation link', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['cinematic_dramatic', 'warm_homestyle', 'modern_clean', 'cultural_rich', 'pixar_3d'],
    tierAvailability: ['small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'industry_manufacturing',
    name: 'Factory & Manufacturing Tour',
    description: 'Production facility showcase — assembly lines, quality control, R&D labs, certifications, capacity, technology. For B2B or investor audiences.',
    suggestedInputs: ['text', 'image', 'image_sequence', 'video', 'brand_assets'],
    suggestedMode: 'plan_first',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 7, max: 12 },
    typicalDuration: { min: 60, max: 180 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Company Heritage', description: 'Brand history, mission, scale, global footprint', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Facility Overview', description: 'Aerial/exterior of plant, size, capacity, location advantages', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'zoom_through' },
      { title: 'Production Line', description: 'Step-by-step manufacturing process — raw material to finished product', suggestedVisual: 'hybrid', suggestedDuration: 20, suggestedTransition: 'slide_left' },
      { title: 'Quality Assurance', description: 'Testing labs, QC checkpoints, certifications (ISO, FDA, CE), compliance', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Technology & Innovation', description: 'R&D center, automation, IoT integration, AI quality inspection, patents', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Team & Safety', description: 'Workforce, training programs, safety protocols, employee welfare', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'slide_left' },
      { title: 'Partner With Us', description: 'CTA — OEM/ODM inquiry, minimum order, lead times, contact', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['corporate_premium', 'cinematic_dramatic', 'modern_clean', 'industrial_modern', 'documentary'],
    tierAvailability: ['small', 'medium', 'large', 'enterprise'],
  },

  // ─── Education-Specific Content Templates ─────────────────────────────────

  {
    useCase: 'edu_course_module',
    name: 'Course Module / Lesson Video',
    description: 'Structured teaching content — concept explanation, visual aids, examples, practice problems, summary. For online courses, classroom supplements, or self-paced learning.',
    suggestedInputs: ['text', 'presentation', 'document', 'image_sequence', 'brand_assets'],
    suggestedMode: 'guided',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 6, max: 15 },
    typicalDuration: { min: 120, max: 600 },
    defaultAssetHandling: 'ai_generate',
    sceneTemplates: [
      { title: 'Module Introduction', description: 'What you will learn — learning objectives, prerequisites, expected outcomes', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Concept 1 — Foundation', description: 'Core concept explanation with visual aids — diagrams, animations, real-world analogies', suggestedVisual: 'ai_generated', suggestedDuration: 45, suggestedTransition: 'slide_left' },
      { title: 'Worked Example 1', description: 'Step-by-step problem solving — show the process, not just the answer', suggestedVisual: 'ai_generated', suggestedDuration: 30, suggestedTransition: 'crossfade' },
      { title: 'Concept 2 — Building On', description: 'Advanced concept building on the foundation — connecting ideas', suggestedVisual: 'ai_generated', suggestedDuration: 45, suggestedTransition: 'slide_left' },
      { title: 'Practice Challenge', description: 'Try it yourself — pause point with a problem to solve, then reveal the solution', suggestedVisual: 'ai_generated', suggestedDuration: 20, suggestedTransition: 'crossfade' },
      { title: 'Real-World Application', description: 'Where this applies — industry use case, daily life example, career relevance', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Summary & Key Takeaways', description: 'Recap all concepts visually — cheat sheet, formula summary, mind map', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Next Steps', description: 'What comes next — preview next module, homework assignment, further reading', suggestedVisual: 'ai_generated', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'character_generate', 'text_to_image', 'image_to_video', 'text_to_speech', 'lip_sync', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['whiteboard', 'infographic_motion', 'pixar_3d', 'flat_design', 'modern_clean', 'playful_fun'],
    tierAvailability: ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'edu_student_testimonial',
    name: 'Student Success Story / Placement Highlight',
    description: 'Student or alumni success narrative — from enrollment to achievement. For admissions, brand building, or social proof. Works for placement announcements, toppers, and scholarship winners.',
    suggestedInputs: ['text', 'image', 'video', 'brand_assets'],
    suggestedMode: 'guided',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 5, max: 8 },
    typicalDuration: { min: 30, max: 120 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Meet the Student', description: 'Introduction — name, background, where they came from, their dream', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'The Challenge', description: 'What they faced — financial constraints, academic struggles, career confusion', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'The Journey', description: 'How the institution helped — mentorship, facilities, opportunities, support system', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'slide_left' },
      { title: 'The Achievement', description: 'The big result — exam score, placement offer, research paper, competition win, scholarship', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'zoom_through' },
      { title: 'In Their Words', description: 'Student/parent quote — emotional, authentic, specific praise for what made the difference', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Your Story Starts Here', description: 'CTA — join the institution, next batch info, apply now, visit campus', suggestedVisual: 'ai_generated', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'character_generate', 'lip_sync', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['warm_homestyle', 'documentary', 'modern_clean', 'cultural_rich', 'cinematic_dramatic'],
    tierAvailability: ['micro', 'small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'edu_open_day',
    name: 'Open Day / Admission Event Promo',
    description: 'Invitation video for open days, campus visits, admission fairs, parent orientation, or career counseling sessions. Builds FOMO and drives RSVPs.',
    suggestedInputs: ['text', 'image', 'brand_assets'],
    suggestedMode: 'instant',
    suggestedQuality: 'standard',
    typicalSceneCount: { min: 4, max: 7 },
    typicalDuration: { min: 20, max: 60 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'The Invitation', description: 'You\'re invited — exciting, welcoming tone with date and event name', suggestedVisual: 'ai_generated', suggestedDuration: 6, suggestedTransition: 'crossfade' },
      { title: 'What to Expect', description: 'Campus tour, meet teachers, lab demos, student interaction, Q&A, scholarship info', suggestedVisual: 'ai_generated', suggestedDuration: 12, suggestedTransition: 'slide_left' },
      { title: 'Why Attend', description: 'Exclusive offers for attendees — fee waiver, early admission, scholarship priority', suggestedVisual: 'ai_generated', suggestedDuration: 10, suggestedTransition: 'crossfade' },
      { title: 'Event Details', description: 'Date, time, venue, how to reach, what to bring, registration link', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'crossfade' },
      { title: 'Register Now', description: 'CTA — limited seats, RSVP link, phone number, urgency element', suggestedVisual: 'ai_generated', suggestedDuration: 6, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['playful_fun', 'modern_clean', 'warm_homestyle', 'vibrant_street', 'pixar_3d', 'cultural_rich'],
    tierAvailability: ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'edu_alumni_spotlight',
    name: 'Alumni Achievement Showcase',
    description: 'Highlight notable alumni achievements for brand building — career milestones, entrepreneurship, research, social impact. Strengthens institutional reputation.',
    suggestedInputs: ['text', 'image', 'video', 'brand_assets'],
    suggestedMode: 'guided',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 5, max: 10 },
    typicalDuration: { min: 45, max: 150 },
    defaultAssetHandling: 'hybrid',
    sceneTemplates: [
      { title: 'Alumni Introduction', description: 'Name, graduation year, current role/company — establish credibility', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'crossfade' },
      { title: 'The College Days', description: 'Throwback — what they studied, campus memories, formative experiences, mentors', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Career Journey', description: 'How their education translated to career — first job, growth, pivots, breakthroughs', suggestedVisual: 'ai_generated', suggestedDuration: 15, suggestedTransition: 'slide_left' },
      { title: 'Current Impact', description: 'What they do now — leadership, innovation, social impact, industry recognition', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Message to Students', description: 'Advice and inspiration — what they wish they knew, how to make the most of college', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Alumni Network', description: 'Join a legacy — alumni count, notable achievers, mentorship programs, events', suggestedVisual: 'ai_generated', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'character_generate', 'lip_sync', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['documentary', 'cinematic_dramatic', 'modern_clean', 'warm_homestyle', 'corporate_premium'],
    tierAvailability: ['small', 'medium', 'large', 'enterprise'],
  },

  {
    useCase: 'edu_annual_day',
    name: 'Annual Day / Event Highlights',
    description: 'Capture and showcase school/college events — Annual Day, Convocation, Sports Day, Science Fair, Cultural Fest. Shareable highlights reel.',
    suggestedInputs: ['video', 'image_sequence', 'image', 'text', 'brand_assets'],
    suggestedMode: 'guided',
    suggestedQuality: 'production',
    typicalSceneCount: { min: 6, max: 12 },
    typicalDuration: { min: 60, max: 180 },
    defaultAssetHandling: 'enhance',
    sceneTemplates: [
      { title: 'Event Opening', description: 'Title card with event name, date, institution name — set the mood with music', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'crossfade' },
      { title: 'Venue & Setup', description: 'Decorated venue, stage, seating, banners — the visual grandeur', suggestedVisual: 'hybrid', suggestedDuration: 10, suggestedTransition: 'zoom_through' },
      { title: 'Inauguration', description: 'Chief guest arrival, lamp lighting, inaugural address, national anthem', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Performances', description: 'Best moments — dance, music, drama, speeches, competitions, awards', suggestedVisual: 'hybrid', suggestedDuration: 30, suggestedTransition: 'slide_left' },
      { title: 'Achievements & Awards', description: 'Prize distribution, topper recognition, special awards, certificates', suggestedVisual: 'hybrid', suggestedDuration: 15, suggestedTransition: 'crossfade' },
      { title: 'Happy Faces', description: 'Montage of students, parents, teachers — joy, pride, celebration', suggestedVisual: 'hybrid', suggestedDuration: 12, suggestedTransition: 'crossfade' },
      { title: 'Thank You & Credits', description: 'Acknowledgments, sponsors, organizing team, save-the-date for next year', suggestedVisual: 'hybrid', suggestedDuration: 8, suggestedTransition: 'fade_black' },
    ],
    suggestedPipeline: ['script_generation', 'prompt_enrichment', 'text_to_image', 'image_to_video', 'text_to_speech', 'music_generate', 'scene_composite', 'final_render', 'format_export'],
    supportedStyles: ['warm_homestyle', 'cultural_rich', 'cinematic_dramatic', 'playful_fun', 'modern_clean', 'documentary'],
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
