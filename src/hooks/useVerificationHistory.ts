
/**
 * Verification History Hook
 * Mock implementation for managing verification history
 */

import { useState } from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

export const useVerificationHistory = () => {
  const [verificationHistory, setVerificationHistory] = useState<VerificationSummary[]>([]);

  const loadVerificationHistory = (): VerificationSummary | null => {
    // Mock implementation - would load from localStorage or API
    return null;
  };

  const updateVerificationHistory = (summary: VerificationSummary) => {
    setVerificationHistory(prev => [summary, ...prev.slice(0, 9)]); // Keep last 10
  };

  return {
    verificationHistory,
    loadVerificationHistory,
    updateVerificationHistory
  };
};
