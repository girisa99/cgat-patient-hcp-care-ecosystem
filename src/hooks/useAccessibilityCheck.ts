/**
 * useAccessibilityCheck - P3-QW-04: Accessibility Compliance Check
 * 
 * Features:
 * - WCAG 2.1 compliance checking
 * - Color contrast analysis
 * - Caption/subtitle validation
 * - Audio description suggestions
 * - Label Studio training for accessibility model improvement
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLSUniversalOptional } from '@/components/label-studio/LSUniversalProvider';

// ============================================================================
// TYPES
// ============================================================================

export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type IssueCategory = 'visual' | 'audio' | 'cognitive' | 'motor';
export type IssueSeverity = 'critical' | 'serious' | 'moderate' | 'minor';

export interface AccessibilityIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  wcagCriteria: string;
  wcagLevel: WCAGLevel;
  title: string;
  description: string;
  location?: {
    timestamp?: number;
    element?: string;
    coordinates?: { x: number; y: number };
  };
  suggestion: string;
  autoFixAvailable: boolean;
  autoFixAction?: string;
}

export interface ColorContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALargeText: boolean;
  suggestion?: {
    adjustedForeground?: string;
    adjustedBackground?: string;
    newRatio: number;
  };
}

export interface AccessibilityReport {
  id: string;
  contentId?: string;
  contentType: 'video' | 'image' | 'document' | 'webpage';
  checkedAt: string;
  overallScore: number;
  wcagLevel: WCAGLevel;
  issues: AccessibilityIssue[];
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };
  recommendations: string[];
  hasCaptions: boolean;
  hasAudioDescription: boolean;
  hasTranscript: boolean;
  colorContrastIssues: ColorContrastResult[];
}

export interface AccessibilityCheckConfig {
  contentUrl?: string;
  contentType: 'video' | 'image' | 'document' | 'webpage';
  targetLevel: WCAGLevel;
  checkCaptions?: boolean;
  checkAudioDescription?: boolean;
  checkColorContrast?: boolean;
  checkCognitiveLoad?: boolean;
  checkMotorAccessibility?: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAccessibilityCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  
  const ls = useLSUniversalOptional();

  // Capture for Label Studio training
  const captureForTraining = useCallback((
    config: AccessibilityCheckConfig,
    report: AccessibilityReport,
    userAction: 'checked' | 'fixed' | 'ignored',
    issueId?: string
  ) => {
    if (!ls?.isEnabled) return;

    ls.captureData({
      type: 'content_tagging',
      source: 'production',
      platform: 'desktop',
      data: {
        category: 'accessibility',
        config: {
          contentType: config.contentType,
          targetLevel: config.targetLevel,
        },
        report: {
          overallScore: report.overallScore,
          totalIssues: report.summary.total,
          criticalIssues: report.summary.critical,
          hasCaptions: report.hasCaptions,
          hasAudioDescription: report.hasAudioDescription,
        },
        userAction,
        issueId,
      },
      labels: {
        passed_check: report.overallScore >= 80,
        has_critical_issues: report.summary.critical > 0,
      },
    });
  }, [ls]);

  // Run accessibility check
  const runAccessibilityCheck = useCallback(async (
    config: AccessibilityCheckConfig
  ): Promise<AccessibilityReport | null> => {
    setIsChecking(true);

    try {
      const { data, error } = await supabase.functions.invoke('accessibility-checker', {
        body: {
          action: 'check',
          ...config,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Accessibility check failed');

      const checkReport: AccessibilityReport = data.report;
      setReport(checkReport);
      setIssues(checkReport.issues);

      captureForTraining(config, checkReport, 'checked');

      const scoreColor = checkReport.overallScore >= 80 ? 'green' : 
                        checkReport.overallScore >= 50 ? 'yellow' : 'red';
      
      toast.success(`Accessibility score: ${checkReport.overallScore}%`, {
        description: `${checkReport.summary.total} issues found (${checkReport.summary.critical} critical)`
      });

      return checkReport;

    } catch (err) {
      console.error('Accessibility check failed:', err);
      toast.error('Failed to run accessibility check');
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [captureForTraining]);

  // Check color contrast
  const checkColorContrast = useCallback(async (
    foreground: string,
    background: string
  ): Promise<ColorContrastResult | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('accessibility-checker', {
        body: {
          action: 'color_contrast',
          foreground,
          background,
        },
      });

      if (error) throw error;
      return data.result || null;

    } catch (err) {
      console.error('Color contrast check failed:', err);
      return null;
    }
  }, []);

  // Auto-fix an issue
  const autoFixIssue = useCallback(async (
    issueId: string,
    config?: AccessibilityCheckConfig
  ): Promise<boolean> => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue?.autoFixAvailable) {
      toast.error('Auto-fix not available for this issue');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('accessibility-checker', {
        body: {
          action: 'auto_fix',
          issueId,
          fixAction: issue.autoFixAction,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Auto-fix failed');

      // Remove fixed issue from list
      setIssues(prev => prev.filter(i => i.id !== issueId));
      
      if (config && report) {
        captureForTraining(config, report, 'fixed', issueId);
      }

      toast.success('Issue fixed successfully');
      return true;

    } catch (err) {
      console.error('Auto-fix failed:', err);
      toast.error('Failed to auto-fix issue');
      return false;
    }
  }, [issues, report, captureForTraining]);

  // Ignore an issue
  const ignoreIssue = useCallback((
    issueId: string,
    config?: AccessibilityCheckConfig
  ) => {
    setIssues(prev => prev.filter(i => i.id !== issueId));
    
    if (config && report) {
      captureForTraining(config, report, 'ignored', issueId);
    }

    toast.info('Issue ignored');
  }, [report, captureForTraining]);

  // Generate captions for video
  const generateCaptions = useCallback(async (
    videoUrl: string,
    language: string = 'en'
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('accessibility-checker', {
        body: {
          action: 'generate_captions',
          videoUrl,
          language,
        },
      });

      if (error) throw error;
      return data.captionsUrl || null;

    } catch (err) {
      console.error('Caption generation failed:', err);
      toast.error('Failed to generate captions');
      return null;
    }
  }, []);

  // Get accessibility score summary
  const getScoreSummary = useCallback((): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    status: 'pass' | 'warning' | 'fail';
  } | null => {
    if (!report) return null;

    const score = report.overallScore;
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
    const status = score >= 80 ? 'pass' : score >= 50 ? 'warning' : 'fail';

    return { score, grade, status };
  }, [report]);

  return {
    // State
    isChecking,
    report,
    issues,
    
    // Actions
    runAccessibilityCheck,
    checkColorContrast,
    autoFixIssue,
    ignoreIssue,
    generateCaptions,
    
    // Computed
    getScoreSummary,
  };
}

export default useAccessibilityCheck;
