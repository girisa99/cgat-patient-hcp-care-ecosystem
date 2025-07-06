
/**
 * Module Types - Aligned with Database Schema
 * These types match exactly with the 'modules' table in the database
 */

export interface DatabaseModule {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface ModuleCreateInput {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface ModuleUpdateInput {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ModuleStats {
  total: number;
  active: number;
  inactive: number;
}

export interface ModuleIntegrityCheck {
  isHealthy: boolean;
  totalModules: number;
  activeModules: number;
  issues: string[];
}
