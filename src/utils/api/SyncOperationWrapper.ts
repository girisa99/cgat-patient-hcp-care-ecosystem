
/**
 * Sync Operation Wrapper
 * Provides consistent error handling and retry logic for sync operations
 */

import { apiSyncErrorHandler, SyncError } from './ApiSyncErrorHandler';

export interface SyncOperationOptions {
  maxRetries?: number;
  baseDelay?: number;
  timeout?: number;
  skipRetryOn?: string[];
}

export interface SyncOperationResult<T> {
  success: boolean;
  data?: T;
  error?: SyncError;
  retryCount: number;
  totalTime: number;
}

class SyncOperationWrapper {
  /**
   * Execute sync operation with error handling and retry logic
   */
  async execute<T>(
    operation: () => Promise<T>,
    operationName: string,
    options: SyncOperationOptions = {}
  ): Promise<SyncOperationResult<T>> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      timeout = 30000,
      skipRetryOn = []
    } = options;

    const startTime = Date.now();
    let retryCount = 0;
    let lastError: SyncError | undefined;

    while (retryCount <= maxRetries) {
      try {
        console.log(`🔄 Executing ${operationName} (attempt ${retryCount + 1}/${maxRetries + 1})`);
        
        // Execute with timeout
        const result = await this.executeWithTimeout(operation, timeout);
        
        const totalTime = Date.now() - startTime;
        console.log(`✅ ${operationName} completed successfully in ${totalTime}ms`);
        
        return {
          success: true,
          data: result,
          retryCount,
          totalTime
        };

      } catch (error) {
        console.error(`❌ ${operationName} failed on attempt ${retryCount + 1}:`, error);
        
        lastError = apiSyncErrorHandler.handleError(error, operationName, {
          attempt: retryCount + 1,
          maxRetries: maxRetries + 1
        });

        // Check if we should skip retry for this error type
        if (skipRetryOn.includes(lastError.code)) {
          console.log(`⏭️ Skipping retry for ${operationName} due to error type: ${lastError.code}`);
          break;
        }

        // Check if we should retry
        if (retryCount >= maxRetries || !lastError.retryable) {
          console.log(`🛑 No more retries for ${operationName}`);
          break;
        }

        // Calculate delay and wait
        const delay = apiSyncErrorHandler.getRetryDelay(operationName, baseDelay);
        console.log(`⏳ Retrying ${operationName} in ${delay}ms...`);
        await this.delay(delay);
        
        retryCount++;
      }
    }

    const totalTime = Date.now() - startTime;
    console.error(`💥 ${operationName} failed after ${retryCount} retries in ${totalTime}ms`);
    
    return {
      success: false,
      error: lastError,
      retryCount,
      totalTime
    };
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);

      operation()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute multiple operations in parallel with error handling
   */
  async executeParallel<T>(
    operations: Array<{ name: string; operation: () => Promise<T> }>,
    options: SyncOperationOptions = {}
  ): Promise<Array<SyncOperationResult<T>>> {
    console.log(`🔄 Executing ${operations.length} operations in parallel`);
    
    const promises = operations.map(({ name, operation }) =>
      this.execute(operation, name, options)
    );

    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const error = apiSyncErrorHandler.handleError(
          result.reason,
          operations[index].name,
          { parallelExecution: true }
        );
        
        return {
          success: false,
          error,
          retryCount: 0,
          totalTime: 0
        };
      }
    });
  }

  /**
   * Execute operations in sequence with error handling
   */
  async executeSequential<T>(
    operations: Array<{ name: string; operation: () => Promise<T> }>,
    options: SyncOperationOptions = {}
  ): Promise<Array<SyncOperationResult<T>>> {
    console.log(`🔄 Executing ${operations.length} operations sequentially`);
    
    const results: Array<SyncOperationResult<T>> = [];
    
    for (const { name, operation } of operations) {
      const result = await this.execute(operation, name, options);
      results.push(result);
      
      // Stop if operation failed and it's critical
      if (!result.success && result.error && !result.error.retryable) {
        console.log(`🛑 Stopping sequential execution due to critical error in ${name}`);
        break;
      }
    }
    
    return results;
  }
}

export const syncOperationWrapper = new SyncOperationWrapper();
