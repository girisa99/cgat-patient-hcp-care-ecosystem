
/**
 * Consolidation Analysis Hook
 * Provides real-time analysis of codebase consolidation status
 */

import { useState, useEffect } from 'react';
import { performComprehensiveConsolidation } from '@/utils/consolidation';
import type { ConsolidationAnalysis, DeadCodeAnalysis, SingleSourceValidation } from '@/utils/consolidation';

export interface ConsolidationReport {
  timestamp: string;
  codebaseAnalysis: ConsolidationAnalysis;
  deadCodeAnalysis: DeadCodeAnalysis;
  singleSourceValidation: SingleSourceValidation;
  summary: {
    totalViolations: number;
    compliantSystems: number;
    deadCodeItems: number;
    duplicatesFound: number;
  };
}

export const useConsolidationAnalysis = () => {
  const [report, setReport] = useState<ConsolidationReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('🔍 Running comprehensive consolidation analysis...');
      const analysisReport = await performComprehensiveConsolidation();
      
      // Ensure proper typing for the report
      const typedReport: ConsolidationReport = {
        timestamp: analysisReport.timestamp,
        codebaseAnalysis: analysisReport.codebaseAnalysis,
        deadCodeAnalysis: analysisReport.deadCodeAnalysis,
        singleSourceValidation: analysisReport.singleSourceValidation,
        summary: {
          totalViolations: Number(analysisReport.summary.totalViolations),
          compliantSystems: Number(analysisReport.summary.compliantSystems),
          deadCodeItems: Number(analysisReport.summary.deadCodeItems),
          duplicatesFound: Number(analysisReport.summary.duplicatesFound)
        }
      };
      
      setReport(typedReport);
      
      console.log('✅ Analysis complete:', {
        compliantSystems: typedReport.summary.compliantSystems,
        violations: typedReport.summary.totalViolations,
        duplicatesFound: typedReport.summary.duplicatesFound
      });
      
    } catch (err) {
      console.error('❌ Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-run analysis on mount
  useEffect(() => {
    runAnalysis();
  }, []);

  const getConsolidationStatus = () => {
    if (!report) return 'unknown';
    
    const { summary } = report;
    
    if (summary.totalViolations === 0 && summary.duplicatesFound === 0) {
      return 'excellent';
    } else if (summary.totalViolations <= 2 && summary.duplicatesFound <= 3) {
      return 'good';
    } else if (summary.totalViolations <= 5 && summary.duplicatesFound <= 10) {
      return 'fair';
    } else {
      return 'needs-work';
    }
  };

  const getStatusColor = () => {
    const status = getConsolidationStatus();
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'needs-work': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return {
    report,
    isAnalyzing,
    error,
    runAnalysis,
    getConsolidationStatus,
    getStatusColor,
    // Helper methods
    isConsolidated: getConsolidationStatus() === 'excellent',
    hasViolations: report ? report.summary.totalViolations > 0 : false,
    hasDuplicates: report ? report.summary.duplicatesFound > 0 : false,
    meta: {
      lastAnalysis: report?.timestamp,
      systemsAnalyzed: ['Users', 'Facilities', 'Modules', 'Patients', 'API Services', 'Data Import', 'Dashboard'],
      version: 'consolidation-analysis-v1'
    }
  };
};
