
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, Edit, Trash, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const UserPermissionsDialog: React.FC<UserPermissionsDialogProps> = ({ 
  open, 
  onOpenChange, 
  userId, 
  userName 
}) => {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState({
    users: {
      read: true,
      write: false,
      delete: false,
      manage_roles: false
    },
    facilities: {
      read: true,
      write: false,
      delete: false,
      manage_access: false
    },
    modules: {
      read: true,
      write: false,
      delete: false,
      assign: false
    },
    api_services: {
      read: true,
      write: false,
      publish: false,
      manage_keys: false
    },
    admin: {
      system_settings: false,
      user_management: false,
      audit_logs: true,
      security_settings: false
    }
  });

  const handlePermissionChange = (category: string, permission: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [permission]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Implement actual permission saving logic
      console.log('Saving permissions for user:', userId, permissions);
      
      toast({
        title: "Permissions Updated",
        description: `Permissions have been updated for ${userName}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Permissions - {userName}
          </DialogTitle>
          <DialogDescription>
            Configure detailed permissions for this user across all modules
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Management Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>View Users</Label>
                <Switch
                  checked={permissions.users.read}
                  onCheckedChange={(value) => handlePermissionChange('users', 'read', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Create/Edit Users</Label>
                <Switch
                  checked={permissions.users.write}
                  onCheckedChange={(value) => handlePermissionChange('users', 'write', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Delete Users</Label>
                <Switch
                  checked={permissions.users.delete}
                  onCheckedChange={(value) => handlePermissionChange('users', 'delete', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Manage User Roles</Label>
                <Switch
                  checked={permissions.users.manage_roles}
                  onCheckedChange={(value) => handlePermissionChange('users', 'manage_roles', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Facilities Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Facilities Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>View Facilities</Label>
                <Switch
                  checked={permissions.facilities.read}
                  onCheckedChange={(value) => handlePermissionChange('facilities', 'read', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Create/Edit Facilities</Label>
                <Switch
                  checked={permissions.facilities.write}
                  onCheckedChange={(value) => handlePermissionChange('facilities', 'write', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Delete Facilities</Label>
                <Switch
                  checked={permissions.facilities.delete}
                  onCheckedChange={(value) => handlePermissionChange('facilities', 'delete', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Manage Access</Label>
                <Switch
                  checked={permissions.facilities.manage_access}
                  onCheckedChange={(value) => handlePermissionChange('facilities', 'manage_access', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Modules Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Module Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>View Modules</Label>
                <Switch
                  checked={permissions.modules.read}
                  onCheckedChange={(value) => handlePermissionChange('modules', 'read', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Create/Edit Modules</Label>
                <Switch
                  checked={permissions.modules.write}
                  onCheckedChange={(value) => handlePermissionChange('modules', 'write', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Delete Modules</Label>
                <Switch
                  checked={permissions.modules.delete}
                  onCheckedChange={(value) => handlePermissionChange('modules', 'delete', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Assign Modules</Label>
                <Switch
                  checked={permissions.modules.assign}
                  onCheckedChange={(value) => handlePermissionChange('modules', 'assign', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* API Services Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="h-4 w-4" />
                API Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>View APIs</Label>
                <Switch
                  checked={permissions.api_services.read}
                  onCheckedChange={(value) => handlePermissionChange('api_services', 'read', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Create/Edit APIs</Label>
                <Switch
                  checked={permissions.api_services.write}
                  onCheckedChange={(value) => handlePermissionChange('api_services', 'write', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Publish APIs</Label>
                <Switch
                  checked={permissions.api_services.publish}
                  onCheckedChange={(value) => handlePermissionChange('api_services', 'publish', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Manage API Keys</Label>
                <Switch
                  checked={permissions.api_services.manage_keys}
                  onCheckedChange={(value) => handlePermissionChange('api_services', 'manage_keys', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Admin Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                System Administration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>System Settings</Label>
                <Switch
                  checked={permissions.admin.system_settings}
                  onCheckedChange={(value) => handlePermissionChange('admin', 'system_settings', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>User Management</Label>
                <Switch
                  checked={permissions.admin.user_management}
                  onCheckedChange={(value) => handlePermissionChange('admin', 'user_management', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>View Audit Logs</Label>
                <Switch
                  checked={permissions.admin.audit_logs}
                  onCheckedChange={(value) => handlePermissionChange('admin', 'audit_logs', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Security Settings</Label>
                <Switch
                  checked={permissions.admin.security_settings}
                  onCheckedChange={(value) => handlePermissionChange('admin', 'security_settings', value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Permissions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserPermissionsDialog;
