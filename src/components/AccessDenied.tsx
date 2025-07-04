import React from 'react';
import { ShieldX, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMasterAuth } from '@/hooks/useMasterAuth';

interface AccessDeniedProps {
  requiredPermission?: string;
  requiredRole?: string;
  message?: string;
  showReturnButton?: boolean;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredPermission,
  requiredRole,
  message,
  showReturnButton = true
}) => {
  const { user, userRoles, isAuthenticated } = useMasterAuth();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const getAccessDeniedMessage = () => {
    if (message) return message;
    
    if (!isAuthenticated) {
      return 'You must be logged in to access this page.';
    }
    
    if (!userRoles || userRoles.length === 0) {
      return 'No roles have been assigned to your account. Please contact your administrator.';
    }
    
    if (requiredPermission) {
      return `You need the "${requiredPermission}" permission to access this page.`;
    }
    
    if (requiredRole) {
      return `You need the "${requiredRole}" role to access this page.`;
    }
    
    return 'You do not have permission to access this page.';
  };

  const getHelpText = () => {
    if (!isAuthenticated) {
      return 'Please log in with an account that has the appropriate permissions.';
    }
    
    if (!userRoles || userRoles.length === 0) {
      return 'Contact your system administrator to have roles assigned to your account.';
    }
    
    return 'Contact your system administrator if you believe you should have access to this page.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Insufficient Permissions
                </p>
                <p className="text-sm text-yellow-700">
                  {getAccessDeniedMessage()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Your Current Access:</h4>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">User:</span>
                <span className="font-medium">{user?.email || 'Unknown'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Roles:</span>
                <span className="font-medium">
                  {userRoles && userRoles.length > 0 
                    ? userRoles.join(', ') 
                    : 'No roles assigned'
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  isAuthenticated 
                    ? userRoles && userRoles.length > 0 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {isAuthenticated 
                    ? userRoles && userRoles.length > 0 
                      ? 'Authenticated' 
                      : 'No Roles'
                    : 'Not Authenticated'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Need Help?</strong> {getHelpText()}
            </p>
          </div>

          {showReturnButton && (
            <div className="flex space-x-3">
              <Button 
                onClick={handleGoBack} 
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button 
                onClick={handleGoHome}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;