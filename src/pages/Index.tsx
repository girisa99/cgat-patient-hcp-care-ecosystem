
import { useEffect } from 'react';
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

  useEffect(() => {
    const handleRouting = async () => {
      // Wait for auth to load
      if (loading) return;

      // If no user, stay on index to show login form
      if (!user) {
        console.log('No user found, showing login form');
        return;
      }

      try {
        console.log('User authenticated, performing intelligent routing...');
        await performIntelligentRouting();
        
        // Add a timeout fallback in case routing gets stuck
        const timeout = setTimeout(() => {
          console.log('Intelligent routing timed out, falling back to dashboard');
          navigate('/dashboard', { replace: true });
        }, 3000);

        // Clear timeout if component unmounts
        return () => clearTimeout(timeout);
      } catch (error) {
        console.error('Error during intelligent routing:', error);
        // Fallback to dashboard on error
        navigate('/dashboard', { replace: true });
      }
    };

    handleRouting();
  }, [performIntelligentRouting, navigate, user, loading]);

  // Show loading while auth is loading or routing is in progress
  if (loading || isRouting) {
    return <LoadingSpinner />;
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

  // This should rarely be seen as intelligent routing should redirect
  return <LoadingSpinner />;
};

export default Index;
