
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface RemoveRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

const RemoveRoleDialog: React.FC<RemoveRoleDialogProps> = ({
  open,
  onOpenChange,
  userId
}) => {
  const { users, removeRole, isRemovingRole } = useUnifiedUserManagement();
  const [selectedRole, setSelectedRole] = React.useState<string>('');

  const user = users.find(u => u.id === userId);
  const userRoles = user?.user_roles || [];

  const handleRemove = async () => {
    if (!userId || !selectedRole) return;

    try {
      await removeRole({ userId, roleName: selectedRole as UserRole });
      setSelectedRole('');
      onOpenChange(false);
    } catch (error) {
      console.error('Role removal error:', error);
    }
  };

  const handleClose = () => {
    setSelectedRole('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Remove Role
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {userRoles.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              This user has no roles assigned.
            </div>
          ) : (
            <>
              <div>
                <Label>Current Roles</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userRoles.map((userRole, index) => (
                    <Badge key={index} variant="outline">
                      {userRole.roles.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="role">Select Role to Remove</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role to remove" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((userRole, index) => (
                      <SelectItem key={index} value={userRole.roles.name}>
                        {userRole.roles.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  <strong>Warning:</strong> Removing a role will revoke all permissions associated with that role.
                </p>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {userRoles.length > 0 && (
              <Button 
                variant="destructive"
                onClick={handleRemove} 
                disabled={!selectedRole || isRemovingRole}
              >
                {isRemovingRole ? 'Removing...' : 'Remove Role'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveRoleDialog;
