/**
 * ROUTING ENFORCEMENT GATEWAY — Single mandatory entry point for ALL AI provider calls
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * THIS IS THE LAW. EVERY AI call in the GenieSuite ecosystem MUST go through
 * this gateway. Direct supabase.functions.invoke('ai-universal-processor')
 * calls are PROHIBITED outside this file and imagePreviewService.ts.
 *
 * The gateway:
 *   1. Validates the request against the master-provider-routing-registry
 *   2. Resolves the correct zone (claude/alibaba/gemini/fallback)
 *   3. Selects providers using the LOCKED routing tables (Object.freeze'd)
 *   4. Enforces the multi-tier fallback chain
 *   5. Logs routing decisions for audit trail
 *   6. Provides build-time validation via validateRoutingCompliance()
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * WHO CAN MODIFY THIS FILE:
 *   - Only after team lead (Claude) approval
 *   - Changes must be reflected in SHARED_CHANGELOG.md
 *   - Breaking changes require version bump
 *
 * ENFORCEMENT LEVELS:
 *   'strict'  — Reject any request with hardcoded provider (production)
 *   'warn'    — Allow but log warning (development)
 *   'audit'   — Silent logging only (migration period)
 */

import { supabase } from '@/integrations/supabase/client';
import {
  getImageRegionRouting,
  getVideoRegionRouting,
  getAvatarRegionRouting,
  getTranslationRegionRouting,
  getTTSRouting,
  getZoneForCountry,
  getZoneForLanguage,
  type RegionalZone,
  ROUTING_SUMMARY,
  IMAGE_REGION_ROUTING,
  VIDEO_REGION_ROUTING,
  AVATAR_REGION_ROUTING,
  TRANSLATION_REGION_ROUTING,
} from '@/config/master-provider-routing-registry';
import { enrichPromptWithRegion } from '@/services/brand-intelligence/castCreativeStylesRegistry';
import { getEnrichmentBridge } from '@/services/brand-intelligence/universalEnrichmentBridge';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type AIAction =
  | 'image_generation'
  | 'video_generation'
  | 'text_generation'
  | 'tts'
  | 'stt'
  | 'translation'
  | 'avatar_generation'
  | 'music_generation'
  | 'voice_cloning';

export type EnforcementLevel = 'strict' | 'warn' | 'audit';

export interface RoutedAIRequest {
  action: AIAction;
  prompt: string;
  /** ISO country code (US, JP, AE, etc.) or subregion code (NAM_US, CJK_JP, etc.) */
  regionCode?: string;
  countryCode?: string;
  languageCode?: string;
  /** If set, BYPASSES routing — only allowed if caller is whitelisted */
  overrideProvider?: string;
  overrideModel?: string;
  /** Additional params passed to ai-universal-processor */
  params?: Record<string, any>;
  /** Product context for enrichment */
  product?: 'spark' | 'mind' | 'vibe' | 'deck' | 'hub' | 'cast' | 'ask';
  /** Whether to enrich the prompt via the enrichment bridge */
  enrich?: boolean;
}

export type RoutingTier = 'primary' | 'secondary' | 'tertiary' | 'last_resort' | 'override';

export interface RoutedAIResponse {
  data: unknown;
  provider: string;
  model: string;
  zone: RegionalZone;
  tier: RoutingTier;
  routingDecision: string;
  enriched: boolean;
  latencyMs: number;
  error?: string;
}

export interface RoutingViolation {
  file: string;
  line?: number;
  type: 'direct_invoke' | 'hardcoded_provider' | 'hardcoded_model' | 'missing_zone' | 'bypass_attempt';
  detail: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER MODEL MAP (single source — synced from master registry)
// ═══════════════════════════════════════════════════════════════════════════════

const PROVIDER_MODEL_MAP: Record<string, { provider: string; model: string }> = {
  // Image
  gemini_3_pro:    { provider: 'gemini',    model: 'gemini-2.5-flash' },
  vertex_imagen3:  { provider: 'gemini',    model: 'imagen-3.0-generate-001' },
  alibaba_wanx:    { provider: 'alibaba',   model: 'wanx-v1' },
  modelslab_flux:  { provider: 'modelslab', model: 'flux-schnell' },
  openai_dalle:    { provider: 'openai',    model: 'gpt-image-1' },
  banana_nano:     { provider: 'gemini',    model: 'gemini-2.5-flash' },
  // Video
  vertex_veo3:     { provider: 'google',    model: 'veo-3' },
  sora2:           { provider: 'openai',    model: 'sora-2' },
  alibaba_wan26:   { provider: 'alibaba',   model: 'wan-2.6' },
  modelslab_video: { provider: 'modelslab', model: 'animatediff' },
  // LLM
  claude_sonnet:   { provider: 'anthropic', model: 'claude-sonnet-4-6' },
  qwen_max:        { provider: 'alibaba',   model: 'qwen-max' },
  gemini_pro:      { provider: 'google',    model: 'gemini-pro' },
  gpt_4o:          { provider: 'openai',    model: 'gpt-4o' },
  // TTS
  azure_neural:    { provider: 'azure',     model: 'neural-tts' },
  alibaba_qwen3:   { provider: 'alibaba',   model: 'qwen3-tts' },
  google_tts:      { provider: 'google',    model: 'google-tts' },
  elevenlabs:      { provider: 'elevenlabs', model: 'eleven-multilingual-v2' },
  // Avatar
  alibaba_wan22:   { provider: 'alibaba',   model: 'wan-2.2-s2v' },
  meshy_3d:        { provider: 'meshy',     model: 'meshy-6' }, // meshy-4 sunset 2026-03-20
};

Object.freeze(PROVIDER_MODEL_MAP);

// ═══════════════════════════════════════════════════════════════════════════════
// SUBREGION → COUNTRY CODE MAP (for zone resolution)
// ═══════════════════════════════════════════════════════════════════════════════

const SUBREGION_TO_COUNTRY: Record<string, string> = {
  NAM_US: 'US', NAM_CA: 'CA',
  EU_DACH: 'DE', EU_FRANCE: 'FR', EU_IBERIA: 'ES', EU_NORDIC: 'SE', EU_BENELUX: 'NL', EU_ITALY: 'IT',
  MENA_GULF: 'AE', MENA_EGYPT: 'EG', MENA_LEVANT: 'JO', MENA_MAGHREB: 'MA', MENA_ISRAEL: 'IL', MENA_IRAQ: 'IQ',
  INDIA_NORTH: 'IN', INDIA_SOUTH: 'IN', INDIA_EAST: 'IN', INDIA_WEST: 'IN', INDIA_PAN: 'IN',
  CJK_CN: 'CN', CJK_JP: 'JP', CJK_KR: 'KR', CJK_TW: 'TW',
  SEA_MALAY: 'MY', SEA_THAI: 'TH', SEA_VIET: 'VN', SEA_PHIL: 'PH', SEA_PAN: 'SG',
  AFRICA_EAST: 'KE', AFRICA_WEST: 'NG', AFRICA_SOUTH: 'ZA', AFRICA_FRANCO: 'SN',
  LATAM_MX: 'MX', LATAM_BR: 'BR', LATAM_CONE: 'AR', LATAM_ANDES: 'CO', LATAM_CARIB: 'JM',
  OCEANIA_AU: 'AU', OCEANIA_NZ: 'NZ',
  TURKEY_ISTANBUL: 'TR', TURKEY_ANATOLIA: 'TR',
  PK_PUNJAB: 'PK', PK_SINDH: 'PK', PK_KPK: 'PK', PK_URDU: 'PK',
  BD_DHAKA: 'BD', BD_CHITTAGONG: 'BD',
  EE_UKRAINE: 'UA', EE_BALKANS: 'RS', EE_CAUCASUS: 'GE',
  CARIBBEAN_EN: 'JM', CARIBBEAN_FR: 'HT',
  CA_KZ: 'KZ', CA_UZ: 'UZ', CA_AZ: 'AZ',
  SA_NEPAL: 'NP', SA_SRILANKA: 'LK', SA_BHUTAN: 'BT', SA_MALDIVES: 'MV',
  EU_WEST: 'GB', EU_EAST: 'PL',
  MENA_YEMEN: 'YE', MENA_MSA: 'SA',
};

Object.freeze(SUBREGION_TO_COUNTRY);

// ═══════════════════════════════════════════════════════════════════════════════
// ENFORCEMENT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

let enforcementLevel: EnforcementLevel = 'warn';
const routingLog: Array<{ timestamp: number; action: AIAction; zone: RegionalZone; provider: string; tier: RoutingTier; latencyMs: number }> = [];

export function setEnforcementLevel(level: EnforcementLevel) {
  enforcementLevel = level;
}

export function getRoutingLog() {
  return [...routingLog];
}

// Whitelisted files that may use overrideProvider (admin/testing only)
const OVERRIDE_WHITELIST = new Set([
  'GoogleAPITestPanel',
  'AIServiceHealthCheck',
  'ProviderTestBench',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE RESOLUTION (single function for all code paths)
// ═══════════════════════════════════════════════════════════════════════════════

export function resolveZone(request: Pick<RoutedAIRequest, 'regionCode' | 'countryCode' | 'languageCode'>): RegionalZone {
  if (request.countryCode) return getZoneForCountry(request.countryCode);
  if (request.regionCode) {
    const country = SUBREGION_TO_COUNTRY[request.regionCode];
    if (country) return getZoneForCountry(country);
    // Maybe it's already a country code
    if (request.regionCode.length === 2) return getZoneForCountry(request.regionCode);
  }
  if (request.languageCode) return getZoneForLanguage(request.languageCode);
  return 'fallback_zone';
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTING CHAIN BUILDER (from master registry)
// ═══════════════════════════════════════════════════════════════════════════════

function getRoutingChain(action: AIAction, zone: RegionalZone): Array<{ registryId: string; provider: string; model: string; tier: RoutingTier }> {
  let routing: { primary: string; secondary: string; tertiary: string };

  switch (action) {
    case 'image_generation':
      routing = getImageRegionRouting(zone);
      break;
    case 'video_generation':
      routing = getVideoRegionRouting(zone);
      break;
    case 'avatar_generation':
      routing = getAvatarRegionRouting(zone) as any;
      break;
    case 'translation':
      routing = getTranslationRegionRouting(zone);
      break;
    case 'tts':
    case 'stt':
    case 'text_generation':
    case 'music_generation':
    case 'voice_cloning':
    default:
      // For TTS/STT/LLM, use image routing as zone proxy (actual TTS routing is language-based)
      routing = getImageRegionRouting(zone);
      break;
  }

  const chain: Array<{ registryId: string; provider: string; model: string; tier: RoutingTier }> = [];

  for (const [tier, registryId] of [
    ['primary', routing.primary],
    ['secondary', routing.secondary],
    ['tertiary', routing.tertiary],
  ] as const) {
    const mapped = PROVIDER_MODEL_MAP[registryId];
    if (mapped) {
      chain.push({ registryId, ...mapped, tier });
    }
  }

  // Add last resort
  chain.push({ registryId: 'openai_dalle', provider: 'openai', model: 'gpt-image-1', tier: 'last_resort' });
  return chain;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN GATEWAY — THE ONLY AUTHORIZED WAY TO CALL AI PROVIDERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Route an AI request through the enforcement gateway.
 *
 * This is the MANDATORY entry point for all AI provider calls.
 * It resolves the zone, selects providers from the master registry,
 * applies the fallback chain, and optionally enriches the prompt.
 *
 * Usage:
 * ```ts
 * const result = await routeAIRequest({
 *   action: 'image_generation',
 *   prompt: 'A beautiful landscape',
 *   regionCode: 'CJK_JP',    // → alibaba_zone → Alibaba WanX primary
 *   enrich: true,              // → enrichPromptWithRegion + enrichment bridge
 *   product: 'cast',           // → Cast-specific enrichment
 * });
 * ```
 */
export async function routeAIRequest(request: RoutedAIRequest): Promise<RoutedAIResponse> {
  const startTime = Date.now();
  const zone = resolveZone(request);

  // Enforcement: check for override attempts
  if (request.overrideProvider && enforcementLevel === 'strict') {
    return {
      data: null,
      provider: '',
      model: '',
      zone,
      tier: 'primary',
      routingDecision: 'BLOCKED: overrideProvider not allowed in strict mode',
      enriched: false,
      latencyMs: Date.now() - startTime,
      error: 'Provider override blocked by routing enforcement. Use the routing gateway without overrides.',
    };
  }

  if (request.overrideProvider && enforcementLevel === 'warn') {
    console.warn(`[RoutingGateway] WARNING: Override provider '${request.overrideProvider}' used. This bypasses zone routing for zone '${zone}'.`);
  }

  // Enrich prompt if requested
  let enrichedPrompt = request.prompt;
  let wasEnriched = false;

  if (request.enrich && request.regionCode) {
    try {
      // Layer 1: Regional cultural context
      enrichedPrompt = enrichPromptWithRegion(enrichedPrompt, request.regionCode);

      // Layer 2: Enrichment bridge (brand + competitive + regional narrative)
      const bridge = getEnrichmentBridge();
      const result = await bridge.enrichPrompt(enrichedPrompt, {
        product: request.product as any,
        includeCompetitive: false,
        includeRegional: true,
      });
      enrichedPrompt = result.enrichedPrompt;
      wasEnriched = true;
    } catch {
      // Graceful degradation
    }
  }

  // Build routing chain from master registry
  const chain = getRoutingChain(request.action, zone);

  // If override is allowed (warn/audit mode), prepend it
  if (request.overrideProvider) {
    const overrideModel = request.overrideModel || chain[0]?.model || 'gemini-2.5-flash';
    chain.unshift({
      registryId: 'manual_override',
      provider: request.overrideProvider,
      model: overrideModel,
      tier: 'override',
    });
  }

  // Try each tier in the fallback chain
  for (const { provider, model, tier } of chain) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: request.action,
          prompt: enrichedPrompt,
          provider,
          model,
          ...request.params,
        },
      });

      if (error) throw error;

      const latencyMs = Date.now() - startTime;

      // Log for audit
      routingLog.push({
        timestamp: Date.now(),
        action: request.action,
        zone,
        provider,
        tier,
        latencyMs,
      });

      // Trim log to last 100 entries
      if (routingLog.length > 100) routingLog.splice(0, routingLog.length - 100);

      return {
        data,
        provider,
        model,
        zone,
        tier,
        routingDecision: `Zone: ${zone} → ${tier}: ${provider}/${model}`,
        enriched: wasEnriched,
        latencyMs,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[RoutingGateway] ${tier} '${provider}/${model}' failed for zone '${zone}': ${message}. Trying next...`);
      continue;
    }
  }

  // All tiers exhausted
  return {
    data: null,
    provider: '',
    model: '',
    zone,
    tier: 'last_resort',
    routingDecision: `Zone: ${zone} → ALL TIERS EXHAUSTED`,
    enriched: wasEnriched,
    latencyMs: Date.now() - startTime,
    error: 'All providers in fallback chain failed',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD-TIME COMPLIANCE VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Patterns that indicate routing violations.
 * Used by the build-time validator and can be consumed by ESLint rules.
 */
export const VIOLATION_PATTERNS = {
  /** Files that should NEVER directly invoke supabase functions for AI */
  directInvoke: /supabase\.functions\.invoke\s*\(\s*['"]ai-universal-processor['"]/,
  /** Hardcoded provider strings in non-config files */
  hardcodedProvider: /provider:\s*['"](?:openai|gemini|alibaba|modelslab|elevenlabs|azure|deepgram)['"]/,
  /** Hardcoded model strings in non-config files */
  hardcodedModel: /model:\s*['"](?:gpt-4o|gpt-4o-mini|gemini-2\.0-flash|gpt-image-1|wanx-v1|flux-schnell|claude-3)['"]/,
  /** Direct provider-specific edge function calls */
  directProviderFunction: /supabase\.functions\.invoke\s*\(\s*['"](?:gemini-generate|openai-tts|elevenlabs-|huggingface-)/,
} as const;

/** Files/patterns that are EXEMPT from routing enforcement */
export const ENFORCEMENT_EXEMPTIONS = {
  /** Config files that define the routing */
  configFiles: [
    'master-provider-routing-registry.ts',
    'routingEnforcementGateway.ts',
    'imagePreviewService.ts',
    'dashboardThumbnailService.ts',
    'providerRegistry.ts',
    'unifiedProviderRoutingAdapter.ts',
    'llmRoutingStrategy.ts',
  ],
  /** Admin/test files allowed to bypass for testing */
  testFiles: [
    'GoogleAPITestPanel.tsx',
    'AIServiceHealthCheck.tsx',
    'ProviderTestBench.tsx',
  ],
} as const;

/**
 * Validate routing compliance for a file's content.
 * Returns violations found. Used by build scripts and CI.
 *
 * Usage in a build script:
 * ```ts
 * import { validateFileCompliance } from '@/services/ai-hub/routingEnforcementGateway';
 * const violations = validateFileCompliance(fileContent, filePath);
 * if (violations.length > 0) throw new Error('Routing violations found!');
 * ```
 */
export function validateFileCompliance(content: string, filePath: string): RoutingViolation[] {
  const violations: RoutingViolation[] = [];
  const fileName = filePath.split('/').pop() || '';

  // Skip exempt files
  if (ENFORCEMENT_EXEMPTIONS.configFiles.some(f => fileName === f)) return [];
  if (ENFORCEMENT_EXEMPTIONS.testFiles.some(f => fileName === f)) return [];

  // Check for direct ai-universal-processor invocations
  if (VIOLATION_PATTERNS.directInvoke.test(content)) {
    violations.push({
      file: filePath,
      type: 'direct_invoke',
      detail: 'Direct supabase.functions.invoke("ai-universal-processor") call. Use routeAIRequest() from routingEnforcementGateway instead.',
      severity: 'critical',
    });
  }

  // Check for direct provider-specific function calls
  if (VIOLATION_PATTERNS.directProviderFunction.test(content)) {
    violations.push({
      file: filePath,
      type: 'direct_invoke',
      detail: 'Direct provider-specific edge function call. All AI calls must go through routeAIRequest().',
      severity: 'critical',
    });
  }

  // Check for hardcoded providers in non-config component files
  if (filePath.includes('/components/') || filePath.includes('/hooks/') || filePath.includes('/pages/')) {
    if (VIOLATION_PATTERNS.hardcodedProvider.test(content)) {
      violations.push({
        file: filePath,
        type: 'hardcoded_provider',
        detail: 'Hardcoded provider string in component/hook/page. Provider selection must come from the routing gateway.',
        severity: 'high',
      });
    }
    if (VIOLATION_PATTERNS.hardcodedModel.test(content)) {
      violations.push({
        file: filePath,
        type: 'hardcoded_model',
        detail: 'Hardcoded model string in component/hook/page. Model selection must come from the routing gateway.',
        severity: 'high',
      });
    }
  }

  return violations;
}

/**
 * Validate that the routing registry is intact and hasn't been tampered with.
 * Call this at app startup to verify integrity.
 */
export function validateRoutingIntegrity(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Verify all zone routing tables exist and are frozen
  for (const zone of ['claude_zone', 'alibaba_zone', 'gemini_zone', 'fallback_zone'] as RegionalZone[]) {
    const imageRouting = getImageRegionRouting(zone);
    if (!imageRouting?.primary || !imageRouting?.secondary || !imageRouting?.tertiary) {
      issues.push(`IMAGE_REGION_ROUTING missing tiers for ${zone}`);
    }
    const videoRouting = getVideoRegionRouting(zone);
    if (!videoRouting?.primary) {
      issues.push(`VIDEO_REGION_ROUTING missing primary for ${zone}`);
    }
  }

  // Verify Object.freeze is in effect
  if (!Object.isFrozen(IMAGE_REGION_ROUTING)) {
    issues.push('IMAGE_REGION_ROUTING is NOT frozen — Object.freeze failed');
  }

  // Verify provider model map is frozen
  if (!Object.isFrozen(PROVIDER_MODEL_MAP)) {
    issues.push('PROVIDER_MODEL_MAP is NOT frozen');
  }

  return { valid: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { SUBREGION_TO_COUNTRY, PROVIDER_MODEL_MAP };
