
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
  updateSource: 'manual' | 'auto' | 'programmatic';
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
    updateSource: 'auto',
    isUpdating: false,
    countsAligned: true
  });

  const { fixedIssues, getTotalFixedCount } = useFixedIssuesTracker();
  const processedData = useIssuesDataProcessor(verificationSummary, fixedIssues);

  const calculateMetrics = useCallback((source: 'manual' | 'auto' | 'programmatic' = 'auto'): UnifiedMetrics => {
    console.log('🔄 Calculating accurate unified metrics from source:', source);
    
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

    console.log('📊 ACCURATE Unified metrics calculated:', {
      source,
      totalActive: newMetrics.totalActiveIssues,
      totalFixed: newMetrics.totalFixedIssues,
      securityActive: newMetrics.securityActive,
      securityFixed: newMetrics.securityFixed,
      uiuxActive: newMetrics.uiuxActive,
      uiuxFixed: newMetrics.uiuxFixed,
      databaseActive: newMetrics.databaseActive,
      codeQualityActive: newMetrics.codeQualityActive,
      realFixesApplied: totalRealFixesApplied
    });

    return newMetrics;
  }, [processedData, getTotalFixedCount]);

  const updateMetrics = useCallback((source: 'manual' | 'auto' | 'programmatic' = 'auto') => {
    setMetrics(prev => ({ ...prev, isUpdating: true }));
    
    setTimeout(() => {
      const newMetrics = calculateMetrics(source);
      setMetrics(newMetrics);
    }, 500);
  }, [calculateMetrics]);

  // Auto-update every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateMetrics('auto');
    }, 30000);

    return () => clearInterval(interval);
  }, [updateMetrics]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('_implemented') || 
          e.key?.includes('_active') || 
          e.key?.includes('_applied') ||
          e.key?.includes('_improved')) {
        console.log('🔄 Storage change detected, updating metrics:', e.key);
        updateMetrics('auto');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [updateMetrics]);

  // Initial calculation
  useEffect(() => {
    updateMetrics('auto');
  }, [verificationSummary, processedData.allIssues.length, updateMetrics]);

  return {
    metrics,
    updateMetrics,
    processedData
  };
};
