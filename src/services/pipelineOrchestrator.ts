/**
 * Pipeline Orchestrator — The Combination Chain Engine
 *
 * This is the core moat: it chains 5-15 atomic pipelines together automatically.
 * User provides MINIMAL input (business name + location + intent), the orchestrator
 * determines which pipelines to chain, in what order, with what providers.
 *
 * Combination Chains (C1-C20):
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
 * - C14: Compliance-Aware-Content (auto quality gates)
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
  | 'interactive_demo';  // Interactive product demo page

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
  | 'investor_pitch';    // Fundraising pitch

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

// ─── Chain Selection Logic ───────────────────────────────────────────────────

/**
 * Select the best pipeline chain based on user intent and format.
 * This is the "easy" experience — user picks intent + format, we pick the chain.
 */
export function selectChain(
  intent: ContentIntent,
  format: ContentFormat,
  tier: string,
  hasGooglePlaces: boolean,
): PipelineChain {
  // Intent + format → chain mapping
  if (format === 'investor_deck') return PIPELINE_CHAINS.investor_deck;
  if (format === 'presentation') return PIPELINE_CHAINS.smart_presentation;
  if (format === 'audio_podcast') return PIPELINE_CHAINS.podcast_multichannel;
  if (format === 'video_podcast') return PIPELINE_CHAINS.podcast_multichannel;

  // Video remix & clip extraction
  if (format === 'video_remix') return PIPELINE_CHAINS.video_remix;
  if (format === 'testimonial_video') return PIPELINE_CHAINS.testimonial_compilation;
  if (format === 'teaser_clip' || format === 'best_clips' || format === 'highlight_reel') return PIPELINE_CHAINS.video_remix;
  if (format === 'platform_clips') return PIPELINE_CHAINS.video_remix;

  // Website package formats
  if (format === 'website_package' || format === 'microsite') return PIPELINE_CHAINS.website_package;
  if (format === 'landing_page' || format === 'product_page') return PIPELINE_CHAINS.landing_page_quick;
  if (format === 'hero_banner') return PIPELINE_CHAINS.hero_banner_only;
  if (format === 'whitepaper' || format === 'case_study_page') return PIPELINE_CHAINS.whitepaper_package;
  if (format === 'infographic') return PIPELINE_CHAINS.whitepaper_package;
  if (format === 'interactive_demo') return PIPELINE_CHAINS.interactive_demo_package;

  if (intent === 'comparison') return PIPELINE_CHAINS.competitor_battlecard;
  if (intent === 'investor_pitch') return PIPELINE_CHAINS.investor_deck;

  // Tier-based selection
  if (tier === 'free' || tier === 'starter') {
    return PIPELINE_CHAINS.quick_promo;
  }

  if (hasGooglePlaces && (intent === 'promo' || intent === 'brand_story')) {
    return PIPELINE_CHAINS.brand_to_video;
  }

  // Default to business-to-campaign for pro+ tiers
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
