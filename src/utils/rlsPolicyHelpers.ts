
// RLS Policy Helper Functions
// These functions help prevent infinite recursion by providing secure, non-recursive ways to check permissions

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

/**
 * Safely check if a user has a specific role without causing RLS recursion
 * This function uses the existing has_role database function which is SECURITY DEFINER
 */
export const checkUserRole = async (userId: string, roleName: UserRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_role', {
      user_id: userId,
      role_name: roleName
    });

    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Exception in checkUserRole:', error);
    return false;
  }
};

/**
 * Safely check if a user has a specific permission without causing RLS recursion
 */
export const checkUserPermission = async (userId: string, permissionName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_permission', {
      user_id: userId,
      permission_name: permissionName
    });

    if (error) {
      console.error('Error checking user permission:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Exception in checkUserPermission:', error);
    return false;
  }
};

/**
 * Get accessible facilities for a user using the database function
 */
export const getUserAccessibleFacilities = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_user_accessible_facilities', {
      user_id: userId
    });

    if (error) {
      console.error('Error getting accessible facilities:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getUserAccessibleFacilities:', error);
    return [];
  }
};
