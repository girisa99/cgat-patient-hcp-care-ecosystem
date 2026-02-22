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

// ─── Scenario & Visual Pipeline Types ────────────────────────────────────────

/** Content scenario — determines which pipeline combination to recommend */
export type ContentScenario =
  | 'product_video'       // Software/app demo — screen capture + AI enhance + voiceover
  | 'product_launch'      // New product announcement — cinematic + avatar + 3D
  | 'explainer'           // How-it-works — whiteboard/animation + voiceover
  | 'testimonial_video'   // Customer story — avatar or real video + captions
  | 'investor_pitch'      // Investor deck — slides + avatar + live data
  | 'social_promo'        // Short social clip — AI video + music + captions
  | 'podcast_episode'     // Audio-first — TTS/recording + audiogram
  | 'webinar_recording'   // Live webinar — screen + avatar PiP + slides
  | 'training_tutorial'   // Internal training — screen capture + voiceover + slides
  | 'brand_story'         // Brand narrative — cinematic + B-roll + avatar
  | 'comparison_review'   // Side-by-side — split screen + data viz + voiceover
  | 'event_highlight'     // Event recap — B-roll montage + music + captions
  | 'gaming_stream'       // Gaming content — screen capture + face cam + overlay
  | 'real_estate_tour'    // Property walkthrough — video/3D + voiceover + map
  | 'recipe_demo'         // Cooking/DIY — overhead cam + steps + voiceover
  | 'custom_scenario';    // User-defined

/** How the visual was sourced — affects what enhancements are available */
export type VisualSource =
  | 'screen_capture_raw'  // Raw screen recording, can be AI-enhanced
  | 'screen_capture_enhanced' // AI-enhanced screen (better quality, annotations)
  | 'ai_from_script'      // AI generated visuals from the scene script
  | 'ai_from_prompt'      // AI generated visuals from custom prompt
  | 'ai_regenerated'      // AI-regenerated from original screens for better quality
  | 'uploaded_raw'        // User uploaded, unprocessed
  | 'uploaded_enhanced'   // User uploaded, AI-enhanced
  | 'stock_footage'       // Stock video/image
  | 'live_camera'         // Live camera feed
  | 'generated_default'   // Platform default / placeholder
  | 'composite';          // Multiple sources composited together

/** Motion preset for visual elements */
export type MotionPreset =
  | 'static'              // No motion (still image, slide)
  | 'slow_pan'            // Gentle horizontal pan (Ken Burns)
  | 'slow_zoom_in'        // Gradual zoom in
  | 'slow_zoom_out'       // Gradual zoom out
  | 'parallax'            // Depth-based parallax layers
  | 'kinetic_text'        // Typography animation (text flying in)
  | 'particle'            // Particle effects overlay
  | 'morph'               // Shape morphing between keyframes
  | 'orbit'               // 360-degree orbit (for 3D models)
  | 'tracking_shot'       // Camera follows subject
  | 'dolly_zoom'          // Vertigo/dolly zoom effect
  | 'timelapse'           // Sped up time progression
  | 'slow_motion'         // Slowed down
  | 'whip_pan'            // Fast pan between subjects
  | 'handheld'            // Slight shake for documentary feel
  | 'drone_aerial'        // Aerial flyover motion
  | 'split_screen'        // Multi-panel split with independent motion
  | 'none';               // User chooses no motion

/** Size variant — same scene rendered at different dimensions */
export interface SizeVariant {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;     // e.g., '16:9', '9:16', '1:1'
  platform?: string;       // Target platform (e.g., 'tiktok', 'youtube', 'instagram_story')
  cropStrategy: 'center' | 'smart_focus' | 'top' | 'bottom' | 'custom';
  customCropRect?: { x: number; y: number; width: number; height: number }; // For custom crop
  scaleMode: 'fit' | 'fill' | 'stretch';
  previewUrl?: string;
}

/** Visual generation pipeline for a scene — what pipeline to run */
export interface VisualGenerationPipeline {
  source: VisualSource;
  enhanceWithAI?: boolean;              // Run AI enhancement on raw input
  aiEnhancePrompt?: string;             // Custom prompt for AI enhancement
  generateFromScript?: boolean;         // Auto-generate visuals from script text
  regenerateFromOriginal?: boolean;     // AI-regenerate from original screens for better quality
  motionPreset?: MotionPreset;          // Motion to apply
  motionIntensity?: number;             // 0-1 how much motion
  motionCustomPrompt?: string;          // Custom motion prompt
  sizeVariants?: SizeVariant[];         // Generate at multiple sizes
  defaultSize?: string;                 // Default size variant ID
  styleTransfer?: {                     // Apply style from reference
    enabled: boolean;
    referenceUrl?: string;              // Reference image/video for style
    referenceStyle?: SceneStyle;        // Named style to apply
    strength?: number;                  // 0-1 how strongly to apply
  };
  qualityEnhance?: {                    // Upscale/enhance quality
    enabled: boolean;
    targetResolution?: Resolution;
    denoiseStrength?: number;           // 0-1
    sharpening?: number;                // 0-1
    colorCorrection?: boolean;
    frameInterpolation?: boolean;       // Smooth out frame rate
  };
}

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

// ─── Consulting Frameworks for Slides/PPT ────────────────────────────────────

/** Consulting framework templates — user picks the framework, AI builds the slides */
export type SlideFramework =
  // Strategy & Analysis
  | 'swot'               // SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
  | 'porters_five'       // Porter's Five Forces
  | 'pestle'             // PESTLE Analysis (Political, Economic, Social, Tech, Legal, Environmental)
  | 'bcg_matrix'         // BCG Growth-Share Matrix
  | 'ansoff_matrix'      // Ansoff Matrix (Market Penetration, Development, etc.)
  | 'value_chain'        // Porter's Value Chain
  | 'blue_ocean'         // Blue Ocean Strategy Canvas
  | 'tam_sam_som'        // TAM/SAM/SOM Market Sizing
  // Storytelling & Narrative
  | 'pyramid_principle'  // Minto Pyramid Principle (top-down)
  | 'scqa'              // Situation, Complication, Question, Answer
  | 'star'              // Situation, Task, Action, Result
  | 'aida'              // Attention, Interest, Desire, Action
  | 'hero_journey'      // Hero's Journey (3-act structure)
  | 'problem_solution'  // Problem → Solution → Benefit
  // Data & Comparison
  | 'quadrant'          // 2x2 Quadrant (Gartner Magic Quadrant style)
  | 'bridge_waterfall'  // Bridge/Waterfall chart
  | 'funnel'            // Funnel diagram (sales, conversion)
  | 'timeline_roadmap'  // Timeline / Roadmap
  | 'maturity_model'    // Capability Maturity Model
  | 'kpi_dashboard'     // KPI Dashboard layout
  // Process & Flow
  | 'swimlane'          // Swimlane process diagram
  | 'gantt'             // Gantt chart / project plan
  | 'decision_tree'     // Decision tree
  | 'customer_journey'  // Customer journey map
  | 'ecosystem_map'     // Ecosystem / stakeholder map
  // McKinsey / BCG / Bain style
  | 'mckinsey_7s'       // McKinsey 7-S Framework
  | 'three_horizons'    // Three Horizons of Growth
  | 'ge_matrix'         // GE-McKinsey Matrix
  | 'exec_summary'      // Executive Summary (insight → so what → now what)
  | 'custom_framework'; // User-defined framework

export interface SlideFrameworkConfig {
  framework: SlideFramework;
  label: string;
  description: string;
  slideCount: number;                  // Typical number of slides
  dataPoints?: string[];               // What data to fill in
  colorScheme?: 'brand' | 'neutral' | 'bold' | 'muted';
  animations?: 'none' | 'subtle' | 'full';
}

export const SLIDE_FRAMEWORKS: SlideFrameworkConfig[] = [
  { framework: 'swot', label: 'SWOT Analysis', description: '2x2 grid — Strengths, Weaknesses, Opportunities, Threats', slideCount: 2, dataPoints: ['strengths', 'weaknesses', 'opportunities', 'threats'] },
  { framework: 'porters_five', label: "Porter's Five Forces", description: 'Competitive analysis — bargaining power, rivalry, substitutes, new entrants', slideCount: 3 },
  { framework: 'pestle', label: 'PESTLE Analysis', description: 'Macro-environment scan across 6 dimensions', slideCount: 3 },
  { framework: 'bcg_matrix', label: 'BCG Matrix', description: 'Stars, Cash Cows, Question Marks, Dogs quadrant', slideCount: 2 },
  { framework: 'tam_sam_som', label: 'TAM/SAM/SOM', description: 'Market sizing with nested circles', slideCount: 2 },
  { framework: 'pyramid_principle', label: 'Pyramid Principle', description: 'Answer-first structure with supporting arguments', slideCount: 5 },
  { framework: 'scqa', label: 'SCQA', description: 'Situation → Complication → Question → Answer', slideCount: 4 },
  { framework: 'aida', label: 'AIDA', description: 'Attention → Interest → Desire → Action', slideCount: 4 },
  { framework: 'hero_journey', label: "Hero's Journey", description: '3-act story structure with transformation arc', slideCount: 6 },
  { framework: 'problem_solution', label: 'Problem → Solution', description: 'Problem, agitate, solve, benefit, CTA', slideCount: 5 },
  { framework: 'quadrant', label: 'Quadrant Analysis', description: '2x2 positioning matrix (e.g., cost vs. value)', slideCount: 2 },
  { framework: 'funnel', label: 'Funnel Diagram', description: 'Conversion funnel with stage metrics', slideCount: 2 },
  { framework: 'timeline_roadmap', label: 'Timeline / Roadmap', description: 'Horizontal timeline with milestones', slideCount: 2 },
  { framework: 'customer_journey', label: 'Customer Journey', description: 'Stage-by-stage journey with touchpoints', slideCount: 3 },
  { framework: 'mckinsey_7s', label: 'McKinsey 7-S', description: 'Strategy, Structure, Systems, Skills, Staff, Style, Shared Values', slideCount: 3 },
  { framework: 'three_horizons', label: 'Three Horizons', description: 'Core business → Adjacent → Transformational growth', slideCount: 2 },
  { framework: 'exec_summary', label: 'Executive Summary', description: 'Insight → So What → Now What', slideCount: 3 },
  { framework: 'kpi_dashboard', label: 'KPI Dashboard', description: 'Key metrics with gauges, charts, and trend arrows', slideCount: 2 },
  { framework: 'blue_ocean', label: 'Blue Ocean Strategy', description: 'Strategy canvas — eliminate, reduce, raise, create', slideCount: 3 },
  { framework: 'custom_framework', label: 'Custom Framework', description: 'Define your own slide structure', slideCount: 1 },
];

// ─── Character & Visual Rendering Styles ─────────────────────────────────────

/** Character art style — Pixar, anime, flat, realistic, etc. */
export type CharacterStyle =
  // 3D Styles
  | 'pixar_3d'           // Pixar/Disney-quality 3D characters (expressive, rounded)
  | 'dreamworks_3d'      // DreamWorks 3D (slightly more stylized, edgy)
  | 'realistic_3d'       // Photorealistic 3D human (Unreal MetaHuman style)
  | 'claymation_3d'      // Stop-motion clay style (Wallace & Gromit)
  | 'low_poly_3d'        // Low-poly geometric style (abstract, modern)
  | 'voxel_3d'           // Voxel/Minecraft-style blocky characters
  | 'chibi_3d'           // Chibi/SD style (oversized head, tiny body)
  // 2D Styles
  | 'flat_2d'            // Flat design (Material Design inspired)
  | 'vector_2d'          // Clean vector illustration (Dribbble style)
  | 'watercolor_2d'      // Hand-painted watercolor aesthetic
  | 'sketch_2d'          // Pencil sketch / hand-drawn
  | 'comic_2d'           // Comic book / graphic novel
  | 'anime_2d'           // Japanese anime style
  | 'manga_2d'           // Black & white manga style
  | 'pixel_art_2d'       // Retro pixel art
  | 'paper_cut_2d'       // Paper cutout / collage style
  | 'sticker_2d'         // Sticker/emoji style (bold outline, simple)
  | 'blueprint_2d'       // Technical blueprint / wireframe
  // Cinematic Styles
  | 'cinematic_real'     // Film-quality live-action look
  | 'cinematic_noir'     // Film noir (high contrast, shadows)
  | 'cinematic_scifi'    // Sci-fi cinematic (Blade Runner, Tron)
  | 'cinematic_fantasy'  // Fantasy cinematic (Lord of the Rings)
  | 'cinematic_wes'      // Wes Anderson symmetry + pastel palette
  // Abstract / Artistic
  | 'abstract'           // Non-representational geometric art
  | 'surreal'            // Surrealist (Dali-style, impossible)
  | 'pop_art'            // Pop art (Warhol, Lichtenstein)
  | 'art_deco'           // Art Deco (geometric, gold, 1920s)
  | 'ukiyo_e'            // Japanese woodblock print style
  | 'custom_character';  // User-defined character style

/** Character size / scale relative to scene */
export type CharacterScale =
  | 'full_body'          // Full body visible (head to toe)
  | 'three_quarter'      // 3/4 body (waist up, casual standing)
  | 'medium_shot'        // Medium shot (chest up, classic presenter)
  | 'close_up'           // Close up (face and shoulders)
  | 'extreme_close_up'   // Extreme close up (face fills frame)
  | 'wide_group'         // Wide shot with multiple characters
  | 'over_shoulder'      // Over-the-shoulder perspective
  | 'miniature'          // Tiny character in large scene (for scale)
  | 'pip_corner'         // Small picture-in-picture character
  | 'custom_scale';      // User-defined

/** Visual rendering mode — determines the overall visual processing pipeline */
export type RenderingMode =
  | 'photorealistic'     // As close to real photography as possible
  | 'stylized_3d'        // Stylized 3D (Pixar, DreamWorks)
  | 'cel_shaded'         // Cel-shaded / toon rendering
  | 'flat_design'        // Flat 2D with minimal shadows
  | 'isometric'          // Isometric 3D projection (technical/gaming)
  | 'watercolor'         // Watercolor paint rendering
  | 'oil_painting'       // Oil painting texture
  | 'pencil_sketch'      // Pencil/charcoal sketch
  | 'neon_glow'          // Neon/cyberpunk glow effect
  | 'vintage_film'       // 8mm / Super 8 film grain
  | 'infrared'           // Infrared photography look
  | 'miniature'          // Tilt-shift miniature effect
  | 'holographic'        // Holographic / translucent 3D
  | 'wireframe'          // 3D wireframe visualization
  | 'mixed_media'        // Combination of 2D + 3D + real footage
  | 'custom_render';     // User-defined

/** Scene character configuration */
export interface SceneCharacterConfig {
  characterStyle: CharacterStyle;
  characterScale: CharacterScale;
  count: number;                       // How many characters (1 = solo, 2+ = conversation)
  roles?: string[];                    // Character roles (e.g., ['presenter', 'interviewer'])
  expressions?: ('neutral' | 'happy' | 'serious' | 'excited' | 'thoughtful' | 'concerned')[];
  customPrompt?: string;               // Custom character description
}

/** Scene rendering configuration */
export interface SceneRenderConfig {
  renderingMode: RenderingMode;
  characterConfig?: SceneCharacterConfig;
  slideFramework?: SlideFramework;
  slideFrameworkConfig?: Partial<SlideFrameworkConfig>;
  /** Lighting preset for the scene */
  lighting?: 'natural' | 'studio' | 'dramatic' | 'warm' | 'cool' | 'neon' | 'golden_hour' | 'moody';
  /** Color grading preset */
  colorGrade?: 'none' | 'cinematic_teal_orange' | 'warm_vintage' | 'cool_blue' | 'desaturated' | 'vibrant' | 'noir_bw' | 'pastel';
  /** Depth of field */
  depthOfField?: 'deep' | 'shallow' | 'tilt_shift' | 'none';
  /** Film grain intensity 0-1 */
  filmGrain?: number;
}

/** Extended chapter with scene-level creative freedom */
export interface CompositionScene extends CompositionChapter {
  // Scenario context — what kind of content this scene is part of
  scenario?: ContentScenario;

  // Visual generation pipeline — how the visual was made & what enhancements to apply
  visualPipeline?: VisualGenerationPipeline;

  // Multi-layer visual composition
  visualLayers?: SceneVisualLayer[];

  // B-roll overlays
  bRoll?: SceneBRoll[];

  // Per-scene style (overrides project-level)
  sceneStyle?: SceneStyle;
  stylePrompt?: string;

  // Motion preset for this scene
  motionPreset?: MotionPreset;

  // Size variants — same scene at different dimensions (user picks which to export)
  sizeVariants?: SizeVariant[];

  // Rendering configuration — rendering mode, character style, lighting, color grade
  renderConfig?: SceneRenderConfig;

  // Slide framework for presentation scenes
  slideFramework?: SlideFramework;

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
  type:
    | 'style'           // Scene visual style
    | 'broll'           // B-roll footage
    | 'duration'        // Duration adjustment
    | 'transition'      // Transition between scenes
    | 'music'           // Background music
    | 'format'          // Output format
    | 'caption'         // Captions/subtitles
    | 'thumbnail'       // Thumbnail selection
    | 'clip'            // Clip extraction
    | 'reorder'         // Scene reordering
    | 'add_scene'       // Missing scene suggestion
    | 'transcreation'   // Regional adaptation
    // Scenario & visual pipeline recommendations
    | 'scenario'        // Scenario-based pipeline recommendation
    | 'visual_source'   // How to source the visual (screen capture, AI generate, etc.)
    | 'visual_enhance'  // AI enhance existing visuals
    | 'motion'          // Motion preset for the scene
    | 'size_variant'    // Additional size/aspect ratio variants
    | 'combination'     // Multi-step pipeline combination
    | 'regenerate'      // Regenerate with different settings for better quality
    // Framework, character & rendering recommendations
    | 'slide_framework' // Consulting framework for presentation slides
    | 'character_style' // Character art style (Pixar, anime, flat, realistic, etc.)
    | 'rendering_mode'; // Rendering pipeline (photorealistic, cel-shaded, watercolor, etc.)
  sceneId?: string;
  title: string;
  description: string;
  confidence: number;         // 0-1 how confident the AI is
  reason: string;             // Why this is recommended
  action: Record<string, unknown>;  // Data to apply if accepted
  /** For combination recommendations — ordered list of steps */
  combinationSteps?: Array<{
    step: number;
    label: string;
    pipelineId?: string;      // Edge function or pipeline reference
    description: string;
  }>;
  /** Alternative choices — user picks one, not forced into any */
  alternatives?: Array<{
    label: string;
    action: Record<string, unknown>;
  }>;
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

  // Project-level scenario (individual scenes can override)
  scenario?: ContentScenario;

  // Global settings
  globalSettings: {
    defaultAvatarStyle?: AvatarStyle;
    defaultVoiceProvider?: string;
    defaultSceneStyle?: SceneStyle;
    defaultMotionPreset?: MotionPreset;
    defaultVisualSource?: VisualSource;
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
