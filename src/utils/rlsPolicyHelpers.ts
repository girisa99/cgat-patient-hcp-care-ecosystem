
// RLS Policy Helper Functions
// Updated to work with simplified RLS policies and avoid recursion

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

/**
 * Safely check if a user has a specific role using the simplified RLS approach
 */
export const checkUserRole = async (userId: string, roleName: UserRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles!inner (
          name
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }

    const hasRole = data?.some((ur: any) => ur.roles.name === roleName) || false;
    console.log(`User ${userId} has role ${roleName}:`, hasRole);
    return hasRole;
  } catch (error) {
    console.error('Exception in checkUserRole:', error);
    return false;
  }
};

/**
 * Safely check if a user has a specific permission
 */
export const checkUserPermission = async (userId: string, permissionName: string): Promise<boolean> => {
  try {
    // First get the user's roles
    const userRoles = await getUserRolesDirect(userId);
    
    if (userRoles.length === 0) {
      return false;
    }

    // Get role IDs
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .in('name', userRoles);

    if (roleError || !roleData) {
      console.error('Error getting role IDs:', roleError);
      return false;
    }

    const roleIds = roleData.map(r => r.id);

    // Check permissions for these roles
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        permissions!inner (
          name
        )
      `)
      .in('role_id', roleIds);

    if (error) {
      console.error('Error checking user permission:', error);
      return false;
    }

    return data?.some((rp: any) => rp.permissions.name === permissionName) || false;
  } catch (error) {
    console.error('Exception in checkUserPermission:', error);
    return false;
  }
};

/**
 * Get accessible facilities for a user - simplified approach
 */
export const getUserAccessibleFacilities = async (userId: string) => {
  try {
    // Get user's profile to see their primary facility
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('facility_id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error getting user profile:', profileError);
      return [];
    }

    // For now, return the user's primary facility if they have one
    // This can be expanded later with the user_facility_access table
    if (profile?.facility_id) {
      const { data: facility, error: facilityError } = await supabase
        .from('facilities')
        .select('id, name')
        .eq('id', profile.facility_id)
        .maybeSingle();

      if (facilityError) {
        console.error('Error getting facility:', facilityError);
        return [];
      }

      return facility ? [{
        facility_id: facility.id,
        facility_name: facility.name,
        access_level: 'read'
      }] : [];
    }

    return [];
  } catch (error) {
    console.error('Exception in getUserAccessibleFacilities:', error);
    return [];
  }
};

/**
 * Direct database query to get user roles - simplified approach
 */
export const getUserRolesDirect = async (userId: string): Promise<UserRole[]> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles!inner (
          name
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user roles:', error);
      return [];
    }

    const roles = data?.map((ur: any) => ur.roles.name as UserRole) || [];
    console.log('Roles fetched successfully:', roles);
    return roles;
  } catch (error) {
    console.error('Exception in getUserRolesDirect:', error);
    return [];
  }
};

/**
 * Safe profile loading
 */
export const getUserProfileSafe = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getUserProfileSafe:', error);
    return null;
  }
};
