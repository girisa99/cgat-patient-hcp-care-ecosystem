/**
 * useRegionalLanguage Hook - CONSOLIDATED SINGLE SOURCE OF TRUTH
 * 
 * Central hook for ALL regional language management across the Genie ecosystem.
 * Replaces and consolidates all previous language/region hooks.
 * 
 * Features:
 * - IP-based auto-detection of region and bundle
 * - 7 Regional bundles (English Core, Europe, Asia, India, MEA, Africa, LatAm)
 * - 4-Zone LLM routing integration (Claude, Alibaba, Gemini, Fallback)
 * - Premium feature routing (Voice Clone, Avatar, Full-body Avatar, Priority Rendering)
 * - User ability to add additional languages beyond bundle
 * - RTL layout support
 * - Persistent preferences
 * 
 * Used by: Spark, Mind, Vibe, Deck, Ask Genie, Arc, Production Hub, Mobile
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  regionLanguageBundleService,
  LANGUAGE_BUNDLES,
  ALL_AVAILABLE_LANGUAGES,
  type BundleType,
  type UserLanguageConfig,
  type LanguageBundle,
  type LanguageInfo,
} from '@/services/regionLanguageBundles';
import { 
  useEcosystemRouting, 
  ZONE_SUMMARY,
} from '@/hooks/useEcosystemRouting';
import {
  selectTTS,
  selectTranslation,
  type LLMZone,
} from '@/services/llmRoutingStrategy';
import {
  getUnifiedProviderRouting,
  type ProviderRoute,
} from '@/services/unifiedProviderRoutingAdapter';

// ============================================================================
// TYPES
// ============================================================================

export type TextDirection = 'ltr' | 'rtl';

/**
 * Premium Features Routing - Global providers (not zone-based)
 */
export interface PremiumFeaturesRouting {
  voiceClone: ProviderRoute;
  avatar: ProviderRoute;
  fullBodyAvatar: ProviderRoute;
  priorityRendering: ProviderRoute;
}

export interface UseRegionalLanguageReturn {
  // Loading state
  isLoading: boolean;
  
  // Bundle info
  currentBundle: LanguageBundle | null;
  allBundles: LanguageBundle[];
  
  // Language state
  config: UserLanguageConfig | null;
  enabledLanguages: LanguageInfo[];
  bundleLanguages: LanguageInfo[];
  additionalLanguages: LanguageInfo[];
  availableToAdd: LanguageInfo[];
  primaryLanguage: LanguageInfo | null;
  
  // RTL support
  isRTL: boolean;
  textDirection: TextDirection;
  rtlClasses: string;
  
  // 4-Zone LLM Routing
  llmZone: LLMZone;
  llmProvider: string;
  ttsProvider: string;
  sttProvider: string;
  translationProvider: string;
  zoneSummary: typeof ZONE_SUMMARY;
  
  // Premium Features Routing (Global - not zone-based)
  premiumRouting: PremiumFeaturesRouting;
  voiceCloneProvider: string;
  avatarProvider: string;
  fullBodyAvatarProvider: string;
  priorityRenderingProvider: string;
  
  // Actions
  setLanguage: (code: string) => void;
  setPrimaryLanguage: (code: string) => void;
  addLanguage: (code: string) => void;
  removeLanguage: (code: string) => void;
  setBundle: (bundle: BundleType) => void;
  setRegion: (bundle: BundleType) => void; // Alias for setBundle
  refreshDetection: () => Promise<void>;
  
  // Helpers
  getLanguageInfo: (code: string) => LanguageInfo | undefined;
  isLanguageEnabled: (code: string) => boolean;
  isLanguageInBundle: (code: string) => boolean;
  isLanguageRTL: (code: string) => boolean;
  getProviderForFeature: (feature: 'llm' | 'tts' | 'stt' | 'translation' | 'voiceClone' | 'avatar' | 'fullBodyAvatar' | 'priorityRendering') => string;
  
  // Legacy compatibility
  preferences: UserLanguageConfig | null;
  detection: { countryCode: string; bundleType: BundleType } | null;
  currentRegion: BundleType;
  regionalLanguages: LanguageInfo[];
  allRegions: { id: BundleType; name: string; flag: string }[];
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useRegionalLanguage(): UseRegionalLanguageReturn {
  const [config, setConfig] = useState<UserLanguageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Integrate with ecosystem routing for LLM zone
  const ecosystemRouting = useEcosystemRouting();

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const cfg = await regionLanguageBundleService.initializeFromIP();
        setConfig(cfg);
        
        // Apply RTL to document if needed
        if (typeof document !== 'undefined') {
          const isRtl = regionLanguageBundleService.isRTL(cfg.primaryLanguage);
          document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
          document.documentElement.lang = cfg.primaryLanguage;
        }
      } catch (error) {
        console.error('[useRegionalLanguage] Initialization error:', error);
        const cfg = regionLanguageBundleService.createConfigForCountry('US', false);
        setConfig(cfg);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Computed: Current bundle
  const currentBundle = useMemo(() => {
    if (!config) return null;
    return LANGUAGE_BUNDLES[config.bundle];
  }, [config]);

  // Computed: All bundles
  const allBundles = useMemo(() => {
    return Object.values(LANGUAGE_BUNDLES);
  }, []);

  // Computed: Enabled languages with info
  const enabledLanguages = useMemo(() => {
    if (!config) return [];
    const enabled = [...new Set([...config.bundleLanguages, ...config.additionalLanguages])];
    return enabled
      .map(code => regionLanguageBundleService.getLanguageInfo(code))
      .filter((info): info is LanguageInfo => info !== undefined);
  }, [config]);

  // Computed: Bundle languages only
  const bundleLanguages = useMemo(() => {
    if (!config) return [];
    return config.bundleLanguages
      .map(code => regionLanguageBundleService.getLanguageInfo(code))
      .filter((info): info is LanguageInfo => info !== undefined);
  }, [config]);

  // Computed: Additional languages only
  const additionalLanguages = useMemo(() => {
    if (!config) return [];
    return config.additionalLanguages
      .map(code => regionLanguageBundleService.getLanguageInfo(code))
      .filter((info): info is LanguageInfo => info !== undefined);
  }, [config]);

  // Computed: Available to add
  const availableToAdd = useMemo(() => {
    return regionLanguageBundleService.getAvailableToAdd();
  }, [config]);

  // Computed: Primary language
  const primaryLanguage = useMemo(() => {
    if (!config) return null;
    return regionLanguageBundleService.getLanguageInfo(config.primaryLanguage) || null;
  }, [config]);

  // Computed: RTL check
  const isRTL = useMemo(() => {
    if (!config) return false;
    return regionLanguageBundleService.isRTL(config.primaryLanguage);
  }, [config]);

  const textDirection = useMemo((): TextDirection => {
    return isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  const rtlClasses = useMemo(() => {
    if (!isRTL) return '';
    return 'text-right rtl';
  }, [isRTL]);

  // Computed: LLM Zone (prefer ecosystem routing if available)
  const llmZone = useMemo((): LLMZone => {
    if (ecosystemRouting.zone !== 'fallback') {
      return ecosystemRouting.zone;
    }
    return regionLanguageBundleService.getLLMZone();
  }, [ecosystemRouting.zone]);

  // Computed: Provider config from ecosystem routing
  const llmProvider = ecosystemRouting.routing.llm;
  const ttsProvider = ecosystemRouting.routing.tts;
  const sttProvider = ecosystemRouting.routing.stt;
  const translationProvider = ecosystemRouting.routing.translation;
  
  // Computed: Premium features routing (global - not zone-based)
  const premiumRouting = useMemo((): PremiumFeaturesRouting => {
    const languageCode = config?.primaryLanguage || 'en';
    const unified = getUnifiedProviderRouting(languageCode);
    return {
      voiceClone: unified.voiceClone,
      avatar: unified.avatar,
      fullBodyAvatar: unified.fullBodyAvatar,
      priorityRendering: unified.priorityRendering,
    };
  }, [config?.primaryLanguage]);
  
  const voiceCloneProvider = premiumRouting.voiceClone.primary;
  const avatarProvider = premiumRouting.avatar.primary;
  const fullBodyAvatarProvider = premiumRouting.fullBodyAvatar.primary;
  const priorityRenderingProvider = premiumRouting.priorityRendering.primary;

  // Actions
  const setLanguage = useCallback((code: string) => {
    const updated = regionLanguageBundleService.setPrimaryLanguage(code);
    setConfig({ ...updated });
    
    // Apply RTL to document
    if (typeof document !== 'undefined') {
      const isRtl = regionLanguageBundleService.isRTL(code);
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = code;
    }
  }, []);

  const setPrimaryLanguage = setLanguage; // Alias

  const addLanguage = useCallback((code: string) => {
    const updated = regionLanguageBundleService.addLanguage(code);
    setConfig({ ...updated });
  }, []);

  const removeLanguage = useCallback((code: string) => {
    const updated = regionLanguageBundleService.removeLanguage(code);
    setConfig({ ...updated });
  }, []);

  const setBundle = useCallback((bundle: BundleType) => {
    const updated = regionLanguageBundleService.setBundle(bundle);
    setConfig({ ...updated });
    
    // Apply RTL to document
    if (typeof document !== 'undefined') {
      const isRtl = regionLanguageBundleService.isRTL(updated.primaryLanguage);
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = updated.primaryLanguage;
    }
  }, []);

  const setRegion = setBundle; // Alias for backward compatibility

  const refreshDetection = useCallback(async () => {
    setIsLoading(true);
    try {
      regionLanguageBundleService.clearConfig();
      const cfg = await regionLanguageBundleService.initializeFromIP();
      setConfig(cfg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helpers
  const getLanguageInfo = useCallback((code: string) => {
    return regionLanguageBundleService.getLanguageInfo(code);
  }, []);

  const isLanguageEnabled = useCallback((code: string) => {
    if (!config) return false;
    return config.bundleLanguages.includes(code) || config.additionalLanguages.includes(code);
  }, [config]);

  const isLanguageInBundle = useCallback((code: string) => {
    if (!config) return false;
    return config.bundleLanguages.includes(code);
  }, [config]);

  const isLanguageRTL = useCallback((code: string) => {
    return regionLanguageBundleService.isRTL(code);
  }, []);

  // Legacy compatibility
  const detection = useMemo(() => {
    if (!config) return null;
    return {
      countryCode: config.detectedCountry,
      bundleType: config.bundle,
    };
  }, [config]);

  const allRegions = useMemo(() => {
    return allBundles.map(b => ({
      id: b.id,
      name: b.name,
      flag: b.flag,
    }));
  }, [allBundles]);

  return {
    // Loading
    isLoading,
    
    // Bundle info
    currentBundle,
    allBundles,
    
    // Language state
    config,
    enabledLanguages,
    bundleLanguages,
    additionalLanguages,
    availableToAdd,
    primaryLanguage,
    
    // RTL
    isRTL,
    textDirection,
    rtlClasses,
    
    // LLM Zone
    llmZone,
    llmProvider,
    ttsProvider,
    sttProvider,
    translationProvider,
    zoneSummary: ZONE_SUMMARY,
    
    // Premium Features Routing (Global - not zone-based)
    premiumRouting,
    voiceCloneProvider,
    avatarProvider,
    fullBodyAvatarProvider,
    priorityRenderingProvider,
    
    // Actions
    setLanguage,
    setPrimaryLanguage,
    addLanguage,
    removeLanguage,
    setBundle,
    setRegion,
    refreshDetection,
    
    // Helpers
    getLanguageInfo,
    isLanguageEnabled,
    isLanguageInBundle,
    isLanguageRTL,
    getProviderForFeature: (feature) => {
      switch (feature) {
        case 'llm': return llmProvider;
        case 'tts': return ttsProvider;
        case 'stt': return sttProvider;
        case 'translation': return translationProvider;
        case 'voiceClone': return voiceCloneProvider;
        case 'avatar': return avatarProvider;
        case 'fullBodyAvatar': return fullBodyAvatarProvider;
        case 'priorityRendering': return priorityRenderingProvider;
        default: return llmProvider;
      }
    },
    
    // Legacy compatibility
    preferences: config,
    detection,
    currentRegion: config?.bundle || 'english_core',
    regionalLanguages: enabledLanguages,
    allRegions,
  };
}

// Also export as useLanguageBundles for clarity
export const useLanguageBundles = useRegionalLanguage;

export default useRegionalLanguage;
