
/**
 * Universal Real-time Hook
 * Automatically integrates with any module for real-time updates
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeManager, RealtimeEvent } from '@/utils/realtime/RealtimeManager';
import { useToast } from '@/hooks/use-toast';

export interface UseRealtimeOptions {
  tableName: string;
  moduleName?: string;
  enableNotifications?: boolean;
  customInvalidation?: string[];
  onEvent?: (event: RealtimeEvent) => void;
}

export const useRealtime = (options: UseRealtimeOptions) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    console.log(`📡 Real-time event received for ${options.tableName}:`, event.eventType);
    
    // Auto-invalidate queries
    const queryKeysToInvalidate = [
      options.tableName,
      `${options.tableName}-list`,
      `${options.tableName}-search`,
      ...(options.customInvalidation || [])
    ];

    queryKeysToInvalidate.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });

    // Show notifications if enabled
    if (options.enableNotifications) {
      const moduleName = options.moduleName || options.tableName;
      let message = '';
      
      switch (event.eventType) {
        case 'INSERT':
          message = `New ${moduleName.toLowerCase()} added`;
          break;
        case 'UPDATE':
          message = `${moduleName} updated`;
          break;
        case 'DELETE':
          message = `${moduleName} removed`;
          break;
        case 'BULK_OPERATION':
          message = `Bulk operation completed for ${moduleName.toLowerCase()}`;
          break;
      }

      if (message) {
        toast({
          title: "Real-time Update",
          description: message,
          duration: 3000,
        });
      }
    }

    // Call custom event handler
    if (options.onEvent) {
      options.onEvent(event);
    }
  }, [options, queryClient, toast]);

  useEffect(() => {
    const unsubscribe = realtimeManager.subscribe(options.tableName, handleRealtimeEvent);
    
    return unsubscribe;
  }, [options.tableName, handleRealtimeEvent]);

  // Listen for global invalidation events
  useEffect(() => {
    const handleGlobalInvalidation = (event: CustomEvent) => {
      const { queryKeys, tableName } = event.detail;
      
      if (tableName === options.tableName || queryKeys.includes(options.tableName)) {
        queryKeys.forEach((key: string) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    };

    window.addEventListener('realtime-invalidate', handleGlobalInvalidation);
    
    return () => {
      window.removeEventListener('realtime-invalidate', handleGlobalInvalidation);
    };
  }, [options.tableName, queryClient]);
};

/**
 * Hook for auto-detecting and applying real-time to any module
 */
export const useAutoRealtime = (tableName: string) => {
  useEffect(() => {
    // Auto-register this module if not already registered
    const registeredModules = realtimeManager.getRegisteredModules();
    const moduleName = tableName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    if (!registeredModules.includes(moduleName)) {
      realtimeManager.registerModule({
        tableName,
        moduleName,
        enableInsert: true,
        enableUpdate: true,
        enableDelete: true,
        enableBulkOperations: true
      });
    }
  }, [tableName]);

  return useRealtime({
    tableName,
    enableNotifications: true
  });
};
