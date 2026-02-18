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

/**
 * Hallucination guard: rejects LLM output that contains JSON blobs,
 * explanatory meta-text, or wrong-language leakage.
 */
function isHallucinatedContent(value: string): boolean {
  if (!value || value.length === 0) return true;
  // JSON blob leaked into content
  if (value.includes('"transcreated"') || value.includes('"cultural_tone"')) return true;
  // Chinese explanatory text leaked into non-Chinese content
  if (/请注意|解释|为了更符合|被截断|这样不仅/.test(value)) return true;
  // English meta-commentary leaked
  if (/^(Explanation|It seems|Let's correct|This vers|To better fit)/i.test(value.trim())) return true;
  // Content is suspiciously long for a label/headline (>200 chars likely has explanation)
  if (value.length > 300 && (value.includes('{') || value.includes('}'))) return true;
  return false;
}

export function useRegionalTranscreation(regionSlug: RegionSlug): UseRegionalTranscreationReturn {
  const staticConfig = REGIONAL_CONFIGS[regionSlug] || REGIONAL_CONFIGS.nam;
  const [transcreatedStrings, setTranscreatedStrings] = useState<Record<string, TranscreatedContent>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [subRegion, setSubRegion] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const fetchTranscreatedContent = useCallback(async () => {
    // Check in-memory cache first (avoids redundant Supabase calls within session)
    const cacheKey = `regional_transcreation_${regionSlug}_${subRegion || 'parent'}`;
    const BROWSER_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes browser-side cache

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < BROWSER_CACHE_TTL_MS) {
          setTranscreatedStrings(data);
          setIsLoading(false);
          return;
        }
      }
    } catch { /* sessionStorage unavailable */ }

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
          // Skip hallucinated content — fall back to static config
          if (isHallucinatedContent(row.transcreated_content)) {
            console.warn(`[useRegionalTranscreation] Hallucination detected for ${row.content_key}, skipping`);
            continue;
          }
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

        // Cache in sessionStorage for 10min to avoid redundant Supabase calls
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ data: mapped, timestamp: Date.now() }));
        } catch { /* sessionStorage full or unavailable */ }
      }
    } catch (err) {
      // Graceful fallback: on any fetch error, transcreatedStrings stays empty
      // and mergedConfig below will use 100% static English config
      console.warn('[useRegionalTranscreation] Fetch failed, falling back to English static config:', err);
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
    nativeSections: {
      ...staticConfig.nativeSections,
      ctaFooterHeadline: transcreatedStrings['nativeSections.ctaFooterHeadline']?.value || staticConfig.nativeSections.ctaFooterHeadline,
      ctaFooterSubheadline: transcreatedStrings['nativeSections.ctaFooterSubheadline']?.value || staticConfig.nativeSections.ctaFooterSubheadline,
      comparisonTranslationLabel: transcreatedStrings['nativeSections.comparisonTranslationLabel']?.value || staticConfig.nativeSections.comparisonTranslationLabel,
      comparisonTranscreationLabel: transcreatedStrings['nativeSections.comparisonTranscreationLabel']?.value || staticConfig.nativeSections.comparisonTranscreationLabel,
      comparisonTranslationExample: transcreatedStrings['nativeSections.comparisonTranslationExample']?.value || staticConfig.nativeSections.comparisonTranslationExample,
      comparisonTranscreationExample: transcreatedStrings['nativeSections.comparisonTranscreationExample']?.value || staticConfig.nativeSections.comparisonTranscreationExample,
      statsLanguagesLabel: transcreatedStrings['nativeSections.statsLanguagesLabel']?.value || staticConfig.nativeSections.statsLanguagesLabel,
      statsDialectsLabel: transcreatedStrings['nativeSections.statsDialectsLabel']?.value || staticConfig.nativeSections.statsDialectsLabel,
      statsRegionsLabel: transcreatedStrings['nativeSections.statsRegionsLabel']?.value || staticConfig.nativeSections.statsRegionsLabel,
      statsSubRegionsLabel: transcreatedStrings['nativeSections.statsSubRegionsLabel']?.value || staticConfig.nativeSections.statsSubRegionsLabel,
      demoHubHeadline: transcreatedStrings['nativeSections.demoHubHeadline']?.value || staticConfig.nativeSections.demoHubHeadline,
      demoHubSubheadline: transcreatedStrings['nativeSections.demoHubSubheadline']?.value || staticConfig.nativeSections.demoHubSubheadline,
      scheduleDemoLabel: transcreatedStrings['nativeSections.scheduleDemoLabel']?.value || staticConfig.nativeSections.scheduleDemoLabel,
      readyForRegion: transcreatedStrings['nativeSections.readyForRegion']?.value || staticConfig.nativeSections.readyForRegion,
      signInPrompt: transcreatedStrings['nativeSections.signInPrompt']?.value || staticConfig.nativeSections.signInPrompt,
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
