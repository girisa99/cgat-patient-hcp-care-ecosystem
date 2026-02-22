/**
 * Pipeline Orchestrator — The Combination Chain Engine
 *
 * This is the core moat: it chains 5-15 atomic pipelines together automatically.
 * User provides MINIMAL input (business name + location + intent), the orchestrator
 * determines which pipelines to chain, in what order, with what providers.
 *
 * Combination Chains (C1-C35):
 * - C1: Business-to-Global-Campaign (15 pipelines)
 * - C2: Script-Edit-Regenerate (7 pipelines, zero-restart)
 * - C3: Record-to-Everywhere (12 pipelines)
 * - C4: Long-to-Shorts (8 pipelines)
 * - C5: Competitor-Battlecard-Video (10 pipelines)
 * - C6: Investor-Deck-Live-Demo (8 pipelines)
 * - C7: Transcreation-Video-Pipeline (cultural adaptation, not just dubbing)
 * - C8: Economy-Aware-Content (calibrated to business tier)
 * - C9: Multi-Zone-Simultaneous-Render (4-zone parallel)
 * - C10: Brand-Intelligence-to-Video (11 pipelines)
 * - C11: Podcast-to-Multichannel-Empire (14 pipelines)
 * - C12: Video-Remix-Stitch (12 pipelines)
 * - C13: Testimonial-Compilation (9 pipelines)
 * - C14: Long-Form-Chunked-Production (17 pipelines)
 * - C15: Website-Package-Generator (15 pipelines)
 * - C16: Landing-Page-Quick (8 pipelines)
 * - C17: Hero-Banner-Generator (4 pipelines)
 * - C18: Whitepaper-Infographic-Package (9 pipelines)
 * - C19: Interactive-Demo-Product-Page (11 pipelines)
 * - C20: Video-to-Everything-Empire (19 pipelines)
 * - C21: Podcast-to-Website (podcast → landing page + blog + show notes)
 * - C22: Blog-to-Multimedia (blog → video + podcast + social + carousel)
 * - C23: Recording-to-Course-Series (recording → chaptered course + quizzes)
 * - C24: Event-Recap-Empire (event video → recap + highlights + social)
 * - C25: Webinar-Replay-Repurpose (webinar → on-demand + clips + blog)
 * - C26: Multilingual-Simultaneous-Campaign (script → N languages simultaneously)
 * - C27: Franchise-Multi-Location (template → N locations with local data)
 * - C28: Episodic-Series-Producer (content → episodic series with branding)
 * - C29: A/B-Testing-Variants (content → N variants for testing)
 * - C30: UGC-Curation-Remix (user clips → curated compilation)
 * - C31: Screen-Recording-to-Tutorial (screen capture → polished tutorial)
 * - C32: Newsletter-to-Social-Campaign (newsletter → social posts + video)
 * - C33: Training-Manual-Producer (content → chapters + slides + quizzes)
 * - C34: Kids-Book-Animator (story → illustrations + animation + narration)
 * - C35: Course-Series-Producer (curriculum → episodic courses + assessments)
 *
 * Data Sources:
 * - Google Places API (live business data: reviews, hours, competitors)
 * - Brand Intelligence (economy profiles, business archetypes)
 * - Regional Routing (4-zone: Western/CJK/MENA/SEA, 76 sub-regions)
 * - Transcreation Engine (cultural traits: wardrobe, companion, music, setting)
 * - 202 Edge Functions (AI processing, video gen, TTS, avatar, etc.)
 *
 * @see src/hooks/useUniversalEnrichment.ts — enrichment data
 * @see src/services/brand-intelligence/universalEnrichmentBridge.ts — service bridge
 * @see src/services/regionalTranscreationService.ts — cultural adaptation
 * @see src/lib/api/localBusinessEnrichment.ts — Google Places API
 */

import type { GooglePlacesEnrichment } from '@/hooks/useUniversalEnrichment';
import type { TranscreationContext } from './regionalTranscreationService';

// ─── Content Format Types (aligned with Cast CREATE tab) ─────────────────────

export type ContentFormat =
  | 'short_video'        // 15-60s social clips
  | 'long_video'         // 2-10min explainers, tutorials
  | 'audio_podcast'      // Audio-only podcast episodes
  | 'video_podcast'      // Video podcast with talking heads
  | 'webcast'            // Live webinar / presentation
  | 'live_stream'        // Real-time streaming
  | 'presentation'       // Slide deck (PPT/Google Slides)
  | 'script_only'        // Written scripts & copy
  | 'audiogram'          // Animated waveform video for social
  | 'social_carousel'    // Multi-image social post
  | 'newsletter'         // Email newsletter content
  | 'blog_post'          // Long-form written content
  | 'investor_deck'      // Investor presentation with live demos
  // ─── Video Remix & Clip Extraction ─────────────────────────────────────
  | 'video_remix'        // Re-edit existing video with new clips, testimonials, B-roll
  | 'teaser_clip'        // Auto-generated teaser/trailer from long-form content
  | 'best_clips'         // AI-extracted best moments compilation
  | 'platform_clips'     // Platform-optimized clips (TikTok, Reels, Shorts, FB)
  | 'highlight_reel'     // Highlight reel from multiple videos/events
  | 'testimonial_video'  // Stitched testimonial compilation from multiple sources
  // ─── Website Package ───────────────────────────────────────────────────
  | 'website_package'    // Full website: landing page + hero banner + sections + CTA
  | 'landing_page'       // Single landing page with hero, sections, CTA
  | 'hero_banner'        // Standalone hero banner (video/image/animated)
  | 'product_page'       // Product page with features, pricing, testimonials
  | 'microsite'          // Multi-page microsite (3-5 pages)
  | 'infographic'        // Static or animated infographic
  | 'whitepaper'         // Long-form PDF whitepaper with data viz
  | 'case_study_page'    // Customer case study page with journey + metrics
  | 'interactive_demo'   // Interactive product demo page
  // ─── Training & Education ─────────────────────────────────────────────
  | 'training_manual'    // Full training manual: chapters, slides, quizzes, assessments
  | 'course_series'      // Multi-episode course with progressive learning path
  | 'kids_book'          // Animated kids book: illustrations, narration, interactive elements
  | 'animated_infographic'  // Motion infographic: counter animations, chart transitions, data flow
  | 'e_learning_module'  // SCORM/xAPI-compatible e-learning module
  | 'tutorial_series'    // Step-by-step tutorial with screen recordings + narration
  | 'animated_journey'   // Animated customer/patient/user journey with motion
  | 'slide_deck_video'   // Slide-by-slide video: each slide with different style (Pixar, cinematic, etc.)
  // ─── Repurposing & Derivatives ────────────────────────────────────────
  | 'event_recap'        // Event recap: highlights + best moments + social clips
  | 'webinar_replay'     // On-demand webinar replay with chapters + clips
  | 'franchise_local'    // Franchise/multi-location variant with local data
  | 'ugc_compilation'    // User-generated content curation and remix
  | 'newsletter_social'  // Newsletter content repurposed for social
  | 'email_campaign'     // Full email campaign: template + subject lines + A/B variants
  // ─── Podcast / Webcast / Meeting Intelligence ─────────────────────────
  | 'podcast_episode'    // Full podcast episode with intro, outro, music, show notes
  | 'video_from_podcast' // Video generated from podcast audio (avatar + visuals)
  | 'meeting_recap'      // Meeting intelligence: MoM, tasks, diagrams, next steps
  | 'meeting_poc'        // Quick PoC/sample screens generated from meeting decisions
  | 'architecture_diagram'  // Technical architecture flow diagram from discussion
  | 'business_flow'      // Business process flow diagram from discussion
  | 'webcast_replay'     // Polished webcast replay with chapters + demo highlights
  | 'live_recording_processed'; // Processed live recording with edit/rewind/chapters

export type ContentIntent =
  | 'promo'              // Business promotion
  | 'tutorial'           // How-to / educational
  | 'testimonial'        // Customer stories
  | 'announcement'       // Product/service announcement
  | 'comparison'         // Competitor comparison
  | 'behind_scenes'      // Behind the scenes
  | 'interview'          // Interview / conversation
  | 'case_study'         // Customer case study
  | 'product_demo'       // Product demonstration
  | 'brand_story'        // Origin / brand narrative
  | 'event_recap'        // Event summary
  | 'investor_pitch'     // Fundraising pitch
  | 'training'           // Training / e-learning / onboarding
  | 'kids_education'     // Children's educational content
  | 'explainer'          // Explainer / how-it-works
  | 'repurpose'          // Repurpose existing content into new formats
  | 'franchise'          // Franchise / multi-location local variants
  | 'series'             // Episodic / series content
  | 'ugc'               // User-generated content curation
  | 'newsletter'        // Newsletter / email campaign
  | 'webinar'           // Webinar / live session replay
  | 'meeting'           // Meeting recording → MoM, tasks, diagrams
  | 'podcast_create'    // Create podcast from topic/upload/recording
  | 'live_session'      // Live webcast / product demo
  | 'product_walkthrough'; // Product walkthrough / demo recording

export type InputType =
  | 'text'               // Raw text / description
  | 'url'                // Website URL
  | 'pdf'                // PDF document
  | 'docx'               // Word document
  | 'pptx'               // PowerPoint file
  | 'audio'              // Audio file
  | 'video'              // Video file
  | 'image'              // Image file
  | 'google_places'      // Business name + location (auto-enriched)
  | 'recording';         // Live recording (mic/camera)

// ─── Pipeline Step Definitions ───────────────────────────────────────────────

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  /** Edge function to invoke (from 202 available) */
  edgeFunction: string;
  /** Action/mode within the edge function */
  action?: string;
  /** Input type this step accepts */
  inputType: string;
  /** Output type this step produces */
  outputType: string;
  /** Whether this step is optional (user can skip) */
  optional: boolean;
  /** Estimated duration in seconds */
  estimatedDuration: number;
  /** Credit cost multiplier */
  creditMultiplier: number;
  /** Provider routing zone preference */
  zonePreference?: 'western' | 'cjk' | 'mena' | 'sea' | 'auto';
}

export interface PipelineChain {
  id: string;
  name: string;
  description: string;
  /** Content formats this chain produces */
  outputFormats: ContentFormat[];
  /** Steps in execution order */
  steps: PipelineStep[];
  /** Total estimated duration */
  estimatedDuration: number;
  /** Minimum subscription tier required */
  minTier: 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';
  /** Which Genie products this chain spans */
  products: ('spark' | 'mind' | 'vibe' | 'cast' | 'deck' | 'hub')[];
}

export interface OrchestrationRequest {
  /** What the user wants to create */
  intent: ContentIntent;
  /** Desired output format */
  format: ContentFormat;
  /** Input content (text, URL, file reference, etc.) */
  input: {
    type: InputType;
    content: string;
    file?: File;
  };
  /** Business info for Google Places enrichment */
  business?: {
    name: string;
    location: string;
    vertical?: string;
  };
  /** Target regions for transcreation */
  targetRegions?: string[];
  /** Language preferences */
  languages?: string[];
  /** Quality preference */
  quality?: '720p' | '1080p' | '4k';
  /** User's subscription tier */
  tier: 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';
}

export interface OrchestrationPlan {
  /** Selected chain */
  chain: PipelineChain;
  /** Steps to execute (filtered by tier and options) */
  activeSteps: PipelineStep[];
  /** Steps skipped (optional or tier-gated) */
  skippedSteps: PipelineStep[];
  /** Google Places data if available */
  googlePlaces?: GooglePlacesEnrichment;
  /** Transcreation targets */
  transcreationTargets: string[];
  /** Estimated total duration */
  estimatedDuration: number;
  /** Estimated credit cost */
  estimatedCredits: number;
  /** Products involved */
  products: string[];
}

// ─── Atomic Pipeline Steps (building blocks) ─────────────────────────────────

const ATOMIC_STEPS: Record<string, PipelineStep> = {
  // Input Processing
  google_places_enrich: {
    id: 'google_places_enrich',
    name: 'Google Places Enrichment',
    description: 'Fetch live business data: reviews, hours, competitors, rating',
    edgeFunction: 'local-business-enrichment',
    inputType: 'business_info',
    outputType: 'google_places_data',
    optional: false,
    estimatedDuration: 3,
    creditMultiplier: 0,
  },
  document_extract: {
    id: 'document_extract',
    name: 'Document Extraction',
    description: 'Extract text and structure from PDF, DOCX, PPTX',
    edgeFunction: 'document-processor',
    inputType: 'document',
    outputType: 'extracted_text',
    optional: false,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },
  url_crawl: {
    id: 'url_crawl',
    name: 'URL Content Crawl',
    description: 'Extract content from web URL',
    edgeFunction: 'crawl-relevant-content',
    inputType: 'url',
    outputType: 'extracted_text',
    optional: false,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },
  audio_transcribe: {
    id: 'audio_transcribe',
    name: 'Audio Transcription',
    description: 'Transcribe audio with speaker diarization',
    edgeFunction: 'ai-universal-processor',
    action: 'stt',
    inputType: 'audio',
    outputType: 'transcript',
    optional: false,
    estimatedDuration: 15,
    creditMultiplier: 1,
  },
  video_extract_audio: {
    id: 'video_extract_audio',
    name: 'Video Audio Extraction',
    description: 'Extract audio track from video file',
    edgeFunction: 'extract-video-audio',
    inputType: 'video',
    outputType: 'audio',
    optional: false,
    estimatedDuration: 10,
    creditMultiplier: 0.5,
  },
  ocr_extract: {
    id: 'ocr_extract',
    name: 'OCR / Form Extraction',
    description: 'Extract text from images using OCR',
    edgeFunction: 'deepseek-vision',
    action: 'ocr',
    inputType: 'image',
    outputType: 'extracted_text',
    optional: false,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },

  // Brand Intelligence
  brand_profile: {
    id: 'brand_profile',
    name: 'Brand Intelligence Profile',
    description: 'Generate brand profile from business data + Google Places',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    inputType: 'business_data',
    outputType: 'brand_profile',
    optional: false,
    estimatedDuration: 5,
    creditMultiplier: 1,
  },
  economy_archetype: {
    id: 'economy_archetype',
    name: 'Economy Archetype Selection',
    description: 'Match business to economy profile (nano bakery → enterprise pharma)',
    edgeFunction: 'ai-universal-processor',
    action: 'nlp',
    inputType: 'brand_profile',
    outputType: 'economy_profile',
    optional: false,
    estimatedDuration: 2,
    creditMultiplier: 0.5,
  },

  // Script Generation
  script_generate: {
    id: 'script_generate',
    name: 'AI Script Generation',
    description: 'Generate script from enriched prompt with STORM framework',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    inputType: 'enriched_prompt',
    outputType: 'script',
    optional: false,
    estimatedDuration: 10,
    creditMultiplier: 1,
    zonePreference: 'auto',
  },
  script_enhance: {
    id: 'script_enhance',
    name: 'Script Enhancement',
    description: 'Polish and optimize script for target format',
    edgeFunction: 'enhance-script',
    inputType: 'script',
    outputType: 'enhanced_script',
    optional: true,
    estimatedDuration: 8,
    creditMultiplier: 1,
  },

  // Transcreation
  transcreation: {
    id: 'transcreation',
    name: 'Cultural Transcreation',
    description: 'Culturally adapt script: wardrobe, companion, music, setting, values',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    inputType: 'script',
    outputType: 'transcreated_scripts',
    optional: true,
    estimatedDuration: 15,
    creditMultiplier: 1.5,
    zonePreference: 'auto',
  },

  // TTS / Voice
  tts_generate: {
    id: 'tts_generate',
    name: 'Text-to-Speech',
    description: 'Generate voice narration with regional accent and emotion',
    edgeFunction: 'multi-provider-tts',
    inputType: 'script',
    outputType: 'audio',
    optional: false,
    estimatedDuration: 20,
    creditMultiplier: 1,
    zonePreference: 'auto',
  },
  voice_clone: {
    id: 'voice_clone',
    name: 'Voice Cloning',
    description: 'Clone a voice for personalized narration',
    edgeFunction: 'voice-clone-processor',
    inputType: 'audio_sample',
    outputType: 'voice_model',
    optional: true,
    estimatedDuration: 30,
    creditMultiplier: 2,
  },

  // Video Generation
  video_generate: {
    id: 'video_generate',
    name: 'Video Generation',
    description: 'Generate video from script + storyboard',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_video',
    inputType: 'storyboard',
    outputType: 'video',
    optional: false,
    estimatedDuration: 60,
    creditMultiplier: 2,
    zonePreference: 'auto',
  },

  // Avatar + Lip-Sync
  avatar_generate: {
    id: 'avatar_generate',
    name: 'Avatar Generation',
    description: 'Generate speaking avatar with regional wardrobe',
    edgeFunction: 'alibaba-avatar-generator',
    inputType: 'avatar_config',
    outputType: 'avatar_video',
    optional: true,
    estimatedDuration: 45,
    creditMultiplier: 2,
    zonePreference: 'auto',
  },
  lipsync: {
    id: 'lipsync',
    name: 'Lip-Sync',
    description: 'Sync avatar mouth to audio narration',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_video',
    inputType: 'avatar_audio',
    outputType: 'synced_video',
    optional: true,
    estimatedDuration: 30,
    creditMultiplier: 1.5,
  },

  // Audio Production
  audio_mix: {
    id: 'audio_mix',
    name: 'Audio Mixing',
    description: 'Mix voice + music + SFX with ducking and normalization',
    edgeFunction: 'audio-mixer',
    action: 'mix',
    inputType: 'audio_tracks',
    outputType: 'mixed_audio',
    optional: true,
    estimatedDuration: 10,
    creditMultiplier: 0.5,
  },
  audio_enhance: {
    id: 'audio_enhance',
    name: 'Audio Enhancement',
    description: 'Noise reduction, normalization, de-essing',
    edgeFunction: 'audio-mixer',
    action: 'enhance',
    inputType: 'audio',
    outputType: 'enhanced_audio',
    optional: true,
    estimatedDuration: 8,
    creditMultiplier: 0.5,
  },
  music_generate: {
    id: 'music_generate',
    name: 'Background Music',
    description: 'Generate mood-appropriate background music',
    edgeFunction: 'elevenlabs-music',
    inputType: 'music_config',
    outputType: 'music',
    optional: true,
    estimatedDuration: 15,
    creditMultiplier: 1,
  },

  // Subtitles & Captions
  caption_generate: {
    id: 'caption_generate',
    name: 'Auto-Captions',
    description: 'Generate multi-language captions from audio',
    edgeFunction: 'ai-caption-generator',
    action: 'generate',
    inputType: 'audio',
    outputType: 'captions',
    optional: true,
    estimatedDuration: 10,
    creditMultiplier: 0.5,
  },

  // Thumbnail
  thumbnail_generate: {
    id: 'thumbnail_generate',
    name: 'Thumbnail Generation',
    description: 'AI-generated thumbnail for video/podcast',
    edgeFunction: 'auto-thumbnail-generator',
    action: 'generate',
    inputType: 'video',
    outputType: 'thumbnail',
    optional: true,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },

  // Assembly
  video_assemble: {
    id: 'video_assemble',
    name: 'Video Assembly',
    description: 'Assemble final video from chapters, audio, captions',
    edgeFunction: 'genie-cast-assembler',
    inputType: 'chapters',
    outputType: 'final_video',
    optional: false,
    estimatedDuration: 30,
    creditMultiplier: 1,
  },

  // Quality Checks (auto-pipeline, not manual)
  quality_check: {
    id: 'quality_check',
    name: 'Quality Assessment',
    description: 'AI quality scoring and brand guidelines check',
    edgeFunction: 'ai-quality-assessment',
    inputType: 'content',
    outputType: 'quality_report',
    optional: false,
    estimatedDuration: 5,
    creditMultiplier: 0,
  },
  compliance_check: {
    id: 'compliance_check',
    name: 'Compliance Check',
    description: 'Geo-compliance and healthcare compliance verification',
    edgeFunction: 'content-compliance-check',
    inputType: 'content',
    outputType: 'compliance_report',
    optional: true,
    estimatedDuration: 5,
    creditMultiplier: 0,
  },
  brand_guidelines_check: {
    id: 'brand_guidelines_check',
    name: 'Brand Guidelines Check',
    description: 'Verify content matches brand guidelines',
    edgeFunction: 'brand-guidelines-checker',
    action: 'check',
    inputType: 'content',
    outputType: 'brand_report',
    optional: true,
    estimatedDuration: 3,
    creditMultiplier: 0,
  },

  // Publishing
  social_publish: {
    id: 'social_publish',
    name: 'Multi-Platform Publish',
    description: 'Publish to YouTube, TikTok, Instagram, LinkedIn, etc.',
    edgeFunction: 'social-publish',
    inputType: 'final_content',
    outputType: 'publish_result',
    optional: true,
    estimatedDuration: 10,
    creditMultiplier: 0,
  },

  // Shorts / Clips
  shorts_extract: {
    id: 'shorts_extract',
    name: 'Extract Short Clips',
    description: 'AI-extract best 15-60s moments from long video',
    edgeFunction: 'magic-clips-generator',
    inputType: 'video',
    outputType: 'short_clips',
    optional: true,
    estimatedDuration: 20,
    creditMultiplier: 1,
  },

  // Presentation
  slides_generate: {
    id: 'slides_generate',
    name: 'Slide Generation',
    description: 'Generate presentation slides from script',
    edgeFunction: 'generate-template-ai',
    inputType: 'script',
    outputType: 'slides',
    optional: false,
    estimatedDuration: 15,
    creditMultiplier: 1,
  },
  slides_export: {
    id: 'slides_export',
    name: 'Slides Export',
    description: 'Export to Google Slides or PPTX',
    edgeFunction: 'google-slides-export',
    inputType: 'slides',
    outputType: 'exported_deck',
    optional: true,
    estimatedDuration: 5,
    creditMultiplier: 0,
  },

  // Podcast-specific
  podcast_show_notes: {
    id: 'podcast_show_notes',
    name: 'Show Notes Generation',
    description: 'Auto-generate podcast show notes and timestamps',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    inputType: 'transcript',
    outputType: 'show_notes',
    optional: true,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },
  audiogram_generate: {
    id: 'audiogram_generate',
    name: 'Audiogram Generation',
    description: 'Create animated waveform video for social sharing',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_video',
    inputType: 'audio_clip',
    outputType: 'audiogram',
    optional: true,
    estimatedDuration: 10,
    creditMultiplier: 1,
  },

  // Analytics
  viral_score: {
    id: 'viral_score',
    name: 'Viral Score Prediction',
    description: 'Predict viral potential before publishing',
    edgeFunction: 'viral-score-predictor',
    inputType: 'content',
    outputType: 'viral_score',
    optional: true,
    estimatedDuration: 3,
    creditMultiplier: 0,
  },

  // Dubbing
  multi_language_dub: {
    id: 'multi_language_dub',
    name: 'Multi-Language Dubbing',
    description: 'Dub video into multiple languages with lip-sync',
    edgeFunction: 'multi-language-audio-orchestrator',
    inputType: 'video_script',
    outputType: 'dubbed_videos',
    optional: true,
    estimatedDuration: 60,
    creditMultiplier: 2,
  },

  // Competitive Intelligence
  competitive_analysis: {
    id: 'competitive_analysis',
    name: 'Competitive Analysis',
    description: 'Analyze competitors from Google Places + web intelligence',
    edgeFunction: 'competitive-intelligence',
    inputType: 'business_data',
    outputType: 'competitive_report',
    optional: true,
    estimatedDuration: 15,
    creditMultiplier: 1,
  },

  // ─── Video Remix & Clip Extraction ───────────────────────────────────────

  video_scene_detect: {
    id: 'video_scene_detect',
    name: 'Scene Detection',
    description: 'AI scene detection: cut points, key frames, shot types, transitions',
    edgeFunction: 'ai-universal-processor',
    action: 'analyze_video',
    inputType: 'video',
    outputType: 'scene_map',
    optional: false,
    estimatedDuration: 15,
    creditMultiplier: 1,
  },
  video_clip_extract: {
    id: 'video_clip_extract',
    name: 'Clip Extraction',
    description: 'Extract clips by time range, scene, or AI-selected best moments',
    edgeFunction: 'magic-clips-generator',
    action: 'extract',
    inputType: 'scene_map',
    outputType: 'video_clips',
    optional: false,
    estimatedDuration: 20,
    creditMultiplier: 1,
  },
  video_stitch: {
    id: 'video_stitch',
    name: 'Video Stitching',
    description: 'Stitch clips together with transitions, B-roll, and new segments',
    edgeFunction: 'genie-cast-assembler',
    action: 'stitch',
    inputType: 'video_clips',
    outputType: 'stitched_video',
    optional: false,
    estimatedDuration: 30,
    creditMultiplier: 1.5,
  },
  testimonial_extract: {
    id: 'testimonial_extract',
    name: 'Testimonial Extraction',
    description: 'Extract testimonial clips from reviews, interviews, or uploaded videos',
    edgeFunction: 'ai-universal-processor',
    action: 'extract_testimonials',
    inputType: 'video_or_text',
    outputType: 'testimonial_clips',
    optional: true,
    estimatedDuration: 15,
    creditMultiplier: 1,
  },
  broll_inject: {
    id: 'broll_inject',
    name: 'B-Roll Injection',
    description: 'Insert B-roll footage (stock, AI-generated, or uploaded) between cuts',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_video',
    inputType: 'stitch_plan',
    outputType: 'broll_segments',
    optional: true,
    estimatedDuration: 20,
    creditMultiplier: 1,
    zonePreference: 'auto',
  },
  teaser_generate: {
    id: 'teaser_generate',
    name: 'Teaser/Trailer Generation',
    description: 'AI-generate teaser/trailer from best moments with dramatic pacing',
    edgeFunction: 'magic-clips-generator',
    action: 'teaser',
    inputType: 'scene_map',
    outputType: 'teaser_video',
    optional: true,
    estimatedDuration: 15,
    creditMultiplier: 1,
  },
  platform_adapt: {
    id: 'platform_adapt',
    name: 'Platform Adaptation',
    description: 'Auto-adapt video to platform specs (TikTok 9:16, YouTube 16:9, IG 1:1, FB 4:5)',
    edgeFunction: 'genie-cast-assembler',
    action: 'platform_adapt',
    inputType: 'video',
    outputType: 'platform_videos',
    optional: true,
    estimatedDuration: 15,
    creditMultiplier: 0.5,
  },

  // ─── Long-Form Chunking & Assembly ───────────────────────────────────────

  long_form_chunk: {
    id: 'long_form_chunk',
    name: 'Long-Form Chunking',
    description: 'Split long content into manageable chunks for parallel processing',
    edgeFunction: 'ai-universal-processor',
    action: 'chunk_content',
    inputType: 'long_script',
    outputType: 'content_chunks',
    optional: false,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },
  chunk_tts: {
    id: 'chunk_tts',
    name: 'Chunk TTS Generation',
    description: 'Generate TTS for each chunk in parallel, then assemble',
    edgeFunction: 'multi-provider-tts',
    action: 'parallel_tts',
    inputType: 'content_chunks',
    outputType: 'audio_chunks',
    optional: false,
    estimatedDuration: 30,
    creditMultiplier: 1.5,
    zonePreference: 'auto',
  },
  chunk_video: {
    id: 'chunk_video',
    name: 'Chunk Video Generation',
    description: 'Generate video for each chunk in parallel, then assemble',
    edgeFunction: 'ai-universal-processor',
    action: 'parallel_video',
    inputType: 'content_chunks',
    outputType: 'video_chunks',
    optional: false,
    estimatedDuration: 90,
    creditMultiplier: 2,
    zonePreference: 'auto',
  },
  chunk_assembly: {
    id: 'chunk_assembly',
    name: 'Chunk Assembly',
    description: 'Assemble all chunks (video, audio, captions) into final long-form content',
    edgeFunction: 'genie-cast-assembler',
    action: 'chunk_assembly',
    inputType: 'media_chunks',
    outputType: 'assembled_long_form',
    optional: false,
    estimatedDuration: 30,
    creditMultiplier: 1,
  },
  best_moments_ai: {
    id: 'best_moments_ai',
    name: 'AI Best Moments',
    description: 'AI identifies most engaging, shareable, viral-worthy moments from long content',
    edgeFunction: 'magic-clips-generator',
    action: 'best_moments',
    inputType: 'assembled_long_form',
    outputType: 'best_moment_clips',
    optional: true,
    estimatedDuration: 10,
    creditMultiplier: 0.5,
  },
  multi_thumbnail: {
    id: 'multi_thumbnail',
    name: 'Multi-Thumbnail Generation',
    description: 'Generate multiple thumbnail variants for A/B testing',
    edgeFunction: 'auto-thumbnail-generator',
    action: 'multi',
    inputType: 'video',
    outputType: 'thumbnail_variants',
    optional: true,
    estimatedDuration: 8,
    creditMultiplier: 0.5,
  },

  // ─── Website Package Generation ──────────────────────────────────────────

  website_scaffold: {
    id: 'website_scaffold',
    name: 'Website Scaffold',
    description: 'Generate website structure: pages, sections, navigation, layout',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_website',
    inputType: 'enriched_prompt',
    outputType: 'website_structure',
    optional: false,
    estimatedDuration: 15,
    creditMultiplier: 2,
  },
  hero_banner_generate: {
    id: 'hero_banner_generate',
    name: 'Hero Banner Generation',
    description: 'Generate hero banner: video loop, animated gradient, or static with parallax',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_hero',
    inputType: 'brand_profile',
    outputType: 'hero_banner',
    optional: false,
    estimatedDuration: 20,
    creditMultiplier: 1.5,
    zonePreference: 'auto',
  },
  section_generate: {
    id: 'section_generate',
    name: 'Section Generation',
    description: 'Generate website sections: features, pricing, testimonials, FAQ, CTAs',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_sections',
    inputType: 'website_structure',
    outputType: 'website_sections',
    optional: false,
    estimatedDuration: 20,
    creditMultiplier: 1.5,
  },
  card_generate: {
    id: 'card_generate',
    name: 'Card Component Generation',
    description: 'Generate card components: feature cards, team cards, testimonial cards, pricing cards',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_cards',
    inputType: 'website_sections',
    outputType: 'card_components',
    optional: true,
    estimatedDuration: 10,
    creditMultiplier: 1,
  },
  scroll_animation: {
    id: 'scroll_animation',
    name: 'Scroll Animation',
    description: 'Add scroll-triggered animations: fade-in, slide, parallax, reveal, counter',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_animations',
    inputType: 'website_sections',
    outputType: 'animated_sections',
    optional: true,
    estimatedDuration: 8,
    creditMultiplier: 0.5,
  },
  cta_generate: {
    id: 'cta_generate',
    name: 'CTA Generation',
    description: 'Generate CTAs: buttons, banners, popups, exit-intent, floating, inline',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_cta',
    inputType: 'website_structure',
    outputType: 'cta_components',
    optional: false,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },
  infographic_generate: {
    id: 'infographic_generate',
    name: 'Infographic Generation',
    description: 'Generate data-driven infographic: charts, icons, stats, timelines',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_infographic',
    inputType: 'data_or_script',
    outputType: 'infographic',
    optional: true,
    estimatedDuration: 15,
    creditMultiplier: 1,
  },
  whitepaper_generate: {
    id: 'whitepaper_generate',
    name: 'Whitepaper Generation',
    description: 'Generate long-form whitepaper PDF: cover, exec summary, chapters, charts, citations',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_whitepaper',
    inputType: 'enriched_prompt',
    outputType: 'whitepaper_pdf',
    optional: true,
    estimatedDuration: 25,
    creditMultiplier: 2,
  },
  customer_journey_generate: {
    id: 'customer_journey_generate',
    name: 'Customer Journey Map',
    description: 'Generate visual customer journey: stages, touchpoints, emotions, actions, KPIs',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_journey',
    inputType: 'enriched_prompt',
    outputType: 'journey_map',
    optional: true,
    estimatedDuration: 10,
    creditMultiplier: 1,
  },
  interactive_demo_generate: {
    id: 'interactive_demo_generate',
    name: 'Interactive Demo',
    description: 'Generate interactive product demo: clickable prototype, guided tour, tooltips',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_demo',
    inputType: 'product_data',
    outputType: 'interactive_demo',
    optional: true,
    estimatedDuration: 30,
    creditMultiplier: 2,
  },
  website_export: {
    id: 'website_export',
    name: 'Website Export',
    description: 'Export as deployable HTML/CSS/JS, React components, or CMS-ready blocks',
    edgeFunction: 'website-export',
    action: 'export',
    inputType: 'website_complete',
    outputType: 'exported_website',
    optional: true,
    estimatedDuration: 10,
    creditMultiplier: 0.5,
  },

  // ─── Standalone Asset Generation ─────────────────────────────────────────

  image_generate: {
    id: 'image_generate',
    name: 'AI Image Generation',
    description: 'Generate standalone images: product shots, illustrations, backgrounds, icons',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_image',
    inputType: 'image_prompt',
    outputType: 'generated_images',
    optional: true,
    estimatedDuration: 10,
    creditMultiplier: 1,
    zonePreference: 'auto',
  },
  qrcode_generate: {
    id: 'qrcode_generate',
    name: 'QR Code Generation',
    description: 'Generate dynamic QR codes with tracking, branding, and custom styling',
    edgeFunction: 'qrcode-generator',
    inputType: 'url_or_data',
    outputType: 'qr_code',
    optional: true,
    estimatedDuration: 2,
    creditMultiplier: 0,
  },
  watermark_apply: {
    id: 'watermark_apply',
    name: 'Watermark / Branding Overlay',
    description: 'Apply brand logo watermark, copyright, or regional compliance marks',
    edgeFunction: 'video-watermark-processor',
    inputType: 'video_or_image',
    outputType: 'watermarked_content',
    optional: true,
    estimatedDuration: 5,
    creditMultiplier: 0,
  },
  logo_animate: {
    id: 'logo_animate',
    name: 'Logo Animation / Motion Graphics',
    description: 'Animate brand logo: reveal, spin, morph, particle, glitch, cinematic',
    edgeFunction: 'motion-graphics-generator',
    action: 'logo_animate',
    inputType: 'logo_image',
    outputType: 'animated_logo',
    optional: true,
    estimatedDuration: 15,
    creditMultiplier: 1,
  },
  color_palette_generate: {
    id: 'color_palette_generate',
    name: 'Color Palette Generation',
    description: 'Generate complementary color schemes, accessibility-checked, exportable as CSS/Tailwind',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_palette',
    inputType: 'brand_or_image',
    outputType: 'color_palette',
    optional: true,
    estimatedDuration: 3,
    creditMultiplier: 0,
  },
  social_caption_generate: {
    id: 'social_caption_generate',
    name: 'Social Caption & Hashtag Generation',
    description: 'Generate platform-specific captions, hashtags, hooks, and engagement-optimized copy',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_caption',
    inputType: 'content_summary',
    outputType: 'social_captions',
    optional: true,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },
  seo_metadata_generate: {
    id: 'seo_metadata_generate',
    name: 'SEO Metadata Generation',
    description: 'Generate meta descriptions, H1/H2, schema markup, keywords, OG tags',
    edgeFunction: 'seo-optimizer',
    inputType: 'content',
    outputType: 'seo_metadata',
    optional: true,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },
  email_template_generate: {
    id: 'email_template_generate',
    name: 'Email Template Generation',
    description: 'Generate responsive HTML email templates with A/B subject line variants',
    edgeFunction: 'email-template-generator',
    inputType: 'content_summary',
    outputType: 'email_template',
    optional: true,
    estimatedDuration: 10,
    creditMultiplier: 1,
  },
  print_export: {
    id: 'print_export',
    name: 'Print / PDF Export',
    description: 'Export as print-ready PDF: flyers, brochures, posters, business cards, tri-fold',
    edgeFunction: 'print-pdf-generator',
    inputType: 'design_content',
    outputType: 'print_pdf',
    optional: true,
    estimatedDuration: 8,
    creditMultiplier: 0.5,
  },

  // ─── Audio & Voice Effects ───────────────────────────────────────────────

  voice_effect_apply: {
    id: 'voice_effect_apply',
    name: 'Voice Effect Processing',
    description: 'Apply reverb, echo, pitch shift, radio effect, vintage, dramatic tone',
    edgeFunction: 'audio-mixer',
    action: 'apply_effects',
    inputType: 'audio',
    outputType: 'processed_audio',
    optional: true,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },
  soundscape_generate: {
    id: 'soundscape_generate',
    name: 'Soundscape / Ambient Audio',
    description: 'Generate ambient audio: nature, urban, office, cafe, rain, cultural ambience',
    edgeFunction: 'audio-generator',
    action: 'soundscape',
    inputType: 'soundscape_config',
    outputType: 'ambient_audio',
    optional: true,
    estimatedDuration: 8,
    creditMultiplier: 0.5,
  },

  // ─── Subtitles, Chapters & Indexing ──────────────────────────────────────

  subtitle_translate: {
    id: 'subtitle_translate',
    name: 'Subtitle Translation (Literal)',
    description: 'Literal translation of subtitles for accessibility (not transcreation)',
    edgeFunction: 'translation-service',
    action: 'translate_subtitles',
    inputType: 'captions',
    outputType: 'translated_subtitles',
    optional: true,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },
  chapters_auto_detect: {
    id: 'chapters_auto_detect',
    name: 'Auto-Chapter Detection',
    description: 'AI detects chapter boundaries, generates titles, timestamps, and summaries',
    edgeFunction: 'ai-chapter-detector',
    inputType: 'video_or_transcript',
    outputType: 'chapter_markers',
    optional: true,
    estimatedDuration: 8,
    creditMultiplier: 0.5,
  },
  transcript_index: {
    id: 'transcript_index',
    name: 'Transcript Indexing',
    description: 'Create searchable, time-coded transcript with keyword highlighting',
    edgeFunction: 'transcript-indexer',
    inputType: 'transcript',
    outputType: 'indexed_transcript',
    optional: true,
    estimatedDuration: 3,
    creditMultiplier: 0,
  },
  rss_feed_generate: {
    id: 'rss_feed_generate',
    name: 'RSS Feed Generation',
    description: 'Generate RSS/Atom feed for podcasts, blogs, video series',
    edgeFunction: 'feed-generator',
    inputType: 'content_series',
    outputType: 'rss_feed',
    optional: true,
    estimatedDuration: 2,
    creditMultiplier: 0,
  },

  // ─── Analysis & Testing ──────────────────────────────────────────────────

  sentiment_analyze: {
    id: 'sentiment_analyze',
    name: 'Sentiment & Tone Analysis',
    description: 'Analyze script tone, match to brand voice, detect emotional arcs',
    edgeFunction: 'sentiment-analyzer',
    inputType: 'text',
    outputType: 'sentiment_report',
    optional: true,
    estimatedDuration: 3,
    creditMultiplier: 0,
  },
  copy_variant_generate: {
    id: 'copy_variant_generate',
    name: 'Copy Variant / A/B Generator',
    description: 'Generate 3+ headline/CTA/hook variants for A/B testing',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_variants',
    inputType: 'script',
    outputType: 'script_variants',
    optional: true,
    estimatedDuration: 8,
    creditMultiplier: 1,
  },
  content_schedule: {
    id: 'content_schedule',
    name: 'Content Scheduling',
    description: 'Schedule posts at AI-recommended optimal times per platform',
    edgeFunction: 'scheduling-orchestrator',
    inputType: 'publish_plan',
    outputType: 'schedule_result',
    optional: true,
    estimatedDuration: 2,
    creditMultiplier: 0,
  },

  // ─── 3D & AR/VR ─────────────────────────────────────────────────────────

  model_3d_generate: {
    id: 'model_3d_generate',
    name: '3D Model Generation',
    description: 'Generate 3D models for product showcase, exploded views, or virtual environments',
    edgeFunction: '3d-model-generator',
    inputType: 'product_data',
    outputType: '3d_model',
    optional: true,
    estimatedDuration: 30,
    creditMultiplier: 2,
  },
  ar_filter_generate: {
    id: 'ar_filter_generate',
    name: 'AR Filter Generation',
    description: 'Generate AR filters for Instagram/Snapchat: product try-on, brand effects',
    edgeFunction: 'ar-filter-generator',
    inputType: 'brand_assets',
    outputType: 'ar_filter',
    optional: true,
    estimatedDuration: 20,
    creditMultiplier: 2,
  },

  // ─── Training & Education Pipeline ───────────────────────────────────────

  chapter_structure_generate: {
    id: 'chapter_structure_generate',
    name: 'Chapter / Module Structure',
    description: 'AI generates chapter structure: modules, lessons, objectives, assessments per chapter',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_chapters',
    inputType: 'training_content',
    outputType: 'chapter_structure',
    optional: false,
    estimatedDuration: 10,
    creditMultiplier: 1,
  },
  slide_by_slide_generate: {
    id: 'slide_by_slide_generate',
    name: 'Slide-by-Slide Generation',
    description: 'Generate individual slides with different styles per slide: Pixar, cinematic, whiteboard, infographic',
    edgeFunction: 'generate-template-ai',
    action: 'slide_by_slide',
    inputType: 'chapter_structure',
    outputType: 'styled_slides',
    optional: false,
    estimatedDuration: 20,
    creditMultiplier: 1.5,
  },
  quiz_assessment_generate: {
    id: 'quiz_assessment_generate',
    name: 'Quiz / Assessment Generation',
    description: 'Generate quizzes, MCQs, fill-in-the-blank, drag-and-drop per chapter',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_quiz',
    inputType: 'chapter_content',
    outputType: 'quiz_assessment',
    optional: true,
    estimatedDuration: 8,
    creditMultiplier: 0.5,
  },
  animated_character_scene: {
    id: 'animated_character_scene',
    name: 'Animated Character Scene',
    description: 'Generate Pixar/Disney/anime character scenes with narration for education',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_character_scene',
    inputType: 'scene_script',
    outputType: 'animated_scene',
    optional: true,
    estimatedDuration: 30,
    creditMultiplier: 2,
    zonePreference: 'auto',
  },
  kids_illustration_generate: {
    id: 'kids_illustration_generate',
    name: 'Kids Book Illustration',
    description: 'Generate colorful, age-appropriate illustrations for children\'s content',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_kids_illustration',
    inputType: 'story_scene',
    outputType: 'kids_illustration',
    optional: true,
    estimatedDuration: 15,
    creditMultiplier: 1.5,
  },
  motion_infographic_generate: {
    id: 'motion_infographic_generate',
    name: 'Motion Infographic / Animated Data',
    description: 'Generate animated infographics: counter animations, chart transitions, data flow, journey animations',
    edgeFunction: 'motion-graphics-generator',
    action: 'animate_infographic',
    inputType: 'infographic_data',
    outputType: 'motion_infographic',
    optional: true,
    estimatedDuration: 20,
    creditMultiplier: 1.5,
  },
  customer_journey_animate: {
    id: 'customer_journey_animate',
    name: 'Animated Customer Journey',
    description: 'Animate customer journey map: stages flow, touchpoints pulse, emotions animate, KPIs count up',
    edgeFunction: 'motion-graphics-generator',
    action: 'animate_journey',
    inputType: 'journey_map',
    outputType: 'animated_journey',
    optional: true,
    estimatedDuration: 15,
    creditMultiplier: 1,
  },
  training_manual_compile: {
    id: 'training_manual_compile',
    name: 'Training Manual Compilation',
    description: 'Compile chapters, slides, quizzes, and assessments into downloadable training manual (PDF + interactive)',
    edgeFunction: 'print-pdf-generator',
    action: 'training_manual',
    inputType: 'chapter_structure',
    outputType: 'training_manual',
    optional: true,
    estimatedDuration: 15,
    creditMultiplier: 1,
  },
  episodic_metadata: {
    id: 'episodic_metadata',
    name: 'Episodic Metadata Generator',
    description: 'Generate episode numbers, titles, teasers, next/prev links, series branding',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_episodic',
    inputType: 'content_chunks',
    outputType: 'episodic_metadata',
    optional: true,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },

  // ─── Podcast / Webcast / Meeting Intelligence ─────────────────────────

  podcast_outline_generate: {
    id: 'podcast_outline_generate',
    name: 'Podcast Outline & Structure',
    description: 'Generate podcast outline: intro hook, segments, talking points, transitions, outro CTA',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_podcast_outline',
    inputType: 'topic_or_transcript',
    outputType: 'podcast_outline',
    optional: false,
    estimatedDuration: 8,
    creditMultiplier: 0.5,
  },
  podcast_intro_outro: {
    id: 'podcast_intro_outro',
    name: 'Podcast Intro/Outro Generator',
    description: 'Generate branded podcast intro and outro with music, branding, and episode-specific hooks',
    edgeFunction: 'audio-mixer',
    action: 'podcast_bookends',
    inputType: 'podcast_config',
    outputType: 'intro_outro_audio',
    optional: true,
    estimatedDuration: 10,
    creditMultiplier: 0.5,
  },
  speaker_diarization: {
    id: 'speaker_diarization',
    name: 'Speaker Identification & Diarization',
    description: 'Identify individual speakers, label turns, track who said what with timestamps',
    edgeFunction: 'ai-universal-processor',
    action: 'speaker_diarization',
    inputType: 'audio',
    outputType: 'diarized_transcript',
    optional: false,
    estimatedDuration: 10,
    creditMultiplier: 1,
  },
  meeting_agenda_extract: {
    id: 'meeting_agenda_extract',
    name: 'Agenda & Topic Extraction',
    description: 'Extract agenda items, discussion topics, time spent per topic, decision points',
    edgeFunction: 'ai-universal-processor',
    action: 'extract_agenda',
    inputType: 'diarized_transcript',
    outputType: 'meeting_agenda',
    optional: false,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },
  mom_generate: {
    id: 'mom_generate',
    name: 'Minutes of Meeting (MoM)',
    description: 'Generate formal MoM: attendees, agenda, decisions, action items, deadlines, owners',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_mom',
    inputType: 'diarized_transcript',
    outputType: 'meeting_minutes',
    optional: false,
    estimatedDuration: 8,
    creditMultiplier: 1,
  },
  task_extract_assign: {
    id: 'task_extract_assign',
    name: 'Task Extraction & Assignment',
    description: 'Extract action items, assign to speakers, set deadlines, generate task board (Jira/Linear/Trello format)',
    edgeFunction: 'ai-universal-processor',
    action: 'extract_tasks',
    inputType: 'meeting_minutes',
    outputType: 'task_board',
    optional: false,
    estimatedDuration: 5,
    creditMultiplier: 0.5,
  },
  architecture_diagram_generate: {
    id: 'architecture_diagram_generate',
    name: 'Architecture Diagram Generation',
    description: 'Generate technical architecture diagrams: system design, data flow, sequence diagrams, ERD from discussion',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_architecture',
    inputType: 'technical_discussion',
    outputType: 'architecture_diagrams',
    optional: true,
    estimatedDuration: 15,
    creditMultiplier: 1.5,
  },
  business_flow_generate: {
    id: 'business_flow_generate',
    name: 'Business Flow Diagram',
    description: 'Generate business process flows: swimlane, BPMN, decision trees, org charts from discussion',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_business_flow',
    inputType: 'business_discussion',
    outputType: 'business_flow_diagrams',
    optional: true,
    estimatedDuration: 12,
    creditMultiplier: 1,
  },
  poc_screen_generate: {
    id: 'poc_screen_generate',
    name: 'Quick PoC / Sample Screens',
    description: 'Generate quick wireframes, mockups, or sample screens from meeting decisions and requirements',
    edgeFunction: 'ai-universal-processor',
    action: 'generate_poc_screens',
    inputType: 'meeting_decisions',
    outputType: 'poc_screens',
    optional: true,
    estimatedDuration: 20,
    creditMultiplier: 1.5,
    zonePreference: 'auto',
  },
  meeting_summary_distribute: {
    id: 'meeting_summary_distribute',
    name: 'Meeting Package & Distribution',
    description: 'Package MoM + tasks + diagrams + PoC screens and distribute to participants via email/Slack',
    edgeFunction: 'meeting-distributor',
    action: 'distribute',
    inputType: 'meeting_package',
    outputType: 'distribution_result',
    optional: true,
    estimatedDuration: 5,
    creditMultiplier: 0,
  },
  session_checkpoint: {
    id: 'session_checkpoint',
    name: 'Session Checkpoint / Resume',
    description: 'Save session checkpoint for pause/resume without restart — preserves transcript, edits, and generation state',
    edgeFunction: 'session-manager',
    action: 'checkpoint',
    inputType: 'session_state',
    outputType: 'checkpoint_id',
    optional: false,
    estimatedDuration: 2,
    creditMultiplier: 0,
  },
  transcript_edit_rewind: {
    id: 'transcript_edit_rewind',
    name: 'Transcript Edit & Rewind',
    description: 'Edit transcript inline, rewind to any point, re-generate from that point without restarting',
    edgeFunction: 'transcript-editor',
    action: 'edit_rewind',
    inputType: 'transcript_with_edits',
    outputType: 'edited_transcript',
    optional: true,
    estimatedDuration: 3,
    creditMultiplier: 0,
  },
  webcast_product_demo: {
    id: 'webcast_product_demo',
    name: 'Webcast Product Demo Processing',
    description: 'Process product demo recording: highlight key features, generate feature-specific clips, demo recap',
    edgeFunction: 'ai-universal-processor',
    action: 'process_product_demo',
    inputType: 'demo_recording',
    outputType: 'demo_highlights',
    optional: true,
    estimatedDuration: 15,
    creditMultiplier: 1,
  },
  podcast_to_video: {
    id: 'podcast_to_video',
    name: 'Podcast-to-Video Conversion',
    description: 'Convert podcast audio → video with avatar, waveform, slides, B-roll, or animated visuals',
    edgeFunction: 'ai-universal-processor',
    action: 'podcast_to_video',
    inputType: 'podcast_audio',
    outputType: 'podcast_video',
    optional: true,
    estimatedDuration: 30,
    creditMultiplier: 2,
    zonePreference: 'auto',
  },
};

// ─── Pre-Built Combination Chains ────────────────────────────────────────────

export const PIPELINE_CHAINS: Record<string, PipelineChain> = {
  // C1: Business-to-Global-Campaign (15 pipelines)
  business_to_campaign: {
    id: 'business_to_campaign',
    name: 'Business-to-Global-Campaign',
    description: 'From business name to published, transcreated video campaign across 76 regions',
    outputFormats: ['short_video', 'long_video'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.economy_archetype,
      ATOMIC_STEPS.competitive_analysis,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.script_enhance,
      ATOMIC_STEPS.transcreation,
      ATOMIC_STEPS.tts_generate,
      ATOMIC_STEPS.avatar_generate,
      ATOMIC_STEPS.lipsync,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.video_assemble,
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 300,
    minTier: 'creator',
    products: ['spark', 'mind', 'vibe', 'cast'],
  },

  // C2: Script-Edit-Regenerate (zero-restart)
  script_edit_regenerate: {
    id: 'script_edit_regenerate',
    name: 'Script-Edit-Regenerate',
    description: 'Edit script and selectively regenerate voice, avatar, or visuals without restarting',
    outputFormats: ['short_video', 'long_video'],
    steps: [
      ATOMIC_STEPS.script_enhance,
      ATOMIC_STEPS.tts_generate,
      ATOMIC_STEPS.lipsync,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.video_assemble,
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 120,
    minTier: 'free',
    products: ['mind', 'vibe', 'cast'],
  },

  // C3: Record-to-Everywhere (12 pipelines)
  record_to_everywhere: {
    id: 'record_to_everywhere',
    name: 'Record-to-Everywhere',
    description: 'One recording → podcast + video + blog + social clips + audiogram + newsletter',
    outputFormats: ['audio_podcast', 'video_podcast', 'short_video', 'audiogram', 'blog_post'],
    steps: [
      ATOMIC_STEPS.audio_enhance,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.script_generate, // Generate blog/newsletter from transcript
      ATOMIC_STEPS.podcast_show_notes,
      ATOMIC_STEPS.music_generate,
      ATOMIC_STEPS.audio_mix,
      ATOMIC_STEPS.video_generate, // Video podcast version
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.audiogram_generate,
      ATOMIC_STEPS.shorts_extract,
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 240,
    minTier: 'creator',
    products: ['vibe', 'mind', 'cast'],
  },

  // C4: Long-to-Shorts
  long_to_shorts: {
    id: 'long_to_shorts',
    name: 'Long-to-Shorts',
    description: 'AI extracts best 15-60s moments from long video for social',
    outputFormats: ['short_video'],
    steps: [
      ATOMIC_STEPS.video_extract_audio,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.shorts_extract,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.viral_score,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 120,
    minTier: 'starter',
    products: ['vibe', 'cast'],
  },

  // C5: Competitor-Battlecard-Video
  competitor_battlecard: {
    id: 'competitor_battlecard',
    name: 'Competitor-Battlecard-Video',
    description: 'Google Places competitor analysis → comparison video with A/B variants',
    outputFormats: ['short_video', 'long_video', 'presentation'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.competitive_analysis,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.transcreation,
      ATOMIC_STEPS.tts_generate,
      ATOMIC_STEPS.video_generate,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 180,
    minTier: 'pro',
    products: ['spark', 'mind', 'cast'],
  },

  // C6: Investor-Deck-Live-Demo (META USE CASE)
  investor_deck: {
    id: 'investor_deck',
    name: 'Investor-Deck-Live-Demo',
    description: 'Product demos itself with real business data — the meta use case',
    outputFormats: ['investor_deck', 'presentation', 'short_video'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.economy_archetype,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.slides_generate,
      ATOMIC_STEPS.tts_generate,
      ATOMIC_STEPS.video_generate,
      ATOMIC_STEPS.slides_export,
    ],
    estimatedDuration: 150,
    minTier: 'pro',
    products: ['spark', 'mind', 'deck', 'cast'],
  },

  // C7: Transcreation-Video-Pipeline (not just dubbing)
  transcreation_video: {
    id: 'transcreation_video',
    name: 'Transcreation-Video-Pipeline',
    description: 'Full cultural adaptation: wardrobe, companion, music, setting — not just dubbing',
    outputFormats: ['short_video', 'long_video'],
    steps: [
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.transcreation,
      ATOMIC_STEPS.tts_generate,
      ATOMIC_STEPS.avatar_generate,
      ATOMIC_STEPS.lipsync,
      ATOMIC_STEPS.music_generate,
      ATOMIC_STEPS.audio_mix,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.video_assemble,
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 240,
    minTier: 'pro',
    products: ['mind', 'vibe', 'cast'],
  },

  // C8: Economy-Aware-Content
  economy_aware: {
    id: 'economy_aware',
    name: 'Economy-Aware-Content',
    description: 'Auto-calibrate quality, format, and channel to business tier',
    outputFormats: ['short_video', 'long_video', 'audio_podcast'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.economy_archetype,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.tts_generate,
      ATOMIC_STEPS.video_generate,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 180,
    minTier: 'free',
    products: ['spark', 'mind', 'cast'],
  },

  // C10: Brand-Intelligence-to-Video (11 pipelines)
  brand_to_video: {
    id: 'brand_to_video',
    name: 'Brand-Intelligence-to-Video',
    description: 'From business name to published, A/B-tested video campaign in ONE flow',
    outputFormats: ['short_video', 'long_video'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.competitive_analysis,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.script_enhance,
      ATOMIC_STEPS.tts_generate,
      ATOMIC_STEPS.video_generate,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.viral_score,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 210,
    minTier: 'creator',
    products: ['spark', 'mind', 'cast'],
  },

  // C11: Podcast-to-Multichannel-Empire (14 pipelines)
  podcast_multichannel: {
    id: 'podcast_multichannel',
    name: 'Podcast-to-Multichannel-Empire',
    description: 'One recording → podcast + video + blog + audiogram + social clips + translated episodes',
    outputFormats: ['audio_podcast', 'video_podcast', 'audiogram', 'blog_post', 'short_video'],
    steps: [
      ATOMIC_STEPS.audio_enhance,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.podcast_show_notes,
      ATOMIC_STEPS.script_generate, // Blog post from transcript
      ATOMIC_STEPS.music_generate,
      ATOMIC_STEPS.audio_mix,
      ATOMIC_STEPS.video_generate, // Video podcast
      ATOMIC_STEPS.audiogram_generate,
      ATOMIC_STEPS.shorts_extract,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.transcreation, // Translated episodes
      ATOMIC_STEPS.multi_language_dub,
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 360,
    minTier: 'pro',
    products: ['vibe', 'mind', 'cast'],
  },

  // Simple flows for lower tiers
  quick_promo: {
    id: 'quick_promo',
    name: 'Quick Promo Video',
    description: 'Simple business promo from text → video in minutes',
    outputFormats: ['short_video'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.tts_generate,
      ATOMIC_STEPS.video_generate,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 120,
    minTier: 'free',
    products: ['mind', 'cast'],
  },

  // ─── C12: Video Remix Pipeline ──────────────────────────────────────────
  video_remix: {
    id: 'video_remix',
    name: 'Video-Remix-Stitch',
    description: 'Upload existing video → re-edit, add testimonials/B-roll, stitch new clips, generate teasers',
    outputFormats: ['video_remix', 'teaser_clip', 'best_clips', 'platform_clips', 'short_video'],
    steps: [
      ATOMIC_STEPS.video_extract_audio,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.video_scene_detect,
      ATOMIC_STEPS.video_clip_extract,
      ATOMIC_STEPS.testimonial_extract,
      ATOMIC_STEPS.broll_inject,
      ATOMIC_STEPS.video_stitch,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.teaser_generate,
      ATOMIC_STEPS.multi_thumbnail,
      ATOMIC_STEPS.platform_adapt,
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 240,
    minTier: 'creator',
    products: ['mind', 'vibe', 'cast'],
  },

  // ─── C13: Testimonial Compilation ─────────────────────────────────────
  testimonial_compilation: {
    id: 'testimonial_compilation',
    name: 'Testimonial-Compilation',
    description: 'Collect testimonials from reviews/videos → stitch into compelling testimonial reel',
    outputFormats: ['testimonial_video', 'short_video', 'highlight_reel'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.testimonial_extract,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.tts_generate,
      ATOMIC_STEPS.video_stitch,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.platform_adapt,
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 180,
    minTier: 'creator',
    products: ['vibe', 'cast'],
  },

  // ─── C14: Long-Form Production (Chunked Assembly) ─────────────────────
  long_form_production: {
    id: 'long_form_production',
    name: 'Long-Form-Chunked-Production',
    description: 'Script → chunk → parallel TTS + video generation → assembly → teasers + shorts + thumbnails',
    outputFormats: ['long_video', 'teaser_clip', 'best_clips', 'platform_clips', 'short_video'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.script_enhance,
      ATOMIC_STEPS.transcreation,
      ATOMIC_STEPS.long_form_chunk,
      ATOMIC_STEPS.chunk_tts,
      ATOMIC_STEPS.chunk_video,
      ATOMIC_STEPS.chunk_assembly,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.best_moments_ai,
      ATOMIC_STEPS.shorts_extract,
      ATOMIC_STEPS.teaser_generate,
      ATOMIC_STEPS.multi_thumbnail,
      ATOMIC_STEPS.platform_adapt,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 420,
    minTier: 'pro',
    products: ['spark', 'mind', 'vibe', 'cast'],
  },

  // ─── C15: Website Package ─────────────────────────────────────────────
  website_package: {
    id: 'website_package',
    name: 'Website-Package-Generator',
    description: 'Business data → full website: landing page, hero banner, sections, cards, scroll animations, CTAs',
    outputFormats: ['website_package', 'landing_page', 'hero_banner', 'infographic'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.economy_archetype,
      ATOMIC_STEPS.competitive_analysis,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.website_scaffold,
      ATOMIC_STEPS.hero_banner_generate,
      ATOMIC_STEPS.section_generate,
      ATOMIC_STEPS.card_generate,
      ATOMIC_STEPS.scroll_animation,
      ATOMIC_STEPS.cta_generate,
      ATOMIC_STEPS.infographic_generate,
      ATOMIC_STEPS.customer_journey_generate,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.website_export,
    ],
    estimatedDuration: 300,
    minTier: 'pro',
    products: ['spark', 'mind', 'deck', 'cast'],
  },

  // ─── C16: Landing Page Quick ──────────────────────────────────────────
  landing_page_quick: {
    id: 'landing_page_quick',
    name: 'Landing-Page-Quick',
    description: 'Quick single landing page with hero, features, testimonials, and CTA',
    outputFormats: ['landing_page', 'hero_banner'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.website_scaffold,
      ATOMIC_STEPS.hero_banner_generate,
      ATOMIC_STEPS.section_generate,
      ATOMIC_STEPS.cta_generate,
      ATOMIC_STEPS.website_export,
    ],
    estimatedDuration: 120,
    minTier: 'starter',
    products: ['spark', 'deck'],
  },

  // ─── C17: Hero Banner Only ────────────────────────────────────────────
  hero_banner_only: {
    id: 'hero_banner_only',
    name: 'Hero-Banner-Generator',
    description: 'Generate standalone hero banner: video loop, animated gradient, or cinematic still',
    outputFormats: ['hero_banner'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.hero_banner_generate,
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 45,
    minTier: 'free',
    products: ['spark', 'cast'],
  },

  // ─── C18: Whitepaper + Infographic Package ────────────────────────────
  whitepaper_package: {
    id: 'whitepaper_package',
    name: 'Whitepaper-Infographic-Package',
    description: 'Research/data → whitepaper PDF + animated infographic + customer journey map',
    outputFormats: ['whitepaper', 'infographic', 'case_study_page', 'presentation'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.competitive_analysis,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.whitepaper_generate,
      ATOMIC_STEPS.infographic_generate,
      ATOMIC_STEPS.customer_journey_generate,
      ATOMIC_STEPS.slides_generate,
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 180,
    minTier: 'pro',
    products: ['spark', 'deck', 'cast'],
  },

  // ─── C19: Interactive Demo + Product Page ─────────────────────────────
  interactive_demo_package: {
    id: 'interactive_demo_package',
    name: 'Interactive-Demo-Product-Page',
    description: 'Product data → interactive demo + product page + hero video + feature cards',
    outputFormats: ['interactive_demo', 'product_page', 'hero_banner', 'short_video'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.website_scaffold,
      ATOMIC_STEPS.hero_banner_generate,
      ATOMIC_STEPS.section_generate,
      ATOMIC_STEPS.card_generate,
      ATOMIC_STEPS.interactive_demo_generate,
      ATOMIC_STEPS.video_generate,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.website_export,
    ],
    estimatedDuration: 240,
    minTier: 'pro',
    products: ['spark', 'mind', 'deck', 'cast'],
  },

  // ─── C20: Video-to-Everything Empire ──────────────────────────────────
  video_to_everything: {
    id: 'video_to_everything',
    name: 'Video-to-Everything-Empire',
    description: 'One video → shorts + teasers + thumbnails + blog + audiogram + social + landing page + infographic',
    outputFormats: ['short_video', 'teaser_clip', 'best_clips', 'platform_clips', 'blog_post', 'audiogram', 'social_carousel', 'landing_page', 'infographic'],
    steps: [
      ATOMIC_STEPS.video_extract_audio,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.video_scene_detect,
      ATOMIC_STEPS.script_generate,         // Blog from transcript
      ATOMIC_STEPS.shorts_extract,           // Best short clips
      ATOMIC_STEPS.teaser_generate,          // Teaser trailer
      ATOMIC_STEPS.best_moments_ai,          // Best moments compilation
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.audiogram_generate,       // Audio waveform
      ATOMIC_STEPS.multi_thumbnail,          // Multiple thumbnails
      ATOMIC_STEPS.infographic_generate,     // Key data infographic
      ATOMIC_STEPS.website_scaffold,         // Landing page
      ATOMIC_STEPS.hero_banner_generate,
      ATOMIC_STEPS.section_generate,
      ATOMIC_STEPS.cta_generate,
      ATOMIC_STEPS.platform_adapt,           // Platform-specific clips
      ATOMIC_STEPS.transcreation,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 480,
    minTier: 'business',
    products: ['spark', 'mind', 'vibe', 'deck', 'cast'],
  },

  // ─── C21: Podcast-to-Website ──────────────────────────────────────────
  podcast_to_website: {
    id: 'podcast_to_website',
    name: 'Podcast-to-Website',
    description: 'Podcast recording → landing page + blog post + show notes + social cards + RSS',
    outputFormats: ['audio_podcast', 'landing_page', 'blog_post', 'newsletter'],
    steps: [
      ATOMIC_STEPS.audio_enhance,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.podcast_show_notes,
      ATOMIC_STEPS.script_generate,         // Blog from transcript
      ATOMIC_STEPS.music_generate,
      ATOMIC_STEPS.audio_mix,
      ATOMIC_STEPS.audiogram_generate,
      ATOMIC_STEPS.website_scaffold,         // Landing page
      ATOMIC_STEPS.hero_banner_generate,
      ATOMIC_STEPS.section_generate,
      ATOMIC_STEPS.cta_generate,
      ATOMIC_STEPS.seo_metadata_generate,
      ATOMIC_STEPS.rss_feed_generate,
      ATOMIC_STEPS.social_caption_generate,
      ATOMIC_STEPS.website_export,
    ],
    estimatedDuration: 300,
    minTier: 'creator',
    products: ['vibe', 'mind', 'deck', 'cast'],
  },

  // ─── C22: Blog-to-Multimedia ────────────────────────────────────────
  blog_to_multimedia: {
    id: 'blog_to_multimedia',
    name: 'Blog-to-Multimedia',
    description: 'Blog post / article → video + podcast + social carousel + infographic + email',
    outputFormats: ['short_video', 'long_video', 'audio_podcast', 'social_carousel', 'infographic', 'newsletter'],
    steps: [
      ATOMIC_STEPS.script_generate,         // Script from blog
      ATOMIC_STEPS.script_enhance,
      ATOMIC_STEPS.tts_generate,            // Voice narration
      ATOMIC_STEPS.video_generate,          // Video version
      ATOMIC_STEPS.music_generate,
      ATOMIC_STEPS.audio_mix,               // Podcast version
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.infographic_generate,    // Key points infographic
      ATOMIC_STEPS.social_caption_generate, // Social captions
      ATOMIC_STEPS.email_template_generate, // Newsletter version
      ATOMIC_STEPS.shorts_extract,          // Short clips
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.platform_adapt,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 300,
    minTier: 'creator',
    products: ['mind', 'cast'],
  },

  // ─── C23: Recording-to-Course-Series ─────────────────────────────────
  recording_to_course: {
    id: 'recording_to_course',
    name: 'Recording-to-Course-Series',
    description: 'Raw recording → chaptered course with slides, quizzes, and progressive learning path',
    outputFormats: ['course_series', 'training_manual', 'slide_deck_video', 'e_learning_module'],
    steps: [
      ATOMIC_STEPS.audio_enhance,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.chapter_structure_generate,  // AI module/chapter structure
      ATOMIC_STEPS.slide_by_slide_generate,     // Slides per chapter
      ATOMIC_STEPS.tts_generate,                // Clean narration per chapter
      ATOMIC_STEPS.animated_character_scene,     // Animated characters for engagement
      ATOMIC_STEPS.quiz_assessment_generate,     // Quizzes per chapter
      ATOMIC_STEPS.video_generate,              // Video per chapter
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.episodic_metadata,           // Episode numbering + branding
      ATOMIC_STEPS.training_manual_compile,     // Downloadable PDF manual
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 360,
    minTier: 'pro',
    products: ['vibe', 'mind', 'deck', 'cast'],
  },

  // ─── C24: Event-Recap-Empire ─────────────────────────────────────────
  event_recap_empire: {
    id: 'event_recap_empire',
    name: 'Event-Recap-Empire',
    description: 'Event video → recap video + highlights + social clips + blog + thank you email + infographic',
    outputFormats: ['event_recap', 'highlight_reel', 'short_video', 'platform_clips', 'blog_post', 'infographic'],
    steps: [
      ATOMIC_STEPS.video_extract_audio,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.video_scene_detect,
      ATOMIC_STEPS.video_clip_extract,
      ATOMIC_STEPS.best_moments_ai,
      ATOMIC_STEPS.script_generate,         // Blog + recap script
      ATOMIC_STEPS.video_stitch,            // Recap video
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.shorts_extract,          // Social clips
      ATOMIC_STEPS.infographic_generate,    // Event stats infographic
      ATOMIC_STEPS.email_template_generate, // Thank you email
      ATOMIC_STEPS.social_caption_generate,
      ATOMIC_STEPS.multi_thumbnail,
      ATOMIC_STEPS.platform_adapt,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 360,
    minTier: 'creator',
    products: ['vibe', 'mind', 'cast'],
  },

  // ─── C25: Webinar-Replay-Repurpose ───────────────────────────────────
  webinar_replay: {
    id: 'webinar_replay',
    name: 'Webinar-Replay-Repurpose',
    description: 'Webinar recording → on-demand with chapters + blog + clips + slides + quiz',
    outputFormats: ['webinar_replay', 'blog_post', 'short_video', 'presentation', 'e_learning_module'],
    steps: [
      ATOMIC_STEPS.video_extract_audio,
      ATOMIC_STEPS.audio_enhance,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.chapters_auto_detect,    // Auto-chapter the webinar
      ATOMIC_STEPS.transcript_index,        // Searchable transcript
      ATOMIC_STEPS.script_generate,         // Blog from transcript
      ATOMIC_STEPS.slides_generate,         // Slides from content
      ATOMIC_STEPS.quiz_assessment_generate, // Knowledge check quiz
      ATOMIC_STEPS.shorts_extract,          // Best moment clips
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.seo_metadata_generate,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 300,
    minTier: 'creator',
    products: ['vibe', 'mind', 'deck', 'cast'],
  },

  // ─── C26: Multilingual-Simultaneous-Campaign ─────────────────────────
  multilingual_campaign: {
    id: 'multilingual_campaign',
    name: 'Multilingual-Simultaneous-Campaign',
    description: 'One script → N languages simultaneously with transcreation + avatar + lip-sync per language',
    outputFormats: ['short_video', 'long_video'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.script_enhance,
      ATOMIC_STEPS.transcreation,           // Cultural adaptation per region
      ATOMIC_STEPS.tts_generate,            // Multi-language TTS
      ATOMIC_STEPS.avatar_generate,         // Regional wardrobe avatars
      ATOMIC_STEPS.lipsync,                 // Lip-sync per language
      ATOMIC_STEPS.caption_generate,        // Subtitles per language
      ATOMIC_STEPS.multi_language_dub,      // Full dubbing
      ATOMIC_STEPS.video_assemble,
      ATOMIC_STEPS.multi_thumbnail,
      ATOMIC_STEPS.platform_adapt,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 480,
    minTier: 'pro',
    products: ['spark', 'mind', 'vibe', 'cast'],
  },

  // ─── C27: Franchise-Multi-Location ────────────────────────────────────
  franchise_multi_location: {
    id: 'franchise_multi_location',
    name: 'Franchise-Multi-Location',
    description: 'Template → N location variants, each enriched with local Google Places data',
    outputFormats: ['short_video', 'long_video', 'landing_page', 'franchise_local'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,    // Per-location enrichment
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.economy_archetype,       // Local economy context
      ATOMIC_STEPS.competitive_analysis,    // Local competitors
      ATOMIC_STEPS.script_generate,         // Location-specific script
      ATOMIC_STEPS.transcreation,           // Regional adaptation
      ATOMIC_STEPS.tts_generate,
      ATOMIC_STEPS.video_generate,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.website_scaffold,        // Location landing page
      ATOMIC_STEPS.seo_metadata_generate,   // Local SEO
      ATOMIC_STEPS.social_caption_generate,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 300,
    minTier: 'business',
    products: ['spark', 'mind', 'cast', 'deck'],
  },

  // ─── C28: Episodic-Series-Producer ────────────────────────────────────
  episodic_series: {
    id: 'episodic_series',
    name: 'Episodic-Series-Producer',
    description: 'Content → episodic series with consistent branding, numbering, teasers, and cross-promotion',
    outputFormats: ['long_video', 'short_video', 'audio_podcast', 'teaser_clip', 'course_series'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.long_form_chunk,         // Split into episodes
      ATOMIC_STEPS.episodic_metadata,       // Episode numbering + branding
      ATOMIC_STEPS.tts_generate,            // Per-episode narration
      ATOMIC_STEPS.video_generate,          // Per-episode video
      ATOMIC_STEPS.logo_animate,            // Series intro animation
      ATOMIC_STEPS.music_generate,          // Series theme music
      ATOMIC_STEPS.audio_mix,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.teaser_generate,         // Next episode teaser
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.rss_feed_generate,       // Series RSS
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 480,
    minTier: 'pro',
    products: ['spark', 'mind', 'vibe', 'cast'],
  },

  // ─── C29: A/B-Testing-Variants ────────────────────────────────────────
  ab_testing_variants: {
    id: 'ab_testing_variants',
    name: 'A/B-Testing-Variants',
    description: 'Content → N variants with different hooks, CTAs, thumbnails, and styles for testing',
    outputFormats: ['short_video', 'long_video', 'landing_page'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.copy_variant_generate,   // Generate A/B variants
      ATOMIC_STEPS.tts_generate,
      ATOMIC_STEPS.video_generate,
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.multi_thumbnail,         // Multiple thumbnails
      ATOMIC_STEPS.viral_score,             // Score each variant
      ATOMIC_STEPS.sentiment_analyze,       // Tone analysis per variant
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 300,
    minTier: 'pro',
    products: ['spark', 'mind', 'cast'],
  },

  // ─── C30: UGC-Curation-Remix ──────────────────────────────────────────
  ugc_curation: {
    id: 'ugc_curation',
    name: 'UGC-Curation-Remix',
    description: 'User-generated clips → curated compilation with branding, transitions, and music',
    outputFormats: ['ugc_compilation', 'highlight_reel', 'short_video', 'testimonial_video'],
    steps: [
      ATOMIC_STEPS.video_scene_detect,      // Analyze each UGC clip
      ATOMIC_STEPS.video_clip_extract,      // Extract best parts
      ATOMIC_STEPS.best_moments_ai,         // AI ranks best moments
      ATOMIC_STEPS.testimonial_extract,     // Extract testimonials
      ATOMIC_STEPS.logo_animate,            // Brand intro/outro
      ATOMIC_STEPS.music_generate,          // Background music
      ATOMIC_STEPS.video_stitch,            // Stitch compilation
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.watermark_apply,         // Brand watermark
      ATOMIC_STEPS.multi_thumbnail,
      ATOMIC_STEPS.platform_adapt,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 300,
    minTier: 'creator',
    products: ['vibe', 'cast'],
  },

  // ─── C31: Screen-Recording-to-Tutorial ─────────────────────────────────
  screen_to_tutorial: {
    id: 'screen_to_tutorial',
    name: 'Screen-Recording-to-Tutorial',
    description: 'Screen recording → polished tutorial with chapters, captions, zoom effects, and steps',
    outputFormats: ['tutorial_series', 'long_video', 'short_video', 'blog_post'],
    steps: [
      ATOMIC_STEPS.video_extract_audio,
      ATOMIC_STEPS.audio_enhance,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.chapters_auto_detect,    // Auto-detect tutorial steps
      ATOMIC_STEPS.script_generate,         // Clean up narration + blog post
      ATOMIC_STEPS.tts_generate,            // Re-record clean narration
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.shorts_extract,          // Quick tip clips
      ATOMIC_STEPS.infographic_generate,    // Steps infographic
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.seo_metadata_generate,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 240,
    minTier: 'starter',
    products: ['vibe', 'mind', 'cast'],
  },

  // ─── C32: Newsletter-to-Social-Campaign ────────────────────────────────
  newsletter_to_social: {
    id: 'newsletter_to_social',
    name: 'Newsletter-to-Social-Campaign',
    description: 'Newsletter content → social videos + carousel + audiogram + email + blog',
    outputFormats: ['newsletter_social', 'short_video', 'social_carousel', 'audiogram', 'blog_post'],
    steps: [
      ATOMIC_STEPS.script_generate,         // Adapt newsletter for each format
      ATOMIC_STEPS.tts_generate,            // Voice version
      ATOMIC_STEPS.video_generate,          // Video version
      ATOMIC_STEPS.audiogram_generate,      // Audio snippet
      ATOMIC_STEPS.infographic_generate,    // Key stats
      ATOMIC_STEPS.social_caption_generate, // Platform captions
      ATOMIC_STEPS.email_template_generate, // Email campaign version
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.platform_adapt,
      ATOMIC_STEPS.content_schedule,        // Schedule across platforms
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 240,
    minTier: 'creator',
    products: ['mind', 'cast'],
  },

  // ─── C33: Training-Manual-Producer ─────────────────────────────────────
  training_manual: {
    id: 'training_manual',
    name: 'Training-Manual-Producer',
    description: 'Content → full training manual with chapters, Pixar/cinematic slides, quizzes, video per chapter',
    outputFormats: ['training_manual', 'slide_deck_video', 'course_series', 'e_learning_module'],
    steps: [
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.chapter_structure_generate,  // AI module structure
      ATOMIC_STEPS.slide_by_slide_generate,     // Different style per slide (Pixar, cinematic, whiteboard)
      ATOMIC_STEPS.animated_character_scene,     // Animated guide characters
      ATOMIC_STEPS.tts_generate,                // Per-chapter narration
      ATOMIC_STEPS.video_generate,              // Per-chapter video
      ATOMIC_STEPS.quiz_assessment_generate,    // Per-chapter assessments
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.motion_infographic_generate, // Animated data/process diagrams
      ATOMIC_STEPS.customer_journey_animate,    // Animated process flows
      ATOMIC_STEPS.episodic_metadata,           // Chapter numbering
      ATOMIC_STEPS.training_manual_compile,     // Final PDF + interactive manual
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 420,
    minTier: 'pro',
    products: ['mind', 'deck', 'cast'],
  },

  // ─── C34: Kids-Book-Animator ───────────────────────────────────────────
  kids_book_animator: {
    id: 'kids_book_animator',
    name: 'Kids-Book-Animator',
    description: 'Story → illustrated kids book with Pixar-style animation, narration, and interactive elements',
    outputFormats: ['kids_book', 'slide_deck_video', 'animated_infographic'],
    steps: [
      ATOMIC_STEPS.script_generate,             // Story adaptation
      ATOMIC_STEPS.script_enhance,              // Age-appropriate language
      ATOMIC_STEPS.chapter_structure_generate,  // Story chapters/scenes
      ATOMIC_STEPS.kids_illustration_generate,  // Colorful illustrations per scene
      ATOMIC_STEPS.animated_character_scene,    // Animate characters (Pixar/Disney style)
      ATOMIC_STEPS.tts_generate,               // Child-friendly narration
      ATOMIC_STEPS.music_generate,             // Playful background music
      ATOMIC_STEPS.audio_mix,
      ATOMIC_STEPS.video_generate,             // Animated video per scene
      ATOMIC_STEPS.video_assemble,             // Stitch all scenes
      ATOMIC_STEPS.caption_generate,           // Subtitles for reading along
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 360,
    minTier: 'creator',
    products: ['mind', 'cast'],
  },

  // ─── C35: Course-Series-Producer ───────────────────────────────────────
  course_series: {
    id: 'course_series',
    name: 'Course-Series-Producer',
    description: 'Curriculum → multi-episode course with progressive learning, assessments, and certificates',
    outputFormats: ['course_series', 'e_learning_module', 'training_manual', 'slide_deck_video'],
    steps: [
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.chapter_structure_generate,  // Curriculum → modules → lessons
      ATOMIC_STEPS.slide_by_slide_generate,     // Slides per lesson
      ATOMIC_STEPS.animated_character_scene,     // AI instructor character
      ATOMIC_STEPS.tts_generate,                // Per-lesson narration
      ATOMIC_STEPS.video_generate,              // Per-lesson video
      ATOMIC_STEPS.motion_infographic_generate, // Animated diagrams/processes
      ATOMIC_STEPS.quiz_assessment_generate,    // Per-module assessments
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.episodic_metadata,           // Module + lesson numbering
      ATOMIC_STEPS.training_manual_compile,     // Companion PDF manual
      ATOMIC_STEPS.rss_feed_generate,           // Course RSS for LMS
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 480,
    minTier: 'pro',
    products: ['mind', 'deck', 'cast'],
  },

  // ─── C36: Audio-Upload-to-Podcast ──────────────────────────────────────
  audio_to_podcast: {
    id: 'audio_to_podcast',
    name: 'Audio-Upload-to-Podcast',
    description: 'Upload raw audio → full podcast episode with intro/outro, music, show notes, transcript, clips',
    outputFormats: ['podcast_episode', 'audio_podcast', 'short_video', 'audiogram', 'blog_post'],
    steps: [
      ATOMIC_STEPS.audio_enhance,
      ATOMIC_STEPS.speaker_diarization,      // Identify speakers
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.podcast_outline_generate, // Structure the episode
      ATOMIC_STEPS.script_enhance,           // Clean up transcript
      ATOMIC_STEPS.podcast_intro_outro,      // Branded intro/outro
      ATOMIC_STEPS.music_generate,           // Background music
      ATOMIC_STEPS.audio_mix,               // Mix everything
      ATOMIC_STEPS.podcast_show_notes,       // Show notes
      ATOMIC_STEPS.script_generate,          // Blog post from transcript
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.audiogram_generate,       // Social audio clips
      ATOMIC_STEPS.shorts_extract,           // Best moment clips
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.rss_feed_generate,
      ATOMIC_STEPS.seo_metadata_generate,
      ATOMIC_STEPS.session_checkpoint,
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 300,
    minTier: 'creator',
    products: ['vibe', 'mind', 'cast'],
  },

  // ─── C37: Podcast-to-Video ──────────────────────────────────────────
  podcast_to_video_chain: {
    id: 'podcast_to_video_chain',
    name: 'Podcast-to-Video',
    description: 'Podcast audio → full video with avatar/visuals + clips + social + landing page',
    outputFormats: ['video_from_podcast', 'video_podcast', 'short_video', 'platform_clips', 'landing_page'],
    steps: [
      ATOMIC_STEPS.audio_enhance,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.speaker_diarization,
      ATOMIC_STEPS.podcast_outline_generate,
      ATOMIC_STEPS.podcast_to_video,          // Generate video from podcast
      ATOMIC_STEPS.avatar_generate,           // Speaking avatar per speaker
      ATOMIC_STEPS.lipsync,                   // Lip-sync avatar to audio
      ATOMIC_STEPS.broll_inject,              // B-roll between segments
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.shorts_extract,            // Best moment clips
      ATOMIC_STEPS.teaser_generate,           // Episode teaser
      ATOMIC_STEPS.multi_thumbnail,
      ATOMIC_STEPS.platform_adapt,            // TikTok, Reels, Shorts
      ATOMIC_STEPS.website_scaffold,          // Episode landing page
      ATOMIC_STEPS.hero_banner_generate,
      ATOMIC_STEPS.seo_metadata_generate,
      ATOMIC_STEPS.session_checkpoint,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 420,
    minTier: 'pro',
    products: ['vibe', 'mind', 'cast', 'deck'],
  },

  // ─── C38: Meeting-Intelligence ──────────────────────────────────────
  meeting_intelligence: {
    id: 'meeting_intelligence',
    name: 'Meeting-Intelligence',
    description: 'Meeting recording → MoM + tasks + architecture/business diagrams + PoC screens + distribution',
    outputFormats: ['meeting_recap', 'meeting_poc', 'architecture_diagram', 'business_flow', 'presentation'],
    steps: [
      ATOMIC_STEPS.audio_enhance,
      ATOMIC_STEPS.speaker_diarization,       // Who said what
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.transcript_edit_rewind,    // Edit/correct transcript
      ATOMIC_STEPS.meeting_agenda_extract,    // Extract agenda + topics
      ATOMIC_STEPS.mom_generate,              // Minutes of Meeting
      ATOMIC_STEPS.task_extract_assign,       // Tasks + owners + deadlines
      ATOMIC_STEPS.architecture_diagram_generate, // Tech architecture if technical
      ATOMIC_STEPS.business_flow_generate,    // Business flows if business
      ATOMIC_STEPS.poc_screen_generate,       // Quick PoC / wireframes
      ATOMIC_STEPS.slides_generate,           // Summary presentation
      ATOMIC_STEPS.infographic_generate,      // Key decisions infographic
      ATOMIC_STEPS.email_template_generate,   // Follow-up email
      ATOMIC_STEPS.session_checkpoint,
      ATOMIC_STEPS.meeting_summary_distribute, // Send to participants
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 180,
    minTier: 'creator',
    products: ['mind', 'deck', 'cast', 'hub'],
  },

  // ─── C39: Webcast-Product-Demo ──────────────────────────────────────
  webcast_product_demo: {
    id: 'webcast_product_demo',
    name: 'Webcast-Product-Demo',
    description: 'Product demo webcast → replay with highlights + feature clips + landing page + follow-up',
    outputFormats: ['webcast_replay', 'short_video', 'platform_clips', 'landing_page', 'interactive_demo', 'email_campaign'],
    steps: [
      ATOMIC_STEPS.video_extract_audio,
      ATOMIC_STEPS.audio_enhance,
      ATOMIC_STEPS.speaker_diarization,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.chapters_auto_detect,       // Auto-chapter the demo
      ATOMIC_STEPS.webcast_product_demo,       // Extract demo highlights
      ATOMIC_STEPS.video_clip_extract,         // Feature-specific clips
      ATOMIC_STEPS.script_generate,            // Blog recap
      ATOMIC_STEPS.shorts_extract,             // Social clips
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.website_scaffold,           // Product landing page
      ATOMIC_STEPS.hero_banner_generate,
      ATOMIC_STEPS.interactive_demo_generate,  // Interactive demo version
      ATOMIC_STEPS.email_template_generate,    // Follow-up email
      ATOMIC_STEPS.multi_thumbnail,
      ATOMIC_STEPS.platform_adapt,
      ATOMIC_STEPS.session_checkpoint,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 360,
    minTier: 'pro',
    products: ['vibe', 'mind', 'deck', 'cast'],
  },

  // ─── C40: Technical-Meeting-to-Architecture ──────────────────────────
  tech_meeting_to_arch: {
    id: 'tech_meeting_to_arch',
    name: 'Technical-Meeting-to-Architecture',
    description: 'Technical meeting → architecture diagrams + system design docs + PoC screens + task board',
    outputFormats: ['architecture_diagram', 'meeting_recap', 'meeting_poc', 'whitepaper', 'presentation'],
    steps: [
      ATOMIC_STEPS.audio_enhance,
      ATOMIC_STEPS.speaker_diarization,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.transcript_edit_rewind,
      ATOMIC_STEPS.meeting_agenda_extract,
      ATOMIC_STEPS.mom_generate,
      ATOMIC_STEPS.task_extract_assign,
      ATOMIC_STEPS.architecture_diagram_generate,  // System design, data flow, sequence diagrams
      ATOMIC_STEPS.poc_screen_generate,            // Wireframes / sample screens
      ATOMIC_STEPS.whitepaper_generate,            // Technical design doc
      ATOMIC_STEPS.slides_generate,                // Architecture presentation
      ATOMIC_STEPS.motion_infographic_generate,    // Animated architecture diagrams
      ATOMIC_STEPS.session_checkpoint,
      ATOMIC_STEPS.meeting_summary_distribute,
      ATOMIC_STEPS.quality_check,
    ],
    estimatedDuration: 240,
    minTier: 'pro',
    products: ['mind', 'deck', 'cast', 'hub'],
  },

  // ─── C41: Live-Recording-to-Everything ──────────────────────────────
  live_to_everything: {
    id: 'live_to_everything',
    name: 'Live-Recording-to-Everything',
    description: 'Live recording → podcast + video + MoM + blog + social + transcript (edit/rewind/resume)',
    outputFormats: ['live_recording_processed', 'podcast_episode', 'video_podcast', 'meeting_recap', 'blog_post', 'short_video'],
    steps: [
      ATOMIC_STEPS.audio_enhance,
      ATOMIC_STEPS.speaker_diarization,
      ATOMIC_STEPS.audio_transcribe,
      ATOMIC_STEPS.transcript_edit_rewind,     // Edit, rewind, correct
      ATOMIC_STEPS.chapters_auto_detect,       // Auto-chapter detection
      ATOMIC_STEPS.meeting_agenda_extract,     // If meeting-like
      ATOMIC_STEPS.mom_generate,               // MoM if applicable
      ATOMIC_STEPS.task_extract_assign,        // Tasks if applicable
      ATOMIC_STEPS.podcast_outline_generate,   // Podcast structure
      ATOMIC_STEPS.podcast_intro_outro,        // Branded intro/outro
      ATOMIC_STEPS.music_generate,
      ATOMIC_STEPS.audio_mix,
      ATOMIC_STEPS.podcast_to_video,           // Video version
      ATOMIC_STEPS.script_generate,            // Blog post
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.shorts_extract,
      ATOMIC_STEPS.audiogram_generate,
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.session_checkpoint,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 480,
    minTier: 'pro',
    products: ['vibe', 'mind', 'cast', 'hub'],
  },

  // ─── C42: Podcast-Create-from-Scratch ──────────────────────────────
  podcast_from_scratch: {
    id: 'podcast_from_scratch',
    name: 'Podcast-Create-from-Scratch',
    description: 'Topic/script → full podcast episode with AI narration, intro/outro, video, social clips, landing page',
    outputFormats: ['podcast_episode', 'video_from_podcast', 'short_video', 'audiogram', 'landing_page', 'blog_post'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.podcast_outline_generate,   // Episode structure
      ATOMIC_STEPS.script_generate,            // Full script from outline
      ATOMIC_STEPS.script_enhance,             // Polish
      ATOMIC_STEPS.transcreation,              // Multi-language versions
      ATOMIC_STEPS.tts_generate,               // AI narration
      ATOMIC_STEPS.podcast_intro_outro,        // Branded intro/outro
      ATOMIC_STEPS.music_generate,             // Background music
      ATOMIC_STEPS.soundscape_generate,        // Ambient audio
      ATOMIC_STEPS.audio_mix,                  // Mix everything
      ATOMIC_STEPS.podcast_to_video,           // Video version
      ATOMIC_STEPS.avatar_generate,            // Speaking avatar
      ATOMIC_STEPS.caption_generate,
      ATOMIC_STEPS.shorts_extract,             // Social clips
      ATOMIC_STEPS.audiogram_generate,         // Social waveform
      ATOMIC_STEPS.podcast_show_notes,         // Show notes
      ATOMIC_STEPS.script_generate,            // Blog post
      ATOMIC_STEPS.website_scaffold,           // Episode landing page
      ATOMIC_STEPS.hero_banner_generate,
      ATOMIC_STEPS.thumbnail_generate,
      ATOMIC_STEPS.rss_feed_generate,
      ATOMIC_STEPS.seo_metadata_generate,
      ATOMIC_STEPS.session_checkpoint,
      ATOMIC_STEPS.quality_check,
      ATOMIC_STEPS.social_publish,
    ],
    estimatedDuration: 480,
    minTier: 'creator',
    products: ['spark', 'vibe', 'mind', 'cast', 'deck'],
  },

  // Presentation chain
  smart_presentation: {
    id: 'smart_presentation',
    name: 'Smart Presentation',
    description: 'Generate presentation from any input (text, URL, PDF, audio)',
    outputFormats: ['presentation'],
    steps: [
      ATOMIC_STEPS.google_places_enrich,
      ATOMIC_STEPS.brand_profile,
      ATOMIC_STEPS.script_generate,
      ATOMIC_STEPS.slides_generate,
      ATOMIC_STEPS.tts_generate, // Speaker notes narration
      ATOMIC_STEPS.slides_export,
    ],
    estimatedDuration: 90,
    minTier: 'starter',
    products: ['spark', 'deck'],
  },
};

// ─── Intent × Format Matrix ─────────────────────────────────────────────────

/**
 * INTENT × FORMAT MATRIX
 *
 * Maps every (intent, format) pair to the best chain. This replaces the old
 * tier-only fallback that ignored intent for many format types.
 *
 * Matrix precedence:
 * 1. Exact (intent, format) match in INTENT_FORMAT_MATRIX
 * 2. Format-only match in FORMAT_CHAIN_MAP
 * 3. Intent-only match in INTENT_CHAIN_MAP
 * 4. Context-aware fallback (tier, Google Places, etc.)
 */

const FORMAT_CHAIN_MAP: Partial<Record<ContentFormat, string>> = {
  // Video remix & clip extraction
  video_remix: 'video_remix',
  testimonial_video: 'testimonial_compilation',
  teaser_clip: 'video_remix',
  best_clips: 'video_remix',
  highlight_reel: 'video_remix',
  platform_clips: 'long_form_production',
  ugc_compilation: 'ugc_curation',

  // Podcast / audio / meeting
  audio_podcast: 'audio_to_podcast',
  video_podcast: 'podcast_to_video_chain',
  audiogram: 'record_to_everywhere',
  podcast_episode: 'audio_to_podcast',
  video_from_podcast: 'podcast_to_video_chain',
  meeting_recap: 'meeting_intelligence',
  meeting_poc: 'meeting_intelligence',
  architecture_diagram: 'tech_meeting_to_arch',
  business_flow: 'meeting_intelligence',
  webcast_replay: 'webcast_product_demo',
  live_recording_processed: 'live_to_everything',

  // Presentation
  presentation: 'smart_presentation',
  investor_deck: 'investor_deck',
  slide_deck_video: 'training_manual',

  // Website package
  website_package: 'website_package',
  microsite: 'website_package',
  landing_page: 'landing_page_quick',
  product_page: 'interactive_demo_package',
  hero_banner: 'hero_banner_only',
  interactive_demo: 'interactive_demo_package',

  // Document / data
  whitepaper: 'whitepaper_package',
  case_study_page: 'whitepaper_package',
  infographic: 'whitepaper_package',
  animated_infographic: 'training_manual',

  // Training & education
  training_manual: 'training_manual',
  course_series: 'course_series',
  kids_book: 'kids_book_animator',
  e_learning_module: 'course_series',
  tutorial_series: 'screen_to_tutorial',
  animated_journey: 'training_manual',

  // Repurposing & derivatives
  event_recap: 'event_recap_empire',
  webinar_replay: 'webinar_replay',
  franchise_local: 'franchise_multi_location',
  newsletter_social: 'newsletter_to_social',
  email_campaign: 'newsletter_to_social',

  // Social
  social_carousel: 'blog_to_multimedia',
  newsletter: 'blog_to_multimedia',
  blog_post: 'blog_to_multimedia',
};

const INTENT_CHAIN_MAP: Partial<Record<ContentIntent, string>> = {
  comparison: 'competitor_battlecard',
  investor_pitch: 'investor_deck',
  training: 'training_manual',
  kids_education: 'kids_book_animator',
  repurpose: 'video_to_everything',
  franchise: 'franchise_multi_location',
  series: 'episodic_series',
  ugc: 'ugc_curation',
  newsletter: 'newsletter_to_social',
  webinar: 'webinar_replay',
  event_recap: 'event_recap_empire',
  interview: 'record_to_everywhere',
  meeting: 'meeting_intelligence',
  podcast_create: 'podcast_from_scratch',
  live_session: 'live_to_everything',
  product_walkthrough: 'webcast_product_demo',
};

/**
 * Specific (intent, format) overrides that are more precise than either
 * format-only or intent-only mappings. Key format: "intent::format".
 */
const INTENT_FORMAT_OVERRIDES: Record<string, string> = {
  // Training intents with specific formats
  'training::short_video': 'training_manual',
  'training::long_video': 'course_series',
  'training::presentation': 'training_manual',
  'training::blog_post': 'blog_to_multimedia',

  // Kids education
  'kids_education::short_video': 'kids_book_animator',
  'kids_education::long_video': 'kids_book_animator',

  // Promo with specific output formats
  'promo::landing_page': 'landing_page_quick',
  'promo::website_package': 'website_package',
  'promo::infographic': 'whitepaper_package',
  'promo::email_campaign': 'newsletter_to_social',

  // Tutorial
  'tutorial::short_video': 'screen_to_tutorial',
  'tutorial::long_video': 'screen_to_tutorial',
  'tutorial::course_series': 'course_series',
  'tutorial::training_manual': 'training_manual',
  'tutorial::blog_post': 'blog_to_multimedia',

  // Case study with different formats
  'case_study::whitepaper': 'whitepaper_package',
  'case_study::landing_page': 'landing_page_quick',
  'case_study::short_video': 'brand_to_video',

  // Announcement → different formats
  'announcement::landing_page': 'landing_page_quick',
  'announcement::email_campaign': 'newsletter_to_social',
  'announcement::social_carousel': 'blog_to_multimedia',

  // Series content
  'series::audio_podcast': 'episodic_series',
  'series::long_video': 'episodic_series',
  'series::course_series': 'course_series',

  // Behind the scenes
  'behind_scenes::short_video': 'video_remix',
  'behind_scenes::long_video': 'record_to_everywhere',

  // Product demo
  'product_demo::interactive_demo': 'interactive_demo_package',
  'product_demo::landing_page': 'interactive_demo_package',
  'product_demo::short_video': 'brand_to_video',
  'product_demo::website_package': 'interactive_demo_package',

  // Brand story
  'brand_story::landing_page': 'website_package',
  'brand_story::website_package': 'website_package',
  'brand_story::infographic': 'whitepaper_package',

  // Testimonial
  'testimonial::short_video': 'testimonial_compilation',
  'testimonial::long_video': 'testimonial_compilation',
  'testimonial::landing_page': 'landing_page_quick',

  // Explainer
  'explainer::short_video': 'brand_to_video',
  'explainer::long_video': 'long_form_production',
  'explainer::animated_infographic': 'training_manual',
  'explainer::infographic': 'whitepaper_package',

  // Repurpose
  'repurpose::short_video': 'long_to_shorts',
  'repurpose::audio_podcast': 'record_to_everywhere',
  'repurpose::blog_post': 'blog_to_multimedia',
  'repurpose::social_carousel': 'newsletter_to_social',
  'repurpose::newsletter_social': 'newsletter_to_social',

  // Franchise
  'franchise::short_video': 'franchise_multi_location',
  'franchise::landing_page': 'franchise_multi_location',

  // Meeting intelligence
  'meeting::meeting_recap': 'meeting_intelligence',
  'meeting::architecture_diagram': 'tech_meeting_to_arch',
  'meeting::meeting_poc': 'meeting_intelligence',
  'meeting::presentation': 'meeting_intelligence',
  'meeting::business_flow': 'meeting_intelligence',
  'meeting::whitepaper': 'tech_meeting_to_arch',

  // Podcast creation
  'podcast_create::audio_podcast': 'podcast_from_scratch',
  'podcast_create::podcast_episode': 'podcast_from_scratch',
  'podcast_create::video_from_podcast': 'podcast_from_scratch',
  'podcast_create::video_podcast': 'podcast_to_video_chain',
  'podcast_create::short_video': 'podcast_from_scratch',
  'podcast_create::blog_post': 'podcast_from_scratch',
  'podcast_create::landing_page': 'podcast_from_scratch',

  // Live session / webcast
  'live_session::webcast_replay': 'webcast_product_demo',
  'live_session::meeting_recap': 'live_to_everything',
  'live_session::audio_podcast': 'live_to_everything',
  'live_session::short_video': 'live_to_everything',
  'live_session::blog_post': 'live_to_everything',

  // Product walkthrough / demo
  'product_walkthrough::interactive_demo': 'webcast_product_demo',
  'product_walkthrough::landing_page': 'webcast_product_demo',
  'product_walkthrough::short_video': 'webcast_product_demo',
  'product_walkthrough::webcast_replay': 'webcast_product_demo',
  'product_walkthrough::email_campaign': 'webcast_product_demo',

  // Webinar
  'webinar::audio_podcast': 'webinar_replay',
  'webinar::short_video': 'webinar_replay',
  'webinar::blog_post': 'webinar_replay',
  'webinar::presentation': 'webinar_replay',
  'webinar::e_learning_module': 'webinar_replay',

  // Interview → different outputs
  'interview::audio_podcast': 'audio_to_podcast',
  'interview::video_podcast': 'podcast_to_video_chain',
  'interview::podcast_episode': 'audio_to_podcast',
  'interview::blog_post': 'record_to_everywhere',
  'interview::short_video': 'record_to_everywhere',
};

/**
 * Select the best pipeline chain based on user intent and format.
 * Uses a 4-level precedence: exact match → format → intent → context fallback.
 */
export function selectChain(
  intent: ContentIntent,
  format: ContentFormat,
  tier: string,
  hasGooglePlaces: boolean,
): PipelineChain {
  // 1. Check exact (intent, format) override
  const overrideKey = `${intent}::${format}`;
  const overrideChainId = INTENT_FORMAT_OVERRIDES[overrideKey];
  if (overrideChainId && PIPELINE_CHAINS[overrideChainId]) {
    return PIPELINE_CHAINS[overrideChainId];
  }

  // 2. Check format-only mapping
  const formatChainId = FORMAT_CHAIN_MAP[format];
  if (formatChainId && PIPELINE_CHAINS[formatChainId]) {
    return PIPELINE_CHAINS[formatChainId];
  }

  // 3. Check intent-only mapping
  const intentChainId = INTENT_CHAIN_MAP[intent];
  if (intentChainId && PIPELINE_CHAINS[intentChainId]) {
    return PIPELINE_CHAINS[intentChainId];
  }

  // 4. Context-aware fallback
  // Long video → long-form production (chunked)
  if (format === 'long_video') {
    if (tier === 'pro' || tier === 'business' || tier === 'enterprise') {
      return PIPELINE_CHAINS.long_form_production;
    }
    if (hasGooglePlaces) return PIPELINE_CHAINS.brand_to_video;
    return PIPELINE_CHAINS.business_to_campaign;
  }

  // Short video with Google Places → brand intelligence
  if (format === 'short_video' && hasGooglePlaces) {
    if (intent === 'promo' || intent === 'brand_story' || intent === 'announcement') {
      return PIPELINE_CHAINS.brand_to_video;
    }
  }

  // Free/starter → quick promo (accessible)
  if (tier === 'free' || tier === 'starter') {
    return PIPELINE_CHAINS.quick_promo;
  }

  // Creator with Google Places → brand-to-video
  if (hasGooglePlaces && (intent === 'promo' || intent === 'brand_story')) {
    return PIPELINE_CHAINS.brand_to_video;
  }

  // Default: business-to-campaign for pro+ tiers
  return PIPELINE_CHAINS.business_to_campaign;
}

/**
 * Build an orchestration plan from a request.
 * Filters steps by tier, adds Google Places data, sets up transcreation targets.
 */
export function buildOrchestrationPlan(request: OrchestrationRequest): OrchestrationPlan {
  const chain = selectChain(
    request.intent,
    request.format,
    request.tier,
    !!request.business,
  );

  // Filter steps by tier and options
  const tierOrder = ['free', 'starter', 'creator', 'pro', 'business', 'enterprise'];
  const userTierIndex = tierOrder.indexOf(request.tier);

  const activeSteps: PipelineStep[] = [];
  const skippedSteps: PipelineStep[] = [];

  for (const step of chain.steps) {
    // Skip Google Places if no business info
    if (step.id === 'google_places_enrich' && !request.business) {
      skippedSteps.push(step);
      continue;
    }
    // Skip transcreation if no target regions
    if (step.id === 'transcreation' && (!request.targetRegions || request.targetRegions.length === 0)) {
      skippedSteps.push(step);
      continue;
    }
    // Skip dubbing if no languages
    if (step.id === 'multi_language_dub' && (!request.languages || request.languages.length <= 1)) {
      skippedSteps.push(step);
      continue;
    }

    activeSteps.push(step);
  }

  // Calculate estimates
  const estimatedDuration = activeSteps.reduce((sum, s) => sum + s.estimatedDuration, 0);
  const estimatedCredits = activeSteps.reduce((sum, s) => sum + s.creditMultiplier, 0);

  return {
    chain,
    activeSteps,
    skippedSteps,
    transcreationTargets: request.targetRegions || [],
    estimatedDuration,
    estimatedCredits,
    products: chain.products,
  };
}

/**
 * Get all available chains for a given tier.
 */
export function getAvailableChains(tier: string): PipelineChain[] {
  const tierOrder = ['free', 'starter', 'creator', 'pro', 'business', 'enterprise'];
  const userTierIndex = tierOrder.indexOf(tier);
  return Object.values(PIPELINE_CHAINS).filter(chain => {
    const chainTierIndex = tierOrder.indexOf(chain.minTier);
    return chainTierIndex <= userTierIndex;
  });
}

/**
 * Get all atomic steps (for displaying in pipeline editor / advanced mode).
 */
export function getAllAtomicSteps(): PipelineStep[] {
  return Object.values(ATOMIC_STEPS);
}

/**
 * Get all chains that produce a given format.
 */
export function getChainsForFormat(format: ContentFormat): PipelineChain[] {
  return Object.values(PIPELINE_CHAINS).filter(chain =>
    chain.outputFormats.includes(format),
  );
}

/**
 * Get the recommended chain for an intent+format pair (for UI selection).
 * Returns the chain + all alternatives so the user can override.
 */
export function getChainRecommendation(
  intent: ContentIntent,
  format: ContentFormat,
  tier: string,
  hasGooglePlaces: boolean,
): { recommended: PipelineChain; alternatives: PipelineChain[] } {
  const recommended = selectChain(intent, format, tier, hasGooglePlaces);
  const alternatives = getChainsForFormat(format).filter(c => c.id !== recommended.id);
  return { recommended, alternatives };
}

/**
 * Get all unique output formats across all chains.
 */
export function getAllOutputFormats(): ContentFormat[] {
  const formats = new Set<ContentFormat>();
  for (const chain of Object.values(PIPELINE_CHAINS)) {
    for (const f of chain.outputFormats) {
      formats.add(f);
    }
  }
  return Array.from(formats);
}

/**
 * Get pipeline step count and estimated totals for a chain.
 */
export function getChainStats(chainId: string): {
  stepCount: number;
  estimatedDuration: number;
  estimatedCredits: number;
  products: string[];
} | null {
  const chain = PIPELINE_CHAINS[chainId];
  if (!chain) return null;
  return {
    stepCount: chain.steps.length,
    estimatedDuration: chain.estimatedDuration,
    estimatedCredits: chain.steps.reduce((sum, s) => sum + s.creditMultiplier, 0),
    products: chain.products,
  };
}

/**
 * Get the edge function name for a step (for invoking via supabase.functions.invoke).
 */
export function getEdgeFunctionForStep(stepId: string): { functionName: string; action?: string } | null {
  const step = ATOMIC_STEPS[stepId];
  if (!step) return null;
  return {
    functionName: step.edgeFunction,
    action: step.action,
  };
}
