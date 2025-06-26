
/**
 * Universal Bulk Operations Hook
 * Automatically available for all modules
 */

import { useState, useCallback } from 'react';
import { bulkOperationsManager, BulkOperation, BulkOperationResult } from '@/utils/bulkOperations/BulkOperationsManager';
import { useToast } from '@/hooks/use-toast';

export interface UseBulkOperationsOptions {
  tableName: string;
  onSuccess?: (result: BulkOperationResult) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export const useBulkOperations = (options: UseBulkOperationsOptions) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastResult, setLastResult] = useState<BulkOperationResult | null>(null);
  const { toast } = useToast();

  const executeOperation = useCallback(async (
    operation: 'insert' | 'update' | 'delete' | 'upsert',
    data: any[],
    batchSize?: number
  ): Promise<BulkOperationResult> => {
    setIsProcessing(true);
    setProgress(0);
    setLastResult(null);

    const config: BulkOperation = {
      operation,
      tableName: options.tableName,
      data,
      batchSize,
      onProgress: (progress) => {
        setProgress(progress);
        options.onProgress?.(progress);
      },
      onComplete: (results) => {
        toast({
          title: "Bulk Operation Completed",
          description: `Successfully processed ${results.length} items`,
        });
      },
      onError: (error) => {
        toast({
          title: "Bulk Operation Failed",
          description: error.message,
          variant: "destructive",
        });
        options.onError?.(error);
      }
    };

    try {
      const result = await bulkOperationsManager.executeBulkOperation(config);
      setLastResult(result);
      
      if (result.success) {
        options.onSuccess?.(result);
      }
      
      return result;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [options, toast]);

  const bulkInsert = useCallback((data: any[], batchSize?: number) => 
    executeOperation('insert', data, batchSize), [executeOperation]);

  const bulkUpdate = useCallback((data: any[], batchSize?: number) => 
    executeOperation('update', data, batchSize), [executeOperation]);

  const bulkDelete = useCallback((data: any[], batchSize?: number) => 
    executeOperation('delete', data, batchSize), [executeOperation]);

  const bulkUpsert = useCallback((data: any[], batchSize?: number) => 
    executeOperation('upsert', data, batchSize), [executeOperation]);

  const getAvailableOperations = useCallback(() => 
    bulkOperationsManager.getAvailableOperations(options.tableName), [options.tableName]);

  return {
    // Operations
    bulkInsert,
    bulkUpdate,
    bulkDelete,
    bulkUpsert,
    
    // State
    isProcessing,
    progress,
    lastResult,
    
    // Utilities
    getAvailableOperations
  };
};
