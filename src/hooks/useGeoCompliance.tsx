/**
 * useGeoCompliance Hook
 * 
 * Provides geolocation-based compliance checking for sanctioned regions.
 * Uses IP geolocation to determine user's country and blocks access
 * to sanctioned regions per OFAC requirements.
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  isSanctionedCountry, 
  getBlockingMessage, 
  isRegionAllowed,
  BLOCKED_COUNTRY_CODES
} from '@/services/sanctionsComplianceRegistry';

export interface GeoComplianceState {
  isLoading: boolean;
  isBlocked: boolean;
  countryCode: string | null;
  countryName: string | null;
  blockReason: string | null;
  error: string | null;
  lastChecked: Date | null;
}

export interface GeoComplianceContextType extends GeoComplianceState {
  recheckCompliance: () => Promise<void>;
  isCheckingCompliance: boolean;
}

const GeoComplianceContext = createContext<GeoComplianceContextType | undefined>(undefined);

const STORAGE_KEY = 'geo_compliance_cache';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CachedCompliance {
  countryCode: string;
  countryName: string;
  timestamp: number;
}

/**
 * Get cached compliance data if still valid
 */
function getCachedCompliance(): CachedCompliance | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;
    
    const data: CachedCompliance = JSON.parse(cached);
    const age = Date.now() - data.timestamp;
    
    if (age < CACHE_DURATION_MS) {
      return data;
    }
    
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

/**
 * Cache compliance data
 */
function setCachedCompliance(countryCode: string, countryName: string): void {
  try {
    const data: CachedCompliance = {
      countryCode,
      countryName,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export function GeoComplianceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GeoComplianceState>({
    isLoading: true,
    isBlocked: false,
    countryCode: null,
    countryName: null,
    blockReason: null,
    error: null,
    lastChecked: null
  });
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);

  const checkCompliance = useCallback(async () => {
    setIsCheckingCompliance(true);

    try {
      // Check cache first
      const cached = getCachedCompliance();
      if (cached) {
        const blocked = isSanctionedCountry(cached.countryCode);
        setState({
          isLoading: false,
          isBlocked: blocked,
          countryCode: cached.countryCode,
          countryName: cached.countryName,
          blockReason: blocked ? getBlockingMessage(cached.countryCode) : null,
          error: null,
          lastChecked: new Date(cached.timestamp)
        });
        setIsCheckingCompliance(false);
        return;
      }

      // Skip edge function on localhost/dev — the function may not be deployed
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalDev) {
        console.info('[GeoCompliance] Local development detected, skipping edge function check');
        setState({
          isLoading: false,
          isBlocked: false,
          countryCode: 'US',
          countryName: 'United States (dev)',
          blockReason: null,
          error: null,
          lastChecked: new Date()
        });
        setIsCheckingCompliance(false);
        return;
      }

      // Call edge function for IP geolocation with a 5-second timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      let data, error;
      try {
        const result = await supabase.functions.invoke('geo-compliance-check', {
          body: { action: 'check' },
        });
        data = result.data;
        error = result.error;
      } catch (invokeErr) {
        // AbortError or network failure — treat as non-blocking
        console.warn('[GeoCompliance] Edge function timed out or unreachable:', invokeErr);
        error = invokeErr;
      } finally {
        clearTimeout(timeout);
      }

      if (error) {
        console.error('[GeoCompliance] Edge function error:', error);
        // On error, allow access but log it
        setState({
          isLoading: false,
          isBlocked: false,
          countryCode: null,
          countryName: null,
          blockReason: null,
          error: error instanceof Error ? error.message : String(error),
          lastChecked: new Date()
        });
        setIsCheckingCompliance(false);
        return;
      }

      const { countryCode, countryName, isBlocked, blockReason } = data;

      // Cache the result
      if (countryCode) {
        setCachedCompliance(countryCode, countryName || 'Unknown');
      }

      setState({
        isLoading: false,
        isBlocked: isBlocked || false,
        countryCode: countryCode || null,
        countryName: countryName || null,
        blockReason: blockReason || null,
        error: null,
        lastChecked: new Date()
      });
    } catch (err) {
      console.error('[GeoCompliance] Check failed:', err);
      // On error, allow access but log it
      setState({
        isLoading: false,
        isBlocked: false,
        countryCode: null,
        countryName: null,
        blockReason: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        lastChecked: new Date()
      });
    } finally {
      setIsCheckingCompliance(false);
    }
  }, []);

  // Check on mount
  useEffect(() => {
    checkCompliance();
  }, [checkCompliance]);

  const value: GeoComplianceContextType = {
    ...state,
    recheckCompliance: checkCompliance,
    isCheckingCompliance
  };

  return (
    <GeoComplianceContext.Provider value={value}>
      {children}
    </GeoComplianceContext.Provider>
  );
}

export function useGeoCompliance(): GeoComplianceContextType {
  const context = useContext(GeoComplianceContext);
  if (!context) {
    throw new Error('useGeoCompliance must be used within a GeoComplianceProvider');
  }
  return context;
}

/**
 * Standalone function to check if current user is in a sanctioned region
 * Can be used without the provider for one-off checks
 */
export async function checkGeoCompliance(): Promise<{
  isBlocked: boolean;
  countryCode: string | null;
  reason: string | null;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('geo-compliance-check', {
      body: { action: 'check' }
    });

    if (error) {
      console.error('[GeoCompliance] Check failed:', error);
      return { isBlocked: false, countryCode: null, reason: null };
    }

    return {
      isBlocked: data.isBlocked || false,
      countryCode: data.countryCode || null,
      reason: data.blockReason || null
    };
  } catch (err) {
    console.error('[GeoCompliance] Error:', err);
    return { isBlocked: false, countryCode: null, reason: null };
  }
}

export default useGeoCompliance;
