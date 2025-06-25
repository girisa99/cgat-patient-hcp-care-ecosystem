
// Secure Authentication Hook
// Provides safe methods for checking user permissions and roles

import { useState, useCallback } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { checkUserRole, checkUserPermission, getUserAccessibleFacilities } from '@/utils/rlsPolicyHelpers';
import { logAuthError } from '@/utils/authErrorHandler';

export const useSecureAuth = () => {
  const { user, userRoles } = useAuthContext();
  const [loading, setLoading] = useState(false);

  // Safe role checking with caching from context first
  const hasRole = useCallback((roleName: string): boolean => {
    if (!user) return false;
    
    // First check the cached roles from context
    if (userRoles.includes(roleName as any)) {
      return true;
    }
    
    return false;
  }, [user, userRoles]);

  // Async role checking for when we need to verify against database
  const verifyRole = useCallback(async (roleName: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      const hasRoleInDb = await checkUserRole(user.id, roleName);
      return hasRoleInDb;
    } catch (error) {
      logAuthError('verifyRole', error, user.id);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Safe permission checking
  const hasPermission = useCallback(async (permissionName: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      const hasPermissionInDb = await checkUserPermission(user.id, permissionName);
      return hasPermissionInDb;
    } catch (error) {
      logAuthError('hasPermission', error, user.id);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get accessible facilities safely
  const getAccessibleFacilities = useCallback(async () => {
    if (!user) return [];
    
    try {
      setLoading(true);
      const facilities = await getUserAccessibleFacilities(user.id);
      return facilities;
    } catch (error) {
      logAuthError('getAccessibleFacilities', error, user.id);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    user,
    userRoles,
    hasRole,
    verifyRole,
    hasPermission,
    getAccessibleFacilities,
    loading
  };
};
