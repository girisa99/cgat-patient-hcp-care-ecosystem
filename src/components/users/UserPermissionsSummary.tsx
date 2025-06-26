
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shield, User, Clock } from 'lucide-react';

interface EffectivePermission {
  permission_name: string;
  source: string;
  expires_at: string | null;
}

interface UserPermissionsSummaryProps {
  userId: string;
  userName: string;
}

const UserPermissionsSummary: React.FC<UserPermissionsSummaryProps> = ({
  userId,
  userName
}) => {
  const { data: effectivePermissions, isLoading } = useQuery({
    queryKey: ['effective-permissions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_user_effective_permissions', { check_user_id: userId });
      
      if (error) throw error;
      return data as EffectivePermission[];
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const directPermissions = effectivePermissions?.filter(p => p.source === 'direct') || [];
  const rolePermissions = effectivePermissions?.filter(p => p.source !== 'direct') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {userName}'s Permissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4" />
            <span className="font-medium">Direct Permissions ({directPermissions.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {directPermissions.map((perm, index) => (
              <Badge key={index} variant="default" className="text-xs">
                {perm.permission_name}
                {perm.expires_at && (
                  <Clock className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
            {directPermissions.length === 0 && (
              <span className="text-sm text-gray-500">No direct permissions</span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Role-based Permissions ({rolePermissions.length})</span>
          </div>
          <div className="space-y-2">
            {Array.from(new Set(rolePermissions.map(p => p.source))).map(role => (
              <div key={role}>
                <div className="text-sm font-medium text-gray-700 mb-1">From {role}:</div>
                <div className="flex flex-wrap gap-1 ml-4">
                  {rolePermissions
                    .filter(p => p.source === role)
                    .map((perm, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {perm.permission_name}
                      </Badge>
                    ))}
                </div>
              </div>
            ))}
            {rolePermissions.length === 0 && (
              <span className="text-sm text-gray-500">No role-based permissions</span>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Total: {effectivePermissions?.length || 0} effective permissions
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPermissionsSummary;
