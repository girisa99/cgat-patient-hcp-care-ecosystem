
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key, Shield, Users } from 'lucide-react';

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
  const [permissions, setPermissions] = useState({
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewFacilities: false,
    canEditFacilities: false,
    canViewModules: false,
    canEditModules: false,
    canViewReports: false,
    canEditReports: false
  });

  const handlePermissionChange = (permission: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving permissions for user:', userId, permissions);
    // TODO: Implement permission saving logic
    onOpenChange(false);
  };

  const permissionGroups = [
    {
      title: 'User Management',
      icon: <Users className="h-4 w-4" />,
      permissions: [
        { key: 'canViewUsers', label: 'View Users', description: 'Can view user list and details' },
        { key: 'canEditUsers', label: 'Edit Users', description: 'Can create and modify users' },
        { key: 'canDeleteUsers', label: 'Delete Users', description: 'Can remove users from system' }
      ]
    },
    {
      title: 'Facility Management',
      icon: <Shield className="h-4 w-4" />,
      permissions: [
        { key: 'canViewFacilities', label: 'View Facilities', description: 'Can view facility information' },
        { key: 'canEditFacilities', label: 'Edit Facilities', description: 'Can create and modify facilities' }
      ]
    },
    {
      title: 'Module Access',
      icon: <Key className="h-4 w-4" />,
      permissions: [
        { key: 'canViewModules', label: 'View Modules', description: 'Can access and view modules' },
        { key: 'canEditModules', label: 'Edit Modules', description: 'Can configure modules' }
      ]
    },
    {
      title: 'Reporting',
      icon: <Key className="h-4 w-4" />,
      permissions: [
        { key: 'canViewReports', label: 'View Reports', description: 'Can access reports and analytics' },
        { key: 'canEditReports', label: 'Edit Reports', description: 'Can create and modify reports' }
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Manage Permissions for {userName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Configure granular permissions for this user across different system areas
            </span>
          </div>

          {permissionGroups.map((group, groupIndex) => (
            <Card key={groupIndex}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  {group.icon}
                  {group.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.permissions.map((permission) => (
                  <div key={permission.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={permission.key} className="font-medium">
                          {permission.label}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {permissions[permission.key as keyof typeof permissions] ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {permission.description}
                      </p>
                    </div>
                    <Switch
                      id={permission.key}
                      checked={permissions[permission.key as keyof typeof permissions]}
                      onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Permissions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionManagementDialog;
