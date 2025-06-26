
/**
 * Type definitions for bulk operations
 */

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

export interface BulkOperationConfig {
  tableName: string;
  moduleName: string;
  operations: Array<'insert' | 'update' | 'delete' | 'upsert'>;
}
