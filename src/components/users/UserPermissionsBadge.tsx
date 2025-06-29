
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Key, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserPermissionsBadgeProps {
  userId: string;
  compact?: boolean;
}

interface UserEffectivePermission {
  permission_name: string;
  source: string;
  expires_at: string | null;
}

const UserPermissionsBadge: React.FC<UserPermissionsBadgeProps> = ({ 
  userId, 
  compact = false 
}) => {
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['user-effective-permissions', userId],
    queryFn: async (): Promise<UserEffectivePermission[]> => {
      console.log('🔍 Fetching effective permissions for user:', userId);
      
      const { data, error } = await supabase
        .rpc('get_user_effective_permissions', { check_user_id: userId });

      if (error) {
        console.error('❌ Error fetching user permissions:', error);
        throw error;
      }

      console.log('✅ User permissions fetched:', data?.length || 0, 'permissions for user:', userId);
      
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
        <span className="text-xs text-gray-500">Loading permissions...</span>
      </div>
    );
  }

  const userPermissions = permissions || [];

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Key className="h-3 w-3 text-green-600" />
        <Badge variant="outline" className="text-xs">
          {userPermissions.length} permissions
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Key className="h-3 w-3 text-green-600" />
      <div className="flex flex-wrap gap-1">
        {userPermissions.length > 0 ? (
          <>
            <Badge variant="secondary" className="text-xs">
              {userPermissions.length} permissions
            </Badge>
          </>
        ) : (
          <Badge variant="outline" className="text-xs text-gray-400">
            No Permissions
          </Badge>
        )}
      </div>
    </div>
  );
};

export default UserPermissionsBadge;
