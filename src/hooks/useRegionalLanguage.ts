/**
 * useRegionalLanguage Hook
 * 
 * React hook for managing regional language detection, preferences, and RTL support.
 * Provides automatic IP-based detection with user override capabilities.
 * 
 * NOW INTEGRATED WITH: useEcosystemRouting for 4-Zone LLM routing
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  regionalLanguageService,
  RegionalCluster,
  RegionalLanguage,
  RegionalProviderConfig,
  UserLanguagePreferences,
  RegionDetectionResult,
  TextDirection,
} from '@/services/regionalLanguageService';
import { useEcosystemRouting, ZONE_SUMMARY } from '@/hooks/useEcosystemRouting';

export interface UseRegionalLanguageReturn {
  // Current state
  preferences: UserLanguagePreferences | null;
  isLoading: boolean;
  isRTL: boolean;
  textDirection: TextDirection;
  rtlClasses: string;
  
  // Detected region info
  detection: RegionDetectionResult | null;
  currentRegion: RegionalCluster;
  regionalLanguages: RegionalLanguage[];
  
  // Provider configuration
  providerConfig: RegionalProviderConfig;
  
  // Actions
  setLanguage: (languageCode: string) => void;
  setRegion: (region: RegionalCluster) => void;
  refreshDetection: () => Promise<void>;
  getLanguagesForRegion: (region: RegionalCluster) => RegionalLanguage[];
  isLanguageRTL: (languageCode: string) => boolean;
  
  // All regions for selection UI
  allRegions: { id: RegionalCluster; name: string; flag: string }[];
  
  // 4-Zone LLM Routing integration
  llmZone: 'claude' | 'alibaba' | 'gemini' | 'fallback';
  llmProvider: string;
  ttsProvider: string;
  sttProvider: string;
  translationProvider: string;
  zoneSummary: typeof ZONE_SUMMARY;
}

export function useRegionalLanguage(): UseRegionalLanguageReturn {
  const [preferences, setPreferences] = useState<UserLanguagePreferences | null>(null);
  const [detection, setDetection] = useState<RegionDetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Integrate 4-Zone LLM routing
  const ecosystemRouting = useEcosystemRouting();

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Load or detect preferences
        const prefs = await regionalLanguageService.initializePreferences();
        setPreferences(prefs);

        // Get full detection info
        const detectionResult = await regionalLanguageService.detectRegionFromIP();
        setDetection(detectionResult);
      } catch (error) {
        console.error('[useRegionalLanguage] Initialization error:', error);
        // Set defaults on error
        setPreferences({
          primaryLanguage: 'en',
          regionCluster: 'global_english',
          secondaryLanguages: [],
          enableRTL: false,
          detectedAutomatically: true,
          lastUpdated: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Computed values
  const currentRegion = useMemo(() => {
    return preferences?.regionCluster || detection?.regionCluster || 'global_english';
  }, [preferences, detection]);

  const isRTL = useMemo(() => {
    return preferences?.enableRTL || 
           regionalLanguageService.isRTLLanguage(preferences?.primaryLanguage || 'en');
  }, [preferences]);

  const textDirection = useMemo((): TextDirection => {
    return isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  const rtlClasses = useMemo(() => {
    return regionalLanguageService.getRTLClasses(preferences?.primaryLanguage);
  }, [preferences]);

  const regionalLanguages = useMemo(() => {
    return regionalLanguageService.getLanguagesForRegion(currentRegion);
  }, [currentRegion]);

  const providerConfig = useMemo(() => {
    return regionalLanguageService.getProviderForLanguage(preferences?.primaryLanguage || 'en');
  }, [preferences]);

  const allRegions = useMemo(() => {
    return regionalLanguageService.getAllRegions();
  }, []);

  // Actions
  const setLanguage = useCallback((languageCode: string) => {
    const updated = regionalLanguageService.updatePrimaryLanguage(languageCode);
    setPreferences(updated);

    // Apply RTL to document if needed
    if (typeof document !== 'undefined') {
      document.documentElement.dir = updated.enableRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = languageCode;
    }
  }, []);

  const setRegion = useCallback((region: RegionalCluster) => {
    const regionConfig = regionalLanguageService.getRegionConfig('', 'UTC');
    const languages = regionalLanguageService.getLanguagesForRegion(region);
    const defaultLang = languages.find(l => l.isDefault) || languages[0];

    const updated: UserLanguagePreferences = {
      primaryLanguage: defaultLang?.code || 'en',
      regionCluster: region,
      secondaryLanguages: ['en'],
      enableRTL: defaultLang ? regionalLanguageService.isRTLLanguage(defaultLang.code) : false,
      detectedAutomatically: false,
      lastUpdated: new Date().toISOString(),
    };

    regionalLanguageService.savePreferences(updated);
    setPreferences(updated);

    // Apply RTL to document if needed
    if (typeof document !== 'undefined') {
      document.documentElement.dir = updated.enableRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = updated.primaryLanguage;
    }
  }, []);

  const refreshDetection = useCallback(async () => {
    setIsLoading(true);
    try {
      const detectionResult = await regionalLanguageService.detectRegionFromIP();
      setDetection(detectionResult);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLanguagesForRegion = useCallback((region: RegionalCluster) => {
    return regionalLanguageService.getLanguagesForRegion(region);
  }, []);

  const isLanguageRTL = useCallback((languageCode: string) => {
    return regionalLanguageService.isRTLLanguage(languageCode);
  }, []);

  return {
    preferences,
    isLoading,
    isRTL,
    textDirection,
    rtlClasses,
    detection,
    currentRegion,
    regionalLanguages,
    providerConfig,
    setLanguage,
    setRegion,
    refreshDetection,
    getLanguagesForRegion,
    isLanguageRTL,
    allRegions,
    // 4-Zone LLM Routing integration
    llmZone: ecosystemRouting.zone,
    llmProvider: ecosystemRouting.routing.llm,
    ttsProvider: ecosystemRouting.routing.tts,
    sttProvider: ecosystemRouting.routing.stt,
    translationProvider: ecosystemRouting.routing.translation,
    zoneSummary: ZONE_SUMMARY,
  };
}

export default useRegionalLanguage;
