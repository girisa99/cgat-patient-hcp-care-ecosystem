import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useMasterAuth } from './useMasterAuth';

interface TenantContextType {
  tenant: string | null;
  tenants: string[];
  setTenant: (tenant: string) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { profile, isAuthenticated } = useMasterAuth();
  const [tenant, setTenant] = useState<string | null>(null);
  const [tenants, setTenants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Derive tenant info from the user profile or metadata. In a full
  // implementation you might query a `user_tenants` table. For now we look for
  // `tenant_id` or `schema` fields on the profile.
  useEffect(() => {
    if (!isAuthenticated) {
      setTenant(null);
      setTenants([]);
      setIsLoading(false);
      return;
    }

    // Attempt to determine current tenant.
    const tenantFromProfile = (profile as any)?.tenant_id || (profile as any)?.schema;
    const availableTenants: string[] = [];
    if (tenantFromProfile) availableTenants.push(tenantFromProfile);

    setTenant(tenantFromProfile ?? null);
    setTenants(availableTenants);
    setIsLoading(false);
  }, [profile, isAuthenticated]);

  const value: TenantContextType = {
    tenant,
    tenants,
    setTenant,
    isLoading,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within a TenantProvider');
  return ctx;
};