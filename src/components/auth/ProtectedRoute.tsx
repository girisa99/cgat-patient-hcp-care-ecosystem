import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated, user } = useMasterAuth();
  const navigate = useNavigate();

  console.log('🛡️ ProtectedRoute check:', { isLoading, isAuthenticated, hasUser: !!user });

  useEffect(() => {
    // Only redirect if not loading and not authenticated - redirect to login instead of index
    if (!isLoading && !isAuthenticated) {
      console.log('🔄 Redirecting to login for authentication...');
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

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

  console.log('✅ ProtectedRoute allowing access');
  return <>{children}</>;
};

export default ProtectedRoute;
