
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';

export const NavigationDiagnostic: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuthContext();

  const testNavigation = (path: string) => {
    console.log(`🔍 Testing navigation to: ${path}`);
    try {
      navigate(path);
    } catch (error) {
      console.error(`❌ Navigation error to ${path}:`, error);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Navigation Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Current Path:</strong> {location.pathname}
          </div>
          <div>
            <strong>Auth Status:</strong> {isLoading ? 'Loading...' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </div>
          <div>
            <strong>User ID:</strong> {user?.id || 'None'}
          </div>
          <div>
            <strong>Timestamp:</strong> {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => testNavigation('/')}>
            Dashboard
          </Button>
          <Button size="sm" onClick={() => testNavigation('/users')}>
            Users
          </Button>
          <Button size="sm" onClick={() => testNavigation('/patients')}>
            Patients
          </Button>
          <Button size="sm" onClick={() => testNavigation('/testing')}>
            Testing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
