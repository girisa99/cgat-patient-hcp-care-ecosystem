
/**
 * Universal Real-time Hook
 * Automatically integrates with any module for real-time updates
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { realtimeManager } from '@/utils/realtime';
import { RealtimeEvent } from '@/utils/realtime';
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
    
    // Auto-invalidate queries - enhanced for user roles
    const queryKeysToInvalidate = [
      options.tableName,
      `${options.tableName}-list`,
      `${options.tableName}-search`,
      ...(options.customInvalidation || [])
    ];

    // Special handling for user role changes
    if (options.tableName === 'user_roles') {
      queryKeysToInvalidate.push(
        'users',
        'users-all',
        'consistent-users',
        'unified-user-data',
        'user-statistics'
      );
    }

    // Special handling for role changes
    if (options.tableName === 'roles') {
      queryKeysToInvalidate.push(
        'users',
        'user-roles',
        'permissions'
      );
    }

    queryKeysToInvalidate.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });

    // Show notifications if enabled
    if (options.enableNotifications) {
      const moduleName = options.moduleName || options.tableName;
      let message = '';
      
      switch (event.eventType) {
        case 'INSERT':
          if (options.tableName === 'user_roles') {
            message = 'User role assigned successfully';
          } else {
            message = `New ${moduleName.toLowerCase()} added`;
          }
          break;
        case 'UPDATE':
          message = `${moduleName} updated`;
          break;
        case 'DELETE':
          if (options.tableName === 'user_roles') {
            message = 'User role removed successfully';
          } else {
            message = `${moduleName} removed`;
          }
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
