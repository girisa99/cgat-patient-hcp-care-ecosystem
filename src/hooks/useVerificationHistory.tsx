
import { useState, useCallback } from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

export const useVerificationHistory = () => {
  const [verificationHistory, setVerificationHistory] = useState<VerificationSummary[]>([]);

  const loadVerificationHistory = useCallback(() => {
    try {
      const history = JSON.parse(localStorage.getItem('verification-results') || '[]');
      setVerificationHistory(history);
      return history.length > 0 ? history[0] : null;
    } catch (error) {
      console.warn('Failed to load verification history:', error);
      return null;
    }
  }, []);

  const updateVerificationHistory = useCallback((summary: VerificationSummary) => {
    setVerificationHistory(prev => [summary, ...prev.slice(0, 49)]);
  }, []);

  return {
    verificationHistory,
    loadVerificationHistory,
    updateVerificationHistory
  };
};
