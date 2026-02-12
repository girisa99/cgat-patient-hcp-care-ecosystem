/**
 * CENTRALIZED REGIONAL ROUTING REGISTRY
 * Single source of truth for all LLM, TTS, voice, language, and zone mappings across 82+ regions.
 * 
 * CROSS-PLATFORM: Used by Genie Cast, Genie Deck, Landing Pages, IP Detection, and Demos.
 * ALL routing decisions MUST import from this file — no hardcoded zone logic elsewhere.
 * 
 * Structure:
 * - REGION_LLM_ROUTING: Parent-level LLM providers + fallback chains
 * - getZoneAIProviders(): Sub-region AI provider options with hybrid overrides
 * - getRegionVoiceOptions(): Regional voice selections per TTS provider
 * - getZoneFromLanguage(): Language code → zone mapping
 * - getZoneFromRegion(): Region string → zone mapping
 * - getZoneFromCountry(): ISO country code → zone mapping
 * - isRTLLanguage(): RTL script detection
 * - toLangBCP47(): Short lang code → BCP47 locale
 * 
 * Alignment:
 * - Master Provider Routing Registry (v6)
 * - EU, LATAM, NAM, Oceania, Turkey: Claude 4 (Anthropic)
 * - CJK, MENA_GULF, MENA_MSA: Qwen Max (Alibaba)
 * - India, SEA, Africa, Bangladesh: Gemini 3 Pro
 * - Pakistan, Caribbean, Eastern Europe, Central Asia: GPT-4o (OpenAI)
 * - DeepSeek: Fallback chain only (never primary)
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. LLM ROUTING — Parent-level regions with fallback chains
// ═══════════════════════════════════════════════════════════════════════════

export interface LLMRoute {
  provider: string;
  model: string;
  fallback: string; // Format: "provider1 → provider2 → provider3"
}

/**
 * Primary LLM routing for parent regions (English base adaptation + transcreation)
 * Fallback chains ensure automatic escalation if primary unavailable
 */
export const REGION_LLM_ROUTING: Record<string, LLMRoute> = {
   'latam': { provider: 'anthropic', model: 'claude-sonnet-4-20250514', fallback: 'openai/gpt-4o → deepseek → gemini' },
   'eu': { provider: 'anthropic', model: 'claude-sonnet-4-20250514', fallback: 'openai/gpt-4o → deepseek → gemini' },
   'nam': { provider: 'anthropic', model: 'claude-sonnet-4-20250514', fallback: 'openai/gpt-4o → gemini → deepseek' },
   'mena': { provider: 'alibaba', model: 'qwen-max', fallback: 'openai/gpt-4o → claude → deepseek' },
   'india': { provider: 'gemini', model: 'gemini-2.5-pro', fallback: 'openai/gpt-4o → claude → deepseek' },
   'sea': { provider: 'gemini', model: 'gemini-2.5-pro', fallback: 'claude → openai/gpt-4o → deepseek' },
   'africa': { provider: 'gemini', model: 'gemini-2.5-pro', fallback: 'claude → openai/gpt-4o → deepseek' },
   'cjk': { provider: 'alibaba', model: 'qwen-max', fallback: 'openai/gpt-4o → claude → deepseek' },
   'pakistan': { provider: 'openai', model: 'gpt-4o', fallback: 'claude → gemini → deepseek' },
   'bangladesh': { provider: 'gemini', model: 'gemini-2.5-pro', fallback: 'openai/gpt-4o → claude → deepseek' },
   // P0: Oceania & Turkey
   'oceania': { provider: 'anthropic', model: 'claude-sonnet-4-20250514', fallback: 'openai/gpt-4o → gemini → deepseek' },
   'turkey': { provider: 'anthropic', model: 'claude-sonnet-4-20250514', fallback: 'openai/gpt-4o → deepseek → gemini' },
   // P1: Extended Caribbean & Eastern Europe
   'caribbean': { provider: 'openai', model: 'gpt-4o', fallback: 'claude → gemini → deepseek' },
   'eastern_europe': { provider: 'openai', model: 'gpt-4o', fallback: 'claude → deepseek → gemini' },
   'central_asia': { provider: 'openai', model: 'gpt-4o', fallback: 'claude → gemini → deepseek' },
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. AI PROVIDER OPTIONS — Sub-region routing with hybrid overrides
// ═══════════════════════════════════════════════════════════════════════════

export interface AIProviderOption {
  id: string;
  name: string;
  model: string;
  zone: string;
  isRecommended: boolean;
  reason: string;
}

/**
 * Zone mapping: determines default primary provider per region category
 * Sub-region overrides can override these defaults for specific countries/languages
 */
const ZONE_PRIMARY_MAP: Record<string, string> = {
   western: 'claude',
   cjk: 'alibaba',
   mena: 'openai',
   pakistan: 'openai',
   bangladesh: 'gemini',
   india: 'gemini',
   africa: 'gemini',
   oceania: 'claude',
   turkey: 'claude',
   caribbean: 'openai',
   eastern_europe: 'openai',
   central_asia: 'openai',
};

/**
 * Sub-region hybrid overrides: where primary differs from zone default
 * Enables country-specific or language-specific provider selection
 */
const SUB_REGION_OVERRIDES: Record<string, string> = {
   // MENA hybrid
   'MENA_GULF': 'alibaba',
   'MENA_EGYPT': 'openai',
   'MENA_LEVANT': 'openai',
   'MENA_MAGHREB': 'claude',
   'MENA_MSA': 'alibaba',
   // EU hybrid — Nordic/Eastern use Claude (per v5 routing)
   'EU_NORDIC': 'claude',
   'EU_EAST': 'claude',
   'EU_FI': 'openai', // Finnish: GPT-4o for superior morphology handling
   // LATAM hybrid — Andean/Caribbean use GPT-4o
   'LATAM_ANDEAN': 'openai',
   'LATAM_CARIB': 'openai',
   // P0: Oceania
   'OCEANIA_AU': 'claude',
   'OCEANIA_NZ': 'claude',
   // P1: Extended regions
   'CARIBBEAN_EN': 'openai',
   'CARIBBEAN_FR': 'openai',
   'EU_UKRAINE': 'openai',
   'EU_BALKANS': 'openai',
   'EU_CAUCASUS': 'openai',
   'ASIA_CENTRAL': 'openai',
};

/**
 * Sub-region fallback order: controls sort order for provider recommendations
 * Primary provider is injected first, then fallback chain follows this order
 */
const SUB_REGION_FALLBACK_ORDER: Record<string, string[]> = {
   // NAM
   'NAM_US': ['claude', 'openai', 'gemini', 'alibaba', 'deepseek'],
   'NAM_CA': ['claude', 'openai', 'gemini', 'alibaba', 'deepseek'],
   // EU
   'EU_WEST': ['claude', 'openai', 'gemini', 'alibaba', 'deepseek'],
   'EU_DE': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
   'EU_AT': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
   'EU_CH': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
   'EU_DACH': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
   'EU_FR': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
   'EU_BE_FR': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
   'EU_FRANCE': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
   'EU_ES': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
   'EU_PT': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
   'EU_IBERIA': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
   'EU_SE': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
   'EU_NO': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
   'EU_DK': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
   'EU_FI': ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
   'EU_NORDIC': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
   'EU_PL': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
   'EU_CZ': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
   'EU_RO': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
   'EU_HU': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
   'EU_EAST': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
   // P1: Extended Eastern Europe
   'EU_UKRAINE': ['openai', 'claude', 'deepseek', 'gemini', 'alibaba'],
   'EU_BALKANS': ['openai', 'claude', 'deepseek', 'gemini', 'alibaba'],
   'EU_CAUCASUS': ['openai', 'claude', 'deepseek', 'gemini', 'alibaba'],
   // LATAM
   'LATAM_BRAZIL': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
   'LATAM_MEXICO': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
   'LATAM_ANDEAN': ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
   'LATAM_CONESUR': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
   'LATAM_CARIB': ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
   // P1: Extended Caribbean
   'CARIBBEAN_EN': ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
   'CARIBBEAN_FR': ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
   // Africa
   'AFRICA_WEST': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'AFRICA_EAST': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'AFRICA_SOUTH': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
   'AFRICA_FRANCO': ['gemini', 'alibaba', 'openai', 'claude', 'deepseek'],
   // Pakistan & Bangladesh
   'PAKISTAN': ['openai', 'gemini', 'claude', 'alibaba', 'deepseek'],
   'BANGLADESH': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   // India
   'INDIA_NORTH': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'INDIA_SOUTH': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'INDIA_WEST': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
   'INDIA_EAST': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'INDIA_PAN': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
   'INDIA_NORTH_HI': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'INDIA_NORTH_UR': ['openai', 'gemini', 'claude', 'alibaba', 'deepseek'],
   'INDIA_NORTH_PA': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'INDIA_SOUTH_TA': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'INDIA_SOUTH_TE': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'INDIA_SOUTH_KN': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'INDIA_SOUTH_ML': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'INDIA_WEST_MR': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
   'INDIA_WEST_GU': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
   'INDIA_EAST_BN': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'INDIA_EAST_OR': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'INDIA_PAN_EN': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
   // SEA
   'SEA_MALAY': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'SEA_THAI': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'SEA_VIET': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
   'SEA_PHIL': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
   'SEA_PAN': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
   // P0: Oceania
   'OCEANIA_AU': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
   'OCEANIA_NZ': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
   // P1: Central Asia & Turkey
   'ASIA_CENTRAL_KZ': ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
   'ASIA_CENTRAL_UZ': ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
   'ASIA_CENTRAL_AZ': ['openai', 'claude', 'deepseek', 'gemini', 'alibaba'],
   'ASIA_CENTRAL_AM': ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
   'ASIA_CENTRAL_GE': ['openai', 'claude', 'deepseek', 'gemini', 'alibaba'],
   'TURKEY': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
   // CJK
   'CJK_CN': ['alibaba', 'openai', 'gemini', 'claude', 'deepseek'],
   'CJK_JP': ['alibaba', 'openai', 'claude', 'gemini', 'deepseek'],
   'CJK_KR': ['alibaba', 'openai', 'claude', 'gemini', 'deepseek'],
   'CJK_TW': ['alibaba', 'claude', 'openai', 'gemini', 'deepseek'],
   // MENA
   'MENA_GULF': ['alibaba', 'openai', 'claude', 'gemini', 'deepseek'],
   'MENA_EGYPT': ['openai', 'alibaba', 'claude', 'gemini', 'deepseek'],
   'MENA_LEVANT': ['openai', 'alibaba', 'claude', 'gemini', 'deepseek'],
   'MENA_MAGHREB': ['claude', 'openai', 'alibaba', 'gemini', 'deepseek'],
   'MENA_MSA': ['alibaba', 'claude', 'openai', 'gemini', 'deepseek'],
};

/**
 * Returns AI providers ranked by zone routing with recommended one first
 * Follows master provider routing registry with hybrid sub-region overrides
 */
export function getZoneAIProviders(regionCode: string): AIProviderOption[] {
  const r = regionCode?.toUpperCase();
  
  // Determine zone for fallback selection
  const zone = (() => {
    if (r?.startsWith('NAM')) return 'western';
    if (r?.startsWith('EU')) return 'western';
    if (r?.startsWith('LATAM')) return 'western';
    if (r?.startsWith('CJK')) return 'cjk';
    if (r?.startsWith('MENA')) return 'mena';
    if (['PAKISTAN'].includes(r)) return 'pakistan';
    if (['BANGLADESH'].includes(r)) return 'bangladesh';
    if (r?.startsWith('SEA')) return 'india';
    if (r?.startsWith('INDIA')) return 'india';
    if (r?.startsWith('AFRICA')) return 'africa';
    if (r?.startsWith('OCEANIA')) return 'oceania';
    if (r === 'TURKEY') return 'turkey';
    if (r?.startsWith('CARIBBEAN')) return 'caribbean';
    if (r?.startsWith('EURASIA') || r === 'EU_UKRAINE' || r === 'EU_BALKANS' || r === 'EU_CAUCASUS') return 'eastern_europe';
    if (r?.startsWith('ASIA_CENTRAL') || r?.startsWith('CENTRAL_ASIA')) return 'central_asia';
    return 'western';
  })();

  const providers: AIProviderOption[] = [
    { id: 'claude', name: 'Claude 4', model: 'claude-4', zone: 'western', isRecommended: false, reason: 'Best for Western/EU/LATAM copywriting — nuanced tone, cultural context' },
    { id: 'alibaba', name: 'Qwen Max', model: 'qwen-max', zone: 'cjk', isRecommended: false, reason: 'Best for CJK & formal Arabic — native dialect handling, cultural adaptation' },
    { id: 'gemini', name: 'Gemini 3 Pro', model: 'gemini-3-pro', zone: 'india', isRecommended: false, reason: 'Best for India/SEA/Africa/Bangladesh — multilingual, strong regional context' },
    { id: 'openai', name: 'GPT-4o', model: 'gpt-4o', zone: 'fallback', isRecommended: false, reason: 'Strong Arabic dialects, Nordic/Eastern EU — reliable all-rounder' },
    { id: 'deepseek', name: 'DeepSeek V3', model: 'deepseek-v3', zone: 'fallback', isRecommended: false, reason: 'Cost-effective alternative — good for bulk script generation' },
  ];

  const recommended = SUB_REGION_OVERRIDES[r] || ZONE_PRIMARY_MAP[zone] || 'claude';
  const fallbackOrder = SUB_REGION_FALLBACK_ORDER[r];
  
  return providers
    .map(p => ({ ...p, isRecommended: p.id === recommended }))
    .sort((a, b) => {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      if (fallbackOrder) {
        return fallbackOrder.indexOf(a.id) - fallbackOrder.indexOf(b.id);
      }
      return 0;
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. TTS VOICE OPTIONS — Regional voice selections with locales
// ═══════════════════════════════════════════════════════════════════════════

export interface VoiceOption {
  provider: string;
  locale: string;
  label: string;
  voiceId: string;
  voiceName: string;
  gender: 'female' | 'male';
  isDefault?: boolean;
}

/**
 * Regional voice mappings: provider + locale + voice IDs (Azure Neural + Qwen3-TTS)
 * All regions have minimum 2 voices (male + female)
 * CJK uses Qwen3-TTS; all others use Azure Neural
 */
export const REGION_VOICE_OPTIONS: Record<string, VoiceOption[]> = {
  // NAM
  'NAM_US': [
    { provider: 'azure', locale: 'en-US', label: 'Azure Neural', voiceId: 'en-US-JennyNeural', voiceName: 'Jenny (US English)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'en-US', label: 'Azure Neural', voiceId: 'en-US-GuyNeural', voiceName: 'Guy (US English)', gender: 'male' },
    { provider: 'azure', locale: 'en-US', label: 'Azure Neural', voiceId: 'en-US-AriaNeural', voiceName: 'Aria (US English)', gender: 'female' },
    { provider: 'azure', locale: 'en-US', label: 'Azure Neural', voiceId: 'en-US-DavisNeural', voiceName: 'Davis (US English)', gender: 'male' },
    { provider: 'azure', locale: 'en-US', label: 'Azure Neural', voiceId: 'en-US-SaraNeural', voiceName: 'Sara (US English)', gender: 'female' },
  ],
  'NAM_CA': [
    { provider: 'azure', locale: 'en-CA', label: 'Azure Neural', voiceId: 'en-CA-ClaraNeural', voiceName: 'Clara (Canadian English)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'en-CA', label: 'Azure Neural', voiceId: 'en-CA-LiamNeural', voiceName: 'Liam (Canadian English)', gender: 'male' },
    { provider: 'azure', locale: 'fr-CA', label: 'Azure Neural', voiceId: 'fr-CA-SylvieNeural', voiceName: 'Sylvie (Canadian French)', gender: 'female' },
    { provider: 'azure', locale: 'fr-CA', label: 'Azure Neural', voiceId: 'fr-CA-AntoineNeural', voiceName: 'Antoine (Canadian French)', gender: 'male' },
  ],
  // EU
  'EU_WEST': [
    { provider: 'azure', locale: 'en-GB', label: 'Azure Neural', voiceId: 'en-GB-SoniaNeural', voiceName: 'Sonia (British English)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'en-GB', label: 'Azure Neural', voiceId: 'en-GB-RyanNeural', voiceName: 'Ryan (British English)', gender: 'male' },
    { provider: 'azure', locale: 'en-GB', label: 'Azure Neural', voiceId: 'en-GB-LibbyNeural', voiceName: 'Libby (British English)', gender: 'female' },
    { provider: 'azure', locale: 'en-IE', label: 'Azure Neural', voiceId: 'en-IE-EmilyNeural', voiceName: 'Emily (Irish English)', gender: 'female' },
  ],
  'EU_DACH': [
    { provider: 'azure', locale: 'de-DE', label: 'Azure Neural', voiceId: 'de-DE-KatjaNeural', voiceName: 'Katja (German)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'de-DE', label: 'Azure Neural', voiceId: 'de-DE-ConradNeural', voiceName: 'Conrad (German)', gender: 'male' },
    { provider: 'azure', locale: 'de-AT', label: 'Azure Neural', voiceId: 'de-AT-IngridNeural', voiceName: 'Ingrid (Austrian German)', gender: 'female' },
    { provider: 'azure', locale: 'de-CH', label: 'Azure Neural', voiceId: 'de-CH-LeniNeural', voiceName: 'Leni (Swiss German)', gender: 'female' },
  ],
  'EU_FRANCE': [
    { provider: 'azure', locale: 'fr-FR', label: 'Azure Neural', voiceId: 'fr-FR-DeniseNeural', voiceName: 'Denise (French)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'fr-FR', label: 'Azure Neural', voiceId: 'fr-FR-HenriNeural', voiceName: 'Henri (French)', gender: 'male' },
    { provider: 'azure', locale: 'fr-FR', label: 'Azure Neural', voiceId: 'fr-FR-EloiseNeural', voiceName: 'Eloise (French - Young)', gender: 'female' },
  ],
  'EU_IBERIA': [
    { provider: 'azure', locale: 'es-ES', label: 'Azure Neural', voiceId: 'es-ES-ElviraNeural', voiceName: 'Elvira (Spanish)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'es-ES', label: 'Azure Neural', voiceId: 'es-ES-AlvaroNeural', voiceName: 'Alvaro (Spanish)', gender: 'male' },
    { provider: 'azure', locale: 'pt-PT', label: 'Azure Neural', voiceId: 'pt-PT-RaquelNeural', voiceName: 'Raquel (Portuguese)', gender: 'female' },
    { provider: 'azure', locale: 'pt-PT', label: 'Azure Neural', voiceId: 'pt-PT-DuarteNeural', voiceName: 'Duarte (Portuguese)', gender: 'male' },
  ],
  'EU_NORDIC': [
    { provider: 'azure', locale: 'sv-SE', label: 'Azure Neural', voiceId: 'sv-SE-SofieNeural', voiceName: 'Sofie (Swedish)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'sv-SE', label: 'Azure Neural', voiceId: 'sv-SE-MattiasNeural', voiceName: 'Mattias (Swedish)', gender: 'male' },
    { provider: 'azure', locale: 'nb-NO', label: 'Azure Neural', voiceId: 'nb-NO-PernilleNeural', voiceName: 'Pernille (Norwegian)', gender: 'female' },
    { provider: 'azure', locale: 'da-DK', label: 'Azure Neural', voiceId: 'da-DK-ChristelNeural', voiceName: 'Christel (Danish)', gender: 'female' },
    { provider: 'azure', locale: 'fi-FI', label: 'Azure Neural', voiceId: 'fi-FI-SelmaNeural', voiceName: 'Selma (Finnish)', gender: 'female' },
  ],
  'EU_EAST': [
    { provider: 'azure', locale: 'pl-PL', label: 'Azure Neural', voiceId: 'pl-PL-ZofiaNeural', voiceName: 'Zofia (Polish)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'pl-PL', label: 'Azure Neural', voiceId: 'pl-PL-MarekNeural', voiceName: 'Marek (Polish)', gender: 'male' },
    { provider: 'azure', locale: 'cs-CZ', label: 'Azure Neural', voiceId: 'cs-CZ-VlastaNeural', voiceName: 'Vlasta (Czech)', gender: 'female' },
    { provider: 'azure', locale: 'ro-RO', label: 'Azure Neural', voiceId: 'ro-RO-AlinaNeural', voiceName: 'Alina (Romanian)', gender: 'female' },
  ],
  // LATAM
  'LATAM_BRAZIL': [
    { provider: 'azure', locale: 'pt-BR', label: 'Azure Neural', voiceId: 'pt-BR-FranciscaNeural', voiceName: 'Francisca (Brazilian Portuguese)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'pt-BR', label: 'Azure Neural', voiceId: 'pt-BR-AntonioNeural', voiceName: 'Antonio (Brazilian Portuguese)', gender: 'male' },
    { provider: 'azure', locale: 'pt-BR', label: 'Azure Neural', voiceId: 'pt-BR-ThalitaNeural', voiceName: 'Thalita (Brazilian Portuguese)', gender: 'female' },
  ],
  'LATAM_MEXICO': [
    { provider: 'azure', locale: 'es-MX', label: 'Azure Neural', voiceId: 'es-MX-DaliaNeural', voiceName: 'Dalia (Mexican Spanish)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'es-MX', label: 'Azure Neural', voiceId: 'es-MX-JorgeNeural', voiceName: 'Jorge (Mexican Spanish)', gender: 'male' },
    { provider: 'azure', locale: 'es-MX', label: 'Azure Neural', voiceId: 'es-MX-CarlotaNeural', voiceName: 'Carlota (Mexican Spanish)', gender: 'female' },
  ],
  'LATAM_ANDEAN': [
    { provider: 'azure', locale: 'es-CO', label: 'Azure Neural', voiceId: 'es-CO-SalomeNeural', voiceName: 'Salome (Colombian Spanish)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'es-CO', label: 'Azure Neural', voiceId: 'es-CO-GonzaloNeural', voiceName: 'Gonzalo (Colombian Spanish)', gender: 'male' },
    { provider: 'azure', locale: 'es-PE', label: 'Azure Neural', voiceId: 'es-PE-CamilaNeural', voiceName: 'Camila (Peruvian Spanish)', gender: 'female' },
  ],
  'LATAM_CONESUR': [
    { provider: 'azure', locale: 'es-AR', label: 'Azure Neural', voiceId: 'es-AR-ElenaNeural', voiceName: 'Elena (Argentine Spanish)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'es-AR', label: 'Azure Neural', voiceId: 'es-AR-TomasNeural', voiceName: 'Tomas (Argentine Spanish)', gender: 'male' },
    { provider: 'azure', locale: 'es-CL', label: 'Azure Neural', voiceId: 'es-CL-CatalinaNeural', voiceName: 'Catalina (Chilean Spanish)', gender: 'female' },
  ],
  'LATAM_CARIB': [
    { provider: 'azure', locale: 'es-DO', label: 'Azure Neural', voiceId: 'es-DO-RamonaNeural', voiceName: 'Ramona (Dominican Spanish)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'es-VE', label: 'Azure Neural', voiceId: 'es-VE-PaolaNeural', voiceName: 'Paola (Venezuelan Spanish)', gender: 'female' },
    { provider: 'azure', locale: 'es-CU', label: 'Azure Neural', voiceId: 'es-CU-BelkysNeural', voiceName: 'Belkys (Cuban Spanish)', gender: 'female' },
  ],
  // MENA
  'MENA_GULF': [
    { provider: 'azure', locale: 'ar-SA', label: 'Azure Neural', voiceId: 'ar-SA-ZariyahNeural', voiceName: 'Zariyah (Saudi Arabic)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'ar-SA', label: 'Azure Neural', voiceId: 'ar-SA-HamedNeural', voiceName: 'Hamed (Saudi Arabic)', gender: 'male' },
    { provider: 'azure', locale: 'ar-AE', label: 'Azure Neural', voiceId: 'ar-AE-FatimaNeural', voiceName: 'Fatima (UAE Arabic)', gender: 'female' },
    { provider: 'azure', locale: 'ar-KW', label: 'Azure Neural', voiceId: 'ar-KW-NouraNeural', voiceName: 'Noura (Kuwaiti Arabic)', gender: 'female' },
  ],
  'MENA_EGYPT': [
    { provider: 'azure', locale: 'ar-EG', label: 'Azure Neural', voiceId: 'ar-EG-SalmaNeural', voiceName: 'Salma (Egyptian Arabic)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'ar-EG', label: 'Azure Neural', voiceId: 'ar-EG-ShakirNeural', voiceName: 'Shakir (Egyptian Arabic)', gender: 'male' },
  ],
  'MENA_LEVANT': [
    { provider: 'azure', locale: 'ar-JO', label: 'Azure Neural', voiceId: 'ar-JO-SanaNeural', voiceName: 'Sana (Jordanian Arabic)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'ar-JO', label: 'Azure Neural', voiceId: 'ar-JO-TaimNeural', voiceName: 'Taim (Jordanian Arabic)', gender: 'male' },
    { provider: 'azure', locale: 'ar-SY', label: 'Azure Neural', voiceId: 'ar-SY-AmanyNeural', voiceName: 'Amany (Syrian Arabic)', gender: 'female' },
    { provider: 'azure', locale: 'ar-LB', label: 'Azure Neural', voiceId: 'ar-LB-LaylaNeural', voiceName: 'Layla (Lebanese Arabic)', gender: 'female' },
  ],
  'MENA_MAGHREB': [
    { provider: 'azure', locale: 'ar-MA', label: 'Azure Neural', voiceId: 'ar-MA-MounaNeural', voiceName: 'Mouna (Moroccan Arabic)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'ar-MA', label: 'Azure Neural', voiceId: 'ar-MA-JamalNeural', voiceName: 'Jamal (Moroccan Arabic)', gender: 'male' },
    { provider: 'azure', locale: 'ar-TN', label: 'Azure Neural', voiceId: 'ar-TN-ReemNeural', voiceName: 'Reem (Tunisian Arabic)', gender: 'female' },
  ],
  'MENA_MSA': [
    { provider: 'azure', locale: 'ar-SA', label: 'Azure Neural', voiceId: 'ar-SA-ZariyahNeural', voiceName: 'Zariyah (MSA)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'ar-SA', label: 'Azure Neural', voiceId: 'ar-SA-HamedNeural', voiceName: 'Hamed (MSA - Male)', gender: 'male' },
  ],
  // Pakistan & Bangladesh
  'PAKISTAN': [
    { provider: 'azure', locale: 'ur-PK', label: 'Azure Neural', voiceId: 'ur-PK-UzmaNeural', voiceName: 'Uzma (Urdu)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'ur-PK', label: 'Azure Neural', voiceId: 'ur-PK-AsadNeural', voiceName: 'Asad (Urdu)', gender: 'male' },
  ],
  'BANGLADESH': [
    { provider: 'azure', locale: 'bn-BD', label: 'Azure Neural', voiceId: 'bn-BD-NabanitaNeural', voiceName: 'Nabanita (Bengali)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'bn-BD', label: 'Azure Neural', voiceId: 'bn-BD-PradeepNeural', voiceName: 'Pradeep (Bengali)', gender: 'male' },
  ],
  // India
  'INDIA_NORTH': [
    { provider: 'azure', locale: 'hi-IN', label: 'Azure Neural', voiceId: 'hi-IN-SwaraNeural', voiceName: 'Swara (Hindi)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'hi-IN', label: 'Azure Neural', voiceId: 'hi-IN-MadhurNeural', voiceName: 'Madhur (Hindi)', gender: 'male' },
  ],
  'INDIA_SOUTH': [
    { provider: 'azure', locale: 'ta-IN', label: 'Azure Neural', voiceId: 'ta-IN-PallaviNeural', voiceName: 'Pallavi (Tamil)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'ta-IN', label: 'Azure Neural', voiceId: 'ta-IN-ValluvarNeural', voiceName: 'Valluvar (Tamil)', gender: 'male' },
  ],
  'INDIA_WEST': [
    { provider: 'azure', locale: 'mr-IN', label: 'Azure Neural', voiceId: 'mr-IN-AarohiNeural', voiceName: 'Aarohi (Marathi)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'mr-IN', label: 'Azure Neural', voiceId: 'mr-IN-ManoharNeural', voiceName: 'Manohar (Marathi)', gender: 'male' },
  ],
  'INDIA_EAST': [
    { provider: 'azure', locale: 'bn-IN', label: 'Azure Neural', voiceId: 'bn-IN-TanishaaNeural', voiceName: 'Tanishaa (Bengali India)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'bn-IN', label: 'Azure Neural', voiceId: 'bn-IN-BashkarNeural', voiceName: 'Bashkar (Bengali India)', gender: 'male' },
  ],
  'INDIA_PAN': [
    { provider: 'azure', locale: 'en-IN', label: 'Azure Neural', voiceId: 'en-IN-NeerjaNeural', voiceName: 'Neerja (Indian English)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'en-IN', label: 'Azure Neural', voiceId: 'en-IN-PrabhatNeural', voiceName: 'Prabhat (Indian English)', gender: 'male' },
  ],
  // India per-language leaf nodes
  'INDIA_NORTH_HI': [
    { provider: 'azure', locale: 'hi-IN', label: 'Azure Neural', voiceId: 'hi-IN-SwaraNeural', voiceName: 'Swara (Hindi)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'hi-IN', label: 'Azure Neural', voiceId: 'hi-IN-MadhurNeural', voiceName: 'Madhur (Hindi)', gender: 'male' },
  ],
  'INDIA_NORTH_UR': [
    { provider: 'azure', locale: 'ur-IN', label: 'Azure Neural', voiceId: 'ur-IN-GulNeural', voiceName: 'Gul (Urdu)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'ur-IN', label: 'Azure Neural', voiceId: 'ur-IN-SalmanNeural', voiceName: 'Salman (Urdu)', gender: 'male' },
  ],
  'INDIA_NORTH_PA': [
    { provider: 'azure', locale: 'pa-IN', label: 'Azure Neural', voiceId: 'pa-IN-GurpreetNeural', voiceName: 'Gurpreet (Punjabi)', gender: 'male', isDefault: true },
    { provider: 'azure', locale: 'pa-IN', label: 'Azure Neural', voiceId: 'pa-IN-OjasNeural', voiceName: 'Ojas (Punjabi)', gender: 'female' },
  ],
  'INDIA_SOUTH_TA': [
    { provider: 'azure', locale: 'ta-IN', label: 'Azure Neural', voiceId: 'ta-IN-PallaviNeural', voiceName: 'Pallavi (Tamil)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'ta-IN', label: 'Azure Neural', voiceId: 'ta-IN-ValluvarNeural', voiceName: 'Valluvar (Tamil)', gender: 'male' },
  ],
  'INDIA_SOUTH_TE': [
    { provider: 'azure', locale: 'te-IN', label: 'Azure Neural', voiceId: 'te-IN-ShrutiNeural', voiceName: 'Shruti (Telugu)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'te-IN', label: 'Azure Neural', voiceId: 'te-IN-MohanNeural', voiceName: 'Mohan (Telugu)', gender: 'male' },
  ],
  'INDIA_SOUTH_KN': [
    { provider: 'azure', locale: 'kn-IN', label: 'Azure Neural', voiceId: 'kn-IN-SapnaNeural', voiceName: 'Sapna (Kannada)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'kn-IN', label: 'Azure Neural', voiceId: 'kn-IN-GaganNeural', voiceName: 'Gagan (Kannada)', gender: 'male' },
  ],
  'INDIA_SOUTH_ML': [
    { provider: 'azure', locale: 'ml-IN', label: 'Azure Neural', voiceId: 'ml-IN-SobhanaNeural', voiceName: 'Sobhana (Malayalam)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'ml-IN', label: 'Azure Neural', voiceId: 'ml-IN-MidhunNeural', voiceName: 'Midhun (Malayalam)', gender: 'male' },
  ],
  'INDIA_WEST_MR': [
    { provider: 'azure', locale: 'mr-IN', label: 'Azure Neural', voiceId: 'mr-IN-AarohiNeural', voiceName: 'Aarohi (Marathi)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'mr-IN', label: 'Azure Neural', voiceId: 'mr-IN-ManoharNeural', voiceName: 'Manohar (Marathi)', gender: 'male' },
  ],
  'INDIA_WEST_GU': [
    { provider: 'azure', locale: 'gu-IN', label: 'Azure Neural', voiceId: 'gu-IN-DiyaNeural', voiceName: 'Diya (Gujarati)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'gu-IN', label: 'Azure Neural', voiceId: 'gu-IN-NiranjanNeural', voiceName: 'Niranjan (Gujarati)', gender: 'male' },
  ],
  'INDIA_EAST_BN': [
    { provider: 'azure', locale: 'bn-IN', label: 'Azure Neural', voiceId: 'bn-IN-TanishaaNeural', voiceName: 'Tanishaa (Bengali India)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'bn-IN', label: 'Azure Neural', voiceId: 'bn-IN-BashkarNeural', voiceName: 'Bashkar (Bengali India)', gender: 'male' },
  ],
  'INDIA_EAST_OR': [
    { provider: 'azure', locale: 'or-IN', label: 'Azure Neural', voiceId: 'or-IN-SubhasiniNeural', voiceName: 'Subhasini (Odia)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'or-IN', label: 'Azure Neural', voiceId: 'or-IN-MohantyNeural', voiceName: 'Mohanty (Odia)', gender: 'male' },
  ],
  'INDIA_PAN_EN': [
    { provider: 'azure', locale: 'en-IN', label: 'Azure Neural', voiceId: 'en-IN-NeerjaNeural', voiceName: 'Neerja (Indian English)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'en-IN', label: 'Azure Neural', voiceId: 'en-IN-PrabhatNeural', voiceName: 'Prabhat (Indian English)', gender: 'male' },
  ],
  // SEA
  'SEA_MALAY': [
    { provider: 'azure', locale: 'ms-MY', label: 'Azure Neural', voiceId: 'ms-MY-YasminNeural', voiceName: 'Yasmin (Malay)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'ms-MY', label: 'Azure Neural', voiceId: 'ms-MY-OsmanNeural', voiceName: 'Osman (Malay)', gender: 'male' },
  ],
  'SEA_THAI': [
    { provider: 'azure', locale: 'th-TH', label: 'Azure Neural', voiceId: 'th-TH-AcharaNeural', voiceName: 'Achara (Thai)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'th-TH', label: 'Azure Neural', voiceId: 'th-TH-SomsiNeural', voiceName: 'Somsi (Thai)', gender: 'male' },
  ],
  'SEA_VIET': [
    { provider: 'azure', locale: 'vi-VN', label: 'Azure Neural', voiceId: 'vi-VN-HoaiMyNeural', voiceName: 'Hoai My (Vietnamese)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'vi-VN', label: 'Azure Neural', voiceId: 'vi-VN-NamMinh Neural', voiceName: 'Nam Minh (Vietnamese)', gender: 'male' },
  ],
  'SEA_PHIL': [
    { provider: 'azure', locale: 'fil-PH', label: 'Azure Neural', voiceId: 'fil-PH-BlessicaNeural', voiceName: 'Blessica (Filipino)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'fil-PH', label: 'Azure Neural', voiceId: 'fil-PH-AngelNeural', voiceName: 'Angel (Filipino)', gender: 'female' },
  ],
  'SEA_PAN': [
    { provider: 'azure', locale: 'en-PH', label: 'Azure Neural', voiceId: 'en-PH-RosaNeural', voiceName: 'Rosa (Philippine English)', gender: 'female', isDefault: true },
    { provider: 'azure', locale: 'en-PH', label: 'Azure Neural', voiceId: 'en-PH-JamesNeural', voiceName: 'James (Philippine English)', gender: 'male' },
  ],
   // P0: Oceania
   'OCEANIA_AU': [
     { provider: 'azure', locale: 'en-AU', label: 'Azure Neural', voiceId: 'en-AU-NatashaNeural', voiceName: 'Natasha (Australian English)', gender: 'female', isDefault: true },
     { provider: 'azure', locale: 'en-AU', label: 'Azure Neural', voiceId: 'en-AU-WilliamNeural', voiceName: 'William (Australian English)', gender: 'male' },
     { provider: 'azure', locale: 'en-AU', label: 'Azure Neural', voiceId: 'en-AU-AnnetteNeural', voiceName: 'Annette (Australian English)', gender: 'female' },
   ],
   'OCEANIA_NZ': [
     { provider: 'azure', locale: 'en-NZ', label: 'Azure Neural', voiceId: 'en-NZ-MitchellNeural', voiceName: 'Mitchell (New Zealand English)', gender: 'male', isDefault: true },
     { provider: 'azure', locale: 'en-NZ', label: 'Azure Neural', voiceId: 'en-NZ-MollyNeural', voiceName: 'Molly (New Zealand English)', gender: 'female' },
   ],
   // P0: Turkey
   'TURKEY': [
     { provider: 'azure', locale: 'tr-TR', label: 'Azure Neural', voiceId: 'tr-TR-EmelNeural', voiceName: 'Emel (Turkish)', gender: 'female', isDefault: true },
     { provider: 'azure', locale: 'tr-TR', label: 'Azure Neural', voiceId: 'tr-TR-AhmetNeural', voiceName: 'Ahmet (Turkish)', gender: 'male' },
   ],
   // P1: Extended Caribbean (English & French)
   'CARIBBEAN_EN': [
     { provider: 'azure', locale: 'en-JM', label: 'Azure Neural', voiceId: 'en-JM-RichardNeural', voiceName: 'Richard (Jamaican English)', gender: 'male', isDefault: true },
     { provider: 'azure', locale: 'en-TT', label: 'Azure Neural', voiceId: 'en-TT-ChristopherNeural', voiceName: 'Christopher (Trinidad & Tobago)', gender: 'male' },
   ],
   'CARIBBEAN_FR': [
     { provider: 'azure', locale: 'fr-HT', label: 'Azure Neural', voiceId: 'fr-HT-StellaNeural', voiceName: 'Stella (Haitian French)', gender: 'female', isDefault: true },
     { provider: 'azure', locale: 'fr-HT', label: 'Azure Neural', voiceId: 'fr-HT-JeanNeural', voiceName: 'Jean (Haitian French)', gender: 'male' },
   ],
   // P1: Eastern Europe & Central Asia
   'EU_UKRAINE': [
     { provider: 'azure', locale: 'uk-UA', label: 'Azure Neural', voiceId: 'uk-UA-OstapNeural', voiceName: 'Ostap (Ukrainian)', gender: 'male', isDefault: true },
     { provider: 'azure', locale: 'uk-UA', label: 'Azure Neural', voiceId: 'uk-UA-YevhenNeural', voiceName: 'Yevhen (Ukrainian)', gender: 'male' },
   ],
   'EU_BALKANS': [
     { provider: 'azure', locale: 'sr-RS', label: 'Azure Neural', voiceId: 'sr-RS-NikolaNeural', voiceName: 'Nikola (Serbian)', gender: 'male', isDefault: true },
     { provider: 'azure', locale: 'bg-BG', label: 'Azure Neural', voiceId: 'bg-BG-BorislavNeural', voiceName: 'Borislav (Bulgarian)', gender: 'male' },
   ],
   'EU_CAUCASUS': [
     { provider: 'azure', locale: 'ka-GE', label: 'Azure Neural', voiceId: 'ka-GE-EkaNeural', voiceName: 'Eka (Georgian)', gender: 'female', isDefault: true },
     { provider: 'azure', locale: 'hy-AM', label: 'Azure Neural', voiceId: 'hy-AM-AnahitNeural', voiceName: 'Anahit (Armenian)', gender: 'female' },
   ],
   'ASIA_CENTRAL_KZ': [
     { provider: 'azure', locale: 'kk-KZ', label: 'Azure Neural', voiceId: 'kk-KZ-AigulNeural', voiceName: 'Aigul (Kazakh)', gender: 'female', isDefault: true },
     { provider: 'azure', locale: 'kk-KZ', label: 'Azure Neural', voiceId: 'kk-KZ-DauletNeural', voiceName: 'Daulet (Kazakh)', gender: 'male' },
   ],
   'ASIA_CENTRAL_UZ': [
     { provider: 'azure', locale: 'uz-UZ', label: 'Azure Neural', voiceId: 'uz-UZ-MadiyarNeural', voiceName: 'Madiyar (Uzbek)', gender: 'male', isDefault: true },
     { provider: 'azure', locale: 'uz-UZ', label: 'Azure Neural', voiceId: 'uz-UZ-OqiljonNeural', voiceName: 'Oqiljon (Uzbek)', gender: 'male' },
   ],
   'ASIA_CENTRAL_AZ': [
     { provider: 'azure', locale: 'az-AZ', label: 'Azure Neural', voiceId: 'az-AZ-BanuNeural', voiceName: 'Banu (Azerbaijani)', gender: 'female', isDefault: true },
     { provider: 'azure', locale: 'az-AZ', label: 'Azure Neural', voiceId: 'az-AZ-IbrahimNeural', voiceName: 'Ibrahim (Azerbaijani)', gender: 'male' },
   ],
   'ASIA_CENTRAL_AM': [
     { provider: 'azure', locale: 'hy-AM', label: 'Azure Neural', voiceId: 'hy-AM-AnahitNeural', voiceName: 'Anahit (Armenian)', gender: 'female', isDefault: true },
     { provider: 'azure', locale: 'hy-AM', label: 'Azure Neural', voiceId: 'hy-AM-HaykNeural', voiceName: 'Hayk (Armenian)', gender: 'male' },
   ],
   'ASIA_CENTRAL_GE': [
     { provider: 'azure', locale: 'ka-GE', label: 'Azure Neural', voiceId: 'ka-GE-EkaNeural', voiceName: 'Eka (Georgian)', gender: 'female', isDefault: true },
     { provider: 'azure', locale: 'ka-GE', label: 'Azure Neural', voiceId: 'ka-GE-GiorgiNeural', voiceName: 'Giorgi (Georgian)', gender: 'male' },
   ],
   // CJK
   'CJK_CN': [
     { provider: 'qwen3', locale: 'zh-CN', label: 'Alibaba Qwen3-TTS', voiceId: 'qwen-3-cn-male', voiceName: 'Qwen3 Mandarin (Male)', gender: 'male', isDefault: true },
     { provider: 'qwen3', locale: 'zh-CN', label: 'Alibaba Qwen3-TTS', voiceId: 'qwen-3-cn-female', voiceName: 'Qwen3 Mandarin (Female)', gender: 'female' },
     { provider: 'qwen3', locale: 'zh-HK', label: 'Alibaba Qwen3-TTS', voiceId: 'qwen-3-hk-male', voiceName: 'Qwen3 Cantonese (Male)', gender: 'male' },
   ],
   'CJK_TW': [
     { provider: 'qwen3', locale: 'zh-TW', label: 'Alibaba Qwen3-TTS', voiceId: 'qwen-3-tw-male', voiceName: 'Qwen3 Traditional Chinese (Male)', gender: 'male', isDefault: true },
     { provider: 'qwen3', locale: 'zh-TW', label: 'Alibaba Qwen3-TTS', voiceId: 'qwen-3-tw-female', voiceName: 'Qwen3 Traditional Chinese (Female)', gender: 'female' },
   ],
   'CJK_JP': [
     { provider: 'qwen3', locale: 'ja-JP', label: 'Alibaba Qwen3-TTS', voiceId: 'qwen-3-ja-male', voiceName: 'Qwen3 Japanese (Male)', gender: 'male', isDefault: true },
     { provider: 'qwen3', locale: 'ja-JP', label: 'Alibaba Qwen3-TTS', voiceId: 'qwen-3-ja-female', voiceName: 'Qwen3 Japanese (Female)', gender: 'female' },
   ],
   'CJK_KR': [
     { provider: 'qwen3', locale: 'ko-KR', label: 'Alibaba Qwen3-TTS', voiceId: 'qwen-3-ko-male', voiceName: 'Qwen3 Korean (Male)', gender: 'male', isDefault: true },
     { provider: 'qwen3', locale: 'ko-KR', label: 'Alibaba Qwen3-TTS', voiceId: 'qwen-3-ko-female', voiceName: 'Qwen3 Korean (Female)', gender: 'female' },
   ],
};

/**
 * Get regional voice options (provider + locale + voice IDs)
 * Falls back to NAM_US if region not found
 */
export function getRegionVoiceOptions(regionCode: string): VoiceOption[] {
   const r = regionCode?.toUpperCase() || '';
   return REGION_VOICE_OPTIONS[r] || REGION_VOICE_OPTIONS['NAM_US'];
}

/**
 * Get all available region codes (for registry validation/listing)
 */
export function getAllRegionCodes(): string[] {
   return Object.keys(REGION_VOICE_OPTIONS).sort();
}

/**
 * Normalize display-friendly TTS provider names to DB-compatible values
 */
export function normalizeTTSProvider(displayProvider: string): string {
  const p = displayProvider.toLowerCase();
  if (p.includes('azure') || p.includes('neural')) return 'azure';
  if (p.includes('qwen') || p.includes('alibaba')) return 'qwen3';
  if (p.includes('eleven')) return 'elevenlabs';
  return 'azure';
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. CROSS-PLATFORM UTILITIES — Zone detection, RTL, BCP47, language mapping
// ═══════════════════════════════════════════════════════════════════════════

/** Zone type for cross-platform routing */
export type RegionalZone = 
  | 'western' | 'cjk' | 'mena' | 'india' | 'africa'
  | 'oceania' | 'turkey' | 'caribbean' | 'eastern_europe' | 'central_asia'
  | 'pakistan' | 'bangladesh' | 'sea' | 'fallback';

/** Language → Zone mapping (most precise detection method) */
const LANGUAGE_ZONE_MAP: Record<string, RegionalZone> = {
  // CJK
  zh: 'cjk', ja: 'cjk', ko: 'cjk',
  // MENA / RTL
  ar: 'mena', he: 'mena', fa: 'mena',
  // India / South Asia
  hi: 'india', ta: 'india', te: 'india', bn: 'india', mr: 'india',
  gu: 'india', kn: 'india', ml: 'india', pa: 'india', or: 'india',
  // Pakistan & Bangladesh (separate zones)
  ur: 'pakistan',
  // SEA
  id: 'sea', vi: 'sea', th: 'sea', ms: 'sea', fil: 'sea', my: 'sea',
  // Africa
  sw: 'africa', yo: 'africa', am: 'africa', ha: 'africa', ig: 'africa', zu: 'africa',
  // Turkey
  tr: 'turkey',
  // Caucasus / Central Asia
  ka: 'central_asia', hy: 'central_asia', az: 'central_asia',
  kk: 'central_asia', uz: 'central_asia',
  // Eastern Europe
  uk: 'eastern_europe', sr: 'eastern_europe', bg: 'eastern_europe', hr: 'eastern_europe',
  // Western / EU (default for Latin-script European languages)
  en: 'western', es: 'western', fr: 'western', de: 'western', it: 'western',
  pt: 'western', nl: 'western', pl: 'western', ro: 'western', cs: 'western',
  hu: 'western', sv: 'western', nb: 'western', da: 'western', fi: 'western',
};

/** ISO country code → Zone mapping for IP-based detection */
const COUNTRY_ZONE_MAP: Record<string, RegionalZone> = {
  // NAM
  US: 'western', CA: 'western',
  // EU
  GB: 'western', DE: 'western', FR: 'western', IT: 'western', ES: 'western',
  NL: 'western', BE: 'western', PT: 'western', PL: 'western', SE: 'western',
  NO: 'western', DK: 'western', FI: 'western', AT: 'western', CH: 'western',
  IE: 'western', CZ: 'western', RO: 'western', HU: 'western',
  // P1: Eastern Europe
  UA: 'eastern_europe', RS: 'eastern_europe', BG: 'eastern_europe', HR: 'eastern_europe',
  BA: 'eastern_europe', ME: 'eastern_europe', MK: 'eastern_europe', AL: 'eastern_europe',
  // Caucasus & Central Asia
  GE: 'central_asia', AM: 'central_asia', AZ: 'central_asia',
  KZ: 'central_asia', UZ: 'central_asia', TM: 'central_asia', KG: 'central_asia', TJ: 'central_asia',
  // Turkey
  TR: 'turkey',
  // MENA / GCC
  SA: 'mena', AE: 'mena', KW: 'mena', QA: 'mena', BH: 'mena', OM: 'mena',
  EG: 'mena', JO: 'mena', LB: 'mena', IQ: 'mena',
  MA: 'mena', DZ: 'mena', TN: 'mena', LY: 'mena', YE: 'mena',
  // South Asia
  IN: 'india', PK: 'pakistan', BD: 'bangladesh', LK: 'india', NP: 'india',
  // SEA
  ID: 'sea', TH: 'sea', VN: 'sea', MY: 'sea', PH: 'sea', SG: 'sea',
  MM: 'sea', KH: 'sea', LA: 'sea',
  // CJK
  CN: 'cjk', JP: 'cjk', KR: 'cjk', TW: 'cjk', HK: 'cjk',
  // LATAM
  BR: 'western', MX: 'western', AR: 'western', CO: 'western', CL: 'western',
  PE: 'western', VE: 'western', EC: 'western', UY: 'western', PY: 'western',
  // Caribbean
  JM: 'caribbean', TT: 'caribbean', BS: 'caribbean', HT: 'caribbean',
  DO: 'western', PR: 'western', CU: 'western', // Spanish Caribbean stays with LATAM
  // Africa
  NG: 'africa', KE: 'africa', ZA: 'africa', GH: 'africa', ET: 'africa',
  TZ: 'africa', UG: 'africa', RW: 'africa', SN: 'africa', CM: 'africa',
  // Oceania
  AU: 'oceania', NZ: 'oceania',
};

/**
 * Get zone from language code (most precise routing method)
 * Used by demos, Deck wizard, and content generation
 */
export function getZoneFromLanguage(lang: string): RegionalZone {
  const short = lang?.split('-')[0]?.toLowerCase();
  return LANGUAGE_ZONE_MAP[short] || 'western';
}

/**
 * Get zone from region string (fuzzy matching for backward compatibility)
 * Handles both registry codes (NAM_US) and display strings (North America)
 */
export function getZoneFromRegion(region: string): RegionalZone {
  if (!region) return 'western';
  const r = region.toLowerCase();
  if (r.startsWith('nam') || r.includes('north_america')) return 'western';
  if (r.startsWith('eu') && !r.includes('ukraine') && !r.includes('balkans') && !r.includes('caucasus')) return 'western';
  if (r.startsWith('latam') || r.includes('latin')) return 'western';
  if (r.startsWith('cjk') || r.includes('china') || r.includes('japan') || r.includes('korea')) return 'cjk';
  if (r.startsWith('mena') || r.includes('arab') || r.includes('middle')) return 'mena';
  if (r.startsWith('india') || r.includes('south_asia')) return 'india';
  if (r === 'pakistan') return 'pakistan';
  if (r === 'bangladesh') return 'bangladesh';
  if (r.startsWith('sea') || r.includes('southeast')) return 'sea';
  if (r.startsWith('africa')) return 'africa';
  if (r.startsWith('oceania') || r.includes('australia')) return 'oceania';
  if (r === 'turkey') return 'turkey';
  if (r.startsWith('caribbean')) return 'caribbean';
  if (r.includes('ukraine') || r.includes('balkans') || r.includes('eurasia')) return 'eastern_europe';
  if (r.includes('caucasus') || r.includes('central_asia') || r.startsWith('asia_central')) return 'central_asia';
  return 'western';
}

/**
 * Get zone from ISO country code (for IP-based detection)
 */
export function getZoneFromCountry(countryCode: string): RegionalZone {
  return COUNTRY_ZONE_MAP[countryCode?.toUpperCase()] || 'western';
}

/** RTL script detection */
export function isRTLLanguage(lang: string): boolean {
  const short = lang?.split('-')[0]?.toLowerCase();
  return ['ar', 'he', 'fa', 'ur'].includes(short);
}

/** Map short language code to BCP47 locale for TTS */
export function toLangBCP47(lang: string): string {
  const BCP47_MAP: Record<string, string> = {
    en: 'en-US', ar: 'ar-SA', hi: 'hi-IN', zh: 'zh-CN',
    ja: 'ja-JP', ko: 'ko-KR', es: 'es-ES', fr: 'fr-FR',
    de: 'de-DE', pt: 'pt-BR', it: 'it-IT', nl: 'nl-NL',
    tr: 'tr-TR', pl: 'pl-PL', sw: 'sw-KE', yo: 'yo-NG',
    bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', id: 'id-ID',
    vi: 'vi-VN', th: 'th-TH', ms: 'ms-MY', ur: 'ur-PK',
    mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN',
    pa: 'pa-IN', or: 'or-IN', uk: 'uk-UA', sr: 'sr-RS',
    bg: 'bg-BG', ka: 'ka-GE', hy: 'hy-AM', az: 'az-AZ',
    kk: 'kk-KZ', uz: 'uz-UZ', ro: 'ro-RO', cs: 'cs-CZ',
    hu: 'hu-HU', sv: 'sv-SE', nb: 'nb-NO', da: 'da-DK',
    fi: 'fi-FI', he: 'he-IL', fa: 'fa-IR', am: 'am-ET',
    fil: 'fil-PH', ha: 'ha-NG',
  };
  return BCP47_MAP[lang] || `${lang}-${lang.toUpperCase()}`;
}

/** Standard demo language options (used across landing pages and demos) */
export const DEMO_LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
];

/** 
 * Cross-platform provider config (display metadata for UI cards/badges)
 * Maps zone → multimodal provider stack with display names and colors
 */
export interface ZoneProviderDisplay {
  zone: RegionalZone;
  llmProvider: string;
  llmModel: string;
  ttsProvider: string;
  imageProvider: string;
  videoProvider: string;
  avatarProvider: string;
  translationProvider: string;
  displayProviders: string[];
  displayColors: string[];
}

export const ZONE_PROVIDER_DISPLAY: Record<string, ZoneProviderDisplay> = {
  western: {
    zone: 'western', llmProvider: 'claude', llmModel: 'claude-4',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'deepl',
    displayProviders: ['Claude 4', 'Azure Neural', 'Vertex Veo 3', 'DeepL'],
    displayColors: ['from-amber-500/80 to-amber-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-cyan-500/80 to-cyan-600/80'],
  },
  cjk: {
    zone: 'cjk', llmProvider: 'alibaba', llmModel: 'qwen-max',
    ttsProvider: 'alibaba_qwen3_tts', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'qwen_mt',
    displayProviders: ['Qwen Max', 'Qwen3-TTS', 'Vertex Veo 3', 'Qwen-MT'],
    displayColors: ['from-orange-500/80 to-orange-600/80', 'from-amber-500/80 to-amber-600/80', 'from-blue-500/80 to-blue-600/80', 'from-red-500/80 to-red-600/80'],
  },
  mena: {
    zone: 'mena', llmProvider: 'alibaba', llmModel: 'qwen-max',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'azure_translator',
    displayProviders: ['Qwen Max', 'Azure Neural (7 Arabic)', 'Vertex Veo 3', 'Azure Translator'],
    displayColors: ['from-orange-500/80 to-orange-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-emerald-500/80 to-emerald-600/80'],
  },
  india: {
    zone: 'india', llmProvider: 'gemini', llmModel: 'gemini-3-pro',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'google_translate',
    displayProviders: ['Gemini 3 Pro', 'Azure Neural', 'Vertex Veo 3', 'Google Translate'],
    displayColors: ['from-blue-500/80 to-blue-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-green-500/80 to-green-600/80'],
  },
  africa: {
    zone: 'africa', llmProvider: 'gemini', llmModel: 'gemini-3-pro',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'google_translate',
    displayProviders: ['Gemini 3 Pro', 'Azure Neural', 'Vertex Veo 3', 'Google Translate'],
    displayColors: ['from-blue-500/80 to-blue-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-green-500/80 to-green-600/80'],
  },
  oceania: {
    zone: 'oceania', llmProvider: 'claude', llmModel: 'claude-4',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'deepl',
    displayProviders: ['Claude 4', 'Azure Neural', 'Vertex Veo 3', 'DeepL'],
    displayColors: ['from-amber-500/80 to-amber-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-cyan-500/80 to-cyan-600/80'],
  },
  turkey: {
    zone: 'turkey', llmProvider: 'claude', llmModel: 'claude-4',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'deepl',
    displayProviders: ['Claude 4', 'Azure Neural', 'Vertex Veo 3', 'DeepL'],
    displayColors: ['from-amber-500/80 to-amber-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-cyan-500/80 to-cyan-600/80'],
  },
  caribbean: {
    zone: 'caribbean', llmProvider: 'openai', llmModel: 'gpt-4o',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'google_translate',
    displayProviders: ['GPT-4o', 'Azure Neural', 'Vertex Veo 3', 'Google Translate'],
    displayColors: ['from-emerald-500/80 to-emerald-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-green-500/80 to-green-600/80'],
  },
  eastern_europe: {
    zone: 'eastern_europe', llmProvider: 'openai', llmModel: 'gpt-4o',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'google_translate',
    displayProviders: ['GPT-4o', 'Azure Neural', 'Vertex Veo 3', 'Google Translate'],
    displayColors: ['from-emerald-500/80 to-emerald-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-green-500/80 to-green-600/80'],
  },
  central_asia: {
    zone: 'central_asia', llmProvider: 'openai', llmModel: 'gpt-4o',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'google_translate',
    displayProviders: ['GPT-4o', 'Azure Neural', 'Vertex Veo 3', 'Google Translate'],
    displayColors: ['from-emerald-500/80 to-emerald-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-green-500/80 to-green-600/80'],
  },
  pakistan: {
    zone: 'pakistan', llmProvider: 'openai', llmModel: 'gpt-4o',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'google_translate',
    displayProviders: ['GPT-4o', 'Azure Neural', 'Vertex Veo 3', 'Google Translate'],
    displayColors: ['from-emerald-500/80 to-emerald-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-green-500/80 to-green-600/80'],
  },
  bangladesh: {
    zone: 'bangladesh', llmProvider: 'gemini', llmModel: 'gemini-3-pro',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'google_translate',
    displayProviders: ['Gemini 3 Pro', 'Azure Neural', 'Vertex Veo 3', 'Google Translate'],
    displayColors: ['from-blue-500/80 to-blue-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-green-500/80 to-green-600/80'],
  },
  sea: {
    zone: 'sea', llmProvider: 'gemini', llmModel: 'gemini-3-pro',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'google_translate',
    displayProviders: ['Gemini 3 Pro', 'Azure Neural', 'Vertex Veo 3', 'Google Translate'],
    displayColors: ['from-blue-500/80 to-blue-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-green-500/80 to-green-600/80'],
  },
  fallback: {
    zone: 'fallback', llmProvider: 'openai', llmModel: 'gpt-4o',
    ttsProvider: 'azure', imageProvider: 'gemini_3_pro',
    videoProvider: 'vertex_veo3', avatarProvider: 'alibaba_wan22',
    translationProvider: 'google_translate',
    displayProviders: ['GPT-4o (Fallback)', 'Azure Neural', 'Vertex Veo 3', 'Google Translate'],
    displayColors: ['from-emerald-500/80 to-emerald-600/80', 'from-sky-500/80 to-sky-600/80', 'from-blue-500/80 to-blue-600/80', 'from-green-500/80 to-green-600/80'],
  },
};

/**
 * Get full provider display config for a zone (used by demo cards, badges, wizard)
 */
export function getZoneProviderDisplay(zone: RegionalZone): ZoneProviderDisplay {
  return ZONE_PROVIDER_DISPLAY[zone] || ZONE_PROVIDER_DISPLAY.fallback;
}

/**
 * Get provider display config from language code (convenience wrapper)
 */
export function getProviderDisplayFromLanguage(lang: string): ZoneProviderDisplay {
  return getZoneProviderDisplay(getZoneFromLanguage(lang));
}

/**
 * Get provider display config from region string (convenience wrapper)
 */
export function getProviderDisplayFromRegion(region: string): ZoneProviderDisplay {
  return getZoneProviderDisplay(getZoneFromRegion(region));
}
