/**
 * DYNAMIC MODEL RESOLVER — DB-Driven AI Model Resolution
 *
 * Single entry point for ALL model resolution in edge functions.
 * Loads from ai_model_registry DB table with 5-min in-memory cache.
 * Falls back to hardcoded ACTIVE_MODELS if DB is unreachable.
 *
 * Usage:
 *   const model = await resolveModel('claude-3-5-sonnet-20241022');
 *   // → 'claude-sonnet-4-6' (follows alias + replaced_by chain)
 *
 *   const model = await getActiveModelFromDB('anthropic', 'llm');
 *   // → 'claude-sonnet-4-6'
 *
 *   const route = await getRegionalModel('mena', 'llm');
 *   // → { primary: 'qwen-max', fallbacks: ['gpt-4o', ...] }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface ModelRegistryEntry {
  model_id: string;
  model_alias: string[];
  display_name: string;
  provider: string;
  capabilities: string[];
  status: string;
  replaced_by: string | null;
  sunset_date: string | null;
  quality_tier: string;
  speed_tier: string;
  api_endpoint: string | null;
  supports_vision: boolean;
  supports_function_calling: boolean;
  supports_streaming: boolean;
  meta: Record<string, unknown>;
}

interface RegionalRoutingEntry {
  region: string;
  sub_region: string | null;
  language_code: string | null;
  capability: string;
  primary_model_id: string;
  fallback_model_ids: string[];
  reason: string | null;
  is_active: boolean;
  priority: number;
}

interface RegionalModelResult {
  primary: string;
  fallbacks: string[];
  reason?: string;
}

// ─── CACHE ──────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let modelCache: ModelRegistryEntry[] | null = null;
let routingCache: RegionalRoutingEntry[] | null = null;
let cacheTimestamp = 0;

// Alias lookup map: alias → canonical model_id
let aliasMap: Map<string, string> | null = null;
// model_id → entry lookup
let modelMap: Map<string, ModelRegistryEntry> | null = null;

function isCacheValid(): boolean {
  return modelCache !== null && (Date.now() - cacheTimestamp) < CACHE_TTL_MS;
}

// ─── HARDCODED FALLBACKS ────────────────────────────────────────────────────
// Used ONLY when DB is completely unreachable AND cache is expired.

const FALLBACK_MODELS: Record<string, Record<string, string>> = {
  anthropic: { llm: 'claude-sonnet-4-6', vision: 'claude-sonnet-4-6' },
  openai: { llm: 'gpt-4o', 'image-gen': 'gpt-image-1', stt: 'whisper-1', tts: 'tts-1-hd', 'text-to-video': 'sora-2.0-turbo' },
  gemini: { llm: 'gemini-2.5-pro', 'image-gen': 'gemini-nano-banana', 'text-to-video': 'veo-3.1-generate' },
  alibaba: { llm: 'qwen-max', 'text-to-video': 'wan2.6-t2v', 'text-to-image': 'wan2.6-t2i', tts: 'cosyvoice-v3-flash', stt: 'paraformer' },
  elevenlabs: { tts: 'eleven_multilingual_v2' },
  deepseek: { llm: 'deepseek-chat' },
  flux: { 'text-to-image': 'flux-pro' },
  replicate: { lipsync: 'sadtalker' },
  modelslab: { 'text-to-video': 'animatediff', 'text-to-image': 'modelslab-flux' },
  deepgram: { stt: 'nova-3' },
  meshy: { 'text-to-3d': 'meshy-6' },
  stability: { 'text-to-image': 'stable-diffusion-xl' },
};

// Alias fallback for when DB is down — maps known retired IDs to current
const FALLBACK_ALIASES: Record<string, string> = {
  'claude-3-5-sonnet-20241022': 'claude-sonnet-4-6',
  'claude-3-5-sonnet': 'claude-sonnet-4-6',
  'claude-sonnet-latest': 'claude-sonnet-4-6',
  'claude-3-5-haiku-20241022': 'claude-haiku-4-5',
  'claude-3-5-haiku': 'claude-haiku-4-5',
  'claude-opus-4-1-20250805': 'claude-opus-4-6',
  'dall-e-3': 'gpt-image-1',
  'dall-e-2': 'gpt-image-1',
  'gemini-1.5-pro': 'gemini-2.5-pro',
  'gemini-1.5-flash': 'gemini-2.5-flash',
  'gemini-pro': 'gemini-2.5-pro',
  'eleven_monolingual_v1': 'eleven_multilingual_v2',
  'eleven_multilingual_v1': 'eleven_multilingual_v2',
  'nova-2': 'nova-3',
  'meshy-4': 'meshy-6',
  'wan2.1-t2v': 'wan2.6-t2v',
  'wan2.1-i2v': 'wan2.6-i2v',
};

// ─── DB LOADER ──────────────────────────────────────────────────────────────

function getSupabaseClient() {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  return createClient(url, key);
}

async function loadFromDB(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

    const [modelsResult, routingResult] = await Promise.all([
      supabase.from('ai_model_registry').select('*'),
      supabase.from('ai_model_regional_routing').select('*').eq('is_active', true),
    ]);

    if (modelsResult.error) {
      console.warn('[ModelResolver] DB load failed:', modelsResult.error.message);
      return false;
    }

    modelCache = modelsResult.data as ModelRegistryEntry[];
    routingCache = (routingResult.data ?? []) as RegionalRoutingEntry[];
    cacheTimestamp = Date.now();

    // Build lookup maps
    aliasMap = new Map();
    modelMap = new Map();

    for (const entry of modelCache) {
      modelMap.set(entry.model_id, entry);
      // Map each alias to the canonical model_id
      for (const alias of (entry.model_alias ?? [])) {
        aliasMap.set(alias, entry.model_id);
      }
    }

    console.log(`[ModelResolver] Loaded ${modelCache.length} models, ${routingCache.length} routes from DB`);
    return true;
  } catch (err) {
    console.warn('[ModelResolver] DB load exception:', err);
    return false;
  }
}

async function ensureCache(): Promise<void> {
  if (!isCacheValid()) {
    await loadFromDB();
  }
}

// ─── PUBLIC API ─────────────────────────────────────────────────────────────

/**
 * Resolve any model ID or alias to the current canonical model_id.
 *
 * Resolution order:
 * 1. Direct match on model_id → return if active/preview
 * 2. Alias match → return canonical model_id
 * 3. Deprecated/sunset/retired → follow replaced_by chain
 * 4. Hardcoded fallback alias (if DB down)
 * 5. Pass through unchanged (provider handles unknown)
 */
export async function resolveModel(modelIdOrAlias: string): Promise<string> {
  await ensureCache();

  // Try DB-backed resolution
  if (modelMap && aliasMap) {
    // 1. Direct match
    const directEntry = modelMap.get(modelIdOrAlias);
    if (directEntry) {
      if (directEntry.status === 'active' || directEntry.status === 'preview') {
        return directEntry.model_id;
      }
      // Follow replaced_by chain (max 5 hops to avoid infinite loops)
      if (directEntry.replaced_by) {
        return followReplacementChain(directEntry.replaced_by, 5);
      }
      return directEntry.model_id; // No replacement known
    }

    // 2. Alias match
    const aliasTarget = aliasMap.get(modelIdOrAlias);
    if (aliasTarget) {
      const targetEntry = modelMap.get(aliasTarget);
      if (targetEntry) {
        if (targetEntry.status === 'active' || targetEntry.status === 'preview') {
          return targetEntry.model_id;
        }
        if (targetEntry.replaced_by) {
          return followReplacementChain(targetEntry.replaced_by, 5);
        }
      }
      return aliasTarget;
    }
  }

  // 3. Hardcoded fallback aliases (DB unavailable)
  if (FALLBACK_ALIASES[modelIdOrAlias]) {
    return FALLBACK_ALIASES[modelIdOrAlias];
  }

  // 4. Pass through unchanged
  return modelIdOrAlias;
}

/**
 * Synchronous version — uses cache only, no DB fetch.
 * Use after ensureCache() has been called at least once.
 */
export function resolveModelSync(modelIdOrAlias: string): string {
  if (modelMap && aliasMap) {
    const directEntry = modelMap.get(modelIdOrAlias);
    if (directEntry) {
      if (directEntry.status === 'active' || directEntry.status === 'preview') {
        return directEntry.model_id;
      }
      if (directEntry.replaced_by) {
        return followReplacementChainSync(directEntry.replaced_by, 5);
      }
      return directEntry.model_id;
    }

    const aliasTarget = aliasMap.get(modelIdOrAlias);
    if (aliasTarget) return aliasTarget;
  }

  return FALLBACK_ALIASES[modelIdOrAlias] ?? modelIdOrAlias;
}

function followReplacementChain(modelId: string, maxHops: number): string {
  if (maxHops <= 0 || !modelMap) return modelId;
  const entry = modelMap.get(modelId);
  if (!entry) return modelId;
  if (entry.status === 'active' || entry.status === 'preview') return entry.model_id;
  if (entry.replaced_by) return followReplacementChain(entry.replaced_by, maxHops - 1);
  return modelId;
}

function followReplacementChainSync(modelId: string, maxHops: number): string {
  if (maxHops <= 0 || !modelMap) return modelId;
  const entry = modelMap.get(modelId);
  if (!entry) return modelId;
  if (entry.status === 'active' || entry.status === 'preview') return entry.model_id;
  if (entry.replaced_by) return followReplacementChainSync(entry.replaced_by, maxHops - 1);
  return modelId;
}

/**
 * Get the current active model for a provider + capability.
 */
export async function getActiveModelFromDB(
  provider: string,
  capability: string
): Promise<string | undefined> {
  await ensureCache();

  if (modelCache) {
    const match = modelCache.find(
      m => m.provider === provider &&
           m.capabilities.includes(capability) &&
           (m.status === 'active' || m.status === 'preview')
    );
    if (match) return match.model_id;
  }

  // Hardcoded fallback
  return FALLBACK_MODELS[provider]?.[capability];
}

/**
 * Get all active models for a provider.
 */
export async function getActiveModelsForProviderFromDB(
  provider: string
): Promise<ModelRegistryEntry[]> {
  await ensureCache();
  if (!modelCache) return [];
  return modelCache.filter(
    m => m.provider === provider && (m.status === 'active' || m.status === 'preview')
  );
}

/**
 * Get all active models with a specific capability.
 */
export async function getModelsForCapabilityFromDB(
  capability: string
): Promise<ModelRegistryEntry[]> {
  await ensureCache();
  if (!modelCache) return [];
  return modelCache.filter(
    m => m.capabilities.includes(capability) && (m.status === 'active' || m.status === 'preview')
  );
}

/**
 * Get regional model routing for a region + capability.
 */
export async function getRegionalModel(
  region: string,
  capability: string,
  subRegion?: string,
  languageCode?: string
): Promise<RegionalModelResult | undefined> {
  await ensureCache();

  if (routingCache) {
    // Try most specific first: language + sub-region
    const routes = routingCache
      .filter(r => r.region === region && r.capability === capability && r.is_active)
      .sort((a, b) => {
        // Prefer more specific matches (language > sub_region > region-only)
        const aSpec = (a.language_code ? 2 : 0) + (a.sub_region ? 1 : 0);
        const bSpec = (b.language_code ? 2 : 0) + (b.sub_region ? 1 : 0);
        if (aSpec !== bSpec) return bSpec - aSpec;
        return b.priority - a.priority;
      });

    // Find best match
    for (const route of routes) {
      if (languageCode && route.language_code === languageCode) {
        return { primary: route.primary_model_id, fallbacks: route.fallback_model_ids, reason: route.reason ?? undefined };
      }
      if (subRegion && route.sub_region === subRegion) {
        return { primary: route.primary_model_id, fallbacks: route.fallback_model_ids, reason: route.reason ?? undefined };
      }
      if (!route.language_code && !route.sub_region) {
        return { primary: route.primary_model_id, fallbacks: route.fallback_model_ids, reason: route.reason ?? undefined };
      }
    }
  }

  return undefined;
}

/**
 * Get full model info by ID.
 */
export async function getModelInfo(modelId: string): Promise<ModelRegistryEntry | undefined> {
  await ensureCache();
  return modelMap?.get(modelId);
}

/**
 * Get all models from the registry.
 */
export async function getAllModels(): Promise<ModelRegistryEntry[]> {
  await ensureCache();
  return modelCache ?? [];
}

/**
 * Force reload from DB on next call.
 */
export function invalidateModelCache(): void {
  modelCache = null;
  routingCache = null;
  aliasMap = null;
  modelMap = null;
  cacheTimestamp = 0;
}

/**
 * Pre-warm the cache. Call at edge function startup.
 */
export async function warmModelCache(): Promise<void> {
  await loadFromDB();
}

/**
 * Get sunset warnings — models expiring within N days.
 */
export async function getSunsetWarnings(withinDays = 30): Promise<ModelRegistryEntry[]> {
  await ensureCache();
  if (!modelCache) return [];

  const now = Date.now();
  const windowMs = withinDays * 24 * 60 * 60 * 1000;

  return modelCache.filter(m => {
    if (!m.sunset_date) return false;
    const sunsetMs = new Date(m.sunset_date).getTime();
    return sunsetMs - now <= windowMs && sunsetMs > now;
  });
}
