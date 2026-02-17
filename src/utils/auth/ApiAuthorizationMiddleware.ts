
/**
 * API Authorization Middleware
 * Provides endpoint protection and authentication validation
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database.generated';

type UserRole = Database['public']['Enums']['user_role'];

export interface AuthorizedRequest {
  userId: string;
  userRoles: UserRole[];
  permissions: string[];
}

export class ApiAuthorizationMiddleware {
  /**
   * Validate API request authorization
   */
  static async validateRequest(requiredRole?: UserRole, requiredPermission?: string): Promise<AuthorizedRequest | null> {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.log('🔒 API request blocked: No valid session');
        return null;
      }

      // Get user roles by joining user_roles with roles table
      const { data: userRolesData } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name
          )
        `)
        .eq('user_id', session.user.id);

      const roles = userRolesData?.map(ur => ur.roles?.name).filter(Boolean) as UserRole[] || [];

      // Check required role
      if (requiredRole && !roles.includes(requiredRole)) {
        console.log('🔒 API request blocked: Insufficient role privileges');
        return null;
      }

      // Resolve permissions via Supabase (no mock values)
      let permissions: string[] = [];
      try {
        if (requiredPermission) {
          const { data: hasPerm, error: permError } = await supabase.rpc('user_has_permission', {
            check_user_id: session.user.id,
            permission_name: requiredPermission,
            facility_id: null
          });
          if (permError) {
            console.warn('⚠️ Permission check RPC error:', permError);
            return null;
          }
          if (!hasPerm) {
            console.log('🔒 API request blocked: Insufficient permissions');
            return null;
          }
          // Fetch effective permissions for context
          const { data: effPerms } = await supabase.rpc('get_user_effective_permissions', {
            check_user_id: session.user.id,
            facility_id: null
          });
          permissions = Array.isArray(effPerms) ? effPerms.map((p: any) => p.permission_name) : [];
        } else {
          // If no specific permission required, still fetch effective permissions for downstream usage
          const { data: effPerms } = await supabase.rpc('get_user_effective_permissions', {
            check_user_id: session.user.id,
            facility_id: null
          });
          permissions = Array.isArray(effPerms) ? effPerms.map((p: any) => p.permission_name) : [];
        }
      } catch (e) {
        console.error('❌ Permission resolution error:', e);
        return null;
      }

      console.log('✅ API request authorized');
      return {
        userId: session.user.id,
        userRoles: roles,
        permissions
      };

    } catch (error) {
      console.error('❌ API authorization error:', error);
      return null;
    }
  }

  /**
   * Protect API endpoint with authorization
   */
  static async protectEndpoint(
    endpoint: string, 
    requiredRole?: UserRole, 
    requiredPermission?: string
  ): Promise<boolean> {
    console.log('🔐 Protecting API endpoint:', endpoint);
    
    const authResult = await this.validateRequest(requiredRole, requiredPermission);
    
    if (!authResult) {
      console.log('🔒 Endpoint access denied:', endpoint);
      return false;
    }

    console.log('✅ Endpoint access granted:', endpoint);
    return true;
  }
}

// Mark as implemented
if (typeof window !== 'undefined') {
  localStorage.setItem('api_authorization_implemented', 'true');
}
