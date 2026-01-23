/**
 * useLanguageBundles Hook
 * 
 * Primary hook for managing language bundles across the Genie ecosystem.
 * Provides auto-detection, bundle management, and user language additions.
 * 
 * This is the SINGLE SOURCE OF TRUTH for language configuration across:
 * Spark, Mind, Vibe, Deck, Ask Genie, Arc, Production Hub, and Mobile
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
import { useEcosystemRouting } from './useEcosystemRouting';

export interface UseLanguageBundlesReturn {
  // Current state
  config: UserLanguageConfig | null;
  isLoading: boolean;
  
  // Bundle info
  currentBundle: LanguageBundle | null;
  allBundles: LanguageBundle[];
  
  // Languages
  enabledLanguages: LanguageInfo[];
  bundleLanguages: LanguageInfo[];
  additionalLanguages: LanguageInfo[];
  availableToAdd: LanguageInfo[];
  primaryLanguage: LanguageInfo | null;
  
  // RTL support
  isRTL: boolean;
  
  // LLM Zone
  llmZone: 'claude' | 'alibaba' | 'gemini' | 'fallback';
  
  // Actions
  addLanguage: (code: string) => void;
  removeLanguage: (code: string) => void;
  setPrimaryLanguage: (code: string) => void;
  setBundle: (bundle: BundleType) => void;
  refreshDetection: () => Promise<void>;
  
  // Helpers
  getLanguageInfo: (code: string) => LanguageInfo | undefined;
  isLanguageEnabled: (code: string) => boolean;
  isLanguageInBundle: (code: string) => boolean;
}

export function useLanguageBundles(): UseLanguageBundlesReturn {
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
      } catch (error) {
        console.error('[useLanguageBundles] Initialization error:', error);
        // Create default config
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

  // Computed: LLM Zone (prefer ecosystem routing if available)
  const llmZone = useMemo(() => {
    // Prefer ecosystem routing zone if initialized
    if (ecosystemRouting.zone !== 'fallback') {
      return ecosystemRouting.zone;
    }
    return regionLanguageBundleService.getLLMZone();
  }, [ecosystemRouting.zone]);

  // Actions
  const addLanguage = useCallback((code: string) => {
    const updated = regionLanguageBundleService.addLanguage(code);
    setConfig({ ...updated });
  }, []);

  const removeLanguage = useCallback((code: string) => {
    const updated = regionLanguageBundleService.removeLanguage(code);
    setConfig({ ...updated });
  }, []);

  const setPrimaryLanguage = useCallback((code: string) => {
    const updated = regionLanguageBundleService.setPrimaryLanguage(code);
    setConfig({ ...updated });
  }, []);

  const setBundle = useCallback((bundle: BundleType) => {
    const updated = regionLanguageBundleService.setBundle(bundle);
    setConfig({ ...updated });
  }, []);

  const refreshDetection = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear existing config
      regionLanguageBundleService.clearConfig();
      // Re-detect
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

  return {
    config,
    isLoading,
    currentBundle,
    allBundles,
    enabledLanguages,
    bundleLanguages,
    additionalLanguages,
    availableToAdd,
    primaryLanguage,
    isRTL,
    llmZone,
    addLanguage,
    removeLanguage,
    setPrimaryLanguage,
    setBundle,
    refreshDetection,
    getLanguageInfo,
    isLanguageEnabled,
    isLanguageInBundle,
  };
}

export default useLanguageBundles;
