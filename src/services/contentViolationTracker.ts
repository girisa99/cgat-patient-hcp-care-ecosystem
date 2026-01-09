/**
 * Content Violation Tracker Service
 * Tracks content policy violations per user for backend monitoring
 * Implements progressive enforcement: warn → restrict → lock
 */

import { supabase } from '@/integrations/supabase/client';

// Violation severity levels
export type ViolationSeverity = 'minor' | 'moderate' | 'severe';

export interface ContentViolation {
  type: string;
  severity: ViolationSeverity;
  content?: string; // Sanitized/truncated for logging
  timestamp: Date;
}

interface ViolationState {
  violations: ContentViolation[];
  warningCount: number;
  isRestricted: boolean;
  lastWarningTime: Date | null;
}

// Session-level violation tracking
const SESSION_KEY = 'genie_content_violations';
const MAX_WARNINGS_BEFORE_RESTRICT = 3;
const VIOLATION_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get current violation state from session
 */
function getViolationState(): ViolationState {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const state = JSON.parse(stored);
      state.lastWarningTime = state.lastWarningTime ? new Date(state.lastWarningTime) : null;
      state.violations = state.violations.map((v: any) => ({
        ...v,
        timestamp: new Date(v.timestamp)
      }));
      return state;
    }
  } catch (e) {
    console.error('Error reading violation state:', e);
  }
  
  return {
    violations: [],
    warningCount: 0,
    isRestricted: false,
    lastWarningTime: null
  };
}

/**
 * Save violation state to session
 */
function saveViolationState(state: ViolationState): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving violation state:', e);
  }
}

/**
 * Record a content policy violation
 * Returns the action to take (warn, restrict, or allow retry)
 */
export async function recordViolation(
  violationType: string,
  severity: ViolationSeverity = 'moderate',
  contentPreview?: string
): Promise<{ action: 'warn' | 'restrict' | 'locked'; message: string; canRetry: boolean }> {
  const state = getViolationState();
  
  // Add violation to history
  const violation: ContentViolation = {
    type: violationType,
    severity,
    content: contentPreview ? contentPreview.substring(0, 50) + '...' : undefined,
    timestamp: new Date()
  };
  
  state.violations.push(violation);
  state.warningCount++;
  state.lastWarningTime = new Date();
  
  // Log to backend for monitoring (async, non-blocking)
  logViolationToBackend(violation, state.warningCount).catch(console.error);
  
  // Determine action based on violation count and severity
  if (state.warningCount >= MAX_WARNINGS_BEFORE_RESTRICT || severity === 'severe') {
    state.isRestricted = true;
    saveViolationState(state);
    
    return {
      action: 'restrict',
      message: 'Your access to content generation has been temporarily restricted due to repeated content policy violations. Please review our Terms of Service.',
      canRetry: false
    };
  }
  
  if (state.isRestricted) {
    return {
      action: 'locked',
      message: 'Content generation is currently restricted for your account. Please contact support if you believe this is an error.',
      canRetry: false
    };
  }
  
  saveViolationState(state);
  
  const remainingWarnings = MAX_WARNINGS_BEFORE_RESTRICT - state.warningCount;
  return {
    action: 'warn',
    message: `Content policy violation detected. ${remainingWarnings > 0 ? `${remainingWarnings} warning(s) remaining before access restriction.` : 'This is your final warning.'}`,
    canRetry: true
  };
}

/**
 * Check if user is currently restricted
 */
export function isUserRestricted(): boolean {
  const state = getViolationState();
  return state.isRestricted;
}

/**
 * Get current warning count
 */
export function getWarningCount(): number {
  const state = getViolationState();
  return state.warningCount;
}

/**
 * Check if we should show a warning (rate limiting warnings)
 */
export function shouldShowWarning(): boolean {
  const state = getViolationState();
  if (!state.lastWarningTime) return true;
  
  const timeSinceLastWarning = Date.now() - state.lastWarningTime.getTime();
  return timeSinceLastWarning > VIOLATION_COOLDOWN_MS;
}

/**
 * Log violation to backend for monitoring
 * This is intentionally silent and non-blocking
 */
async function logViolationToBackend(
  violation: ContentViolation,
  totalCount: number
): Promise<void> {
  try {
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Log to console for now - in production this would go to a monitoring table
    console.warn('[ContentPolicy] Violation logged:', {
      userId: user?.id || 'anonymous',
      type: violation.type,
      severity: violation.severity,
      totalViolations: totalCount,
      timestamp: violation.timestamp.toISOString()
    });
    
    // In production, you would insert into a violations table:
    // await supabase.from('content_violations').insert({
    //   user_id: user?.id,
    //   violation_type: violation.type,
    //   severity: violation.severity,
    //   total_count: totalCount
    // });
    
  } catch (error) {
    // Silent fail - don't disrupt user experience
    console.error('[ContentPolicy] Failed to log violation:', error);
  }
}

/**
 * Reset violations (for admin use or after cooldown period)
 */
export function resetViolations(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Get violation summary for display
 */
export function getViolationSummary(): {
  count: number;
  isRestricted: boolean;
  recentViolations: ContentViolation[];
} {
  const state = getViolationState();
  return {
    count: state.warningCount,
    isRestricted: state.isRestricted,
    recentViolations: state.violations.slice(-5) // Last 5 violations
  };
}
