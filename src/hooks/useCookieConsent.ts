/**
 * COOKIE CONSENT HOOK
 * Manages GDPR/CCPA cookie consent preferences
 * Stores consent in localStorage and syncs to database for logged-in users
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CookiePreferences {
  essential: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookieConsentState {
  hasConsented: boolean;
  preferences: CookiePreferences;
  consentDate: string | null;
}

const COOKIE_CONSENT_KEY = 'genie_cookie_consent';

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export const useCookieConsent = () => {
  const [state, setState] = useState<CookieConsentState>({
    hasConsented: false,
    preferences: defaultPreferences,
    consentDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load consent from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState({
          hasConsented: true,
          preferences: { ...defaultPreferences, ...parsed.preferences },
          consentDate: parsed.consentDate,
        });
      } catch (e) {
        console.error('Failed to parse cookie consent:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const saveConsent = useCallback(async (preferences: CookiePreferences) => {
    const consentDate = new Date().toISOString();
    const consentData = {
      preferences: { ...preferences, essential: true }, // Essential always true
      consentDate,
    };

    // Save to localStorage
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));

    // Update state
    setState({
      hasConsented: true,
      preferences: consentData.preferences,
      consentDate,
    });

    // Sync to database for logged-in users
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_legal_acceptances').upsert({
          user_id: user.id,
          document_type: 'cookie_policy',
          document_version: '1.0',
          accepted_at: consentDate,
          ip_address: 'client',
          user_agent: navigator.userAgent,
          consent_details: consentData.preferences,
        }, {
          onConflict: 'user_id,document_type'
        });
      }
    } catch (error) {
      console.error('Failed to sync cookie consent to database:', error);
    }

    console.log('🍪 Cookie consent saved:', consentData.preferences);
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  }, [saveConsent]);

  const acceptEssentialOnly = useCallback(() => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  }, [saveConsent]);

  const updatePreferences = useCallback((preferences: Partial<CookiePreferences>) => {
    saveConsent({
      ...state.preferences,
      ...preferences,
      essential: true, // Cannot disable essential
    });
  }, [saveConsent, state.preferences]);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    setState({
      hasConsented: false,
      preferences: defaultPreferences,
      consentDate: null,
    });
  }, []);

  return {
    ...state,
    isLoading,
    acceptAll,
    acceptEssentialOnly,
    updatePreferences,
    resetConsent,
    saveConsent,
  };
};
