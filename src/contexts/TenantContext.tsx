import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterData } from '@/hooks/useMasterData';
import { getUserAccessibleFacilities } from '@/utils/rlsPolicyHelpers';

// Facility interface (multi-tenant context)
interface TenantFacility {
  facility_id: string;
  facility_name: string;
  access_level: string;
  facility_type: string;
  is_active: boolean;
}

// Tenant context interface
interface TenantContextType {
  // Current tenant state
  currentFacility: TenantFacility | null;
  userFacilities: TenantFacility[];
  
  // Tenant management
  switchFacility: (facilityId: string) => void;
  clearFacilityContext: () => void;
  
  // Tenant permissions
  hasAccessToFacility: (facilityId: string) => boolean;
  canAccessCrossTenant: () => boolean;
  getFacilityPermission: (facilityId: string) => string | null;
  
  // Loading states
  isLoadingFacilities: boolean;
  facilityError: string | null;
  
  // Multi-tenant metadata
  isSuperAdmin: boolean;
  isMultiTenantUser: boolean;
  meta: {
    provider: string;
    version: string;
    tenantScope: 'single' | 'multi' | 'global';
  };
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Tenant Context Provider
export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, userRoles, isAuthenticated } = useMasterAuth();
  const { facilities } = useMasterData();
  
  const [currentFacility, setCurrentFacility] = useState<TenantFacility | null>(null);
  const [userFacilities, setUserFacilities] = useState<TenantFacility[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);
  const [facilityError, setFacilityError] = useState<string | null>(null);

  // Check if user is super admin (cross-tenant access)
  const isSuperAdmin = userRoles.includes('superAdmin');
  const isMultiTenantUser = userFacilities.length > 1 || isSuperAdmin;

  // Load user's accessible facilities
  useEffect(() => {
    const loadUserFacilities = async () => {
      if (!user || !isAuthenticated) {
        setUserFacilities([]);
        setCurrentFacility(null);
        return;
      }

      setIsLoadingFacilities(true);
      setFacilityError(null);

      try {
        console.log('🏢 Loading facilities for tenant context...');
        
        if (isSuperAdmin) {
          // Super admins get access to all facilities
          const allFacilities = facilities.map(f => ({
            facility_id: f.id,
            facility_name: f.name,
            access_level: 'admin',
            facility_type: f.facility_type,
            is_active: f.is_active || true
          }));
          setUserFacilities(allFacilities);
          
          // Auto-select first facility if none selected
          if (!currentFacility && allFacilities.length > 0) {
            setCurrentFacility(allFacilities[0]);
          }
        } else {
          // Regular users get their assigned facilities
          const accessibleFacilities = await getUserAccessibleFacilities(user.id);
          const facilitiesWithDetails = accessibleFacilities.map(af => {
            const facilityDetail = facilities.find(f => f.id === af.facility_id);
            return {
              facility_id: af.facility_id,
              facility_name: af.facility_name,
              access_level: af.access_level,
              facility_type: facilityDetail?.facility_type || 'unknown',
              is_active: facilityDetail?.is_active || true
            };
          });
          
          setUserFacilities(facilitiesWithDetails);
          
          // Auto-select first facility if none selected
          if (!currentFacility && facilitiesWithDetails.length > 0) {
            setCurrentFacility(facilitiesWithDetails[0]);
          }
        }

        console.log('✅ Tenant facilities loaded successfully');
      } catch (error) {
        console.error('❌ Error loading tenant facilities:', error);
        setFacilityError(error instanceof Error ? error.message : 'Failed to load facilities');
      } finally {
        setIsLoadingFacilities(false);
      }
    };

    loadUserFacilities();
  }, [user, isAuthenticated, facilities, isSuperAdmin]);

  // Switch to a different facility (tenant switching)
  const switchFacility = (facilityId: string) => {
    const targetFacility = userFacilities.find(f => f.facility_id === facilityId);
    if (targetFacility) {
      console.log(`🔄 Switching to facility: ${targetFacility.facility_name}`);
      setCurrentFacility(targetFacility);
      
      // Store in localStorage for persistence
      localStorage.setItem('currentFacilityId', facilityId);
    } else {
      console.warn('❌ Cannot switch to facility - no access:', facilityId);
    }
  };

  // Clear facility context (logout scenario)
  const clearFacilityContext = () => {
    setCurrentFacility(null);
    setUserFacilities([]);
    localStorage.removeItem('currentFacilityId');
    console.log('🧹 Facility context cleared');
  };

  // Check if user has access to specific facility
  const hasAccessToFacility = (facilityId: string): boolean => {
    if (isSuperAdmin) return true;
    return userFacilities.some(f => f.facility_id === facilityId);
  };

  // Check if user can access multiple tenants
  const canAccessCrossTenant = (): boolean => {
    return isSuperAdmin || userFacilities.length > 1;
  };

  // Get permission level for specific facility
  const getFacilityPermission = (facilityId: string): string | null => {
    if (isSuperAdmin) return 'admin';
    const facility = userFacilities.find(f => f.facility_id === facilityId);
    return facility?.access_level || null;
  };

  // Determine tenant scope
  const getTenantScope = (): 'single' | 'multi' | 'global' => {
    if (isSuperAdmin) return 'global';
    if (userFacilities.length > 1) return 'multi';
    return 'single';
  };

  // Restore facility from localStorage on mount
  useEffect(() => {
    const savedFacilityId = localStorage.getItem('currentFacilityId');
    if (savedFacilityId && userFacilities.length > 0 && !currentFacility) {
      const savedFacility = userFacilities.find(f => f.facility_id === savedFacilityId);
      if (savedFacility) {
        setCurrentFacility(savedFacility);
      }
    }
  }, [userFacilities]);

  const contextValue: TenantContextType = {
    // Current state
    currentFacility,
    userFacilities,
    
    // Actions
    switchFacility,
    clearFacilityContext,
    
    // Permissions
    hasAccessToFacility,
    canAccessCrossTenant,
    getFacilityPermission,
    
    // Loading
    isLoadingFacilities,
    facilityError,
    
    // Metadata
    isSuperAdmin,
    isMultiTenantUser,
    meta: {
      provider: 'supabase',
      version: 'tenant-context-v1.0.0',
      tenantScope: getTenantScope()
    }
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

// Hook to use tenant context
export const useTenantContext = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};

// Utility hook for facility-specific operations
export const useFacilityScope = () => {
  const { currentFacility, hasAccessToFacility, getFacilityPermission } = useTenantContext();
  
  return {
    currentFacilityId: currentFacility?.facility_id || null,
    currentFacilityName: currentFacility?.facility_name || null,
    currentFacilityType: currentFacility?.facility_type || null,
    
    // Scoped operations
    requireFacilityAccess: (facilityId: string) => {
      if (!hasAccessToFacility(facilityId)) {
        throw new Error(`No access to facility: ${facilityId}`);
      }
    },
    
    // Permission checks
    canRead: (facilityId?: string) => {
      const targetId = facilityId || currentFacility?.facility_id;
      if (!targetId) return false;
      const permission = getFacilityPermission(targetId);
      return ['read', 'write', 'admin'].includes(permission || '');
    },
    
    canWrite: (facilityId?: string) => {
      const targetId = facilityId || currentFacility?.facility_id;
      if (!targetId) return false;
      const permission = getFacilityPermission(targetId);
      return ['write', 'admin'].includes(permission || '');
    },
    
    canAdmin: (facilityId?: string) => {
      const targetId = facilityId || currentFacility?.facility_id;
      if (!targetId) return false;
      const permission = getFacilityPermission(targetId);
      return permission === 'admin';
    }
  };
};