
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Clock, User, Shield } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface UserPermission {
  id: string;
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

interface PermissionManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const PermissionManagementDialog: React.FC<PermissionManagementDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Fetch all available permissions
  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Permission[];
    },
    enabled: open
  });

  // Fetch user's direct permissions
  const { data: userPermissions, isLoading: userPermissionsLoading } = useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_permissions')
        .select(`
          *,
          permissions (
            id,
            name,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as UserPermission[];
    },
    enabled: open && !!userId
  });

  // Fetch user's effective permissions
  const { data: effectivePermissions, isLoading: effectiveLoading } = useQuery({
    queryKey: ['effective-permissions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .rpc('get_user_effective_permissions', { check_user_id: userId });
      
      if (error) throw error;
      return data as EffectivePermission[];
    },
    enabled: open && !!userId
  });

  // Grant permission mutation
  const grantPermissionMutation = useMutation({
    mutationFn: async ({ permissionId }: { permissionId: string }) => {
      const { error } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          permission_id: permissionId,
          granted_by: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', userId] });
      queryClient.invalidateQueries({ queryKey: ['effective-permissions', userId] });
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

  // Revoke permission mutation
  const revokePermissionMutation = useMutation({
    mutationFn: async ({ permissionId }: { permissionId: string }) => {
      const { error } = await supabase
        .from('user_permissions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('permission_id', permissionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions', userId] });
      queryClient.invalidateQueries({ queryKey: ['effective-permissions', userId] });
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

  const handleGrantPermissions = () => {
    selectedPermissions.forEach(permissionId => {
      grantPermissionMutation.mutate({ permissionId });
    });
    setSelectedPermissions([]);
  };

  const handleRevokePermission = (permissionId: string) => {
    revokePermissionMutation.mutate({ permissionId });
  };

  const hasDirectPermission = (permissionId: string) => {
    return userPermissions?.some(up => up.permission_id === permissionId) || false;
  };

  const isPermissionFromRole = (permissionName: string) => {
    return effectivePermissions?.some(ep => 
      ep.permission_name === permissionName && ep.source !== 'direct'
    ) || false;
  };

  if (permissionsLoading || userPermissionsLoading || effectiveLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Permission Management - {userName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="effective" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="effective">Effective Permissions</TabsTrigger>
            <TabsTrigger value="direct">Direct Permissions</TabsTrigger>
            <TabsTrigger value="grant">Grant Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="effective">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  All Effective Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {effectivePermissions?.map((perm, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{perm.permission_name}</div>
                        <div className="text-sm text-gray-500">
                          Source: {perm.source === 'direct' ? 'Direct Grant' : `Role: ${perm.source}`}
                        </div>
                        {perm.expires_at && (
                          <div className="text-sm text-orange-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires: {new Date(perm.expires_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <Badge variant={perm.source === 'direct' ? 'default' : 'secondary'}>
                        {perm.source === 'direct' ? 'Direct' : 'Role'}
                      </Badge>
                    </div>
                  ))}
                  {(!effectivePermissions || effectivePermissions.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      No permissions found for this user
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="direct">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Direct Permission Grants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {userPermissions?.map((userPerm) => (
                    <div key={userPerm.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{userPerm.permissions.name}</div>
                        <div className="text-sm text-gray-500">{userPerm.permissions.description}</div>
                        {userPerm.expires_at && (
                          <div className="text-sm text-orange-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires: {new Date(userPerm.expires_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokePermission(userPerm.permission_id)}
                        disabled={revokePermissionMutation.isPending}
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                  {(!userPermissions || userPermissions.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      No direct permissions granted to this user
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grant">
            <Card>
              <CardHeader>
                <CardTitle>Grant New Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {permissions?.map((permission) => {
                      const hasPermission = hasDirectPermission(permission.id);
                      const fromRole = isPermissionFromRole(permission.name);
                      
                      return (
                        <div key={permission.id} className="flex items-start space-x-3 p-2 border rounded">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPermissions([...selectedPermissions, permission.id]);
                              } else {
                                setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id));
                              }
                            }}
                            disabled={hasPermission}
                          />
                          <div className="flex-1">
                            <Label 
                              htmlFor={permission.id} 
                              className={`font-medium ${hasPermission ? 'text-gray-500' : ''}`}
                            >
                              {permission.name}
                            </Label>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                            <div className="flex gap-1 mt-1">
                              {hasPermission && (
                                <Badge variant="default" className="text-xs">Already Granted</Badge>
                              )}
                              {fromRole && (
                                <Badge variant="secondary" className="text-xs">From Role</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedPermissions.length > 0 && (
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedPermissions([])}
                      >
                        Clear Selection
                      </Button>
                      <Button
                        onClick={handleGrantPermissions}
                        disabled={grantPermissionMutation.isPending}
                      >
                        {grantPermissionMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Granting...
                          </>
                        ) : (
                          `Grant ${selectedPermissions.length} Permission${selectedPermissions.length > 1 ? 's' : ''}`
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionManagementDialog;
