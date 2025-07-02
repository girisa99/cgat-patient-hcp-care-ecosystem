
// RLS Policy Helper Functions - Enhanced Version
// Updated to work with simplified RLS policies and comprehensive validation

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface UserAccessProfile {
  userId: string;
  roles: UserRole[];
  permissions: string[];
  facilities: Array<{
    facility_id: string;
    facility_name: string;
    access_level: string;
  }>;
  modules: Array<{
    module_id: string;
    module_name: string;
    access_source: string;
  }>;
  securityLevel: 'low' | 'medium' | 'high';
  lastValidated: string;
}

/**
 * Enhanced function to get comprehensive user access profile
 */
export const getUserAccessProfile = async (userId: string): Promise<UserAccessProfile | null> => {
  try {
    console.log('🔍 Building comprehensive access profile for user:', userId);

    // Get user roles
    const roles = await getUserRolesDirect(userId);
    
    // Get user permissions
    const { data: permissionsData, error: permError } = await supabase
      .rpc('get_user_effective_permissions', { check_user_id: userId });
    
    const permissions = permissionsData?.map((p: any) => p.permission_name) || [];

    // Get accessible facilities
    const facilities = await getUserAccessibleFacilities(userId);

    // Get user modules
    const { data: modulesData, error: modError } = await supabase
      .rpc('get_user_effective_modules', { check_user_id: userId });
    
    const modules = modulesData?.map((m: any) => ({
      module_id: m.module_id,
      module_name: m.module_name,
      access_source: m.access_source
    })) || [];

    // Calculate security level
    const securityLevel = calculateUserSecurityLevel({
      rolesCount: roles.length,
      permissionsCount: permissions.length,
      facilitiesCount: facilities.length,
      modulesCount: modules.length,
      hasAdminRole: roles.some(role => ['superAdmin', 'onboardingTeam'].includes(role))
    });

    const profile: UserAccessProfile = {
      userId,
      roles,
      permissions,
      facilities,
      modules,
      securityLevel,
      lastValidated: new Date().toISOString()
    };

    console.log('✅ Access profile built successfully:', {
      roles: roles.length,
      permissions: permissions.length,
      facilities: facilities.length,
      modules: modules.length,
      securityLevel
    });

    return profile;
  } catch (error) {
    console.error('❌ Error building user access profile:', error);
    return null;
  }
};

/**
 * Calculate user security level based on access metrics
 */
const calculateUserSecurityLevel = (metrics: {
  rolesCount: number;
  permissionsCount: number;
  facilitiesCount: number;
  modulesCount: number;
  hasAdminRole: boolean;
}): 'low' | 'medium' | 'high' => {
  let score = 0;
  
  if (metrics.rolesCount > 0) score += 2;
  if (metrics.permissionsCount > 0) score += 2;
  if (metrics.facilitiesCount > 0) score += 1;
  if (metrics.modulesCount > 0) score += 2;
  if (metrics.hasAdminRole) score += 1;

  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
};

/**
 * Enhanced role checking with comprehensive validation
 */
export const checkUserRole = async (userId: string, roleName: UserRole): Promise<boolean> => {
  try {
    console.log('🔍 Checking user role:', userId, roleName);
    
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles!inner (
          name
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error checking user role:', error);
      return false;
    }

    const hasRole = data?.some((ur: any) => ur.roles.name === roleName) || false;
    console.log(`✅ User ${userId} has role ${roleName}:`, hasRole);
    return hasRole;
  } catch (error) {
    console.error('❌ Exception in checkUserRole:', error);
    return false;
  }
};

/**
 * Enhanced permission checking with caching support
 */
export const checkUserPermission = async (userId: string, permissionName: string): Promise<boolean> => {
  try {
    console.log('🔍 Checking user permission:', userId, permissionName);
    
    const { data, error } = await supabase
      .rpc('user_has_permission', {
        check_user_id: userId,
        permission_name: permissionName,
        facility_id: null
      });

    if (error) {
      console.error('❌ Error checking user permission:', error);
      return false;
    }

    const hasPermission = data || false;
    console.log(`✅ User ${userId} has permission ${permissionName}:`, hasPermission);
    return hasPermission;
  } catch (error) {
    console.error('❌ Exception in checkUserPermission:', error);
    return false;
  }
};

/**
 * Enhanced facility access with detailed information
 */
export const getUserAccessibleFacilities = async (userId: string) => {
  try {
    console.log('🔍 Getting accessible facilities for user:', userId);
    
    const { data, error } = await supabase
      .rpc('get_user_accessible_facilities', { user_id: userId });

    if (error) {
      console.error('❌ Error getting accessible facilities:', error);
      return [];
    }

    const facilities = data || [];
    console.log('✅ Accessible facilities loaded:', facilities.length);
    return facilities;
  } catch (error) {
    console.error('❌ Exception in getUserAccessibleFacilities:', error);
    return [];
  }
};

/**
 * Enhanced direct role query with validation
 */
export const getUserRolesDirect = async (userId: string): Promise<UserRole[]> => {
  try {
    console.log('🔍 Getting user roles directly:', userId);
    
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles!inner (
          name
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error getting user roles:', error);
      return [];
    }

    const roles = data?.map((ur: any) => ur.roles.name as UserRole) || [];
    console.log('✅ User roles fetched:', roles);
    return roles;
  } catch (error) {
    console.error('❌ Exception in getUserRolesDirect:', error);
    return [];
  }
};

/**
 * Enhanced profile loading with comprehensive data
 */
export const getUserProfileSafe = async (userId: string) => {
  try {
    console.log('🔍 Loading user profile safely:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error loading profile:', error);
      return null;
    }

    console.log('✅ Profile loaded successfully:', data?.id);
    return data;
  } catch (error) {
    console.error('❌ Exception in getUserProfileSafe:', error);
    return null;
  }
};

/**
 * Validate user's complete access context
 */
export const validateUserAccessContext = async (userId: string) => {
  try {
    console.log('🔍 Validating complete access context for user:', userId);
    
    const profile = await getUserAccessProfile(userId);
    if (!profile) {
      return { isValid: false, reason: 'Could not build access profile' };
    }

    // Validation checks
    const checks = {
      hasRoles: profile.roles.length > 0,
      hasPermissions: profile.permissions.length > 0,
      hasFacilityAccess: profile.facilities.length > 0,
      hasModuleAccess: profile.modules.length > 0,
      securityLevelAcceptable: profile.securityLevel !== 'low'
    };

    const isValid = Object.values(checks).some(check => check);
    const failedChecks = Object.entries(checks)
      .filter(([_, passed]) => !passed)
      .map(([check, _]) => check);

    console.log('✅ Access context validation complete:', {
      isValid,
      failedChecks,
      securityLevel: profile.securityLevel
    });

    return {
      isValid,
      profile,
      checks,
      failedChecks,
      securityLevel: profile.securityLevel
    };
  } catch (error) {
    console.error('❌ Error validating access context:', error);
    return { isValid: false, reason: 'Validation error', error: error.message };
  }
};
