
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import ComprehensiveLoginForm from '@/components/auth/ComprehensiveLoginForm';
import HealthcareAuthLayoutWithLogo from '@/components/auth/HealthcareAuthLayoutWithLogo';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthContext();

  console.log('🔐 LoginPage: Auth state:', { isAuthenticated, isLoading });

  // Show loading while checking auth
  if (isLoading) {
    return (
      <HealthcareAuthLayoutWithLogo>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </HealthcareAuthLayoutWithLogo>
    );
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    console.log('✅ User already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <HealthcareAuthLayoutWithLogo>
      <ComprehensiveLoginForm />
    </HealthcareAuthLayoutWithLogo>
  );
};

export default LoginPage;
