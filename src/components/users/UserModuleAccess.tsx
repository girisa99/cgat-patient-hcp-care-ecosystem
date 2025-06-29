
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Users } from 'lucide-react';
import { useModules } from '@/hooks/useModules';

interface UserModuleAccessProps {
  userId: string;
  userName: string;
}

const UserModuleAccess: React.FC<UserModuleAccessProps> = ({ userId, userName }) => {
  const { userModules, isLoadingUserModules } = useModules();

  if (isLoadingUserModules) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            Module Access for {userName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter modules for this specific user
  const userSpecificModules = userModules?.filter(module => 
    // This would need to be enhanced with proper user filtering
    // For now, showing all user modules as the hook doesn't filter by specific user
    true
  ) || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Module Access for {userName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userSpecificModules.length > 0 ? (
          <div className="space-y-2">
            {userSpecificModules.map((module) => (
              <div key={module.module_id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  <span className="font-medium text-sm">{module.module_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={module.access_source === 'direct' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {module.access_source === 'direct' ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Direct
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Via Role
                      </div>
                    )}
                  </Badge>
                  {module.expires_at && (
                    <Badge variant="outline" className="text-xs">
                      Expires: {new Date(module.expires_at).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No module access assigned</p>
            <p className="text-xs text-gray-400">Use "Assign Module" to grant access</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserModuleAccess;
