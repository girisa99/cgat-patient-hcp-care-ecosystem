/**
 * Auto-Healing Pipelines Service - P4-REC-10
 * Self-correcting generation flows with automatic recovery strategies
 */

import { circuitBreakerService } from './circuitBreakerService';
import { gracefulDegradationService } from './gracefulDegradationService';
import { apiSyncErrorHandler } from '@/utils/api/ApiSyncErrorHandler';

export type HealingStrategy = 
  | 'retry'           // Simple retry with backoff
  | 'fallback'        // Use alternative provider
  | 'degrade'         // Reduce quality tier
  | 'skip'            // Skip non-critical step
  | 'checkpoint'      // Resume from last checkpoint
  | 'reconstruct';    // Rebuild from partial data

export interface HealingAction {
  strategy: HealingStrategy;
  targetStep: string;
  originalError: string;
  healingAttempt: number;
  maxAttempts: number;
  success: boolean;
  resultMessage: string;
  timestamp: Date;
}

export interface PipelineCheckpoint {
  stepId: string;
  stepName: string;
  data: any;
  timestamp: Date;
  isRecoverable: boolean;
}

export interface HealingConfig {
  maxRetries: number;
  enableFallback: boolean;
  enableDegradation: boolean;
  enableSkip: boolean;
  criticalSteps: string[];
  checkpointInterval: number; // ms between checkpoints
}

const DEFAULT_CONFIG: HealingConfig = {
  maxRetries: 3,
  enableFallback: true,
  enableDegradation: true,
  enableSkip: true,
  criticalSteps: ['authentication', 'payment', 'final_render'],
  checkpointInterval: 5000
};

class AutoHealingService {
  private checkpoints: Map<string, PipelineCheckpoint[]> = new Map();
  private healingHistory: HealingAction[] = [];
  private config: HealingConfig = DEFAULT_CONFIG;
  private listeners: ((action: HealingAction) => void)[] = [];

  /**
   * Configure auto-healing behavior
   */
  configure(config: Partial<HealingConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('🔧 Auto-healing configured:', this.config);
  }

  /**
   * Create a checkpoint for a pipeline step
   */
  createCheckpoint(pipelineId: string, checkpoint: Omit<PipelineCheckpoint, 'timestamp'>): void {
    const existing = this.checkpoints.get(pipelineId) || [];
    existing.push({
      ...checkpoint,
      timestamp: new Date()
    });
    
    // Keep only last 10 checkpoints per pipeline
    if (existing.length > 10) {
      existing.shift();
    }
    
    this.checkpoints.set(pipelineId, existing);
    console.log(`📍 Checkpoint created for ${pipelineId}:${checkpoint.stepId}`);
  }

  /**
   * Get latest recoverable checkpoint
   */
  getLatestCheckpoint(pipelineId: string): PipelineCheckpoint | null {
    const checkpoints = this.checkpoints.get(pipelineId) || [];
    const recoverable = checkpoints.filter(cp => cp.isRecoverable);
    return recoverable.length > 0 ? recoverable[recoverable.length - 1] : null;
  }

  /**
   * Attempt to heal a failed pipeline step
   */
  async heal(
    pipelineId: string,
    stepId: string,
    error: Error,
    context: {
      provider?: string;
      qualityTier?: string;
      isCritical?: boolean;
      partialData?: any;
    } = {}
  ): Promise<HealingAction> {
    const strategy = this.determineStrategy(stepId, error, context);
    const attemptCount = this.getAttemptCount(pipelineId, stepId);
    
    const action: HealingAction = {
      strategy,
      targetStep: stepId,
      originalError: error.message,
      healingAttempt: attemptCount + 1,
      maxAttempts: this.config.maxRetries,
      success: false,
      resultMessage: '',
      timestamp: new Date()
    };

    try {
      switch (strategy) {
        case 'retry':
          action.success = await this.executeRetry(pipelineId, stepId, context);
          action.resultMessage = action.success ? 'Retry successful' : 'Retry failed';
          break;

        case 'fallback':
          action.success = await this.executeFallback(context.provider || 'unknown');
          action.resultMessage = action.success ? 'Fallback provider activated' : 'No fallback available';
          break;

        case 'degrade':
          action.success = await this.executeDegradation(context.qualityTier || 'standard');
          action.resultMessage = action.success ? 'Quality degraded successfully' : 'Cannot degrade further';
          break;

        case 'skip':
          action.success = !context.isCritical;
          action.resultMessage = action.success ? 'Step skipped (non-critical)' : 'Cannot skip critical step';
          break;

        case 'checkpoint':
          const checkpoint = this.getLatestCheckpoint(pipelineId);
          action.success = checkpoint !== null;
          action.resultMessage = checkpoint 
            ? `Resuming from checkpoint: ${checkpoint.stepName}`
            : 'No checkpoint available';
          break;

        case 'reconstruct':
          action.success = context.partialData !== undefined;
          action.resultMessage = action.success 
            ? 'Reconstructed from partial data' 
            : 'No partial data for reconstruction';
          break;
      }
    } catch (healError) {
      action.success = false;
      action.resultMessage = `Healing failed: ${(healError as Error).message}`;
    }

    this.healingHistory.push(action);
    this.notifyListeners(action);
    
    console.log(`🏥 Auto-healing ${action.success ? '✅' : '❌'}:`, action);
    return action;
  }

  /**
   * Determine the best healing strategy based on error type and context
   */
  private determineStrategy(
    stepId: string, 
    error: Error, 
    context: { provider?: string; isCritical?: boolean; partialData?: any }
  ): HealingStrategy {
    const errorMessage = error.message.toLowerCase();
    const isCritical = context.isCritical || this.config.criticalSteps.includes(stepId);

    // Check if provider is available via circuit breaker
    if (context.provider) {
      const isAvailable = circuitBreakerService.isAvailable(context.provider);
      if (!isAvailable && this.config.enableFallback) {
        return 'fallback';
      }
    }

    // Rate limit or quota errors - degrade quality
    if ((errorMessage.includes('rate limit') || errorMessage.includes('quota')) && this.config.enableDegradation) {
      return 'degrade';
    }

    // Network errors - retry
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      return 'retry';
    }

    // Partial data available - reconstruct
    if (context.partialData) {
      return 'reconstruct';
    }

    // Non-critical step - skip
    if (!isCritical && this.config.enableSkip) {
      return 'skip';
    }

    // Check for checkpoint
    if (this.checkpoints.size > 0) {
      return 'checkpoint';
    }

    // Default to retry
    return 'retry';
  }

  /**
   * Execute retry with exponential backoff
   */
  private async executeRetry(pipelineId: string, stepId: string, context: any): Promise<boolean> {
    const delay = apiSyncErrorHandler.getRetryDelay(`${pipelineId}:${stepId}`);
    const shouldRetry = apiSyncErrorHandler.shouldRetry(`${pipelineId}:${stepId}`, this.config.maxRetries);
    
    if (!shouldRetry) {
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, delay));
    return true; // Actual retry would be handled by caller
  }

  /**
   * Execute fallback to alternative provider
   */
  private async executeFallback(provider: string): Promise<boolean> {
    // Try to get best available provider from degradation service
    const fallback = gracefulDegradationService.getBestAvailableProvider('llm_text');
    return fallback !== null;
  }

  /**
   * Execute quality degradation
   */
  private async executeDegradation(currentTier: string): Promise<boolean> {
    // Try to get a lower tier provider
    const tierOrder = ['premium', 'standard', 'basic', 'minimal'];
    const currentIndex = tierOrder.indexOf(currentTier);
    
    if (currentIndex < tierOrder.length - 1) {
      const nextTier = tierOrder[currentIndex + 1];
      const degradedProvider = gracefulDegradationService.getBestAvailableProvider('llm_text', nextTier as any);
      return degradedProvider !== null;
    }
    
    return false;
  }

  /**
   * Get attempt count for a specific step
   */
  private getAttemptCount(pipelineId: string, stepId: string): number {
    return this.healingHistory.filter(
      h => h.targetStep === stepId && h.timestamp > new Date(Date.now() - 60000)
    ).length;
  }

  /**
   * Subscribe to healing events
   */
  onHealing(callback: (action: HealingAction) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(action: HealingAction): void {
    this.listeners.forEach(l => l(action));
  }

  /**
   * Get healing statistics
   */
  getStats(): {
    totalAttempts: number;
    successRate: number;
    byStrategy: Record<HealingStrategy, { attempts: number; successes: number }>;
    recentActions: HealingAction[];
  } {
    const stats: Record<HealingStrategy, { attempts: number; successes: number }> = {
      retry: { attempts: 0, successes: 0 },
      fallback: { attempts: 0, successes: 0 },
      degrade: { attempts: 0, successes: 0 },
      skip: { attempts: 0, successes: 0 },
      checkpoint: { attempts: 0, successes: 0 },
      reconstruct: { attempts: 0, successes: 0 }
    };

    this.healingHistory.forEach(action => {
      stats[action.strategy].attempts++;
      if (action.success) {
        stats[action.strategy].successes++;
      }
    });

    const totalAttempts = this.healingHistory.length;
    const totalSuccesses = this.healingHistory.filter(h => h.success).length;

    return {
      totalAttempts,
      successRate: totalAttempts > 0 ? (totalSuccesses / totalAttempts) * 100 : 0,
      byStrategy: stats,
      recentActions: this.healingHistory.slice(-10)
    };
  }

  /**
   * Clear healing history
   */
  clearHistory(): void {
    this.healingHistory = [];
    this.checkpoints.clear();
    console.log('🧹 Healing history cleared');
  }
}

export const autoHealingService = new AutoHealingService();
