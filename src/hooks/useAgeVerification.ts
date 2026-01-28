/**
 * AGE VERIFICATION HOOK
 * Manages age verification state for content access
 * Supports 13+ (general) and 18+ (adult content) gates
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AgeGate = '13+' | '18+';

interface AgeVerificationState {
  isVerified13Plus: boolean;
  isVerified18Plus: boolean;
  verificationDate: string | null;
}

const AGE_VERIFICATION_KEY = 'genie_age_verification';

export const useAgeVerification = () => {
  const [state, setState] = useState<AgeVerificationState>({
    isVerified13Plus: false,
    isVerified18Plus: false,
    verificationDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load verification from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AGE_VERIFICATION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState(parsed);
      } catch (e) {
        console.error('Failed to parse age verification:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const verifyAge = useCallback(async (ageGate: AgeGate, birthDate?: Date) => {
    const verificationDate = new Date().toISOString();
    
    const newState: AgeVerificationState = {
      ...state,
      verificationDate,
    };

    if (ageGate === '13+') {
      newState.isVerified13Plus = true;
    } else if (ageGate === '18+') {
      newState.isVerified13Plus = true;
      newState.isVerified18Plus = true;
    }

    // Save to localStorage
    localStorage.setItem(AGE_VERIFICATION_KEY, JSON.stringify(newState));
    setState(newState);

    // Sync to database for logged-in users
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_legal_acceptances').upsert({
          user_id: user.id,
          document_type: 'age_verification',
          document_version: ageGate,
          accepted_at: verificationDate,
          ip_address: 'client',
          user_agent: navigator.userAgent,
          consent_details: { ageGate, birthDate: birthDate?.toISOString() },
        }, {
          onConflict: 'user_id,document_type'
        });
      }
    } catch (error) {
      console.error('Failed to sync age verification to database:', error);
    }

    console.log(`✅ Age verified: ${ageGate}`);
  }, [state]);

  const checkAge = useCallback((ageGate: AgeGate): boolean => {
    if (ageGate === '13+') return state.isVerified13Plus;
    if (ageGate === '18+') return state.isVerified18Plus;
    return false;
  }, [state]);

  const resetVerification = useCallback(() => {
    localStorage.removeItem(AGE_VERIFICATION_KEY);
    setState({
      isVerified13Plus: false,
      isVerified18Plus: false,
      verificationDate: null,
    });
  }, []);

  return {
    ...state,
    isLoading,
    verifyAge,
    checkAge,
    resetVerification,
  };
};
