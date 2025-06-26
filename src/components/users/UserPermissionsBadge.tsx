
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Loader2 } from 'lucide-react';

interface UserPermissionsBadgeProps {
  userId: string;
}

const UserPermissionsBadge: React.FC<UserPermissionsBadgeProps> = ({ userId }) => {
  const { data: effectivePermissions, isLoading } = useQuery({
    queryKey: ['effective-permissions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_user_effective_permissions', { check_user_id: userId });
      
      if (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }
      return data as Array<{ permission_name: string; source: string; expires_at: string | null }>;
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  const directPermissions = effectivePermissions?.filter(p => p.source === 'direct') || [];
  const rolePermissions = effectivePermissions?.filter(p => p.source !== 'direct') || [];

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <div className="flex items-center gap-1">
        <Shield className="h-3 w-3 text-blue-600" />
        <span className="text-xs text-gray-600">
          {effectivePermissions?.length || 0} permissions
        </span>
      </div>
      {directPermissions.length > 0 && (
        <Badge variant="default" className="text-xs">
          {directPermissions.length} direct
        </Badge>
      )}
      {rolePermissions.length > 0 && (
        <Badge variant="secondary" className="text-xs">
          {rolePermissions.length} from roles
        </Badge>
      )}
    </div>
  );
};

export default UserPermissionsBadge;
