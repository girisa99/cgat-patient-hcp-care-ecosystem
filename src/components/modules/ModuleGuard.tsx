
import React from 'react';
import { useModules } from '@/hooks/useModules';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface ModuleGuardProps {
  moduleName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

const ModuleGuard: React.FC<ModuleGuardProps> = ({
  moduleName,
  children,
  fallback,
  showAccessDenied = true
}) => {
  const { hasModuleAccess, isLoadingUserModules } = useModules();
  const { userRoles } = useAuthContext();

  console.log('🛡️ ModuleGuard checking access for:', moduleName);
  console.log('🛡️ User roles:', userRoles);
  console.log('🛡️ Loading modules:', isLoadingUserModules);

  if (isLoadingUserModules) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Checking access...</span>
      </div>
    );
  }

  const hasAccess = hasModuleAccess(moduleName);
  console.log('🛡️ Final access decision for', moduleName, ':', hasAccess);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showAccessDenied) {
      return (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You don't have access to the <strong>{moduleName}</strong> module. 
            Contact your administrator to request access.
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-xs">
                <strong>Debug:</strong> Roles: {userRoles.join(', ')}
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
};

export default ModuleGuard;
