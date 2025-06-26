
/**
 * Main Bulk Operations Manager
 * Coordinates all bulk operation functionality
 */

import { BulkModuleDetector } from './BulkModuleDetector';
import { BulkBatchExecutor } from './BulkBatchExecutor';
import { BulkProgressTracker } from './BulkProgressTracker';
import { BulkOperation, BulkOperationResult } from './types';

class BulkOperationsManager {
  private moduleDetector: BulkModuleDetector;
  private batchExecutor: BulkBatchExecutor;
  private progressTracker: BulkProgressTracker;
  private operations: Map<string, BulkOperation> = new Map();
  private defaultBatchSize = 100;

  constructor() {
    this.moduleDetector = new BulkModuleDetector();
    this.batchExecutor = new BulkBatchExecutor();
    this.progressTracker = new BulkProgressTracker();
  }

  /**
   * Auto-detects all modules and registers bulk operations
   */
  async autoDetectBulkCapabilities() {
    console.log('🔄 Auto-detecting modules for bulk operations...');
    
    const configs = await this.moduleDetector.detectBulkCapabilities();
    
    for (const config of configs) {
      this.registerModuleBulkOperations(config.tableName, config.moduleName);
    }

    console.log(`✅ Bulk operations registered for ${configs.length} modules`);
  }

  /**
   * Registers bulk operations for a specific module
   */
  private registerModuleBulkOperations(tableName: string, moduleName: string) {
    const operationIds = this.moduleDetector.registerModuleBulkOperations(tableName, moduleName);
    
    const operations = ['insert', 'update', 'delete', 'upsert'] as const;
    
    operations.forEach((op, index) => {
      const operationId = operationIds[index];
      this.operations.set(operationId, {
        operation: op,
        tableName,
        data: [],
        batchSize: this.defaultBatchSize
      });
    });
  }

  /**
   * Execute bulk operation with automatic batching and progress tracking
   */
  async executeBulkOperation(config: BulkOperation): Promise<BulkOperationResult> {
    const executeBatch = (batch: any[]) => 
      this.batchExecutor.executeBatch(config.operation, config.tableName, batch);

    return await this.progressTracker.processBulkOperation(
      config, 
      executeBatch, 
      this.defaultBatchSize
    );
  }

  /**
   * Get available bulk operations for a table
   */
  getAvailableOperations(tableName: string): string[] {
    const operations = [];
    const baseOperations = ['insert', 'update', 'delete', 'upsert'];
    
    for (const op of baseOperations) {
      const operationId = `${tableName}_bulk_${op}`;
      if (this.operations.has(operationId)) {
        operations.push(op);
      }
    }

    return operations;
  }
}

// Global singleton instance
export const bulkOperationsManager = new BulkOperationsManager();

// Auto-initialize bulk operations
if (typeof window !== 'undefined') {
  setTimeout(() => {
    bulkOperationsManager.autoDetectBulkCapabilities();
  }, 1500);
}
