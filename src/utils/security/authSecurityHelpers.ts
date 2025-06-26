
/**
 * Authentication Security Helpers
 * Focused utilities for secure authentication operations
 */

import { supabase } from '@/integrations/supabase/client';

export interface AuthSecurityContext {
  userId: string;
  roles: string[];
  permissions: string[];
  lastActivity: Date;
}

/**
 * Validates user permission for module operations
 */
export const validateModulePermission = async (
  userId: string, 
  operation: 'create' | 'read' | 'update' | 'delete',
  moduleName: string
): Promise<boolean> => {
  try {
    console.log(`🔒 Validating ${operation} permission for ${moduleName}`);
    
    // Check if user has super admin role (bypass all checks)
    const { data: superAdminCheck } = await supabase
      .rpc('user_has_role', { 
        check_user_id: userId, 
        role_name: 'superAdmin' 
      });

    if (superAdminCheck) {
      console.log('✅ Super admin access granted');
      return true;
    }

    // Check specific module permission
    const permissionName = `${moduleName.toLowerCase()}_${operation}`;
    const { data: hasPermission } = await supabase
      .rpc('user_has_permission', {
        check_user_id: userId,
        permission_name: permissionName
      });

    console.log(`🔍 Permission check result:`, hasPermission);
    return hasPermission || false;
    
  } catch (error) {
    console.error('❌ Permission validation failed:', error);
    return false;
  }
};

/**
 * Rate limiting for sensitive operations
 */
const operationTimestamps = new Map<string, number[]>();

export const checkRateLimit = (userId: string, operation: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
  const key = `${userId}_${operation}`;
  const now = Date.now();
  const timestamps = operationTimestamps.get(key) || [];
  
  // Filter out old timestamps outside the window
  const validTimestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
  
  if (validTimestamps.length >= maxAttempts) {
    console.warn(`⚠️ Rate limit exceeded for ${operation} by user ${userId}`);
    return false;
  }
  
  // Add current timestamp
  validTimestamps.push(now);
  operationTimestamps.set(key, validTimestamps);
  
  return true;
};

/**
 * Secure session validation
 */
export const validateSecureSession = async (): Promise<AuthSecurityContext | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.warn('⚠️ No valid session found');
      return null;
    }

    // Additional security checks
    if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000)) {
      console.warn('⚠️ Session expired');
      return null;
    }

    return {
      userId: session.user.id,
      roles: [], // Will be populated by calling functions
      permissions: [], // Will be populated by calling functions
      lastActivity: new Date()
    };
    
  } catch (error) {
    console.error('❌ Session validation failed:', error);
    return null;
  }
};
