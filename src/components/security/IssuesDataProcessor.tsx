import { useMemo } from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { FixedIssue } from '@/hooks/useFixedIssuesTracker';
import { Issue, ProcessedIssuesData } from '@/types/issuesTypes';
import { 
  generateIssueId, 
  getResolvedIssues, 
  saveIssueSnapshot,
  REAL_FIXES_APPLIED_KEY
} from '@/utils/issues/issueStorageUtils';
import { scanForActualSecurityIssues } from '@/utils/issues/issueScanner';
import { handleBackendFixedIssues, compareIssuesWithHistory } from '@/utils/issues/issueProcessing';
import { 
  checkAndSetUIUXImprovements, 
  checkAndSetCodeQualityImprovements, 
  checkForSecurityComponentUsage 
} from '@/utils/issues/backendFixDetection';

// Track real fixes globally with enhanced synchronization
let globalRealFixesApplied: Issue[] = [];

export const markIssueAsReallyFixed = (issue: Issue) => {
  console.log('🎯 Marking issue as really fixed with ENHANCED METRICS update:', issue.type);
  
  const { markIssueAsResolved } = require('@/utils/issues/issueStorageUtils');
  markIssueAsResolved(issue);
  globalRealFixesApplied.push(issue);
  
  const currentCount = getRealFixesAppliedCount();
  console.log('🎯 Real fix applied - ENHANCED SYNCHRONIZED count updated:', currentCount);
  
  window.dispatchEvent(new StorageEvent('storage', {
    key: REAL_FIXES_APPLIED_KEY,
    newValue: currentCount.toString()
  }));
};

const getRealFixesAppliedCount = (): number => {
  try {
    // Security fixes
    const mfaImplemented = localStorage.getItem('mfa_enforcement_implemented') === 'true';
    const rbacImplemented = localStorage.getItem('rbac_implementation_active') === 'true';
    const logSanitizationActive = localStorage.getItem('log_sanitization_active') === 'true';
    const debugSecurityActive = localStorage.getItem('debug_security_implemented') === 'true';
    const apiAuthImplemented = localStorage.getItem('api_authorization_implemented') === 'true';
    const securityComponentsActive = localStorage.getItem('security_components_implemented') === 'true';
    
    // UI/UX fixes (now auto-detected)
    const uiuxFixed = checkAndSetUIUXImprovements();
    
    // Code Quality fixes (now auto-detected)
    const codeQualityFixed = checkAndSetCodeQualityImprovements();
    
    const implementedFixes = [
      mfaImplemented, 
      rbacImplemented, 
      logSanitizationActive, 
      debugSecurityActive, 
      apiAuthImplemented,
      securityComponentsActive,
      uiuxFixed,
      codeQualityFixed
    ];
    const count = implementedFixes.filter(Boolean).length;
    
    localStorage.setItem(REAL_FIXES_APPLIED_KEY, count.toString());
    
    console.log('📊 ENHANCED SYNCHRONIZED real fixes count calculation (ALL TYPES):', {
      security: { mfaImplemented, rbacImplemented, logSanitizationActive, debugSecurityActive, apiAuthImplemented, securityComponentsActive },
      uiux: { uiuxFixed },
      codeQuality: { codeQualityFixed },
      totalCount: count
    });
    
    return count;
  } catch (error) {
    console.error('Error calculating enhanced real fixes count:', error);
    return 0;
  }
};

export const useIssuesDataProcessor = (
  verificationSummary?: VerificationSummary | null,
  fixedIssues: FixedIssue[] = []
): ProcessedIssuesData => {
  return useMemo(() => {
    console.log('🔍 ENHANCED real-time scanning with ALL TYPES BACKEND FIX DETECTION...');
    
    // Force re-run the detection functions to set localStorage
    checkAndSetUIUXImprovements();
    checkAndSetCodeQualityImprovements();
    checkForSecurityComponentUsage();
    
    const totalRealFixesApplied = getRealFixesAppliedCount();
    console.log('📊 Current enhanced real fixes applied count (ALL TYPES):', totalRealFixesApplied);
    
    // ENHANCED: Scan for all types of issues with auto-detection
    const realTimeIssues = scanForActualSecurityIssues();
    console.log('🔒 Enhanced comprehensive scan found:', realTimeIssues.length, 'active issues (ALL TYPES)');

    let allIssues: Issue[] = [...realTimeIssues];

    if (verificationSummary) {
      
      if (verificationSummary.validationResult?.issues) {
        verificationSummary.validationResult.issues.forEach(issue => {
          const issueObj = {
            type: 'Validation Error',
            message: issue,
            source: 'Validation System',
            severity: 'high'
          };
          const issueKey = generateIssueId(issueObj);
          const resolvedIssues = getResolvedIssues();
          
          if (!resolvedIssues.has(issueKey)) {
            allIssues.push(issueObj);
          }
        });
      }

      if (verificationSummary.validationResult?.warnings) {
        verificationSummary.validationResult.warnings.forEach(warning => {
          const issueObj = {
            type: 'Validation Warning',
            message: warning,
            source: 'Validation System',
            severity: 'medium'
          };
          const issueKey = generateIssueId(issueObj);
          const resolvedIssues = getResolvedIssues();
          
          if (!resolvedIssues.has(issueKey)) {
            allIssues.push(issueObj);
          }
        });
      }

      if (verificationSummary.auditResults) {
        verificationSummary.auditResults.forEach(audit => {
          audit.issues.forEach(issue => {
            const issueObj = {
              type: 'Security Issue',
              message: issue,
              source: audit.componentName,
              severity: 'critical'
            };
            const issueKey = generateIssueId(issueObj);
            const resolvedIssues = getResolvedIssues();

            if (!resolvedIssues.has(issueKey)) {
              allIssues.push(issueObj);
            }
          });
        });
      }

      if (verificationSummary.performanceMetrics?.recommendations) {
        verificationSummary.performanceMetrics.recommendations.forEach((recommendation) => {
          const issueObj = {
            type: 'Performance Issue',
            message: recommendation.description || 'Performance optimization needed',
            source: 'Performance Monitor',
            severity: recommendation.priority === 'high' ? 'high' : 'medium'
          };
          const issueKey = generateIssueId(issueObj);
          const resolvedIssues = getResolvedIssues();

          if (!resolvedIssues.has(issueKey)) {
            allIssues.push(issueObj);
          }
        });
      }

      if (verificationSummary.databaseValidation?.violations) {
        verificationSummary.databaseValidation.violations.forEach(violation => {
          const issueObj = {
            type: 'Database Issue',
            message: violation.description || 'Database validation issue',
            source: 'Database Validator',
            severity: violation.severity === 'error' ? 'critical' : 'high'
          };
          const issueKey = generateIssueId(issueObj);
          const resolvedIssues = getResolvedIssues();

          if (!resolvedIssues.has(issueKey)) {
            allIssues.push(issueObj);
          }
        });
      }

      if (verificationSummary.schemaValidation?.violations) {
        verificationSummary.schemaValidation.violations.forEach(violation => {
          const issueObj = {
            type: 'Schema Issue',
            message: violation.description || 'Schema validation issue',
            source: 'Schema Validator',
            severity: violation.severity === 'error' ? 'critical' : 'high'
          };
          const issueKey = generateIssueId(issueObj);
          const resolvedIssues = getResolvedIssues();

          if (!resolvedIssues.has(issueKey)) {
            allIssues.push(issueObj);
          }
        });
      }

      if (verificationSummary.securityScan?.vulnerabilities) {
        console.log('🔒 Processing security vulnerabilities:', verificationSummary.securityScan.vulnerabilities);
        verificationSummary.securityScan.vulnerabilities.forEach(vulnerability => {
          const issueObj = {
            type: 'Security Vulnerability',
            message: vulnerability.description || 'Security vulnerability detected',
            source: 'Security Scanner',
            severity: vulnerability.severity
          };
          const issueKey = generateIssueId(issueObj);
          const resolvedIssues = getResolvedIssues();

          if (!resolvedIssues.has(issueKey)) {
            allIssues.push(issueObj);
          }
        });
      }

      if (verificationSummary.codeQuality?.issues) {
        verificationSummary.codeQuality.issues.forEach(issue => {
          const issueObj = {
            type: 'Code Quality Issue',
            message: issue.description || 'Code quality issue',
            source: 'Code Quality Analyzer',
            severity: issue.severity
          };
          const issueKey = generateIssueId(issueObj);
          const resolvedIssues = getResolvedIssues();

          if (!resolvedIssues.has(issueKey)) {
            allIssues.push(issueObj);
          }
        });
      }
    }

    // ENHANCED: Handle backend fixed issues with ALL TYPES
    const { activeIssues, backendFixedIssues, autoMovedCount } = handleBackendFixedIssues(allIssues);
    console.log('🎯 ENHANCED Backend detection results:', { 
      original: allIssues.length, 
      active: activeIssues.length, 
      backendFixed: backendFixedIssues.length,
      autoMoved: autoMovedCount
    });

    // Use active issues (after backend detection)
    allIssues = activeIssues;

    // Compare with history for change tracking
    const { newIssues, resolvedIssues, reappearedIssues, enhancedIssues } = compareIssuesWithHistory(allIssues);

    // Save current snapshot
    saveIssueSnapshot(allIssues, backendFixedIssues.map(issue => issue.type));

    // Categorize by severity
    const criticalIssues = allIssues.filter(issue => issue.severity === 'critical');
    const highIssues = allIssues.filter(issue => issue.severity === 'high');
    const mediumIssues = allIssues.filter(issue => issue.severity === 'medium');

    // Group by topic/category
    const issuesByTopic: Record<string, Issue[]> = {
      'Security Issues': allIssues.filter(issue => 
        issue.type.includes('Security') || 
        issue.source.includes('Security Scanner')
      ),
      'UI/UX Issues': allIssues.filter(issue => 
        issue.type.includes('UI/UX') || 
        issue.source.includes('UI/UX')
      ),
      'Code Quality': allIssues.filter(issue => 
        issue.type.includes('Code Quality') || 
        issue.source.includes('Code Quality')
      ),
      'Database Issues': allIssues.filter(issue => 
        issue.type.includes('Database') || 
        issue.source.includes('Database')
      ),
      'System Issues': allIssues.filter(issue => 
        !issue.type.includes('Security') && 
        !issue.type.includes('UI/UX') && 
        !issue.type.includes('Code Quality') && 
        !issue.type.includes('Database')
      )
    };

    console.log('📊 ENHANCED Final processing results (ALL TYPES):', {
      totalActiveIssues: allIssues.length,
      backendFixedCount: backendFixedIssues.length,
      criticalCount: criticalIssues.length,
      highCount: highIssues.length,
      mediumCount: mediumIssues.length,
      realFixesApplied: totalRealFixesApplied,
      autoDetectedBackendFixes: autoMovedCount,
      issuesByTopic: Object.keys(issuesByTopic).map(topic => ({
        topic,
        count: issuesByTopic[topic].length
      }))
    });

    return {
      allIssues,
      criticalIssues,
      highIssues,
      mediumIssues,
      issuesByTopic,
      newIssues,
      resolvedIssues,
      reappearedIssues,
      backendFixedIssues,
      totalRealFixesApplied,
      autoDetectedBackendFixes: autoMovedCount
    };
  }, [verificationSummary, fixedIssues]);
};

// Re-export types and functions for backward compatibility
export type { Issue, ProcessedIssuesData };
