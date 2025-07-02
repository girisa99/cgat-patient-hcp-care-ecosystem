
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

interface PermissionValidationResult {
  hasPermission: boolean;
  source: string;
  expiresAt: string | null;
  validationTimestamp: string;
}

/**
 * Enhanced permissions hook with comprehensive validation and security checks
 */
export const usePermissions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [permissionCache, setPermissionCache] = useState<Map<string, PermissionValidationResult>>(new Map());

  // Enhanced permission check with caching and validation
  const useHasPermission = (permissionName: string, facilityId?: string) => {
    return useQuery({
      queryKey: ['user-has-permission', permissionName, facilityId],
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('🔒 No authenticated user for permission check');
          return false;
        }

        // Check cache first
        const cacheKey = `${permissionName}-${facilityId || 'global'}`;
        const cached = permissionCache.get(cacheKey);
        if (cached && (Date.now() - new Date(cached.validationTimestamp).getTime()) < 60000) {
          console.log('📋 Using cached permission result:', cacheKey);
          return cached.hasPermission;
        }

        console.log('🔍 Validating permission:', permissionName, 'for facility:', facilityId);

        const { data, error } = await supabase
          .rpc('user_has_permission', {
            check_user_id: user.id,
            permission_name: permissionName,
            facility_id: facilityId || null
          });

        if (error) {
          console.error('❌ Permission check error:', error);
          return false;
        }

        // Cache the result
        const result: PermissionValidationResult = {
          hasPermission: data || false,
          source: 'database',
          expiresAt: null,
          validationTimestamp: new Date().toISOString()
        };
        
        setPermissionCache(prev => new Map(prev.set(cacheKey, result)));

        console.log('✅ Permission validation complete:', permissionName, '=', data);
        return data || false;
      },
      staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    });
  };

  // Enhanced effective permissions with detailed source tracking
  const useUserEffectivePermissions = (userId: string) => {
    return useQuery({
      queryKey: ['effective-permissions', userId],
      queryFn: async () => {
        console.log('🔍 Fetching effective permissions for user:', userId);
        
        const { data, error } = await supabase
          .rpc('get_user_effective_permissions', { check_user_id: userId });
        
        if (error) {
          console.error('❌ Error fetching effective permissions:', error);
          throw error;
        }

        const permissions = (data as EffectivePermission[]) || [];
        console.log('✅ Effective permissions loaded:', permissions.length);
        
        return permissions;
      },
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
  };

  // Enhanced permission validation for multiple permissions
  const validateMultiplePermissions = async (permissions: string[], facilityId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    console.log('🔍 Validating multiple permissions:', permissions);

    const results: Record<string, boolean> = {};
    
    for (const permission of permissions) {
      try {
        const { data } = await supabase
          .rpc('user_has_permission', {
            check_user_id: user.id,
            permission_name: permission,
            facility_id: facilityId || null
          });
        
        results[permission] = data || false;
      } catch (error) {
        console.error(`❌ Error checking permission ${permission}:`, error);
        results[permission] = false;
      }
    }

    console.log('✅ Multiple permissions validated:', results);
    return results;
  };

  // Clear permission cache
  const clearPermissionCache = () => {
    console.log('🧹 Clearing permission cache');
    setPermissionCache(new Map());
    queryClient.invalidateQueries({ queryKey: ['user-has-permission'] });
    queryClient.invalidateQueries({ queryKey: ['effective-permissions'] });
  };

  // Grant permission mutation with enhanced validation
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
      console.log('🔐 Granting permission:', { userId, permissionId, expiresAt });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          permission_id: permissionId,
          granted_by: user?.id,
          expires_at: expiresAt
        });
      
      if (error) {
        console.error('❌ Permission grant failed:', error);
        throw error;
      }

      console.log('✅ Permission granted successfully');
    },
    onSuccess: (_, variables) => {
      clearPermissionCache();
      queryClient.invalidateQueries({ queryKey: ['user-permissions', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['effective-permissions', variables.userId] });
      toast({
        title: "Permission Granted",
        description: "Permission has been granted successfully with enhanced validation.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Grant permission error:', error);
      toast({
        title: "Permission Grant Failed",
        description: error.message || "Failed to grant permission",
        variant: "destructive",
      });
    }
  });

  // Revoke permission mutation with enhanced validation
  const revokePermissionMutation = useMutation({
    mutationFn: async ({ userId, permissionId }: { userId: string; permissionId: string }) => {
      console.log('🔒 Revoking permission:', { userId, permissionId });
      
      const { error } = await supabase
        .from('user_permissions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('permission_id', permissionId);
      
      if (error) {
        console.error('❌ Permission revoke failed:', error);
        throw error;
      }

      console.log('✅ Permission revoked successfully');
    },
    onSuccess: (_, variables) => {
      clearPermissionCache();
      queryClient.invalidateQueries({ queryKey: ['user-permissions', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['effective-permissions', variables.userId] });
      toast({
        title: "Permission Revoked",
        description: "Permission has been revoked successfully with cache invalidation.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Revoke permission error:', error);
      toast({
        title: "Permission Revoke Failed",
        description: error.message || "Failed to revoke permission",
        variant: "destructive",
      });
    }
  });

  return {
    useHasPermission,
    useUserEffectivePermissions,
    validateMultiplePermissions,
    clearPermissionCache,
    
    // Actions
    grantPermission: grantPermissionMutation.mutate,
    revokePermission: revokePermissionMutation.mutate,
    
    // Status flags
    isGranting: grantPermissionMutation.isPending,
    isRevoking: revokePermissionMutation.isPending,
    
    // Cache info
    cacheSize: permissionCache.size,
    hasCachedPermissions: permissionCache.size > 0
  };
};
