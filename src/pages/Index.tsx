
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useSimpleRouting } from '@/hooks/useSimpleRouting';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CleanLoginForm from '@/components/auth/CleanLoginForm';
import HealthcareAuthLayout from '@/components/auth/HealthcareAuthLayout';
import AuthDiagnostic from '@/components/auth/AuthDiagnostic';

const Index = () => {
  const { user, loading, isAuthenticated, userRoles, initialized } = useAuthContext();
  const { performRouting } = useSimpleRouting({ userRoles, isAuthenticated });
  const [hasAttemptedRouting, setHasAttemptedRouting] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [routingTimeout, setRoutingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (routingTimeout) {
      clearTimeout(routingTimeout);
    }

    // Only attempt routing once we have complete auth data
    if (!initialized || loading) {
      console.log('⏳ Waiting for auth initialization...');
      return;
    }

    if (!isAuthenticated) {
      console.log('👤 No authentication, showing login form');
      setHasAttemptedRouting(true);
      return;
    }

    // If authenticated, attempt routing regardless of role status
    if (isAuthenticated && !hasAttemptedRouting) {
      console.log('🚀 User authenticated, attempting routing...');
      console.log('📊 Current user roles:', userRoles);
      
      setHasAttemptedRouting(true);
      
      // Set a timeout to perform routing, allowing time for roles to load
      const timeout = setTimeout(() => {
        console.log('🚀 Performing routing with roles:', userRoles);
        performRouting();
      }, 500); // Give roles time to load
      
      setRoutingTimeout(timeout);
    }

    return () => {
      if (routingTimeout) {
        clearTimeout(routingTimeout);
      }
    };
  }, [initialized, loading, isAuthenticated, userRoles, hasAttemptedRouting, performRouting]);

  // Show loading while initializing
  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Initializing GENIE...</p>
        </div>
      </div>
    );
  }

  // Show routing message for authenticated users
  if (isAuthenticated && !hasAttemptedRouting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  // If authenticated but still on index after routing attempt, show a manual option
  if (isAuthenticated && hasAttemptedRouting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Welcome Back!</h3>
            <p className="text-green-700 mb-4">
              You are successfully logged in as {user?.email}
            </p>
            <p className="text-sm text-green-600 mb-4">
              Roles: {userRoles.length > 0 ? userRoles.join(', ') : 'Loading...'}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/users'}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Go to Users
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show diagnostic tool if enabled
  if (showDiagnostic) {
    return (
      <HealthcareAuthLayout>
        <div className="space-y-4">
          <button
            onClick={() => setShowDiagnostic(false)}
            className="mb-4 text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Login
          </button>
          <AuthDiagnostic />
        </div>
      </HealthcareAuthLayout>
    );
  }

  // Show login form for unauthenticated users
  return (
    <HealthcareAuthLayout>
      <div className="space-y-4">
        <CleanLoginForm />
        <div className="text-center">
          <button
            onClick={() => setShowDiagnostic(true)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Having login issues? Run diagnostics
          </button>
        </div>
      </div>
    </HealthcareAuthLayout>
  );
};

export default Index;
