
/**
 * Automated Bulk Operations Manager
 * Automatically provides bulk operations for all modules
 */

import { supabase } from '@/integrations/supabase/client';
import { moduleRegistry } from '@/utils/moduleRegistry';

export interface BulkOperation {
  operation: 'insert' | 'update' | 'delete' | 'upsert';
  tableName: string;
  data: any[];
  batchSize?: number;
  onProgress?: (progress: number) => void;
  onComplete?: (results: any[]) => void;
  onError?: (error: Error) => void;
}

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  errorCount: number;
  results: any[];
  errors: Error[];
  duration: number;
}

class BulkOperationsManager {
  private operations: Map<string, BulkOperation> = new Map();
  private defaultBatchSize = 100;

  /**
   * Auto-detects all modules and registers bulk operations
   */
  async autoDetectBulkCapabilities() {
    console.log('🔄 Auto-detecting modules for bulk operations...');
    
    const modules = moduleRegistry.getAll();
    
    for (const module of modules) {
      this.registerModuleBulkOperations(module.tableName, module.moduleName);
    }

    console.log(`✅ Bulk operations registered for ${modules.length} modules`);
  }

  /**
   * Registers bulk operations for a specific module
   */
  private registerModuleBulkOperations(tableName: string, moduleName: string) {
    console.log(`📦 Registering bulk operations for ${moduleName}`);
    
    // Auto-generate bulk operation configs
    const operations = ['insert', 'update', 'delete', 'upsert'] as const;
    
    operations.forEach(op => {
      const operationId = `${tableName}_bulk_${op}`;
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
    const startTime = Date.now();
    const results: any[] = [];
    const errors: Error[] = [];
    let processedCount = 0;

    console.log(`📦 Executing bulk ${config.operation} for ${config.tableName} (${config.data.length} items)`);

    try {
      const batchSize = config.batchSize || this.defaultBatchSize;
      const totalBatches = Math.ceil(config.data.length / batchSize);

      for (let i = 0; i < config.data.length; i += batchSize) {
        const batch = config.data.slice(i, i + batchSize);
        const currentBatch = Math.floor(i / batchSize) + 1;

        try {
          let batchResult;
          
          switch (config.operation) {
            case 'insert':
              batchResult = await this.executeBatchInsert(config.tableName, batch);
              break;
            case 'update':
              batchResult = await this.executeBatchUpdate(config.tableName, batch);
              break;
            case 'delete':
              batchResult = await this.executeBatchDelete(config.tableName, batch);
              break;
            case 'upsert':
              batchResult = await this.executeBatchUpsert(config.tableName, batch);
              break;
          }

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

      const result: BulkOperationResult = {
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
      const errorResult: BulkOperationResult = {
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

  /**
   * Execute batch insert
   */
  private async executeBatchInsert(tableName: string, data: any[]) {
    // Use type assertion to handle dynamic table names
    return await (supabase.from as any)(tableName)
      .insert(data)
      .select();
  }

  /**
   * Execute batch update
   */
  private async executeBatchUpdate(tableName: string, data: any[]) {
    // For updates, we need to update each record individually
    // This is a limitation of Supabase's bulk update capabilities
    const results = [];
    
    for (const item of data) {
      const { id, ...updateData } = item;
      const result = await (supabase.from as any)(tableName)
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (result.data) {
        results.push(...result.data);
      }
    }

    return { data: results };
  }

  /**
   * Execute batch delete
   */
  private async executeBatchDelete(tableName: string, data: any[]) {
    const ids = data.map(item => item.id || item);
    
    return await (supabase.from as any)(tableName)
      .delete()
      .in('id', ids)
      .select();
  }

  /**
   * Execute batch upsert
   */
  private async executeBatchUpsert(tableName: string, data: any[]) {
    return await (supabase.from as any)(tableName)
      .upsert(data)
      .select();
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
