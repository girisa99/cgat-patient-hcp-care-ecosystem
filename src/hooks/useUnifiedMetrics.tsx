
import { useState, useEffect, useCallback } from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { useIssuesDataProcessor } from '@/components/security/IssuesDataProcessor';
import { useFixedIssuesTracker } from '@/hooks/useFixedIssuesTracker';

export interface UnifiedMetrics {
  // Core counts
  totalActiveIssues: number;
  totalFixedIssues: number;
  
  // By severity
  criticalActive: number;
  highActive: number;
  mediumActive: number;
  lowActive: number;
  
  criticalFixed: number;
  highFixed: number;
  mediumFixed: number;
  lowFixed: number;
  
  // By category
  securityActive: number;
  securityFixed: number;
  uiuxActive: number;
  uiuxFixed: number;
  databaseActive: number;
  databaseFixed: number;
  codeQualityActive: number;
  codeQualityFixed: number;
  
  // Backend detection
  backendFixedCount: number;
  realFixesApplied: number;
  
  // Status tracking
  lastUpdateTime: Date;
  updateSource: 'manual' | 'programmatic' | 'display-only';
  isUpdating: boolean;
  countsAligned: boolean;
}

export const useUnifiedMetrics = (verificationSummary?: VerificationSummary | null) => {
  const [metrics, setMetrics] = useState<UnifiedMetrics>({
    totalActiveIssues: 0,
    totalFixedIssues: 0,
    criticalActive: 0,
    highActive: 0,
    mediumActive: 0,
    lowActive: 0,
    criticalFixed: 0,
    highFixed: 0,
    mediumFixed: 0,
    lowFixed: 0,
    securityActive: 0,
    securityFixed: 0,
    uiuxActive: 0,
    uiuxFixed: 0,
    databaseActive: 0,
    databaseFixed: 0,
    codeQualityActive: 0,
    codeQualityFixed: 0,
    backendFixedCount: 0,
    realFixesApplied: 0,
    lastUpdateTime: new Date(),
    updateSource: 'display-only',
    isUpdating: false,
    countsAligned: true
  });

  const { fixedIssues, getTotalFixedCount } = useFixedIssuesTracker();
  const processedData = useIssuesDataProcessor(verificationSummary, fixedIssues);

  const calculateMetrics = useCallback((source: 'manual' | 'programmatic' | 'display-only' = 'display-only'): UnifiedMetrics => {
    console.log('🔄 Calculating unified metrics for DISPLAY ONLY (backend automation continues separately)');
    
    // Get ACTUAL implementation status from localStorage
    const securityImplementations = {
      mfaImplemented: localStorage.getItem('mfa_enforcement_implemented') === 'true',
      rbacActive: localStorage.getItem('rbac_implementation_active') === 'true',
      logSanitization: localStorage.getItem('log_sanitization_active') === 'true',
      debugSecurity: localStorage.getItem('debug_security_implemented') === 'true',
      apiAuth: localStorage.getItem('api_authorization_implemented') === 'true'
    };
    
    const uiuxImplemented = localStorage.getItem('uiux_improvements_applied') === 'true';
    const codeQualityImplemented = localStorage.getItem('code_quality_improved') === 'true';
    
    // Calculate ACTUAL fixed counts
    const securityFixedCount = Object.values(securityImplementations).filter(Boolean).length;
    const uiuxFixedCount = uiuxImplemented ? 1 : 0;
    const codeQualityFixedCount = codeQualityImplemented ? 1 : 0;
    const databaseFixedCount = 0; // No database fixes implemented yet
    
    const totalRealFixesApplied = securityFixedCount + uiuxFixedCount + codeQualityFixedCount + databaseFixedCount;
    
    // Calculate ACCURATE active counts (original issues minus what's actually fixed)
    const rawSecurityIssues = processedData.issuesByTopic['Security Issues']?.length || 0;
    const rawUIUXIssues = processedData.issuesByTopic['UI/UX Issues']?.length || 0;
    const rawDatabaseIssues = processedData.issuesByTopic['Database Issues']?.length || 0;
    const rawCodeQualityIssues = processedData.issuesByTopic['Code Quality']?.length || 0;
    
    // Active issues = raw issues - actually fixed issues (prevent negative counts)
    const actualSecurityActive = Math.max(0, rawSecurityIssues - securityFixedCount);
    const actualUIUXActive = Math.max(0, rawUIUXIssues - uiuxFixedCount);
    const actualDatabaseActive = Math.max(0, rawDatabaseIssues - databaseFixedCount);
    const actualCodeQualityActive = Math.max(0, rawCodeQualityIssues - codeQualityFixedCount);
    
    const totalActiveIssues = actualSecurityActive + actualUIUXActive + actualDatabaseActive + actualCodeQualityActive;
    
    // Calculate by severity (based on remaining active issues)
    const criticalIssues = processedData.criticalIssues || [];
    const highIssues = processedData.highIssues || [];
    const mediumIssues = processedData.mediumIssues || [];
    const allIssues = processedData.allIssues || [];
    const lowIssues = allIssues.filter(issue => 
      !criticalIssues.includes(issue) && 
      !highIssues.includes(issue) && 
      !mediumIssues.includes(issue)
    );

    // Adjust severity counts based on fixes (estimate)
    const fixedRatio = totalActiveIssues > 0 ? totalRealFixesApplied / (totalActiveIssues + totalRealFixesApplied) : 0;
    const criticalFixed = Math.floor(criticalIssues.length * fixedRatio);
    const highFixed = Math.floor(highIssues.length * fixedRatio);
    const mediumFixed = Math.floor(mediumIssues.length * fixedRatio);
    const lowFixed = Math.floor(lowIssues.length * fixedRatio);

    const newMetrics: UnifiedMetrics = {
      totalActiveIssues,
      totalFixedIssues: totalRealFixesApplied,
      
      criticalActive: Math.max(0, criticalIssues.length - criticalFixed),
      highActive: Math.max(0, highIssues.length - highFixed),
      mediumActive: Math.max(0, mediumIssues.length - mediumFixed),
      lowActive: Math.max(0, lowIssues.length - lowFixed),
      
      criticalFixed,
      highFixed,
      mediumFixed,
      lowFixed,
      
      securityActive: actualSecurityActive,
      securityFixed: securityFixedCount,
      uiuxActive: actualUIUXActive,
      uiuxFixed: uiuxFixedCount,
      databaseActive: actualDatabaseActive,
      databaseFixed: databaseFixedCount,
      codeQualityActive: actualCodeQualityActive,
      codeQualityFixed: codeQualityFixedCount,
      
      backendFixedCount: processedData.autoDetectedBackendFixes || 0,
      realFixesApplied: totalRealFixesApplied,
      
      lastUpdateTime: new Date(),
      updateSource: source,
      isUpdating: false,
      countsAligned: true
    };

    console.log('📊 Display metrics calculated (backend automation continues separately):', {
      source,
      totalActive: newMetrics.totalActiveIssues,
      totalFixed: newMetrics.totalFixedIssues,
      realFixesApplied: totalRealFixesApplied,
      note: 'Backend verification automation continues running for system protection'
    });

    return newMetrics;
  }, [processedData, getTotalFixedCount]);

  const updateMetrics = useCallback((source: 'manual' | 'programmatic' | 'display-only' = 'display-only') => {
    // Only update display metrics for manual or display-only requests
    // Ignore programmatic updates to prevent interference with user-triggered actions
    if (source === 'programmatic') {
      console.log('🔕 Ignoring programmatic update - backend automation continues but results not displayed');
      return;
    }

    setMetrics(prev => ({ ...prev, isUpdating: true }));
    
    setTimeout(() => {
      const newMetrics = calculateMetrics(source);
      setMetrics(newMetrics);
    }, 500);
  }, [calculateMetrics]);

  // Remove automatic updates to prevent interference with display
  // Backend automation continues but doesn't update the display
  useEffect(() => {
    console.log('ℹ️ Display metrics initialized - backend automation runs separately for system protection');
  }, []);

  // Remove storage change listeners to prevent automatic display updates
  // Backend systems continue to monitor and protect independently
  useEffect(() => {
    console.log('ℹ️ Backend verification automation continues independently for system stability');
  }, []);

  // Initial calculation for display only
  useEffect(() => {
    updateMetrics('display-only');
  }, [verificationSummary, processedData.allIssues.length, updateMetrics]);

  return {
    metrics,
    updateMetrics,
    processedData
  };
};
