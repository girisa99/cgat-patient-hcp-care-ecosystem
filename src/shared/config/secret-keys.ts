/**
 * UNIFIED SECRET KEY CONFIGURATION
 * 
 * Single source of truth for all API keys and secrets used across
 * Genie Studio, Healthcare, and shared infrastructure.
 * 
 * IMPORTANT: All edge functions should use this pattern to retrieve secrets
 * instead of duplicating the logic.
 * 
 * @see supabase/functions/_shared/api-keys.ts for edge function equivalents
 * @see docs/architecture/P3_API_DEPENDENCIES_GUIDE.md for full key documentation
 */

// =============================================================================
// GOOGLE OAUTH - SHARED ACROSS ALL GOOGLE SERVICES (YouTube, Calendar, etc.)
// =============================================================================
export const GOOGLE_OAUTH_KEYS = {
  CLIENT_ID: 'GOOGLE_CLIENT_ID',         // OAuth Client ID - SHARED for YouTube, Calendar
  CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET', // OAuth Client Secret
  API_KEY: 'GOOGLE_API_KEY',             // General API key (fallback for OAuth)
} as const;

// =============================================================================
// AI PROVIDER KEYS - Canonical Names (use these in edge functions)
// =============================================================================
export const AI_PROVIDER_KEYS = {
  // Primary AI Keys
  OPENAI: 'OPENAI_API_KEY',
  ANTHROPIC: 'ANTHROPIC_API_KEY',     // Canonical name for Claude
  CLAUDE: 'CLAUDE_API_KEY',           // Alias (deprecated - use ANTHROPIC)
  GEMINI: 'GEMINI_API_KEY',           // Primary Gemini key
  GOOGLE: 'GOOGLE_API_KEY',           // Google services (TTS, OAuth, etc.)
  
  // Alibaba DashScope - UNIFIED key for ALL services (text, voice, video, image, OCR)
  ALIBABA: 'ALIBABA_API_KEY',         // Virginia (US/Americas)
  ALIBABA_SINGAPORE: 'ALIBABA_SINGAPORE_API_KEY', // Singapore (Asia, EU, MEA, Africa, India)
  ALIBABA_CHINA: 'ALIBABA_CHINA_API_KEY', // Beijing (CJK + China-only models)
  
  // DeepSeek - Technical/Chinese specialist
  DEEPSEEK: 'DEEPSEEK_API_KEY',       // DeepSeek Coder, DeepSeek Math, Translation
  
  // Deepgram - Real-time STT (Primary for <100ms latency)
  DEEPGRAM: 'DEEPGRAM_API_KEY',       // Nova 2, real-time streaming STT
  
  // Voice & Media Keys
  ELEVENLABS: 'ELEVENLABS_API_KEY',
  REPLICATE: 'REPLICATE_API_TOKEN',
  HUGGINGFACE: 'HUGGING_FACE_ACCESS_TOKEN',
  
  // ModelsLab - UNIFIED HUB for Image/Video/Audio/3D/Training
  // Includes: Stable Diffusion, FLUX, Midjourney-style, AnimateDiff, Voice Clone, 3D Gen
  // Also hosts CivitAI community models
  MODELSLAB: 'MODELSLAB_API_KEY',
  
  // JSON2Video - Timeline-based video assembly and editing
  // Role: Render tier for API-only access (no UI editor needed)
  // Phase 1: Video stitching for Genie Cast
  // Phase 2: Will be complemented by Cloud Run GPU for heavy processing
  JSON2VIDEO: 'JSON2VIDEO_API_KEY',
  
  // Translation Keys
  MICROSOFT_TRANSLATE: 'MICROSOFT_TRANSLATE_API_KEY',
  MICROSOFT_TRANSLATE_REGION: 'MICROSOFT_TRANSLATE_REGION',
  DEEPL: 'DEEPL_API_KEY',
  AMAZON_TRANSLATE: 'AMAZON_TRANSLATE_API_KEY',
  AMAZON_TRANSLATE_SECRET: 'AMAZON_TRANSLATE_SECRET_KEY',
  
  // Data Annotation & Training
  LABEL_STUDIO_URL: 'LABEL_STUDIO_API_URL',
  LABEL_STUDIO_TOKEN: 'LABEL_STUDIO_ACCESS_TOKEN',
} as const;

// =============================================================================
// COMMUNICATION KEYS
// =============================================================================
export const COMMUNICATION_KEYS = {
  TWILIO_SID: 'TWILIO_ACCOUNT_SID',
  TWILIO_TOKEN: 'TWILIO_AUTH_TOKEN',
  TWILIO_PHONE: 'TWILIO_PHONE_NUMBER',
  TWILIO_WHATSAPP: 'TWILIO_WHATSAPP_NUMBER',
  RESEND: 'RESEND_API_KEY',
  SENDGRID: 'SENDGRID_API_KEY',
  SENDGRID_FROM: 'SENDGRID_FROM_EMAIL',
} as const;

// =============================================================================
// BUSINESS SERVICE KEYS
// =============================================================================
export const BUSINESS_KEYS = {
  STRIPE: 'STRIPE_SECRET_KEY',        // Managed by connector
  DOCUSIGN: 'DOCUSIGN_API_KEY',
  ARIZE: 'ARIZE_API_KEY',
  LANGWATCH: 'LANGWATCH_API_KEY',
} as const;

// =============================================================================
// OAUTH KEYS - Unified for all OAuth flows
// =============================================================================
export const OAUTH_KEYS = {
  // Google OAuth (YouTube, Calendar, etc.) - SINGLE CLIENT ID
  GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
  
  // LinkedIn OAuth
  LINKEDIN_CLIENT_ID: 'LINKEDIN_CLIENT_ID',
  LINKEDIN_CLIENT_SECRET: 'LINKEDIN_CLIENT_SECRET',
} as const;

// =============================================================================
// ALL SECRETS (for validation)
// =============================================================================
export const ALL_SECRET_KEYS = {
  ...AI_PROVIDER_KEYS,
  ...COMMUNICATION_KEYS,
  ...BUSINESS_KEYS,
  ...OAUTH_KEYS,
} as const;

// =============================================================================
// HELPER TYPES
// =============================================================================
export type AIProviderKey = keyof typeof AI_PROVIDER_KEYS;
export type CommunicationKey = keyof typeof COMMUNICATION_KEYS;
export type BusinessKey = keyof typeof BUSINESS_KEYS;
export type OAuthKey = keyof typeof OAUTH_KEYS;
export type SecretKey = keyof typeof ALL_SECRET_KEYS;

// =============================================================================
// SECRET KEY ALIASES (for backward compatibility)
// =============================================================================
export const SECRET_ALIASES: Record<string, string> = {
  // Claude can be accessed via ANTHROPIC or CLAUDE
  'CLAUDE_API_KEY': 'ANTHROPIC_API_KEY',
  // Gemini can be accessed via GEMINI or GOOGLE (for AI specifically)
  'GOOGLE_API_KEY': 'GEMINI_API_KEY',
};

// =============================================================================
// EDGE FUNCTION HELPER - Copy this to edge functions
// =============================================================================
/**
 * Get API key with fallback aliases (for edge functions)
 * 
 * Usage in edge functions:
 * ```typescript
 * const getApiKey = (primary: string, ...aliases: string[]): string | undefined => {
 *   const key = Deno.env.get(primary);
 *   if (key) return key;
 *   for (const alias of aliases) {
 *     const aliasKey = Deno.env.get(alias);
 *     if (aliasKey) return aliasKey;
 *   }
 *   return undefined;
 * };
 * 
 * // Get Gemini key (checks GEMINI_API_KEY first, then GOOGLE_API_KEY)
 * const geminiKey = getApiKey('GEMINI_API_KEY', 'GOOGLE_API_KEY');
 * 
 * // Get Claude key (checks ANTHROPIC_API_KEY first, then CLAUDE_API_KEY)
 * const claudeKey = getApiKey('ANTHROPIC_API_KEY', 'CLAUDE_API_KEY');
 * 
 * // Get Google OAuth Client ID (for YouTube, Calendar - SHARED)
 * const googleClientId = getApiKey('GOOGLE_CLIENT_ID', 'GOOGLE_API_KEY');
 * ```
 */
export const SECRET_KEY_DOCS = `
All secrets are stored in Supabase Edge Function secrets.
Access via: Deno.env.get('SECRET_NAME')

Configured secrets (25+ total):
- AI: OPENAI_API_KEY, ANTHROPIC_API_KEY, CLAUDE_API_KEY, GEMINI_API_KEY, GOOGLE_API_KEY
- Voice: ELEVENLABS_API_KEY, REPLICATE_API_TOKEN, HUGGING_FACE_ACCESS_TOKEN
- Comms: TWILIO_*, RESEND_API_KEY, SENDGRID_API_KEY
- Business: STRIPE_SECRET_KEY, DOCUSIGN_API_KEY
- Observability: ARIZE_API_KEY, LANGWATCH_API_KEY
- OAuth: GOOGLE_CLIENT_ID/SECRET (shared for YouTube, Calendar), LINKEDIN_CLIENT_ID/SECRET
`;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================
export function validateSecretExists(secretName: string): boolean {
  return Object.values(ALL_SECRET_KEYS).includes(secretName as any);
}

export function getCanonicalSecretName(alias: string): string {
  return SECRET_ALIASES[alias] || alias;
}

/**
 * Get the unified Google OAuth Client ID
 * This should be used by all Google OAuth flows (YouTube, Calendar, etc.)
 */
export function getGoogleOAuthClientId(): string {
  return OAUTH_KEYS.GOOGLE_CLIENT_ID;
}
