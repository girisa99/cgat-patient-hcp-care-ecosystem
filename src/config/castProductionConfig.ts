/**
 * castProductionConfig — Centralized Configuration for Cast Production Pipeline
 *
 * Single source of truth for ALL production constants, timeouts, polling intervals,
 * payload limits, defaults, and provider settings. NO magic numbers should exist
 * outside this file for Cast production operations.
 *
 * Learnings encoded:
 * L1  — Payload size limits (edge fn body limit ~6MB)
 * L14 — Edge function timeout awareness (free=60s, pro=150s)
 * L18 — Rate limiting delays between API calls
 * L35 — Per-step delays for provider rate limits
 * L42 — Retry backoffs for all external API calls
 */

// ─── Storage ─────────────────────────────────────────────────────────────────

export const CAST_STORAGE = {
  /** Primary bucket for all Cast production assets */
  ASSETS_BUCKET: 'cast-assets',
  /** Bucket for product screenshots used in scene backgrounds */
  SCREENSHOTS_BUCKET: 'product-screenshots',
  /** Max payload size for edge function calls (bytes) */
  PAYLOAD_MAX_BYTES: 5_000_000, // 5MB
  /** Payload size that triggers a warning (bytes) */
  PAYLOAD_WARN_BYTES: 3_000_000, // 3MB
  /** Max scene config payload for DB write (bytes) */
  SCENE_CONFIG_MAX_BYTES: 500_000, // 500KB
} as const;

// ─── Timeouts (milliseconds) ─────────────────────────────────────────────────

export const CAST_TIMEOUTS = {
  /** TTS generation per line */
  TTS: 30_000,
  /** Image generation (FLUX, Alibaba) */
  IMAGE: 60_000,
  /** Video generation (WAN, MiniMax) */
  VIDEO: 90_000,
  /** Avatar 3D generation (DashScope/Meshy) */
  AVATAR_3D: 90_000,
  /** Lipsync generation (Alibaba/Replicate) */
  LIPSYNC: 120_000,
  /** Music generation (Suno/ModelsLab) */
  MUSIC: 120_000,
  /** SFX generation per clip */
  SFX: 30_000,
  /** Script generation via AI */
  SCRIPT: 60_000,
  /** DB project load timeout */
  PROJECT_LOAD: 30_000,
  /** Assembly base timeout (scales with scene count) */
  assemblyTimeout: (sceneCount: number) => 60_000 + sceneCount * 5_000,
} as const;

// ─── Polling ─────────────────────────────────────────────────────────────────

export const CAST_POLLING = {
  /** Interval between status polls */
  INTERVAL_MS: 10_000,
  /** Max polls for video task completion (30 × 10s = 5 min) */
  MAX_VIDEO_POLLS: 30,
  /** Max polls for Alibaba lipsync (60 × 10s = 10 min) */
  MAX_LIPSYNC_POLLS: 60,
  /** Max polls for Replicate lipsync (60 × 10s = 10 min) */
  MAX_REPLICATE_POLLS: 60,
  /** Max polls for assembly completion (300 × 10s = 50 min) */
  MAX_ASSEMBLY_POLLS: 300,
} as const;

// ─── Retry Backoffs (milliseconds) ──────────────────────────────────────────

export const CAST_RETRY_BACKOFFS = {
  /** Visual generation: 0s, 5s, 15s */
  VISUAL: [0, 5_000, 15_000] as readonly number[],
  /** Music generation: 0s, 5s, 15s */
  MUSIC: [0, 5_000, 15_000] as readonly number[],
  /** TTS generation: 0s, 2s, 6s */
  TTS: [0, 2_000, 6_000] as readonly number[],
  /** Script generation: 0s, 3s, 10s */
  SCRIPT: [0, 3_000, 10_000] as readonly number[],
  /** Storage re-upload: 0s, 3s */
  STORAGE: [0, 3_000] as readonly number[],
} as const;

// ─── Rate Limiting Delays (milliseconds) ─────────────────────────────────────

export const CAST_DELAYS = {
  /** Delay before avatar-3d step (DashScope rate limit) */
  BEFORE_AVATAR_3D: 2_000,
  /** Delay after avatar-3d step */
  AFTER_AVATAR_3D: 2_000,
  /** Generic delay between visual pipeline steps */
  BETWEEN_VISUAL_STEPS: 1_000,
  /** Delay between scene visual generations */
  BETWEEN_SCENES: 2_000,
  /** Delay between SFX generation calls */
  BETWEEN_SFX: 500,
  /** Delay between TTS generation calls (L18: was 500ms, raised to 1500ms) */
  BETWEEN_TTS: 1_500,
  /** Delay between music scene generations */
  BETWEEN_MUSIC_SCENES: 1_000,
  /** Auto-save debounce */
  AUTO_SAVE_DEBOUNCE: 2_000,
  /** DB batch write delay (prevent connection pool exhaustion) */
  DB_BATCH_WRITE: 100,
} as const;

// ─── Default Durations (seconds) ─────────────────────────────────────────────

export const CAST_DEFAULTS = {
  /** Default music duration per scene */
  MUSIC_DURATION: 30,
  /** Default SFX clip duration */
  SFX_DURATION: 3,
  /** Default video clip duration */
  VIDEO_DURATION: 3,
  /** Default motion graphics duration */
  MOTION_GRAPHICS_DURATION: 4,
  /** Default scene duration if no script lines */
  SCENE_DURATION: 30,
  /** Default music loop duration */
  MUSIC_LOOP_DURATION: 30,
  /** Default transition duration */
  TRANSITION_DURATION: 5,
  /** Default transition style */
  TRANSITION_STYLE: 'dissolve' as const,
} as const;

// ─── Output Resolution ──────────────────────────────────────────────────────

export type CastResolution = '1920x1080' | '1280x720' | '3840x2160' | '1080x1920' | '1080x1080';

export const CAST_RESOLUTIONS: Record<string, { label: string; value: CastResolution; aspectRatio: string }> = {
  '1080p': { label: '1080p (16:9)', value: '1920x1080', aspectRatio: '16:9' },
  '720p': { label: '720p (16:9)', value: '1280x720', aspectRatio: '16:9' },
  '4k': { label: '4K (16:9)', value: '3840x2160', aspectRatio: '16:9' },
  'vertical': { label: 'Vertical (9:16)', value: '1080x1920', aspectRatio: '9:16' },
  'square': { label: 'Square (1:1)', value: '1080x1080', aspectRatio: '1:1' },
};

export const DEFAULT_RESOLUTION: CastResolution = '1920x1080';

// ─── Quality & Tier ─────────────────────────────────────────────────────────

export const CAST_QUALITY = {
  /** Music generation tier */
  MUSIC_TIER: 'advanced' as const,
  /** TTS generation tier */
  TTS_TIER: 'premium' as const,
  /** Assembly output quality */
  ASSEMBLY_QUALITY: 'production' as const,
  /** Video MIME type */
  VIDEO_MIME: 'video/mp4' as const,
  /** Audio MIME type */
  AUDIO_MIME: 'audio/mpeg' as const,
} as const;

// ─── Concurrency & Limits ───────────────────────────────────────────────────

export const CAST_LIMITS = {
  /** Max concurrent generation jobs per project */
  MAX_CONCURRENT_JOBS: 3,
  /** Max re-upload retry attempts */
  MAX_REUPLOAD_ATTEMPTS: 2,
  /** TTS approval threshold (0-1) */
  TTS_APPROVAL_THRESHOLD: 0.9,
  /** Script content min fill ratio before warning */
  SCRIPT_MIN_FILL_RATIO: 0.5,
  /** Characters per token estimate */
  CHARS_PER_TOKEN: 4,
  /** Default token estimate for music generation */
  MUSIC_TOKENS_DEFAULT: 200,
} as const;

// ─── Provider Defaults ──────────────────────────────────────────────────────

export const CAST_PROVIDERS = {
  /** Default music provider */
  MUSIC: 'suno' as const,
  /** Default TTS provider */
  TTS: 'elevenlabs' as const,
  /** Lipsync provider */
  LIPSYNC: 'alibaba-lipsync' as const,
  /** Screen enhance model */
  SCREEN_ENHANCE_MODEL: 'wan2.6-i2v' as const,
  /** Image fallback provider */
  IMAGE_FALLBACK: 'gpt-image-1' as const,
  /** Image fallback size */
  IMAGE_FALLBACK_SIZE: '1536x1024' as const,
  /** Image fallback quality */
  IMAGE_FALLBACK_QUALITY: 'medium' as const,
} as const;

// ─── Compliance ──────────────────────────────────────────────────────────────

export const CAST_COMPLIANCE = {
  /** Minimum dialogue length before running compliance check */
  MIN_DIALOGUE_LENGTH: 20,
  /** Compliance score threshold for pass (0-100) */
  PASS_THRESHOLD: 70,
} as const;

// ─── GDPR/HIPAA Consent (M6) ────────────────────────────────────────────────

export const CAST_CONSENT_REQUIREMENTS: Record<string, {
  requiresConsent: boolean;
  consentTypes: string[];
  label: string;
}> = {
  healthcare: {
    requiresConsent: true,
    consentTypes: ['hipaa_acknowledgment', 'phi_disclaimer'],
    label: 'Healthcare content requires HIPAA acknowledgment',
  },
  pharma: {
    requiresConsent: true,
    consentTypes: ['hipaa_acknowledgment', 'fda_disclaimer'],
    label: 'Pharmaceutical content requires regulatory disclaimers',
  },
  finance: {
    requiresConsent: true,
    consentTypes: ['financial_disclaimer'],
    label: 'Financial content requires regulatory disclaimers',
  },
  legal: {
    requiresConsent: true,
    consentTypes: ['legal_disclaimer'],
    label: 'Legal content requires disclaimers',
  },
  general: { requiresConsent: false, consentTypes: [], label: '' },
  education: { requiresConsent: false, consentTypes: [], label: '' },
  technology: { requiresConsent: false, consentTypes: [], label: '' },
  saas: { requiresConsent: false, consentTypes: [], label: '' },
  ecommerce: { requiresConsent: false, consentTypes: [], label: '' },
  entertainment: { requiresConsent: false, consentTypes: [], label: '' },
  nonprofit: { requiresConsent: false, consentTypes: [], label: '' },
  sports: { requiresConsent: false, consentTypes: [], label: '' },
  realestate: { requiresConsent: false, consentTypes: [], label: '' },
  travel: { requiresConsent: false, consentTypes: [], label: '' },
  food: { requiresConsent: false, consentTypes: [], label: '' },
  fashion: { requiresConsent: false, consentTypes: [], label: '' },
  automotive: { requiresConsent: false, consentTypes: [], label: '' },
  gaming: { requiresConsent: false, consentTypes: [], label: '' },
  media: { requiresConsent: false, consentTypes: [], label: '' },
  government: { requiresConsent: false, consentTypes: [], label: '' },
};

/** Check if an industry requires consent gates before production */
export function requiresConsentGate(industry: string): boolean {
  return CAST_CONSENT_REQUIREMENTS[industry]?.requiresConsent ?? false;
}

/** Get consent types needed for an industry */
export function getConsentTypes(industry: string): string[] {
  return CAST_CONSENT_REQUIREMENTS[industry]?.consentTypes ?? [];
}
