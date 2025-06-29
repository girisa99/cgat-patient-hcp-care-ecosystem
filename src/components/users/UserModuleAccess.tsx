
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Users, Loader2, AlertCircle } from 'lucide-react';
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
  const { data: userModules, isLoading, error } = useQuery({
    queryKey: ['user-detailed-modules', userId],
    queryFn: async (): Promise<UserEffectiveModule[]> => {
      console.log('🔍 Fetching detailed modules for user:', userId, userName);
      
      // First try the RPC function
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_effective_modules', { check_user_id: userId });

      if (rpcError) {
        console.warn('⚠️ RPC function failed, trying direct query:', rpcError);
        
        // Fallback to direct query
        const { data: directData, error: directError } = await supabase
          .from('user_module_assignments')
          .select(`
            module_id,
            modules!inner(
              id,
              name,
              description
            )
          `)
          .eq('user_id', userId)
          .eq('is_active', true);

        if (directError) {
          console.error('❌ Direct query also failed:', directError);
          throw directError;
        }

        // Transform direct query results to match expected format
        const transformedData = directData?.map(assignment => ({
          module_id: assignment.module_id,
          module_name: assignment.modules?.name || 'Unknown Module',
          module_description: assignment.modules?.description || '',
          access_source: 'direct',
          expires_at: null
        })) || [];

        console.log('✅ Direct query succeeded:', transformedData.length, 'modules for', userName);
        return transformedData;
      }

      console.log('✅ RPC function succeeded:', rpcData?.length || 0, 'modules for', userName);
      return rpcData || [];
    },
    enabled: !!userId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1
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

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            Module Access for {userName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="text-sm">Failed to load module information</span>
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
          <div className="space-y-3">
            {modules.map((module) => (
              <div key={module.module_id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
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
