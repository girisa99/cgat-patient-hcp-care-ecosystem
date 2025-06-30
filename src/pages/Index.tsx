
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntelligentRouting } from '@/hooks/useIntelligentRouting';
import { useAuthContext } from '@/components/auth/AuthProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LoginForm from '@/components/auth/LoginForm';
import HealthcareAuthLayout from '@/components/auth/HealthcareAuthLayout';
import { AuthTestComponent } from '@/components/auth/AuthTestComponent';

const Index = () => {
  const navigate = useNavigate();
  const { performIntelligentRouting, isRouting } = useIntelligentRouting();
  const { user, loading } = useAuthContext();
  const [routingAttempted, setRoutingAttempted] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);

  useEffect(() => {
    const handleRouting = async () => {
      // Wait for auth to load
      if (loading) {
        console.log('⏳ Auth still loading...');
        return;
      }

      // If no user, stay on index to show login form
      if (!user) {
        console.log('👤 No user found, showing login form');
        setRoutingAttempted(true);
        return;
      }

      // If we already attempted routing, don't try again
      if (routingAttempted) {
        console.log('🔄 Routing already attempted, skipping...');
        return;
      }

      try {
        console.log('🚀 User authenticated, performing intelligent routing...');
        setRoutingAttempted(true);
        await performIntelligentRouting();
        
        // Add a timeout fallback to prevent infinite loading
        const timeout = setTimeout(() => {
          console.log('⚠️ Intelligent routing timed out, falling back to dashboard');
          setRoutingError('Routing took too long, redirecting to dashboard...');
          navigate('/dashboard', { replace: true });
        }, 5000); // 5 second timeout

        // Clear timeout if component unmounts
        return () => clearTimeout(timeout);
      } catch (error) {
        console.error('❌ Error during intelligent routing:', error);
        setRoutingError('Routing failed, redirecting to dashboard...');
        // Fallback to dashboard on error with a small delay to show the error
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      }
    };

    handleRouting();
  }, [performIntelligentRouting, navigate, user, loading, routingAttempted]);

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while routing is in progress
  if (isRouting && user && !routingError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if routing failed
  if (routingError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-orange-600">{routingError}</p>
        </div>
      </div>
    );
  }

  // If no user, show the login form and test component
  if (!user) {
    return (
      <HealthcareAuthLayout>
        <div className="space-y-8">
          <LoginForm />
          <div className="border-t pt-8">
            <h2 className="text-lg font-semibold text-center mb-4">Development Tools</h2>
            <AuthTestComponent />
          </div>
        </div>
      </HealthcareAuthLayout>
    );
  }

  // Fallback - this should rarely be seen
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Preparing your dashboard...</p>
      </div>
    </div>
  );
};

export default Index;
