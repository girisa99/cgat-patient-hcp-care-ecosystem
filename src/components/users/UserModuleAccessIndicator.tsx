
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Loader2 } from 'lucide-react';
import { useModules } from '@/hooks/useModules';

interface UserModuleAccessIndicatorProps {
  userId: string;
  compact?: boolean;
}

const UserModuleAccessIndicator: React.FC<UserModuleAccessIndicatorProps> = ({ 
  userId, 
  compact = false 
}) => {
  const { userModules, isLoadingUserModules } = useModules();

  if (isLoadingUserModules) {
    return (
      <div className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  // For now, showing a placeholder since the hook doesn't filter by user ID
  // This would need to be enhanced with proper user-specific module filtering
  const userSpecificModules = userModules?.slice(0, 2) || [];

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Shield className="h-3 w-3 text-blue-600" />
        <Badge variant="outline" className="text-xs">
          {userSpecificModules.length} modules
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Shield className="h-3 w-3 text-blue-600" />
        <span className="text-xs font-medium text-gray-700">Module Access:</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {userSpecificModules.length > 0 ? (
          userSpecificModules.map((module) => (
            <Badge key={module.module_id} variant="outline" className="text-xs">
              {module.module_name}
            </Badge>
          ))
        ) : (
          <Badge variant="outline" className="text-xs text-gray-400">
            No Modules
          </Badge>
        )}
      </div>
    </div>
  );
};

export default UserModuleAccessIndicator;
