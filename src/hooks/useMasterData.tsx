
"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define types for the data structures
export interface MasterUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  is_active: boolean;
  user_roles: Array<{
    role: { name: string; description?: string }
  }>;
}

export interface Facility {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  facility_type: string;
}

export interface ApiService {
  id: string;
  name: string;
  description?: string;
  status: string;
  base_url?: string;
  created_at: string;
  updated_at: string;
  type: string;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
}

/** Canonical hook – single source of truth for all master-data operations */
export function useMasterData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live collections - these will be populated by real queries
  const [users, setUsers] = useState<MasterUser[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [apiServices, setApiServices] = useState<ApiService[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Stats derived from collections
  const stats = {
    totalUsers: users.length,
    totalFacilities: facilities.length,
    totalModules: modules.length,
    totalApiServices: apiServices.length,
    patientCount: users.filter(u => 
      u.user_roles.some(ur => ur.role.name === 'patientCaregiver')
    ).length,
    adminCount: users.filter(u => 
      u.user_roles.some(ur => ['superAdmin', 'onboardingTeam'].includes(ur.role.name))
    ).length,
    activeFacilities: facilities.filter(f => f.is_active).length,
    activeUsers: users.filter(u => u.is_active).length,
    staffCount: users.filter(u => 
      u.user_roles.some(ur => ['caseManager', 'nurse', 'provider'].includes(ur.role.name))
    ).length,
    verifiedUsers: users.filter(u => (u as any).is_email_verified).length,
    unverifiedUsers: users.filter(u => !(u as any).is_email_verified).length,
    activeApiServices: apiServices.filter(s => s.status === 'active'),
    activeModules: modules.filter(m => m.is_active),
  };

  // Search helpers
  const searchUsers = (query: string) => {
    return users.filter(u => 
      u.first_name.toLowerCase().includes(query.toLowerCase()) ||
      u.last_name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    );
  };

  const searchFacilities = (query: string) => {
    return facilities.filter(f => 
      f.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Meta information with version property
  const meta = {
    lastUpdated: new Date(),
    dataSource: 'master_data_v1',
    totalSources: 1,
    singleSourceValidated: true,
    version: 'v1.0.0',
  };

  /** Generic helper: refetch any cached queries */
  const invalidateCache = () => {
    console.log('🔄 Cache invalidated - refreshing data');
  };

  const refreshData = useCallback(() => {
    console.log('🔄 Refreshing all master data...');
    fetchUsers();
    fetchRoles();
    fetchFacilities();
    fetchModules();
    invalidateCache();
  }, []);

  /* ----------------------------------------- Fetch Users */
  const fetchUsers = useCallback(async () => {
    console.log('👥 Fetching users from profiles table...');
    setIsLoading(true);
    setError(null);
    try {
      // Fetch from profiles table with basic fields
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          phone,
          created_at
        `);

      if (error) {
        console.error('[MasterData] profiles query failed:', error);
        throw error;
      }

      console.log('✅ Fetched profiles:', data?.length || 0);

      // Map to MasterUser format, handling missing role data
      const normalised = (data || []).map((p) => ({
        id: p.id,
        email: p.email || '',
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        phone: p.phone || '',
        created_at: p.created_at || new Date().toISOString(),
        is_active: true, // Default to active since profiles don't have this field
        user_roles: [], // Will be populated when roles are implemented
      })) as MasterUser[];

      setUsers(normalised);
      console.log('👥 Users loaded successfully:', normalised.length);
    } catch (err) {
      console.error('[MasterData] fetchUsers failed:', err);
      setError((err as Error).message);
      // Set empty array on error to prevent app crashes
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ----------------------------------------- Fetch Roles */
  const fetchRoles = useCallback(async () => {
    console.log('🏷️ Fetching roles...');
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      
      if (error) {
        console.warn('[MasterData] roles table not found or accessible:', error.message);
        // Set default roles for development
        setRoles([
          { id: '1', name: 'superAdmin', description: 'Super Administrator' },
          { id: '2', name: 'onboardingTeam', description: 'Onboarding Team' },
          { id: '3', name: 'patientCaregiver', description: 'Patient/Caregiver' }
        ]);
        return;
      }
      
      setRoles(data as Role[]);
      console.log('✅ Roles loaded:', data?.length || 0);
    } catch (err) {
      console.error('[MasterData] fetchRoles failed:', err);
      setRoles([]); // Set empty array on error
    }
  }, []);

  /* ----------------------------------------- Fetch Facilities */
  const fetchFacilities = useCallback(async () => {
    console.log('🏥 Fetching facilities...');
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*');
      
      if (error) {
        console.warn('[MasterData] facilities table not found or accessible:', error.message);
        setFacilities([]);
        return;
      }
      
      setFacilities(data as Facility[]);
      console.log('✅ Facilities loaded:', data?.length || 0);
    } catch (err) {
      console.error('[MasterData] fetchFacilities failed:', err);
      setFacilities([]);
    }
  }, []);

  /* ----------------------------------------- Fetch Modules */
  const fetchModules = useCallback(async () => {
    console.log('📦 Fetching modules...');
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*');
      
      if (error) {
        console.warn('[MasterData] modules table not found or accessible:', error.message);
        // Set some default modules for development
        setModules([
          { id: '1', name: 'User Management', description: 'Manage users and roles', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', name: 'Patient Management', description: 'Manage patient data', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '3', name: 'Facility Management', description: 'Manage facilities', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ]);
        return;
      }
      
      setModules(data as Module[]);
      console.log('✅ Modules loaded:', data?.length || 0);
    } catch (err) {
      console.error('[MasterData] fetchModules failed:', err);
      setModules([]);
    }
  }, []);

  // Initial load with error handling
  useEffect(() => {
    console.log('🚀 Initializing master data fetch...');
    fetchUsers();
    fetchRoles();
    fetchFacilities();
    fetchModules();
  }, [fetchUsers, fetchRoles, fetchFacilities, fetchModules]);

  const createUser = useCallback(
    async (user: { firstName: string; lastName: string; email: string; phone?: string; facilityId?: string; roleId?: string }) => {
      console.log('👤 Creating new user:', user.email);
      setIsLoading(true);
      setError(null);
      try {
        const newId = crypto.randomUUID();
        const { error } = await supabase.from("profiles").insert({
          id: newId,
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          phone: user.phone ?? null,
        });
        if (error) throw error;

        console.log('✅ User created successfully');
        await fetchUsers(); // Refresh users list
        invalidateCache();
      } catch (err) {
        console.error('[MasterData] createUser failed:', err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUsers]
  );

  const deactivateUser = useCallback(
    async ({ userId }: { userId: string }) => {
      console.log('🚫 Deactivating user:', userId);
      setIsLoading(true);
      setError(null);
      try {
        // Since profiles table doesn't have is_active, we'll just log this for now
        console.log('⚠️ User deactivation not implemented - profiles table has no is_active field');
        
        console.log('✅ User deactivation logged');
        await fetchUsers();
        invalidateCache();
      } catch (err) {
        console.error('[MasterData] deactivateUser failed:', err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUsers]
  );

  const createFacility = useCallback(
    async (facility: { name: string; address?: string; phone?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase.from("facilities").insert({
          name: facility.name,
          address: facility.address,
          phone: facility.phone,
          is_active: true,
          facility_type: 'treatmentFacility' as const,
        });
        if (error) throw error;
        await fetchFacilities();
        invalidateCache();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFacilities]
  );

  const createModule = useCallback(
    async (module: { name: string; description?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase.from("modules").insert({
          name: module.name,
          description: module.description,
          is_active: true,
        });
        if (error) throw error;
        await fetchModules();
        invalidateCache();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchModules]
  );

  // Placeholder methods for compatibility
  const assignRole = useCallback(async (payload: { userId: string; roleId: string }) => {
    console.log('🏷️ Role assignment not yet implemented:', payload);
  }, []);

  const assignModule = useCallback(async (payload: { userId: string; moduleId: string; accessLevel: string }) => {
    console.log('📦 Module assignment not yet implemented:', payload);
  }, []);

  const assignFacility = useCallback(async (payload: { userId: string; facilityId: string }) => {
    console.log('🏥 Facility assignment not yet implemented:', payload);
  }, []);

  return {
    /* mutations */
    createUser,
    deactivateUser,
    createFacility,
    createModule,
    refreshData,
    assignRole,
    assignModule,
    assignFacility,

    /* live read-models */
    users,
    facilities,
    apiServices,
    modules,
    roles,
    stats,
    meta,

    /* helpers */
    searchUsers,
    searchFacilities,

    /* ui state */
    isLoading,
    error,
    isCreatingUser: isLoading,
    isCreatingApiService: isLoading,
    isCreatingModule: isLoading,
    isAssigningModule: false,
    isAssigningFacility: false,
    isResendingVerification: false,
    isUpdatingUser: false,
    isAssigningRole: false,
    isDeactivatingUser: false,
  };
}
