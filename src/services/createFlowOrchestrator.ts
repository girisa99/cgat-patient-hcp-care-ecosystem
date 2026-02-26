/**
 * CREATE FLOW ORCHESTRATOR — Phase 4C-E Unified Engine
 *
 * Master orchestrator for the entire CREATE flow that wires:
 * - 4C: All 12+ script generation modes → pipeline chains
 * - 4D: Transcreation as first-class citizen (not afterthought)
 * - 4E: Format selection for all output types
 *
 * Core UX Principles:
 * 1. Universal Enrichment VISIBLE at every touchpoint — user sees what data feeds the AI
 * 2. Input Language (1) → Output Languages (max 5, default English + sub-regions)
 * 3. Inline editing at EVERY field: accept / reject / update / enhance / analyze
 * 4. Statement-level control — edit individual sentences, not just blocks
 * 5. Auto-save, checkpoint, restore — never lose progress
 * 6. AI recommends but NEVER restricts — user's CHOICE always
 *
 * @see src/services/pipelineOrchestrator.ts — atomic pipeline steps & chains
 * @see src/hooks/useUniversalEnrichment.ts — enrichment data
 * @see src/services/regionalTranscreationService.ts — cultural adaptation
 * @see src/config/regional-routing-registry.ts — LLM/TTS routing
 * @see src/services/regionalLanguageService.ts — language detection
 */

import type { ContentFormat, ContentIntent, InputType, PipelineChain, PipelineStep, OrchestrationPlan } from './pipelineOrchestrator';
import type { TranscreationContext } from './regionalTranscreationService';
import type { GooglePlacesEnrichment } from '@/hooks/useUniversalEnrichment';
import type { ContentScenario, CrossFormatConversionType, SceneStyle, CompositionElementType } from '@/components/genie-hub/composition-studio/types';

// ─── Script Generation Modes (12+ via ai-universal-processor) ────────────────

export type ScriptGenerationMode =
  | 'text_to_script'           // Raw text → structured script
  | 'url_to_script'            // Website URL → crawl → script
  | 'pdf_to_script'            // PDF document → extract → script
  | 'pptx_to_script'           // PowerPoint → extract slides → script
  | 'audio_to_script'          // Audio file → transcribe → script
  | 'video_to_script'          // Video file → extract audio → transcribe → script
  | 'image_to_script'          // Image(s) → OCR/describe → script
  | 'google_places_to_script'  // Business name + location → enrich → script
  | 'recording_to_script'      // Live mic/camera → transcribe → script
  | 'topic_to_script'          // Topic/keyword → research → script
  | 'template_to_script'       // Template selection → fill → script
  | 'competitor_to_script'     // Competitor URL/name → analyze → script
  | 'data_to_script'           // CSV/JSON data → narrative script
  | 'blog_to_script'           // Blog post → video script adaptation
  | 'email_to_script'          // Email/newsletter → video script
  | 'social_to_script';        // Social post → expanded video script

/** Maps input types to script generation modes */
export const INPUT_TO_MODE: Record<InputType, ScriptGenerationMode> = {
  text: 'text_to_script',
  url: 'url_to_script',
  pdf: 'pdf_to_script',
  docx: 'pdf_to_script',    // Same extraction pipeline
  pptx: 'pptx_to_script',
  audio: 'audio_to_script',
  video: 'video_to_script',
  image: 'image_to_script',
  google_places: 'google_places_to_script',
  recording: 'recording_to_script',
};

// ─── Script Generation Mode Configs ──────────────────────────────────────────

export interface ScriptGenModeConfig {
  mode: ScriptGenerationMode;
  label: string;
  description: string;
  icon: string;
  /** Pipeline steps required before script generation */
  preSteps: string[];
  /** Edge function + action for the main generation */
  edgeFunction: string;
  action: string;
  /** Which input types this mode accepts */
  acceptsInputTypes: InputType[];
  /** Whether Google Places enrichment is auto-triggered */
  autoEnrichGooglePlaces: boolean;
  /** Whether brand intelligence is auto-triggered */
  autoEnrichBrand: boolean;
  /** Estimated time in seconds */
  estimatedTime: number;
  /** Credit cost */
  creditCost: number;
  /** Simple mode available (3-click flow) */
  simpleMode: boolean;
}

export const SCRIPT_GEN_MODES: Record<ScriptGenerationMode, ScriptGenModeConfig> = {
  text_to_script: {
    mode: 'text_to_script',
    label: 'Text to Script',
    description: 'Paste or type your content — AI generates a structured, production-ready script',
    icon: 'Type',
    preSteps: [],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['text'],
    autoEnrichGooglePlaces: false,
    autoEnrichBrand: true,
    estimatedTime: 10,
    creditCost: 1,
    simpleMode: true,
  },
  url_to_script: {
    mode: 'url_to_script',
    label: 'URL to Script',
    description: 'Paste a website URL — AI crawls content and generates a video script',
    icon: 'Link',
    preSteps: ['url_crawl'],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['url'],
    autoEnrichGooglePlaces: true,
    autoEnrichBrand: true,
    estimatedTime: 20,
    creditCost: 1.5,
    simpleMode: true,
  },
  pdf_to_script: {
    mode: 'pdf_to_script',
    label: 'Document to Script',
    description: 'Upload PDF or DOCX — AI extracts content and converts to video script',
    icon: 'FileText',
    preSteps: ['document_extract'],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['pdf', 'docx'],
    autoEnrichGooglePlaces: false,
    autoEnrichBrand: true,
    estimatedTime: 15,
    creditCost: 1.5,
    simpleMode: true,
  },
  pptx_to_script: {
    mode: 'pptx_to_script',
    label: 'PowerPoint to Script',
    description: 'Upload PPTX — AI extracts slides, speaker notes, and generates cinematic script',
    icon: 'Presentation',
    preSteps: ['document_extract'],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['pptx'],
    autoEnrichGooglePlaces: false,
    autoEnrichBrand: true,
    estimatedTime: 20,
    creditCost: 2,
    simpleMode: false,
  },
  audio_to_script: {
    mode: 'audio_to_script',
    label: 'Audio to Script',
    description: 'Upload audio — AI transcribes with speaker diarization and structures as script',
    icon: 'Mic',
    preSteps: ['audio_transcribe'],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['audio'],
    autoEnrichGooglePlaces: false,
    autoEnrichBrand: true,
    estimatedTime: 25,
    creditCost: 2,
    simpleMode: true,
  },
  video_to_script: {
    mode: 'video_to_script',
    label: 'Video to Script',
    description: 'Upload video — AI extracts audio, transcribes, and restructures as editable script',
    icon: 'Video',
    preSteps: ['video_extract_audio', 'audio_transcribe'],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['video'],
    autoEnrichGooglePlaces: false,
    autoEnrichBrand: true,
    estimatedTime: 30,
    creditCost: 2.5,
    simpleMode: false,
  },
  image_to_script: {
    mode: 'image_to_script',
    label: 'Image to Script',
    description: 'Upload images — AI describes visuals via OCR/vision and generates narration script',
    icon: 'Image',
    preSteps: ['ocr_extract'],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['image'],
    autoEnrichGooglePlaces: false,
    autoEnrichBrand: true,
    estimatedTime: 15,
    creditCost: 1.5,
    simpleMode: true,
  },
  google_places_to_script: {
    mode: 'google_places_to_script',
    label: 'Business to Script',
    description: 'Enter business name + location — AI fetches live Google Places data and generates script',
    icon: 'MapPin',
    preSteps: ['google_places_enrich', 'brand_profile', 'economy_archetype'],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['google_places'],
    autoEnrichGooglePlaces: true,
    autoEnrichBrand: true,
    estimatedTime: 20,
    creditCost: 1,
    simpleMode: true,
  },
  recording_to_script: {
    mode: 'recording_to_script',
    label: 'Record to Script',
    description: 'Record live with mic/camera — AI transcribes in real-time and structures as script',
    icon: 'Radio',
    preSteps: ['audio_transcribe'],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['recording'],
    autoEnrichGooglePlaces: false,
    autoEnrichBrand: true,
    estimatedTime: 5,
    creditCost: 1,
    simpleMode: true,
  },
  topic_to_script: {
    mode: 'topic_to_script',
    label: 'Topic to Script',
    description: 'Enter a topic or keyword — AI researches and generates a comprehensive script',
    icon: 'Search',
    preSteps: [],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['text'],
    autoEnrichGooglePlaces: false,
    autoEnrichBrand: true,
    estimatedTime: 15,
    creditCost: 1.5,
    simpleMode: true,
  },
  template_to_script: {
    mode: 'template_to_script',
    label: 'Template to Script',
    description: 'Pick a template — AI pre-fills structure, you customize the content',
    icon: 'LayoutTemplate',
    preSteps: [],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['text'],
    autoEnrichGooglePlaces: false,
    autoEnrichBrand: true,
    estimatedTime: 8,
    creditCost: 0.5,
    simpleMode: true,
  },
  competitor_to_script: {
    mode: 'competitor_to_script',
    label: 'Competitor to Script',
    description: 'Enter competitor URL/name — AI analyzes and generates comparison battlecard script',
    icon: 'Swords',
    preSteps: ['url_crawl', 'competitive_analysis'],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['url', 'text'],
    autoEnrichGooglePlaces: true,
    autoEnrichBrand: true,
    estimatedTime: 30,
    creditCost: 2,
    simpleMode: false,
  },
  data_to_script: {
    mode: 'data_to_script',
    label: 'Data to Script',
    description: 'Upload CSV/JSON data — AI turns numbers into narrative storytelling script',
    icon: 'BarChart3',
    preSteps: ['document_extract'],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['pdf', 'text'],
    autoEnrichGooglePlaces: false,
    autoEnrichBrand: true,
    estimatedTime: 15,
    creditCost: 1.5,
    simpleMode: false,
  },
  blog_to_script: {
    mode: 'blog_to_script',
    label: 'Blog to Script',
    description: 'Paste blog URL — AI adapts long-form article into engaging video script',
    icon: 'Newspaper',
    preSteps: ['url_crawl'],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['url', 'text'],
    autoEnrichGooglePlaces: false,
    autoEnrichBrand: true,
    estimatedTime: 15,
    creditCost: 1.5,
    simpleMode: true,
  },
  email_to_script: {
    mode: 'email_to_script',
    label: 'Email to Script',
    description: 'Paste email/newsletter content — AI converts to engaging video script',
    icon: 'Mail',
    preSteps: [],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['text'],
    autoEnrichGooglePlaces: false,
    autoEnrichBrand: true,
    estimatedTime: 10,
    creditCost: 1,
    simpleMode: true,
  },
  social_to_script: {
    mode: 'social_to_script',
    label: 'Social Post to Script',
    description: 'Paste social media post — AI expands into full video script with hooks and CTAs',
    icon: 'Share2',
    preSteps: [],
    edgeFunction: 'ai-universal-processor',
    action: 'generate_content',
    acceptsInputTypes: ['text', 'url'],
    autoEnrichGooglePlaces: false,
    autoEnrichBrand: true,
    estimatedTime: 10,
    creditCost: 1,
    simpleMode: true,
  },
};

// ─── Language I/O Configuration ──────────────────────────────────────────────

/** Max 5 output languages at a time (credit-gated) */
export const MAX_OUTPUT_LANGUAGES = 5;

export interface LanguageIOConfig {
  /** Single input language — detected or user-selected */
  inputLanguage: LanguageSelection;
  /** Up to 5 output languages — default includes English */
  outputLanguages: LanguageSelection[];
  /** Whether transcreation (cultural adaptation) is enabled vs plain translation */
  transcreationEnabled: boolean;
  /** Adaptation depth per output language */
  adaptationLevels: Record<string, 'light' | 'moderate' | 'deep'>;
}

export interface LanguageSelection {
  code: string;            // BCP47: 'en', 'ta', 'ar-EG'
  name: string;            // 'English', 'Tamil', 'Arabic (Egyptian)'
  nativeName: string;      // 'English', 'தமிழ்', 'العربية المصرية'
  direction: 'ltr' | 'rtl';
  regionCode: string;      // 'NAM_US', 'INDIA_SOUTH_TA', 'MENA_EGYPT'
  zone: string;            // 'western', 'india', 'mena'
  isDefault: boolean;      // True for English
  /** Provider routing for this language */
  llmProvider: string;     // 'claude', 'gemini', 'alibaba'
  ttsProvider: string;     // 'azure', 'elevenlabs', 'qwen3'
  ttsVoiceId: string;      // Voice ID for this language
  /** Quality score (1-100) for this language */
  qualityScore: number;
}

/** Default English output language */
export const DEFAULT_OUTPUT_LANGUAGE: LanguageSelection = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  direction: 'ltr',
  regionCode: 'NAM_US',
  zone: 'western',
  isDefault: true,
  llmProvider: 'claude',
  ttsProvider: 'azure',
  ttsVoiceId: 'en-US-JennyNeural',
  qualityScore: 98,
};

// ─── Enrichment Visibility Layer ─────────────────────────────────────────────

/** What enrichment data is feeding the current prompt — VISIBLE to user */
export interface EnrichmentVisibility {
  /** Google Places data flowing into prompt */
  googlePlaces: {
    active: boolean;
    businessName?: string;
    rating?: number;
    totalReviews?: number;
    topReviewSnippets: string[];
    competitorNames: string[];
    /** User can toggle individual data points on/off */
    enabledFields: Record<string, boolean>;
  };
  /** Brand intelligence flowing into prompt */
  brandIntelligence: {
    active: boolean;
    valueProp?: string;
    positioning?: string;
    differentiators: string[];
    painPoints: string[];
    enabledFields: Record<string, boolean>;
  };
  /** Economy archetype */
  economyProfile: {
    active: boolean;
    tier?: string;
    archetype?: string;
    enabledFields: Record<string, boolean>;
  };
  /** Competitive intelligence */
  competitiveIntel: {
    active: boolean;
    competitors: Array<{ name: string; snippet: string }>;
    enabledFields: Record<string, boolean>;
  };
  /** Regional/cultural context */
  regionalContext: {
    active: boolean;
    region?: string;
    culturalTraits?: {
      wardrobe?: string;
      companion?: string;
      setting?: string;
      musicHint?: string;
      colorPalette?: string;
    };
    enabledFields: Record<string, boolean>;
  };
  /** Product knowledge from content pool */
  productKnowledge: {
    active: boolean;
    productName?: string;
    tagline?: string;
    features: string[];
    useCases: string[];
    enabledFields: Record<string, boolean>;
  };
  /** The assembled prompt preview — user sees EXACTLY what AI receives */
  assembledPromptPreview: string;
  /** Total enrichment score (0-100) — how much context the AI has */
  enrichmentScore: number;
}

// ─── Inline Editing at Every Touchpoint ──────────────────────────────────────

export type InlineEditAction =
  | 'accept'       // Accept AI suggestion as-is
  | 'reject'       // Reject and keep original
  | 'update'       // Manual edit by user
  | 'enhance'      // Ask AI to improve this specific field
  | 'analyze'      // Ask AI to explain/analyze this content
  | 'regenerate'   // Regenerate this specific field only
  | 'transcreate'  // Transcreate (culturally adapt) this field for target regions
  | 'simplify'     // Simplify language/reading level
  | 'expand'       // Expand with more detail
  | 'shorten';     // Condense/shorten

export interface InlineEditableField {
  /** Unique field identifier within the step */
  fieldId: string;
  /** Display label */
  label: string;
  /** Current value */
  value: string;
  /** Original value before any edits */
  originalValue: string;
  /** AI-suggested value (if different from current) */
  aiSuggestion?: string;
  /** Whether this field is currently being edited */
  isEditing: boolean;
  /** Whether AI suggestion is pending */
  aiSuggestionPending: boolean;
  /** History of edits for undo/redo */
  editHistory: Array<{
    value: string;
    action: InlineEditAction;
    timestamp: string;
    source: 'user' | 'ai';
  }>;
  /** Current position in edit history (for undo/redo) */
  historyIndex: number;
  /** Available actions for this field */
  availableActions: InlineEditAction[];
  /** Field type for rendering */
  fieldType: 'text' | 'textarea' | 'richtext' | 'code' | 'number' | 'select';
  /** Whether this field has been modified from original */
  isDirty: boolean;
  /** Validation status */
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  /** Language of the content in this field */
  language: string;
  /** Text direction */
  direction: 'ltr' | 'rtl';
}

export interface StatementLevelEdit {
  /** Statement/sentence index within a field */
  statementIndex: number;
  /** The original statement text */
  originalText: string;
  /** Current text (after edits) */
  currentText: string;
  /** AI alternative suggestions */
  alternatives: string[];
  /** Edit actions taken on this statement */
  actions: Array<{
    action: InlineEditAction;
    result: string;
    timestamp: string;
  }>;
  /** Whether this statement has a data source / citation */
  hasSource: boolean;
  /** Source reference if any */
  sourceRef?: string;
  /** Verification status */
  verificationStatus: 'verified' | 'unverified' | 'flagged' | 'ai_generated';
}

// ─── Format Selection (Phase 4E) ────────────────────────────────────────────

export interface OutputFormatConfig {
  format: ContentFormat;
  label: string;
  description: string;
  icon: string;
  category: 'video' | 'audio' | 'presentation' | 'text' | 'social' | 'live';
  /** Aspect ratios available for this format */
  aspectRatios: string[];
  /** Duration range in seconds */
  durationRange: { min: number; max: number };
  /** Pipeline chain ID that produces this format */
  primaryChainId: string;
  /** Whether this format supports transcreation */
  supportsTranscreation: boolean;
  /** Whether this format supports multi-language output */
  supportsMultiLanguage: boolean;
  /** Minimum tier required */
  minTier: string;
  /** Credit cost multiplier */
  creditMultiplier: number;
  /** Whether multiple formats can be selected simultaneously */
  canCombine: boolean;
  /** Compatible cross-format conversions */
  crossFormatConversions: CrossFormatConversionType[];
}

export const OUTPUT_FORMAT_CONFIGS: Partial<Record<ContentFormat, OutputFormatConfig>> = {
  short_video: {
    format: 'short_video',
    label: 'Short Video',
    description: '15-60s social clips for TikTok, Reels, Shorts',
    icon: 'Zap',
    category: 'video',
    aspectRatios: ['9:16', '1:1', '16:9'],
    durationRange: { min: 15, max: 60 },
    primaryChainId: 'quick_promo',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'free',
    creditMultiplier: 1,
    canCombine: true,
    crossFormatConversions: ['video_to_podcast', 'video_to_blog', 'video_to_audiogram'],
  },
  long_video: {
    format: 'long_video',
    label: 'Long Video',
    description: '2-10min explainers, tutorials, documentaries',
    icon: 'Film',
    category: 'video',
    aspectRatios: ['16:9', '9:16', '1:1'],
    durationRange: { min: 120, max: 600 },
    primaryChainId: 'business_to_campaign',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'starter',
    creditMultiplier: 2,
    canCombine: true,
    crossFormatConversions: ['video_to_podcast', 'video_to_blog', 'video_to_shorts', 'video_to_audiogram'],
  },
  audio_podcast: {
    format: 'audio_podcast',
    label: 'Audio Podcast',
    description: 'Audio-only podcast episodes with show notes',
    icon: 'Headphones',
    category: 'audio',
    aspectRatios: [],
    durationRange: { min: 60, max: 3600 },
    primaryChainId: 'podcast_multichannel',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'starter',
    creditMultiplier: 1.5,
    canCombine: true,
    crossFormatConversions: ['podcast_to_video', 'podcast_to_blog', 'podcast_to_audiogram', 'podcast_to_newsletter'],
  },
  video_podcast: {
    format: 'video_podcast',
    label: 'Video Podcast',
    description: 'Video podcast with talking heads, PiP, and slides',
    icon: 'MonitorPlay',
    category: 'video',
    aspectRatios: ['16:9', '1:1'],
    durationRange: { min: 120, max: 3600 },
    primaryChainId: 'podcast_multichannel',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'creator',
    creditMultiplier: 2.5,
    canCombine: true,
    crossFormatConversions: ['video_to_podcast', 'video_to_shorts', 'video_to_blog'],
  },
  webcast: {
    format: 'webcast',
    label: 'Webcast / Webinar',
    description: 'Live webinar with screen share, slides, and Q&A',
    icon: 'Radio',
    category: 'live',
    aspectRatios: ['16:9'],
    durationRange: { min: 300, max: 7200 },
    primaryChainId: 'investor_deck',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'pro',
    creditMultiplier: 3,
    canCombine: false,
    crossFormatConversions: ['webinar_to_highlights', 'video_to_blog', 'video_to_podcast'],
  },
  live_stream: {
    format: 'live_stream',
    label: 'Live Stream',
    description: 'Real-time streaming with AI-powered overlays and captions',
    icon: 'Wifi',
    category: 'live',
    aspectRatios: ['16:9', '9:16'],
    durationRange: { min: 60, max: 14400 },
    primaryChainId: 'business_to_campaign',
    supportsTranscreation: false,
    supportsMultiLanguage: true,
    minTier: 'pro',
    creditMultiplier: 3,
    canCombine: false,
    crossFormatConversions: ['video_to_shorts', 'video_to_podcast'],
  },
  presentation: {
    format: 'presentation',
    label: 'Presentation / Slides',
    description: 'PPT/Google Slides deck with speaker notes and narration',
    icon: 'Presentation',
    category: 'presentation',
    aspectRatios: ['16:9', '4:3'],
    durationRange: { min: 60, max: 3600 },
    primaryChainId: 'smart_presentation',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'free',
    creditMultiplier: 1,
    canCombine: true,
    crossFormatConversions: ['slides_to_cinematic', 'slides_to_3d', 'slides_to_video', 'presentation_to_infographic'],
  },
  script_only: {
    format: 'script_only',
    label: 'Script Only',
    description: 'Written script / copy — no production, pure text output',
    icon: 'FileText',
    category: 'text',
    aspectRatios: [],
    durationRange: { min: 0, max: 0 },
    primaryChainId: 'script_edit_regenerate',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'free',
    creditMultiplier: 0.5,
    canCombine: true,
    crossFormatConversions: ['script_to_video', 'script_to_podcast', 'script_to_slides'],
  },
  audiogram: {
    format: 'audiogram',
    label: 'Audiogram',
    description: 'Animated waveform video for social sharing of audio content',
    icon: 'AudioWaveform',
    category: 'social',
    aspectRatios: ['1:1', '9:16', '16:9'],
    durationRange: { min: 15, max: 120 },
    primaryChainId: 'record_to_everywhere',
    supportsTranscreation: false,
    supportsMultiLanguage: true,
    minTier: 'starter',
    creditMultiplier: 1,
    canCombine: true,
    crossFormatConversions: [],
  },
  social_carousel: {
    format: 'social_carousel',
    label: 'Social Carousel',
    description: 'Multi-image swipeable social post (Instagram, LinkedIn)',
    icon: 'Images',
    category: 'social',
    aspectRatios: ['1:1', '4:5'],
    durationRange: { min: 0, max: 0 },
    primaryChainId: 'quick_promo',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'free',
    creditMultiplier: 0.5,
    canCombine: true,
    crossFormatConversions: ['carousel_to_video', 'infographic_to_video'],
  },
  newsletter: {
    format: 'newsletter',
    label: 'Newsletter / Email',
    description: 'Email newsletter content with embedded video and CTA',
    icon: 'Mail',
    category: 'text',
    aspectRatios: [],
    durationRange: { min: 0, max: 0 },
    primaryChainId: 'record_to_everywhere',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'starter',
    creditMultiplier: 0.5,
    canCombine: true,
    crossFormatConversions: ['blog_to_video', 'newsletter_to_social'],
  },
  blog_post: {
    format: 'blog_post',
    label: 'Blog Post',
    description: 'Long-form written content with SEO optimization',
    icon: 'Newspaper',
    category: 'text',
    aspectRatios: [],
    durationRange: { min: 0, max: 0 },
    primaryChainId: 'record_to_everywhere',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'free',
    creditMultiplier: 0.5,
    canCombine: true,
    crossFormatConversions: ['blog_to_video', 'blog_to_podcast', 'blog_to_carousel'],
  },
  investor_deck: {
    format: 'investor_deck',
    label: 'Investor Deck',
    description: 'Investor presentation with live data, financials, and demo',
    icon: 'TrendingUp',
    category: 'presentation',
    aspectRatios: ['16:9'],
    durationRange: { min: 300, max: 1800 },
    primaryChainId: 'investor_deck',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'pro',
    creditMultiplier: 2,
    canCombine: false,
    crossFormatConversions: ['slides_to_cinematic', 'slides_to_video'],
  },
};

// ─── CREATE Flow Session State ───────────────────────────────────────────────

export type CreateFlowStep =
  | 'input'          // Step 1: Choose input mode + provide content
  | 'enrichment'     // Step 2: Review enrichment data (Google Places, brand, etc.)
  | 'script'         // Step 3: Review + inline-edit generated script
  | 'language'       // Step 4: Select output languages + transcreation settings
  | 'format'         // Step 5: Select output format(s)
  | 'style'          // Step 6: Visual style + scenario selection
  | 'review'         // Step 7: Final review before production
  | 'producing';     // Step 8: Production pipeline running

export interface CreateFlowSession {
  /** Unique session ID */
  sessionId: string;
  /** When this session was created */
  createdAt: string;
  /** Last auto-save timestamp */
  lastSavedAt: string;
  /** Current step in the flow */
  currentStep: CreateFlowStep;
  /** Completed steps (can go back to any) */
  completedSteps: CreateFlowStep[];
  /** Whether simple or advanced mode */
  mode: 'simple' | 'advanced';

  // ─── Step 1: Input ──────────────────────────────────────────────────────
  input: {
    mode: ScriptGenerationMode;
    content: string;
    file?: { name: string; type: string; size: number; url?: string };
    businessName?: string;
    businessLocation?: string;
    topicKeywords?: string[];
    templateId?: string;
    competitorUrl?: string;
  };

  // ─── Step 2: Enrichment (visible to user) ───────────────────────────────
  enrichment: EnrichmentVisibility;

  // ─── Step 3: Generated Script (inline-editable) ─────────────────────────
  script: {
    /** Full generated script */
    lines: Array<{
      key: string;
      text: string;
      voice: string;
      scene: string;
      durationEst: number;
      direction: string;
      /** Statement-level edits within this line */
      statements: StatementLevelEdit[];
      /** Inline edit state for this line */
      editState: InlineEditableField;
    }>;
    /** Script-level metadata */
    title: InlineEditableField;
    synopsis: InlineEditableField;
    targetDuration: number;
    totalScenes: number;
    /** AI suggestions for the whole script */
    aiSuggestions: Array<{
      type: 'structure' | 'tone' | 'pacing' | 'hook' | 'cta' | 'data' | 'engagement';
      message: string;
      appliedTo: string;  // field ID or 'global'
      autoApplied: boolean;
    }>;
  };

  // ─── Step 4: Language Configuration ─────────────────────────────────────
  languageIO: LanguageIOConfig;

  // ─── Step 5: Format Selection ───────────────────────────────────────────
  selectedFormats: ContentFormat[];
  formatConfigs: Record<ContentFormat, {
    aspectRatio: string;
    duration?: number;
    quality: '720p' | '1080p' | '4k';
    crossFormatConversions: CrossFormatConversionType[];
  }>;

  // ─── Step 6: Style & Scenario ───────────────────────────────────────────
  style: {
    scenario: ContentScenario;
    sceneStyle: SceneStyle;
    visualElements: CompositionElementType[];
    /** Per-scene style overrides (scene-level creative freedom) */
    perSceneOverrides: Record<string, {
      style?: SceneStyle;
      elements?: CompositionElementType[];
      framework?: string;
    }>;
  };

  // ─── Step 7: Review Summary ─────────────────────────────────────────────
  review: {
    estimatedCredits: number;
    estimatedDuration: number;
    pipelineChain: string;
    activeSteps: string[];
    warnings: string[];
    readyToProduce: boolean;
  };

  // ─── Cross-cutting ─────────────────────────────────────────────────────
  /** Intent for chain selection */
  intent: ContentIntent;
  /** User's tier */
  tier: 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';
  /** Global undo/redo stack */
  undoStack: Array<{ step: CreateFlowStep; fieldId: string; oldValue: string; newValue: string; timestamp: string }>;
  redoStack: Array<{ step: CreateFlowStep; fieldId: string; oldValue: string; newValue: string; timestamp: string }>;
  /** Auto-save dirty flag */
  isDirty: boolean;
  /** Production checkpoint (for resume on failure) */
  checkpoint?: {
    stepIndex: number;
    completedStepIds: string[];
    partialResults: Record<string, unknown>;
    failedAt?: string;
    retryCount: number;
  };
}

// ─── Enrichment Assembly Functions ───────────────────────────────────────────

/** Build enrichment visibility from available data */
export function buildEnrichmentVisibility(
  googlePlaces?: GooglePlacesEnrichment,
  brandProfile?: {
    valueProp?: string;
    positioning?: string;
    differentiators: string[];
    painPoints: string[];
  },
  economyProfile?: { tier: string; archetype: string },
  competitors?: Array<{ name: string; snippet: string }>,
  regionalTraits?: {
    region: string;
    wardrobe?: string;
    companion?: string;
    setting?: string;
    musicHint?: string;
    colorPalette?: string;
  },
  productKnowledge?: {
    productName: string;
    tagline: string;
    features: string[];
    useCases: string[];
  },
): EnrichmentVisibility {
  const allFieldsEnabled = (fields: string[]): Record<string, boolean> =>
    fields.reduce((acc, f) => ({ ...acc, [f]: true }), {});

  const visibility: EnrichmentVisibility = {
    googlePlaces: {
      active: !!googlePlaces,
      businessName: googlePlaces?.businessName,
      rating: googlePlaces?.rating ?? undefined,
      totalReviews: googlePlaces?.totalReviews,
      topReviewSnippets: googlePlaces?.topReviews?.map(r => r.text.slice(0, 100)) || [],
      competitorNames: googlePlaces?.competitorInsights?.map(c => c.name) || [],
      enabledFields: allFieldsEnabled([
        'businessName', 'rating', 'reviews', 'hours', 'competitors', 'editorial', 'website',
      ]),
    },
    brandIntelligence: {
      active: !!brandProfile,
      valueProp: brandProfile?.valueProp,
      positioning: brandProfile?.positioning,
      differentiators: brandProfile?.differentiators || [],
      painPoints: brandProfile?.painPoints || [],
      enabledFields: allFieldsEnabled([
        'valueProp', 'positioning', 'differentiators', 'painPoints', 'keyBenefits',
      ]),
    },
    economyProfile: {
      active: !!economyProfile,
      tier: economyProfile?.tier,
      archetype: economyProfile?.archetype,
      enabledFields: allFieldsEnabled(['tier', 'archetype']),
    },
    competitiveIntel: {
      active: !!competitors && competitors.length > 0,
      competitors: competitors || [],
      enabledFields: allFieldsEnabled(['competitors', 'positioning', 'gaps']),
    },
    regionalContext: {
      active: !!regionalTraits,
      region: regionalTraits?.region,
      culturalTraits: regionalTraits ? {
        wardrobe: regionalTraits.wardrobe,
        companion: regionalTraits.companion,
        setting: regionalTraits.setting,
        musicHint: regionalTraits.musicHint,
        colorPalette: regionalTraits.colorPalette,
      } : undefined,
      enabledFields: allFieldsEnabled([
        'wardrobe', 'companion', 'setting', 'music', 'colorPalette', 'greeting',
      ]),
    },
    productKnowledge: {
      active: !!productKnowledge,
      productName: productKnowledge?.productName,
      tagline: productKnowledge?.tagline,
      features: productKnowledge?.features || [],
      useCases: productKnowledge?.useCases || [],
      enabledFields: allFieldsEnabled([
        'productName', 'tagline', 'features', 'useCases', 'differentiators',
      ]),
    },
    assembledPromptPreview: '',
    enrichmentScore: 0,
  };

  // Calculate enrichment score (0-100)
  let score = 0;
  if (visibility.googlePlaces.active) score += 25;
  if (visibility.brandIntelligence.active) score += 20;
  if (visibility.economyProfile.active) score += 10;
  if (visibility.competitiveIntel.active) score += 15;
  if (visibility.regionalContext.active) score += 15;
  if (visibility.productKnowledge.active) score += 15;
  visibility.enrichmentScore = score;

  // Assemble prompt preview (what AI will see)
  visibility.assembledPromptPreview = assemblePromptPreview(visibility);

  return visibility;
}

/** Assemble the prompt preview string from enrichment visibility */
function assemblePromptPreview(visibility: EnrichmentVisibility): string {
  const sections: string[] = [];

  if (visibility.productKnowledge.active) {
    const pk = visibility.productKnowledge;
    if (pk.enabledFields['productName']) sections.push(`Product: ${pk.productName}`);
    if (pk.enabledFields['tagline']) sections.push(`Tagline: ${pk.tagline}`);
    if (pk.enabledFields['features'] && pk.features.length > 0) {
      sections.push(`Key Features: ${pk.features.join(', ')}`);
    }
    if (pk.enabledFields['useCases'] && pk.useCases.length > 0) {
      sections.push(`Use Cases: ${pk.useCases.join(', ')}`);
    }
  }

  if (visibility.brandIntelligence.active) {
    const bi = visibility.brandIntelligence;
    if (bi.enabledFields['valueProp']) sections.push(`\nValue Proposition: ${bi.valueProp}`);
    if (bi.enabledFields['positioning']) sections.push(`Positioning: ${bi.positioning}`);
    if (bi.enabledFields['differentiators'] && bi.differentiators.length > 0) {
      sections.push(`Differentiators: ${bi.differentiators.join(', ')}`);
    }
    if (bi.enabledFields['painPoints'] && bi.painPoints.length > 0) {
      sections.push(`Pain Points Solved: ${bi.painPoints.join(', ')}`);
    }
  }

  if (visibility.economyProfile.active) {
    const ep = visibility.economyProfile;
    if (ep.enabledFields['tier']) sections.push(`\nBusiness Tier: ${ep.tier}`);
    if (ep.enabledFields['archetype']) sections.push(`Archetype: ${ep.archetype}`);
  }

  if (visibility.googlePlaces.active) {
    const gp = visibility.googlePlaces;
    sections.push(`\n=== REAL BUSINESS DATA (Google Places) ===`);
    if (gp.enabledFields['businessName']) sections.push(`Business: ${gp.businessName}`);
    if (gp.enabledFields['rating'] && gp.rating) sections.push(`Rating: ${gp.rating}★ (${gp.totalReviews} reviews)`);
    if (gp.enabledFields['reviews'] && gp.topReviewSnippets.length > 0) {
      sections.push(`Customer Quotes:\n${gp.topReviewSnippets.map(r => `  - "${r}"`).join('\n')}`);
    }
    if (gp.enabledFields['competitors'] && gp.competitorNames.length > 0) {
      sections.push(`Nearby Competitors: ${gp.competitorNames.join(', ')}`);
    }
    sections.push(`=== END REAL BUSINESS DATA ===`);
  }

  if (visibility.competitiveIntel.active) {
    const ci = visibility.competitiveIntel;
    if (ci.enabledFields['competitors'] && ci.competitors.length > 0) {
      sections.push(`\nCompetitive Intelligence:`);
      ci.competitors.forEach(c => sections.push(`  - ${c.name}: ${c.snippet}`));
    }
  }

  if (visibility.regionalContext.active) {
    const rc = visibility.regionalContext;
    sections.push(`\nRegion: ${rc.region}`);
    if (rc.culturalTraits) {
      if (rc.enabledFields['wardrobe'] && rc.culturalTraits.wardrobe) {
        sections.push(`Wardrobe: ${rc.culturalTraits.wardrobe}`);
      }
      if (rc.enabledFields['companion'] && rc.culturalTraits.companion) {
        sections.push(`Companion: ${rc.culturalTraits.companion}`);
      }
      if (rc.enabledFields['setting'] && rc.culturalTraits.setting) {
        sections.push(`Setting: ${rc.culturalTraits.setting}`);
      }
      if (rc.enabledFields['music'] && rc.culturalTraits.musicHint) {
        sections.push(`Music: ${rc.culturalTraits.musicHint}`);
      }
    }
  }

  return sections.join('\n');
}

// ─── Inline Edit Factory Functions ───────────────────────────────────────────

/** Create a new inline-editable field */
export function createEditableField(
  fieldId: string,
  label: string,
  value: string,
  fieldType: InlineEditableField['fieldType'] = 'text',
  language: string = 'en',
): InlineEditableField {
  return {
    fieldId,
    label,
    value,
    originalValue: value,
    isEditing: false,
    aiSuggestionPending: false,
    editHistory: [{ value, action: 'accept', timestamp: new Date().toISOString(), source: 'ai' }],
    historyIndex: 0,
    availableActions: ['accept', 'reject', 'update', 'enhance', 'analyze', 'regenerate', 'transcreate', 'simplify', 'expand', 'shorten'],
    fieldType,
    isDirty: false,
    language,
    direction: isRTL(language) ? 'rtl' : 'ltr',
  };
}

/** Apply an inline edit action to a field */
export function applyInlineEdit(
  field: InlineEditableField,
  action: InlineEditAction,
  newValue: string,
  source: 'user' | 'ai' = 'user',
): InlineEditableField {
  const entry = {
    value: newValue,
    action,
    timestamp: new Date().toISOString(),
    source,
  };

  // Trim redo history if we're not at the end
  const history = field.editHistory.slice(0, field.historyIndex + 1);
  history.push(entry);

  return {
    ...field,
    value: newValue,
    editHistory: history,
    historyIndex: history.length - 1,
    isDirty: newValue !== field.originalValue,
    isEditing: false,
  };
}

/** Undo the last edit on a field */
export function undoFieldEdit(field: InlineEditableField): InlineEditableField {
  if (field.historyIndex <= 0) return field;
  const newIndex = field.historyIndex - 1;
  return {
    ...field,
    value: field.editHistory[newIndex].value,
    historyIndex: newIndex,
    isDirty: field.editHistory[newIndex].value !== field.originalValue,
  };
}

/** Redo the last undone edit on a field */
export function redoFieldEdit(field: InlineEditableField): InlineEditableField {
  if (field.historyIndex >= field.editHistory.length - 1) return field;
  const newIndex = field.historyIndex + 1;
  return {
    ...field,
    value: field.editHistory[newIndex].value,
    historyIndex: newIndex,
    isDirty: field.editHistory[newIndex].value !== field.originalValue,
  };
}

/** Split text into statement-level edits */
export function splitIntoStatements(text: string, language: string = 'en'): StatementLevelEdit[] {
  // Split by sentence boundaries (period, question mark, exclamation, newline)
  const sentences = text.split(/(?<=[.!?।।\n])\s+/).filter(s => s.trim().length > 0);

  return sentences.map((sentence, index) => ({
    statementIndex: index,
    originalText: sentence.trim(),
    currentText: sentence.trim(),
    alternatives: [],
    actions: [],
    hasSource: /\d+%|\$[\d,]+|according to|study|research|report/i.test(sentence),
    verificationStatus: 'ai_generated' as const,
  }));
}

// ─── Session Factory & Management ────────────────────────────────────────────

/** Create a new CREATE flow session */
export function createNewSession(
  mode: 'simple' | 'advanced' = 'simple',
  tier: string = 'free',
): CreateFlowSession {
  const sessionId = `cf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  return {
    sessionId,
    createdAt: now,
    lastSavedAt: now,
    currentStep: 'input',
    completedSteps: [],
    mode: mode as 'simple' | 'advanced',
    input: {
      mode: 'text_to_script',
      content: '',
    },
    enrichment: buildEnrichmentVisibility(),
    script: {
      lines: [],
      title: createEditableField('title', 'Title', ''),
      synopsis: createEditableField('synopsis', 'Synopsis', '', 'textarea'),
      targetDuration: 60,
      totalScenes: 0,
      aiSuggestions: [],
    },
    languageIO: {
      inputLanguage: DEFAULT_OUTPUT_LANGUAGE,
      outputLanguages: [DEFAULT_OUTPUT_LANGUAGE],
      transcreationEnabled: false,
      adaptationLevels: { en: 'light' },
    },
    selectedFormats: [],
    formatConfigs: {} as Record<ContentFormat, { aspectRatio: string; duration?: number; quality: '720p' | '1080p' | '4k'; crossFormatConversions: CrossFormatConversionType[] }>,
    style: {
      scenario: 'social_promo',
      sceneStyle: 'cinematic',
      visualElements: ['video'],
      perSceneOverrides: {},
    },
    review: {
      estimatedCredits: 0,
      estimatedDuration: 0,
      pipelineChain: '',
      activeSteps: [],
      warnings: [],
      readyToProduce: false,
    },
    intent: 'promo',
    tier: tier as CreateFlowSession['tier'],
    undoStack: [],
    redoStack: [],
    isDirty: false,
  };
}

/** Navigate to a step (can go back to any completed step) */
export function navigateToStep(
  session: CreateFlowSession,
  step: CreateFlowStep,
): CreateFlowSession {
  // Can always go back to completed steps or forward to next uncompleted
  const stepOrder: CreateFlowStep[] = ['input', 'enrichment', 'script', 'language', 'format', 'style', 'review', 'producing'];
  const currentIndex = stepOrder.indexOf(session.currentStep);
  const targetIndex = stepOrder.indexOf(step);

  // Mark current step as completed if moving forward
  const completedSteps = [...session.completedSteps];
  if (targetIndex > currentIndex && !completedSteps.includes(session.currentStep)) {
    completedSteps.push(session.currentStep);
  }

  return {
    ...session,
    currentStep: step,
    completedSteps,
    lastSavedAt: new Date().toISOString(),
    isDirty: true,
  };
}

/** Toggle an enrichment field on/off (user controls what AI sees) */
export function toggleEnrichmentField(
  session: CreateFlowSession,
  section: keyof Omit<EnrichmentVisibility, 'assembledPromptPreview' | 'enrichmentScore'>,
  field: string,
): CreateFlowSession {
  const enrichment = { ...session.enrichment };
  const sectionData = { ...enrichment[section] } as { enabledFields: Record<string, boolean>; [key: string]: unknown };
  sectionData.enabledFields = { ...sectionData.enabledFields, [field]: !sectionData.enabledFields[field] };
  (enrichment as Record<string, unknown>)[section] = sectionData;

  // Recalculate prompt preview
  enrichment.assembledPromptPreview = assemblePromptPreview(enrichment);

  return { ...session, enrichment, isDirty: true };
}

/** Add an output language (max 5) */
export function addOutputLanguage(
  session: CreateFlowSession,
  language: LanguageSelection,
): CreateFlowSession {
  if (session.languageIO.outputLanguages.length >= MAX_OUTPUT_LANGUAGES) return session;
  if (session.languageIO.outputLanguages.some(l => l.code === language.code)) return session;

  return {
    ...session,
    languageIO: {
      ...session.languageIO,
      outputLanguages: [...session.languageIO.outputLanguages, language],
      adaptationLevels: {
        ...session.languageIO.adaptationLevels,
        [language.code]: 'moderate',
      },
    },
    isDirty: true,
  };
}

/** Remove an output language (cannot remove default English) */
export function removeOutputLanguage(
  session: CreateFlowSession,
  languageCode: string,
): CreateFlowSession {
  if (languageCode === 'en') return session; // Cannot remove default English

  const adaptationLevels = { ...session.languageIO.adaptationLevels };
  delete adaptationLevels[languageCode];

  return {
    ...session,
    languageIO: {
      ...session.languageIO,
      outputLanguages: session.languageIO.outputLanguages.filter(l => l.code !== languageCode),
      adaptationLevels,
    },
    isDirty: true,
  };
}

/** Set transcreation depth for a language */
export function setAdaptationLevel(
  session: CreateFlowSession,
  languageCode: string,
  level: 'light' | 'moderate' | 'deep',
): CreateFlowSession {
  return {
    ...session,
    languageIO: {
      ...session.languageIO,
      adaptationLevels: {
        ...session.languageIO.adaptationLevels,
        [languageCode]: level,
      },
    },
    isDirty: true,
  };
}

/** Add/toggle an output format */
export function toggleOutputFormat(
  session: CreateFlowSession,
  format: ContentFormat,
): CreateFlowSession {
  const config = OUTPUT_FORMAT_CONFIGS[format];
  const selectedFormats = session.selectedFormats.includes(format)
    ? session.selectedFormats.filter(f => f !== format)
    : [...session.selectedFormats, format];

  const formatConfigs = { ...session.formatConfigs };
  if (!session.selectedFormats.includes(format)) {
    // Adding: set defaults
    formatConfigs[format] = {
      aspectRatio: config.aspectRatios[0] || '16:9',
      quality: '1080p',
      crossFormatConversions: [],
    };
  } else {
    // Removing
    delete formatConfigs[format];
  }

  return { ...session, selectedFormats, formatConfigs, isDirty: true };
}

/** Build the final orchestration plan from the session */
export function buildPlanFromSession(session: CreateFlowSession): {
  plan: OrchestrationPlan | null;
  warnings: string[];
  estimatedCredits: number;
  estimatedDuration: number;
} {
  const warnings: string[] = [];

  if (session.selectedFormats.length === 0) {
    warnings.push('No output format selected');
  }
  if (session.script.lines.length === 0) {
    warnings.push('No script generated yet');
  }
  if (!session.input.content && !session.input.businessName) {
    warnings.push('No input content provided');
  }

  // Calculate credits: base + languages + formats + enrichment
  let credits = 0;
  const modeConfig = SCRIPT_GEN_MODES[session.input.mode];
  credits += modeConfig.creditCost;

  // Language multiplier (each additional language adds cost)
  const extraLangs = session.languageIO.outputLanguages.length - 1; // -1 for default English
  credits += extraLangs * (session.languageIO.transcreationEnabled ? 1.5 : 0.5);

  // Format multiplier
  session.selectedFormats.forEach(f => {
    credits += OUTPUT_FORMAT_CONFIGS[f].creditMultiplier;
  });

  // Duration estimate
  let duration = modeConfig.estimatedTime;
  session.selectedFormats.forEach(f => {
    duration += OUTPUT_FORMAT_CONFIGS[f].durationRange.min / 2;
  });
  if (session.languageIO.transcreationEnabled) {
    duration += extraLangs * 15;
  }

  return {
    plan: null, // Will be built by pipeline orchestrator
    warnings,
    estimatedCredits: Math.round(credits * 10) / 10,
    estimatedDuration: Math.round(duration),
  };
}

// ─── Session Persistence (localStorage) ──────────────────────────────────────

const SESSION_STORAGE_KEY = 'genie-create-flow-sessions';
const CURRENT_SESSION_KEY = 'genie-create-flow-current';

/** Save session to localStorage (auto-save) */
export function saveSession(session: CreateFlowSession): void {
  try {
    const sessions = loadAllSessions();
    sessions[session.sessionId] = { ...session, lastSavedAt: new Date().toISOString(), isDirty: false };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
    localStorage.setItem(CURRENT_SESSION_KEY, session.sessionId);
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/** Load all saved sessions */
export function loadAllSessions(): Record<string, CreateFlowSession> {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Load the most recent session (for "continue where you left off") */
export function loadCurrentSession(): CreateFlowSession | null {
  try {
    const currentId = localStorage.getItem(CURRENT_SESSION_KEY);
    if (!currentId) return null;
    const sessions = loadAllSessions();
    return sessions[currentId] || null;
  } catch {
    return null;
  }
}

/** Delete a saved session */
export function deleteSession(sessionId: string): void {
  try {
    const sessions = loadAllSessions();
    delete sessions[sessionId];
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
    const currentId = localStorage.getItem(CURRENT_SESSION_KEY);
    if (currentId === sessionId) {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  } catch {
    // silently fail
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isRTL(languageCode: string): boolean {
  const rtlLangs = ['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ku', 'yi'];
  return rtlLangs.includes(languageCode.split('-')[0]);
}

/** Get all script generation modes available for a given tier */
export function getAvailableModes(tier: string): ScriptGenModeConfig[] {
  // All modes available to all tiers — some have higher credit costs
  return Object.values(SCRIPT_GEN_MODES);
}

/** Get simple-mode-only script generation modes (3-click flow) */
export function getSimpleModes(): ScriptGenModeConfig[] {
  return Object.values(SCRIPT_GEN_MODES).filter(m => m.simpleMode);
}

/** Get format configs grouped by category */
export function getFormatsByCategory(): Record<string, OutputFormatConfig[]> {
  const grouped: Record<string, OutputFormatConfig[]> = {};
  Object.values(OUTPUT_FORMAT_CONFIGS).forEach(config => {
    if (!grouped[config.category]) grouped[config.category] = [];
    grouped[config.category].push(config);
  });
  return grouped;
}

/** Get cross-format conversions available for selected formats */
export function getAvailableConversions(selectedFormats: ContentFormat[]): CrossFormatConversionType[] {
  const conversions = new Set<CrossFormatConversionType>();
  selectedFormats.forEach(f => {
    if (OUTPUT_FORMAT_CONFIGS[f]) {
      OUTPUT_FORMAT_CONFIGS[f].crossFormatConversions.forEach(c => conversions.add(c));
    }
  });
  return Array.from(conversions);
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEO REMIX & CLIP EXTRACTION PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Video Remix Flow — Re-edit existing video with new content
 *
 * User uploads existing video → system detects scenes, extracts clips,
 * allows stitching with new testimonials, B-roll, and segments →
 * generates teasers, best clips, thumbnails, and platform-specific shorts.
 */

export type VideoRemixAction =
  | 'scene_split'           // Split video into scenes at detected cut points
  | 'clip_select'           // Select specific clips by time range or AI selection
  | 'clip_reorder'          // Drag-and-drop reorder clips on timeline
  | 'clip_trim'             // Trim start/end of a clip
  | 'add_testimonial'       // Add testimonial clip from review/video/avatar
  | 'add_broll'             // Insert B-roll between clips (stock, AI, uploaded)
  | 'add_intro'             // Add intro sequence with branding
  | 'add_outro'             // Add outro with CTA
  | 'add_transition'        // Add transition between clips (fade, wipe, morph, zoom)
  | 'add_overlay'           // Add text/logo/lower-third overlay
  | 'add_music'             // Add/change background music
  | 'add_voiceover'         // Record or generate voiceover for a segment
  | 'replace_audio'         // Replace audio track for a clip
  | 'speed_adjust'          // Speed up or slow down a clip
  | 'color_grade'           // Apply color grading / LUT to clips
  | 'remove_clip'           // Remove a clip from the timeline
  | 'duplicate_clip'        // Duplicate a clip for repeat/emphasis
  | 'extract_best_moments'  // AI selects best N moments from the video
  | 'generate_teaser'       // Generate teaser/trailer from best moments
  | 'generate_thumbnails'   // Generate multiple thumbnail variants
  | 'adapt_for_platform';   // Auto-adapt to TikTok/Reels/Shorts/FB/LinkedIn

export interface VideoRemixClip {
  id: string;
  /** Source: original video, uploaded, AI-generated, testimonial, B-roll */
  source: 'original' | 'uploaded' | 'ai_generated' | 'testimonial' | 'broll' | 'stock';
  /** Time range in the original video (for original clips) */
  sourceTimeRange?: { start: number; end: number };
  /** Duration in seconds */
  duration: number;
  /** Thumbnail preview URL */
  thumbnailUrl?: string;
  /** Transcript for this clip */
  transcript?: string;
  /** Scene type detected by AI */
  sceneType?: 'talking_head' | 'product_shot' | 'b_roll' | 'title_card' | 'testimonial' | 'demo' | 'outro' | 'intro' | 'transition';
  /** AI-scored engagement potential (0-100) */
  engagementScore?: number;
  /** Overlays applied to this clip */
  overlays: Array<{
    type: 'text' | 'logo' | 'lower_third' | 'cta' | 'timer' | 'subtitle';
    content: string;
    position: 'top' | 'bottom' | 'center' | 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
    startTime: number;
    endTime: number;
  }>;
  /** Transition to next clip */
  transition?: {
    type: 'cut' | 'fade' | 'dissolve' | 'wipe' | 'zoom' | 'morph' | 'slide' | 'glitch';
    duration: number;
  };
  /** Speed multiplier (1 = normal, 0.5 = slow-mo, 2 = fast) */
  speedMultiplier: number;
  /** Color grading / LUT applied */
  colorGrade?: string;
  /** Edit state for inline editing of transcript */
  editState?: InlineEditableField;
}

export interface VideoRemixTimeline {
  /** All clips in order */
  clips: VideoRemixClip[];
  /** Total duration */
  totalDuration: number;
  /** Audio tracks */
  audioTracks: Array<{
    id: string;
    type: 'original' | 'voiceover' | 'music' | 'sfx';
    label: string;
    volume: number; // 0-1
    startTime: number;
    duration: number;
    muteOriginal?: boolean;
  }>;
  /** Output configs for different platforms */
  platformOutputs: Array<{
    platform: 'youtube' | 'tiktok' | 'instagram_reels' | 'instagram_feed' | 'youtube_shorts' | 'facebook' | 'linkedin' | 'twitter';
    aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
    maxDuration: number;
    selectedClipIds: string[]; // Which clips to include for this platform
    autoTrim: boolean;        // AI auto-trim to fit platform limits
  }>;
}

/** Create a new empty remix timeline */
export function createRemixTimeline(): VideoRemixTimeline {
  return {
    clips: [],
    totalDuration: 0,
    audioTracks: [],
    platformOutputs: [
      { platform: 'youtube', aspectRatio: '16:9', maxDuration: 600, selectedClipIds: [], autoTrim: false },
      { platform: 'tiktok', aspectRatio: '9:16', maxDuration: 60, selectedClipIds: [], autoTrim: true },
      { platform: 'instagram_reels', aspectRatio: '9:16', maxDuration: 90, selectedClipIds: [], autoTrim: true },
      { platform: 'youtube_shorts', aspectRatio: '9:16', maxDuration: 60, selectedClipIds: [], autoTrim: true },
      { platform: 'facebook', aspectRatio: '4:5', maxDuration: 240, selectedClipIds: [], autoTrim: true },
      { platform: 'linkedin', aspectRatio: '16:9', maxDuration: 600, selectedClipIds: [], autoTrim: true },
    ],
  };
}

/** Add a clip to the remix timeline */
export function addClipToTimeline(
  timeline: VideoRemixTimeline,
  clip: Omit<VideoRemixClip, 'id'>,
  insertAt?: number,
): VideoRemixTimeline {
  const newClip: VideoRemixClip = {
    ...clip,
    id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  };
  const clips = [...timeline.clips];
  if (insertAt !== undefined && insertAt >= 0 && insertAt <= clips.length) {
    clips.splice(insertAt, 0, newClip);
  } else {
    clips.push(newClip);
  }
  return {
    ...timeline,
    clips,
    totalDuration: clips.reduce((sum, c) => sum + c.duration / c.speedMultiplier, 0),
  };
}

/** Remove a clip from the timeline */
export function removeClipFromTimeline(timeline: VideoRemixTimeline, clipId: string): VideoRemixTimeline {
  const clips = timeline.clips.filter(c => c.id !== clipId);
  return {
    ...timeline,
    clips,
    totalDuration: clips.reduce((sum, c) => sum + c.duration / c.speedMultiplier, 0),
  };
}

/** Reorder clips in the timeline */
export function reorderClips(timeline: VideoRemixTimeline, fromIndex: number, toIndex: number): VideoRemixTimeline {
  const clips = [...timeline.clips];
  const [moved] = clips.splice(fromIndex, 1);
  clips.splice(toIndex, 0, moved);
  return { ...timeline, clips };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LONG-FORM CHUNKING & ASSEMBLY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Long-Form Production Pipeline — Handles content longer than single-generation limits
 *
 * Script is split into chunks → each chunk gets parallel TTS + video generation →
 * chunks are assembled into final long-form video → AI extracts best moments →
 * generates teasers, shorts, thumbnails for each platform
 */

export interface ContentChunk {
  id: string;
  index: number;
  /** Script lines in this chunk */
  scriptLines: Array<{
    key: string;
    text: string;
    voice: string;
    durationEst: number;
    direction: string;
  }>;
  /** Chunk duration estimate */
  durationEst: number;
  /** Processing status */
  status: 'pending' | 'tts_generating' | 'video_generating' | 'tts_done' | 'video_done' | 'assembled' | 'failed';
  /** Generated assets for this chunk */
  assets: {
    audioUrl?: string;
    videoUrl?: string;
    captionsUrl?: string;
    thumbnailUrl?: string;
  };
  /** Processing progress (0-100) */
  progress: number;
  /** Error if failed */
  error?: string;
}

export interface LongFormAssembly {
  /** All chunks in order */
  chunks: ContentChunk[];
  /** Assembly status */
  status: 'chunking' | 'generating' | 'assembling' | 'extracting' | 'complete' | 'failed';
  /** Total duration estimate */
  totalDurationEst: number;
  /** Final assembled video */
  assembledVideoUrl?: string;
  /** Extracted derivatives */
  derivatives: {
    /** Best moment clips (AI-selected) */
    bestMoments: Array<{
      id: string;
      timeRange: { start: number; end: number };
      engagementScore: number;
      thumbnailUrl?: string;
      videoUrl?: string;
      reason: string; // Why AI selected this moment
    }>;
    /** Auto-generated teaser */
    teaserUrl?: string;
    teaserDuration?: number;
    /** Platform-specific short clips */
    platformClips: Array<{
      platform: string;
      aspectRatio: string;
      clipUrls: string[];
      thumbnailUrls: string[];
    }>;
    /** Multiple thumbnail variants for A/B testing */
    thumbnails: Array<{
      url: string;
      style: 'dramatic' | 'bright' | 'minimal' | 'text_heavy' | 'face_focused';
      clickPrediction: number; // 0-100 estimated CTR
    }>;
  };
  /** Checkpoint for resume on failure */
  checkpoint: {
    lastCompletedChunkIndex: number;
    completedSteps: string[];
    retryCount: number;
  };
}

/** Split script into optimal chunks for parallel processing */
export function chunkScript(
  scriptLines: Array<{ key: string; text: string; voice: string; durationEst: number; direction: string }>,
  maxChunkDuration: number = 120, // 2 minutes per chunk default
): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  let currentChunk: ContentChunk = {
    id: `chunk_0`,
    index: 0,
    scriptLines: [],
    durationEst: 0,
    status: 'pending',
    assets: {},
    progress: 0,
  };

  for (const line of scriptLines) {
    if (currentChunk.durationEst + line.durationEst > maxChunkDuration && currentChunk.scriptLines.length > 0) {
      chunks.push(currentChunk);
      currentChunk = {
        id: `chunk_${chunks.length}`,
        index: chunks.length,
        scriptLines: [],
        durationEst: 0,
        status: 'pending',
        assets: {},
        progress: 0,
      };
    }
    currentChunk.scriptLines.push(line);
    currentChunk.durationEst += line.durationEst;
  }

  if (currentChunk.scriptLines.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/** Create a new long-form assembly */
export function createLongFormAssembly(chunks: ContentChunk[]): LongFormAssembly {
  return {
    chunks,
    status: 'chunking',
    totalDurationEst: chunks.reduce((sum, c) => sum + c.durationEst, 0),
    derivatives: {
      bestMoments: [],
      platformClips: [],
      thumbnails: [],
    },
    checkpoint: {
      lastCompletedChunkIndex: -1,
      completedSteps: [],
      retryCount: 0,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEBSITE PACKAGE PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Website Package — Full website generation from business data
 *
 * Business name + enrichment → complete website with:
 * - Landing page with hero banner (video/animated/static)
 * - Feature sections with cards (scroll left-to-right carousel)
 * - Pricing tables, testimonials, FAQ
 * - CTAs (buttons, banners, popups, exit-intent)
 * - Infographics, whitepapers, customer journeys
 * - Interactive product demos
 * - Scroll-triggered animations (fade, slide, parallax, reveal, counter)
 * - Mobile-responsive, SEO-optimized
 * - Export as HTML/CSS/JS, React, or CMS blocks
 */

export type WebsiteSectionType =
  // Hero & Headers
  | 'hero_video_loop'        // Full-width video loop with overlay text + CTA
  | 'hero_animated_gradient' // Animated gradient with floating elements
  | 'hero_parallax'          // Parallax scrolling hero image
  | 'hero_split'             // Split screen: media left, copy right
  | 'hero_carousel'          // Hero carousel with multiple slides
  // Feature Sections
  | 'features_grid'          // Feature cards in 2x2, 3x3, or 4x4 grid
  | 'features_carousel'      // Horizontal scroll carousel of feature cards
  | 'features_tabs'          // Tabbed feature sections
  | 'features_accordion'     // Expandable accordion feature list
  | 'features_timeline'      // Vertical timeline of features/milestones
  | 'features_bento'         // Bento grid layout (varied card sizes)
  // Social Proof
  | 'testimonials_carousel'  // Testimonial cards in carousel
  | 'testimonials_grid'      // Testimonial grid with photos + quotes
  | 'testimonials_video'     // Video testimonials with play buttons
  | 'reviews_wall'           // Social proof wall (Google reviews, Trustpilot, etc.)
  | 'logo_cloud'             // Client/partner logo cloud
  | 'stats_counter'          // Animated stat counters (users, revenue, growth)
  // Pricing & Comparison
  | 'pricing_table'          // Pricing tier cards with feature comparison
  | 'pricing_toggle'         // Monthly/annual toggle pricing
  | 'comparison_table'       // Feature comparison table (us vs competitors)
  // Content Sections
  | 'how_it_works'           // Numbered steps with icons/illustrations
  | 'use_cases'              // Use case cards with industry icons
  | 'customer_journey'       // Visual customer journey map
  | 'before_after'           // Before/after slider comparison
  | 'infographic_section'    // Embedded infographic
  | 'whitepaper_download'    // Whitepaper preview with download CTA
  | 'case_study_preview'     // Case study card with key metrics
  | 'blog_preview'           // Latest blog posts grid
  | 'video_embed'            // Embedded video player (product demo, explainer)
  // Interactive
  | 'interactive_demo'       // Clickable product demo embed
  | 'calculator_roi'         // ROI calculator with sliders
  | 'quiz_assessment'        // Interactive quiz/assessment
  | 'configurator'           // Product configurator (build-your-own)
  // CTA & Conversion
  | 'cta_banner'             // Full-width CTA banner
  | 'cta_floating'           // Floating sticky CTA button
  | 'cta_exit_intent'        // Exit-intent popup
  | 'cta_inline'             // Inline CTA between content sections
  | 'newsletter_signup'      // Email signup form
  | 'booking_widget'         // Calendar booking widget
  // Footer & Navigation
  | 'footer_comprehensive'   // Full footer with links, social, newsletter
  | 'footer_minimal'         // Minimal footer with copyright + links
  | 'navbar_sticky'          // Sticky navigation bar
  | 'navbar_hamburger';      // Mobile hamburger menu

export type ScrollAnimationType =
  | 'fade_in'               // Fade in on scroll
  | 'slide_up'              // Slide up from below
  | 'slide_left'            // Slide in from left
  | 'slide_right'           // Slide in from right
  | 'zoom_in'               // Scale up from small
  | 'parallax'              // Parallax depth effect
  | 'reveal'                // Reveal with clip-path
  | 'counter_up'            // Animated number counter
  | 'stagger'               // Staggered children animation
  | 'typewriter'            // Typewriter text effect
  | 'morph'                 // Shape morphing
  | 'rotate_in'             // Rotate in from angle
  | 'flip'                  // 3D flip reveal
  | 'bounce'                // Bounce in
  | 'blur_in';              // Blur to sharp

export interface WebsiteSection {
  id: string;
  type: WebsiteSectionType;
  /** Section order (0-based) */
  order: number;
  /** Section heading (inline-editable) */
  heading: InlineEditableField;
  /** Section subheading (inline-editable) */
  subheading: InlineEditableField;
  /** Section body content (inline-editable) */
  bodyContent: InlineEditableField;
  /** Cards within this section */
  cards: Array<{
    id: string;
    title: InlineEditableField;
    description: InlineEditableField;
    icon?: string;
    imageUrl?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    /** Stats (for counter sections) */
    stat?: { value: number; suffix: string; prefix?: string };
  }>;
  /** Background style */
  background: 'white' | 'light_gray' | 'dark' | 'gradient' | 'image' | 'video' | 'pattern';
  /** Scroll animation */
  scrollAnimation?: {
    type: ScrollAnimationType;
    duration: number;
    delay: number;
    staggerChildren?: number;
  };
  /** Whether this section is above the fold */
  aboveFold: boolean;
  /** SEO metadata */
  seo?: {
    heading?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface WebsitePackageConfig {
  /** Business info for enrichment */
  businessName: string;
  businessLocation?: string;
  industry?: string;
  /** Website type */
  websiteType: 'landing_page' | 'product_page' | 'microsite' | 'portfolio' | 'saas' | 'ecommerce' | 'restaurant' | 'real_estate' | 'healthcare' | 'education';
  /** Theme */
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: 'modern' | 'classic' | 'playful' | 'minimal' | 'premium';
    borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
    darkMode: boolean;
  };
  /** Sections to include */
  sections: WebsiteSection[];
  /** Hero banner config */
  heroBanner: {
    type: 'video_loop' | 'animated_gradient' | 'parallax_image' | 'split_screen' | 'carousel';
    headline: InlineEditableField;
    subheadline: InlineEditableField;
    ctaLabel: InlineEditableField;
    ctaUrl: string;
    mediaUrl?: string;
    /** Overlay opacity (0-1) */
    overlayOpacity: number;
  };
  /** Global scroll animations */
  globalAnimations: {
    enabled: boolean;
    defaultType: ScrollAnimationType;
    defaultDuration: number;
    defaultDelay: number;
    staggerChildren: number;
    reducedMotionFallback: boolean;
  };
  /** Export config */
  exportFormat: 'html_css_js' | 'react_components' | 'nextjs_pages' | 'wordpress_blocks' | 'webflow_json';
  /** SEO */
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  /** Analytics */
  analytics: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    heatmapEnabled: boolean;
  };
  /** Responsive breakpoints */
  responsive: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
    widescreen: boolean;
  };
}

/** Create a default website package config from business data */
export function createWebsitePackageConfig(
  businessName: string,
  businessLocation?: string,
  industry?: string,
): WebsitePackageConfig {
  return {
    businessName,
    businessLocation,
    industry,
    websiteType: 'landing_page',
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E293B',
      accentColor: '#F59E0B',
      fontFamily: 'modern',
      borderRadius: 'medium',
      darkMode: false,
    },
    sections: [],
    heroBanner: {
      type: 'video_loop',
      headline: createEditableField('hero_headline', 'Headline', businessName),
      subheadline: createEditableField('hero_subheadline', 'Subheadline', `Welcome to ${businessName}`),
      ctaLabel: createEditableField('hero_cta', 'CTA', 'Get Started'),
      ctaUrl: '#contact',
      overlayOpacity: 0.4,
    },
    globalAnimations: {
      enabled: true,
      defaultType: 'fade_in',
      defaultDuration: 0.6,
      defaultDelay: 0.1,
      staggerChildren: 0.1,
      reducedMotionFallback: true,
    },
    exportFormat: 'html_css_js',
    seo: {
      title: businessName,
      description: `${businessName} - ${industry || 'Your Business'}`,
      keywords: [businessName, industry || ''].filter(Boolean),
    },
    analytics: { heatmapEnabled: false },
    responsive: { mobile: true, tablet: true, desktop: true, widescreen: true },
  };
}

/** Generate default sections for a website type */
export function getDefaultSectionsForType(websiteType: WebsitePackageConfig['websiteType']): WebsiteSectionType[] {
  const WEBSITE_TYPE_SECTIONS: Record<string, WebsiteSectionType[]> = {
    landing_page: [
      'hero_video_loop', 'features_grid', 'how_it_works', 'testimonials_carousel',
      'stats_counter', 'cta_banner', 'footer_comprehensive',
    ],
    product_page: [
      'hero_split', 'features_tabs', 'video_embed', 'pricing_table',
      'comparison_table', 'testimonials_grid', 'cta_inline', 'footer_comprehensive',
    ],
    microsite: [
      'hero_carousel', 'features_bento', 'use_cases', 'case_study_preview',
      'testimonials_video', 'infographic_section', 'booking_widget', 'footer_comprehensive',
    ],
    portfolio: [
      'hero_parallax', 'features_grid', 'before_after', 'testimonials_carousel',
      'blog_preview', 'cta_banner', 'footer_minimal',
    ],
    saas: [
      'hero_video_loop', 'features_tabs', 'how_it_works', 'pricing_toggle',
      'comparison_table', 'testimonials_grid', 'calculator_roi', 'cta_floating', 'footer_comprehensive',
    ],
    ecommerce: [
      'hero_carousel', 'features_carousel', 'before_after', 'reviews_wall',
      'stats_counter', 'newsletter_signup', 'cta_exit_intent', 'footer_comprehensive',
    ],
    restaurant: [
      'hero_video_loop', 'features_bento', 'testimonials_carousel', 'booking_widget',
      'logo_cloud', 'cta_floating', 'footer_comprehensive',
    ],
    real_estate: [
      'hero_parallax', 'features_grid', 'before_after', 'interactive_demo',
      'stats_counter', 'testimonials_video', 'booking_widget', 'footer_comprehensive',
    ],
    healthcare: [
      'hero_split', 'features_accordion', 'how_it_works', 'testimonials_grid',
      'stats_counter', 'quiz_assessment', 'booking_widget', 'footer_comprehensive',
    ],
    education: [
      'hero_video_loop', 'features_tabs', 'customer_journey', 'testimonials_carousel',
      'pricing_table', 'blog_preview', 'cta_banner', 'footer_comprehensive',
    ],
  };
  return WEBSITE_TYPE_SECTIONS[websiteType] || WEBSITE_TYPE_SECTIONS.landing_page;
}

// ─── Extended Output Format Configs (Video Remix + Website) ──────────────────

export const EXTENDED_FORMAT_CONFIGS: Record<string, OutputFormatConfig> = {
  // Video Remix formats
  video_remix: {
    format: 'video_remix' as ContentFormat,
    label: 'Video Remix',
    description: 'Re-edit existing video: clip extraction, testimonial stitching, B-roll, new intros/outros',
    icon: 'Scissors',
    category: 'video',
    aspectRatios: ['16:9', '9:16', '1:1', '4:5'],
    durationRange: { min: 15, max: 600 },
    primaryChainId: 'video_remix',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'creator',
    creditMultiplier: 2,
    canCombine: true,
    crossFormatConversions: ['video_to_podcast', 'video_to_blog', 'video_to_shorts', 'video_to_audiogram'],
  },
  teaser_clip: {
    format: 'teaser_clip' as ContentFormat,
    label: 'Teaser / Trailer',
    description: 'AI-generated teaser with dramatic pacing from best moments',
    icon: 'Clapperboard',
    category: 'video',
    aspectRatios: ['16:9', '9:16'],
    durationRange: { min: 15, max: 60 },
    primaryChainId: 'video_remix',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'creator',
    creditMultiplier: 1,
    canCombine: true,
    crossFormatConversions: [],
  },
  best_clips: {
    format: 'best_clips' as ContentFormat,
    label: 'Best Clips Compilation',
    description: 'AI-extracted best/most-engaging moments stitched into highlight reel',
    icon: 'Star',
    category: 'video',
    aspectRatios: ['16:9', '9:16', '1:1'],
    durationRange: { min: 30, max: 180 },
    primaryChainId: 'video_remix',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'creator',
    creditMultiplier: 1.5,
    canCombine: true,
    crossFormatConversions: ['video_to_audiogram'],
  },
  platform_clips: {
    format: 'platform_clips' as ContentFormat,
    label: 'Platform-Specific Clips',
    description: 'Auto-adapted clips for TikTok (9:16), Instagram Reels (9:16), YouTube Shorts (9:16), Facebook (4:5), LinkedIn (16:9)',
    icon: 'ScreenShare',
    category: 'social',
    aspectRatios: ['9:16', '1:1', '4:5', '16:9'],
    durationRange: { min: 15, max: 90 },
    primaryChainId: 'video_remix',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'starter',
    creditMultiplier: 1,
    canCombine: true,
    crossFormatConversions: [],
  },
  highlight_reel: {
    format: 'highlight_reel' as ContentFormat,
    label: 'Highlight Reel',
    description: 'Compilation of highlights from multiple videos or events',
    icon: 'Trophy',
    category: 'video',
    aspectRatios: ['16:9', '9:16'],
    durationRange: { min: 60, max: 300 },
    primaryChainId: 'video_remix',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'creator',
    creditMultiplier: 2,
    canCombine: true,
    crossFormatConversions: ['video_to_podcast', 'video_to_blog'],
  },
  testimonial_video: {
    format: 'testimonial_video' as ContentFormat,
    label: 'Testimonial Compilation',
    description: 'Stitched testimonial reel from reviews, interviews, and uploaded clips',
    icon: 'MessageCircleHeart',
    category: 'video',
    aspectRatios: ['16:9', '9:16', '1:1'],
    durationRange: { min: 30, max: 300 },
    primaryChainId: 'testimonial_compilation',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'creator',
    creditMultiplier: 1.5,
    canCombine: true,
    crossFormatConversions: ['video_to_audiogram'],
  },

  // Website Package formats
  website_package: {
    format: 'website_package' as ContentFormat,
    label: 'Full Website Package',
    description: 'Complete website: landing + hero + sections + cards + scroll animations + CTAs + export',
    icon: 'Globe',
    category: 'presentation',
    aspectRatios: [],
    durationRange: { min: 0, max: 0 },
    primaryChainId: 'website_package',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'pro',
    creditMultiplier: 5,
    canCombine: true,
    crossFormatConversions: [],
  },
  landing_page: {
    format: 'landing_page' as ContentFormat,
    label: 'Landing Page',
    description: 'Single landing page with hero, features, testimonials, and CTA',
    icon: 'LayoutTemplate',
    category: 'presentation',
    aspectRatios: [],
    durationRange: { min: 0, max: 0 },
    primaryChainId: 'landing_page_quick',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'starter',
    creditMultiplier: 2,
    canCombine: true,
    crossFormatConversions: [],
  },
  hero_banner: {
    format: 'hero_banner' as ContentFormat,
    label: 'Hero Banner',
    description: 'Standalone hero banner: video loop, animated gradient, or cinematic still',
    icon: 'Image',
    category: 'social',
    aspectRatios: ['16:9', '21:9', '4:3'],
    durationRange: { min: 5, max: 30 },
    primaryChainId: 'hero_banner_only',
    supportsTranscreation: false,
    supportsMultiLanguage: true,
    minTier: 'free',
    creditMultiplier: 1,
    canCombine: true,
    crossFormatConversions: [],
  },
  product_page: {
    format: 'product_page' as ContentFormat,
    label: 'Product Page',
    description: 'Product page with features, pricing, testimonials, and demo embed',
    icon: 'ShoppingBag',
    category: 'presentation',
    aspectRatios: [],
    durationRange: { min: 0, max: 0 },
    primaryChainId: 'interactive_demo_package',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'pro',
    creditMultiplier: 3,
    canCombine: true,
    crossFormatConversions: [],
  },
  infographic: {
    format: 'infographic' as ContentFormat,
    label: 'Infographic',
    description: 'Data-driven infographic: charts, stats, timelines, icons — static or animated',
    icon: 'PieChart',
    category: 'presentation',
    aspectRatios: ['9:16', '1:1', '16:9'],
    durationRange: { min: 0, max: 0 },
    primaryChainId: 'whitepaper_package',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'starter',
    creditMultiplier: 1,
    canCombine: true,
    crossFormatConversions: ['infographic_to_video'],
  },
  whitepaper: {
    format: 'whitepaper' as ContentFormat,
    label: 'Whitepaper',
    description: 'Long-form PDF whitepaper: cover, exec summary, chapters, data viz, citations',
    icon: 'BookOpen',
    category: 'text',
    aspectRatios: [],
    durationRange: { min: 0, max: 0 },
    primaryChainId: 'whitepaper_package',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'pro',
    creditMultiplier: 2,
    canCombine: true,
    crossFormatConversions: ['blog_to_video'],
  },
  case_study_page: {
    format: 'case_study_page' as ContentFormat,
    label: 'Case Study',
    description: 'Customer case study page: challenge → solution → results with metrics',
    icon: 'Target',
    category: 'presentation',
    aspectRatios: [],
    durationRange: { min: 0, max: 0 },
    primaryChainId: 'whitepaper_package',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'creator',
    creditMultiplier: 1.5,
    canCombine: true,
    crossFormatConversions: ['blog_to_video'],
  },
  interactive_demo: {
    format: 'interactive_demo' as ContentFormat,
    label: 'Interactive Demo',
    description: 'Clickable product demo: guided tour, tooltips, hotspots',
    icon: 'MousePointerClick',
    category: 'presentation',
    aspectRatios: [],
    durationRange: { min: 0, max: 0 },
    primaryChainId: 'interactive_demo_package',
    supportsTranscreation: false,
    supportsMultiLanguage: true,
    minTier: 'pro',
    creditMultiplier: 3,
    canCombine: true,
    crossFormatConversions: [],
  },
  microsite: {
    format: 'microsite' as ContentFormat,
    label: 'Microsite (3-5 pages)',
    description: 'Multi-page microsite with navigation, multiple sections, and full branding',
    icon: 'Layers',
    category: 'presentation',
    aspectRatios: [],
    durationRange: { min: 0, max: 0 },
    primaryChainId: 'website_package',
    supportsTranscreation: true,
    supportsMultiLanguage: true,
    minTier: 'business',
    creditMultiplier: 8,
    canCombine: false,
    crossFormatConversions: [],
  },
};
