
/**
 * Simplified Main Auth Hook
 * Uses the refactored auth modules
 */
import { useAuthData } from './auth/useAuthData';
import { AuthStateManager } from '@/utils/auth/authStateManager';

export const useAuth = () => {
  const authData = useAuthData();

  const signOut = async () => {
    await AuthStateManager.secureSignOut();
  };

  const hasRole = (role: any): boolean => {
    return authData.userRoles.includes(role);
  };

  const hasPermission = async (permission: string): Promise<boolean> => {
    // Simplified permission check for now
    if (!authData.user) return false;
    
    // Super admins have all permissions
    if (authData.userRoles.includes('superAdmin' as any)) {
      return true;
    }
    
    // Basic permission logic - can be enhanced later
    return false;
  };

  return {
    ...authData,
    signOut,
    hasRole,
    hasPermission
  };
};
