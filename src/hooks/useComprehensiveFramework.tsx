/**
 * COMPREHENSIVE FRAMEWORK HOOK
 * Unified interface for all framework validation and enhancement features
 * Provides real-time monitoring, compliance checking, and auto-fixing
 */

import { useState, useEffect, useCallback } from 'react';
import ComprehensiveFrameworkValidator, { type ComprehensiveValidationResult } from '@/utils/framework/ComprehensiveFrameworkValidator';
import PromptEnhancementEngine, { type EnhancedPromptData } from '@/utils/framework/PromptEnhancementEngine';
import { useConsolidationAnalysis } from './useConsolidationAnalysis';
import { useComplianceMonitoring } from './useComplianceMonitoring';

export interface FrameworkStatus {
  isCompliant: boolean;
  complianceScore: number;
  violations: {
    total: number;
    critical: number;
    warning: number;
  };
  autoFixAvailable: boolean;
  lastValidation: string | null;
}

export interface FrameworkMetrics {
  totalValidations: number;
  autoFixesApplied: number;
  promptsEnhanced: number;
  averageComplianceScore: number;
  trendsData: {
    dates: string[];
    scores: number[];
  };
}

export const useComprehensiveFramework = () => {
  const [frameworkStatus, setFrameworkStatus] = useState<FrameworkStatus>({
    isCompliant: false,
    complianceScore: 0,
    violations: { total: 0, critical: 0, warning: 0 },
    autoFixAvailable: false,
    lastValidation: null
  });

  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ComprehensiveValidationResult | null>(null);
  const [enhancementEngine] = useState(() => PromptEnhancementEngine.getInstance());
  const [frameworkValidator] = useState(() => ComprehensiveFrameworkValidator.getInstance());

  // Integration with existing hooks
  const { report: consolidationReport, runAnalysis: runConsolidation } = useConsolidationAnalysis();
  const { complianceScore, isMonitoring, startMonitoring } = useComplianceMonitoring();

  // Run comprehensive validation
  const runFrameworkValidation = useCallback(async () => {
    setIsValidating(true);
    console.log('🚀 Running comprehensive framework validation...');

    try {
      // Run main validation
      const results = await frameworkValidator.validateCompleteFramework();
      setValidationResults(results);

      // Update framework status
      setFrameworkStatus({
        isCompliant: results.frameworkAdherence,
        complianceScore: results.overallCompliance,
        violations: {
          total: Object.values(results.violations).reduce((sum, count) => sum + count, 0),
          critical: results.blockingIssues.length,
          warning: results.recommendations.length
        },
        autoFixAvailable: results.violations.duplicates > 0 || results.violations.governance > 0,
        lastValidation: results.timestamp
      });

      // Trigger consolidation analysis if needed
      if (results.violations.duplicates > 0) {
        await runConsolidation();
      }

      console.log('✅ Framework validation complete:', {
        compliance: results.overallCompliance,
        violations: results.violations
      });

    } catch (error) {
      console.error('❌ Framework validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  }, [frameworkValidator, runConsolidation]);

  // Auto-fix violations
  const applyAutoFixes = useCallback(async () => {
    console.log('🔧 Applying automatic fixes...');
    
    try {
      const fixesApplied = await frameworkValidator.autoFixViolations();
      
      if (fixesApplied.length > 0) {
        console.log('✅ Auto-fixes applied:', fixesApplied);
        // Re-run validation to update status
        await runFrameworkValidation();
        return fixesApplied;
      } else {
        console.log('ℹ️  No auto-fixes available');
        return [];
      }
    } catch (error) {
      console.error('❌ Auto-fix failed:', error);
      return [];
    }
  }, [frameworkValidator, runFrameworkValidation]);

  // Enhance prompt with compliance context
  const enhancePrompt = useCallback(async (prompt: string) => {
    console.log('💡 Enhancing prompt with framework context...');
    
    try {
      const enhanced = await enhancementEngine.enhancePromptWithCompliance(prompt);
      console.log('✅ Prompt enhanced with compliance context');
      return enhanced;
    } catch (error) {
      console.error('❌ Prompt enhancement failed:', error);
      return null;
    }
  }, [enhancementEngine]);

  // Get comprehensive metrics
  const getFrameworkMetrics = useCallback((): FrameworkMetrics => {
    const validationHistory = frameworkValidator.getValidationHistory();
    const enhancementStats = enhancementEngine.getEnhancementStats();

    const trendsData = validationHistory.slice(-10).map(result => ({
      date: new Date(result.timestamp).toLocaleDateString(),
      score: result.overallCompliance
    }));

    return {
      totalValidations: validationHistory.length,
      autoFixesApplied: validationHistory.reduce(
        (sum, result) => sum + result.autoFixApplied.length, 0
      ),
      promptsEnhanced: enhancementStats.totalEnhancements,
      averageComplianceScore: validationHistory.length > 0 
        ? Math.round(validationHistory.reduce((sum, result) => sum + result.overallCompliance, 0) / validationHistory.length)
        : 100,
      trendsData: {
        dates: trendsData.map(d => d.date),
        scores: trendsData.map(d => d.score)
      }
    };
  }, [frameworkValidator, enhancementEngine]);

  // Initialize framework monitoring
  useEffect(() => {
    console.log('🏗️  Initializing comprehensive framework system...');
    
    // Start compliance monitoring if not already active
    if (!isMonitoring) {
      startMonitoring();
    }

    // Run initial validation
    runFrameworkValidation();
  }, [isMonitoring, startMonitoring, runFrameworkValidation]);

  // Periodic validation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isValidating) {
        runFrameworkValidation();
      }
    }, 300000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [isValidating, runFrameworkValidation]);

  return {
    // Status
    frameworkStatus,
    isValidating,
    validationResults,
    
    // Actions
    runFrameworkValidation,
    applyAutoFixes,
    enhancePrompt,
    
    // Metrics
    getFrameworkMetrics,
    
    // Integration data
    consolidationReport,
    complianceScore: complianceScore || frameworkStatus.complianceScore,
    
    // Utilities
    clearValidationCache: frameworkValidator.clearValidationCache,
    getValidationHistory: frameworkValidator.getValidationHistory,
    getEnhancementHistory: enhancementEngine.getEnhancementHistory,
    
    // Status helpers
    isFrameworkCompliant: frameworkStatus.isCompliant,
    hasBlockingIssues: frameworkStatus.violations.critical > 0,
    needsAttention: frameworkStatus.complianceScore < 85,
    
    // Meta
    meta: {
      lastValidation: frameworkStatus.lastValidation,
      validationCount: frameworkValidator.getValidationHistory().length,
      enhancementCount: enhancementEngine.getEnhancementHistory().length,
      frameworkVersion: 'comprehensive-v1.0.0'
    }
  };
};

export default useComprehensiveFramework;