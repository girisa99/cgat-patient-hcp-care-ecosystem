/**
 * IP-BASED CONTENT HOOK
 * 
 * Auto-detects visitor's region and serves relevant industry content
 * Integrates with:
 * - Regional detection configs
 * - Industry templates
 * - Landing page sections
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  RegionalZone, 
  IndustryCategory,
  IndustryTemplateConfig,
  RegionalDetectionConfig,
  REGIONAL_DETECTION_CONFIGS,
  INDUSTRY_TEMPLATES,
  getRegionalConfigByCountry,
  getIndustryTemplatesForRegion,
} from '@/config/content-generation-pipeline';

interface IPGeoData {
  countryCode: string;
  countryName: string;
  city?: string;
  region?: string;
  timezone?: string;
}

interface UseIPBasedContentReturn {
  // Detection state
  isLoading: boolean;
  isDetected: boolean;
  
  // Detected info
  geoData: IPGeoData | null;
  detectedZone: RegionalZone | null;
  regionalConfig: RegionalDetectionConfig | null;
  
  // Content recommendations
  recommendedIndustries: IndustryCategory[];
  recommendedTemplates: IndustryTemplateConfig[];
  defaultTemplate: IndustryTemplateConfig | null;
  
  // Language & voice
  defaultLanguage: string;
  voiceProvider: string;
  avatarStyle: string;
  
  // Manual override
  setManualZone: (zone: RegionalZone) => void;
  setManualIndustry: (industry: IndustryCategory) => void;
  resetToDetected: () => void;
}

// Fallback detection using browser timezone
const detectZoneFromTimezone = (): RegionalZone => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (timezone.includes('Asia/Dubai') || timezone.includes('Asia/Riyadh') || timezone.includes('Asia/Kuwait')) {
      return 'gcc';
    }
    if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Karachi') || timezone.includes('Asia/Dhaka')) {
      return 'south_asia';
    }
    if (timezone.includes('Asia/Tokyo') || timezone.includes('Asia/Seoul') || timezone.includes('Asia/Shanghai')) {
      return 'cjk';
    }
    if (timezone.includes('Asia/Jakarta') || timezone.includes('Asia/Bangkok') || timezone.includes('Asia/Singapore')) {
      return 'sea';
    }
    if (timezone.includes('Africa')) {
      if (timezone.includes('Cairo') || timezone.includes('Casablanca')) {
        return 'mena';
      }
      return 'africa';
    }
    if (timezone.includes('Europe')) {
      return 'europe';
    }
    if (timezone.includes('America/Sao_Paulo') || timezone.includes('America/Mexico_City')) {
      return 'latam';
    }
    if (timezone.includes('America')) {
      return 'north_america';
    }
    if (timezone.includes('Australia') || timezone.includes('Pacific')) {
      return 'oceania';
    }
  } catch {
    // Fallback
  }
  
  return 'north_america'; // Default fallback
};

// Storage key for manual overrides
const STORAGE_KEY_ZONE = 'genie_content_zone';
const STORAGE_KEY_INDUSTRY = 'genie_content_industry';

export const useIPBasedContent = (): UseIPBasedContentReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [geoData, setGeoData] = useState<IPGeoData | null>(null);
  const [detectedZone, setDetectedZone] = useState<RegionalZone | null>(null);
  const [manualZone, setManualZoneState] = useState<RegionalZone | null>(null);
  const [manualIndustry, setManualIndustryState] = useState<IndustryCategory | null>(null);

  // Detect region on mount
  useEffect(() => {
    const detectRegion = async () => {
      setIsLoading(true);
      
      // Check for stored manual overrides
      try {
        const storedZone = localStorage.getItem(STORAGE_KEY_ZONE) as RegionalZone | null;
        const storedIndustry = localStorage.getItem(STORAGE_KEY_INDUSTRY) as IndustryCategory | null;
        
        if (storedZone) {
          setManualZoneState(storedZone);
        }
        if (storedIndustry) {
          setManualIndustryState(storedIndustry);
        }
      } catch {
        // localStorage not available
      }

      // Try IP-based detection using free service
      try {
        const response = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });
        
        if (response.ok) {
          const data = await response.json();
          const countryCode = data.country_code || data.country;
          
          setGeoData({
            countryCode,
            countryName: data.country_name,
            city: data.city,
            region: data.region,
            timezone: data.timezone,
          });
          
          const config = getRegionalConfigByCountry(countryCode);
          setDetectedZone(config?.zone || detectZoneFromTimezone());
        } else {
          // Fallback to timezone detection
          setDetectedZone(detectZoneFromTimezone());
        }
      } catch {
        // Fallback to timezone detection
        setDetectedZone(detectZoneFromTimezone());
      }
      
      setIsLoading(false);
    };

    detectRegion();
  }, []);

  // Get effective zone (manual override or detected)
  const effectiveZone = manualZone || detectedZone || 'north_america';
  
  // Get regional config
  const regionalConfig = REGIONAL_DETECTION_CONFIGS.find(r => r.zone === effectiveZone) || null;
  
  // Get recommended industries
  const recommendedIndustries = manualIndustry 
    ? [manualIndustry, ...(regionalConfig?.defaultIndustries.filter(i => i !== manualIndustry) || [])]
    : regionalConfig?.defaultIndustries || ['technology', 'healthcare', 'education', 'finance'];

  // Get recommended templates
  const recommendedTemplates = manualIndustry
    ? INDUSTRY_TEMPLATES.filter(t => t.industry === manualIndustry || t.region === effectiveZone)
    : getIndustryTemplatesForRegion(effectiveZone);

  // Get default template
  const defaultTemplate = recommendedTemplates[0] || null;

  // Manual override functions
  const setManualZone = useCallback((zone: RegionalZone) => {
    setManualZoneState(zone);
    try {
      localStorage.setItem(STORAGE_KEY_ZONE, zone);
    } catch {
      // localStorage not available
    }
  }, []);

  const setManualIndustry = useCallback((industry: IndustryCategory) => {
    setManualIndustryState(industry);
    try {
      localStorage.setItem(STORAGE_KEY_INDUSTRY, industry);
    } catch {
      // localStorage not available
    }
  }, []);

  const resetToDetected = useCallback(() => {
    setManualZoneState(null);
    setManualIndustryState(null);
    try {
      localStorage.removeItem(STORAGE_KEY_ZONE);
      localStorage.removeItem(STORAGE_KEY_INDUSTRY);
    } catch {
      // localStorage not available
    }
  }, []);

  return {
    isLoading,
    isDetected: detectedZone !== null,
    geoData,
    detectedZone,
    regionalConfig,
    recommendedIndustries: recommendedIndustries as IndustryCategory[],
    recommendedTemplates,
    defaultTemplate,
    defaultLanguage: regionalConfig?.defaultLanguage || 'en',
    voiceProvider: regionalConfig?.voiceProvider || 'elevenlabs',
    avatarStyle: regionalConfig?.avatarStyle || 'professional_western',
    setManualZone,
    setManualIndustry,
    resetToDetected,
  };
};

export default useIPBasedContent;
