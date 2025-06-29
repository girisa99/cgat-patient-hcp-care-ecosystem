
import { useState, useEffect } from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

export interface UnifiedMetrics {
  totalActiveIssues: number;
  totalFixedIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lastUpdateTime: Date;
  
  // Additional properties needed by components
  criticalActive: number;
  highActive: number;
  mediumActive: number;
  lowActive: number;
  securityActive: number;
  uiuxActive: number;
  databaseActive: number;
  codeQualityActive: number;
  
  // Fixed counts by category
  securityFixed: number;
  uiuxFixed: number;
  databaseFixed: number;
  codeQualityFixed: number;
  criticalFixed: number;
  highFixed: number;
  mediumFixed: number;
  lowFixed: number;
  
  // Additional fix tracking
  realFixesApplied: number;
  backendFixedCount: number;
}

export const useUnifiedMetrics = (verificationSummary?: VerificationSummary | null) => {
  const [metrics, setMetrics] = useState<UnifiedMetrics>({
    totalActiveIssues: 0,
    totalFixedIssues: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lastUpdateTime: new Date(),
    
    // Active counts by severity
    criticalActive: 0,
    highActive: 0,
    mediumActive: 0,
    lowActive: 0,
    
    // Active counts by category
    securityActive: 0,
    uiuxActive: 0,
    databaseActive: 0,
    codeQualityActive: 0,
    
    // Fixed counts by category
    securityFixed: 0,
    uiuxFixed: 0,
    databaseFixed: 0,
    codeQualityFixed: 0,
    criticalFixed: 0,
    highFixed: 0,
    mediumFixed: 0,
    lowFixed: 0,
    
    // Additional fix tracking
    realFixesApplied: 0,
    backendFixedCount: 0
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
        lastUpdateTime: new Date(),
        
        // For database-first approach, use simplified metrics
        criticalActive: verificationSummary.criticalIssues || 0,
        highActive: verificationSummary.highIssues || 0,
        mediumActive: verificationSummary.mediumIssues || 0,
        lowActive: verificationSummary.lowIssues || 0,
        
        // Category counts (simplified)
        securityActive: 0,
        uiuxActive: 0,
        databaseActive: 0,
        codeQualityActive: 0,
        
        // Fixed counts (simplified)
        securityFixed: 0,
        uiuxFixed: 0,
        databaseFixed: 0,
        codeQualityFixed: 0,
        criticalFixed: 0,
        highFixed: 0,
        mediumFixed: 0,
        lowFixed: 0,
        
        // Additional tracking
        realFixesApplied: verificationSummary.realFixesApplied || 0,
        backendFixedCount: 0
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
      fixedIssues: [],
      backendFixedIssues: []
    }
  };
};
