/**
 * useRegionalTranscreation Hook
 * 
 * Hydrates landing page content from regional_content_cache (dynamic transcreation),
 * falls back to static regionalLandingConfig when no cached content exists.
 * 
 * Same pipeline as ecosystem_messaging — uses ai-universal-processor for generation.
 * Connects to the same messaging/positioning workflow used by Genie Cast.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { REGIONAL_CONFIGS, type RegionSlug, type RegionalConfig } from '@/config/regionalLandingConfig';

export interface TranscreatedContent {
  key: string;
  value: string;
  culturalTone?: string;
  emotionalRegister?: string;
  dialectVariant?: string;
  abVariant?: string;
}

export interface UseRegionalTranscreationReturn {
  /** Merged config: dynamic transcreation overrides static where available */
  config: RegionalConfig;
  /** Individual transcreated strings by content_key */
  transcreatedStrings: Record<string, TranscreatedContent>;
  /** Whether dynamic content is loading */
  isLoading: boolean;
  /** Current sub-region (if selected) */
  subRegion: string | null;
  /** Set sub-region for dialect-level messaging */
  setSubRegion: (code: string | null) => void;
  /** Whether dynamic transcreation is available for this region */
  hasDynamicContent: boolean;
  /** Refresh cadence info */
  lastRefreshed: string | null;
  /** Force refresh from cache */
  refresh: () => Promise<void>;
}

export function useRegionalTranscreation(regionSlug: RegionSlug): UseRegionalTranscreationReturn {
  const staticConfig = REGIONAL_CONFIGS[regionSlug] || REGIONAL_CONFIGS.nam;
  const [transcreatedStrings, setTranscreatedStrings] = useState<Record<string, TranscreatedContent>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [subRegion, setSubRegion] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const fetchTranscreatedContent = useCallback(async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('regional_content_cache')
        .select('content_key, transcreated_content, cultural_tone, emotional_register, dialect_variant, ab_variant, last_refreshed_at')
        .eq('region_slug', regionSlug)
        .eq('status', 'approved')
        .eq('content_type', 'landing_page');

      if (subRegion) {
        query = query.eq('sub_region_code', subRegion);
      } else {
        query = query.is('sub_region_code', null);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('[useRegionalTranscreation] Cache fetch error:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const mapped: Record<string, TranscreatedContent> = {};
        let latestRefresh: string | null = null;

        for (const row of data) {
          mapped[row.content_key] = {
            key: row.content_key,
            value: row.transcreated_content,
            culturalTone: row.cultural_tone ?? undefined,
            emotionalRegister: row.emotional_register ?? undefined,
            dialectVariant: row.dialect_variant ?? undefined,
            abVariant: row.ab_variant ?? undefined,
          };
          if (row.last_refreshed_at && (!latestRefresh || row.last_refreshed_at > latestRefresh)) {
            latestRefresh = row.last_refreshed_at;
          }
        }

        setTranscreatedStrings(mapped);
        setLastRefreshed(latestRefresh);
      }
    } catch (err) {
      console.warn('[useRegionalTranscreation] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [regionSlug, subRegion]);

  useEffect(() => {
    fetchTranscreatedContent();
  }, [fetchTranscreatedContent]);

  // Merge dynamic transcreation over static config
  const mergedConfig: RegionalConfig = {
    ...staticConfig,
    hero: {
      ...staticConfig.hero,
      nativeHeadline: transcreatedStrings['hero.nativeHeadline']?.value || staticConfig.hero.nativeHeadline,
      nativeSubheadline: transcreatedStrings['hero.nativeSubheadline']?.value || staticConfig.hero.nativeSubheadline,
      englishHeadline: transcreatedStrings['hero.englishHeadline']?.value || staticConfig.hero.englishHeadline,
      englishSubheadline: transcreatedStrings['hero.englishSubheadline']?.value || staticConfig.hero.englishSubheadline,
    },
    cta: {
      ...staticConfig.cta,
      primary: transcreatedStrings['cta.primary']?.value || staticConfig.cta.primary,
      secondary: transcreatedStrings['cta.secondary']?.value || staticConfig.cta.secondary,
      badge: transcreatedStrings['cta.badge']?.value || staticConfig.cta.badge,
    },
    welcomeScript: transcreatedStrings['welcomeScript']?.value || staticConfig.welcomeScript,
    differentiators: {
      ...staticConfig.differentiators,
      heroBadge: transcreatedStrings['differentiators.heroBadge']?.value || staticConfig.differentiators.heroBadge,
    },
  };

  return {
    config: mergedConfig,
    transcreatedStrings,
    isLoading,
    subRegion,
    setSubRegion,
    hasDynamicContent: Object.keys(transcreatedStrings).length > 0,
    lastRefreshed,
    refresh: fetchTranscreatedContent,
  };
}
