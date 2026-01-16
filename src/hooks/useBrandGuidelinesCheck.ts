/**
 * useBrandGuidelinesCheck - P3-QW-05: Brand Guidelines Verification
 * 
 * Features:
 * - Logo usage validation
 * - Color palette compliance
 * - Typography consistency
 * - Tone of voice analysis
 * - Label Studio training for brand model improvement
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLSUniversalOptional } from '@/components/label-studio/LSUniversalProvider';

// ============================================================================
// TYPES
// ============================================================================

export type BrandCheckCategory = 'logo' | 'colors' | 'typography' | 'tone' | 'imagery' | 'spacing';
export type ComplianceLevel = 'compliant' | 'warning' | 'violation';

export interface BrandGuidelines {
  id: string;
  name: string;
  logo: {
    primaryUrl: string;
    secondaryUrl?: string;
    minSize: { width: number; height: number };
    clearSpace: number;
    forbiddenBackgrounds?: string[];
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string[];
    forbidden: string[];
    allowedVariance: number; // percentage
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    allowedFonts: string[];
    minFontSizes: {
      heading: number;
      body: number;
      caption: number;
    };
  };
  tone: {
    voiceAttributes: string[];
    forbiddenTerms: string[];
    preferredTerms: Record<string, string>;
    formality: 'formal' | 'casual' | 'mixed';
  };
  imagery: {
    style: string;
    forbiddenElements: string[];
    requiredElements?: string[];
  };
}

export interface BrandViolation {
  id: string;
  category: BrandCheckCategory;
  level: ComplianceLevel;
  title: string;
  description: string;
  location?: {
    timestamp?: number;
    element?: string;
    coordinates?: { x: number; y: number };
  };
  currentValue: string;
  expectedValue: string;
  suggestion: string;
  autoFixAvailable: boolean;
}

export interface BrandCheckReport {
  id: string;
  contentId?: string;
  contentType: 'video' | 'image' | 'document' | 'text';
  checkedAt: string;
  overallScore: number;
  complianceLevel: ComplianceLevel;
  violations: BrandViolation[];
  summary: {
    logo: ComplianceLevel;
    colors: ComplianceLevel;
    typography: ComplianceLevel;
    tone: ComplianceLevel;
    imagery: ComplianceLevel;
  };
  categoryScores: {
    logo: number;
    colors: number;
    typography: number;
    tone: number;
    imagery: number;
  };
  recommendations: string[];
}

export interface BrandCheckConfig {
  contentUrl?: string;
  contentText?: string;
  contentType: 'video' | 'image' | 'document' | 'text';
  guidelinesId?: string;
  customGuidelines?: Partial<BrandGuidelines>;
  categories?: BrandCheckCategory[];
}

// ============================================================================
// HOOK
// ============================================================================

export function useBrandGuidelinesCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [report, setReport] = useState<BrandCheckReport | null>(null);
  const [violations, setViolations] = useState<BrandViolation[]>([]);
  const [guidelines, setGuidelines] = useState<BrandGuidelines | null>(null);
  
  const ls = useLSUniversalOptional();

  // Capture for Label Studio training
  const captureForTraining = useCallback((
    config: BrandCheckConfig,
    report: BrandCheckReport,
    userAction: 'checked' | 'fixed' | 'approved' | 'rejected',
    violationId?: string
  ) => {
    if (!ls?.isEnabled) return;

    ls.captureData({
      type: 'content_tagging',
      source: 'production',
      platform: 'desktop',
      data: {
        category: 'brand_compliance',
        config: {
          contentType: config.contentType,
          categories: config.categories,
        },
        report: {
          overallScore: report.overallScore,
          complianceLevel: report.complianceLevel,
          totalViolations: report.violations.length,
          categoryScores: report.categoryScores,
        },
        userAction,
        violationId,
      },
      labels: {
        brand_compliant: report.complianceLevel === 'compliant',
        has_violations: report.violations.length > 0,
      },
    });
  }, [ls]);

  // Load brand guidelines
  const loadGuidelines = useCallback(async (
    guidelinesId: string
  ): Promise<BrandGuidelines | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('brand-guidelines-checker', {
        body: {
          action: 'get_guidelines',
          guidelinesId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to load guidelines');

      const loadedGuidelines = data.guidelines as BrandGuidelines;
      setGuidelines(loadedGuidelines);
      return loadedGuidelines;

    } catch (err) {
      console.error('Failed to load brand guidelines:', err);
      toast.error('Failed to load brand guidelines');
      return null;
    }
  }, []);

  // Run brand check
  const runBrandCheck = useCallback(async (
    config: BrandCheckConfig
  ): Promise<BrandCheckReport | null> => {
    setIsChecking(true);

    try {
      const { data, error } = await supabase.functions.invoke('brand-guidelines-checker', {
        body: {
          action: 'check',
          ...config,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Brand check failed');

      const checkReport: BrandCheckReport = data.report;
      setReport(checkReport);
      setViolations(checkReport.violations);

      captureForTraining(config, checkReport, 'checked');

      const statusEmoji = checkReport.complianceLevel === 'compliant' ? '✅' : 
                         checkReport.complianceLevel === 'warning' ? '⚠️' : '❌';
      
      toast.success(`${statusEmoji} Brand compliance: ${checkReport.overallScore}%`, {
        description: `${checkReport.violations.length} issues found`
      });

      return checkReport;

    } catch (err) {
      console.error('Brand check failed:', err);
      toast.error('Failed to run brand check');
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [captureForTraining]);

  // Check color compliance
  const checkColorCompliance = useCallback(async (
    colors: string[],
    guidelinesId?: string
  ): Promise<{
    compliant: string[];
    violations: Array<{ color: string; reason: string; suggestion: string }>;
  } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('brand-guidelines-checker', {
        body: {
          action: 'check_colors',
          colors,
          guidelinesId,
        },
      });

      if (error) throw error;
      return data.result || null;

    } catch (err) {
      console.error('Color compliance check failed:', err);
      return null;
    }
  }, []);

  // Check text tone compliance
  const checkToneCompliance = useCallback(async (
    text: string,
    guidelinesId?: string
  ): Promise<{
    score: number;
    level: ComplianceLevel;
    issues: Array<{ text: string; issue: string; suggestion: string }>;
  } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('brand-guidelines-checker', {
        body: {
          action: 'check_tone',
          text,
          guidelinesId,
        },
      });

      if (error) throw error;
      return data.result || null;

    } catch (err) {
      console.error('Tone compliance check failed:', err);
      return null;
    }
  }, []);

  // Auto-fix a violation
  const autoFixViolation = useCallback(async (
    violationId: string,
    config?: BrandCheckConfig
  ): Promise<boolean> => {
    const violation = violations.find(v => v.id === violationId);
    if (!violation?.autoFixAvailable) {
      toast.error('Auto-fix not available for this violation');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('brand-guidelines-checker', {
        body: {
          action: 'auto_fix',
          violationId,
          category: violation.category,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Auto-fix failed');

      // Remove fixed violation from list
      setViolations(prev => prev.filter(v => v.id !== violationId));
      
      if (config && report) {
        captureForTraining(config, report, 'fixed', violationId);
      }

      toast.success('Violation fixed successfully');
      return true;

    } catch (err) {
      console.error('Auto-fix failed:', err);
      toast.error('Failed to auto-fix violation');
      return false;
    }
  }, [violations, report, captureForTraining]);

  // Approve content despite warnings
  const approveWithWarnings = useCallback((config?: BrandCheckConfig) => {
    if (report && config) {
      captureForTraining(config, report, 'approved');
    }
    toast.success('Content approved with warnings');
  }, [report, captureForTraining]);

  // Get compliance badge info
  const getComplianceBadge = useCallback((): {
    level: ComplianceLevel;
    score: number;
    color: string;
    label: string;
  } | null => {
    if (!report) return null;

    const colorMap = {
      compliant: 'green',
      warning: 'yellow',
      violation: 'red',
    };

    const labelMap = {
      compliant: 'Brand Compliant',
      warning: 'Needs Review',
      violation: 'Non-Compliant',
    };

    return {
      level: report.complianceLevel,
      score: report.overallScore,
      color: colorMap[report.complianceLevel],
      label: labelMap[report.complianceLevel],
    };
  }, [report]);

  return {
    // State
    isChecking,
    report,
    violations,
    guidelines,
    
    // Actions
    loadGuidelines,
    runBrandCheck,
    checkColorCompliance,
    checkToneCompliance,
    autoFixViolation,
    approveWithWarnings,
    
    // Computed
    getComplianceBadge,
  };
}

export default useBrandGuidelinesCheck;
