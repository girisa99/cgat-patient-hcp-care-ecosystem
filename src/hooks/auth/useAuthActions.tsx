
import { supabase } from '@/integrations/supabase/client';
import { logAuthError } from '@/utils/authErrorHandler';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

/**
 * Hook for authentication actions and permissions
 */
export const useAuthActions = (user: any, userRoles: UserRole[]) => {
  const signOut = async () => {
    try {
      console.log('👋 Signing out user');
      await supabase.auth.signOut();
    } catch (error) {
      logAuthError('signOut', error, user?.id);
    }
  };

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
    signOut,
    hasRole,
    hasPermission
  };
};
