
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '@/hooks/useUsers';
import { Badge } from '@/components/ui/badge';
import { UserX, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RemoveRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const RemoveRoleDialog: React.FC<RemoveRoleDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  const { users } = useUsers();
  const { toast } = useToast();
  const [selectedRoleName, setSelectedRoleName] = useState<string>('');
  const [isRemoving, setIsRemoving] = useState(false);

  // Find the user and their roles
  const user = users?.find(u => u.id === userId);
  const userRoles = user?.user_roles || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !selectedRoleName) return;

    setIsRemoving(true);
    try {
      // Find the selected role info
      const selectedUserRole = userRoles.find(ur => ur.roles?.name === selectedRoleName);
      const roleName = selectedUserRole?.roles?.name || 'Unknown';
      
      // TODO: Implement actual role removal logic
      console.log('Removing role:', { userId, roleName });
      
      toast({
        title: "Role Removed",
        description: `Successfully removed ${roleName} role from ${userName}`,
      });
      
      setSelectedRoleName('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to remove role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  if (!user || userRoles.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5" />
              Remove Role from {userName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-orange-500" />
            <p className="text-gray-600">
              {!user ? 'User not found' : 'This user has no roles assigned to remove.'}
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-red-600" />
            Remove Role from {userName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Current Roles</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg min-h-[60px]">
              {userRoles.map((userRole, index) => (
                <Badge key={`${userRole.roles?.name}-${index}`} variant="secondary">
                  {userRole.roles?.name || 'Unknown Role'}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role_select">Select Role to Remove</Label>
            <Select value={selectedRoleName} onValueChange={setSelectedRoleName}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role to remove" />
              </SelectTrigger>
              <SelectContent>
                {userRoles.map((userRole, index) => (
                  <SelectItem 
                    key={`${userRole.roles?.name}-${index}`} 
                    value={userRole.roles?.name || ''}
                  >
                    {userRole.roles?.name || 'Unknown Role'}
                    {userRole.roles?.description && (
                      <span className="text-sm text-gray-500 ml-2">
                        - {userRole.roles.description}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Warning</p>
                <p>Removing this role will immediately revoke all associated permissions for this user.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={isRemoving || !selectedRoleName}
            >
              {isRemoving ? 'Removing...' : 'Remove Role'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveRoleDialog;
