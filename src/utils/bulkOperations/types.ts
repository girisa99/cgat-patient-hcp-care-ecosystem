/**
 * Type definitions for bulk operations
 */

// Generic data type for database records
export interface DatabaseRecord {
  id?: string | number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// Progress callback type
export type ProgressCallback = (progress: number) => void;

// Result callback type  
export type ResultCallback<T = DatabaseRecord> = (results: T[]) => void;

// Error callback type
export type ErrorCallback = (error: Error) => void;

export interface BulkOperation<T extends DatabaseRecord = DatabaseRecord> {
  operation: 'insert' | 'update' | 'delete' | 'upsert';
  tableName: string;
  data: T[];
  batchSize?: number;
  onProgress?: ProgressCallback;
  onComplete?: ResultCallback<T>;
  onError?: ErrorCallback;
}

export interface BulkOperationResult<T extends DatabaseRecord = DatabaseRecord> {
  success: boolean;
  processedCount: number;
  errorCount: number;
  results: T[];
  errors: Error[];
  duration: number;
}

export interface BulkOperationConfig {
  tableName: string;
  moduleName: string;
  operations: Array<'insert' | 'update' | 'delete' | 'upsert'>;
}
