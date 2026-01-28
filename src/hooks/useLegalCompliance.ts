/**
 * useLegalCompliance Hook
 * React hook for managing legal document acceptance.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  legalComplianceService,
  type LegalComplianceStatus,
  type LegalAcceptance,
  type LegalDocumentType
} from '@/services/compliance/legalComplianceService';

export function useLegalCompliance() {
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<LegalComplianceStatus | null>(null);
  const [history, setHistory] = useState<LegalAcceptance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) {
      setStatus(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [statusData, historyData] = await Promise.all([
        legalComplianceService.checkCompliance(userId),
        legalComplianceService.getAcceptanceHistory(userId)
      ]);
      
      setStatus(statusData);
      setHistory(historyData);
    } catch (err) {
      setError('Failed to load legal compliance status');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const acceptDocument = useCallback(async (
    documentType: LegalDocumentType,
    version: string = '1.0'
  ) => {
    if (!userId) return false;
    
    const success = await legalComplianceService.recordAcceptance(userId, documentType, version);
    if (success) {
      await refresh();
    }
    return success;
  }, [userId, refresh]);

  const acceptAllRequired = useCallback(async (version: string = '1.0') => {
    if (!userId) return false;
    
    const success = await legalComplianceService.acceptAllRequired(userId, version);
    if (success) {
      await refresh();
    }
    return success;
  }, [userId, refresh]);

  const hasAccepted = useCallback(async (documentType: LegalDocumentType) => {
    if (!userId) return false;
    return legalComplianceService.hasAccepted(userId, documentType);
  }, [userId]);

  useEffect(() => {
    if (userId) refresh();
  }, [userId, refresh]);

  return {
    status,
    history,
    isLoading,
    error,
    refresh,
    acceptDocument,
    acceptAllRequired,
    hasAccepted,
    isCompliant: status?.all_accepted ?? false
  };
}

export default useLegalCompliance;
