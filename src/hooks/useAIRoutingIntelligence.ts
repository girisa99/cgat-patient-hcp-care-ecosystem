/**
 * useAIRoutingIntelligence Hook
 * 
 * React hook for Phase 1: AI Routing Intelligence
 * Provides query classification, auto-model selection, and cost optimization
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  aiRoutingIntelligence, 
  QueryClassification, 
  ModelRecommendation, 
  RoutingDecision 
} from '@/services/ai/AIRoutingIntelligenceService';

export interface AIRoutingState {
  isAnalyzing: boolean;
  lastClassification: QueryClassification | null;
  recommendations: ModelRecommendation[];
  selectedModel: ModelRecommendation | null;
  routingDecision: RoutingDecision | null;
}

export interface UseAIRoutingIntelligenceReturn extends AIRoutingState {
  // Analysis
  analyzeQuery: (query: string, hasAttachments?: boolean) => RoutingDecision;
  classifyQuery: (query: string, hasAttachments?: boolean) => QueryClassification;
  
  // Selection
  selectModel: (recommendation: ModelRecommendation) => void;
  selectCostOptimized: () => void;
  selectQualityOptimized: () => void;
  selectSpeedOptimized: () => void;
  
  // Metrics
  recordSuccess: (latencyMs: number) => void;
  recordFailure: (latencyMs: number) => void;
  
  // Utilities
  getModelsForIntent: (intent: string) => string[];
  reset: () => void;
}

export const useAIRoutingIntelligence = (): UseAIRoutingIntelligenceReturn => {
  const [state, setState] = useState<AIRoutingState>({
    isAnalyzing: false,
    lastClassification: null,
    recommendations: [],
    selectedModel: null,
    routingDecision: null,
  });

  const analyzeQuery = useCallback((query: string, hasAttachments = false): RoutingDecision => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    
    try {
      const decision = aiRoutingIntelligence.makeRoutingDecision(query, hasAttachments);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        lastClassification: decision.classification,
        recommendations: [decision.primaryRecommendation, ...decision.alternativeRecommendations],
        selectedModel: decision.primaryRecommendation,
        routingDecision: decision,
      }));
      
      return decision;
    } catch (error) {
      console.error('AI routing analysis failed:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
      throw error;
    }
  }, []);

  const classifyQuery = useCallback((query: string, hasAttachments = false): QueryClassification => {
    const classification = aiRoutingIntelligence.classifyQuery(query, hasAttachments);
    setState(prev => ({ ...prev, lastClassification: classification }));
    return classification;
  }, []);

  const selectModel = useCallback((recommendation: ModelRecommendation) => {
    setState(prev => ({ ...prev, selectedModel: recommendation }));
  }, []);

  const selectCostOptimized = useCallback(() => {
    if (state.routingDecision?.costOptimizedOption) {
      setState(prev => ({ ...prev, selectedModel: state.routingDecision!.costOptimizedOption }));
    }
  }, [state.routingDecision]);

  const selectQualityOptimized = useCallback(() => {
    if (state.routingDecision?.qualityOptimizedOption) {
      setState(prev => ({ ...prev, selectedModel: state.routingDecision!.qualityOptimizedOption }));
    }
  }, [state.routingDecision]);

  const selectSpeedOptimized = useCallback(() => {
    if (state.routingDecision?.speedOptimizedOption) {
      setState(prev => ({ ...prev, selectedModel: state.routingDecision!.speedOptimizedOption }));
    }
  }, [state.routingDecision]);

  const recordSuccess = useCallback((latencyMs: number) => {
    if (state.selectedModel) {
      aiRoutingIntelligence.recordMetrics(state.selectedModel.modelId, true, latencyMs);
    }
  }, [state.selectedModel]);

  const recordFailure = useCallback((latencyMs: number) => {
    if (state.selectedModel) {
      aiRoutingIntelligence.recordMetrics(state.selectedModel.modelId, false, latencyMs);
    }
  }, [state.selectedModel]);

  const getModelsForIntent = useCallback((intent: string) => {
    return aiRoutingIntelligence.getModelsForIntent(intent as any);
  }, []);

  const reset = useCallback(() => {
    setState({
      isAnalyzing: false,
      lastClassification: null,
      recommendations: [],
      selectedModel: null,
      routingDecision: null,
    });
  }, []);

  return {
    ...state,
    analyzeQuery,
    classifyQuery,
    selectModel,
    selectCostOptimized,
    selectQualityOptimized,
    selectSpeedOptimized,
    recordSuccess,
    recordFailure,
    getModelsForIntent,
    reset,
  };
};
