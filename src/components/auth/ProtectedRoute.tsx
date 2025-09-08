import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useTenantContext, useFacilityScope } from '@/contexts/TenantContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { normalizeRoles, normalizeRoleName } from '@/utils/roles';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  
  // MULTI-TENANT ENHANCEMENTS
  facilityAccess?: 'read' | 'write' | 'admin';
  requireFacilityContext?: boolean;
  allowedFacilityTypes?: string[];
}

const ProtectedRoute = ({ 
  children, 
  requiredRoles, 
  requiredPermissions, 
  facilityAccess,
  requireFacilityContext,
  allowedFacilityTypes
}: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated, user, userRoles } = useMasterAuth();
  const { currentFacility, isSuperAdmin, isLoadingFacilities } = useTenantContext();
  const { canRead, canWrite, canAdmin } = useFacilityScope();
  const navigate = useNavigate();

  const normalizedUserRoles = normalizeRoles(userRoles);
  const normalizedRequiredRoles = requiredRoles?.map(normalizeRoleName);

  // Defer role checks until roles are loaded to avoid false redirects
  const rolesStillLoading = Boolean(
    isAuthenticated &&
    requiredRoles &&
    requiredRoles.length > 0 &&
    userRoles.length === 0
  );

  // ProtectedRoute check

  // Check role-based access
  const hasRequiredRole = !normalizedRequiredRoles || normalizedRequiredRoles.length === 0 || 
    normalizedRequiredRoles.some(role => normalizedUserRoles.includes(role)) || isSuperAdmin;

  // Check facility-based access
  const hasFacilityAccess = () => {
    if (isSuperAdmin) return true;
    if (!requireFacilityContext) return true;
    if (!currentFacility) return false;
    
    // Check facility type restrictions
    if (allowedFacilityTypes && allowedFacilityTypes.length > 0) {
      if (!allowedFacilityTypes.includes(currentFacility.facility_type)) {
        return false;
      }
    }
    
    // Check facility permission level
    if (facilityAccess) {
      switch (facilityAccess) {
        case 'read': return canRead();
        case 'write': return canWrite();
        case 'admin': return canAdmin();
        default: return false;
      }
    }
    
    return true;
  };

  const hasValidFacilityAccess = hasFacilityAccess();

  useEffect(() => {
    // Only redirect if not loading and not authenticated
    if (!isLoading && !isLoadingFacilities && !isAuthenticated) {
      console.log('🔄 Redirecting to login for authentication...');
      navigate('/login', { replace: true });
      return;
    }
    // Wait for roles to load before enforcing role checks
    if (rolesStillLoading) {
      console.log('⏳ Waiting for roles to load before access check...');
      return;
    }
    // Check role and facility access after authentication
    if (!isLoading && !isLoadingFacilities && isAuthenticated && (!hasRequiredRole || !hasValidFacilityAccess)) {
      console.log('🚫 Insufficient permissions, redirecting to home...');
      navigate('/', { replace: true });
    }
  }, [isLoading, isLoadingFacilities, isAuthenticated, rolesStillLoading, hasRequiredRole, hasValidFacilityAccess, navigate]);

  // Show loading spinner while checking auth, roles, and facilities
  if (isLoading || isLoadingFacilities || rolesStillLoading) {
    console.log('⏳ ProtectedRoute loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">{rolesStillLoading ? 'Loading permissions...' : 'Loading...'}</span>
      </div>
    );
  }

  // If not authenticated, show loading (redirect will happen via useEffect)
  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Redirecting to login...</span>
      </div>
    );
  }

  // If authenticated but lacks required roles or facility access
  if (!hasRequiredRole || !hasValidFacilityAccess) {
    const reason = !hasRequiredRole ? 'role permissions' : 'facility access';
    console.log(`🚫 Insufficient ${reason}, redirecting...`);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Insufficient {reason}...</span>
      </div>
    );
  }

  console.log('✅ ProtectedRoute allowing access');
  return <>{children}</>;
};

export default ProtectedRoute;
