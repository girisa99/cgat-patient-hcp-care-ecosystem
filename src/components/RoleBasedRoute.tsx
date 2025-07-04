import React from 'react';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import AccessDenied from './AccessDenied';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  path: string;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallbackComponent?: React.ComponentType<any>;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  path,
  requiredPermissions = [],
  requiredRoles = [],
  fallbackComponent: FallbackComponent = AccessDenied
}) => {
  const { isAuthenticated, isLoading, userRoles } = useMasterAuth();
  const { hasAccess, hasPermission } = useRoleBasedNavigation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return (
      <FallbackComponent 
        message="You must be logged in to access this page."
        showReturnButton={false}
      />
    );
  }

  // Check roles
  if (!userRoles || userRoles.length === 0) {
    return (
      <FallbackComponent 
        message="No roles have been assigned to your account. Please contact your administrator."
      />
    );
  }

  // Check specific role requirements
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRequiredRole) {
      return (
        <FallbackComponent 
          requiredRole={requiredRoles.join(' or ')}
          message={`You need one of these roles to access this page: ${requiredRoles.join(', ')}`}
        />
      );
    }
  }

  // Check specific permission requirements
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => hasPermission(permission));
    if (!hasRequiredPermission) {
      return (
        <FallbackComponent 
          requiredPermission={requiredPermissions.join(' or ')}
          message={`You need one of these permissions to access this page: ${requiredPermissions.join(', ')}`}
        />
      );
    }
  }

  // Check general path access
  if (!hasAccess(path)) {
    return (
      <FallbackComponent 
        message="You do not have permission to access this page."
      />
    );
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default RoleBasedRoute;