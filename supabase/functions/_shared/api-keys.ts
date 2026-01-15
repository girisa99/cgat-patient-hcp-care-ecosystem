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
}

/**
 * Get all available AI providers with their configurations
 * Use this to implement provider fallback in edge functions
 */
export function getAIProviders(): Record<string, AIProviderConfig> {
  const geminiKey = getGeminiKey();
  const openaiKey = getOpenAIKey();
  const claudeKey = getClaudeKey();
  
  return {
    gemini: {
      name: 'Google Gemini',
      model: 'gemini-2.0-flash',
      apiKey: geminiKey,
      available: !!geminiKey,
    },
    openai: {
      name: 'OpenAI GPT',
      model: 'gpt-4o-mini',
      apiKey: openaiKey,
      available: !!openaiKey,
    },
    claude: {
      name: 'Anthropic Claude',
      model: 'claude-3-5-haiku-20241022',
      apiKey: claudeKey,
      available: !!claudeKey,
    },
  };
}

/**
 * Get the first available AI provider
 * Returns the provider config with API key, or null if none available
 */
export function getFirstAvailableProvider(): AIProviderConfig | null {
  const providers = getAIProviders();
  
  // Priority order: Gemini (fastest) -> OpenAI -> Claude
  const priorityOrder = ['gemini', 'openai', 'claude'];
  
  for (const providerId of priorityOrder) {
    const provider = providers[providerId];
    if (provider.available) {
      return provider;
    }
  }
  
  return null;
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
