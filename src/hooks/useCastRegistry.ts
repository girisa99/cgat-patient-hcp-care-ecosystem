/**
 * useCastRegistry — DB-driven hooks for the progressive wizard
 * 
 * Fetches from cast_* registry tables with caching.
 * Provides: styles, capabilities, providers, platforms, intents
 * Plus: token estimation engine
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface CastVideoStyle {
  id: string;
  value: string;
  label: string;
  icon: string;
  style_group: string;
  description: string | null;
  base_token_cost: number;
  is_active: boolean;
  is_system_default: boolean;
  sort_order: number;
}

export interface CastAICapability {
  id: string;
  value: string;
  label: string;
  icon: string;
  description: string | null;
  base_token_cost: number;
  is_active: boolean;
}

export interface CastStyleCapabilityMap {
  id: string;
  style_value: string;
  capability_value: string;
  is_required: boolean;
  token_multiplier: number;
}

export interface CastCapabilityProviderMap {
  id: string;
  capability_value: string;
  provider_value: string;
  provider_label: string;
  fallback_order: number;
  zone: string;
  is_active: boolean;
}

export interface CastStylePlatformMap {
  id: string;
  style_value: string;
  platform_id: string;
  is_recommended: boolean;
  sort_order: number;
}

export interface CastIntentStyleMap {
  id: string;
  intent_value: string;
  style_value: string;
  relevance_score: number;
  sort_order: number;
}

// ============================================================================
// TOKEN ESTIMATION
// ============================================================================

export type TokenTier = 'light' | 'moderate' | 'heavy' | 'premium';

export interface TokenEstimate {
  totalTokens: number;
  tier: TokenTier;
  tierLabel: string;
  tierColor: string;
  breakdown: Array<{
    capability: string;
    capabilityLabel: string;
    tokens: number;
    multiplier: number;
    isRequired: boolean;
  }>;
  platformMultiplier: number;
  regionMultiplier: number;
  estimatedMinutes: number;
}

function getTokenTier(tokens: number): { tier: TokenTier; label: string; color: string } {
  if (tokens <= 300) return { tier: 'light', label: 'Light', color: 'text-green-600' };
  if (tokens <= 600) return { tier: 'moderate', label: 'Moderate', color: 'text-yellow-600' };
  if (tokens <= 1000) return { tier: 'heavy', label: 'Heavy', color: 'text-orange-600' };
  return { tier: 'premium', label: 'Premium', color: 'text-red-600' };
}

export function estimateTokens(
  selectedStyles: string[],
  selectedCapabilities: string[],
  capabilities: CastAICapability[],
  styleCapMap: CastStyleCapabilityMap[],
  platformCount: number = 1,
  regionCount: number = 1,
): TokenEstimate {
  const breakdown: TokenEstimate['breakdown'] = [];

  // Deduplicate capabilities across selected styles
  const uniqueCaps = new Map<string, { multiplier: number; isRequired: boolean }>();

  for (const styleVal of selectedStyles) {
    const mappings = styleCapMap.filter(m => m.style_value === styleVal);
    for (const mapping of mappings) {
      if (!selectedCapabilities.includes(mapping.capability_value)) continue;
      const existing = uniqueCaps.get(mapping.capability_value);
      if (!existing || mapping.token_multiplier > existing.multiplier) {
        uniqueCaps.set(mapping.capability_value, {
          multiplier: mapping.token_multiplier,
          isRequired: mapping.is_required,
        });
      }
    }
  }

  let baseTokens = 0;
  for (const [capValue, info] of uniqueCaps) {
    const cap = capabilities.find(c => c.value === capValue);
    if (!cap) continue;
    const tokens = Math.round(cap.base_token_cost * info.multiplier);
    baseTokens += tokens;
    breakdown.push({
      capability: capValue,
      capabilityLabel: cap.label,
      tokens,
      multiplier: info.multiplier,
      isRequired: info.isRequired,
    });
  }

  const platformMultiplier = Math.max(1, platformCount * 0.8);
  const regionMultiplier = Math.max(1, regionCount * 0.6);
  const totalTokens = Math.round(baseTokens * platformMultiplier * regionMultiplier);
  const { tier, label, color } = getTokenTier(totalTokens);

  return {
    totalTokens,
    tier,
    tierLabel: label,
    tierColor: color,
    breakdown: breakdown.sort((a, b) => b.tokens - a.tokens),
    platformMultiplier,
    regionMultiplier,
    estimatedMinutes: Math.max(1, Math.round(totalTokens / 100)),
  };
}

// ============================================================================
// HOOKS
// ============================================================================

const CACHE_TIME = 5 * 60 * 1000; // 5 min

/** Fetch all active video styles, optionally filtered by group */
export function useCastStyles(styleGroup?: string) {
  return useQuery({
    queryKey: ['cast-styles', styleGroup],
    queryFn: async () => {
      let q = supabase
        .from('cast_video_styles')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (styleGroup) q = q.eq('style_group', styleGroup);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as CastVideoStyle[];
    },
    staleTime: CACHE_TIME,
  });
}

/** Fetch all active AI capabilities */
export function useCastCapabilities() {
  return useQuery({
    queryKey: ['cast-capabilities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cast_ai_capabilities')
        .select('*')
        .eq('is_active', true)
        .order('value');
      if (error) throw error;
      return (data || []) as unknown as CastAICapability[];
    },
    staleTime: CACHE_TIME,
  });
}

/** Fetch style → capability mappings */
export function useCastStyleCapabilityMap(styleValues?: string[]) {
  return useQuery({
    queryKey: ['cast-style-cap-map', styleValues],
    queryFn: async () => {
      let q = supabase.from('cast_style_capability_map').select('*');
      if (styleValues?.length) q = q.in('style_value', styleValues);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as CastStyleCapabilityMap[];
    },
    staleTime: CACHE_TIME,
    enabled: !styleValues || styleValues.length > 0,
  });
}

/** Fetch capability → provider mappings */
export function useCastCapabilityProviders(capabilityValues?: string[]) {
  return useQuery({
    queryKey: ['cast-cap-providers', capabilityValues],
    queryFn: async () => {
      let q = supabase
        .from('cast_capability_provider_map')
        .select('*')
        .eq('is_active', true)
        .order('fallback_order', { ascending: true });
      if (capabilityValues?.length) q = q.in('capability_value', capabilityValues);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as CastCapabilityProviderMap[];
    },
    staleTime: CACHE_TIME,
    enabled: !capabilityValues || capabilityValues.length > 0,
  });
}

/** Fetch style → platform mappings */
export function useCastStylePlatforms(styleValues?: string[]) {
  return useQuery({
    queryKey: ['cast-style-platforms', styleValues],
    queryFn: async () => {
      let q = supabase
        .from('cast_style_platform_map')
        .select('*')
        .order('sort_order', { ascending: true });
      if (styleValues?.length) q = q.in('style_value', styleValues);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as CastStylePlatformMap[];
    },
    staleTime: CACHE_TIME,
    enabled: !styleValues || styleValues.length > 0,
  });
}

/** Fetch intent → style mappings */
export function useCastIntentStyles(intentValue?: string) {
  return useQuery({
    queryKey: ['cast-intent-styles', intentValue],
    queryFn: async () => {
      let q = supabase
        .from('cast_intent_style_map')
        .select('*')
        .order('sort_order', { ascending: true });
      if (intentValue) q = q.eq('intent_value', intentValue);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as CastIntentStyleMap[];
    },
    staleTime: CACHE_TIME,
  });
}

/** Get unique style groups from styles */
export function useCastStyleGroups() {
  const { data: styles, ...rest } = useCastStyles();
  const groups = [...new Set((styles || []).map(s => s.style_group))].sort();
  return { data: groups, ...rest };
}

// ============================================================================
// DERIVED HELPERS
// ============================================================================

/** Given selected styles, get auto-selected capabilities (required ones) */
export function deriveCapabilities(
  selectedStyles: string[],
  styleCapMap: CastStyleCapabilityMap[],
): { required: string[]; optional: string[] } {
  const required = new Set<string>();
  const optional = new Set<string>();

  for (const styleVal of selectedStyles) {
    const mappings = styleCapMap.filter(m => m.style_value === styleVal);
    for (const m of mappings) {
      if (m.is_required) {
        required.add(m.capability_value);
        optional.delete(m.capability_value); // promote to required
      } else if (!required.has(m.capability_value)) {
        optional.add(m.capability_value);
      }
    }
  }

  return {
    required: [...required],
    optional: [...optional],
  };
}

/** Given selected styles, get recommended platforms */
export function derivePlatforms(
  selectedStyles: string[],
  stylePlatformMap: CastStylePlatformMap[],
): { recommended: string[]; optional: string[] } {
  const recommended = new Set<string>();
  const optional = new Set<string>();

  for (const styleVal of selectedStyles) {
    const mappings = stylePlatformMap.filter(m => m.style_value === styleVal);
    for (const m of mappings) {
      if (m.is_recommended) {
        recommended.add(m.platform_id);
      } else {
        optional.add(m.platform_id);
      }
    }
  }

  return {
    recommended: [...recommended],
    optional: [...optional].filter(p => !recommended.has(p)),
  };
}

/** Given capabilities, get primary providers per capability */
export function deriveProviders(
  selectedCapabilities: string[],
  capProviderMap: CastCapabilityProviderMap[],
  zone?: string,
): Map<string, CastCapabilityProviderMap[]> {
  const result = new Map<string, CastCapabilityProviderMap[]>();

  for (const capValue of selectedCapabilities) {
    let providers = capProviderMap.filter(p => p.capability_value === capValue);
    // Filter by zone if specified
    if (zone) {
      const zoneSpecific = providers.filter(p => p.zone === zone || p.zone === 'any');
      if (zoneSpecific.length > 0) providers = zoneSpecific;
    }
    result.set(capValue, providers.sort((a, b) => a.fallback_order - b.fallback_order));
  }

  return result;
}
