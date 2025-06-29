
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Loader2 } from 'lucide-react';
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
  const { data: userModules, isLoading } = useQuery({
    queryKey: ['user-effective-modules', userId],
    queryFn: async (): Promise<UserEffectiveModule[]> => {
      console.log('🔍 Fetching effective modules for user:', userId);
      
      const { data, error } = await supabase
        .rpc('get_user_effective_modules', { check_user_id: userId });

      if (error) {
        console.error('❌ Error fetching user modules:', error);
        throw error;
      }

      console.log('✅ User modules fetched:', data?.length || 0, 'modules for user:', userId);
      console.log('📋 Modules:', data?.map(m => m.module_name));
      
      return data || [];
    },
    enabled: !!userId,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        <span className="text-xs text-gray-500">Loading...</span>
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
