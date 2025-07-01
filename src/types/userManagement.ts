
/**
 * Consolidated User Management Types
 * Centralized type definitions for all user-related functionality
 */

import { Database } from '@/integrations/supabase/types';

// Base types from database
export type UserRole = Database['public']['Enums']['user_role'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Extended user types
export interface UserWithRoles extends Profile {
  updated_at: string; // Make this required to match the database schema
  user_roles: {
    role_id: string; // Add the missing role_id property
    roles: {
      name: UserRole;
      description: string | null;
    };
  }[];
  facilities?: {
    id: string;
    name: string;
    facility_type: string;
  } | null;
}

// User management operation types
export interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  department?: string;
  role: UserRole;
  facility_id?: string;
}

export interface AssignRoleData {
  userId: string;
  roleName: UserRole;
}

export interface AssignFacilityData {
  userId: string;
  facilityId: string;
  accessLevel?: 'read' | 'write' | 'admin';
}

// UI component props
export interface UserListProps {
  onCreateUser: () => void;
  onAssignRole: (userId: string) => void;
  onRemoveRole?: (userId: string) => void;
  onAssignFacility: (userId: string) => void;
  onEditUser: (user: UserWithRoles) => void;
}

export interface UserActionProps {
  user: UserWithRoles;
  onEditUser: (user: UserWithRoles) => void;
  onAssignRole: (userId: string) => void;
  onRemoveRole?: (userId: string) => void;
  onAssignFacility: (userId: string) => void;
  onManagePermissions: (userId: string, userName: string) => void;
  onAssignModule: (userId: string, userName: string) => void;
}

// Stats interface
export interface UserManagementStats {
  totalUsers: number;
  usersWithRoles: number;
  usersWithFacilities: number;
  activeUsers: number;
}
