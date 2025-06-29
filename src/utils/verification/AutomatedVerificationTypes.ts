
/**
 * Automated Verification Types
 * Common types for verification system
 */

export interface VerificationConfig {
  enabled: boolean;
  interval: number;
  autoFix: boolean;
}

export interface VerificationResult {
  success: boolean;
  issues: string[];
  fixes: string[];
  timestamp: string;
}

export interface ComponentAuditResult {
  componentName: string;
  issues: string[];
  suggestions: string[];
  score: number;
}
