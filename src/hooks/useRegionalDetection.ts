/**
 * REGIONAL DETECTION HOOK
 * Hybrid IP-based auto-detection + manual language selector
 * 
 * Integrates with:
 * - 5-zone LLM routing (Claude, Alibaba, Arabic/GPT-4o, Gemini, Fallback)
 * - 14 regional bundles
 * - RTL layout support
 */

import { useState, useEffect, useCallback } from 'react';
import { RegionalCode, SUPPORTED_REGIONS } from '@/config/genie-sitemap';

interface RegionalState {
  detectedRegion: RegionalCode;
  selectedRegion: RegionalCode;
  isRTL: boolean;
  isLoading: boolean;
  regionName: string;
}

export interface UseRegionalDetectionReturn extends RegionalState {
  setRegion: (code: RegionalCode) => void;
  resetToDetected: () => void;
  getLocalizedPath: (path: string) => string;
}

// Browser language to region code mapping
const BROWSER_LANG_MAP: Record<string, RegionalCode> = {
  'en': 'en', 'en-US': 'en', 'en-GB': 'en',
  'ar': 'ar', 'ar-SA': 'ar', 'ar-EG': 'ar', 'ar-AE': 'ar',
  'zh': 'zh', 'zh-CN': 'zh', 'zh-TW': 'zh', 'zh-HK': 'zh',
  'hi': 'hi', 'hi-IN': 'hi',
  'es': 'es', 'es-ES': 'es', 'es-MX': 'es', 'es-AR': 'es',
  'fr': 'fr', 'fr-FR': 'fr', 'fr-CA': 'fr',
  'de': 'de', 'de-DE': 'de', 'de-AT': 'de',
  'ja': 'ja', 'ja-JP': 'ja',
  'ko': 'ko', 'ko-KR': 'ko',
  'pt': 'pt', 'pt-BR': 'pt', 'pt-PT': 'pt',
  'tr': 'tr', 'tr-TR': 'tr',
  'id': 'id', 'id-ID': 'id',
  'vi': 'vi', 'vi-VN': 'vi',
};

// RTL languages
const RTL_REGIONS: RegionalCode[] = ['ar'];

// Storage key for persisted selection
const REGION_STORAGE_KEY = 'genie_selected_region';

/**
 * Detect region from browser settings
 */
const detectBrowserRegion = (): RegionalCode => {
  if (typeof window === 'undefined') return 'en';
  
  // Check navigator languages
  const languages = navigator.languages || [navigator.language];
  
  for (const lang of languages) {
    const mapped = BROWSER_LANG_MAP[lang] || BROWSER_LANG_MAP[lang.split('-')[0]];
    if (mapped) return mapped;
  }
  
  return 'en';
};

/**
 * Get persisted region selection
 */
const getPersistedRegion = (): RegionalCode | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(REGION_STORAGE_KEY);
    if (stored && SUPPORTED_REGIONS.some(r => r.code === stored)) {
      return stored as RegionalCode;
    }
  } catch {
    // localStorage not available
  }
  
  return null;
};

/**
 * Persist region selection
 */
const persistRegion = (code: RegionalCode): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(REGION_STORAGE_KEY, code);
  } catch {
    // localStorage not available
  }
};

/**
 * Regional Detection Hook
 */
export const useRegionalDetection = (): UseRegionalDetectionReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [detectedRegion, setDetectedRegion] = useState<RegionalCode>('en');
  const [selectedRegion, setSelectedRegion] = useState<RegionalCode>('en');

  // Initialize on mount
  useEffect(() => {
    const detected = detectBrowserRegion();
    const persisted = getPersistedRegion();
    
    setDetectedRegion(detected);
    setSelectedRegion(persisted || detected);
    setIsLoading(false);
  }, []);

  // Set region manually
  const setRegion = useCallback((code: RegionalCode) => {
    setSelectedRegion(code);
    persistRegion(code);
    
    // Update document direction for RTL
    if (typeof document !== 'undefined') {
      document.documentElement.dir = RTL_REGIONS.includes(code) ? 'rtl' : 'ltr';
      document.documentElement.lang = code;
    }
  }, []);

  // Reset to auto-detected region
  const resetToDetected = useCallback(() => {
    setRegion(detectedRegion);
  }, [detectedRegion, setRegion]);

  // Get localized path (e.g., /ar/products/deck)
  const getLocalizedPath = useCallback((path: string): string => {
    // Don't add region prefix for English (default)
    if (selectedRegion === 'en') return path;
    
    // Don't localize auth or dashboard paths
    if (path.startsWith('/auth') || path.startsWith('/dashboard') || path.startsWith('/internal')) {
      return path;
    }
    
    // Add region prefix
    return `/${selectedRegion}${path}`;
  }, [selectedRegion]);

  // Computed values
  const isRTL = RTL_REGIONS.includes(selectedRegion);
  const regionData = SUPPORTED_REGIONS.find(r => r.code === selectedRegion);
  const regionName = regionData?.name || 'English';

  return {
    detectedRegion,
    selectedRegion,
    isRTL,
    isLoading,
    regionName,
    setRegion,
    resetToDetected,
    getLocalizedPath,
  };
};

export default useRegionalDetection;
