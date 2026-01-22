/**
 * Error Recovery Hook for Universal Editor
 * Handles pipeline failures with partial result recovery and retry logic
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { PipelineStage, ActivePipeline, UniversalElement } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface RecoveryCheckpoint {
  id: string;
  pipelineId: string;
  stageId: string;
  stageName: string;
  timestamp: string;
  elementsSnapshot: UniversalElement[];
  stageOutputs: Record<string, unknown>;
  status: 'completed' | 'partial' | 'failed';
}

export interface RecoveryState {
  isRecovering: boolean;
  lastCheckpoint: RecoveryCheckpoint | null;
  failedStages: PipelineStage[];
  partialResults: Record<string, unknown>;
  canRetry: boolean;
  canResume: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
  retryableErrors: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  backoffMultiplier: 2,
  maxBackoffMs: 30000,
  retryableErrors: [
    'TIMEOUT',
    'RATE_LIMIT',
    'SERVICE_UNAVAILABLE',
    'NETWORK_ERROR',
    'PROVIDER_ERROR',
  ],
};

// ============================================================================
// HOOK
// ============================================================================

export function useErrorRecovery(retryConfig: Partial<RetryConfig> = {}) {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  
  const [state, setState] = useState<RecoveryState>({
    isRecovering: false,
    lastCheckpoint: null,
    failedStages: [],
    partialResults: {},
    canRetry: false,
    canResume: false,
  });

  const checkpointsRef = useRef<Map<string, RecoveryCheckpoint>>(new Map());
  const retryCountRef = useRef<Map<string, number>>(new Map());

  // ============================================================================
  // CHECKPOINT MANAGEMENT
  // ============================================================================

  const createCheckpoint = useCallback((
    pipeline: ActivePipeline,
    stage: PipelineStage,
    elements: UniversalElement[],
    outputs: Record<string, unknown>
  ): RecoveryCheckpoint => {
    const checkpoint: RecoveryCheckpoint = {
      id: `checkpoint_${pipeline.template.id}_${stage.id}_${Date.now()}`,
      pipelineId: pipeline.template.id,
      stageId: stage.id,
      stageName: stage.name,
      timestamp: new Date().toISOString(),
      elementsSnapshot: JSON.parse(JSON.stringify(elements)), // Deep clone
      stageOutputs: outputs,
      status: stage.status === 'completed' ? 'completed' : 'partial',
    };

    checkpointsRef.current.set(stage.id, checkpoint);
    
    setState(prev => ({
      ...prev,
      lastCheckpoint: checkpoint,
      partialResults: {
        ...prev.partialResults,
        [stage.id]: outputs,
      },
    }));

    // Also persist to localStorage for crash recovery
    try {
      const storageKey = `editor_checkpoint_${pipeline.template.id}`;
      const existingData = localStorage.getItem(storageKey);
      const checkpoints = existingData ? JSON.parse(existingData) : {};
      checkpoints[stage.id] = checkpoint;
      localStorage.setItem(storageKey, JSON.stringify(checkpoints));
    } catch (e) {
      console.warn('Failed to persist checkpoint to localStorage:', e);
    }

    return checkpoint;
  }, []);

  const getCheckpoint = useCallback((stageId: string): RecoveryCheckpoint | null => {
    return checkpointsRef.current.get(stageId) || null;
  }, []);

  const getLastSuccessfulCheckpoint = useCallback((pipelineId: string): RecoveryCheckpoint | null => {
    const checkpoints = Array.from(checkpointsRef.current.values())
      .filter(cp => cp.pipelineId === pipelineId && cp.status === 'completed')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return checkpoints[0] || null;
  }, []);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  const handleStageError = useCallback((
    stage: PipelineStage,
    error: Error,
    pipeline: ActivePipeline
  ): { shouldRetry: boolean; nextAction: 'retry' | 'skip' | 'abort' | 'resume' } => {
    const errorType = categorizeError(error);
    const retryCount = retryCountRef.current.get(stage.id) || 0;

    setState(prev => ({
      ...prev,
      failedStages: [...prev.failedStages.filter(s => s.id !== stage.id), { ...stage, error: error.message }],
    }));

    // Check if error is retryable
    const isRetryable = config.retryableErrors.some(e => 
      error.message.includes(e) || errorType === e
    );

    if (isRetryable && retryCount < config.maxRetries) {
      retryCountRef.current.set(stage.id, retryCount + 1);
      setState(prev => ({ ...prev, canRetry: true }));
      return { shouldRetry: true, nextAction: 'retry' };
    }

    // Check if stage is optional (can skip)
    if (stage.isOptional) {
      return { shouldRetry: false, nextAction: 'skip' };
    }

    // Check if we have a checkpoint to resume from
    const checkpoint = getLastSuccessfulCheckpoint(pipeline.template.id);
    if (checkpoint) {
      setState(prev => ({ ...prev, canResume: true }));
      return { shouldRetry: false, nextAction: 'resume' };
    }

    return { shouldRetry: false, nextAction: 'abort' };
  }, [config.retryableErrors, config.maxRetries, getLastSuccessfulCheckpoint]);

  // ============================================================================
  // RETRY LOGIC
  // ============================================================================

  const retryStage = useCallback(async (
    stage: PipelineStage,
    executeStage: (stage: PipelineStage) => Promise<Record<string, unknown>>
  ): Promise<{ success: boolean; outputs?: Record<string, unknown> }> => {
    const retryCount = retryCountRef.current.get(stage.id) || 0;
    const backoffMs = Math.min(
      Math.pow(config.backoffMultiplier, retryCount) * 1000,
      config.maxBackoffMs
    );

    setState(prev => ({ ...prev, isRecovering: true }));

    // Wait with backoff
    await new Promise(resolve => setTimeout(resolve, backoffMs));

    try {
      const outputs = await executeStage(stage);
      
      // Success - reset retry count
      retryCountRef.current.set(stage.id, 0);
      setState(prev => ({
        ...prev,
        isRecovering: false,
        failedStages: prev.failedStages.filter(s => s.id !== stage.id),
        canRetry: false,
      }));

      toast.success(`Stage "${stage.name}" recovered successfully`);
      return { success: true, outputs };
    } catch (error) {
      setState(prev => ({ ...prev, isRecovering: false }));
      
      if (retryCount + 1 < config.maxRetries) {
        toast.warning(`Retry ${retryCount + 1}/${config.maxRetries} for "${stage.name}"`, {
          description: 'Will retry automatically...',
        });
      } else {
        toast.error(`Stage "${stage.name}" failed after ${config.maxRetries} retries`);
      }
      
      return { success: false };
    }
  }, [config.backoffMultiplier, config.maxBackoffMs, config.maxRetries]);

  // ============================================================================
  // RESUME FROM CHECKPOINT
  // ============================================================================

  const resumeFromCheckpoint = useCallback(async (
    checkpoint: RecoveryCheckpoint,
    pipeline: ActivePipeline,
    onRestore: (elements: UniversalElement[], startFromStage: string) => void
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isRecovering: true }));

    try {
      // Find the stage index to resume from
      const stageIndex = pipeline.stages.findIndex(s => s.id === checkpoint.stageId);
      
      if (stageIndex === -1) {
        throw new Error('Checkpoint stage not found in pipeline');
      }

      // Restore elements from checkpoint
      onRestore(checkpoint.elementsSnapshot, checkpoint.stageId);

      // Clear failed stages up to this point
      setState(prev => ({
        ...prev,
        isRecovering: false,
        failedStages: prev.failedStages.filter(s => {
          const failedIndex = pipeline.stages.findIndex(ps => ps.id === s.id);
          return failedIndex > stageIndex;
        }),
        canResume: false,
      }));

      toast.success(`Resumed from "${checkpoint.stageName}"`, {
        description: `Skipped to stage ${stageIndex + 1} of ${pipeline.stages.length}`,
      });

      return true;
    } catch (error) {
      console.error('Resume failed:', error);
      setState(prev => ({ ...prev, isRecovering: false }));
      toast.error('Failed to resume from checkpoint');
      return false;
    }
  }, []);

  // ============================================================================
  // PARTIAL RESULT RECOVERY
  // ============================================================================

  const getPartialResults = useCallback((): {
    completedStages: string[];
    outputs: Record<string, unknown>;
    elements: UniversalElement[];
  } => {
    const completedStages = Array.from(checkpointsRef.current.entries())
      .filter(([, cp]) => cp.status === 'completed')
      .map(([stageId]) => stageId);

    const lastCompleted = getLastSuccessfulCheckpoint('');

    return {
      completedStages,
      outputs: state.partialResults,
      elements: lastCompleted?.elementsSnapshot || [],
    };
  }, [state.partialResults, getLastSuccessfulCheckpoint]);

  const savePartialResults = useCallback(async (
    pipelineId: string,
    projectId: string
  ): Promise<boolean> => {
    try {
      const partialData = getPartialResults();
      
      // Save to localStorage for immediate recovery
      localStorage.setItem(`editor_partial_${projectId}`, JSON.stringify({
        pipelineId,
        ...partialData,
        savedAt: new Date().toISOString(),
      }));

      toast.info('Partial progress saved', {
        description: `${partialData.completedStages.length} stages completed`,
      });

      return true;
    } catch (error) {
      console.error('Failed to save partial results:', error);
      return false;
    }
  }, [getPartialResults]);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  const clearRecoveryState = useCallback((pipelineId?: string) => {
    if (pipelineId) {
      // Clear specific pipeline
      checkpointsRef.current.forEach((cp, key) => {
        if (cp.pipelineId === pipelineId) {
          checkpointsRef.current.delete(key);
          retryCountRef.current.delete(key);
        }
      });
      localStorage.removeItem(`editor_checkpoint_${pipelineId}`);
    } else {
      // Clear all
      checkpointsRef.current.clear();
      retryCountRef.current.clear();
    }

    setState({
      isRecovering: false,
      lastCheckpoint: null,
      failedStages: [],
      partialResults: {},
      canRetry: false,
      canResume: false,
    });
  }, []);

  return {
    state,
    createCheckpoint,
    getCheckpoint,
    getLastSuccessfulCheckpoint,
    handleStageError,
    retryStage,
    resumeFromCheckpoint,
    getPartialResults,
    savePartialResults,
    clearRecoveryState,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function categorizeError(error: Error): string {
  const message = error.message.toLowerCase();
  
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'TIMEOUT';
  }
  if (message.includes('rate limit') || message.includes('429')) {
    return 'RATE_LIMIT';
  }
  if (message.includes('503') || message.includes('service unavailable')) {
    return 'SERVICE_UNAVAILABLE';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'NETWORK_ERROR';
  }
  if (message.includes('provider') || message.includes('api error')) {
    return 'PROVIDER_ERROR';
  }
  
  return 'UNKNOWN';
}
