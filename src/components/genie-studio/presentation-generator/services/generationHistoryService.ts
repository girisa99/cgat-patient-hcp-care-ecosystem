/**
 * Generation History Service
 * Tracks presentation generation history with estimated vs actual credit usage
 */

import { supabase } from '@/integrations/supabase/client';
import type { TokenEstimate, TokenBreakdown, OptimizationSuggestion } from './tokenEstimationService';

export interface GenerationRecord {
  id: string;
  userId: string;
  createdAt: string;
  completedAt?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'cancelled';
  
  // Input summary
  inputSummary: {
    topic: string;
    inputSource: string;
    industryCategory: string;
    segment: string;
  };
  
  // Configuration
  config: {
    slideCount: number;
    outputType: string;
    languages: string[];
    includeVoiceover: boolean;
    includeMusic: boolean;
    resolution: string;
    frameworks: string[];
  };
  
  // Estimated costs (pre-generation)
  estimated: {
    totalTokens: number;
    totalCredits: number;
    confidenceLevel: 'low' | 'medium' | 'high';
    confidencePercent: number;
    range: { min: number; max: number };
    breakdown: TokenBreakdown[];
  };
  
  // Actual costs (post-generation)
  actual?: {
    totalTokens: number;
    totalCredits: number;
    breakdown: ActualUsageBreakdown[];
    durationMs: number;
    slidesGenerated: number;
  };
  
  // Comparison metrics
  comparison?: {
    tokenDifference: number;
    tokenDifferencePercent: number;
    creditDifference: number;
    withinEstimatedRange: boolean;
    accuracyScore: number; // 0-100
  };
}

export interface ActualUsageBreakdown {
  category: string;
  subcategory: string;
  tokens: number;
  credits: number;
  model: string;
  elementCount: number;
  timestamp: string;
}

// Local storage key for generation history
const HISTORY_STORAGE_KEY = 'genie_deck_generation_history';
const MAX_HISTORY_ITEMS = 50;

/**
 * Start tracking a new generation
 */
export function startGeneration(
  estimate: TokenEstimate,
  config: GenerationRecord['config'],
  inputSummary: GenerationRecord['inputSummary']
): GenerationRecord {
  const record: GenerationRecord = {
    id: crypto.randomUUID(),
    userId: '', // Will be set from auth
    createdAt: new Date().toISOString(),
    status: 'generating',
    inputSummary,
    config,
    estimated: {
      totalTokens: estimate.totalTokens,
      totalCredits: estimate.totalCredits,
      confidenceLevel: estimate.confidenceLevel,
      confidencePercent: estimate.confidencePercent,
      range: estimate.estimatedRange,
      breakdown: estimate.breakdown,
    },
  };

  // Save to local storage
  saveToHistory(record);
  
  return record;
}

/**
 * Complete a generation with actual usage data
 */
export function completeGeneration(
  recordId: string,
  actualUsage: GenerationRecord['actual']
): GenerationRecord | null {
  const history = getGenerationHistory();
  const recordIndex = history.findIndex(r => r.id === recordId);
  
  if (recordIndex === -1) return null;
  
  const record = history[recordIndex];
  record.status = 'completed';
  record.completedAt = new Date().toISOString();
  record.actual = actualUsage;
  
  // Calculate comparison metrics
  if (actualUsage) {
    const tokenDiff = actualUsage.totalTokens - record.estimated.totalTokens;
    const tokenDiffPercent = (tokenDiff / record.estimated.totalTokens) * 100;
    const creditDiff = actualUsage.totalCredits - record.estimated.totalCredits;
    
    const withinRange = actualUsage.totalTokens >= record.estimated.range.min && 
                        actualUsage.totalTokens <= record.estimated.range.max;
    
    // Accuracy score: 100 if exact, decreasing with variance
    const accuracyScore = Math.max(0, 100 - Math.abs(tokenDiffPercent));
    
    record.comparison = {
      tokenDifference: tokenDiff,
      tokenDifferencePercent: Math.round(tokenDiffPercent * 10) / 10,
      creditDifference: creditDiff,
      withinEstimatedRange: withinRange,
      accuracyScore: Math.round(accuracyScore),
    };
  }
  
  history[recordIndex] = record;
  saveHistoryToStorage(history);
  
  return record;
}

/**
 * Mark a generation as failed
 */
export function failGeneration(recordId: string, error?: string): void {
  const history = getGenerationHistory();
  const record = history.find(r => r.id === recordId);
  
  if (record) {
    record.status = 'failed';
    record.completedAt = new Date().toISOString();
    saveHistoryToStorage(history);
  }
}

/**
 * Mark a generation as cancelled
 */
export function cancelGeneration(recordId: string, partialUsage?: Partial<GenerationRecord['actual']>): void {
  const history = getGenerationHistory();
  const record = history.find(r => r.id === recordId);
  
  if (record) {
    record.status = 'cancelled';
    record.completedAt = new Date().toISOString();
    if (partialUsage) {
      record.actual = partialUsage as GenerationRecord['actual'];
    }
    saveHistoryToStorage(history);
  }
}

/**
 * Get generation history from local storage
 */
export function getGenerationHistory(): GenerationRecord[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as GenerationRecord[];
  } catch {
    return [];
  }
}

/**
 * Get last N generations
 */
export function getRecentGenerations(count: number = 2): GenerationRecord[] {
  const history = getGenerationHistory();
  return history
    .filter(r => r.status === 'completed' || r.status === 'generating')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, count);
}

/**
 * Get aggregated usage statistics
 */
export function getUsageStatistics(): {
  totalGenerations: number;
  completedGenerations: number;
  totalCreditsUsed: number;
  totalTokensUsed: number;
  averageAccuracy: number;
  mostUsedOutputType: string;
  averageSlideCount: number;
} {
  const history = getGenerationHistory();
  const completed = history.filter(r => r.status === 'completed' && r.actual);
  
  if (completed.length === 0) {
    return {
      totalGenerations: history.length,
      completedGenerations: 0,
      totalCreditsUsed: 0,
      totalTokensUsed: 0,
      averageAccuracy: 0,
      mostUsedOutputType: 'N/A',
      averageSlideCount: 0,
    };
  }
  
  const totalCredits = completed.reduce((sum, r) => sum + (r.actual?.totalCredits || 0), 0);
  const totalTokens = completed.reduce((sum, r) => sum + (r.actual?.totalTokens || 0), 0);
  const avgAccuracy = completed.reduce((sum, r) => sum + (r.comparison?.accuracyScore || 0), 0) / completed.length;
  
  // Find most used output type
  const outputTypeCounts = completed.reduce((acc, r) => {
    acc[r.config.outputType] = (acc[r.config.outputType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostUsedOutputType = Object.entries(outputTypeCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  
  const avgSlideCount = completed.reduce((sum, r) => sum + r.config.slideCount, 0) / completed.length;
  
  return {
    totalGenerations: history.length,
    completedGenerations: completed.length,
    totalCreditsUsed: totalCredits,
    totalTokensUsed: totalTokens,
    averageAccuracy: Math.round(avgAccuracy),
    mostUsedOutputType,
    averageSlideCount: Math.round(avgSlideCount),
  };
}

/**
 * Clear generation history
 */
export function clearHistory(): void {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}

// Internal helpers

function saveToHistory(record: GenerationRecord): void {
  const history = getGenerationHistory();
  history.unshift(record);
  
  // Keep only the last MAX_HISTORY_ITEMS
  if (history.length > MAX_HISTORY_ITEMS) {
    history.length = MAX_HISTORY_ITEMS;
  }
  
  saveHistoryToStorage(history);
}

function saveHistoryToStorage(history: GenerationRecord[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save generation history:', error);
  }
}

export const generationHistoryService = {
  startGeneration,
  completeGeneration,
  failGeneration,
  cancelGeneration,
  getGenerationHistory,
  getRecentGenerations,
  getUsageStatistics,
  clearHistory,
};

export default generationHistoryService;
