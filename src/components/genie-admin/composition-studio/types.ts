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
  // ─── Product & SaaS ──────────────────────────────────────────────────────
  | 'product_video'            // Software/app demo — screen capture + AI enhance + voiceover
  | 'product_launch'           // New product announcement — cinematic + avatar + 3D
  | 'product_walkthrough'      // Detailed feature walkthrough — screen + tooltips + voiceover
  | 'product_comparison'       // Product vs competitor — split screen + data + scores
  | 'product_unboxing'         // Physical product reveal — 3D orbit + cinematic + close-ups
  | 'saas_onboarding'          // App onboarding flow — screen capture + animated tooltips
  | 'saas_feature_update'      // Release notes video — screen + kinetic text + changelog
  | 'api_documentation'        // API demo — code editor + screen + diagrams
  | 'mobile_app_preview'       // Mobile app showcase — device mockup + scroll + tap animations
  // ─── Marketing & Sales ───────────────────────────────────────────────────
  | 'social_promo'             // Short social clip — AI video + music + captions
  | 'brand_story'              // Brand narrative — cinematic + B-roll + avatar
  | 'testimonial_video'        // Customer story — avatar or real video + captions
  | 'comparison_review'        // Side-by-side — split screen + data viz + voiceover
  | 'ad_creative'              // Paid ad — hook + problem + solution + CTA (15-60s)
  | 'seasonal_campaign'        // Holiday/season campaign — themed visuals + offers
  | 'influencer_collab'        // Influencer-style — casual avatar + B-roll + music
  | 'email_video'              // Email embed video — GIF/short + CTA overlay
  | 'landing_page_hero'        // Website hero — looping cinematic + text overlay
  | 'retargeting_ad'           // Retargeting — personalized + dynamic content
  | 'coupon_offer'             // Flash sale / coupon — kinetic text + countdown + urgency
  // ─── Education & Training ────────────────────────────────────────────────
  | 'explainer'                // How-it-works — whiteboard/animation + voiceover
  | 'training_tutorial'        // Internal training — screen capture + voiceover + slides
  | 'course_lecture'           // E-learning lecture — avatar + slides + quiz cards
  | 'microlearning'            // Bite-size lesson (60-120s) — animation + quiz
  | 'language_lesson'          // Language learning — dual-language subtitles + pronunciation
  | 'certification_prep'       // Exam prep — slides + practice questions + timer
  | 'safety_training'          // Workplace safety — animation + scenarios + compliance
  | 'student_presentation'     // Student project — slides + narration + data
  | 'kids_educational'         // Children's content — colorful animation + characters + songs
  // ─── Business & Corporate ────────────────────────────────────────────────
  | 'investor_pitch'           // Investor deck — slides + avatar + live data
  | 'webinar_recording'        // Live webinar — screen + avatar PiP + slides
  | 'board_presentation'       // Board meeting — formal slides + exec summary + financials
  | 'quarterly_report'         // QBR — KPI dashboards + trends + commentary
  | 'company_all_hands'        // All-hands meeting — avatar CEO + slides + culture
  | 'recruitment_video'        // Hiring video — office B-roll + team avatars + culture
  | 'employee_onboarding'      // New hire — company overview + processes + welcome
  | 'internal_comms'           // Internal update — avatar + slides + announcements
  | 'sales_enablement'         // Sales deck — product slides + ROI calculator + demo
  | 'proposal_presentation'    // Client proposal — problem + solution + pricing + timeline
  | 'annual_report'            // Annual report — data viz + milestones + outlook
  | 'change_management'        // Org change comms — timeline + impact + FAQ
  // ─── Data & Research ─────────────────────────────────────────────────────
  | 'ppt_to_cinematic'         // PPT slides → 3D → cinematic video
  | 'market_analysis'          // Market research — data, stats, graphs, sources
  | 'data_story'               // Data storytelling — statistics → narrative video
  | 'case_study_video'         // Case study — before/after, journey, metrics
  | 'infographic_video'        // Infographic → animated video
  | 'research_presentation'    // Academic research — methodology + findings + charts
  | 'survey_results'           // Survey/poll results — animated bar/pie + insights
  | 'competitive_intelligence' // Competitor analysis — quadrant + comparison + SWOT
  | 'trend_report'             // Industry trends — timeline + predictions + expert quotes
  | 'white_paper_video'        // White paper → video summary with key data points
  // ─── Healthcare & Pharma ─────────────────────────────────────────────────
  | 'patient_education'        // Patient info — simple animation + medical illustration
  | 'hcp_training'             // Healthcare professional — clinical data + protocols
  | 'clinical_trial_summary'   // Trial results — data viz + endpoints + p-values
  | 'drug_mechanism'           // Mechanism of action — 3D molecular animation
  | 'telemedicine_guide'       // Telehealth how-to — screen + avatar doctor
  | 'wellness_tips'            // Health tips — friendly animation + lifestyle B-roll
  | 'medical_device_demo'      // Device demo — 3D model + usage steps + safety
  // ─── Real Estate & Property ──────────────────────────────────────────────
  | 'real_estate_tour'         // Property walkthrough — video/3D + voiceover + map
  | 'virtual_staging'          // Empty room → furnished — before/after + 3D
  | 'neighborhood_guide'       // Area overview — map + POI + B-roll + lifestyle
  | 'property_investment'      // Investment pitch — ROI data + comparables + projections
  | 'construction_progress'    // Build update — timeline + drone footage + milestones
  // ─── E-commerce & Retail ─────────────────────────────────────────────────
  | 'product_showcase'         // E-commerce listing — 3D orbit + features + specs
  | 'fashion_lookbook'         // Fashion collection — cinematic + model + styling
  | 'recipe_demo'              // Cooking/DIY — overhead cam + steps + voiceover
  | 'unboxing_review'          // Unboxing experience — close-up + reaction + verdict
  | 'size_guide'               // Size/fit guide — model + measurements + AR try-on
  | 'flash_sale'               // Limited offer — countdown + product highlights + urgency
  // ─── Travel & Hospitality ────────────────────────────────────────────────
  | 'destination_showcase'     // Travel destination — drone + B-roll + itinerary
  | 'hotel_tour'               // Hotel/resort — room walkthrough + amenities + booking
  | 'restaurant_promo'         // Restaurant — food close-ups + ambiance + menu
  | 'travel_vlog'              // Travel diary — multiple locations + narration + map
  | 'experience_package'       // Tour package — itinerary + pricing + highlights
  // ─── Entertainment & Media ───────────────────────────────────────────────
  | 'music_video'              // Music content — cinematic + effects + lyrics
  | 'movie_trailer'            // Film trailer — dramatic cuts + voiceover + score
  | 'podcast_episode'          // Audio-first — TTS/recording + audiogram
  | 'gaming_stream'            // Gaming content — screen capture + face cam + overlay
  | 'event_highlight'          // Event recap — B-roll montage + music + captions
  | 'sports_highlight'         // Sports recap — action clips + stats + commentary
  | 'comedy_sketch'            // Comedy content — multi-avatar + timing + effects
  | 'documentary_short'        // Mini-doc — interviews + B-roll + narration
  | 'book_trailer'             // Book promo — atmospheric visuals + quotes + narration
  // ─── Nonprofit & Government ──────────────────────────────────────────────
  | 'fundraising_appeal'       // Donation ask — emotional story + impact data + CTA
  | 'impact_report'            // Impact metrics — before/after + beneficiary stories
  | 'public_service'           // PSA — awareness + call to action + resources
  | 'government_report'        // Gov data — charts + policy + transparency
  | 'ngo_campaign'             // Campaign video — cause + story + volunteer CTA
  // ─── Finance & Legal ─────────────────────────────────────────────────────
  | 'financial_report'         // Financial results — charts + KPIs + commentary
  | 'investment_thesis'        // Investment analysis — data + thesis + risk factors
  | 'compliance_training'      // Regulatory compliance — rules + scenarios + quiz
  | 'insurance_explainer'      // Policy explanation — animation + scenarios + coverage
  | 'tax_guide'                // Tax tips/guide — step-by-step + calculator + deadlines
  // ─── Automotive & Manufacturing ──────────────────────────────────────────
  | 'vehicle_showcase'         // Car/vehicle — 3D orbit + interior + specs + test drive
  | 'manufacturing_process'    // Factory process — step-by-step + quality + safety
  | 'maintenance_guide'        // Repair/maintenance — 3D exploded view + steps
  // ─── Architecture & Design ───────────────────────────────────────────────
  | 'architectural_walkthrough' // Building walkthrough — 3D render + floor plans + VR
  | 'interior_design'          // Interior showcase — before/after + mood boards
  | 'landscape_design'         // Landscape/garden — aerial + 3D + seasonal views
  // ─── Agriculture & Environment ───────────────────────────────────────────
  | 'farm_showcase'            // Farm/agriculture — drone + process + sustainability
  | 'sustainability_report'    // ESG/sustainability — metrics + initiatives + impact
  | 'environmental_awareness'  // Climate/environment — data viz + impact + call to action
  // ─── Events & Ceremonies ─────────────────────────────────────────────────
  | 'wedding_highlight'        // Wedding recap — cinematic + music + photo montage
  | 'conference_recap'         // Conference — speaker clips + key takeaways + slides
  | 'award_ceremony'           // Awards — nominee intros + winner reveals + highlights
  | 'birthday_celebration'     // Birthday/anniversary — photo montage + music + message
  // ─── Regional / Cultural Specific ────────────────────────────────────────
  | 'ramadan_campaign'         // Ramadan-themed — cultural sensitivity + iftar + charity
  | 'diwali_campaign'          // Diwali-themed — lights + celebration + offers
  | 'lunar_new_year'           // Chinese/Lunar NY — red/gold + family + traditions
  | 'christmas_campaign'       // Christmas — festive + gifts + seasonal offers
  | 'national_day'             // National day celebration — patriotic + history + pride
  | 'eid_campaign'             // Eid celebration — family + food + community
  | 'thanksgiving_campaign'    // Thanksgiving — gratitude + family + seasonal
  | 'golden_week'              // Japan Golden Week — travel + culture + offers
  | 'carnival_campaign'        // Brazil Carnival — music + dance + celebration
  | 'holi_campaign'            // Holi festival — colors + joy + community
  // ─── Multi-Format & Cross-Platform ───────────────────────────────────────
  | 'youtube_series'           // YouTube series — intro + chapters + outro + cards
  | 'tiktok_series'            // TikTok series — hook + story + stitch-ready
  | 'instagram_carousel'       // IG carousel — slide-by-slide + swipe CTA
  | 'linkedin_thought_piece'   // LinkedIn article → video with data + expertise
  | 'newsletter_video'         // Newsletter embed — summary + key points + CTA
  | 'podcast_to_video'         // Podcast → video podcast (add visuals to audio)
  | 'blog_to_video'            // Blog post → narrated video with visuals
  | 'presentation_to_video'    // Full PPT → video with narration + transitions
  // ─── Custom ──────────────────────────────────────────────────────────────
  | 'custom_scenario';         // User-defined

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
  // ─── Strategy & Analysis (Consulting) ────────────────────────────────────
  | 'swot'                    // SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
  | 'porters_five'            // Porter's Five Forces
  | 'pestle'                  // PESTLE Analysis (Political, Economic, Social, Tech, Legal, Environmental)
  | 'bcg_matrix'              // BCG Growth-Share Matrix
  | 'ansoff_matrix'           // Ansoff Matrix (Market Penetration, Development, etc.)
  | 'value_chain'             // Porter's Value Chain
  | 'blue_ocean'              // Blue Ocean Strategy Canvas
  | 'tam_sam_som'             // TAM/SAM/SOM Market Sizing
  | 'mckinsey_7s'             // McKinsey 7-S Framework
  | 'three_horizons'          // Three Horizons of Growth
  | 'ge_matrix'               // GE-McKinsey Matrix
  | 'exec_summary'            // Executive Summary (insight → so what → now what)
  | 'balanced_scorecard'      // Kaplan & Norton Balanced Scorecard (4 perspectives)
  | 'okr_framework'           // OKR (Objectives & Key Results)
  | 'vrio_analysis'           // VRIO (Value, Rarity, Imitability, Organization)
  | 'stakeholder_matrix'      // Power/Interest stakeholder matrix
  | 'risk_matrix'             // Probability/Impact risk assessment matrix
  | 'business_model_canvas'   // Osterwalder Business Model Canvas (9 blocks)
  | 'lean_canvas'             // Lean Startup Canvas
  | 'value_proposition_canvas' // Value Proposition Canvas (jobs, pains, gains)
  | 'jobs_to_be_done'         // Jobs-to-be-Done framework
  | 'five_whys'               // Root cause analysis — 5 Whys
  | 'fishbone_diagram'        // Ishikawa / Fishbone cause-effect diagram
  | 'pareto_chart'            // 80/20 Pareto analysis
  | 'moscow_prioritization'   // MoSCoW (Must/Should/Could/Won't)
  | 'kano_model'              // Kano customer satisfaction model
  | 'raci_matrix'             // RACI (Responsible, Accountable, Consulted, Informed)
  | 'impact_effort_matrix'    // Impact vs Effort 2x2 for prioritization
  | 'swot_tows'               // TOWS matrix (SWOT-derived strategies)
  | 'core_competency'         // Prahalad & Hamel Core Competency framework
  // ─── Storytelling & Narrative ────────────────────────────────────────────
  | 'pyramid_principle'       // Minto Pyramid Principle (top-down)
  | 'scqa'                    // Situation, Complication, Question, Answer
  | 'star'                    // Situation, Task, Action, Result
  | 'aida'                    // Attention, Interest, Desire, Action
  | 'hero_journey'            // Hero's Journey (3-act structure)
  | 'problem_solution'        // Problem → Solution → Benefit
  | 'pas_framework'           // Problem, Agitate, Solve
  | 'bab_framework'           // Before, After, Bridge
  | 'faq_format'              // Question → Answer sequential format
  | 'listicle'                // Top N list format (5 reasons, 10 tips, etc.)
  | 'story_arc'               // 5-act story arc (exposition → rising → climax → falling → resolution)
  | 'case_narrative'          // Case study narrative (challenge → approach → result)
  | 'comparison_narrative'    // Then vs Now / Old Way vs New Way
  | 'day_in_the_life'         // Walk through a day/journey
  // ─── Data & Comparison ───────────────────────────────────────────────────
  | 'quadrant'                // 2x2 Quadrant (Gartner Magic Quadrant style)
  | 'bridge_waterfall'        // Bridge/Waterfall chart
  | 'funnel'                  // Funnel diagram (sales, conversion)
  | 'timeline_roadmap'        // Timeline / Roadmap
  | 'maturity_model'          // Capability Maturity Model
  | 'kpi_dashboard'           // KPI Dashboard layout
  | 'scorecard'               // Scorecard with metrics and RAG status
  | 'leaderboard'             // Ranked leaderboard / top-N
  | 'cohort_analysis'         // Cohort retention / behavior matrix
  | 'correlation_matrix'      // Variable correlation heatmap
  | 'histogram'               // Frequency distribution histogram
  | 'box_whisker'             // Box and whisker statistical chart
  | 'candlestick'             // Financial candlestick chart
  | 'waterfall_financial'     // Revenue/cost waterfall (financial bridge)
  | 'sparkline_grid'          // Grid of sparkline mini-charts for KPIs
  | 'bullet_chart'            // Bullet chart (performance vs target)
  | 'slope_chart'             // Slope chart (before/after comparison)
  | 'dumbbell_chart'          // Dumbbell chart (range comparison)
  | 'small_multiples'         // Small multiples / trellis charts
  // ─── Process & Flow ──────────────────────────────────────────────────────
  | 'swimlane'                // Swimlane process diagram
  | 'gantt'                   // Gantt chart / project plan
  | 'decision_tree'           // Decision tree
  | 'customer_journey'        // Customer journey map
  | 'ecosystem_map'           // Ecosystem / stakeholder map
  | 'service_blueprint'       // Service design blueprint (frontstage/backstage)
  | 'user_flow'               // User flow / wireflow diagram
  | 'state_machine'           // State machine / status flow diagram
  | 'value_stream_map'        // Lean value stream mapping
  | 'architecture_diagram'    // System / tech architecture diagram
  | 'data_flow'               // Data flow diagram (sources → transformations → outputs)
  | 'er_diagram'              // Entity-relationship diagram
  | 'sequence_diagram'        // UML sequence diagram
  | 'deployment_diagram'      // Infrastructure / deployment topology
  | 'kanban_board'            // Kanban board visualization
  | 'sprint_board'            // Agile sprint board (backlog → in progress → done)
  | 'dependency_map'          // Dependency / prerequisite map
  | 'critical_path'           // Critical path method diagram
  // ─── Visualization & Infographic ─────────────────────────────────────────
  | 'infographic'             // Full-page infographic layout (data + icons + text)
  | 'data_dashboard'          // Multi-chart dashboard (KPIs, gauges, trends)
  | 'comparison_table'        // Feature comparison matrix / checklist table
  | 'org_chart'               // Organizational hierarchy chart
  | 'mind_map'                // Radial mind map / concept map
  | 'process_flow'            // Step-by-step process flow diagram
  | 'venn_diagram'            // Venn / Euler diagram (overlap relationships)
  | 'sankey_flow'             // Sankey diagram (flow quantities between stages)
  | 'geographic_map'          // Map-based visualization (heatmap, pin map, choropleth)
  | 'network_graph'           // Network / relationship graph (nodes + edges)
  | 'treemap'                 // Treemap (hierarchical proportional rectangles)
  | 'radar_chart'             // Radar / spider chart (multi-axis comparison)
  | 'bubble_chart'            // Bubble chart (3-dimensional scatter)
  | 'gauge_meter'             // Gauge / meter visualization (progress, score)
  | 'before_after'            // Before/After comparison (split view)
  | 'stat_callout'            // Big number / statistic callout with context
  | 'donut_chart'             // Donut / ring chart (proportional with center metric)
  | 'sunburst'                // Sunburst diagram (hierarchical ring chart)
  | 'chord_diagram'           // Chord diagram (relationship flow between categories)
  | 'word_cloud'              // Word cloud / tag cloud visualization
  | 'icon_array'              // Icon/pictogram array (people, items, objects)
  | 'waffle_chart'            // Waffle chart (grid-based proportional)
  | 'isotype_chart'           // Isotype pictorial chart (rows of icons)
  | 'alluvial_diagram'        // Alluvial / parallel sets diagram (categorical flow)
  | 'force_directed_graph'    // Force-directed network graph (physics simulation)
  | 'heatmap_calendar'        // Calendar heatmap (GitHub-style activity map)
  | 'density_map'             // Geographic density / point cloud map
  | 'choropleth_map'          // Choropleth (color-coded regions by value)
  | 'pin_map'                 // Pin/marker map with location data
  | 'route_map'               // Route/path visualization on map
  | 'floor_plan'              // Floor plan / spatial layout diagram
  // ─── Healthcare & Science ────────────────────────────────────────────────
  | 'anatomy_diagram'         // Anatomical illustration with labels
  | 'molecular_structure'     // 3D molecular / chemical structure
  | 'clinical_trial_phases'   // Clinical trial phase progression (I → II → III → IV)
  | 'patient_pathway'         // Patient care pathway / treatment journey
  | 'dose_response_curve'     // Pharmacological dose-response curve
  | 'survival_curve'          // Kaplan-Meier survival analysis curve
  | 'epidemiology_map'        // Disease prevalence / spread map
  // ─── Financial & Accounting ──────────────────────────────────────────────
  | 'income_statement'        // P&L / income statement layout
  | 'balance_sheet'           // Balance sheet visualization
  | 'cash_flow'               // Cash flow waterfall
  | 'cap_table'               // Capitalization table (equity ownership)
  | 'financial_projections'   // Revenue/cost projections with scenarios
  | 'unit_economics'          // Unit economics breakdown (LTV, CAC, payback)
  | 'pricing_table'           // Pricing tier comparison table
  | 'roi_calculator'          // ROI / payback calculator visualization
  // ─── Real Estate & Property ──────────────────────────────────────────────
  | 'property_comparison'     // Property comparison grid (features, price, location)
  | 'market_comps'            // Comparable property analysis
  | 'investment_returns'      // Real estate ROI / cap rate analysis
  | 'neighborhood_profile'    // Neighborhood stats (schools, transit, demographics)
  // ─── Education & Academic ────────────────────────────────────────────────
  | 'periodic_table'          // Periodic table style grid visualization
  | 'taxonomy'                // Taxonomy / classification hierarchy
  | 'concept_ladder'          // Concept abstraction ladder
  | 'bloom_taxonomy'          // Bloom's Taxonomy pyramid
  | 'learning_objectives'     // Learning objectives + assessment alignment
  | 'quiz_card'               // Interactive quiz / poll / assessment card
  // ─── Project Management ──────────────────────────────────────────────────
  | 'milestone_timeline'      // Project milestone timeline with dependencies
  | 'resource_allocation'     // Resource allocation / capacity chart
  | 'burndown_chart'          // Sprint burndown / burnup chart
  | 'workload_heatmap'        // Team workload heatmap by week/sprint
  | 'risk_register'           // Risk register table with ratings
  // ─── Custom ──────────────────────────────────────────────────────────────
  | 'custom_framework';       // User-defined framework

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
  // Visualization & Infographic frameworks
  { framework: 'infographic', label: 'Infographic', description: 'Full-page data infographic with icons, stats, and flow', slideCount: 2, dataPoints: ['title', 'sections', 'stats', 'icons'] },
  { framework: 'data_dashboard', label: 'Data Dashboard', description: 'Multi-chart dashboard with KPIs, gauges, and trend lines', slideCount: 2, dataPoints: ['kpis', 'charts', 'trends'] },
  { framework: 'comparison_table', label: 'Comparison Table', description: 'Feature matrix comparing options side-by-side', slideCount: 1, dataPoints: ['features', 'options', 'ratings'] },
  { framework: 'org_chart', label: 'Org Chart', description: 'Organizational hierarchy with roles and reporting lines', slideCount: 1, dataPoints: ['nodes', 'relationships'] },
  { framework: 'mind_map', label: 'Mind Map', description: 'Radial concept map with central idea and branches', slideCount: 1, dataPoints: ['center', 'branches', 'sub_branches'] },
  { framework: 'process_flow', label: 'Process Flow', description: 'Step-by-step process with decision points and outcomes', slideCount: 2, dataPoints: ['steps', 'decisions', 'outcomes'] },
  { framework: 'venn_diagram', label: 'Venn Diagram', description: 'Overlapping circles showing relationships and intersections', slideCount: 1, dataPoints: ['sets', 'intersections'] },
  { framework: 'sankey_flow', label: 'Sankey Flow', description: 'Flow diagram showing quantities between stages (budget, conversion)', slideCount: 1, dataPoints: ['sources', 'targets', 'values'] },
  { framework: 'geographic_map', label: 'Geographic Map', description: 'Map-based data viz — heatmap, pins, regional coloring', slideCount: 1, dataPoints: ['regions', 'values', 'markers'] },
  { framework: 'network_graph', label: 'Network Graph', description: 'Node-and-edge relationship diagram (partnerships, integrations)', slideCount: 1, dataPoints: ['nodes', 'edges', 'weights'] },
  { framework: 'treemap', label: 'Treemap', description: 'Hierarchical proportional rectangles (budget breakdown, market share)', slideCount: 1, dataPoints: ['categories', 'values'] },
  { framework: 'radar_chart', label: 'Radar Chart', description: 'Multi-axis spider chart for capability comparison', slideCount: 1, dataPoints: ['axes', 'values', 'comparisons'] },
  { framework: 'bubble_chart', label: 'Bubble Chart', description: '3D scatter with size as third dimension (market map)', slideCount: 1, dataPoints: ['x_axis', 'y_axis', 'size', 'labels'] },
  { framework: 'gauge_meter', label: 'Gauge / Score Meter', description: 'Progress gauges, NPS scores, completion meters', slideCount: 1, dataPoints: ['metrics', 'targets', 'values'] },
  { framework: 'before_after', label: 'Before / After', description: 'Split-view comparison of before and after states', slideCount: 1, dataPoints: ['before', 'after', 'metrics'] },
  { framework: 'stat_callout', label: 'Statistic Callout', description: 'Big number hero stat with supporting context and source', slideCount: 1, dataPoints: ['stat', 'label', 'context', 'source'] },
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

// ─── Data Sources, References & Citations ────────────────────────────────────

/** Where a piece of data or claim came from — for transparency and verification */
export interface DataSource {
  id: string;
  /** Source type */
  type: 'url' | 'api' | 'google_places' | 'uploaded_file' | 'user_input' | 'ai_generated' | 'database' | 'research_paper';
  /** Display label (e.g., "Statista 2025", "Google Places API") */
  label: string;
  /** Source URL (if applicable) */
  url?: string;
  /** Citation text for footnote/reference */
  citation?: string;
  /** When the data was fetched/generated */
  fetchedAt?: string;
  /** Whether the data has been verified by user */
  verified: boolean;
  /** Verification notes from user */
  verificationNotes?: string;
  /** Confidence in data accuracy (0-1) — lower for AI-generated */
  dataConfidence?: number;
  /** The specific data points this source provides */
  dataPoints?: Array<{
    key: string;
    value: string | number;
    unit?: string;
  }>;
}

/** Reference/citation display configuration */
export interface CitationConfig {
  /** Show sources in footnotes, bibliography, or inline */
  displayMode: 'footnote' | 'bibliography' | 'inline' | 'tooltip' | 'hidden';
  /** Citation format */
  format: 'apa' | 'mla' | 'chicago' | 'custom';
  /** Whether to include "AI-generated" disclaimers */
  showAIDisclaimer: boolean;
  /** Custom disclaimer text */
  aiDisclaimerText?: string;
  /** Where to show the disclaimer */
  disclaimerPosition?: 'slide_footer' | 'end_card' | 'voiceover_mention' | 'watermark';
}

// ─── Content Verification & Quality Assurance ────────────────────────────────

/** Verification status for AI-generated content */
export type VerificationStatus = 'unverified' | 'auto_checked' | 'human_verified' | 'flagged' | 'corrected';

/** Content verification result for a scene or data point */
export interface ContentVerification {
  id: string;
  /** What was checked */
  target: 'script' | 'data' | 'claim' | 'statistic' | 'quote' | 'date' | 'name' | 'url';
  /** The specific text/value being verified */
  content: string;
  /** Verification status */
  status: VerificationStatus;
  /** Confidence that the content is accurate (0-1) */
  confidence: number;
  /** Issues found (if any) */
  issues?: Array<{
    type: 'factual_error' | 'outdated' | 'unverifiable' | 'misleading' | 'hallucination' | 'source_mismatch';
    description: string;
    suggestedFix?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  /** Data source backing this claim (if any) */
  sourceId?: string;
  /** Timestamp of verification */
  verifiedAt?: string;
  /** Who verified (user, AI, or both) */
  verifiedBy?: 'ai_auto' | 'human' | 'ai_human_reviewed';
}

// ─── Spell Check, Grammar & Clarity ──────────────────────────────────────────

/** Language quality check result */
export interface LanguageQualityCheck {
  /** Overall readability score (0-100, Flesch-Kincaid style) */
  readabilityScore: number;
  /** Reading level (e.g., "Grade 8", "College") */
  readingLevel: string;
  /** Clarity score (0-100) — how easy the message is to understand */
  clarityScore: number;
  /** Tone analysis */
  tone: 'formal' | 'conversational' | 'persuasive' | 'educational' | 'humorous' | 'urgent';
  /** Spell check results */
  spellCheck: {
    errors: Array<{
      word: string;
      position: number;
      suggestions: string[];
      context: string;        // Surrounding text for context
    }>;
    autoFixApplied: boolean;  // Whether auto-fix was applied
  };
  /** Grammar check results */
  grammarCheck: {
    issues: Array<{
      type: 'grammar' | 'punctuation' | 'style' | 'word_choice' | 'redundancy' | 'passive_voice' | 'jargon';
      text: string;
      position: number;
      suggestion: string;
      severity: 'info' | 'warning' | 'error';
    }>;
  };
  /** Consistency checks across all scenes */
  consistencyCheck?: {
    /** Terminology: same term used consistently (not "product" in one scene, "solution" in another) */
    terminologyIssues: Array<{
      variants: string[];
      suggestedTerm: string;
      sceneIds: string[];
    }>;
    /** Tone consistency across scenes */
    toneConsistent: boolean;
    /** Brand voice alignment score (0-1) */
    brandVoiceScore?: number;
  };
}

/** Per-scene editing state */
export interface SceneEditState {
  /** Whether the scene is in edit mode */
  isEditing: boolean;
  /** Which field is being edited (script, title, visual prompt, etc.) */
  editingField?: 'script' | 'title' | 'visual_prompt' | 'sfx_prompt' | 'music_prompt' | 'caption' | 'data';
  /** Undo stack for this scene's edits */
  undoStack?: string[];
  /** Redo stack for this scene's edits */
  redoStack?: string[];
  /** Auto-save timer (ms since last save) */
  lastAutoSave?: string;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Inline suggestions while editing (AI assist) */
  inlineSuggestions?: Array<{
    position: number;
    original: string;
    suggestion: string;
    type: 'rephrase' | 'grammar' | 'clarity' | 'tone' | 'shorten' | 'expand' | 'data_insert';
    accepted?: boolean;
  }>;
}

// ─── Cross-Format Conversion ─────────────────────────────────────────────────

/** Convert between formats: slides→video, video→podcast, PPT→3D→cinematic, etc. */
export type CrossFormatConversionType =
  | 'slides_to_video'          // PPT/slides → narrated video
  | 'slides_to_cinematic'      // Slides → cinematic storytelling video (3D, effects)
  | 'slides_to_3d'             // Flat slides → 3D rendered slides with depth
  | 'video_to_podcast'         // Extract audio, add intro/outro, format as podcast
  | 'video_to_shorts'          // Long video → short clips (15s/30s/60s)
  | 'video_to_slides'          // Extract key frames → slide deck
  | 'podcast_to_video'         // Audio → video podcast (avatar, waveform, visuals)
  | 'podcast_to_audiogram'     // Audio → animated audiogram for social
  | 'infographic_to_video'     // Static infographic → animated data video
  | 'data_to_infographic'      // Raw data → infographic slide
  | 'data_to_story'            // Raw data → narrative video (data storytelling)
  | 'blog_to_video'            // Blog post text → video
  | 'blog_to_slides'           // Blog post text → slide deck
  | 'custom_conversion';       // User-defined

export interface CrossFormatConversion {
  id: string;
  type: CrossFormatConversionType;
  /** Source scene IDs (input) */
  sourceSceneIds: string[];
  /** Target format for the output */
  targetFormat: SceneOutputFormat;
  /** Conversion-specific settings */
  settings: {
    /** For slides→cinematic: visual style to apply */
    cinematicStyle?: SceneStyle;
    /** For slides→3D: rendering mode */
    renderAs3D?: boolean;
    renderingMode?: RenderingMode;
    /** For slides→video: narration style */
    narrationStyle?: 'voiceover' | 'avatar_presenter' | 'text_only' | 'music_only';
    /** For video→shorts: how to select clips */
    clipSelection?: 'ai_best_moments' | 'equal_segments' | 'manual';
    /** For data→story: narrative arc */
    narrativeArc?: 'chronological' | 'problem_solution' | 'comparison' | 'journey';
    /** Motion/animation intensity for conversions (0-1) */
    animationIntensity?: number;
    /** Whether to preserve original data sources/citations */
    preserveSources?: boolean;
  };
  /** Status of the conversion */
  status: 'pending' | 'converting' | 'complete' | 'error';
  /** Output scene IDs (generated) */
  outputSceneIds?: string[];
}

// ─── Data Visualization for Scenes ───────────────────────────────────────────

/** Visualization chart type for data-driven scenes */
export type ChartType =
  // Basic charts
  | 'bar' | 'stacked_bar' | 'grouped_bar' | 'horizontal_bar'
  | 'line' | 'multi_line' | 'sparkline' | 'step_line'
  | 'area' | 'stacked_area' | 'stream_graph'
  | 'pie' | 'donut' | 'semi_donut' | 'nested_donut'
  // Statistical
  | 'scatter' | 'bubble' | 'box_whisker' | 'violin'
  | 'histogram' | 'density' | 'qq_plot' | 'regression'
  // Comparison
  | 'radar' | 'parallel_coordinates' | 'slope' | 'dumbbell'
  | 'bullet' | 'lollipop' | 'dot_plot'
  // Hierarchical
  | 'treemap' | 'sunburst' | 'icicle' | 'circle_packing'
  | 'dendrogram' | 'taxonomy_tree'
  // Flow & Relationship
  | 'sankey' | 'chord' | 'alluvial' | 'arc_diagram'
  | 'network' | 'force_directed' | 'adjacency_matrix'
  // Heat & Matrix
  | 'heatmap' | 'calendar_heatmap' | 'correlation_matrix'
  | 'waffle' | 'isotype' | 'unit_chart'
  // Gauge & Progress
  | 'gauge' | 'progress_ring' | 'speedometer' | 'thermometer'
  | 'battery' | 'progress_bar'
  // Funnel & Waterfall
  | 'funnel' | 'inverted_funnel' | 'waterfall' | 'bridge'
  // Financial
  | 'candlestick' | 'ohlc' | 'kagi' | 'renko'
  // Time-series
  | 'timeline' | 'gantt' | 'event_timeline' | 'milestone'
  // Geographic
  | 'geographic' | 'choropleth' | 'bubble_map' | 'pin_map'
  | 'flow_map' | 'hexbin_map' | 'tile_map' | 'route_map'
  // Organizational
  | 'org_chart' | 'mind_map' | 'venn' | 'euler'
  | 'decision_tree' | 'flowchart' | 'swimlane'
  // Specialized
  | 'word_cloud' | 'icon_array' | 'pictogram'
  | 'small_multiples' | 'trellis' | 'facet_grid'
  // 3D Charts
  | '3d_bar' | '3d_scatter' | '3d_surface' | '3d_globe'
  // Healthcare/Science
  | 'kaplan_meier' | 'forest_plot' | 'dose_response'
  | 'phylogenetic_tree' | 'molecular_structure'
  // Custom
  | 'custom';

/** Data visualization configuration for a scene */
export interface SceneDataVisualization {
  id: string;
  /** Chart/graph type */
  chartType: ChartType;
  /** Title of the visualization */
  title: string;
  /** Data to visualize */
  data: Array<Record<string, unknown>>;
  /** Data source references */
  dataSources: DataSource[];
  /** Chart-specific config (axes, colors, labels, etc.) */
  chartConfig?: {
    xAxis?: string;
    yAxis?: string;
    colorBy?: string;
    sortBy?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    animated?: boolean;          // Animate data appearing
    animationStyle?: 'count_up' | 'grow' | 'reveal' | 'fade_in' | 'draw';
    colorPalette?: string[];     // Custom colors
    annotations?: Array<{       // Callout annotations on chart
      value: string | number;
      label: string;
      position: 'above' | 'below' | 'left' | 'right';
    }>;
  };
  /** Whether data should be fact-checked */
  requiresVerification: boolean;
  /** Market research / study metadata */
  studyMetadata?: {
    studyName?: string;
    publisher?: string;
    publishDate?: string;
    sampleSize?: number;
    methodology?: string;
    geographicScope?: string;
    confidence?: string;         // e.g., "95% CI"
  };
}

// ─── Industry Verticals ──────────────────────────────────────────────────────

/** Industry vertical — determines default scenarios, frameworks, terminology, and compliance rules */
export type IndustryVertical =
  // Technology
  | 'saas' | 'fintech' | 'edtech' | 'healthtech' | 'proptech' | 'agritech'
  | 'ai_ml' | 'cybersecurity' | 'iot' | 'blockchain' | 'gaming' | 'telecom'
  // Healthcare & Life Sciences
  | 'pharma' | 'biotech' | 'medical_devices' | 'hospitals' | 'telemedicine'
  | 'mental_health' | 'dental' | 'veterinary' | 'clinical_research'
  // Finance & Insurance
  | 'banking' | 'investment' | 'insurance' | 'wealth_management' | 'crypto'
  | 'accounting' | 'payments' | 'lending'
  // Real Estate & Construction
  | 'residential_real_estate' | 'commercial_real_estate' | 'construction'
  | 'architecture' | 'interior_design' | 'property_management'
  // Retail & E-commerce
  | 'fashion' | 'beauty' | 'food_beverage' | 'electronics' | 'luxury_goods'
  | 'grocery' | 'marketplace' | 'direct_to_consumer'
  // Education
  | 'k12_education' | 'higher_education' | 'corporate_training'
  | 'online_courses' | 'language_learning' | 'test_prep'
  // Media & Entertainment
  | 'film_production' | 'music_industry' | 'publishing' | 'sports'
  | 'podcasting' | 'live_events' | 'esports'
  // Travel & Hospitality
  | 'hotels' | 'airlines' | 'restaurants' | 'tourism' | 'cruise'
  | 'car_rental' | 'travel_agency'
  // Automotive & Manufacturing
  | 'automotive' | 'aerospace' | 'manufacturing' | 'logistics'
  | 'supply_chain' | 'energy' | 'oil_gas' | 'mining'
  // Government & Nonprofit
  | 'government' | 'defense' | 'nonprofit' | 'ngo' | 'political'
  | 'public_health' | 'social_services'
  // Agriculture & Environment
  | 'agriculture' | 'farming' | 'forestry' | 'fishery' | 'sustainability'
  // Legal & Professional Services
  | 'legal' | 'consulting' | 'hr_recruiting' | 'marketing_agency'
  | 'pr_communications' | 'research'
  // Other
  | 'general' | 'custom_industry';

export interface IndustryVerticalConfig {
  vertical: IndustryVertical;
  label: string;
  /** Default content scenarios for this industry */
  defaultScenarios: ContentScenario[];
  /** Default slide frameworks commonly used */
  defaultFrameworks: SlideFramework[];
  /** Industry-specific terminology / jargon */
  terminology?: Record<string, string>;
  /** Compliance requirements (e.g., HIPAA for healthcare, SEC for finance) */
  complianceRules?: Array<{
    rule: string;
    description: string;
    severity: 'required' | 'recommended' | 'optional';
  }>;
  /** Industry-specific data source types */
  dataSources?: string[];
  /** Default chart types for this industry */
  preferredCharts?: ChartType[];
  /** Regional considerations for this industry */
  regionalNotes?: Record<string, string>;
}

// ─── Regional Configuration ──────────────────────────────────────────────────

/** Regional zone for provider routing and cultural adaptation */
export type RegionalZone = 'western' | 'cjk' | 'mena' | 'sea' | 'south_asian' | 'latam' | 'africa';

/** Sub-region with specific cultural, linguistic, and regulatory requirements */
export type SubRegion =
  // Western
  | 'us_en' | 'uk_en' | 'ca_en' | 'ca_fr' | 'au_en' | 'nz_en'
  | 'de_de' | 'fr_fr' | 'es_es' | 'it_it' | 'pt_pt' | 'nl_nl'
  | 'be_nl' | 'be_fr' | 'ch_de' | 'ch_fr' | 'ch_it' | 'at_de'
  | 'se_sv' | 'no_no' | 'dk_da' | 'fi_fi' | 'is_is'
  | 'ie_en' | 'pl_pl' | 'cz_cs' | 'hu_hu' | 'ro_ro'
  | 'bg_bg' | 'hr_hr' | 'sk_sk' | 'si_sl' | 'rs_sr'
  | 'gr_el' | 'cy_el' | 'mt_mt' | 'lt_lt' | 'lv_lv' | 'ee_et'
  // CJK (China, Japan, Korea)
  | 'cn_zh' | 'cn_zh_cantonese' | 'tw_zh' | 'hk_zh'
  | 'jp_ja' | 'kr_ko'
  // MENA (Middle East & North Africa)
  | 'ae_ar' | 'sa_ar' | 'qa_ar' | 'kw_ar' | 'bh_ar' | 'om_ar'
  | 'eg_ar' | 'ma_ar' | 'tn_ar' | 'dz_ar' | 'ly_ar'
  | 'jo_ar' | 'lb_ar' | 'iq_ar' | 'sy_ar' | 'ps_ar' | 'ye_ar'
  | 'il_he' | 'ir_fa' | 'tr_tr'
  // South & Southeast Asia
  | 'in_hi' | 'in_en' | 'in_ta' | 'in_te' | 'in_bn' | 'in_mr'
  | 'in_gu' | 'in_kn' | 'in_ml' | 'in_pa' | 'in_ur'
  | 'pk_ur' | 'bd_bn' | 'lk_si' | 'np_ne' | 'mm_my'
  | 'th_th' | 'vn_vi' | 'id_id' | 'my_ms' | 'sg_en' | 'sg_zh'
  | 'ph_tl' | 'ph_en' | 'kh_km' | 'la_lo'
  // Latin America
  | 'mx_es' | 'br_pt' | 'ar_es' | 'co_es' | 'cl_es' | 'pe_es'
  | 've_es' | 'ec_es' | 'bo_es' | 'py_es' | 'uy_es'
  | 'cr_es' | 'pa_es' | 'gt_es' | 'cu_es' | 'do_es' | 'hn_es' | 'sv_es'
  | 'pr_es' | 'ni_es'
  // Africa
  | 'ng_en' | 'ng_yo' | 'ng_ha' | 'ng_ig'
  | 'za_en' | 'za_zu' | 'za_af' | 'za_xh'
  | 'ke_en' | 'ke_sw' | 'gh_en' | 'et_am' | 'tz_sw'
  | 'ug_en' | 'rw_rw' | 'cm_fr' | 'sn_fr' | 'ci_fr'
  | 'ma_fr' | 'dz_fr' | 'tn_fr'
  // Custom
  | 'custom_region';

export interface RegionalScenarioVariant {
  /** Base scenario being adapted */
  baseScenario: ContentScenario;
  /** Target sub-region */
  subRegion: SubRegion;
  /** Zone for provider routing */
  zone: RegionalZone;
  /** Cultural adaptations applied */
  adaptations: {
    /** Wardrobe/dress code adjustments for avatars */
    wardrobeAdjustment?: string;
    /** Companion/model demographics */
    companionStyle?: string;
    /** Music genre/mood adaptation */
    musicAdaptation?: string;
    /** Setting/backdrop changes */
    settingAdaptation?: string;
    /** Color palette adjustments (e.g., red for CNY, green for Ramadan) */
    colorPalette?: string[];
    /** Reading direction (LTR or RTL) */
    readingDirection?: 'ltr' | 'rtl';
    /** Calendar system adjustments */
    calendarSystem?: 'gregorian' | 'hijri' | 'chinese_lunar' | 'hebrew' | 'buddhist';
    /** Currency symbol and format */
    currencyFormat?: string;
    /** Number format (e.g., 1,000.00 vs 1.000,00) */
    numberFormat?: string;
    /** Date format preference */
    dateFormat?: 'mdy' | 'dmy' | 'ymd';
    /** Greeting / salutation style */
    greetingStyle?: string;
    /** Forbidden imagery or content (cultural sensitivity) */
    contentRestrictions?: string[];
    /** Festival/holiday-specific branding */
    seasonalBranding?: string;
    /** Local regulatory disclaimers */
    legalDisclaimers?: string[];
    /** Dialect selection within language */
    dialectPreference?: string;
    /** Font family recommendations for the script */
    fontRecommendation?: string;
  };
  /** Provider overrides for this region */
  providerOverrides?: {
    tts?: string;           // e.g., 'elevenlabs' | 'alibaba_cosyvoice' | 'azure'
    videoGen?: string;      // e.g., 'veo3' | 'wan2.6' | 'modelslab'
    avatarGen?: string;     // e.g., 'hedra' | 'alibaba' | 'modelslab'
    translation?: string;   // e.g., 'deepl' | 'google' | 'azure'
  };
}

// ─── Scene Template Categories ───────────────────────────────────────────────

/** Scene template category for organizing the template library */
export type SceneTemplateCategory =
  | 'intro_outro'      // Opening/closing scenes
  | 'presenter'        // Avatar/talking head scenes
  | 'data_viz'         // Data visualization & charts
  | 'product'          // Product demo & showcase
  | 'storytelling'     // Narrative & story scenes
  | 'social'           // Social media optimized
  | 'education'        // Learning & tutorial scenes
  | 'healthcare'       // Medical & health content
  | 'real_estate'      // Property & architecture
  | 'ecommerce'        // Shopping & product display
  | 'travel'           // Travel & destination
  | 'finance'          // Financial & business data
  | 'entertainment'    // Media & entertainment
  | 'event'            // Events & celebrations
  | 'cultural'         // Regional/cultural content
  | 'technical'        // Technical/engineering
  | 'immersive'        // VR/AR/3D immersive
  | 'transition'       // Transition/interstitial scenes
  | 'interactive';     // Interactive/quiz/poll scenes

export interface SceneTemplateConfig {
  key: string;
  label: string;
  description: string;
  category: SceneTemplateCategory;
  /** Recommended scenarios this template works well with */
  recommendedScenarios?: ContentScenario[];
  /** Industries this template is designed for */
  targetIndustries?: IndustryVertical[];
  /** Regions where this template has cultural relevance */
  targetRegions?: SubRegion[];
  /** The template scene defaults */
  template: Partial<CompositionScene>;
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

  // ─── Data, Sources & Verification (NEW) ────────────────────────────────────

  /** Data sources and references for facts/stats in this scene */
  dataSources?: DataSource[];

  /** Citation configuration for this scene */
  citationConfig?: CitationConfig;

  /** Content verification results (AI fact-checking + human review) */
  verifications?: ContentVerification[];

  /** Language quality (spell check, grammar, clarity, readability) */
  languageQuality?: LanguageQualityCheck;

  /** Inline editing state */
  editState?: SceneEditState;

  /** Data visualizations (charts, graphs, infographics) embedded in this scene */
  dataVisualizations?: SceneDataVisualization[];

  /** Cross-format conversion (e.g., this slide scene → cinematic video scene) */
  crossFormatConversions?: CrossFormatConversion[];
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
    | 'rendering_mode'  // Rendering pipeline (photorealistic, cel-shaded, watercolor, etc.)
    // Data, verification & quality recommendations
    | 'visualization'   // Chart/graph type for data scenes
    | 'data_source'     // Data source suggestion (URL, API, research)
    | 'verification'    // Content verification flag (AI-generated content needs checking)
    | 'spell_grammar'   // Spell check, grammar, or clarity improvement
    | 'cross_format'    // Cross-format conversion (slides→video, video→podcast, etc.)
    | 'citation';       // Citation / reference formatting
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

  // Project-level data & verification settings
  citationConfig?: CitationConfig;
  /** Auto-run spell check + grammar on all scripts */
  autoSpellCheck?: boolean;
  /** Auto-run content verification on AI-generated claims */
  autoVerification?: boolean;
  /** Cross-format conversions applied to this project */
  crossFormatConversions?: CrossFormatConversion[];

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
