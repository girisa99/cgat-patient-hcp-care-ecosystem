
import React from 'react';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { UnifiedPageWrapper } from '@/components/layout/UnifiedPageWrapper';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const { isAuthenticated, isLoading, signIn } = useAuthContext();

  console.log('🏠 Index page - Auth state:', { isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading application...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Healthcare Management System</h1>
            <p className="text-gray-600 mb-6">Please sign in to continue</p>
            <Button 
              onClick={() => signIn('demo@example.com', 'demo123')}
              className="w-full"
            >
              Demo Sign In
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              This is a demo system. Click above to sign in with demo credentials.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <UnifiedPageWrapper
      title="Healthcare Management Dashboard"
      subtitle="Unified system overview with consolidated data sources"
      fluid
      showSystemStatus={true}
    >
      <UnifiedDashboard />
    </UnifiedPageWrapper>
  );
};

export default Index;
