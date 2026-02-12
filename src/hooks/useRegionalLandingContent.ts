/**
 * useRegionalLandingContent — Phase A2
 * 
 * Fetches regional landing page content from `regional_landing_content` table
 * with a 3-tier fallback: Sub-Region → Parent Region → WESTERN (English Base).
 * 
 * Device-aware features:
 * - Returns device type (mobile/tablet/desktop) for responsive rendering
 * - Provides condensed content variants for mobile (shorter headlines)
 * - Uses React Query with mobile-optimized stale/cache times
 * - Exposes `isRTL` for bidirectional layout support
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile, useDeviceType } from '@/hooks/use-mobile';
import { isRTLLanguage } from '@/config/regional-routing-registry';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface RegionalLandingRow {
  id: string;
  region_code: string;
  headline: string;
  subheadline: string | null;
  welcome_script: string | null;
  cta_primary_text: string | null;
  cta_primary_url: string | null;
  cta_secondary_text: string | null;
  cta_secondary_url: string | null;
  language_code: string | null;
  rtl_enabled: boolean;
  assets: Record<string, unknown>;
  version: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceContentVariant {
  /** Full headline (desktop) */
  headline: string;
  /** Condensed headline for mobile (truncated or original if short) */
  headlineMobile: string;
  /** Full subheadline */
  subheadline: string | null;
  /** Condensed subheadline for mobile */
  subheadlineMobile: string | null;
}

export interface UseRegionalLandingContentReturn {
  /** Resolved content row (best match from fallback chain) */
  content: RegionalLandingRow | null;
  /** Device-aware content variants */
  variants: DeviceContentVariant | null;
  /** Which fallback tier resolved: 'exact' | 'parent' | 'base' | null */
  fallbackTier: 'exact' | 'parent' | 'base' | null;
  /** Current device type */
  deviceType: 'mobile' | 'tablet' | 'desktop';
  /** Whether current content is RTL */
  isRTL: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether content came from cache */
  isFetched: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Sub-Region → Parent mapping (aligned with regional-routing-registry)
// ═══════════════════════════════════════════════════════════════

const SUB_REGION_TO_PARENT: Record<string, string> = {
  // Europe
  EU_GB: 'WESTERN', EU_FR: 'WESTERN', EU_DE: 'WESTERN', EU_IT: 'WESTERN',
  EU_ES: 'WESTERN', EU_NL: 'WESTERN', EU_BE: 'WESTERN', EU_CH: 'WESTERN',
  EU_AT: 'WESTERN', EU_PL: 'EUR_CENTRAL', EU_CZ: 'EUR_CENTRAL',
  EU_SE: 'EUR_NORTH', EU_NO: 'EUR_NORTH', EU_DK: 'EUR_NORTH', EU_NORDIC: 'EUR_NORTH',
  EUR_NORTH: 'WESTERN', EUR_SOUTH: 'WESTERN', EUR_CENTRAL: 'WESTERN',
  EUR_EASTERN: 'WESTERN', EUR_BALKANS: 'WESTERN',
  // India
  IND_HI: 'IND', IND_EN: 'IND', IND_TA: 'IND', IND_TE: 'IND',
  IND_KN: 'IND', IND_ML: 'IND', IND_MR: 'IND', IND_GU: 'IND',
  IND_BN: 'IND', IND_PA: 'IND', IND_OR: 'IND', IND_UR: 'IND',
  // CJK
  CJK_CN: 'CJK', CJK_TW: 'CJK', CJK_JP: 'CJK', CJK_KR: 'CJK',
  // SEA
  SEA_MALAY: 'SEA', SEA_THAI: 'SEA', SEA_VIET: 'SEA', SEA_PHIL: 'SEA', SEA_PAN: 'SEA',
  // MENA
  MENA_SA: 'MENA', MENA_AE: 'MENA', MENA_EG: 'MENA', MENA_IL: 'MENA', MENA_TR: 'MENA',
  // LATAM
  LATAM_BR: 'LATAM', LATAM_MX: 'LATAM', LATAM_AR: 'LATAM', LATAM_CL: 'LATAM', LATAM_CO: 'LATAM',
  // Africa
  AFR_ZA: 'AFR', AFR_NG: 'AFR', AFR_KE: 'AFR', AFR_GH: 'AFR', AFR_EG: 'AFR',
  // NAM
  NAM_US: 'NAM', NAM_CA: 'NAM', NAM_MX: 'NAM',
  // Caribbean
  CARIB_EN: 'CARIB', CARIB_FR: 'CARIB', CARIB_HAI: 'CARIB',
  // Oceania
  OCEANIA_AU: 'WESTERN', OCEANIA_NZ: 'WESTERN',
  // P0/P1 Expansion
  TURKEY: 'MENA', INDONESIA: 'SEA',
  EU_UKRAINE: 'EUR_EASTERN', EU_CAUCASUS: 'EUR_EASTERN',
  EU_ARMENIA: 'EUR_EASTERN', EU_GEORGIA: 'EUR_EASTERN',
  ASIA_CENTRAL_KZ: 'MENA', ASIA_CENTRAL_UZ: 'MENA',
  ASIA_CENTRAL_AZ: 'MENA', ASIA_CENTRAL_TM: 'MENA', ASIA_CENTRAL_KG: 'MENA',
};

const ENGLISH_BASE = 'WESTERN';

// ═══════════════════════════════════════════════════════════════
// Content helpers
// ═══════════════════════════════════════════════════════════════

/** Truncate text for mobile display (max ~60 chars, word-boundary) */
function condenseMobile(text: string | null, maxLen = 60): string | null {
  if (!text) return null;
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen).replace(/\s+\S*$/, '');
  return truncated + '…';
}

function buildVariants(row: RegionalLandingRow | null): DeviceContentVariant | null {
  if (!row) return null;
  return {
    headline: row.headline,
    headlineMobile: condenseMobile(row.headline, 50) || row.headline,
    subheadline: row.subheadline,
    subheadlineMobile: condenseMobile(row.subheadline, 80),
  };
}

// ═══════════════════════════════════════════════════════════════
// Fetcher — 3-tier fallback
// ═══════════════════════════════════════════════════════════════

interface FetchResult {
  content: RegionalLandingRow | null;
  fallbackTier: 'exact' | 'parent' | 'base' | null;
}

async function fetchRegionalContent(regionCode: string): Promise<FetchResult> {
  const code = regionCode.toUpperCase();

  // Tier 1: Exact sub-region match
  const { data: exact } = await supabase
    .from('regional_landing_content')
    .select('*')
    .eq('region_code', code)
    .eq('status', 'active')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (exact) return { content: exact as RegionalLandingRow, fallbackTier: 'exact' };

  // Tier 2: Parent region
  const parentCode = SUB_REGION_TO_PARENT[code];
  if (parentCode && parentCode !== code) {
    const { data: parent } = await supabase
      .from('regional_landing_content')
      .select('*')
      .eq('region_code', parentCode)
      .eq('status', 'active')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (parent) return { content: parent as RegionalLandingRow, fallbackTier: 'parent' };
  }

  // Tier 3: English base
  if (code !== ENGLISH_BASE) {
    const { data: base } = await supabase
      .from('regional_landing_content')
      .select('*')
      .eq('region_code', ENGLISH_BASE)
      .eq('status', 'active')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (base) return { content: base as RegionalLandingRow, fallbackTier: 'base' };
  }

  return { content: null, fallbackTier: null };
}

// ═══════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════

export function useRegionalLandingContent(regionCode: string): UseRegionalLandingContentReturn {
  const isMobile = useIsMobile();
  const deviceType = useDeviceType();

  // Mobile-optimized cache: longer stale time on mobile to reduce network calls
  const staleTime = isMobile ? 10 * 60 * 1000 : 5 * 60 * 1000;   // 10min mobile, 5min desktop
  const gcTime = isMobile ? 30 * 60 * 1000 : 15 * 60 * 1000;     // 30min mobile, 15min desktop

  const { data, isLoading, error, isFetched } = useQuery({
    queryKey: ['regional-landing-content', regionCode?.toUpperCase()],
    queryFn: () => fetchRegionalContent(regionCode),
    staleTime,
    gcTime,
    enabled: !!regionCode,
  });

  const content = data?.content ?? null;
  const fallbackTier = data?.fallbackTier ?? null;
  const variants = buildVariants(content);
  const isRTL = content?.rtl_enabled ?? (content?.language_code ? isRTLLanguage(content.language_code) : false);

  return {
    content,
    variants,
    fallbackTier,
    deviceType,
    isRTL,
    isLoading,
    error: error as Error | null,
    isFetched,
  };
}

export default useRegionalLandingContent;
