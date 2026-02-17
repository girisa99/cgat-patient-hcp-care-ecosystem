/**
 * MASTER USER MANAGEMENT TYPES - SINGLE SOURCE OF TRUTH
 * Consolidated re-exports from masterTypes to prevent drift
 * Version: user-management-types-v8.0.0
 */
import type { MasterUser as BaseMasterUser } from '@/types/masterTypes';

// Backward-compatible export that preserves all existing consumer expectations
export type MasterUser = Omit<BaseMasterUser, 'is_email_verified' | 'user_roles'> & {
  // Relax strict fields used across the app to avoid breakage
  is_email_verified?: boolean;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  email_confirmed?: boolean;
  user_roles: {
    role: {
      name: string;
      description?: string | null;
    };
  }[];
};

export type UserWithRoles = MasterUser;

