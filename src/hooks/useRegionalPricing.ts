/**
 * useRegionalPricing Hook
 * 
 * React hook for regional pricing integration.
 * Connects to:
 * - geo-detect edge function
 * - 6-zone language routing
 * - Contextual transcreation (not literal translation)
 * - Stripe checkout with regional prices
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  regionalPricingService, 
  RegionalPricing, 
  GeoDetectionResult 
} from '@/services/regionalPricingService';

interface UseRegionalPricingReturn {
  // Region data
  region: RegionalPricing | null;
  detectedCountry: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Pricing helpers
  getRegionalPriceId: (productKey: string, fallbackPriceId: string) => Promise<string>;
  getAdjustedPrice: (basePrice: number) => Promise<{ price: number; currency: string; multiplier: number }>;
  
  // Language zone for translation adapter
  languageZone: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  
  // Payment methods
  paymentMethods: string[];
  
  // Controls
  refreshRegion: () => Promise<void>;
  setRegionOverride: (regionCode: string) => Promise<void>;
  
  // Settings
  isRegionalEnabled: boolean;
}

export function useRegionalPricing(): UseRegionalPricingReturn {
  const [region, setRegion] = useState<RegionalPricing | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegionalEnabled, setIsRegionalEnabled] = useState(false);

  // Detect region on mount
  useEffect(() => {
    const detectRegion = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if regional pricing is enabled
        const enabled = await regionalPricingService.isRegionalPricingEnabled();
        setIsRegionalEnabled(enabled);

        // Detect region
        const result = await regionalPricingService.detectRegion();
        setRegion(result.region);
        setDetectedCountry(result.detected_country);

        console.log('[useRegionalPricing] Region loaded:', {
          region: result.region.region_code,
          language: result.region.default_language,
          languageZone: result.region.language_zone,
          enabled,
        });
      } catch (err) {
        console.error('[useRegionalPricing] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to detect region');
      } finally {
        setIsLoading(false);
      }
    };

    detectRegion();
  }, []);

  // Refresh region detection
  const refreshRegion = useCallback(async () => {
    try {
      setIsLoading(true);
      regionalPricingService.clearCache();
      const result = await regionalPricingService.detectRegion(true);
      setRegion(result.region);
      setDetectedCountry(result.detected_country);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh region');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Override region manually
  const setRegionOverride = useCallback(async (regionCode: string) => {
    try {
      setIsLoading(true);
      const result = await regionalPricingService.setRegionOverride(regionCode);
      if (result) {
        setRegion(result.region);
        setDetectedCountry(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set region');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get regional price ID
  const getRegionalPriceId = useCallback(
    async (productKey: string, fallbackPriceId: string) => {
      return regionalPricingService.getRegionalPriceId(productKey, fallbackPriceId);
    },
    []
  );

  // Get adjusted price with PPP
  const getAdjustedPrice = useCallback(
    async (basePrice: number) => {
      return regionalPricingService.getAdjustedPrice(basePrice);
    },
    []
  );

  return {
    // Region data
    region,
    detectedCountry,
    isLoading,
    error,

    // Pricing helpers
    getRegionalPriceId,
    getAdjustedPrice,

    // Language zone for translation adapter integration
    languageZone: region?.language_zone || 'global',
    defaultLanguage: region?.default_language || 'en',
    supportedLanguages: region?.supported_languages || ['en'],

    // Payment methods
    paymentMethods: region?.payment_methods || ['card'],

    // Controls
    refreshRegion,
    setRegionOverride,

    // Settings
    isRegionalEnabled,
  };
}

/**
 * Hook for just language zone detection
 * Useful for components that only need language routing
 */
export function useRegionalLanguage() {
  const { languageZone, defaultLanguage, supportedLanguages, isLoading } = useRegionalPricing();
  
  return {
    languageZone,
    defaultLanguage,
    supportedLanguages,
    isLoading,
  };
}
