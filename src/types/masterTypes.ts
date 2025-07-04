/**
 * MASTER TYPE DEFINITIONS - SINGLE SOURCE OF TRUTH
 * All data interfaces aligned with database schema
 * Version: master-types-v1.0.0
 */

// ====================== CORE USER TYPES ======================
export interface MasterUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_email_verified: boolean;
  facility_id?: string;
  is_active?: boolean;
  deactivated_at?: string;
  created_at: string;
  updated_at?: string;
  facility?: MasterFacility;
  user_roles: Array<{
    id: string;
    role: MasterRole;
  }>;
  assigned_modules?: Array<{
    id: string;
    module: MasterModule;
    access_level: string;
  }>;
}

// Profile interface aligned with database and auth
export interface MasterProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_email_verified: boolean;
  facility_id?: string;
  is_active?: boolean;
  deactivated_at?: string;
  created_at: string;
  updated_at?: string;
  user_roles?: Array<{
    role: {
      id: string;
      name: string;
      description?: string;
    };
  }>;
}

// ====================== FACILITY TYPES ======================
export interface MasterFacility {
  id: string;
  name: string;
  facility_type: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// ====================== MODULE TYPES ======================
export interface MasterModule {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// ====================== ROLE TYPES ======================
export interface MasterRole {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// ====================== API SERVICE TYPES ======================
export interface MasterApiService {
  id: string;
  name: string;
  status: string;
  type: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

// ====================== ASSIGNMENT TYPES ======================
export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by?: string;
  created_at: string;
  role: MasterRole;
}

export interface UserModuleAssignment {
  id: string;
  user_id: string;
  module_id: string;
  access_level: string;
  is_active: boolean;
  expires_at?: string;
  assigned_by?: string;
  created_at: string;
  updated_at?: string;
  module: MasterModule;
}

export interface RoleModuleAssignment {
  id: string;
  role_id: string;
  module_id: string;
  access_level: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  role: MasterRole;
  module: MasterModule;
}

// ====================== QUERY TYPES ======================
export interface MasterDataQueryOptions {
  includeInactive?: boolean;
  includeRoles?: boolean;
  includeModules?: boolean;
  includeFacilities?: boolean;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

// ====================== MUTATION TYPES ======================
export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  facilityId?: string;
  roleId?: string;
}

export interface AssignRoleData {
  userId: string;
  roleId: string;
}

export interface AssignModuleData {
  userId: string;
  moduleId: string;
  accessLevel?: string;
}

export interface AssignFacilityData {
  userId: string;
  facilityId: string;
}

// ====================== STATISTICS TYPES ======================
export interface MasterDataStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  patientCount: number;
  adminCount: number;
  staffCount: number;
  totalFacilities: number;
  activeFacilities: number;
  totalModules: number;
  activeModules: number;
  totalApiServices: number;
  activeApiServices: number;
  totalRoles: number;
}

// ====================== AUTH TYPES ======================
export interface MasterAuthContext {
  user: any | null; // Supabase User type
  session: any | null; // Supabase Session type
  profile: MasterProfile | null;
  userRoles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

// ====================== VALIDATION TYPES ======================
export interface TypeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  alignmentScore: number;
}

// ====================== DATABASE ALIGNMENT TYPES ======================
export interface DatabaseTableStructure {
  tableName: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
    foreignKey?: {
      table: string;
      column: string;
    };
  }>;
}

export interface TypeScriptInterfaceStructure {
  interfaceName: string;
  properties: Array<{
    name: string;
    type: string;
    optional: boolean;
  }>;
}

export interface AlignmentCheck {
  table: DatabaseTableStructure;
  interface: TypeScriptInterfaceStructure;
  alignment: TypeValidationResult;
}

// ====================== EXPORT LEGACY COMPATIBILITY ======================
// For backward compatibility, re-export with legacy names
export type UserWithRoles = MasterUser;
export type Profile = MasterProfile;
export type Facility = MasterFacility;
export type Module = MasterModule;
export type Role = MasterRole;
export type ApiService = MasterApiService;

// ====================== TYPE GUARDS ======================
export function isMasterUser(obj: any): obj is MasterUser {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.first_name === 'string' &&
    typeof obj.last_name === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.is_email_verified === 'boolean' &&
    Array.isArray(obj.user_roles);
}

export function isMasterProfile(obj: any): obj is MasterProfile {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.first_name === 'string' &&
    typeof obj.last_name === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.is_email_verified === 'boolean';
}

export function isMasterFacility(obj: any): obj is MasterFacility {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.facility_type === 'string' &&
    typeof obj.is_active === 'boolean';
}

export function isMasterModule(obj: any): obj is MasterModule {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.is_active === 'boolean';
}

export function isMasterRole(obj: any): obj is MasterRole {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.name === 'string';
}

// ====================== CONSTANTS ======================
export const MASTER_DATA_CACHE_KEY = ['master-data'] as const;
export const MASTER_AUTH_CACHE_KEY = ['master-auth'] as const;

export const ACCESS_LEVELS = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin'
} as const;

export const ROLE_NAMES = {
  SUPER_ADMIN: 'superAdmin',
  ADMIN: 'admin',
  ONBOARDING_TEAM: 'onboardingTeam',
  HEALTHCARE_PROVIDER: 'healthcareProvider',
  CASE_MANAGER: 'caseManager',
  NURSE: 'nurse',
  PATIENT_CAREGIVER: 'patientCaregiver',
  FINANCE_TEAM: 'financeTeam',
  CONTRACT_TEAM: 'contractTeam',
  WORKFLOW_MANAGER: 'workflowManager',
  TECHNICAL_SERVICES: 'technicalServices'
} as const;

export const MODULE_NAMES = {
  DASHBOARD: 'Dashboard',
  USER_MANAGEMENT: 'User Management',
  PATIENT_MANAGEMENT: 'Patient Management',
  FACILITY_MANAGEMENT: 'Facility Management',
  MODULE_MANAGEMENT: 'Module Management',
  API_SERVICES: 'API Services',
  SECURITY_MANAGEMENT: 'Security Management',
  TESTING_SUITE: 'Testing Suite',
  DATA_IMPORT_EXPORT: 'Data Import/Export',
  ACTIVE_VERIFICATION: 'Active Verification',
  ONBOARDING: 'Onboarding',
  CARE_COORDINATION: 'Care Coordination',
  CONTENT_MANAGEMENT: 'Content Management',
  WORKFLOW_AUTOMATION: 'Workflow Automation'
} as const;

export type AccessLevel = typeof ACCESS_LEVELS[keyof typeof ACCESS_LEVELS];
export type RoleName = typeof ROLE_NAMES[keyof typeof ROLE_NAMES];
export type ModuleName = typeof MODULE_NAMES[keyof typeof MODULE_NAMES];