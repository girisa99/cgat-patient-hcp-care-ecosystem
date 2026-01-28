/**
 * useHIPAACompliance Hook
 * React hook for managing HIPAA compliance status.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  hipaaComplianceService,
  type HIPAAStatus,
  type HIPAAAuditEntry,
  type ComplianceCheckResult,
  type HIPAAEventType
} from '@/services/compliance/hipaaComplianceService';

export function useHIPAACompliance() {
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<HIPAAStatus | null>(null);
  const [auditLog, setAuditLog] = useState<HIPAAAuditEntry[]>([]);
  const [complianceResult, setComplianceResult] = useState<ComplianceCheckResult | null>(null);
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
    try {
      const [statusData, resultData] = await Promise.all([
        hipaaComplianceService.getStatus(userId),
        hipaaComplianceService.recalculateCertification(userId),
      ]);
      setStatus(statusData);
      setComplianceResult(resultData);
    } catch (err) {
      setError('Failed to load HIPAA compliance status');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateChecks = useCallback(async (checks: Partial<HIPAAStatus>) => {
    if (!userId) return false;
    const updated = await hipaaComplianceService.updateChecks(userId, checks);
    if (updated) {
      setStatus(updated);
      const result = await hipaaComplianceService.recalculateCertification(userId);
      setComplianceResult(result);
      return true;
    }
    return false;
  }, [userId]);

  const signBAA = useCallback(async (documentUrl?: string) => {
    if (!userId) return false;
    const success = await hipaaComplianceService.signBAA(userId, documentUrl);
    if (success) await refresh();
    return success;
  }, [userId, refresh]);

  const performAudit = useCallback(async () => {
    if (!userId) return null;
    const result = await hipaaComplianceService.performAudit(userId);
    if (result) {
      setComplianceResult(result);
      await refresh();
    }
    return result;
  }, [userId, refresh]);

  const logEvent = useCallback(async (eventType: HIPAAEventType, description: string, metadata?: Record<string, unknown>) => {
    if (!userId) return false;
    return hipaaComplianceService.logEvent(userId, eventType, description, metadata);
  }, [userId]);

  const loadAuditLog = useCallback(async (limit = 50) => {
    if (!userId) return;
    const logs = await hipaaComplianceService.getAuditLog(userId, limit);
    setAuditLog(logs);
  }, [userId]);

  useEffect(() => {
    if (userId) refresh();
  }, [userId, refresh]);

  return { status, auditLog, complianceResult, isLoading, error, refresh, updateChecks, signBAA, performAudit, logEvent, loadAuditLog };
}

export default useHIPAACompliance;
