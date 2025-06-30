
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

  useEffect(() => {
    // Only attempt routing once we have complete auth data
    if (!initialized || loading) {
      console.log('⏳ Waiting for clean auth initialization...');
      return;
    }

    if (!isAuthenticated) {
      console.log('👤 No authentication, showing clean login form');
      setHasAttemptedRouting(true);
      return;
    }

    if (userRoles.length === 0) {
      console.log('⚠️ User authenticated but no roles found');
      setHasAttemptedRouting(true);
      return;
    }

    if (!hasAttemptedRouting) {
      console.log('🚀 Performing automatic routing with clean auth...');
      setHasAttemptedRouting(true);
      
      // Small delay to ensure UI is ready
      setTimeout(() => {
        performRouting();
      }, 100);
    }
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
  if (isAuthenticated && userRoles.length > 0 && !hasAttemptedRouting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show no roles message for authenticated users without roles
  if (isAuthenticated && userRoles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Account Setup Required</h3>
            <p className="text-yellow-700 mb-4">
              Your account is authenticated but no roles have been assigned yet.
            </p>
            <p className="text-sm text-yellow-600">
              Please contact your administrator to assign appropriate roles to your account.
            </p>
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

  // Show clean login form for unauthenticated users
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
