
import { Issue, IssueSnapshot } from '@/types/issuesTypes';

// Storage keys
export const ISSUE_HISTORY_KEY = 'issue-tracking-history';
export const RESOLVED_ISSUES_KEY = 'permanently-resolved-issues';
export const REAL_FIXES_APPLIED_KEY = 'real-fixes-applied-count';
export const BACKEND_FIXES_DETECTED_KEY = 'backend-fixes-detected';

export const generateIssueId = (issue: Issue): string => {
  return `${issue.type}_${issue.message}_${issue.source}`.replace(/\s+/g, '_').toLowerCase();
};

export const getIssueHistory = (): IssueSnapshot[] => {
  const stored = localStorage.getItem(ISSUE_HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getResolvedIssues = (): Set<string> => {
  const stored = localStorage.getItem(RESOLVED_ISSUES_KEY);
  return stored ? new Set(JSON.parse(stored)) : new Set();
};

export const markIssueAsResolved = (issue: Issue) => {
  const resolved = getResolvedIssues();
  const issueKey = generateIssueId(issue);
  resolved.add(issueKey);
  localStorage.setItem(RESOLVED_ISSUES_KEY, JSON.stringify([...resolved]));
  console.log('🔧 Issue permanently resolved (enhanced backend detection):', issueKey);
};

export const saveIssueSnapshot = (issues: Issue[], backendFixesDetected: string[] = []) => {
  const history = getIssueHistory();
  const realFixesCount = getRealFixesAppliedCount();
  
  const snapshot: IssueSnapshot = {
    timestamp: new Date().toISOString(),
    issues: issues.map(issue => ({
      ...issue,
      issueId: generateIssueId(issue),
      lastSeen: new Date().toISOString()
    })),
    verificationId: `verification_${Date.now()}`,
    realFixesCount,
    backendFixesDetected
  };
  
  history.unshift(snapshot);
  
  if (history.length > 10) {
    history.splice(10);
  }
  
  localStorage.setItem(ISSUE_HISTORY_KEY, JSON.stringify(history));
  console.log('📊 ENHANCED issue snapshot saved with ALL TYPES backend fix tracking:', {
    issuesCount: snapshot.issues.length,
    realFixesCount: snapshot.realFixesCount,
    backendFixesDetected: backendFixesDetected.length
  });
};

export const recordBackendDetectedFix = (fixType: string, issueId: string) => {
  const existing = JSON.parse(localStorage.getItem(BACKEND_FIXES_DETECTED_KEY) || '{}');
  existing[issueId] = {
    fixType,
    detectedAt: new Date().toISOString(),
    source: 'backend_detection'
  };
  localStorage.setItem(BACKEND_FIXES_DETECTED_KEY, JSON.stringify(existing));
  console.log('📝 RECORDED BACKEND-DETECTED FIX (ENHANCED):', { fixType, issueId });
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
    
    // UI/UX fixes
    const uiuxFixed = localStorage.getItem('uiux_improvements_applied') === 'true';
    
    // Code Quality fixes
    const codeQualityFixed = localStorage.getItem('code_quality_improved') === 'true';
    
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
