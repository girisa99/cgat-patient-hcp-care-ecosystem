
/**
 * Auth Security Helpers
 * Real implementation for validating user permissions
 */

import { supabase } from '@/integrations/supabase/client';

interface PermissionValidationResult {
  hasPermission: boolean;
  reason?: string;
  requiredRole?: string;
}

export const validateModulePermission = async (userId: string, action: string, resource: string): Promise<boolean> => {
  console.log(`🔐 Validating permission for user ${userId}: ${action} on ${resource}`);
  
  try {
    // Input validation
    if (!userId || !action || !resource) {
      console.warn('🚫 Invalid parameters for permission validation');
      return false;
    }
    
    // Get user roles from database
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles (
          name,
          permissions
        )
      `)
      .eq('user_id', userId);
    
    if (rolesError) {
      console.error('❌ Error fetching user roles:', rolesError);
      return false;
    }
    
    if (!userRoles || userRoles.length === 0) {
      console.warn('🚫 No roles found for user');
      return false;
    }
    
    // Check if user has required permission
    const hasPermission = await validatePermissionWithRoles(userRoles, action, resource);
    
    if (hasPermission) {
      console.log(`✅ Permission granted for ${action} on ${resource}`);
    } else {
      console.warn(`🚫 Permission denied for ${action} on ${resource}`);
    }
    
    return hasPermission;
    
  } catch (error) {
    console.error('❌ Error validating permission:', error);
    return false;
  }
};

const validatePermissionWithRoles = async (userRoles: any[], action: string, resource: string): Promise<boolean> => {
  // SuperAdmin has all permissions
  const isSuperAdmin = userRoles.some(ur => ur.roles?.name === 'superAdmin');
  if (isSuperAdmin) {
    return true;
  }
  
  // Define permission mappings
  const permissionMap: Record<string, Record<string, string[]>> = {
    'read': {
      'users': ['superAdmin', 'onboardingTeam'],
      'patients': ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider', 'patientCaregiver'],
      'facilities': ['superAdmin', 'onboardingTeam'],
      'modules': ['superAdmin', 'onboardingTeam'],
      'api-services': ['superAdmin', 'onboardingTeam'],
      'testing': ['superAdmin', 'onboardingTeam'],
      'security': ['superAdmin'],
      'role-management': ['superAdmin'],
      'data-import': ['superAdmin', 'onboardingTeam'],
      'dashboard': ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider', 'patientCaregiver'],
      'agents': ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider', 'patientCaregiver']
    },
    'write': {
      'users': ['superAdmin', 'onboardingTeam'],
      'patients': ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider'],
      'facilities': ['superAdmin', 'onboardingTeam'],
      'modules': ['superAdmin', 'onboardingTeam'],
      'api-services': ['superAdmin', 'onboardingTeam'],
      'testing': ['superAdmin', 'onboardingTeam'],
      'security': ['superAdmin'],
      'role-management': ['superAdmin'],
      'data-import': ['superAdmin', 'onboardingTeam'],
      'agents': ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider']
    },
    'delete': {
      'users': ['superAdmin'],
      'patients': ['superAdmin', 'onboardingTeam'],
      'facilities': ['superAdmin'],
      'modules': ['superAdmin'],
      'api-services': ['superAdmin'],
      'testing': ['superAdmin'],
      'security': ['superAdmin'],
      'role-management': ['superAdmin'],
      'data-import': ['superAdmin'],
      'agents': ['superAdmin', 'onboardingTeam']
    }
  };
  
  // Get allowed roles for this action and resource
  const allowedRoles = permissionMap[action]?.[resource] || [];
  
  // Check if user has any of the required roles
  const userRoleNames = userRoles.map(ur => ur.roles?.name).filter(Boolean);
  const hasRequiredRole = userRoleNames.some(roleName => allowedRoles.includes(roleName));
  
  return hasRequiredRole;
};

export const checkResourceAccess = async (userId: string, resourceType: string, resourceId?: string): Promise<boolean> => {
  try {
    // Basic permission check
    const hasRead = await validateModulePermission(userId, 'read', resourceType);
    if (!hasRead) {
      return false;
    }
    
    // If no specific resource ID, return basic permission
    if (!resourceId) {
      return true;
    }
    
    // Additional resource-specific checks
    switch (resourceType) {
      case 'patients':
        return await validatePatientAccess(userId, resourceId);
      case 'facilities':
        return await validateFacilityAccess(userId, resourceId);
      default:
        return true;
    }
  } catch (error) {
    console.error('❌ Error checking resource access:', error);
    return false;
  }
};

const validatePatientAccess = async (userId: string, patientId: string): Promise<boolean> => {
  // Check if user has access to this specific patient
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('facility_id')
    .eq('id', userId)
    .single();
    
  const { data: patient } = await supabase
    .from('profiles')
    .select('facility_id')
    .eq('id', patientId)
    .single();
    
  // Users can access patients in their facility
  return userProfile?.facility_id === patient?.facility_id;
};

const validateFacilityAccess = async (userId: string, facilityId: string): Promise<boolean> => {
  // Check if user has access to this facility
  const { data: userAccess } = await supabase
    .from('user_facility_access')
    .select('*')
    .eq('user_id', userId)
    .eq('facility_id', facilityId)
    .eq('is_active', true);
    
  return userAccess && userAccess.length > 0;
};

export const logSecurityEvent = async (userId: string, eventType: string, details: any) => {
  try {
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: eventType,
      p_severity: 'medium',
      p_description: `Security event: ${eventType}`,
      p_metadata: details
    });
  } catch (error) {
    console.error('❌ Error logging security event:', error);
  }
};
