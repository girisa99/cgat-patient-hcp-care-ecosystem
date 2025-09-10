/**
 * Real-Time Role Sync Hook
 * Provides real-time updates for role-based API access changes
 */

import { useEffect, useState, useRef } from 'react';
// Define UserRole enum since it's not exported from types
type UserRole = 'superAdmin' | 'healthcareProvider' | 'nurse' | 'caseManager' | 'onboardingTeam' | 'patientCaregiver' | 'financeTeam' | 'contractTeam' | 'workflowManager' | 'demoUser';
import { RealTimeRoleSyncManager } from '@/utils/automation/RealTimeRoleSyncManager';
import { useToast } from '@/hooks/use-toast';

interface RoleSyncUpdate {
  role: UserRole;
  updates: {
    api_access: string[];
    field_mappings: Record<string, string[]>;
    permissions: string[];
    documentation_sections: string[];
  };
}

interface UseRealTimeRoleSyncOptions {
  role?: UserRole;
  onUpdate?: (update: RoleSyncUpdate) => void;
  enableNotifications?: boolean;
}

export const useRealTimeRoleSync = (options: UseRealTimeRoleSyncOptions = {}) => {
  const { role, onUpdate, enableNotifications = true } = options;
  const { toast } = useToast();
  
  const [updates, setUpdates] = useState<RoleSyncUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const updateCountRef = useRef(0);

  useEffect(() => {
    // Initialize the real-time sync manager
    RealTimeRoleSyncManager.initialize()
      .then(() => {
        setIsConnected(true);
        console.log('✅ Real-time role sync connected');
      })
      .catch((error) => {
        console.error('❌ Failed to connect to real-time role sync:', error);
        setIsConnected(false);
      });

    // Subscribe to updates
    const unsubscribe = RealTimeRoleSyncManager.subscribe(
      `hook_${Date.now()}`,
      (update: RoleSyncUpdate) => {
        // Filter updates by role if specified
        if (role && update.role !== role) return;

        setUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
        setLastUpdate(new Date());
        updateCountRef.current += 1;

        // Call custom update handler
        if (onUpdate) {
          onUpdate(update);
        }

        // Show notification if enabled
        if (enableNotifications) {
          showUpdateNotification(update);
        }
      }
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [role, onUpdate, enableNotifications]);

  const showUpdateNotification = (update: RoleSyncUpdate) => {
    const updateTypes = [];
    if (update.updates.api_access.length > 0) updateTypes.push('API Access');
    if (Object.keys(update.updates.field_mappings).length > 0) updateTypes.push('Field Mappings');
    if (update.updates.permissions.length > 0) updateTypes.push('Permissions');
    if (update.updates.documentation_sections.length > 0) updateTypes.push('Documentation');

    toast({
      title: `Role Update: ${update.role}`,
      description: `Updated: ${updateTypes.join(', ')}`,
    });
  };

  const getUpdatesSummary = () => {
    const summary = {
      total: updates.length,
      byRole: {} as Record<UserRole, number>,
      recentUpdates: updates.slice(0, 5),
      lastUpdateTime: lastUpdate
    };

    updates.forEach(update => {
      summary.byRole[update.role] = (summary.byRole[update.role] || 0) + 1;
    });

    return summary;
  };

  const clearUpdates = () => {
    setUpdates([]);
    updateCountRef.current = 0;
    setLastUpdate(null);
  };

  const getLatestUpdatesForRole = (targetRole: UserRole) => {
    return updates.filter(update => update.role === targetRole);
  };

  const getApiAccessChanges = () => {
    return updates.reduce((acc, update) => {
      update.updates.api_access.forEach(api => {
        if (!acc[api]) acc[api] = [];
        acc[api].push(update.role);
      });
      return acc;
    }, {} as Record<string, UserRole[]>);
  };

  const getPermissionChanges = () => {
    return updates.reduce((acc, update) => {
      update.updates.permissions.forEach(permission => {
        if (!acc[permission]) acc[permission] = [];
        acc[permission].push(update.role);
      });
      return acc;
    }, {} as Record<string, UserRole[]>);
  };

  return {
    // Connection status
    isConnected,
    
    // Update data
    updates,
    updateCount: updateCountRef.current,
    lastUpdate,
    
    // Utility functions
    getUpdatesSummary,
    clearUpdates,
    getLatestUpdatesForRole,
    getApiAccessChanges,
    getPermissionChanges,
    
    // Computed data
    hasUpdates: updates.length > 0,
    recentUpdates: updates.slice(0, 3),
    
    // Meta information
    meta: {
      connected: isConnected,
      role_filter: role || 'all',
      notifications_enabled: enableNotifications,
      total_updates: updateCountRef.current,
      connection_time: isConnected ? new Date().toISOString() : null
    }
  };
};

// Specialized hooks for different use cases
export const useRoleSpecificSync = (role: UserRole) => {
  return useRealTimeRoleSync({ 
    role,
    enableNotifications: true 
  });
};

export const useApiSuiteSync = () => {
  return useRealTimeRoleSync({
    onUpdate: (update) => {
      console.log(`🔄 API Suite sync for ${update.role}:`, update.updates);
    }
  });
};

export const useAdminRoleSync = () => {
  return useRealTimeRoleSync({
    role: 'superAdmin',
    enableNotifications: true,
    onUpdate: (update) => {
      console.log('🔐 Admin role sync update:', update);
    }
  });
};