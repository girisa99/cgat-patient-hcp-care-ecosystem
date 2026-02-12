/**
 * USE GEO NARRATION RESOLVER
 * 
 * Auto-detects the visitor's sub-region via IP geolocation + browser timezone,
 * validates against VPN/bypass attempts, and resolves the correct sub-region
 * code to pass to useRegionalLandingNarration.
 * 
 * Protection layers:
 * 1. IP-based country detection (geo-detect edge function)
 * 2. Browser timezone cross-validation
 * 3. Browser language cross-validation
 * 4. WebRTC leak detection
 * 5. Rapid location change tracking
 * 6. Automated browser detection
 * 
 * If VPN/bypass detected (risk ≥ 60): falls back to parent region default narration
 * If sanctioned country detected: blocks entirely (handled by GeoComplianceGate)
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { resolveGeoNarration, type GeoSubRegionResult } from '@/utils/geoSubRegionResolver';
import type { RegionSlug } from '@/config/regionalLandingConfig';

export interface UseGeoNarrationResolverReturn {
  /** Resolved sub-region code for narration (null if VPN detected or unknown) */
  subRegionCode: string | null;
  /** Auto-detected parent region slug */
  detectedRegionSlug: RegionSlug | null;
  /** ISO country code from IP */
  countryCode: string | null;
  /** Whether VPN/bypass was detected */
  vpnDetected: boolean;
  /** Bypass risk score (0-100) */
  riskScore: number;
  /** Specific bypass reasons for logging */
  bypassReasons: string[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Re-run detection */
  recheck: () => void;
}

const GEO_CACHE_KEY = 'geo_narration_cache';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CachedGeoData {
  countryCode: string;
  countryName: string;
  timestamp: number;
}

function getCachedGeo(): CachedGeoData | null {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const data: CachedGeoData = JSON.parse(raw);
    if (Date.now() - data.timestamp < CACHE_TTL_MS) return data;
    localStorage.removeItem(GEO_CACHE_KEY);
  } catch { /* ignore */ }
  return null;
}

function setCachedGeo(countryCode: string, countryName: string): void {
  try {
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({
      countryCode, countryName, timestamp: Date.now(),
    }));
  } catch { /* ignore */ }
}

/**
 * Track location for rapid-change detection (shared with useSuspiciousActivityDetection)
 */
function trackLocationForHistory(countryCode: string): void {
  try {
    const key = 'geo_location_history';
    const raw = localStorage.getItem(key);
    let history: Array<{ countryCode: string; timestamp: number }> = raw ? JSON.parse(raw) : [];
    if (history.length >= 10) history = history.slice(-9);
    history.push({ countryCode, timestamp: Date.now() });
    localStorage.setItem(key, JSON.stringify(history));
  } catch { /* ignore */ }
}

export const useGeoNarrationResolver = (): UseGeoNarrationResolverReturn => {
  const [result, setResult] = useState<GeoSubRegionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let countryCode: string | null = null;
      let countryName: string | null = null;

      // Check cache first
      const cached = getCachedGeo();
      if (cached) {
        countryCode = cached.countryCode;
        countryName = cached.countryName;
      } else {
        // Call geo-detect edge function for IP-based detection
        const { data, error: fnError } = await supabase.functions.invoke('geo-detect');

        if (fnError) {
          console.warn('[GeoNarrationResolver] Edge function error:', fnError);
          // Continue with null country — will use parent region from URL
        } else if (data?.detected_country) {
          countryCode = data.detected_country;
          countryName = data.region?.region_name || countryCode;
          setCachedGeo(countryCode!, countryName!);
        } else if (data?.region?.region_code) {
          // geo-detect may not return detected_country if no IP, but region is available
          countryCode = null;
          countryName = data.region.region_name;
        }
      }

      // Track for rapid location change detection
      if (countryCode) {
        trackLocationForHistory(countryCode);
      }

      // Resolve sub-region with VPN protection
      const resolved = resolveGeoNarration(countryCode, countryName);
      setResult(resolved);

      // Log VPN detection events for analytics
      if (resolved.vpnDetected) {
        try {
          await supabase.from('narration_playback_events').insert({
            region_code: resolved.parentRegionSlug || 'unknown',
            sub_region_code: resolved.subRegionCode,
            event_type: 'error',
            visitor_session_id: sessionStorage.getItem('genie_visitor_session') || 'unknown',
            visitor_device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
            visitor_browser: navigator.userAgent.slice(0, 100),
            landing_page_path: window.location.pathname,
            pipeline_category: 'security',
            pipeline_id: 'vpn-bypass-detection',
          });
        } catch {
          // Non-critical — don't block UX for analytics
        }
      }
    } catch (err) {
      console.error('[GeoNarrationResolver] Detection failed:', err);
      setError(err instanceof Error ? err.message : 'Geo detection failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    detect();
  }, [detect]);

  return {
    subRegionCode: result?.subRegionCode || null,
    detectedRegionSlug: result?.parentRegionSlug || null,
    countryCode: result?.countryCode || null,
    vpnDetected: result?.vpnDetected || false,
    riskScore: result?.riskScore || 0,
    bypassReasons: result?.bypassReasons || [],
    isLoading,
    error,
    recheck: detect,
  };
};

export default useGeoNarrationResolver;
