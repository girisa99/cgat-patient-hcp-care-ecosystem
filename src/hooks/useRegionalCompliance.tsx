/**
 * Regional Compliance Hook
 * Manages region-based privacy, terms, and content moderation
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { 
  getFullComplianceConfig,
  getRegionFromCountry,
  type ComplianceRegion,
  type RegionalPrivacyPolicy,
  type RegionalContentPolicy,
  type RegionalTermsOfService,
} from '@/services/regionalComplianceRegistry';
import { enhancedContentModeration } from '@/services/enhancedContentModerationService';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface RegionalComplianceState {
  isLoading: boolean;
  countryCode: string | null;
  region: ComplianceRegion | null;
  privacy: RegionalPrivacyPolicy | null;
  content: RegionalContentPolicy | null;
  terms: RegionalTermsOfService | null;
  hasConsented: boolean;
  consentTimestamp: string | null;
  requiresConsentRenewal: boolean;
}

interface RegionalComplianceContextValue extends RegionalComplianceState {
  setCountryCode: (code: string) => void;
  recordConsent: () => void;
  revokeConsent: () => void;
  checkContentAllowed: (contentType: string) => boolean;
  getLocalizedPolicyUrl: (policyType: 'privacy' | 'terms' | 'cookies') => string;
  isRTLRegion: boolean;
  requiresExplicitConsent: boolean;
  requiresCookieConsent: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════

const RegionalComplianceContext = createContext<RegionalComplianceContextValue | null>(null);

// ═══════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════

interface RegionalComplianceProviderProps {
  children: ReactNode;
  defaultCountryCode?: string;
}

export const RegionalComplianceProvider: React.FC<RegionalComplianceProviderProps> = ({
  children,
  defaultCountryCode = 'US',
}) => {
  const [state, setState] = useState<RegionalComplianceState>({
    isLoading: true,
    countryCode: null,
    region: null,
    privacy: null,
    content: null,
    terms: null,
    hasConsented: false,
    consentTimestamp: null,
    requiresConsentRenewal: false,
  });

  // Load saved consent from localStorage
  useEffect(() => {
    const savedConsent = localStorage.getItem('regional_consent');
    if (savedConsent) {
      try {
        const consent = JSON.parse(savedConsent);
        const consentDate = new Date(consent.timestamp);
        const now = new Date();
        const daysSinceConsent = Math.floor((now.getTime() - consentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Consent renewal required after 365 days
        const requiresRenewal = daysSinceConsent > 365;
        
        setState(prev => ({
          ...prev,
          hasConsented: !requiresRenewal,
          consentTimestamp: consent.timestamp,
          requiresConsentRenewal: requiresRenewal,
        }));
      } catch (e) {
        console.error('Error parsing consent:', e);
      }
    }
  }, []);

  // Detect user's country (could be from geo-compliance check)
  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Check if we have country from geo-compliance
        const geoData = sessionStorage.getItem('geo_compliance');
        if (geoData) {
          const geo = JSON.parse(geoData);
          if (geo.countryCode) {
            setCountryCode(geo.countryCode);
            return;
          }
        }
        
        // Fallback to default
        setCountryCode(defaultCountryCode);
      } catch (e) {
        console.error('Error detecting country:', e);
        setCountryCode(defaultCountryCode);
      }
    };

    detectCountry();
  }, [defaultCountryCode]);

  const setCountryCode = useCallback((code: string) => {
    const config = getFullComplianceConfig(code);
    
    // Configure content moderation for this region
    enhancedContentModeration.configureForRegion(code);
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      countryCode: code,
      region: config.region,
      privacy: config.privacy,
      content: config.content,
      terms: config.terms,
    }));

    // Store in session for persistence
    sessionStorage.setItem('user_country', code);
  }, []);

  const recordConsent = useCallback(() => {
    const consentRecord = {
      timestamp: new Date().toISOString(),
      region: state.region,
      countryCode: state.countryCode,
    };
    localStorage.setItem('regional_consent', JSON.stringify(consentRecord));
    
    setState(prev => ({
      ...prev,
      hasConsented: true,
      consentTimestamp: consentRecord.timestamp,
      requiresConsentRenewal: false,
    }));
  }, [state.region, state.countryCode]);

  const revokeConsent = useCallback(() => {
    localStorage.removeItem('regional_consent');
    
    setState(prev => ({
      ...prev,
      hasConsented: false,
      consentTimestamp: null,
      requiresConsentRenewal: false,
    }));
  }, []);

  const checkContentAllowed = useCallback((contentType: string): boolean => {
    if (!state.content) return true;
    
    switch (contentType) {
      case 'adult':
        return state.content.adultContentAllowed;
      case 'gambling':
        return state.content.gamblingContentAllowed;
      case 'alcohol':
        return state.content.alcoholContentAllowed;
      case 'tobacco':
        return state.content.tobaccoContentAllowed;
      case 'cannabis':
        return state.content.cannabisContentAllowed;
      case 'weapons':
        return state.content.weaponryContentAllowed;
      default:
        return true;
    }
  }, [state.content]);

  const getLocalizedPolicyUrl = useCallback((policyType: 'privacy' | 'terms' | 'cookies'): string => {
    const region = state.region?.toLowerCase() || 'us';
    return `/${policyType}-policy?region=${region}`;
  }, [state.region]);

  // RTL regions (Arabic-speaking countries)
  const isRTLRegion = state.region === 'MENA';

  // Consent requirements
  const requiresExplicitConsent = state.privacy?.requiresExplicitConsent ?? false;
  const requiresCookieConsent = state.privacy?.cookieConsentRequired ?? false;

  const contextValue: RegionalComplianceContextValue = {
    ...state,
    setCountryCode,
    recordConsent,
    revokeConsent,
    checkContentAllowed,
    getLocalizedPolicyUrl,
    isRTLRegion,
    requiresExplicitConsent,
    requiresCookieConsent,
  };

  return (
    <RegionalComplianceContext.Provider value={contextValue}>
      {children}
    </RegionalComplianceContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════

export const useRegionalCompliance = (): RegionalComplianceContextValue => {
  const context = useContext(RegionalComplianceContext);
  if (!context) {
    throw new Error('useRegionalCompliance must be used within RegionalComplianceProvider');
  }
  return context;
};

// ═══════════════════════════════════════════════════════════════════
// COMPLIANCE GATE COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface RegionalComplianceGateProps {
  children: ReactNode;
  requireConsent?: boolean;
  fallback?: ReactNode;
}

export const RegionalComplianceGate: React.FC<RegionalComplianceGateProps> = ({
  children,
  requireConsent = true,
  fallback,
}) => {
  const { isLoading, hasConsented, requiresConsentRenewal, requiresExplicitConsent } = useRegionalCompliance();

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If region requires explicit consent and user hasn't consented
  if (requireConsent && requiresExplicitConsent && (!hasConsented || requiresConsentRenewal)) {
    return fallback || null;
  }

  return <>{children}</>;
};

export default useRegionalCompliance;
