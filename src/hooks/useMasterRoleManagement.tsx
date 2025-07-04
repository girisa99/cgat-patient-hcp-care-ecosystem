
/**
 * MASTER ROLE MANAGEMENT HOOK - SINGLE SOURCE OF TRUTH
 * Handles ALL role-based operations: roles, facilities, modules, permissions
 * Version: master-role-management-v1.0.0
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import { useCallback, useMemo } from 'react';

// SINGLE CACHE KEY for all role operations
const MASTER_ROLE_CACHE_KEY = ['master-role-management'];

export interface MasterRole {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MasterFacility {
  id: string;
  name: string;
  facility_type: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

export interface MasterModule {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface MasterPermission {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
  facilityId?: string;
  moduleIds: string[];
  permissionIds: string[];
  assignedAt: string;
  expiresAt?: string;
}

/**
 * THE SINGLE MASTER HOOK FOR ALL ROLE-BASED OPERATIONS
 */
export const useMasterRoleManagement = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();
  
  console.log('🏆 MASTER ROLE MANAGEMENT - Single Source of Truth Active');

  // ====================== SINGLE CACHE INVALIDATION ======================
  const invalidateCache = useCallback(() => {
    console.log('🔄 Invalidating master role management cache...');
    queryClient.invalidateQueries({ queryKey: MASTER_ROLE_CACHE_KEY });
  }, [queryClient]);

  // ====================== FETCH ALL ROLES ======================
  const {
    data: roles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: [...MASTER_ROLE_CACHE_KEY, 'roles'],
    queryFn: async (): Promise<MasterRole[]> => {
      console.log('🔍 Fetching roles from single source...');
      
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // ====================== FETCH ALL FACILITIES ======================
  const {
    data: facilities = [],
    isLoading: facilitiesLoading,
    error: facilitiesError,
  } = useQuery({
    queryKey: [...MASTER_ROLE_CACHE_KEY, 'facilities'],
    queryFn: async (): Promise<MasterFacility[]> => {
      console.log('🔍 Fetching facilities from single source...');
      
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // ====================== FETCH ALL MODULES ======================
  const {
    data: modules = [],
    isLoading: modulesLoading,
    error: modulesError,
  } = useQuery({
    queryKey: [...MASTER_ROLE_CACHE_KEY, 'modules'],
    queryFn: async (): Promise<MasterModule[]> => {
      console.log('🔍 Fetching modules from single source...');
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // ====================== FETCH ALL PERMISSIONS ======================
  const {
    data: permissions = [],
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useQuery({
    queryKey: [...MASTER_ROLE_CACHE_KEY, 'permissions'],
    queryFn: async (): Promise<MasterPermission[]> => {
      console.log('🔍 Fetching permissions from single source...');
      
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // ====================== CREATE ROLE MUTATION ======================
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: { name: string; description?: string }) => {
      console.log('🔄 Creating role via MASTER hook:', roleData);
      
      const { data, error } = await supabase
        .from('roles')
        .insert({
          name: roleData.name,
          description: roleData.description,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newRole) => {
      invalidateCache();
      showSuccess("Role Created", `${newRole.name} has been created successfully.`);
      console.log('✅ Role created via MASTER hook:', newRole.id);
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message || "Failed to create role");
      console.error('❌ Role creation failed in MASTER hook:', error);
    }
  });

  // ====================== CREATE FACILITY MUTATION ======================
  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: { 
      name: string; 
      facility_type: string; 
      address?: string; 
      phone?: string; 
      email?: string;
    }) => {
      console.log('🔄 Creating facility via MASTER hook:', facilityData);
      
      const { data, error } = await supabase
        .from('facilities')
        .insert({
          name: facilityData.name,
          facility_type: facilityData.facility_type,
          address: facilityData.address,
          phone: facilityData.phone,
          email: facilityData.email,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newFacility) => {
      invalidateCache();
      showSuccess("Facility Created", `${newFacility.name} has been created successfully.`);
      console.log('✅ Facility created via MASTER hook:', newFacility.id);
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message || "Failed to create facility");
      console.error('❌ Facility creation failed in MASTER hook:', error);
    }
  });

  // ====================== ASSIGN USER ROLE MUTATION ======================
  const assignUserRoleMutation = useMutation({
    mutationFn: async (assignment: {
      userId: string;
      roleId: string;
      facilityId?: string;
      moduleIds?: string[];
    }) => {
      console.log('🔄 Assigning user role via MASTER hook:', assignment);
      
      // Assign role to user
      const { data: roleAssignment, error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: assignment.userId,
          role_id: assignment.roleId
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // Assign facility if provided
      if (assignment.facilityId) {
        const { error: facilityError } = await supabase
          .from('user_facility_access')
          .insert({
            user_id: assignment.userId,
            facility_id: assignment.facilityId,
            access_level: 'full',
            is_active: true
          });

        if (facilityError) throw facilityError;
      }

      // Assign modules if provided
      if (assignment.moduleIds && assignment.moduleIds.length > 0) {
        const moduleAssignments = assignment.moduleIds.map(moduleId => ({
          user_id: assignment.userId,
          module_id: moduleId,
          is_active: true
        }));

        const { error: moduleError } = await supabase
          .from('user_module_assignments')
          .insert(moduleAssignments);

        if (moduleError) throw moduleError;
      }

      return roleAssignment;
    },
    onSuccess: () => {
      invalidateCache();
      showSuccess("Role Assigned", "User role has been assigned successfully.");
      console.log('✅ User role assigned via MASTER hook');
    },
    onError: (error: any) => {
      showError("Assignment Failed", error.message || "Failed to assign role");
      console.error('❌ Role assignment failed in MASTER hook:', error);
    }
  });

  // ====================== UTILITY FUNCTIONS ======================
  const getActiveRoles = useCallback(() => {
    return roles.filter(r => r.is_active);
  }, [roles]);

  const getActiveFacilities = useCallback(() => {
    return facilities.filter(f => f.is_active);
  }, [facilities]);

  const getActiveModules = useCallback(() => {
    return modules.filter(m => m.is_active);
  }, [modules]);

  const getRoleById = useCallback((id: string) => {
    return roles.find(r => r.id === id);
  }, [roles]);

  const getFacilityById = useCallback((id: string) => {
    return facilities.find(f => f.id === id);
  }, [facilities]);

  const getModuleById = useCallback((id: string) => {
    return modules.find(m => m.id === id);
  }, [modules]);

  // ====================== ROLE MANAGEMENT STATS ======================
  const roleStats = useMemo(() => {
    const totalRoles = roles.length;
    const activeRoles = getActiveRoles().length;
    const totalFacilities = facilities.length;
    const activeFacilities = getActiveFacilities().length;
    const totalModules = modules.length;
    const activeModules = getActiveModules().length;
    
    return {
      totalRoles,
      activeRoles,
      inactiveRoles: totalRoles - activeRoles,
      totalFacilities,
      activeFacilities,
      inactiveFacilities: totalFacilities - activeFacilities,
      totalModules,
      activeModules,
      inactiveModules: totalModules - activeModules,
      totalPermissions: permissions.length
    };
  }, [roles, facilities, modules, permissions, getActiveRoles, getActiveFacilities, getActiveModules]);

  // ====================== DEFAULT ROLE ASSIGNMENTS ======================
  const getDefaultModulesForRole = useCallback((roleName: string) => {
    const defaultAssignments = {
      'superAdmin': modules.map(m => m.id), // All modules
      'onboardingTeam': modules.filter(m => 
        ['User Management', 'Onboarding Management', 'Facility Management'].includes(m.name)
      ).map(m => m.id),
      'patientCaregiver': modules.filter(m => 
        ['Patient Management', 'Communication'].includes(m.name)
      ).map(m => m.id),
      'staff': modules.filter(m => 
        ['Patient Management', 'Facility Management'].includes(m.name)
      ).map(m => m.id),
      'technicalServices': modules.filter(m => 
        ['API Services', 'Testing Suite', 'Workflow Automation', 'CMS'].includes(m.name)
      ).map(m => m.id)
    };

    return defaultAssignments[roleName as keyof typeof defaultAssignments] || [];
  }, [modules]);

  return {
    // ===== SINGLE DATA SOURCES =====
    roles,
    facilities,
    modules,
    permissions,
    
    // ===== ACTIVE FILTERS =====
    activeRoles: getActiveRoles(),
    activeFacilities: getActiveFacilities(),
    activeModules: getActiveModules(),
    
    // ===== LOADING STATES =====
    isLoading: rolesLoading || facilitiesLoading || modulesLoading || permissionsLoading,
    isCreatingRole: createRoleMutation.isPending,
    isCreatingFacility: createFacilityMutation.isPending,
    isAssigningRole: assignUserRoleMutation.isPending,
    
    // ===== ERROR STATES =====
    error: rolesError || facilitiesError || modulesError || permissionsError,
    
    // ===== ACTIONS =====
    createRole: createRoleMutation.mutate,
    createFacility: createFacilityMutation.mutate,
    assignUserRole: assignUserRoleMutation.mutate,
    refreshData: invalidateCache,
    
    // ===== UTILITIES =====
    getRoleById,
    getFacilityById,
    getModuleById,
    getDefaultModulesForRole,
    getRoleStats: () => roleStats,
    
    // ===== META INFORMATION =====
    meta: {
      dataSource: 'SINGLE master role management system',
      lastUpdated: new Date().toISOString(),
      version: 'master-role-management-v1.0.0',
      singleSourceOfTruth: true,
      consolidatedOperations: true,
      totalRoles: roleStats.totalRoles,
      totalFacilities: roleStats.totalFacilities,
      totalModules: roleStats.totalModules,
      totalPermissions: roleStats.totalPermissions,
      cacheKey: MASTER_ROLE_CACHE_KEY.join('-'),
      hookCount: 1, // THE ONLY HOOK FOR ROLE MANAGEMENT
      architecturePrinciple: 'single-source-of-truth',
      noMockData: true,
      noTestData: true,
      noDuplicateHooks: true,
      dynamicRoleAssignment: true,
      flexibleFacilityManagement: true,
      modulePermissionIntegration: true
    }
  };
};

// Export type for components to use
export type MasterRoleManagementHook = ReturnType<typeof useMasterRoleManagement>;
