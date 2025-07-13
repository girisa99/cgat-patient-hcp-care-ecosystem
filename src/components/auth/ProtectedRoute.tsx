import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

const ProtectedRoute = ({ children, requiredRoles, requiredPermissions }: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated, user, userRoles } = useMasterAuth();
  const navigate = useNavigate();

  // ProtectedRoute check

  // Check role-based access
  const hasRequiredRole = !requiredRoles || requiredRoles.length === 0 || 
    requiredRoles.some(role => userRoles.includes(role));

  useEffect(() => {
    // Only redirect if not loading and not authenticated - redirect to login instead of index
    if (!isLoading && !isAuthenticated) {
      console.log('🔄 Redirecting to login for authentication...');
      navigate('/login', { replace: true });
    }
    // Check role access after authentication
    else if (!isLoading && isAuthenticated && !hasRequiredRole) {
      console.log('🚫 Insufficient permissions, redirecting to home...');
      navigate('/', { replace: true });
    }
  }, [isLoading, isAuthenticated, hasRequiredRole, navigate]);

  // Show loading spinner while checking auth
  if (isLoading) {
    console.log('⏳ ProtectedRoute loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading...</span>
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

  // If authenticated but lacks required roles
  if (!hasRequiredRole) {
    console.log('🚫 Insufficient permissions, redirecting...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Insufficient permissions...</span>
      </div>
    );
  }

  console.log('✅ ProtectedRoute allowing access');
  return <>{children}</>;
};

export default ProtectedRoute;
