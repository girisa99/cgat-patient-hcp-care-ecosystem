/**
 * useEcosystemRouting Hook
 * 
 * UNIFIED LLM ROUTING ACROSS THE ENTIRE GENIE ECOSYSTEM
 * Works with: Deck, Spark, Mind, Vibe, Arc, Ask Genie, Production Hub, Mobile
 * 
 * Features:
 * - IP-based auto-detection with offline fallback
 * - 4-Zone LLM routing (Claude, Alibaba, Gemini, Fallback)
 * - Mobile-first with PWA support
 * - Cached preferences for instant loading
 * 
 * @example
 * const { routing, isLoading, countryCode, zone } = useEcosystemRouting();
 * // routing.llm = 'qwen-max' (if user in Japan)
 * // routing.tts = 'alibaba-cosyvoice'
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LLMZone, 
  LLMRoutingConfig,
  getLLMRouteByCountry, 
  getZoneByCountry,
  getRegionalPrompt,
  selectLLM,
  selectTTS,
  selectTranslation,
  ZONE_SUMMARY,
  COMPLETE_ROUTING_TABLE,
} from '@/services/llmRoutingStrategy';

// ============================================================================
// TYPES
// ============================================================================

export type GenieProduct = 
  | 'deck' 
  | 'spark' 
  | 'mind' 
  | 'vibe' 
  | 'arc' 
  | 'hub' 
  | 'ask-genie'
  | 'mobile';

export interface EcosystemRoutingState {
  countryCode: string;
  region: string;
  zone: LLMZone;
  routing: LLMRoutingConfig;
  isRTL: boolean;
  moat: string | null;
  isLoading: boolean;
  isDetected: boolean;
  error: string | null;
  source: 'ip' | 'cached' | 'manual' | 'fallback';
}

export interface EcosystemRoutingActions {
  refreshDetection: () => Promise<void>;
  setCountry: (countryCode: string) => void;
  getProviderForTask: (task: 'llm' | 'tts' | 'stt' | 'translation') => string;
  getRegionalPrompt: () => string;
  estimateCost: (usersCount: number) => number;
}

export type UseEcosystemRoutingReturn = EcosystemRoutingState & EcosystemRoutingActions;

// ============================================================================
// CONSTANTS
// ============================================================================

const CACHE_KEY = 'genie-ecosystem-routing';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Default fallback (US)
const DEFAULT_COUNTRY = 'US';

interface CachedRouting {
  countryCode: string;
  timestamp: number;
}

// ============================================================================
// IP DETECTION SERVICE
// ============================================================================

async function detectCountryFromIP(): Promise<string | null> {
  const apis = [
    { url: 'https://ipapi.co/json/', parser: (data: any) => data.country_code },
    { url: 'https://ip-api.com/json/', parser: (data: any) => data.countryCode },
    { url: 'https://ipinfo.io/json', parser: (data: any) => data.country },
  ];

  for (const api of apis) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(api.url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const countryCode = api.parser(data);
        if (countryCode && typeof countryCode === 'string' && countryCode.length === 2) {
          return countryCode.toUpperCase();
        }
      }
    } catch {
      // Try next API
      continue;
    }
  }

  return null;
}

function getCachedRouting(): CachedRouting | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedRouting = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function setCachedRouting(countryCode: string): void {
  try {
    const cached: CachedRouting = { countryCode, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useEcosystemRouting(
  product?: GenieProduct
): UseEcosystemRoutingReturn {
  const [state, setState] = useState<EcosystemRoutingState>(() => {
    // Initialize from cache for instant loading
    const cached = getCachedRouting();
    const initialCountry = cached?.countryCode || DEFAULT_COUNTRY;
    const routing = getLLMRouteByCountry(initialCountry);

    return {
      countryCode: initialCountry,
      region: routing?.region || 'Global',
      zone: routing?.zone || 'fallback',
      routing: routing?.config || getLLMRouteByCountry(DEFAULT_COUNTRY)!.config,
      isRTL: routing?.config.rtl || false,
      moat: routing?.config.moat || null,
      isLoading: !cached, // Only loading if no cache
      isDetected: !!cached,
      error: null,
      source: cached ? 'cached' : 'fallback',
    };
  });

  // Auto-detect on mount (if not cached)
  useEffect(() => {
    const cached = getCachedRouting();
    if (!cached) {
      detectCountryFromIP().then((countryCode) => {
        if (countryCode) {
          const routing = getLLMRouteByCountry(countryCode);
          if (routing) {
            setCachedRouting(countryCode);
            setState({
              countryCode,
              region: routing.region,
              zone: routing.zone,
              routing: routing.config,
              isRTL: routing.config.rtl,
              moat: routing.config.moat,
              isLoading: false,
              isDetected: true,
              error: null,
              source: 'ip',
            });
          } else {
            // Country not in routing table, use fallback zone
            const fallbackRouting = getLLMRouteByCountry(DEFAULT_COUNTRY)!;
            setState({
              countryCode,
              region: 'Global',
              zone: 'fallback',
              routing: fallbackRouting.config,
              isRTL: false,
              moat: null,
              isLoading: false,
              isDetected: true,
              error: null,
              source: 'ip',
            });
          }
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Could not detect region, using default',
            source: 'fallback',
          }));
        }
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Refresh detection
  const refreshDetection = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const countryCode = await detectCountryFromIP();
      if (countryCode) {
        const routing = getLLMRouteByCountry(countryCode);
        if (routing) {
          setCachedRouting(countryCode);
          setState({
            countryCode,
            region: routing.region,
            zone: routing.zone,
            routing: routing.config,
            isRTL: routing.config.rtl,
            moat: routing.config.moat,
            isLoading: false,
            isDetected: true,
            error: null,
            source: 'ip',
          });
        }
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Detection failed',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Detection error',
      }));
    }
  }, []);

  // Manual country selection
  const setCountry = useCallback((countryCode: string) => {
    const routing = getLLMRouteByCountry(countryCode);
    if (routing) {
      setCachedRouting(countryCode);
      setState({
        countryCode,
        region: routing.region,
        zone: routing.zone,
        routing: routing.config,
        isRTL: routing.config.rtl,
        moat: routing.config.moat,
        isLoading: false,
        isDetected: true,
        error: null,
        source: 'manual',
      });
    }
  }, []);

  // Get provider for specific task
  const getProviderForTask = useCallback((task: 'llm' | 'tts' | 'stt' | 'translation') => {
    switch (task) {
      case 'llm': return state.routing.llm;
      case 'tts': return state.routing.tts;
      case 'stt': return state.routing.stt;
      case 'translation': return state.routing.translation;
      default: return state.routing.llm;
    }
  }, [state.routing]);

  // Get regional prompt for current country
  const getRegionalPromptCallback = useCallback(() => {
    return getRegionalPrompt(state.countryCode);
  }, [state.countryCode]);

  // Estimate monthly cost
  const estimateCost = useCallback((usersCount: number) => {
    const costPer100: Record<LLMZone, number> = {
      claude: 150,
      alibaba: 80,
      arabic: 120, // GPT-4o based - higher cost than Alibaba
      gemini: 70,
      fallback: 30,
    };
    return (usersCount / 100) * costPer100[state.zone];
  }, [state.zone]);

  return {
    ...state,
    refreshDetection,
    setCountry,
    getProviderForTask,
    getRegionalPrompt: getRegionalPromptCallback,
    estimateCost,
  };
}

// ============================================================================
// ECOSYSTEM CONTEXT PROVIDER (for React Context usage)
// ============================================================================

export interface EcosystemRoutingContext extends UseEcosystemRoutingReturn {
  product: GenieProduct;
}

// Export zone info for UI components
export { ZONE_SUMMARY, COMPLETE_ROUTING_TABLE };

export default useEcosystemRouting;
