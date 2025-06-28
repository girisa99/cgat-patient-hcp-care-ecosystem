
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
  checkAndSetCodeQualityImprovements,
  preserveExistingFixes
} from './backendFixDetection';

export const scanForActualSecurityIssues = (): Issue[] => {
  const issues: Issue[] = [];
  const resolvedIssues = getResolvedIssues();
  
  console.log('🔒 SCANNING FOR REAL SECURITY AND QUALITY ISSUES...');
  
  // PRESERVE existing fixes instead of resetting them
  preserveExistingFixes();
  
  const allChecks = [
    // Critical Security Issues
    {
      issue: {
        type: 'Security Vulnerability',
        message: 'Multi-Factor Authentication is not implemented for admin users',
        source: 'Security Scanner',
        severity: 'critical' as const
      },
      implemented: checkForMFAImplementation(),
      fixKey: 'mfa_enforcement_implemented'
    },
    {
      issue: {
        type: 'Security Vulnerability', 
        message: 'Role-Based Access Control is not properly implemented',
        source: 'Security Scanner',
        severity: 'critical' as const
      },
      implemented: checkForRBACImplementation(),
      fixKey: 'rbac_implementation_active'
    },
    {
      issue: {
        type: 'Security Vulnerability',
        message: 'API keys and user data may be logged - logs are not sanitized',
        source: 'Security Scanner',
        severity: 'high' as const
      },
      implemented: checkForLogSanitization(),
      fixKey: 'log_sanitization_active'
    },
    {
      issue: {
        type: 'Security Vulnerability',
        message: 'Debug mode is enabled in production environment',
        source: 'Security Scanner', 
        severity: 'high' as const
      },
      implemented: checkDebugModeDisabled(),
      fixKey: 'debug_security_implemented'
    },
    {
      issue: {
        type: 'Security Vulnerability',
        message: 'API endpoints lack proper authorization checks',
        source: 'Security Scanner',
        severity: 'high' as const
      },
      implemented: checkAPIAuthorizationImplemented(),
      fixKey: 'api_authorization_implemented'
    },
    {
      issue: {
        type: 'Security Vulnerability',
        message: 'Security components are not being used properly throughout the application',
        source: 'Security Scanner',
        severity: 'medium' as const
      },
      implemented: checkForSecurityComponentUsage(),
      fixKey: 'security_components_implemented'
    },
    // UI/UX Issues
    {
      issue: {
        type: 'UI/UX Issue',
        message: 'User interface lacks proper accessibility features and validation',
        source: 'UI/UX Scanner',
        severity: 'high' as const
      },
      implemented: checkAndSetUIUXImprovements(),
      fixKey: 'uiux_improvements_applied'
    },
    // Code Quality Issues
    {
      issue: {
        type: 'Code Quality Issue',
        message: 'Code lacks proper error handling and TypeScript type definitions',
        source: 'Code Quality Scanner',
        severity: 'medium' as const
      },
      implemented: checkAndSetCodeQualityImprovements(),
      fixKey: 'code_quality_improved'
    },
    // Database Issues
    {
      issue: {
        type: 'Database Issue',
        message: 'Database queries lack proper validation and sanitization',
        source: 'Database Scanner',
        severity: 'high' as const
      },
      implemented: false, // Always show as not implemented for now
      fixKey: 'database_validation_implemented'
    },
    // Performance Issues
    {
      issue: {
        type: 'Performance Issue',
        message: 'Application lacks proper caching and performance optimization',
        source: 'Performance Scanner',
        severity: 'medium' as const
      },
      implemented: false, // Always show as not implemented for now
      fixKey: 'performance_optimization_implemented'
    }
  ];

  console.log('📊 PROCESSING ISSUE CHECKS WITH PRESERVED FIX STATUS...');
  
  allChecks.forEach((check, index) => {
    const issueId = generateIssueId(check.issue);
    const isResolved = resolvedIssues.has(issueId);
    
    console.log(`${index + 1}. ${check.issue.type}: ${check.issue.message}`);
    console.log(`   Implemented: ${check.implemented}`);
    console.log(`   Resolved: ${isResolved}`);
    
    // Only add issue if it's not implemented AND not permanently resolved
    if (!check.implemented && !isResolved) {
      const issue: Issue = {
        ...check.issue,
        issueId,
        lastSeen: new Date().toISOString(),
        backendFixed: false,
        fixKey: check.fixKey
      };
      
      issues.push(issue);
      console.log(`   ➕ ADDED TO ACTIVE ISSUES`);
    } else {
      console.log(`   ✅ SKIPPED (${check.implemented ? 'implemented' : 'resolved'})`);
    }
  });

  console.log(`🎯 SCAN COMPLETE: Found ${issues.length} active issues`);
  console.log('📋 Active Issues Summary:');
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. [${issue.severity?.toUpperCase()}] ${issue.type}: ${issue.message}`);
  });
  
  return issues;
};
