
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Users, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserModuleAccessProps {
  userId: string;
  userName: string;
}

interface UserEffectiveModule {
  module_id: string;
  module_name: string;
  module_description: string;
  access_source: string;
  expires_at: string | null;
}

const UserModuleAccess: React.FC<UserModuleAccessProps> = ({ userId, userName }) => {
  const { data: userModules, isLoading } = useQuery({
    queryKey: ['user-detailed-modules', userId],
    queryFn: async (): Promise<UserEffectiveModule[]> => {
      console.log('🔍 Fetching detailed modules for user:', userId, userName);
      
      const { data, error } = await supabase
        .rpc('get_user_effective_modules', { check_user_id: userId });

      if (error) {
        console.error('❌ Error fetching user modules:', error);
        throw error;
      }

      console.log('✅ Detailed user modules fetched:', data?.length || 0, 'modules for', userName);
      console.log('📋 Detailed modules:', data?.map(m => `${m.module_name} (${m.access_source})`));
      
      return data || [];
    },
    enabled: !!userId,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            Module Access for {userName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Loading modules...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const modules = userModules || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Module Access for {userName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {modules.length > 0 ? (
          <div className="space-y-2">
            {modules.map((module) => (
              <div key={module.module_id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="font-medium text-sm">{module.module_name}</span>
                    {module.module_description && (
                      <p className="text-xs text-gray-600 mt-1">{module.module_description}</p>
                    )}
                  </div>
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
          <div className="text-center py-6 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No module access assigned</p>
            <p className="text-xs text-gray-400 mt-1">Use "Assign Module" to grant access to specific modules</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserModuleAccess;
