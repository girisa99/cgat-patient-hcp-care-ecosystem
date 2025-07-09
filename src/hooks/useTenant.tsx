import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useMasterAuth } from './useMasterAuth';

export interface Tenant {
  id: string;
  name: string;
  schema: string; // Postgres schema to use, e.g. public, public_dev, org_123
}

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  setTenant: (tenant: Tenant) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { profile, isAuthenticated } = useMasterAuth();
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tenant from user profile or localStorage
  useEffect(() => {
    const loadTenant = async () => {
      setIsLoading(true);
      try {
        // 1. Try localStorage override (let the user switch orgs in future)
        const cached = localStorage.getItem('activeTenant');
        if (cached) {
          setTenantState(JSON.parse(cached));
          return;
        }

        // 2. Derive from profile if available
        if (isAuthenticated && profile?.org_id) {
          // Example mapping ‑ adapt to your table structure
          setTenantState({
            id: profile.org_id,
            name: profile.org_name || 'Default Tenant',
            schema: profile.schema || 'public',
          });
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTenant();
  }, [isAuthenticated, profile]);

  const setTenant = (t: Tenant) => {
    localStorage.setItem('activeTenant', JSON.stringify(t));
    setTenantState(t);
  };

  return (
    <TenantContext.Provider value={{ tenant, isLoading, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return ctx;
};