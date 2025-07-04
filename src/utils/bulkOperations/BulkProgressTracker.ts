/**
 * Tracks progress of bulk operations
 */

import { BulkOperation, BulkOperationResult, DatabaseRecord } from './types';

// Batch executor function type
export type BatchExecutor<T extends DatabaseRecord = DatabaseRecord> = (batch: T[]) => Promise<{
  data?: T[];
  error?: Error;
}>;

export class BulkProgressTracker {
  /**
   * Process bulk operation with progress tracking and batching
   */
  async processBulkOperation<T extends DatabaseRecord = DatabaseRecord>(
    config: BulkOperation<T>,
    executeBatch: BatchExecutor<T>,
    defaultBatchSize: number = 100
  ): Promise<BulkOperationResult<T>> {
    const startTime = Date.now();
    const results: T[] = [];
    const errors: Error[] = [];
    let processedCount = 0;

    console.log(`📦 Executing bulk ${config.operation} for ${config.tableName} (${config.data.length} items)`);

    try {
      const batchSize = config.batchSize || defaultBatchSize;
      const totalBatches = Math.ceil(config.data.length / batchSize);

      for (let i = 0; i < config.data.length; i += batchSize) {
        const batch = config.data.slice(i, i + batchSize);
        const currentBatch = Math.floor(i / batchSize) + 1;

        try {
          const batchResult = await executeBatch(batch);

          if (batchResult.data) {
            results.push(...batchResult.data);
            processedCount += batch.length;
          }

          // Report progress
          const progress = (currentBatch / totalBatches) * 100;
          config.onProgress?.(progress);

          console.log(`✅ Batch ${currentBatch}/${totalBatches} completed (${batch.length} items)`);

        } catch (error) {
          console.error(`❌ Batch ${currentBatch} failed:`, error);
          errors.push(error as Error);
        }

        // Small delay to prevent overwhelming the database
        if (currentBatch < totalBatches) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const result: BulkOperationResult<T> = {
        success: errors.length === 0,
        processedCount,
        errorCount: errors.length,
        results,
        errors,
        duration: Date.now() - startTime
      };

      console.log(`📊 Bulk operation completed:`, result);
      
      config.onComplete?.(results);
      return result;

    } catch (error) {
      const errorResult: BulkOperationResult<T> = {
        success: false,
        processedCount,
        errorCount: 1,
        results,
        errors: [error as Error],
        duration: Date.now() - startTime
      };

      config.onError?.(error as Error);
      return errorResult;
    }
  }
}
