
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  expires_at: string | null;
  is_active: boolean;
  permissions: Permission;
}

interface EffectivePermission {
  permission_name: string;
  source: string;
  expires_at: string | null;
}

export const usePermissions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if current user has a specific permission
  const useHasPermission = (permissionName: string, facilityId?: string) => {
    return useQuery({
      queryKey: ['user-has-permission', permissionName, facilityId],
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
          .rpc('user_has_permission', {
            check_user_id: user.id,
            permission_name: permissionName,
            facility_id: facilityId || null
          });

        if (error) {
          console.error('Permission check error:', error);
          return false;
        }

        return data || false;
      },
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
  };

  // Get user's effective permissions
  const useUserEffectivePermissions = (userId: string) => {
    return useQuery({
      queryKey: ['effective-permissions', userId],
      queryFn: async () => {
        const { data, error } = await supabase
          .rpc('get_user_effective_permissions', { check_user_id: userId });
        
        if (error) throw error;
        return data as EffectivePermission[];
      },
      enabled: !!userId
    });
  };

  // Grant permission to user
  const grantPermissionMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      permissionId, 
      expiresAt 
    }: { 
      userId: string; 
      permissionId: string; 
      expiresAt?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          permission_id: permissionId,
          granted_by: user?.id,
          expires_at: expiresAt
        });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['effective-permissions', variables.userId] });
      toast({
        title: "Permission Granted",
        description: "Permission has been granted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to grant permission",
        variant: "destructive",
      });
    }
  });

  // Revoke permission from user
  const revokePermissionMutation = useMutation({
    mutationFn: async ({ userId, permissionId }: { userId: string; permissionId: string }) => {
      const { error } = await supabase
        .from('user_permissions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('permission_id', permissionId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['effective-permissions', variables.userId] });
      toast({
        title: "Permission Revoked",
        description: "Permission has been revoked successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke permission",
        variant: "destructive",
      });
    }
  });

  return {
    useHasPermission,
    useUserEffectivePermissions,
    grantPermission: grantPermissionMutation.mutate,
    revokePermission: revokePermissionMutation.mutate,
    isGranting: grantPermissionMutation.isPending,
    isRevoking: revokePermissionMutation.isPending
  };
};
