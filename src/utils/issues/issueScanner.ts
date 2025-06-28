
import { Issue } from '@/types/issuesTypes';
import { getResolvedIssues, generateIssueId, markIssueAsResolved } from './issueStorageUtils';
import { 
  checkForMFAImplementation, 
  checkForRBACImplementation, 
  checkForLogSanitization,
  checkDebugModeDisabled,
  checkAPIAuthorizationImplemented,
  checkForSecurityComponentUsage,
  checkAndSetUIUXImprovements,
  checkAndSetCodeQualityImprovements
} from './backendFixDetection';

export const scanForActualSecurityIssues = (): Issue[] => {
  const issues: Issue[] = [];
  const resolvedIssues = getResolvedIssues();
  
  console.log('🔒 ENHANCED Security + Quality Scan with Backend Fix Detection (ALL TYPES):');
  
  const allChecks = [
    // Security checks
    {
      issue: {
        type: 'Security Vulnerability',
        message: 'Multi-Factor Authentication is not implemented for admin users',
        source: 'Enhanced Security Scanner',
        severity: 'critical'
      },
      implemented: checkForMFAImplementation(),
      fixKey: 'mfa_enforcement_implemented'
    },
    {
      issue: {
        type: 'Security Vulnerability', 
        message: 'Role-Based Access Control is not properly implemented',
        source: 'Enhanced Security Scanner',
        severity: 'high'
      },
      implemented: checkForRBACImplementation(),
      fixKey: 'rbac_implementation_active'
    },
    {
      issue: {
        type: 'Security Vulnerability',
        message: 'API keys and user data may be logged - logs are not sanitized',
        source: 'Enhanced Security Scanner',
        severity: 'high'
      },
      implemented: checkForLogSanitization(),
      fixKey: 'log_sanitization_active'
    },
    {
      issue: {
        type: 'Security Vulnerability',
        message: 'Debug mode is enabled in production environment',
        source: 'Enhanced Security Scanner', 
        severity: 'medium'
      },
      implemented: checkDebugModeDisabled(),
      fixKey: 'debug_security_implemented'
    },
    {
      issue: {
        type: 'Security Vulnerability',
        message: 'API endpoints lack proper authorization checks',
        source: 'Enhanced Security Scanner',
        severity: 'high'
      },
      implemented: checkAPIAuthorizationImplemented(),
      fixKey: 'api_authorization_implemented'
    },
    {
      issue: {
        type: 'Security Vulnerability',
        message: 'Security issues component is not being used properly',
        source: 'Enhanced Security Scanner',
        severity: 'medium'
      },
      implemented: checkForSecurityComponentUsage(),
      fixKey: 'security_components_implemented'
    },
    // UI/UX checks
    {
      issue: {
        type: 'UI/UX Issue',
        message: 'User interface validation needs improvement',
        source: 'UI/UX Quality Scanner',
        severity: 'critical'
      },
      implemented: checkAndSetUIUXImprovements(),
      fixKey: 'uiux_improvements_applied'
    },
    {
      issue: {
        type: 'UI/UX Issue',
        message: 'Accessibility standards not fully implemented',
        source: 'UI/UX Quality Scanner',
        severity: 'high'
      },
      implemented: checkAndSetUIUXImprovements(),
      fixKey: 'accessibility_enhanced'
    },
    // Code Quality checks
    {
      issue: {
        type: 'Code Quality Issue',
        message: 'Code maintainability and best practices need improvement',
        source: 'Code Quality Scanner',
        severity: 'high'
      },
      implemented: checkAndSetCodeQualityImprovements(),
      fixKey: 'code_quality_improved'
    },
    {
      issue: {
        type: 'Code Quality Issue',
        message: 'Performance optimization opportunities identified',
        source: 'Code Quality Scanner',
        severity: 'medium'
      },
      implemented: checkAndSetCodeQualityImprovements(),
      fixKey: 'performance_optimized'
    }
  ];

  let totalImplemented = 0;
  allChecks.forEach(({ issue, implemented, fixKey }) => {
    const issueKey = generateIssueId(issue);
    
    if (implemented) {
      totalImplemented++;
      console.log(`✅ ${issue.type} resolved via backend - implementation detected for ${fixKey}`);
      markIssueAsResolved(issue);
    } else if (!resolvedIssues.has(issueKey)) {
      console.log(`❌ ${issue.type} still active - ${fixKey} not implemented`);
      issues.push(issue);
    }
  });

  console.log('🔒 Enhanced comprehensive scan results with backend detection (ALL TYPES):', {
    totalActiveIssues: issues.length,
    totalImplemented,
    totalChecks: allChecks.length,
    implementationPercentage: Math.round((totalImplemented / allChecks.length) * 100),
    issuesByType: issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  });

  return issues;
};
