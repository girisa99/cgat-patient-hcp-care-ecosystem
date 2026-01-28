/**
 * Regional Pricing Service
 * 
 * Integrates with:
 * - geo-detect edge function for IP-based region detection
 * - genie_regional_pricing table for pricing data
 * - Existing 6-zone language routing (Claude, Alibaba, Arabic, Gemini, Africa, Fallback)
 * - Contextual transcreation via unifiedProviderRoutingAdapter
 * 
 * Architecture:
 * - Master toggle: is_regional_enabled (instant on/off)
 * - Fallback: Always to 'global' if region unavailable
 * - Language: Uses intelligent translation adapter, not literal translation
 */

import { supabase } from '@/integrations/supabase/client';

// Types
export interface RegionalPricing {
  id: string;
  region_code: string;
  region_name: string;
  display_name: string;
  currency_code: string;
  language_zone: 'global' | 'claude' | 'alibaba' | 'arabic' | 'gemini' | 'africa' | 'fallback';
  default_language: string;
  supported_languages: string[];
  is_active: boolean;
  is_default: boolean;
  stripe_price_ids: Record<string, string>;
  payment_methods: string[];
  ppp_multiplier: number;
  metadata: Record<string, unknown>;
}

export interface GeoDetectionResult {
  success: boolean;
  region: RegionalPricing;
  detected_country: string | null;
  fallback_used: boolean;
}

export interface PricingSettings {
  is_regional_enabled: boolean;
  fallback_region: string;
  geo_detection_enabled: boolean;
}

// Cache for region data (5 minute TTL)
let cachedRegion: GeoDetectionResult | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class RegionalPricingService {
  private settings: PricingSettings | null = null;

  /**
   * Load pricing settings from database
   */
  async loadSettings(): Promise<PricingSettings> {
    if (this.settings) return this.settings;

    const { data, error } = await supabase
      .from('genie_pricing_settings')
      .select('setting_key, setting_value');

    if (error) {
      console.error('[RegionalPricing] Failed to load settings:', error);
      return {
        is_regional_enabled: false,
        fallback_region: 'global',
        geo_detection_enabled: true,
      };
    }

    const settingsMap = Object.fromEntries(
      (data || []).map(s => [s.setting_key, JSON.parse(s.setting_value as string)])
    );

    this.settings = {
      is_regional_enabled: settingsMap['is_regional_enabled'] === true,
      fallback_region: settingsMap['fallback_region'] || 'global',
      geo_detection_enabled: settingsMap['geo_detection_enabled'] !== false,
    };

    return this.settings;
  }

  /**
   * Detect user's region via IP geolocation
   * Returns region data with language zone for translation adapter integration
   */
  async detectRegion(forceRefresh = false): Promise<GeoDetectionResult> {
    // Check cache
    if (!forceRefresh && cachedRegion && Date.now() - cacheTimestamp < CACHE_TTL) {
      return cachedRegion;
    }

    try {
      const { data, error } = await supabase.functions.invoke('geo-detect', {
        body: {},
      });

      if (error) throw error;

      cachedRegion = data as GeoDetectionResult;
      cacheTimestamp = Date.now();

      console.log('[RegionalPricing] Region detected:', {
        region: cachedRegion.region.region_code,
        languageZone: cachedRegion.region.language_zone,
        defaultLanguage: cachedRegion.region.default_language,
      });

      return cachedRegion;
    } catch (error) {
      console.error('[RegionalPricing] Detection failed, using fallback:', error);
      
      // Return global fallback
      return {
        success: false,
        region: {
          id: 'fallback',
          region_code: 'global',
          region_name: 'Global/US',
          display_name: 'United States',
          currency_code: 'USD',
          language_zone: 'global',
          default_language: 'en',
          supported_languages: ['en'],
          is_active: true,
          is_default: true,
          stripe_price_ids: {},
          payment_methods: ['card'],
          ppp_multiplier: 1.00,
          metadata: {},
        },
        detected_country: null,
        fallback_used: true,
      };
    }
  }

  /**
   * Get Stripe price ID for a product in the user's region
   */
  async getRegionalPriceId(productKey: string, fallbackPriceId: string): Promise<string> {
    const settings = await this.loadSettings();
    
    // If regional pricing is disabled, return fallback (global price)
    if (!settings.is_regional_enabled) {
      return fallbackPriceId;
    }

    const regionResult = await this.detectRegion();
    const stripePriceIds = regionResult.region.stripe_price_ids || {};
    
    // Return regional price if available, otherwise fallback
    return stripePriceIds[productKey] || fallbackPriceId;
  }

  /**
   * Get available payment methods for user's region
   */
  async getPaymentMethods(): Promise<string[]> {
    const regionResult = await this.detectRegion();
    return regionResult.region.payment_methods || ['card'];
  }

  /**
   * Get language zone for translation adapter routing
   * Maps to 6-zone architecture: Claude, Alibaba, Arabic, Gemini, Africa, Fallback
   */
  async getLanguageZone(): Promise<string> {
    const regionResult = await this.detectRegion();
    return regionResult.region.language_zone;
  }

  /**
   * Get default language for the user's region
   */
  async getDefaultLanguage(): Promise<string> {
    const regionResult = await this.detectRegion();
    return regionResult.region.default_language;
  }

  /**
   * Get supported languages for the user's region
   */
  async getSupportedLanguages(): Promise<string[]> {
    const regionResult = await this.detectRegion();
    return regionResult.region.supported_languages;
  }

  /**
   * Get all active regions for display (e.g., region selector)
   */
  async getActiveRegions(): Promise<RegionalPricing[]> {
    const { data, error } = await supabase
      .from('genie_regional_pricing')
      .select('*')
      .eq('is_active', true)
      .order('region_name');

    if (error) {
      console.error('[RegionalPricing] Failed to fetch regions:', error);
      return [];
    }

    return (data || []) as RegionalPricing[];
  }

  /**
   * Manually set user's region (for override/testing)
   */
  async setRegionOverride(regionCode: string): Promise<GeoDetectionResult | null> {
    const { data, error } = await supabase
      .from('genie_regional_pricing')
      .select('*')
      .eq('region_code', regionCode)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('[RegionalPricing] Region not found:', regionCode);
      return null;
    }

    cachedRegion = {
      success: true,
      region: data as RegionalPricing,
      detected_country: null,
      fallback_used: false,
    };
    cacheTimestamp = Date.now();

    return cachedRegion;
  }

  /**
   * Clear cached region (force re-detection)
   */
  clearCache(): void {
    cachedRegion = null;
    cacheTimestamp = 0;
    this.settings = null;
  }

  /**
   * Check if regional pricing is enabled
   */
  async isRegionalPricingEnabled(): Promise<boolean> {
    const settings = await this.loadSettings();
    return settings.is_regional_enabled;
  }

  /**
   * Get price with PPP adjustment (for display purposes)
   */
  async getAdjustedPrice(basePrice: number): Promise<{ price: number; currency: string; multiplier: number }> {
    const regionResult = await this.detectRegion();
    const multiplier = regionResult.region.ppp_multiplier || 1.00;
    
    return {
      price: Math.round(basePrice * multiplier * 100) / 100,
      currency: regionResult.region.currency_code,
      multiplier,
    };
  }
}

// Singleton export
export const regionalPricingService = new RegionalPricingService();
