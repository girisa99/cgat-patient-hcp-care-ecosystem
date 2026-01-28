/**
 * useMultiModelComparison Hook
 * 
 * React hook for Phase 2: Multi-Model Comparison
 * Provides side-by-side AI model comparison with quality scoring
 */

import { useState, useCallback } from 'react';
import { 
  multiModelComparison, 
  ComparisonRequest, 
  ComparisonResult, 
  ModelResponse,
  QualityMetrics 
} from '@/services/ai/MultiModelComparisonService';
import { useMasterToast } from '@/hooks/useMasterToast';

export interface MultiModelComparisonState {
  isComparing: boolean;
  currentComparison: ComparisonResult | null;
  selectedModels: string[];
  history: ComparisonResult[];
  error: string | null;
}

export interface UseMultiModelComparisonReturn extends MultiModelComparisonState {
  // Model selection
  toggleModel: (modelId: string) => void;
  selectModels: (modelIds: string[]) => void;
  clearSelection: () => void;
  
  // Comparison
  runComparison: (prompt: string, systemPrompt?: string, options?: { maxTokens?: number; temperature?: number }) => Promise<ComparisonResult | null>;
  
  // Results
  getWinner: () => ModelResponse | null;
  getQualityScore: (modelId: string) => QualityMetrics | null;
  getResponseByModel: (modelId: string) => ModelResponse | null;
  
  // History
  loadFromHistory: (id: string) => void;
  clearHistory: () => void;
  
  // Utilities
  getAvailableModels: () => Array<{ id: string; displayName: string; provider: string }>;
  reset: () => void;
}

const DEFAULT_MODELS = [
  'google/gemini-3-flash-preview',
  'openai/gpt-5-mini'
];

export const useMultiModelComparison = (): UseMultiModelComparisonReturn => {
  const { showError, showSuccess } = useMasterToast();
  
  const [state, setState] = useState<MultiModelComparisonState>({
    isComparing: false,
    currentComparison: null,
    selectedModels: DEFAULT_MODELS,
    history: [],
    error: null,
  });

  const toggleModel = useCallback((modelId: string) => {
    setState(prev => {
      const isSelected = prev.selectedModels.includes(modelId);
      if (isSelected) {
        // Don't allow less than 2 models
        if (prev.selectedModels.length <= 2) {
          return prev;
        }
        return {
          ...prev,
          selectedModels: prev.selectedModels.filter(id => id !== modelId),
        };
      } else {
        // Max 4 models for comparison
        if (prev.selectedModels.length >= 4) {
          return prev;
        }
        return {
          ...prev,
          selectedModels: [...prev.selectedModels, modelId],
        };
      }
    });
  }, []);

  const selectModels = useCallback((modelIds: string[]) => {
    if (modelIds.length < 2 || modelIds.length > 4) {
      showError('Invalid selection', 'Please select 2-4 models for comparison');
      return;
    }
    setState(prev => ({ ...prev, selectedModels: modelIds }));
  }, [showError]);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedModels: DEFAULT_MODELS }));
  }, []);

  const runComparison = useCallback(async (
    prompt: string, 
    systemPrompt?: string,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<ComparisonResult | null> => {
    if (state.selectedModels.length < 2) {
      showError('Not enough models', 'Select at least 2 models for comparison');
      return null;
    }
    
    setState(prev => ({ ...prev, isComparing: true, error: null }));
    
    try {
      const request: ComparisonRequest = {
        prompt,
        systemPrompt,
        models: state.selectedModels,
        maxTokens: options?.maxTokens,
        temperature: options?.temperature,
      };
      
      const result = await multiModelComparison.runComparison(request);
      
      setState(prev => ({
        ...prev,
        isComparing: false,
        currentComparison: result,
        history: [result, ...prev.history].slice(0, 10), // Keep last 10
      }));
      
      if (result.winner) {
        const winnerName = result.responses.find(r => r.modelId === result.winner)?.displayName || result.winner;
        showSuccess('Comparison complete', `${winnerName} scored highest!`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Comparison failed';
      setState(prev => ({ ...prev, isComparing: false, error: errorMessage }));
      showError('Comparison failed', errorMessage);
      return null;
    }
  }, [state.selectedModels, showError, showSuccess]);

  const getWinner = useCallback((): ModelResponse | null => {
    if (!state.currentComparison?.winner) return null;
    return state.currentComparison.responses.find(r => r.modelId === state.currentComparison!.winner) || null;
  }, [state.currentComparison]);

  const getQualityScore = useCallback((modelId: string): QualityMetrics | null => {
    if (!state.currentComparison) return null;
    return state.currentComparison.qualityScores.get(modelId) || null;
  }, [state.currentComparison]);

  const getResponseByModel = useCallback((modelId: string): ModelResponse | null => {
    if (!state.currentComparison) return null;
    return state.currentComparison.responses.find(r => r.modelId === modelId) || null;
  }, [state.currentComparison]);

  const loadFromHistory = useCallback((id: string) => {
    const comparison = state.history.find(h => h.id === id);
    if (comparison) {
      setState(prev => ({ ...prev, currentComparison: comparison }));
    }
  }, [state.history]);

  const clearHistory = useCallback(() => {
    multiModelComparison.clearHistory();
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  const getAvailableModels = useCallback(() => {
    return multiModelComparison.getAvailableModels();
  }, []);

  const reset = useCallback(() => {
    setState({
      isComparing: false,
      currentComparison: null,
      selectedModels: DEFAULT_MODELS,
      history: [],
      error: null,
    });
  }, []);

  return {
    ...state,
    toggleModel,
    selectModels,
    clearSelection,
    runComparison,
    getWinner,
    getQualityScore,
    getResponseByModel,
    loadFromHistory,
    clearHistory,
    getAvailableModels,
    reset,
  };
};
