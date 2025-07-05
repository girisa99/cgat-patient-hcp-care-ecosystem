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

  // Live collections - these will be populated by real queries later
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

  // Search helpers (temporary no-op implementations)
  const searchUsers = (query: string) => {
    // Simple client-side search; replace with Supabase full-text later
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

  /** Generic helper: refetch any cached queries (tRPC / SWR / React-Query) */
  const invalidateCache = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).revalidate?.(); // optional
  };

  const refreshData = useCallback(() => {
    // TODO: implement real data refresh
    console.log('Refreshing data...');
    invalidateCache();
  }, []);

  /* ----------------------------------------- Fetch Users */
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          phone,
          created_at,
          is_active,
          user_roles ( role:roles ( name, description ) )
        `);

      if (error) throw error;

      // Supabase returns nested arrays; normalise to MasterUser[]
      const normalised = (data as any[]).map((p) => ({
        ...p,
        user_roles: (p.user_roles || []).map((ur: any) => ({
          role: ur.role,
        })),
      })) as MasterUser[];

      setUsers(normalised);
    } catch (err) {
      console.error('[MasterData] fetchUsers failed', err);
      // Fallback: fetch profiles without join if FK not present yet
      try {
        const { data: profilesOnly, error: fallbackErr } = await supabase
          .from('profiles')
          .select('*');
        if (fallbackErr) throw fallbackErr;
        const mapped = (profilesOnly as any[]).map((p) => ({
          ...p,
          is_active: true,
          user_roles: [],
        })) as MasterUser[];
        setUsers(mapped);
      } catch (fallbackErr) {
        setError((fallbackErr as Error).message);
        console.error('[MasterData] fallback fetchUsers failed', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ----------------------------------------- Fetch Roles */
  const fetchRoles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      if (error) throw error;
      setRoles(data as Role[]);
    } catch (err) {
      console.error('[MasterData] fetchRoles failed', err);
    }
  }, []);

  /* ----------------------------------------- Fetch Facilities */
  const fetchFacilities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*');
      if (error) throw error;
      setFacilities(data as Facility[]);
    } catch (err) {
      console.error('[MasterData] fetchFacilities failed', err);
    }
  }, []);

  /* ----------------------------------------- Fetch Modules */
  const fetchModules = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*');
      if (error) throw error;
      setModules(data as Module[]);
    } catch (err) {
      console.error('[MasterData] fetchModules failed', err);
    }
  }, []);

  // initial load
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchFacilities();
    fetchModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------------------------------- Users */
  const createUser = useCallback(
    async (user: { firstName: string; lastName: string; email: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        // Create user profile - note: we can't create auth users directly
        const { error } = await supabase.from("profiles").insert({
          id: crypto.randomUUID(), // Generate a UUID for the profile
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
        });
        if (error) throw error;
        invalidateCache();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deactivateUser = useCallback(
    async ({ userId }: { userId: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase
          .from('profiles')
          // Suppress TS since is_active may not be in generated types yet
          .update({ is_active: false } as any)
          .eq('id', userId);
        if (error) throw error;
        invalidateCache();
        await fetchUsers();
      } catch (err) {
        setError((err as Error).message);
        console.error('[MasterData] deactivateUser failed', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Add role assignment methods for compatibility
  const assignRole = useCallback(async (payload: { userId: string; roleId: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('user_roles').insert({
        user_id: payload.userId,
        role_id: payload.roleId,
      });
      if (error) throw error;
      invalidateCache();
      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
      console.error('[MasterData] assignRole failed', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* -------------------------------------------------- Facilities */
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
          facility_type: 'treatmentFacility' as const, // Add required facility_type
        });
        if (error) throw error;
        invalidateCache();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /* -------------------------------------------------- Patients */
  const createPatient = useCallback(
    async (data: { firstName: string; lastName: string; dob: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        // Note: There's no patients table in the schema, so this is a placeholder
        console.log('Patient creation requested:', data);
        invalidateCache();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /* -------------------------------------------------- API Services */
  const createApiService = useCallback(
    async (service: { name: string; description?: string; type: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase.from('api_integration_registry').insert({
          name: service.name,
          description: service.description,
          type: service.type,
          category: 'integration',
          purpose: 'internal',
          direction: 'outbound',
          status: 'active',
        });
        if (error) throw error;
        invalidateCache();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /* -------------------------------------------------- Modules */
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
        invalidateCache();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const assignModule = useCallback(async (payload: { userId: string; moduleId: string; accessLevel: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('user_module_assignments').insert({
        user_id: payload.userId,
        module_id: payload.moduleId,
        is_active: true,
        assigned_at: new Date().toISOString(),
      });
      if (error) throw error;
      invalidateCache();
    } catch (err) {
      setError((err as Error).message);
      console.error('[MasterData] assignModule failed', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const assignFacility = useCallback(async (payload: { userId: string; facilityId: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('user_facilities').insert({
        user_id: payload.userId,
        facility_id: payload.facilityId,
        is_primary: false,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      invalidateCache();
    } catch (err) {
      setError((err as Error).message);
      console.error('[MasterData] assignFacility failed', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* -------------------------------------------------- Update User */
  const updateUser = useCallback(async (userId: string, fields: Partial<MasterUser>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(fields as any)
        .eq('id', userId);
      if (error) throw error;
      invalidateCache();
      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
      console.error('[MasterData] updateUser failed', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* -------------------------------------------------- Remove Role / Facility / Module */
  const removeRole = useCallback(async (payload: { userId: string; roleId: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('user_roles')
        .delete()
        .eq('user_id', payload.userId)
        .eq('role_id', payload.roleId);
      if (error) throw error;
      invalidateCache();
      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
      console.error('[MasterData] removeRole failed', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFacility = useCallback(async (payload: { userId: string; facilityId: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('user_facilities')
        .delete()
        .eq('user_id', payload.userId)
        .eq('facility_id', payload.facilityId);
      if (error) throw error;
      invalidateCache();
      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
      console.error('[MasterData] removeFacility failed', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeModule = useCallback(async (payload: { userId: string; moduleId: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('user_module_assignments')
        .delete()
        .eq('user_id', payload.userId)
        .eq('module_id', payload.moduleId);
      if (error) throw error;
      invalidateCache();
      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
      console.error('[MasterData] removeModule failed', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* -------------------------------------------------- Resend Email Verification */
  const resendEmailVerification = useCallback(async (payload: { userId: string; email: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      // If you have a Supabase function or external service trigger it here
      // Placeholder: just console log
      console.log('Resend verification email to', payload.email);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    /* mutations */
    createUser,
    deactivateUser,
    updateUser,
    createFacility,
    createPatient,
    createApiService,
    createModule,
    refreshData,
    assignRole, // Add for compatibility
    assignModule,
    assignFacility,
    removeRole,
    removeFacility,
    removeModule,
    resendEmailVerification,

    /* live read-models */
    users,
    facilities,
    apiServices,
    modules,
    roles, // Add for compatibility
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
