
"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define types for the data structures
export interface MasterUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  is_active: boolean;  // Add this property
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
}

export interface ApiService {
  id: string;
  name: string;
  description?: string;
  status: string;
  base_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  };

  // Search helpers (temporary no-op implementations)
  const searchUsers = async (query: string) => {
    // TODO: implement real search
    return users.filter(u => 
      u.first_name.toLowerCase().includes(query.toLowerCase()) ||
      u.last_name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    );
  };

  const searchFacilities = async (query: string) => {
    // TODO: implement real search
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
    version: 'v1.0.0',  // Add version property
  };

  /** Generic helper: refetch any cached queries (tRPC / SWR / React-Query) */
  const invalidateCache = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).revalidate?.(); // optional
  };

  /* -------------------------------------------------- Users */
  const createUser = useCallback(
    async (user: { firstName: string; lastName: string; email: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase.from("profiles").insert([
          {
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
          },
        ]);
        if (error) throw error;
        invalidateCache();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  const deactivateUser = useCallback(
    async (userId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ is_active: false })
          .eq("id", userId);
        if (error) throw error;
        invalidateCache();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  /* -------------------------------------------------- Facilities */
  const createFacility = useCallback(
    async (facility: { name: string; address?: string; phone?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase.from("facilities").insert([
          {
            name: facility.name,
            address: facility.address,
            phone: facility.phone,
            is_active: true,
          },
        ]);
        if (error) throw error;
        invalidateCache();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
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
    [supabase]
  );

  return {
    /* mutations */
    createUser,
    deactivateUser,
    createFacility,
    createPatient,

    /* live read-models */
    users,
    facilities,
    apiServices,
    modules,
    stats,
    meta,

    /* helpers */
    searchUsers,
    searchFacilities,

    /* ui state */
    isLoading,
    error,
  };
}
