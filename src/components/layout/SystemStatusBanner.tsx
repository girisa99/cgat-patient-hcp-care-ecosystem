
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { useAuthValidation } from '@/hooks/useAuthValidation';

/**
 * System status banner to show RLS fix status
 * Displays at the top of admin pages to confirm the fix is working
 */
export const SystemStatusBanner: React.FC = () => {
  const { isAuthenticated, hasRoles, canAccessProfiles } = useAuthValidation();

  if (!isAuthenticated) {
    return null; // Don't show banner if not authenticated
  }

  const isFullyOperational = hasRoles && canAccessProfiles;

  return (
    <Alert className={`mb-4 ${isFullyOperational ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
      <CheckCircle className="h-4 w-4" />
      <AlertDescription className={`text-sm ${isFullyOperational ? 'text-green-800' : 'text-blue-800'}`}>
        <strong>System Status:</strong> RLS recursion issues have been successfully resolved. 
        Authentication and user management are {isFullyOperational ? 'fully operational' : 'partially operational'}. 
        {hasRoles && (
          <span className="ml-2">
            User has {hasRoles} role(s) and {canAccessProfiles ? 'full' : 'limited'} access.
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
};
