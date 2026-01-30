/**
 * UNIFIED API KEY UTILITIES FOR EDGE FUNCTIONS
 * 
 * Copy this file or its functions into edge functions that need API key access.
 * This ensures consistent key retrieval with fallback aliases.
 * 
 * @see src/shared/config/secret-keys.ts for the frontend version
 */

// =============================================================================
// CORE KEY RETRIEVAL FUNCTION
// =============================================================================
/**
 * Get an API key with fallback aliases
 * Checks primary key first, then falls back to aliases in order
 */
export function getApiKey(primary: string, ...aliases: string[]): string | undefined {
  const key = Deno.env.get(primary);
  if (key) return key;
  
  for (const alias of aliases) {
    const aliasKey = Deno.env.get(alias);
    if (aliasKey) return aliasKey;
  }
  
  return undefined;
}

// =============================================================================
// AI PROVIDER HELPERS
// =============================================================================
export function getGeminiKey(): string | undefined {
  return getApiKey('GEMINI_API_KEY', 'GOOGLE_API_KEY');
}

export function getOpenAIKey(): string | undefined {
  return getApiKey('OPENAI_API_KEY');
}

export function getClaudeKey(): string | undefined {
  return getApiKey('ANTHROPIC_API_KEY', 'CLAUDE_API_KEY');
}

export function getElevenLabsKey(): string | undefined {
  return getApiKey('ELEVENLABS_API_KEY');
}

export function getReplicateToken(): string | undefined {
  return getApiKey('REPLICATE_API_TOKEN');
}

// =============================================================================
// OAUTH HELPERS - UNIFIED ACROSS ALL EDGE FUNCTIONS
// =============================================================================
/**
 * Get Google OAuth Client ID - SINGLE SOURCE for all OAuth flows
 * Uses GOOGLE_CLIENT_ID (OAuth) with fallback to GOOGLE_API_KEY
 */
export function getGoogleClientId(): string | undefined {
  return getApiKey('GOOGLE_CLIENT_ID', 'GOOGLE_API_KEY');
}

export function getGoogleClientSecret(): string | undefined {
  return getApiKey('GOOGLE_CLIENT_SECRET');
}

export function getLinkedInCredentials() {
  return {
    clientId: Deno.env.get('LINKEDIN_CLIENT_ID'),
    clientSecret: Deno.env.get('LINKEDIN_CLIENT_SECRET'),
  };
}

export function getYouTubeCredentials() {
  return {
    clientId: getGoogleClientId(), // Reuse Google OAuth
    clientSecret: getGoogleClientSecret(),
    apiKey: Deno.env.get('YOUTUBE_API_KEY') || getApiKey('GOOGLE_API_KEY'),
  };
}

// =============================================================================
// COMMUNICATION HELPERS
// =============================================================================
export function getTwilioCredentials() {
  return {
    accountSid: Deno.env.get('TWILIO_ACCOUNT_SID'),
    authToken: Deno.env.get('TWILIO_AUTH_TOKEN'),
    phoneNumber: Deno.env.get('TWILIO_PHONE_NUMBER'),
    whatsappNumber: Deno.env.get('TWILIO_WHATSAPP_NUMBER'),
  };
}

export function getResendKey(): string | undefined {
  return getApiKey('RESEND_API_KEY');
}

export function getSendGridKey(): string | undefined {
  return getApiKey('SENDGRID_API_KEY');
}

// =============================================================================
// UNIFIED AI PROVIDER CONFIG
// =============================================================================
export interface AIProviderConfig {
  name: string;
  model: string;
  apiKey: string | undefined;
  available: boolean;
  tier: 'primary' | 'backup' | 'fallback';
}

// Gemini model configurations
export const GEMINI_MODELS = {
  // Primary - Quality-critical tasks
  GEMINI_3_FLASH: 'gemini-3.0-flash-preview',
  GEMINI_2_5_PRO: 'gemini-2.5-pro-preview-05-06',
  // Backup - Speed/cost-optimized  
  GEMINI_2_FLASH: 'gemini-2.0-flash',
  GEMINI_2_FLASH_LITE: 'gemini-2.0-flash-lite',
  // Vision/Image
  IMAGEN_3: 'imagen-3.0-generate-001',
  // Video
  VEO_2: 'veo-002',
  VEO_1: 'veo-001',
} as const;

/**
 * Get all available AI providers with their configurations
 * Use this to implement provider fallback in edge functions
 */
export function getAIProviders(): Record<string, AIProviderConfig> {
  const geminiKey = getGeminiKey();
  const openaiKey = getOpenAIKey();
  const claudeKey = getClaudeKey();
  
  return {
    // Primary: Gemini 3.0 Flash (quality-critical)
    gemini_primary: {
      name: 'Google Gemini 3.0 Flash',
      model: GEMINI_MODELS.GEMINI_3_FLASH,
      apiKey: geminiKey,
      available: !!geminiKey,
      tier: 'primary',
    },
    // Backup: Gemini 2.0 Flash (speed-optimized)
    gemini_backup: {
      name: 'Google Gemini 2.0 Flash',
      model: GEMINI_MODELS.GEMINI_2_FLASH,
      apiKey: geminiKey,
      available: !!geminiKey,
      tier: 'backup',
    },
    openai: {
      name: 'OpenAI GPT',
      model: 'gpt-4o-mini',
      apiKey: openaiKey,
      available: !!openaiKey,
      tier: 'fallback',
    },
    claude: {
      name: 'Anthropic Claude',
      model: 'claude-3-5-haiku-20241022',
      apiKey: claudeKey,
      available: !!claudeKey,
      tier: 'fallback',
    },
  };
}

/**
 * Get the first available AI provider by tier priority
 * Priority: primary (Gemini 3.0) -> backup (Gemini 2.0) -> fallback (OpenAI/Claude)
 */
export function getFirstAvailableProvider(): AIProviderConfig | null {
  const providers = getAIProviders();
  
  // Priority order: Gemini 3.0 (primary) -> Gemini 2.0 (backup) -> OpenAI -> Claude
  const priorityOrder = ['gemini_primary', 'gemini_backup', 'openai', 'claude'];
  
  for (const providerId of priorityOrder) {
    const provider = providers[providerId];
    if (provider.available) {
      return provider;
    }
  }
  
  return null;
}

/**
 * Get Gemini model by use case
 * @param useCase - 'quality' for complex tasks, 'speed' for simple/fast tasks
 */
export function getGeminiModel(useCase: 'quality' | 'speed' = 'quality'): string {
  return useCase === 'quality' 
    ? GEMINI_MODELS.GEMINI_3_FLASH 
    : GEMINI_MODELS.GEMINI_2_FLASH;
}

/**
 * Get video generation model
 */
export function getVideoModel(): string {
  return GEMINI_MODELS.VEO_2;
}

/**
 * Get image generation model  
 */
export function getImageModel(): string {
  return GEMINI_MODELS.IMAGEN_3;
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================
export function requireApiKey(keyName: string): string {
  const key = Deno.env.get(keyName);
  if (!key) {
    throw new Error(`Required API key ${keyName} is not configured`);
  }
  return key;
}

export function requireGeminiKey(): string {
  const key = getGeminiKey();
  if (!key) {
    throw new Error('Gemini API key not configured (checked GEMINI_API_KEY and GOOGLE_API_KEY)');
  }
  return key;
}

export function requireClaudeKey(): string {
  const key = getClaudeKey();
  if (!key) {
    throw new Error('Claude API key not configured (checked ANTHROPIC_API_KEY and CLAUDE_API_KEY)');
  }
  return key;
}
