
import { useState, useEffect } from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

export interface UnifiedMetrics {
  totalActiveIssues: number;
  totalFixedIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lastUpdateTime: Date;
}

export const useUnifiedMetrics = (verificationSummary?: VerificationSummary | null) => {
  const [metrics, setMetrics] = useState<UnifiedMetrics>({
    totalActiveIssues: 0,
    totalFixedIssues: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lastUpdateTime: new Date()
  });

  const updateMetrics = (source: string) => {
    console.log('📊 Updating metrics from:', source);
    if (verificationSummary) {
      setMetrics({
        totalActiveIssues: verificationSummary.issuesFound || 0,
        totalFixedIssues: verificationSummary.autoFixesApplied || 0,
        criticalCount: verificationSummary.criticalIssues || 0,
        highCount: verificationSummary.highIssues || 0,
        mediumCount: verificationSummary.mediumIssues || 0,
        lastUpdateTime: new Date()
      });
    }
  };

  useEffect(() => {
    updateMetrics('verification-summary');
  }, [verificationSummary]);

  return {
    metrics,
    updateMetrics,
    processedData: {
      activeIssues: [],
      fixedIssues: []
    }
  };
};
