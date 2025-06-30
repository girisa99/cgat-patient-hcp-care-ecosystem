
import { Database } from '@/integrations/supabase/types';
import { useAuthActions as useMainAuthActions } from '@/hooks/useAuthActions';

type UserRole = Database['public']['Enums']['user_role'];

/**
 * Hook for authentication permissions checking
 * Note: Main auth actions are now in src/hooks/useAuthActions.tsx
 * This is a compatibility wrapper that delegates to the main hook
 */
export const useAuthActions = (user: any, userRoles: UserRole[]) => {
  const mainAuthActions = useMainAuthActions();

  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!user) return false;
    
    // This is a simplified version - you might want to implement full permission checking
    // For now, we'll return true for authenticated users with roles
    return userRoles.length > 0;
  };

  return {
    hasRole,
    hasPermission,
    ...mainAuthActions
  };
};
