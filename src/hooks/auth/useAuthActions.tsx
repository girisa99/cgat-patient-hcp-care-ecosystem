
import { supabase } from '@/integrations/supabase/client';
import { logAuthError } from '@/utils/auth/authErrorHandler';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

/**
 * Hook for authentication permissions checking
 * Note: Main auth actions are now in src/hooks/useAuthActions.tsx
 */
export const useAuthActions = (user: any, userRoles: UserRole[]) => {
  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          permissions!inner (
            name
          )
        `)
        .in('role_id', 
          userRoles.length > 0 
            ? await supabase
                .from('roles')
                .select('id')
                .in('name', userRoles)
                .then(({ data }) => data?.map(r => r.id) || [])
            : []
        );
      
      if (error) {
        logAuthError('hasPermission', error, user.id);
        return false;
      }
      
      return data?.some((rp: any) => rp.permissions.name === permission) || false;
    } catch (error) {
      logAuthError('hasPermission', error, user.id);
      return false;
    }
  };

  return {
    hasRole,
    hasPermission
  };
};
