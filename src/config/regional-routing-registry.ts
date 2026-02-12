/**
 * CENTRALIZED REGIONAL ROUTING REGISTRY
 * Single source of truth for all LLM, TTS, and voice mappings across 48+ regions.
 * 
 * Structure:
 * - REGION_LLM_ROUTING: Parent-level LLM providers + fallback chains
 * - getZoneAIProviders(): Sub-region AI provider options with hybrid overrides
 * - getRegionVoiceOptions(): Regional voice selections per TTS provider
 * 
 * Alignment:
 * - Master Provider Routing Registry (v5)
 * - EU, LATAM, NAM: Claude 4 (Anthropic)
 * - CJK, MENA_GULF, MENA_MSA: Qwen Max (Alibaba)
 * - India, SEA, Africa, Bangladesh: Gemini 3 Pro
 * - Pakistan: GPT-4o (OpenAI)
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
  // LATAM
  'LATAM_BRAZIL': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
  'LATAM_MEXICO': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
  'LATAM_ANDEAN': ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
  'LATAM_CONESUR': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
  'LATAM_CARIB': ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
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
 */
export function getRegionVoiceOptions(regionCode: string): VoiceOption[] {
  const r = regionCode?.toUpperCase() || '';
  return REGION_VOICE_OPTIONS[r] || REGION_VOICE_OPTIONS['NAM_US'];
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
