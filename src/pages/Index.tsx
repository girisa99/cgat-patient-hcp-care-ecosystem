
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntelligentRouting } from '@/hooks/useIntelligentRouting';
import { useAuthContext } from '@/components/auth/AuthProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Index = () => {
  const navigate = useNavigate();
  const { performIntelligentRouting, isRouting } = useIntelligentRouting();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    const handleRouting = async () => {
      // Wait for auth to load
      if (loading) return;

      // If no user, redirect to login or stay on index
      if (!user) {
        console.log('No user found, staying on index page');
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

  // If no user, show a simple landing page or redirect to auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Healthcare Portal
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Please sign in to access your dashboard
          </p>
        </div>
      </div>
    );
  }

  // This should rarely be seen as intelligent routing should redirect
  return <LoadingSpinner />;
};

export default Index;
