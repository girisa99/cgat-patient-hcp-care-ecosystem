
import React from 'react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import UnifiedVerificationTabs from './UnifiedVerificationTabs';
import { useAuthValidation } from '@/hooks/useAuthValidation';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface VerificationResultsTabsProps {
  verificationResult: AdminModuleVerificationResult;
}

const VerificationResultsTabs: React.FC<VerificationResultsTabsProps> = ({
  verificationResult
}) => {
  // Enhanced verification with user access validation
  const { 
    validationResult, 
    isValidating, 
    securityAlerts, 
    validateAuth,
    securityLevel,
    isSecure,
    hasSecurityAlerts 
  } = useAuthValidation();

  const { clearPermissionCache, cacheSize } = usePermissions();

  const handleSecurityRefresh = () => {
    console.log('🔄 Refreshing security validation...');
    clearPermissionCache();
    validateAuth();
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Security Status Panel */}
      <Card className={`border-2 ${
        isSecure 
          ? 'border-green-200 bg-green-50/50' 
          : hasSecurityAlerts 
            ? 'border-red-200 bg-red-50/50'
            : 'border-yellow-200 bg-yellow-50/50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={`h-5 w-5 ${
                isSecure ? 'text-green-600' : hasSecurityAlerts ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <CardTitle className="text-lg">
                User Access Validation Status
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                securityLevel === 'high' ? 'default' : 
                securityLevel === 'medium' ? 'secondary' : 'destructive'
              }>
                {securityLevel.toUpperCase()} Security
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSecurityRefresh}
                disabled={isValidating}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isValidating ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {validationResult ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {validationResult.userRolesCount > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">Roles</span>
                </div>
                <p className="text-2xl font-bold">{validationResult.userRolesCount}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {validationResult.effectivePermissions.length > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">Permissions</span>
                </div>
                <p className="text-2xl font-bold">{validationResult.effectivePermissions.length}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {validationResult.facilitiesAccessible > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium">Facilities</span>
                </div>
                <p className="text-2xl font-bold">{validationResult.facilitiesAccessible}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {validationResult.hasActiveModules ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">Module Access</span>
                </div>
                <p className="text-2xl font-bold">{validationResult.hasActiveModules ? 'Yes' : 'No'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">
                {isValidating ? 'Validating user access...' : 'No validation data available'}
              </p>
            </div>
          )}

          {/* Security Alerts */}
          {securityAlerts.length > 0 && (
            <div className="mt-4 p-3 border border-red-200 rounded-lg bg-red-50">
              <h4 className="font-medium text-red-800 mb-2">Security Alerts:</h4>
              <ul className="list-disc list-inside space-y-1">
                {securityAlerts.map((alert, index) => (
                  <li key={index} className="text-sm text-red-700">{alert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Cache Information */}
          {cacheSize > 0 && (
            <div className="mt-4 p-2 border border-blue-200 rounded bg-blue-50">
              <p className="text-xs text-blue-700">
                📋 {cacheSize} permission(s) cached for improved performance
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Original Verification Tabs */}
      <UnifiedVerificationTabs 
        verificationResult={verificationResult}
      />
    </div>
  );
};

export default VerificationResultsTabs;
