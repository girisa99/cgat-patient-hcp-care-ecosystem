
/**
 * Enhanced Admin Real-time Hook
 * Provides comprehensive real-time updates for all admin modules
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { realtimeManager } from '@/utils/realtime';
import { realtimeModuleRegistry } from '@/utils/realtime/RealtimeModuleRegistry';
import { RealtimeEvent } from '@/utils/realtime';

export interface AdminRealtimeOptions {
  enableNotifications?: boolean;
  areas?: ('userManagement' | 'facility' | 'rbac' | 'dashboard' | 'apiIntegration')[];
}

export const useAdminRealtime = (options: AdminRealtimeOptions = {}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { enableNotifications = true, areas = ['userManagement', 'facility', 'rbac', 'dashboard', 'apiIntegration'] } = options;

  const handleAdminRealtimeEvent = useCallback((event: RealtimeEvent) => {
    console.log(`🔔 Admin real-time event:`, event.tableName, event.eventType);

    // Define query keys to invalidate based on the table affected
    const getQueryKeysToInvalidate = (tableName: string): string[] => {
      const baseKeys = [tableName, `${tableName}-list`, `${tableName}-search`];
      
      switch (tableName) {
        case 'modules':
          return [...baseKeys, 'user-effective-modules', 'module-permissions', 'dashboard-stats'];
        
        case 'user_roles':
        case 'roles':
          return [...baseKeys, 'users', 'users-all', 'user-effective-modules', 'rbac-data', 'dashboard-stats'];
        
        case 'facilities':
          return [...baseKeys, 'users', 'user-facility-access', 'dashboard-stats'];
        
        case 'user_module_assignments':
        case 'role_module_assignments':
          return [...baseKeys, 'user-effective-modules', 'users', 'rbac-assignments'];
        
        case 'user_facility_access':
          return [...baseKeys, 'users', 'facilities', 'rbac-data'];
        
        case 'permissions':
        case 'user_permissions':
        case 'role_permissions':
          return [...baseKeys, 'users', 'rbac-permissions', 'user-effective-permissions'];
        
        case 'api_integration_registry':
          return [...baseKeys, 'api-integrations', 'dashboard-api-stats'];
        
        default:
          return baseKeys;
      }
    };

    // Invalidate queries
    const queryKeys = getQueryKeysToInvalidate(event.tableName);
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });

    // Show notifications for important changes
    if (enableNotifications && shouldShowNotification(event)) {
      const message = getNotificationMessage(event);
      if (message) {
        toast({
          title: "System Update",
          description: message,
          duration: 4000,
        });
      }
    }
  }, [queryClient, toast, enableNotifications]);

  const shouldShowNotification = (event: RealtimeEvent): boolean => {
    // Show notifications for key admin operations
    const importantTables = ['modules', 'user_roles', 'facilities', 'user_module_assignments'];
    return importantTables.includes(event.tableName);
  };

  const getNotificationMessage = (event: RealtimeEvent): string => {
    const { tableName, eventType } = event;
    
    switch (tableName) {
      case 'modules':
        switch (eventType) {
          case 'INSERT': return 'New module has been added to the system';
          case 'UPDATE': return 'Module configuration has been updated';
          case 'DELETE': return 'Module has been removed from the system';
          default: return '';
        }
      
      case 'user_roles':
        switch (eventType) {
          case 'INSERT': return 'User role assignment updated';
          case 'DELETE': return 'User role has been removed';
          default: return '';
        }
      
      case 'facilities':
        switch (eventType) {
          case 'INSERT': return 'New facility has been added';
          case 'UPDATE': return 'Facility information updated';
          case 'DELETE': return 'Facility has been removed';
          default: return '';
        }
      
      case 'user_module_assignments':
        switch (eventType) {
          case 'INSERT': return 'Module access granted to user';
          case 'DELETE': return 'Module access revoked from user';
          default: return '';
        }
      
      default:
        return '';
    }
  };

  useEffect(() => {
    const unsubscribeCallbacks: (() => void)[] = [];

    // Get relevant modules based on specified areas
    const relevantModules = areas.flatMap(area => {
      switch (area) {
        case 'userManagement':
          return realtimeModuleRegistry.getModulesImpacting('userManagementImpact');
        case 'facility':
          return realtimeModuleRegistry.getModulesImpacting('facilityImpact');
        case 'rbac':
          return realtimeModuleRegistry.getModulesImpacting('rbacImpact');
        case 'dashboard':
          return realtimeModuleRegistry.getModulesImpacting('dashboardImpact');
        case 'apiIntegration':
          return realtimeModuleRegistry.getModulesImpacting('apiIntegrationImpact');
        default:
          return [];
      }
    });

    // Remove duplicates
    const uniqueModules = relevantModules.filter((module, index, self) => 
      index === self.findIndex(m => m.tableName === module.tableName)
    );

    // Subscribe to real-time updates for each relevant module
    uniqueModules.forEach(module => {
      const unsubscribe = realtimeManager.subscribe(module.tableName, handleAdminRealtimeEvent);
      unsubscribeCallbacks.push(unsubscribe);
    });

    console.log(`🔔 Subscribed to real-time updates for ${uniqueModules.length} admin modules in areas:`, areas);

    return () => {
      unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    };
  }, [areas, handleAdminRealtimeEvent]);

  return {
    // Utility functions for manual operations
    invalidateUserQueries: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users-all'] });
      queryClient.invalidateQueries({ queryKey: ['user-effective-modules'] });
    },
    invalidateFacilityQueries: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['user-facility-access'] });
    },
    invalidateModuleQueries: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['user-effective-modules'] });
    },
    invalidateRbacQueries: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
    invalidateDashboardQueries: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  };
};
