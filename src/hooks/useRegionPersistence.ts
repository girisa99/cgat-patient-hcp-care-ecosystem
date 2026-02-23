/**
 * useRegionPersistence — Supabase-backed region/subregion persistence
 *
 * Persists the user's region selection to Supabase so it stays consistent
 * across Create → Produce → Publish flows and across sessions/devices.
 *
 * Storage: user_preferences.npi_verification_settings JSON field
 * (reuses the existing JSONB column to avoid schema migration)
 *
 * Falls back to useEcosystemRouting (IP-based + localStorage) if:
 * - User is not authenticated
 * - Supabase is unreachable
 * - No region has been explicitly selected yet
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEcosystemRouting } from '@/hooks/useEcosystemRouting';
import { REGIONAL_SUB_REGIONS } from '@/config/regionalSubRegions';

// ── Types ────────────────────────────────────────────────────────────────────

export interface RegionPreference {
  regionCode: string;      // e.g. 'NAM_US', 'INDIA_SOUTH', 'MENA_GULF'
  countryCode: string;     // e.g. 'US', 'IN', 'AE'
  parentRegion: string;    // e.g. 'nam', 'india', 'mena'
  label: string;           // e.g. 'United States', 'South India'
  flag: string;            // e.g. '🇺🇸'
  culturalTone: string;    // e.g. 'innovative-global'
  source: 'supabase' | 'auto-detected' | 'manual' | 'fallback';
  updatedAt: string;
}

interface PersistedRegionData {
  region_code: string;
  country_code: string;
  parent_region: string;
  source: string;
  updated_at: string;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useRegionPersistence() {
  const queryClient = useQueryClient();
  const ecosystem = useEcosystemRouting();
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id || null);
    });
  }, []);

  // Load region from Supabase
  const { data: savedRegion, isLoading } = useQuery({
    queryKey: ['user-region-preference', userId],
    queryFn: async (): Promise<RegionPreference | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('npi_verification_settings')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return null;

      // Extract region data from the JSON settings
      const settings = data.npi_verification_settings as Record<string, unknown> | null;
      const regionData = settings?.region_preference as PersistedRegionData | undefined;

      if (!regionData?.region_code) return null;

      // Look up display info
      const info = findSubRegionInfo(regionData.region_code);

      return {
        regionCode: regionData.region_code,
        countryCode: regionData.country_code || ecosystem.countryCode || 'US',
        parentRegion: regionData.parent_region || deriveParentRegion(regionData.region_code),
        label: info?.label || 'Global',
        flag: info?.flag || '🌐',
        culturalTone: info?.culturalTone || 'innovative-global',
        source: 'supabase',
        updatedAt: regionData.updated_at,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  // Save region to Supabase
  const saveMutation = useMutation({
    mutationFn: async (regionCode: string) => {
      if (!userId) throw new Error('Not authenticated');

      // Read current settings first to merge
      const { data: current } = await supabase
        .from('user_preferences')
        .select('npi_verification_settings')
        .eq('user_id', userId)
        .maybeSingle();

      const existingSettings = (current?.npi_verification_settings as Record<string, unknown>) || {};
      const countryCode = deriveCountryCode(regionCode) || ecosystem.countryCode || 'US';

      const updatedSettings = {
        ...existingSettings,
        region_preference: {
          region_code: regionCode,
          country_code: countryCode,
          parent_region: deriveParentRegion(regionCode),
          source: 'manual',
          updated_at: new Date().toISOString(),
        },
      };

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          npi_verification_settings: updatedSettings as any,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Also update ecosystem routing cache
      ecosystem.setCountry(countryCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-region-preference', userId] });
    },
  });

  // Resolve the effective region: Supabase > auto-detected > fallback
  const region: RegionPreference = useMemo(() => {
    if (savedRegion) return savedRegion;

    // Fall back to ecosystem routing (IP-based auto-detection)
    const autoCode = deriveRegionFromCountry(ecosystem.countryCode || 'US');
    const info = findSubRegionInfo(autoCode);

    return {
      regionCode: autoCode,
      countryCode: ecosystem.countryCode || 'US',
      parentRegion: deriveParentRegion(autoCode),
      label: info?.label || 'Global',
      flag: info?.flag || '🌐',
      culturalTone: info?.culturalTone || 'innovative-global',
      source: ecosystem.isDetected ? 'auto-detected' : 'fallback',
      updatedAt: new Date().toISOString(),
    };
  }, [savedRegion, ecosystem.countryCode, ecosystem.isDetected]);

  const setRegion = useCallback((regionCode: string) => {
    saveMutation.mutate(regionCode);
  }, [saveMutation]);

  return {
    /** The resolved region preference (Supabase > auto-detected > fallback) */
    region,
    /** Whether the region is being loaded from Supabase */
    isLoading: isLoading || !userId,
    /** Whether the user has explicitly selected a region (stored in Supabase) */
    isExplicitlySet: !!savedRegion,
    /** Save a region selection to Supabase */
    setRegion,
    /** Whether the save is in progress */
    isSaving: saveMutation.isPending,
    /** Error from the last save attempt */
    saveError: saveMutation.error?.message || null,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function findSubRegionInfo(code: string) {
  for (const group of Object.values(REGIONAL_SUB_REGIONS)) {
    const found = group.find(sr => sr.code === code);
    if (found) return found;
  }
  return null;
}

function deriveParentRegion(code: string): string {
  if (code.startsWith('NAM')) return 'nam';
  if (code.startsWith('EU')) return 'europe';
  if (code.startsWith('MENA')) return 'mena';
  if (code.startsWith('INDIA')) return 'india';
  if (code.startsWith('CJK')) return 'cjk';
  if (code.startsWith('SEA')) return 'sea';
  if (code.startsWith('AFRICA')) return 'africa';
  if (code.startsWith('LATAM')) return 'latam';
  if (code.startsWith('OCEANIA')) return 'oceania';
  if (code.startsWith('TURKEY')) return 'turkey';
  if (code.startsWith('PK')) return 'pakistan';
  if (code.startsWith('BD')) return 'bangladesh';
  if (code.startsWith('EE')) return 'eastern_europe';
  if (code.startsWith('CARIBBEAN')) return 'caribbean';
  if (code.startsWith('CA_')) return 'central_asia';
  if (code.startsWith('SA_')) return 'south_asia';
  return 'nam';
}

const COUNTRY_TO_REGION: Record<string, string> = {
  // NAM
  US: 'NAM_US', CA: 'NAM_CA',
  // Europe
  DE: 'EU_DACH', AT: 'EU_DACH', CH: 'EU_DACH',
  FR: 'EU_FRANCE', BE: 'EU_BENELUX',
  ES: 'EU_IBERIA', PT: 'EU_IBERIA',
  SE: 'EU_NORDIC', NO: 'EU_NORDIC', DK: 'EU_NORDIC', FI: 'EU_NORDIC',
  NL: 'EU_BENELUX', IT: 'EU_ITALY', GB: 'EU_WEST', IE: 'EU_WEST',
  PL: 'EU_EAST', CZ: 'EU_EAST', HU: 'EU_EAST', RO: 'EU_EAST', GR: 'EU_EAST',
  // Eastern Europe
  UA: 'EE_UKRAINE', RS: 'EE_BALKANS', HR: 'EE_BALKANS', GE: 'EE_CAUCASUS',
  // MENA
  AE: 'MENA_GULF', SA: 'MENA_GULF', KW: 'MENA_GULF', QA: 'MENA_GULF', BH: 'MENA_GULF', OM: 'MENA_GULF',
  EG: 'MENA_EGYPT', JO: 'MENA_LEVANT', LB: 'MENA_LEVANT',
  MA: 'MENA_MAGHREB', DZ: 'MENA_MAGHREB', TN: 'MENA_MAGHREB',
  IQ: 'MENA_IRAQ', YE: 'MENA_YEMEN', IL: 'MENA_ISRAEL',
  // India
  IN: 'INDIA_PAN',
  // CJK
  CN: 'CJK_CN', HK: 'CJK_CN', JP: 'CJK_JP', KR: 'CJK_KR', TW: 'CJK_TW',
  // SEA
  MY: 'SEA_MALAY', ID: 'SEA_MALAY', TH: 'SEA_THAI', VN: 'SEA_VIET', PH: 'SEA_PHIL', SG: 'SEA_PAN',
  MM: 'SEA_MALAY', KH: 'SEA_VIET',
  // Africa
  KE: 'AFRICA_EAST', TZ: 'AFRICA_EAST', UG: 'AFRICA_EAST', ET: 'AFRICA_EAST', RW: 'AFRICA_EAST',
  NG: 'AFRICA_WEST', GH: 'AFRICA_WEST',
  ZA: 'AFRICA_SOUTH', SN: 'AFRICA_FRANCO',
  // LATAM
  MX: 'LATAM_MX', BR: 'LATAM_BR', AR: 'LATAM_CONE', CL: 'LATAM_CONE',
  CO: 'LATAM_ANDES', PE: 'LATAM_ANDES',
  // Oceania
  AU: 'OCEANIA_AU', NZ: 'OCEANIA_NZ',
  // Turkey / Pakistan / Bangladesh
  TR: 'TURKEY_ISTANBUL', PK: 'PK_URDU', BD: 'BD_DHAKA',
  // Central Asia
  KZ: 'CA_KZ', UZ: 'CA_UZ', AZ: 'CA_AZ',
  // South Asia
  LK: 'SA_SRILANKA', NP: 'SA_NEPAL',
};

function deriveRegionFromCountry(countryCode: string): string {
  return COUNTRY_TO_REGION[countryCode] || 'NAM_US';
}

const REGION_TO_COUNTRY: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_TO_REGION).map(([k, v]) => [v, k])
);

function deriveCountryCode(regionCode: string): string | null {
  return REGION_TO_COUNTRY[regionCode] || null;
}

export default useRegionPersistence;
