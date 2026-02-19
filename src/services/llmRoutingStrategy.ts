/**
 * LLM Regional Routing Strategy
 * 
 * Based on the 5-Zone Intelligent LLM Routing from:
 * "INTELLIGENT LLM ROUTING: Your Differentiation Strategy"
 * 
 * Competitors use ONE LLM for everything. We use the BEST LLM for each region/task.
 * 
 * 5 ROUTING ZONES:
 * 1. CLAUDE ZONE: US, UK, EU, Brazil, Israel, South Africa (Claude + ElevenLabs + DeepL)
 * 2. ALIBABA ZONE: Japan, Korea, China, HK, Taiwan, Singapore (Qwen + Qwen3-TTS + Qwen-MT) - CJK ONLY
 * 3. ARABIC ZONE: Saudi Arabia, UAE, Egypt, Morocco, Jordan, etc. (GPT-4o + Azure TTS + Azure Translator)
 * 4. GEMINI ZONE: India, Pakistan, SEA, Africa (Gemini + Azure + Google Translate)
 * 5. FALLBACK: GPT-4o (When primary fails)
 * 
 * ⚠️ KEY FINDING: Qwen struggles with Arabic - use GPT-4o instead (per AraBench)
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type LLMZone = 'claude' | 'alibaba' | 'arabic' | 'gemini' | 'fallback';

export interface LLMRoutingConfig {
  llm: string;
  llmFallback: string;
  tts: string;
  stt: string;
  translation: string;
  rtl: boolean;
  moat: string | null;
  reason: string;
}

export interface RegionRoute {
  region: string;
  countryCode: string;
  zone: LLMZone;
  config: LLMRoutingConfig;
}

// ============================================================================
// PROVIDER COSTS (per 1M tokens / per 1k chars)
// ============================================================================

export const PROVIDER_COSTS = {
  llm: {
    // Tier 3 - Premium
    'claude-3-5-sonnet': { cost: 15, unit: '1M tokens', tier: 'premium' },
    'claude-opus-4-5': { cost: 30, unit: '1M tokens', tier: 'premium' },
    'gpt-4o': { cost: 15, unit: '1M tokens', tier: 'premium' },
    'gpt-5': { cost: 25, unit: '1M tokens', tier: 'premium' },
    
    // Tier 2 - Advanced
    'qwen-max': { cost: 8, unit: '1M tokens', tier: 'advanced' },
    'qwen-plus': { cost: 5, unit: '1M tokens', tier: 'advanced' },
    'gemini-2.5-pro': { cost: 7, unit: '1M tokens', tier: 'advanced' },
    'deepseek-v3': { cost: 2, unit: '1M tokens', tier: 'advanced' },
    'deepseek-r1': { cost: 3, unit: '1M tokens', tier: 'advanced' },
    
    // Tier 1 - Standard
    'qwen-turbo': { cost: 2, unit: '1M tokens', tier: 'standard' },
    'gemini-flash': { cost: 3, unit: '1M tokens', tier: 'standard' },
    'gpt-4o-mini': { cost: 5, unit: '1M tokens', tier: 'standard' },
    'claude-haiku-4-5': { cost: 3, unit: '1M tokens', tier: 'standard' },
  },
  tts: {
    'elevenlabs': { cost: 0.30, unit: '1k chars', tier: 'premium' },
    'azure-neural': { cost: 0.016, unit: '1k chars', tier: 'advanced' },
    'alibaba-qwen3-tts': { cost: 0.02, unit: '1k chars', tier: 'advanced' },
    'google-tts': { cost: 0.016, unit: '1k chars', tier: 'standard' },
  },
  stt: {
    'whisper': { cost: 0.006, unit: 'minute', tier: 'advanced' },
    'alibaba-paraformer': { cost: 0, unit: 'minute', note: 'included with Qwen', tier: 'advanced' },
    'azure-stt': { cost: 0.016, unit: 'minute', tier: 'advanced' },
    'google-stt': { cost: 0.006, unit: 'minute', tier: 'standard' },
  },
  translation: {
    'deepl': { cost: 0.02, unit: '1k chars', tier: 'premium' },
    'qwen-mt': { cost: 0, unit: '1k chars', note: 'included with Qwen', tier: 'advanced' },
    'google-translate': { cost: 0.02, unit: '1k chars', tier: 'standard' },
    'azure-translator': { cost: 0.02, unit: '1k chars', tier: 'advanced' },
  },
};

// ============================================================================
// COMPLETE ROUTING TABLE (From Excel Strategy Document)
// ============================================================================

export const COMPLETE_ROUTING_TABLE: RegionRoute[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // CLAUDE ZONE: US, UK, EU, Brazil, Israel, South Africa
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Americas
  { region: 'US/Canada', countryCode: 'US', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Premium quality', reason: 'Claude reasoning + ElevenLabs quality' } },
  { region: 'US/Canada', countryCode: 'CA', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Premium quality', reason: 'Claude reasoning + ElevenLabs quality' } },
  
  // UK/Commonwealth
  { region: 'UK/Ireland', countryCode: 'GB', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Premium quality', reason: 'Claude handles British English nuances' } },
  { region: 'UK/Ireland', countryCode: 'IE', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Premium quality', reason: 'Claude handles British English nuances' } },
  { region: 'Australia/NZ', countryCode: 'AU', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Premium quality', reason: 'Same as UK' } },
  { region: 'Australia/NZ', countryCode: 'NZ', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Premium quality', reason: 'Same as UK' } },
  
  // Western Europe (⭐ = Regional LLM specialist gives MOAT)
  { region: 'Germany', countryCode: 'DE', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: '⭐ Best formal German', reason: 'Claude excels at German formal register' } },
  { region: 'France', countryCode: 'FR', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: '⭐ Best French nuance', reason: 'Claude best for French nuance' } },
  { region: 'Spain', countryCode: 'ES', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'ES-ES distinction', reason: 'DeepL best Spanish translation' } },
  { region: 'Italy', countryCode: 'IT', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Business Italian', reason: 'Claude + DeepL = best Italian' } },
  { region: 'Netherlands', countryCode: 'NL', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'DeepL best Dutch', reason: 'DeepL founded in Germany, best Dutch' } },
  { region: 'Belgium', countryCode: 'BE', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'DeepL best Dutch/French', reason: 'Claude + DeepL' } },
  { region: 'Austria', countryCode: 'AT', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'German formal', reason: 'Claude excels at German' } },
  { region: 'Switzerland', countryCode: 'CH', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Multilingual', reason: 'Claude + DeepL for DE/FR/IT' } },
  
  // Eastern Europe
  { region: 'Poland', countryCode: 'PL', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Polish grammar', reason: 'DeepL strong on Polish' } },
  { region: 'Russia', countryCode: 'RU', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Russian quality', reason: 'DeepL + Claude' } },
  { region: 'Portugal', countryCode: 'PT', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'PT-PT distinction', reason: 'PT-PT distinction' } },
  
  // Latin America (⭐ = Regional specialist)
  { region: 'Brazil', countryCode: 'BR', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: '⭐ PT-BR specific', reason: 'PT-BR specific, Claude understands' } },
  { region: 'Mexico', countryCode: 'MX', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'MX Spanish', reason: 'Latin American Spanish' } },
  { region: 'Argentina', countryCode: 'AR', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Rioplatense', reason: 'Rioplatense Spanish' } },
  { region: 'Colombia', countryCode: 'CO', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Colombian Spanish', reason: 'Colombian Spanish' } },
  { region: 'Chile', countryCode: 'CL', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Chilean Spanish', reason: 'Chilean Spanish' } },
  { region: 'Peru', countryCode: 'PE', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'elevenlabs', stt: 'whisper', translation: 'deepl', rtl: false, moat: 'Peruvian Spanish', reason: 'Peruvian Spanish' } },
  
  // Israel & South Africa (Claude Zone)
  { region: 'Israel', countryCode: 'IL', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'azure-translator', rtl: true, moat: 'Hebrew RTL', reason: 'Claude good Hebrew + RTL' } },
  { region: 'South Africa', countryCode: 'ZA', zone: 'claude', config: { llm: 'claude-3-5-sonnet', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Zulu/Xhosa', reason: 'English + Zulu/Xhosa' } },

  // ═══════════════════════════════════════════════════════════════════════════
  // ALIBABA ZONE: Japan, Korea, China, HK, Taiwan, MEA (Arabic)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // CJK Countries (⭐ = Regional specialist with MOAT)
  { region: 'Japan', countryCode: 'JP', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'alibaba-qwen3-tts', stt: 'alibaba-paraformer', translation: 'qwen-mt', rtl: false, moat: '⭐ Keigo handling', reason: 'Native CJK stack, keigo handling' } },
  { region: 'Korea', countryCode: 'KR', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'alibaba-qwen3-tts', stt: 'alibaba-paraformer', translation: 'qwen-mt', rtl: false, moat: '⭐ Honorifics', reason: 'Korean honorifics, number format' } },
  { region: 'China', countryCode: 'CN', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'alibaba-qwen3-tts', stt: 'alibaba-paraformer', translation: 'qwen-mt', rtl: false, moat: '⭐ Native Chinese', reason: 'Native Chinese, best quality' } },
  { region: 'Hong Kong', countryCode: 'HK', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'alibaba-qwen3-tts', stt: 'alibaba-paraformer', translation: 'qwen-mt', rtl: false, moat: 'Cantonese', reason: 'Cantonese support' } },
  { region: 'Taiwan', countryCode: 'TW', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'alibaba-qwen3-tts', stt: 'alibaba-paraformer', translation: 'qwen-mt', rtl: false, moat: 'Traditional ZH', reason: 'Traditional Chinese' } },
  
  // MEA Arabic Countries (⭐ = Regional specialist with MOAT)
  { region: 'Saudi Arabia', countryCode: 'SA', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'azure-translator', rtl: true, moat: '⭐ Najdi dialect', reason: 'Qwen strong Arabic + Najdi dialect' } },
  { region: 'UAE', countryCode: 'AE', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'azure-translator', rtl: true, moat: '⭐ Gulf dialect', reason: 'Qwen + Gulf Arabic' } },
  { region: 'Egypt', countryCode: 'EG', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'azure-translator', rtl: true, moat: '⭐ Egyptian dialect', reason: 'Egyptian Arabic dialect' } },
  { region: 'Morocco', countryCode: 'MA', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'azure-translator', rtl: true, moat: 'Maghrebi dialect', reason: 'Maghrebi dialect' } },
  { region: 'Algeria', countryCode: 'DZ', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'azure-translator', rtl: true, moat: 'Maghrebi dialect', reason: 'Algerian dialect' } },
  { region: 'Iraq', countryCode: 'IQ', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'azure-translator', rtl: true, moat: 'Iraqi dialect', reason: 'Iraqi dialect' } },
  { region: 'Jordan', countryCode: 'JO', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'azure-translator', rtl: true, moat: 'Levantine dialect', reason: 'Levantine dialect' } },
  { region: 'Lebanon', countryCode: 'LB', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'azure-translator', rtl: true, moat: 'Levantine dialect', reason: 'Levantine dialect' } },
  { region: 'Kuwait', countryCode: 'KW', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'azure-translator', rtl: true, moat: 'Gulf dialect', reason: 'Gulf Arabic' } },
  { region: 'Qatar', countryCode: 'QA', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'azure-translator', rtl: true, moat: 'Gulf dialect', reason: 'Gulf Arabic' } },
  { region: 'Bahrain', countryCode: 'BH', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'azure-translator', rtl: true, moat: 'Gulf dialect', reason: 'Gulf Arabic' } },
  { region: 'Oman', countryCode: 'OM', zone: 'alibaba', config: { llm: 'qwen-max', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'azure-translator', rtl: true, moat: 'Gulf dialect', reason: 'Gulf Arabic' } },

  // ═══════════════════════════════════════════════════════════════════════════
  // GEMINI ZONE: India, Pakistan, SEA, Africa
  // ═══════════════════════════════════════════════════════════════════════════
  
  // India/Pakistan/Bangladesh (⭐ = Regional specialist with MOAT)
  { region: 'India', countryCode: 'IN', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: '⭐ 22 languages', reason: 'Google invested in 22 Indian langs' } },
  { region: 'Pakistan', countryCode: 'PK', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: true, moat: 'Urdu + RTL', reason: 'Urdu support' } },
  { region: 'Bangladesh', countryCode: 'BD', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Bengali', reason: 'Bengali support' } },
  { region: 'Sri Lanka', countryCode: 'LK', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Sinhala/Tamil', reason: 'Sinhala/Tamil support' } },
  { region: 'Nepal', countryCode: 'NP', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Nepali', reason: 'Nepali support' } },
  
  // Southeast Asia (⭐ = Regional specialist)
  { region: 'Indonesia', countryCode: 'ID', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: '⭐ Bahasa Indo', reason: 'Strong Bahasa Indonesia' } },
  { region: 'Vietnam', countryCode: 'VN', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Vietnamese', reason: 'Vietnamese tones' } },
  { region: 'Thailand', countryCode: 'TH', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Thai', reason: 'Thai script' } },
  { region: 'Philippines', countryCode: 'PH', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Filipino', reason: 'Filipino/Tagalog' } },
  { region: 'Malaysia', countryCode: 'MY', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Malay', reason: 'Malay support' } },
  { region: 'Singapore', countryCode: 'SG', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Multilingual', reason: 'English + Mandarin + Malay + Tamil' } },
  { region: 'Myanmar', countryCode: 'MM', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Burmese', reason: 'Burmese support' } },
  { region: 'Cambodia', countryCode: 'KH', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Khmer', reason: 'Khmer support' } },
  
  // Africa (⭐ = FIRST MOVER - MOAT)
  { region: 'Nigeria', countryCode: 'NG', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: '⭐ Yoruba/Hausa/Igbo', reason: 'Yoruba, Hausa, Igbo' } },
  { region: 'Kenya', countryCode: 'KE', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: '⭐ Swahili', reason: 'Swahili' } },
  { region: 'Tanzania', countryCode: 'TZ', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Swahili', reason: 'Swahili' } },
  { region: 'Ethiopia', countryCode: 'ET', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Amharic', reason: 'Amharic' } },
  { region: 'Ghana', countryCode: 'GH', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Akan/Twi', reason: 'Akan/Twi' } },
  { region: 'Uganda', countryCode: 'UG', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Luganda/Swahili', reason: 'Luganda/Swahili' } },
  { region: 'Rwanda', countryCode: 'RW', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Kinyarwanda', reason: 'Kinyarwanda' } },
  { region: 'Senegal', countryCode: 'SN', zone: 'gemini', config: { llm: 'gemini-2.5-pro', llmFallback: 'gpt-4o', tts: 'azure-neural', stt: 'whisper', translation: 'google-translate', rtl: false, moat: 'Wolof/French', reason: 'Wolof/French' } },
];

// ============================================================================
// ZONE SUMMARY
// ============================================================================

export const ZONE_SUMMARY = {
  claude: {
    name: 'Claude Zone',
    llm: 'claude-3-5-sonnet',
    regions: ['US', 'UK', 'EU', 'Brazil', 'Israel', 'South Africa'],
    providers: 'Claude + ElevenLabs + DeepL',
    color: 'bg-blue-500',
    costPer1M: 15,
  },
  alibaba: {
    name: 'Alibaba Zone',
    llm: 'qwen-max',
    regions: ['Japan', 'Korea', 'China', 'HK', 'Taiwan', 'MEA (Arabic)'],
    providers: 'Qwen + Qwen3-TTS + Qwen-MT',
    color: 'bg-orange-500',
    costPer1M: 8,
  },
  gemini: {
    name: 'Gemini Zone',
    llm: 'gemini-2.5-pro',
    regions: ['India', 'Pakistan', 'SEA', 'Africa'],
    providers: 'Gemini + Azure + Google Translate',
    color: 'bg-green-500',
    costPer1M: 7,
  },
  fallback: {
    name: 'Fallback',
    llm: 'gpt-4o',
    regions: ['When primary fails'],
    providers: 'OpenAI stack',
    color: 'bg-gray-500',
    costPer1M: 15,
  },
};

// ============================================================================
// REGIONAL CONTEXT PROMPTS (Secret Sauce)
// ============================================================================

export const REGIONAL_CONTEXT_PROMPTS: Record<string, string> = {
  // Germany
  'DE': 'Generate in German. Use formal Sie register for business. Use standard German business terminology.',
  
  // France
  'FR': 'Generate in French. Use subjunctive where appropriate. Maintain elegant phrasing.',
  
  // Japan
  'JP': 'Generate in Japanese. Use keigo level: ビジネス敬語 for business contexts.',
  
  // Korea
  'KR': 'Generate in Korean. Use 존댓말 (formal). Format numbers using 만/억 system.',
  
  // Saudi Arabia
  'SA': 'Generate in Arabic (Najdi/Saudi dialect). Use appropriate Gulf expressions.',
  
  // Egypt
  'EG': 'Generate in Arabic (Egyptian dialect). Use Egyptian colloquialisms where appropriate.',
  
  // India
  'IN': 'Generate in Hindi. Hinglish mixing acceptable for casual content. Use शुद्ध हिंदी for formal.',
  
  // Brazil
  'BR': 'Generate in Brazilian Portuguese. Use você, not tu. Use Brazilian vocabulary (ônibus not autocarro).',
  
  // Nigeria
  'NG': 'Generate in English with Nigerian context. Option for Yoruba/Hausa/Igbo available.',
  
  // Default
  'default': 'Generate content appropriate for the target region and language.',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get LLM routing config for a country code
 */
export function getLLMRouteByCountry(countryCode: string): RegionRoute | null {
  const route = COMPLETE_ROUTING_TABLE.find(r => r.countryCode === countryCode);
  if (route) return route;
  
  // Default fallback
  return {
    region: 'Global',
    countryCode: countryCode,
    zone: 'fallback',
    config: {
      llm: 'gpt-4o',
      llmFallback: 'claude-3-5-sonnet',
      tts: 'azure-neural',
      stt: 'whisper',
      translation: 'google-translate',
      rtl: false,
      moat: null,
      reason: 'Default fallback routing',
    },
  };
}

/**
 * Get zone for a country
 */
export function getZoneByCountry(countryCode: string): LLMZone {
  const route = COMPLETE_ROUTING_TABLE.find(r => r.countryCode === countryCode);
  return route?.zone || 'fallback';
}

/**
 * Get all countries in a zone
 */
export function getCountriesByZone(zone: LLMZone): RegionRoute[] {
  return COMPLETE_ROUTING_TABLE.filter(r => r.zone === zone);
}

/**
 * Get regional context prompt for a country
 */
export function getRegionalPrompt(countryCode: string): string {
  return REGIONAL_CONTEXT_PROMPTS[countryCode] || REGIONAL_CONTEXT_PROMPTS['default'];
}

/**
 * Select LLM based on region
 */
export function selectLLM(region: string): { llm: string; fallback: string } {
  const claudeZone = ['US', 'UK', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'PL', 'BR', 'MX', 'AR', 'IL', 'ZA', 'GB', 'IE', 'CA', 'NZ', 'BE', 'AT', 'CH', 'RU'];
  const alibabaZone = ['JP', 'KR', 'CN', 'HK', 'TW', 'SA', 'AE', 'EG', 'MA', 'IQ', 'JO', 'LB', 'KW', 'QA', 'BH', 'OM', 'DZ'];
  const geminiZone = ['IN', 'PK', 'BD', 'ID', 'VN', 'TH', 'PH', 'MY', 'NG', 'KE', 'ET', 'GH', 'TZ', 'UG', 'RW', 'SN', 'SG', 'MM', 'KH', 'LK', 'NP'];
  
  if (claudeZone.includes(region)) {
    return { llm: 'claude-3-5-sonnet', fallback: 'gpt-4o' };
  }
  if (alibabaZone.includes(region)) {
    return { llm: 'qwen-max', fallback: 'gpt-4o' };
  }
  if (geminiZone.includes(region)) {
    return { llm: 'gemini-2.5-pro', fallback: 'gpt-4o' };
  }
  
  return { llm: 'gpt-4o', fallback: 'claude-3-5-sonnet' };
}

/**
 * Select TTS provider based on region
 */
export function selectTTS(region: string): string {
  const elevenLabsRegions = ['US', 'UK', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'PL', 'BR', 'MX', 'AR', 'RU', 'GB', 'IE', 'CA', 'NZ', 'BE', 'AT', 'CH', 'CO', 'CL', 'PE'];
  const qwen3TTSRegions = ['JP', 'KR', 'CN', 'HK', 'TW'];
  
  if (elevenLabsRegions.includes(region)) {
    return 'elevenlabs';
  }
  if (qwen3TTSRegions.includes(region)) {
    return 'alibaba-qwen3-tts';
  }
  
  return 'azure-neural';
}

/**
 * Select Translation provider based on source/target language and region
 */
export function selectTranslation(targetLang: string, region: string): string {
  const deeplLangs = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pt', 'pl', 'ru', 'ja', 'zh'];
  const arabicRegions = ['SA', 'AE', 'EG', 'MA', 'IQ', 'JO', 'LB', 'KW', 'QA', 'BH', 'OM', 'DZ'];
  const cjkLangs = ['zh', 'ja', 'ko'];
  
  // DeepL for European languages (best quality)
  if (deeplLangs.includes(targetLang) && !arabicRegions.includes(region)) {
    return 'deepl';
  }
  
  // Qwen-MT for CJK (native quality)
  if (cjkLangs.includes(targetLang)) {
    return 'qwen-mt';
  }
  
  // Azure for Arabic (dialect support)
  if (targetLang === 'ar') {
    return 'azure-translator';
  }
  
  // Google for everything else
  return 'google-translate';
}

/**
 * Get all moat languages with their advantages
 */
export function getMoatLanguages(): RegionRoute[] {
  return COMPLETE_ROUTING_TABLE.filter(r => r.config.moat && r.config.moat.startsWith('⭐'));
}

/**
 * Calculate estimated monthly cost based on usage
 */
export function calculateMonthlyCost(zone: LLMZone, usersCount: number): number {
  const costPer100Users: Record<LLMZone, number> = {
    claude: 150,
    alibaba: 80,
    arabic: 120, // GPT-4o based - higher cost than Alibaba but lower than Claude
    gemini: 70,
    fallback: 30,
  };
  
  return (usersCount / 100) * costPer100Users[zone];
}

export default {
  COMPLETE_ROUTING_TABLE,
  ZONE_SUMMARY,
  PROVIDER_COSTS,
  REGIONAL_CONTEXT_PROMPTS,
  getLLMRouteByCountry,
  getZoneByCountry,
  getCountriesByZone,
  getRegionalPrompt,
  selectLLM,
  selectTTS,
  selectTranslation,
  getMoatLanguages,
  calculateMonthlyCost,
};
