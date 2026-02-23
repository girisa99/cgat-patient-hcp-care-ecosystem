/**
 * Image Preview Service — Phase 6B (B-009) + 4-Zone Routing Integration
 *
 * Routes image generation preview requests to the appropriate provider
 * using the LOCKED master-provider-routing-registry 4-Zone architecture.
 *
 * Routing chain:
 *   1. Resolve regionCode → countryCode → RegionalZone via getZoneForCountry()
 *   2. Get IMAGE_REGION_ROUTING[zone] → { primary, secondary, tertiary }
 *   3. Try primary → secondary → tertiary → LAST_RESORT (DALL-E)
 *   4. Each tier maps to: provider ID + AI model + edge function call
 *
 * Zone routing (from master registry):
 *   claude_zone   → Gemini 3 Pro → Vertex Imagen 3 → ModelsLab FLUX
 *   alibaba_zone  → Alibaba WanX → Gemini 3 Pro → Vertex Imagen 3
 *   gemini_zone   → Gemini 3 Pro → Vertex Imagen 3 → ModelsLab FLUX
 *   fallback_zone → Gemini 3 Pro → ModelsLab FLUX → OpenAI DALL-E
 */

import { supabase } from '@/integrations/supabase/client';
import {
  getImageRegionRouting,
  getZoneForCountry,
  type RegionalZone,
} from '@/config/master-provider-routing-registry';

export type ImageProvider = 'gemini' | 'openai' | 'alibaba' | 'modelslab' | 'vertex_imagen';

export interface ImagePreviewRequest {
  prompt: string;
  style: string;
  width?: number;
  height?: number;
  regionCode?: string;
  countryCode?: string;
  zone?: RegionalZone;
  provider?: ImageProvider;
}

export interface ImagePreviewResult {
  imageUrl: string;
  provider: ImageProvider;
  generationTimeMs: number;
  zone?: RegionalZone;
  tier?: 'primary' | 'secondary' | 'tertiary' | 'last_resort';
  error?: string;
}

/** Map master registry provider IDs to our ImageProvider type + model */
const PROVIDER_MODEL_MAP: Record<string, { provider: ImageProvider; model: string }> = {
  gemini_3_pro:    { provider: 'gemini',         model: 'gemini-2.0-flash' },
  vertex_imagen3:  { provider: 'vertex_imagen',  model: 'imagen-3.0-generate-001' },
  alibaba_wanx:    { provider: 'alibaba',        model: 'wanx-v1' },
  modelslab_flux:  { provider: 'modelslab',       model: 'flux-schnell' },
  openai_dalle:    { provider: 'openai',          model: 'dall-e-3' },
  banana_nano:     { provider: 'gemini',          model: 'gemini-2.5-flash' },
};

const LAST_RESORT = { provider: 'openai' as ImageProvider, model: 'dall-e-3' };

/** Map subregion code (NAM_US, CJK_JP, etc.) to ISO country code for zone lookup */
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
};

/**
 * Resolve region to a 4-Zone using the master routing registry.
 * Accepts: subregion code (NAM_US), ISO country code (US), or zone directly.
 */
export function resolveZone(request: Pick<ImagePreviewRequest, 'regionCode' | 'countryCode' | 'zone'>): RegionalZone {
  if (request.zone) return request.zone;
  if (request.countryCode) return getZoneForCountry(request.countryCode);
  if (request.regionCode) {
    const country = SUBREGION_TO_COUNTRY[request.regionCode];
    if (country) return getZoneForCountry(country);
  }
  return 'fallback_zone';
}

/**
 * Build the 4-tier fallback chain for image generation from master registry.
 * Returns providers in order: primary → secondary → tertiary → last_resort
 */
function buildFallbackChain(zone: RegionalZone): Array<{ provider: ImageProvider; model: string; tier: string }> {
  const routing = getImageRegionRouting(zone);
  const chain: Array<{ provider: ImageProvider; model: string; tier: string }> = [];

  for (const [tier, registryId] of [
    ['primary', routing.primary],
    ['secondary', routing.secondary],
    ['tertiary', routing.tertiary],
  ] as const) {
    const mapped = PROVIDER_MODEL_MAP[registryId];
    if (mapped) {
      chain.push({ ...mapped, tier });
    }
  }

  // Always add DALL-E as last resort
  chain.push({ ...LAST_RESORT, tier: 'last_resort' });
  return chain;
}

/**
 * Generate a style preview image with 4-Zone routing + multi-tier fallback.
 * Calls ai-universal-processor with the correct provider from master registry.
 */
export async function generateStylePreview(request: ImagePreviewRequest): Promise<ImagePreviewResult> {
  const zone = resolveZone(request);
  const startTime = Date.now();

  // If caller explicitly set a provider, use it directly (bypass routing)
  if (request.provider) {
    return callImageProvider(request, request.provider,
      PROVIDER_MODEL_MAP[Object.keys(PROVIDER_MODEL_MAP).find(k => PROVIDER_MODEL_MAP[k].provider === request.provider) || '']?.model || 'gemini-2.0-flash',
      zone, 'primary', startTime);
  }

  // Use the 4-tier fallback chain from master registry
  const chain = buildFallbackChain(zone);

  for (const { provider, model, tier } of chain) {
    const result = await callImageProvider(request, provider, model, zone, tier as any, startTime);
    if (!result.error && result.imageUrl) {
      return result;
    }
    // Log fallback for observability
    console.warn(`[ImagePreview] ${tier} provider '${provider}' failed for zone '${zone}', trying next...`);
  }

  // All tiers exhausted
  return {
    imageUrl: '',
    provider: 'openai',
    generationTimeMs: Date.now() - startTime,
    zone,
    tier: 'last_resort',
    error: 'All image generation providers failed',
  };
}

/** Internal: call a single image provider via ai-universal-processor */
async function callImageProvider(
  request: ImagePreviewRequest,
  provider: ImageProvider,
  model: string,
  zone: RegionalZone,
  tier: 'primary' | 'secondary' | 'tertiary' | 'last_resort',
  startTime: number,
): Promise<ImagePreviewResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'image_generation',
        prompt: `${request.prompt}. Style: ${request.style}. High quality, professional, suitable for video production thumbnail.`,
        width: request.width || 512,
        height: request.height || 512,
        provider,
        model,
      },
    });

    if (error) throw error;

    return {
      imageUrl: data?.imageUrl || data?.url || '',
      provider,
      generationTimeMs: Date.now() - startTime,
      zone,
      tier,
    };
  } catch (err: any) {
    return {
      imageUrl: '',
      provider,
      generationTimeMs: Date.now() - startTime,
      zone,
      tier,
      error: err.message || 'Image generation failed',
    };
  }
}

/**
 * Generate multiple preview thumbnails for a batch of styles.
 * Uses 4-Zone routing for each request.
 */
export async function generateBatchPreviews(
  styles: Array<{ name: string; prompt: string }>,
  regionCode: string = 'NAM_US',
  concurrency: number = 3,
): Promise<Map<string, ImagePreviewResult>> {
  const results = new Map<string, ImagePreviewResult>();
  const queue = [...styles];

  async function processNext() {
    while (queue.length > 0) {
      const style = queue.shift()!;
      const result = await generateStylePreview({
        prompt: style.prompt,
        style: style.name,
        regionCode,
      });
      results.set(style.name, result);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, styles.length) }, () => processNext());
  await Promise.all(workers);

  return results;
}
