/**
 * useMessagingFeedback Hook
 * 
 * React hook for the messaging feedback and improvement system.
 * Enables bi-weekly analysis, improvement suggestions, and approval workflow.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  messagingFeedbackService,
  type UserFeedback,
  type ConfusionSignal,
  type MessagingImprovement,
  type MessagingAnalysis,
  type ImprovementCycle,
  type FeedbackSource,
  IMPROVEMENT_CYCLE_DAYS,
} from '@/services/marketing/messagingFeedbackService';
import { type GenieProductId } from '@/services/marketing/productVersionTrackingService';
import { toast } from 'sonner';

interface UseMessagingFeedbackOptions {
  /** Show toast notifications */
  showNotifications?: boolean;
  /** Auto-refresh interval in ms (0 = disabled) */
  refreshInterval?: number;
  /** Filter by product IDs */
  productIds?: GenieProductId[];
}

interface UseMessagingFeedbackReturn {
  // State
  currentCycle: ImprovementCycle | null;
  pendingImprovements: MessagingImprovement[];
  recentFeedback: UserFeedback[];
  confusionSignals: ConfusionSignal[];
  latestAnalysis: MessagingAnalysis | null;
  isAnalyzing: boolean;

  // Actions
  recordFeedback: (
    productId: GenieProductId,
    content: string,
    source: FeedbackSource,
    featureId?: string
  ) => void;
  recordConfusion: (
    productId: GenieProductId,
    signalType: ConfusionSignal['signalType'],
    featureId?: string
  ) => void;
  runAnalysis: () => Promise<MessagingAnalysis | null>;
  startCycle: () => void;
  approveImprovement: (improvementId: string, approvedBy: string) => void;
  rejectImprovement: (improvementId: string, rejectedBy: string) => void;

  // Stats
  cycleProgress: number;
  daysRemaining: number;
  improvementStats: {
    pending: number;
    approved: number;
    rejected: number;
    testing: number;
  };
}

export function useMessagingFeedback(
  options: UseMessagingFeedbackOptions = {}
): UseMessagingFeedbackReturn {
  const { showNotifications = true, refreshInterval = 0, productIds } = options;

  const [currentCycle, setCurrentCycle] = useState<ImprovementCycle | null>(
    messagingFeedbackService.getCurrentCycle()
  );
  const [pendingImprovements, setPendingImprovements] = useState<MessagingImprovement[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<UserFeedback[]>([]);
  const [confusionSignals, setConfusionSignals] = useState<ConfusionSignal[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<MessagingAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Refresh data
  const refreshData = useCallback(() => {
    setCurrentCycle(messagingFeedbackService.getCurrentCycle());
    
    const allImprovements = messagingFeedbackService.getAllImprovements();
    const filtered = productIds
      ? allImprovements.filter(i => productIds.includes(i.productId) && i.status === 'pending')
      : allImprovements.filter(i => i.status === 'pending');
    setPendingImprovements(filtered);

    const allFeedback = messagingFeedbackService.getAllFeedback();
    const recentFiltered = productIds
      ? allFeedback.filter(f => productIds.includes(f.productId))
      : allFeedback;
    setRecentFeedback(recentFiltered.slice(-20)); // Last 20

    const signals = messagingFeedbackService.getConfusionSignals();
    const signalsFiltered = productIds
      ? signals.filter(s => productIds.includes(s.productId))
      : signals;
    setConfusionSignals(signalsFiltered);
  }, [productIds]);

  // Initial load and interval refresh
  useEffect(() => {
    refreshData();

    if (refreshInterval > 0) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshData, refreshInterval]);

  // Subscribe to analysis updates
  useEffect(() => {
    const unsubscribe = messagingFeedbackService.onAnalysisComplete((analysis) => {
      setLatestAnalysis(analysis);
      refreshData();
      
      if (showNotifications) {
        toast.success(`Analysis complete: ${analysis.suggestedImprovements.length} improvements suggested`);
      }
    });

    return unsubscribe;
  }, [showNotifications, refreshData]);

  // Record feedback
  const recordFeedback = useCallback((
    productId: GenieProductId,
    content: string,
    source: FeedbackSource,
    featureId?: string
  ) => {
    messagingFeedbackService.recordFeedback({
      productId,
      content,
      source,
      featureId,
    });

    refreshData();

    if (showNotifications) {
      toast.info('Feedback recorded');
    }
  }, [showNotifications, refreshData]);

  // Record confusion signal
  const recordConfusion = useCallback((
    productId: GenieProductId,
    signalType: ConfusionSignal['signalType'],
    featureId?: string
  ) => {
    messagingFeedbackService.recordConfusionSignal({
      productId,
      signalType,
      featureId,
      affectedUsers: 1,
    });

    refreshData();
  }, [refreshData]);

  // Run analysis
  const runAnalysis = useCallback(async (): Promise<MessagingAnalysis | null> => {
    setIsAnalyzing(true);

    try {
      if (showNotifications) {
        toast.info('Running bi-weekly messaging analysis...');
      }

      const analysis = await messagingFeedbackService.runAnalysis(productIds);
      setLatestAnalysis(analysis);
      refreshData();

      return analysis;
    } catch (error) {
      console.error('[useMessagingFeedback] Analysis failed:', error);
      if (showNotifications) {
        toast.error('Analysis failed');
      }
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [productIds, showNotifications, refreshData]);

  // Start new cycle
  const startCycle = useCallback(() => {
    const cycle = messagingFeedbackService.startImprovementCycle(productIds);
    setCurrentCycle(cycle);

    if (showNotifications) {
      toast.success(`Started improvement cycle #${cycle.cycleNumber}`);
    }
  }, [productIds, showNotifications]);

  // Approve improvement
  const approveImprovement = useCallback((improvementId: string, approvedBy: string) => {
    messagingFeedbackService.approveImprovement(improvementId, approvedBy);
    refreshData();

    if (showNotifications) {
      toast.success('Improvement approved');
    }
  }, [showNotifications, refreshData]);

  // Reject improvement
  const rejectImprovement = useCallback((improvementId: string, rejectedBy: string) => {
    messagingFeedbackService.rejectImprovement(improvementId, rejectedBy);
    refreshData();

    if (showNotifications) {
      toast.info('Improvement rejected');
    }
  }, [showNotifications, refreshData]);

  // Calculate cycle progress
  const cycleProgress = currentCycle
    ? Math.min(100, ((Date.now() - currentCycle.startDate.getTime()) / 
        (IMPROVEMENT_CYCLE_DAYS * 24 * 60 * 60 * 1000)) * 100)
    : 0;

  const daysRemaining = currentCycle
    ? Math.max(0, Math.ceil((currentCycle.endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : IMPROVEMENT_CYCLE_DAYS;

  // Calculate improvement stats
  const allImprovements = messagingFeedbackService.getAllImprovements();
  const improvementStats = {
    pending: allImprovements.filter(i => i.status === 'pending').length,
    approved: allImprovements.filter(i => i.status === 'approved').length,
    rejected: allImprovements.filter(i => i.status === 'rejected').length,
    testing: allImprovements.filter(i => i.status === 'testing').length,
  };

  return {
    currentCycle,
    pendingImprovements,
    recentFeedback,
    confusionSignals,
    latestAnalysis,
    isAnalyzing,
    recordFeedback,
    recordConfusion,
    runAnalysis,
    startCycle,
    approveImprovement,
    rejectImprovement,
    cycleProgress,
    daysRemaining,
    improvementStats,
  };
}

export default useMessagingFeedback;
