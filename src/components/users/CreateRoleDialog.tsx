import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useMasterRoleManagement } from '@/hooks/useMasterRoleManagement';

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRole: (roleName: string, description: string, isDefault: boolean) => void;
}

export const CreateRoleDialog: React.FC<CreateRoleDialogProps> = ({
  open,
  onOpenChange,
  onCreateRole
}) => {
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  
  const { roles } = useMasterRoleManagement();

  const handleCreateRole = () => {
    if (roleName.trim()) {
      onCreateRole(roleName.trim(), description.trim(), isDefault);
      // Reset form
      setRoleName('');
      setDescription('');
      setIsDefault(false);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setRoleName('');
    setDescription('');
    setIsDefault(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name *</Label>
            <Input
              id="role-name"
              placeholder="Enter role name (e.g., systemAdmin, clinician)"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Use camelCase for role names (e.g., systemAdmin, dataAnalyst)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">Description</Label>
            <textarea
              id="role-description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe the role's responsibilities and permissions"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is-default"
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
            <Label htmlFor="is-default">Set as default role for new users</Label>
          </div>

          <div className="space-y-2">
            <Label>Existing Roles</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
              {roles.map((role: any) => (
                <Badge key={role.id} variant="outline" className="text-xs">
                  {role.name}
                  {role.description && (
                    <span className="ml-1 text-muted-foreground">- {role.description}</span>
                  )}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Total existing roles: {roles.length}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button 
            onClick={handleCreateRole} 
            disabled={!roleName.trim()}
          >
            Create Role
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};