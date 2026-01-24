/**
 * USE LOOP AGENT SELF-CORRECTION HOOK
 * 
 * React hook for integrating LoopAgent self-correction into components
 * Provides 98%+ automation through Generator/Verifier loops
 */

import { useState, useCallback, useRef } from 'react';
import { useMasterToast } from './useMasterToast';
import {
  loopAgentEngine,
  LoopAgentResult,
  LoopIteration,
  QualityRubric,
  GeneratorFunction,
} from '@/services/executionEngines/LoopAgentSelfCorrectionEngine';
import {
  executeWithSelfCorrection,
  getBoostedAutomationLevel,
  isHardwareDependent,
  getAutomationStats,
} from '@/services/executionEngines/pipelineAutomationBooster';

export interface UseLoopAgentOptions {
  /** Custom quality rubrics */
  customRubrics?: QualityRubric[];
  /** Show toast notifications */
  showNotifications?: boolean;
  /** Callback on iteration complete */
  onIterationComplete?: (iteration: LoopIteration) => void;
  /** Callback on complete */
  onComplete?: (result: LoopAgentResult) => void;
}

export interface UseLoopAgentReturn {
  /** Execute pipeline with self-correction */
  execute: (
    pipelineId: string,
    pipelineCategory: string,
    inputData: any,
    generator: GeneratorFunction
  ) => Promise<LoopAgentResult | null>;
  
  /** Current execution state */
  isExecuting: boolean;
  
  /** Current iteration number */
  currentIteration: number;
  
  /** Latest result */
  result: LoopAgentResult | null;
  
  /** All iterations from last execution */
  iterations: LoopIteration[];
  
  /** Current quality score */
  currentScore: number;
  
  /** Target automation level for a pipeline */
  getTargetAutomation: (pipelineId: string) => number;
  
  /** Check if pipeline is hardware-dependent */
  isHardwareDependent: (pipelineId: string) => boolean;
  
  /** Get overall automation stats */
  getStats: () => ReturnType<typeof getAutomationStats>;
  
  /** Reset state */
  reset: () => void;
  
  /** Error if any */
  error: Error | null;
}

export function useLoopAgentSelfCorrection(
  options: UseLoopAgentOptions = {}
): UseLoopAgentReturn {
  const { showNotifications = true, customRubrics, onIterationComplete, onComplete } = options;
  const { showSuccess, showError, showInfo } = useMasterToast();
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [result, setResult] = useState<LoopAgentResult | null>(null);
  const [iterations, setIterations] = useState<LoopIteration[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  
  const abortRef = useRef(false);
  
  // Listen to engine events
  const setupListeners = useCallback(() => {
    const handleIteration = ({ iteration }: { iteration: LoopIteration }) => {
      if (abortRef.current) return;
      
      setCurrentIteration(iteration.iteration);
      setIterations(prev => [...prev, iteration]);
      setCurrentScore(iteration.overallScore);
      
      onIterationComplete?.(iteration);
    };
    
    const handleCompleted = ({ success }: { success: boolean }) => {
      if (showNotifications) {
        if (success) {
          showSuccess('Self-correction complete', 'Quality target achieved');
        } else {
          showInfo('Self-correction finished', 'Best result returned');
        }
      }
    };
    
    loopAgentEngine.on('iteration', handleIteration);
    loopAgentEngine.on('completed', handleCompleted);
    
    return () => {
      loopAgentEngine.off('iteration', handleIteration);
      loopAgentEngine.off('completed', handleCompleted);
    };
  }, [showNotifications, showSuccess, showInfo, onIterationComplete]);
  
  const execute = useCallback(async (
    pipelineId: string,
    pipelineCategory: string,
    inputData: any,
    generator: GeneratorFunction
  ): Promise<LoopAgentResult | null> => {
    setIsExecuting(true);
    setCurrentIteration(0);
    setIterations([]);
    setCurrentScore(0);
    setError(null);
    setResult(null);
    abortRef.current = false;
    
    const cleanup = setupListeners();
    
    try {
      const targetAutomation = getBoostedAutomationLevel(pipelineId);
      
      if (showNotifications) {
        showInfo(
          'Starting self-correction',
          `Target: ${targetAutomation}%+ automation`
        );
      }
      
      const loopResult = await executeWithSelfCorrection(
        pipelineId,
        pipelineCategory,
        inputData,
        generator,
        customRubrics
      );
      
      if (abortRef.current) {
        return null;
      }
      
      setResult(loopResult);
      onComplete?.(loopResult);
      
      if (showNotifications) {
        if (loopResult.success) {
          showSuccess(
            'Quality target achieved!',
            `Final score: ${loopResult.finalScore.toFixed(1)}% in ${loopResult.totalIterations} iterations`
          );
        } else {
          showError(
            'Quality target not met',
            `Best score: ${loopResult.finalScore.toFixed(1)}% after ${loopResult.totalIterations} attempts`
          );
        }
      }
      
      return loopResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (showNotifications) {
        showError('Self-correction failed', error.message);
      }
      
      return null;
    } finally {
      setIsExecuting(false);
      cleanup();
    }
  }, [showNotifications, showSuccess, showError, showInfo, customRubrics, onComplete, setupListeners]);
  
  const reset = useCallback(() => {
    abortRef.current = true;
    setIsExecuting(false);
    setCurrentIteration(0);
    setIterations([]);
    setCurrentScore(0);
    setResult(null);
    setError(null);
  }, []);
  
  return {
    execute,
    isExecuting,
    currentIteration,
    result,
    iterations,
    currentScore,
    getTargetAutomation: getBoostedAutomationLevel,
    isHardwareDependent,
    getStats: getAutomationStats,
    reset,
    error,
  };
}

export default useLoopAgentSelfCorrection;
