
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
    console.log('🔄 Calculating unified metrics from source:', source);
    
    // Get real fixes count from localStorage
    const getRealFixesCount = () => {
      const mfaImplemented = localStorage.getItem('mfa_enforcement_implemented') === 'true';
      const rbacImplemented = localStorage.getItem('rbac_implementation_active') === 'true';
      const logSanitization = localStorage.getItem('log_sanitization_active') === 'true';
      const debugSecurity = localStorage.getItem('debug_security_implemented') === 'true';
      const apiAuth = localStorage.getItem('api_authorization_implemented') === 'true';
      const uiuxFixed = localStorage.getItem('uiux_improvements_applied') === 'true';
      const codeQualityFixed = localStorage.getItem('code_quality_improved') === 'true';
      
      const securityFixes = [mfaImplemented, rbacImplemented, logSanitization, debugSecurity, apiAuth].filter(Boolean).length;
      const uiuxFixes = uiuxFixed ? 1 : 0;
      const codeQualityFixes = codeQualityFixed ? 1 : 0;
      
      return {
        total: securityFixes + uiuxFixes + codeQualityFixes,
        security: securityFixes,
        uiux: uiuxFixes,
        codeQuality: codeQualityFixes
      };
    };

    const realFixes = getRealFixesCount();
    const backendFixed = processedData.autoDetectedBackendFixes || 0;
    const trackerFixed = getTotalFixedCount();
    
    // Use the highest count to ensure consistency
    const totalFixed = Math.max(realFixes.total, backendFixed, trackerFixed);
    
    // Calculate active issues by category
    const securityIssues = processedData.issuesByTopic['Security Issues'] || [];
    const uiuxIssues = processedData.issuesByTopic['UI/UX Issues'] || [];
    const databaseIssues = processedData.issuesByTopic['Database Issues'] || [];
    const codeQualityIssues = processedData.issuesByTopic['Code Quality'] || [];
    
    // Calculate by severity
    const criticalIssues = processedData.criticalIssues || [];
    const highIssues = processedData.highIssues || [];
    const mediumIssues = processedData.mediumIssues || [];
    const allIssues = processedData.allIssues || [];
    const lowIssues = allIssues.filter(issue => 
      !criticalIssues.includes(issue) && 
      !highIssues.includes(issue) && 
      !mediumIssues.includes(issue)
    );

    const newMetrics: UnifiedMetrics = {
      totalActiveIssues: allIssues.length,
      totalFixedIssues: totalFixed,
      
      criticalActive: criticalIssues.length,
      highActive: highIssues.length,
      mediumActive: mediumIssues.length,
      lowActive: lowIssues.length,
      
      criticalFixed: Math.floor(totalFixed * 0.3), // Estimate based on typical distribution
      highFixed: Math.floor(totalFixed * 0.4),
      mediumFixed: Math.floor(totalFixed * 0.2),
      lowFixed: Math.floor(totalFixed * 0.1),
      
      securityActive: securityIssues.length,
      securityFixed: realFixes.security,
      uiuxActive: uiuxIssues.length,
      uiuxFixed: realFixes.uiux,
      databaseActive: databaseIssues.length,
      databaseFixed: 0, // Will be implemented when database fixes are added
      codeQualityActive: codeQualityIssues.length,
      codeQualityFixed: realFixes.codeQuality,
      
      backendFixedCount: backendFixed,
      realFixesApplied: realFixes.total,
      
      lastUpdateTime: new Date(),
      updateSource: source,
      isUpdating: false,
      countsAligned: Math.abs(realFixes.total - backendFixed) <= 1 // Allow small discrepancy
    };

    console.log('📊 Unified metrics calculated:', {
      source,
      totalActive: newMetrics.totalActiveIssues,
      totalFixed: newMetrics.totalFixedIssues,
      realFixes: realFixes.total,
      backendFixed,
      countsAligned: newMetrics.countsAligned
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
