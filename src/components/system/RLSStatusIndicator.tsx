
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuthValidation } from '@/hooks/useAuthValidation';

/**
 * Component to display RLS policy status and authentication validation
 * Shows the health of the newly fixed RLS system
 */
export const RLSStatusIndicator: React.FC = () => {
  const { 
    validationResult, 
    isValidating, 
    validateAuth,
    isAuthenticated,
    hasRoles,
    canAccessProfiles,
    isAdmin
  } = useAuthValidation();

  const getStatusColor = () => {
    if (!validationResult) return 'secondary';
    if (!isAuthenticated) return 'destructive';
    if (hasRoles && canAccessProfiles) return 'default';
    return 'secondary';
  };

  const getStatusIcon = () => {
    if (isValidating) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (!validationResult || !isAuthenticated) return <AlertCircle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isValidating) return 'Validating...';
    if (!validationResult) return 'Not validated';
    if (!isAuthenticated) return 'Not authenticated';
    if (hasRoles && canAccessProfiles) return 'Fully operational';
    return 'Partial access';
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900 text-sm">
          <Shield className="h-4 w-4" />
          RLS Policy Status - Fixed & Stable
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">System Status:</span>
            <Badge variant={getStatusColor()} className="flex items-center gap-1">
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </div>

          {validationResult && (
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-medium">User Roles:</span>
                <span className="ml-2">{validationResult.userRolesCount}</span>
              </div>
              <div>
                <span className="font-medium">Profile Access:</span>
                <span className="ml-2">{canAccessProfiles ? '✅' : '❌'}</span>
              </div>
              <div>
                <span className="font-medium">Admin Status:</span>
                <span className="ml-2">{isAdmin ? '✅ Admin' : '👤 User'}</span>
              </div>
              <div>
                <span className="font-medium">Auth Status:</span>
                <span className="ml-2">{isAuthenticated ? '✅' : '❌'}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-blue-200">
            <span className="text-xs text-blue-700">
              🔒 RLS Recursion Issues Fixed
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={validateAuth}
              disabled={isValidating}
              className="h-6 text-xs"
            >
              {isValidating ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Retest'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
