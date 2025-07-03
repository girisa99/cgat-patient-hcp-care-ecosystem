/**
 * Learning Orchestration Hook
 * Provides React interface for the Master Development Orchestrator with learning capabilities
 */

import { useState, useEffect, useCallback } from 'react';
import { masterOrchestrator, OrchestrationResult, OrchestrationStats } from '@/utils/orchestration/MasterDevelopmentOrchestrator';
import { LearningInsight, learningEngine } from '@/utils/learning/LearningEngine';
import { useToast } from '@/hooks/use-toast';

export const useLearningOrchestration = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<OrchestrationStats & { learningStats: any; insights: LearningInsight[] }>({
    totalTasks: 0,
    successfulTasks: 0,
    failedTasks: 0,
    correctedTasks: 0,
    learningRecords: 0,
    patternsIdentified: 0,
    autoCorrectionsApplied: 0,
    learningStats: {},
    insights: []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentResults, setRecentResults] = useState<OrchestrationResult[]>([]);

  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      const currentStats = masterOrchestrator.getStatistics();
      setStats(currentStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Queue a task with learning intelligence
   */
  const queueTask = useCallback(async (
    type: 'verification' | 'validation' | 'registry' | 'update' | 'correction',
    context: string,
    parameters: any,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    setIsProcessing(true);
    
    try {
      const taskId = await masterOrchestrator.queueTask(type, context, parameters, priority);
      
      toast({
        title: "🎯 Task Queued",
        description: `Task ${taskId} queued with learning intelligence`,
      });

      return taskId;
    } catch (error: any) {
      toast({
        title: "❌ Task Queue Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  /**
   * Get learning insights for course correction
   */
  const getLearningInsights = useCallback((): LearningInsight[] => {
    return masterOrchestrator.getLearningInsights();
  }, []);

  /**
   * Apply course correction based on insight
   */
  const applyCourseCorrection = useCallback((insight: LearningInsight) => {
    masterOrchestrator.applyCourseCorrection(insight);
    
    toast({
      title: "🎯 Course Correction Applied",
      description: insight.description,
    });
  }, [toast]);

  /**
   * Capture a manual learning record
   */
  const captureManualLearning = useCallback((
    context: string,
    failureType: string,
    originalDecision: any,
    failureReason: string,
    correctionApplied?: any,
    success?: boolean
  ) => {
    const recordId = learningEngine.captureFailure(
      context,
      failureType,
      originalDecision,
      failureReason,
      { manual: true }
    );

    if (correctionApplied !== undefined && success !== undefined) {
      learningEngine.recordCorrection(recordId, correctionApplied, success);
    }

    toast({
      title: "🧠 Learning Captured",
      description: `Manual learning record created: ${recordId}`,
    });

    return recordId;
  }, [toast]);

  /**
   * Get recommended correction for a context
   */
  const getRecommendedCorrection = useCallback((context: string, failureType: string) => {
    return learningEngine.getRecommendedCorrection(context, failureType);
  }, []);

  /**
   * Pause orchestrator processing
   */
  const pauseProcessing = useCallback(() => {
    masterOrchestrator.pauseProcessing();
    toast({
      title: "⏸️ Processing Paused",
      description: "Orchestrator processing has been paused for manual intervention",
      variant: "destructive",
    });
  }, [toast]);

  /**
   * Resume orchestrator processing
   */
  const resumeProcessing = useCallback(() => {
    masterOrchestrator.resumeProcessing();
    toast({
      title: "▶️ Processing Resumed",
      description: "Orchestrator processing has been resumed",
    });
  }, [toast]);

  /**
   * Get learning health score
   */
  const getLearningHealthScore = useCallback((): number => {
    const { learningStats } = stats;
    
    if (!learningStats.totalLearningRecords) return 0;
    
    const successRate = learningStats.successRate || 0;
    const confidenceScore = learningStats.averageConfidence || 0;
    const patternsScore = Math.min(learningStats.identifiedPatterns / 10, 1);
    
    return Math.round((successRate * 0.4 + confidenceScore * 0.4 + patternsScore * 0.2) * 100);
  }, [stats]);

  /**
   * Generate learning report
   */
  const generateLearningReport = useCallback(() => {
    const insights = getLearningInsights();
    const healthScore = getLearningHealthScore();
    const { learningStats } = stats;
    
    const report = {
      timestamp: new Date().toISOString(),
      healthScore,
      stats: learningStats,
      insights,
      recommendations: insights
        .filter(i => i.actionable)
        .map(i => i.recommendation),
      criticalIssues: insights
        .filter(i => i.impact === 'critical')
        .length,
      autoApplicableImprovements: insights
        .filter(i => i.autoApplicable)
        .length
    };
    
    // Download as JSON
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "📊 Learning Report Generated",
      description: `Report downloaded with health score: ${healthScore}/100`,
    });
    
    return report;
  }, [getLearningInsights, getLearningHealthScore, stats, toast]);

  return {
    // Task management
    queueTask,
    isProcessing,
    
    // Learning insights
    getLearningInsights,
    applyCourseCorrection,
    captureManualLearning,
    getRecommendedCorrection,
    
    // Process control
    pauseProcessing,
    resumeProcessing,
    
    // Statistics and reporting
    stats,
    recentResults,
    getLearningHealthScore,
    generateLearningReport,
    
    // Computed values
    isSystemLearning: stats.learningRecords > 0,
    hasHighConfidencePatterns: stats.learningStats?.highConfidencePatterns > 0,
    needsAttention: getLearningInsights().some(i => i.impact === 'critical'),
    autoCorrectionsEnabled: stats.autoCorrectionsApplied > 0
  };
};