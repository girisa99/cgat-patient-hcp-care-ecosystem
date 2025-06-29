
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserModuleAccessIndicatorProps {
  userId: string;
  compact?: boolean;
}

interface UserEffectiveModule {
  module_id: string;
  module_name: string;
  module_description: string;
  access_source: string;
  expires_at: string | null;
}

const UserModuleAccessIndicator: React.FC<UserModuleAccessIndicatorProps> = ({ 
  userId, 
  compact = false 
}) => {
  const { data: userModules, isLoading, error } = useQuery({
    queryKey: ['user-effective-modules', userId],
    queryFn: async (): Promise<UserEffectiveModule[]> => {
      console.log('🔍 Fetching effective modules for user:', userId);
      
      // First try the RPC function
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_effective_modules', { check_user_id: userId });

      if (rpcError) {
        console.warn('⚠️ RPC function failed, trying direct query for indicator:', rpcError);
        
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
          console.error('❌ Direct query failed for indicator:', directError);
          return []; // Return empty array instead of throwing
        }

        // Transform direct query results
        const transformedData = directData?.map(assignment => ({
          module_id: assignment.module_id,
          module_name: assignment.modules?.name || 'Unknown Module',
          module_description: assignment.modules?.description || '',
          access_source: 'direct',
          expires_at: null
        })) || [];

        console.log('✅ Direct query succeeded for indicator:', transformedData.length, 'modules');
        return transformedData;
      }

      console.log('✅ User modules fetched:', rpcData?.length || 0, 'modules for user:', userId);
      return rpcData || [];
    },
    enabled: !!userId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3 text-red-400" />
        <Badge variant="outline" className="text-xs text-red-600 border-red-300">
          Error loading modules
        </Badge>
      </div>
    );
  }

  const modules = userModules || [];

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Shield className="h-3 w-3 text-blue-600" />
        <Badge variant="outline" className="text-xs">
          {modules.length} modules
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
        {modules.length > 0 ? (
          modules.map((module) => (
            <Badge 
              key={module.module_id} 
              variant="outline" 
              className="text-xs"
              title={`${module.module_name} - Access via ${module.access_source}`}
            >
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
